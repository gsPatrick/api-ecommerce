const PaymentProvider = require('./base.provider');
const stripe = require('stripe');

class StripeProvider extends PaymentProvider {
    constructor(config) {
        super(config);
        this.client = stripe(config.secretKey);
    }

    async createTransparentCheckout(data) {
        // Using PaymentIntents for custom UI
        // data: { amount, currency, payment_method_id, ... }
        try {
            const paymentIntent = await this.client.paymentIntents.create({
                amount: Math.round(data.amount * 100), // Cents
                currency: data.currency || 'brl',
                payment_method: data.payment_method_id,
                confirm: true,
                description: data.description,
                return_url: 'http://localhost:3000/return' // Should be configurable
            });

            return {
                transactionId: paymentIntent.id,
                status: paymentIntent.status === 'succeeded' ? 'approved' : 'pending',
                raw_response: paymentIntent
            };
        } catch (error) {
            console.error('Stripe Error:', error);
            throw new Error('Stripe payment failed: ' + error.message);
        }
    }

    async createProCheckout(data) {
        // Using Checkout Sessions for hosted UI
        // data: { items: [{ name, amount, quantity }], success_url, cancel_url }
        try {
            const line_items = data.items.map(item => ({
                price_data: {
                    currency: 'brl',
                    product_data: { name: item.title },
                    unit_amount: Math.round(item.unit_price * 100),
                },
                quantity: item.quantity,
            }));

            const session = await this.client.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items,
                mode: 'payment',
                success_url: 'http://localhost:3000/success',
                cancel_url: 'http://localhost:3000/cancel',
                client_reference_id: data.external_reference
            });

            return {
                preferenceId: session.id,
                init_point: session.url,
                sandbox_init_point: session.url,
                status: 'pending',
                raw_response: session
            };
        } catch (error) {
            console.error('Stripe Session Error:', error);
            throw new Error('Stripe session failed');
        }
    }
}

module.exports = StripeProvider;
