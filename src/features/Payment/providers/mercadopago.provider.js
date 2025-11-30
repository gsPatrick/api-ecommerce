const PaymentProvider = require('./base.provider');
const mercadopago = require('mercadopago');

class MercadoPagoProvider extends PaymentProvider {
    constructor(config) {
        super(config);
        if (config.accessToken) {
            mercadopago.configure({ access_token: config.accessToken });
        }
    }

    async createTransparentCheckout(data) {
        // data: { method, amount, token, issuer_id, payment_method_id, payer: { email, ... } }
        const payment_data = {
            transaction_amount: data.amount,
            token: data.token,
            description: data.description,
            installments: data.installments || 1,
            payment_method_id: data.payment_method_id, // 'visa', 'master', 'pix'
            issuer_id: data.issuer_id,
            payer: {
                email: data.email
            }
        };

        try {
            const response = await mercadopago.payment.create(payment_data);
            const { id, status, status_detail, point_of_interaction } = response.body;

            return {
                transactionId: id.toString(),
                status: status,
                status_detail: status_detail,
                qr_code: point_of_interaction?.transaction_data?.qr_code,
                qr_code_base64: point_of_interaction?.transaction_data?.qr_code_base64,
                raw_response: response.body
            };
        } catch (error) {
            console.error('MP Error:', error);
            throw new Error('Payment failed: ' + (error.message || 'Unknown error'));
        }
    }

    async createProCheckout(data) {
        // data: { items: [], payer: {}, external_reference }
        const preference = {
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
            const response = await mercadopago.preferences.create(preference);
            return {
                preferenceId: response.body.id,
                init_point: response.body.init_point,
                sandbox_init_point: response.body.sandbox_init_point,
                status: 'pending',
                raw_response: response.body
            };
        } catch (error) {
            console.error('MP Preference Error:', error);
            throw new Error('Preference creation failed');
        }
    }
}

module.exports = MercadoPagoProvider;
