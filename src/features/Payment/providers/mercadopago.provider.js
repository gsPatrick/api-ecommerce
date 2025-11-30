const PaymentProvider = require('./base.provider');
const { MercadoPagoConfig, Payment, Preference } = require('mercadopago');

class MercadoPagoProvider extends PaymentProvider {
    constructor(config) {
        super(config);

        // Validate that accessToken exists
        if (!config || !config.accessToken) {
            throw new Error('MercadoPago accessToken is required but not configured');
        }

        // Initialize the client
        this.client = new MercadoPagoConfig({
            accessToken: config.accessToken,
            options: { timeout: 5000 }  // Optional: add timeout
        });
    }

    async createTransparentCheckout(data) {
        // Validate required fields
        if (!data.payment_method_id) {
            throw new Error('payment_method_id is required');
        }

        if (!data.token && data.payment_method_id !== 'pix') {
            throw new Error('token is required for card payments');
        }

        const payment = new Payment(this.client);

        const body = {
            transaction_amount: parseFloat(data.amount),
            description: data.description || 'Payment',
            installments: parseInt(data.installments || 1),
            payment_method_id: data.payment_method_id,
            payer: {
                email: data.email || 'test@test.com'
            }
        };

        // Add token for card payments
        if (data.token) {
            body.token = data.token;
        }

        // Add issuer_id for card payments
        if (data.issuer_id) {
            body.issuer_id = data.issuer_id;
        }

        try {
            const response = await payment.create({ body });

            return {
                transactionId: response.id?.toString(),
                status: response.status,
                status_detail: response.status_detail,
                qr_code: response.point_of_interaction?.transaction_data?.qr_code,
                qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
                ticket_url: response.transaction_details?.external_resource_url,
                raw_response: response
            };
        } catch (error) {
            console.error('MP Payment Error:', error.message);
            console.error('Error details:', error.cause || error);
            throw new Error(`Payment failed: ${error.message || 'Unknown error'}`);
        }
    }

    async createProCheckout(data) {
        const preference = new Preference(this.client);

        const body = {
            items: data.items,
            payer: data.payer,
            external_reference: data.external_reference,
            back_urls: {
                success: process.env.MP_SUCCESS_URL || 'http://localhost:3000/success',
                failure: process.env.MP_FAILURE_URL || 'http://localhost:3000/failure',
                pending: process.env.MP_PENDING_URL || 'http://localhost:3000/pending'
            },
            auto_return: 'approved',
            notification_url: process.env.MP_WEBHOOK_URL // Add webhook URL if configured
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
            console.error('MP Preference Error:', error.message);
            console.error('Error details:', error.cause || error);
            throw new Error(`Preference creation failed: ${error.message || 'Unknown error'}`);
        }
    }
}

module.exports = MercadoPagoProvider;