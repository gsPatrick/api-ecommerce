const PaymentProvider = require('./base.provider');
const { MercadoPagoConfig, Payment, Preference } = require('mercadopago');

class MercadoPagoProvider extends PaymentProvider {
    constructor(config) {
        super(config);
        if (config.accessToken) {
            this.client = new MercadoPagoConfig({ accessToken: config.accessToken });
        }
    }

    async createTransparentCheckout(data) {
        // data: { method, amount, token, issuer_id, payment_method_id, payer: { email, ... } }
        const payment = new Payment(this.client);

        const body = {
            transaction_amount: parseFloat(data.amount),
            token: data.token,
            description: data.description,
            installments: parseInt(data.installments || 1),
            payment_method_id: data.payment_method_id, // 'visa', 'master', 'pix'
            issuer_id: data.issuer_id,
            payer: {
                email: data.email || 'test@test.com'
            }
        };

        try {
            const response = await payment.create({ body });
            // Response structure in v2 is different, usually response is the object directly or response.api_response
            // But typically response contains the payment object
            const { id, status, status_detail, point_of_interaction } = response;

            return {
                transactionId: id.toString(),
                status: status,
                status_detail: status_detail,
                qr_code: point_of_interaction?.transaction_data?.qr_code,
                qr_code_base64: point_of_interaction?.transaction_data?.qr_code_base64,
                raw_response: response
            };
        } catch (error) {
            console.error('MP Error:', error);
            throw new Error('Payment failed: ' + (error.message || 'Unknown error'));
        }
    }

    async createProCheckout(data) {
        // data: { items: [], payer: {}, external_reference }
        const preference = new Preference(this.client);

        const body = {
            items: data.items,
            payer: data.payer,
            external_reference: data.external_reference,
            back_urls: {
                success: 'http://localhost:3000/success', // Should be configurable
                failure: 'http://localhost:3000/failure',
                pending: 'http://localhost:3000/pending'
            },
            auto_return: 'approved'
        };

        try {
            const response = await preference.create({ body });
            return {
                preferenceId: response.id,
                init_point: response.init_point,
                sandbox_init_point: response.sandbox_init_point,
                status: 'pending',
                raw_response: response
            };
        } catch (error) {
            console.error('MP Preference Error:', error);
            throw new Error('Preference creation failed');
        }
    }
}

module.exports = MercadoPagoProvider;
