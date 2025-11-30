class PaymentProvider {
    constructor(config = {}) {
        this.config = config;
    }

    async createTransparentCheckout(paymentData) {
        throw new Error('Method not implemented');
    }

    async createProCheckout(paymentData) {
        throw new Error('Method not implemented');
    }

    async refundPayment(transactionId) {
        throw new Error('Method not implemented');
    }

    async getPaymentStatus(transactionId) {
        throw new Error('Method not implemented');
    }
}

module.exports = PaymentProvider;
