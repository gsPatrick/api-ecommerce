const { Payment, Order, StoreConfig } = require('../../models');
const MercadoPagoProvider = require('./providers/mercadopago.provider');
const AsaasProvider = require('./providers/asaas.provider');
const StripeProvider = require('./providers/stripe.provider');

class PaymentService {
    async getProvider(name) {
        // Fetch config dynamically
        const config = await StoreConfig.findOne({ where: { group: 'payment', key: name } });
        const credentials = config ? config.value : {};

        if (name === 'mercadopago') {
            return new MercadoPagoProvider(credentials);
        } else if (name === 'asaas') {
            return new AsaasProvider(credentials);
        } else if (name === 'stripe') {
            return new StripeProvider(credentials);
        }

        throw new Error(`Payment provider ${name} not supported`);
    }

    async processPayment(orderId, paymentData) {
        // paymentData: { provider, method, type, cardToken, installments, ... }
        const { provider: providerName = 'mercadopago', method, type, amount } = paymentData;

        const order = await Order.findByPk(orderId);
        if (!order) throw new Error('Order not found');

        const provider = await this.getProvider(providerName);
        let result;

        if (type === 'checkout_pro') {
            // For MP Pro, we generate a preference link
            result = await provider.createProCheckout({
                items: [{ title: `Order #${order.id} `, unit_price: parseFloat(amount), quantity: 1 }],
                payer: { email: 'test@test.com' }, // Should fetch user email
                external_reference: order.id.toString()
            });
        } else {
            // Transparent Checkout
            result = await provider.createTransparentCheckout({
                ...paymentData,
                amount: parseFloat(amount),
                description: `Order #${order.id} `,
                email: 'test@test.com' // Should fetch user email
            });
        }

        // Record Payment
        const payment = await Payment.create({
            orderId: order.id,
            transactionId: result.transactionId || result.preferenceId,
            provider: providerName,
            method: method || 'checkout_pro',
            type: type || 'checkout_transparent',
            status: result.status || 'pending',
            amount: amount,
            installments: paymentData.installments || 1,
            metadata: result,
            response_json: result.raw_response
        });

        return { payment, result };
    }
}

module.exports = new PaymentService();
