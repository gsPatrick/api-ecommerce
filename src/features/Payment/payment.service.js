const { Payment, Order, StoreConfig, User } = require('../../models');
const MercadoPagoProvider = require('./providers/mercadopago.provider');
const AsaasProvider = require('./providers/asaas.provider');
const StripeProvider = require('./providers/stripe.provider');

class PaymentService {
    async getProvider(name) {
        // Fetch config dynamically
        const config = await StoreConfig.findOne({
            where: { group: 'payment', key: name }
        });

        if (!config || !config.value) {
            throw new Error(`Payment provider ${name} not configured`);
        }

        const credentials = config.value;

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
        const {
            provider: providerName = 'mercadopago',
            method,
            type = 'checkout_transparent',
            amount,
            cardToken,
            installments = 1,
            issuer_id,
            email
        } = paymentData;

        // Validate required fields
        if (!method) {
            throw new Error('Payment method is required');
        }

        const order = await Order.findByPk(orderId, {
            include: [User] // Include user to get email
        });

        if (!order) {
            throw new Error('Order not found');
        }

        // Use order amount if not provided
        const paymentAmount = amount || order.total_amount;

        if (!paymentAmount || paymentAmount <= 0) {
            throw new Error('Invalid payment amount');
        }

        const provider = await this.getProvider(providerName);
        let result;

        if (type === 'checkout_pro') {
            // Checkout Pro - Redirect to Mercado Pago
            result = await provider.createProCheckout({
                items: [{
                    title: `Pedido #${order.id}`,
                    unit_price: parseFloat(paymentAmount),
                    quantity: 1
                }],
                payer: {
                    email: email || order.user?.email || 'test@test.com'
                },
                external_reference: order.id.toString()
            });
        } else {
            // Checkout Transparente
            const transparentData = {
                amount: parseFloat(paymentAmount),
                description: `Pedido #${order.id}`,
                email: email || order.user?.email || 'test@test.com',
                installments: parseInt(installments),
                payment_method_id: method, // 'pix', 'visa', 'master', etc
            };

            // For card payments, token and issuer_id are required
            if (method !== 'pix') {
                if (!cardToken) {
                    throw new Error('Card token is required for card payments');
                }
                transparentData.token = cardToken;

                if (issuer_id) {
                    transparentData.issuer_id = issuer_id;
                }
            }

            result = await provider.createTransparentCheckout(transparentData);
        }

        // Record Payment
        const payment = await Payment.create({
            orderId: order.id,
            transactionId: result.transactionId || result.preferenceId,
            provider: providerName,
            method: method,
            type: type,
            status: result.status || 'pending',
            amount: paymentAmount,
            installments: parseInt(installments),
            metadata: result,
            response_json: result.raw_response
        });

        // Update order status
        await order.update({
            status: result.status === 'approved' ? 'paid' : 'pending_payment'
        });

        return { payment, result };
    }

    async getPaymentStatus(paymentId) {
        const payment = await Payment.findByPk(paymentId);
        if (!payment) {
            throw new Error('Payment not found');
        }

        const provider = await this.getProvider(payment.provider);

        // Query payment status from provider
        // This would need to be implemented in each provider
        const status = await provider.getPaymentStatus(payment.transactionId);

        // Update local status
        await payment.update({ status: status.status });

        return { payment, status };
    }
}

module.exports = new PaymentService();