const PaymentProvider = require('./base.provider');
const axios = require('axios');

class AsaasProvider extends PaymentProvider {
    constructor(config) {
        super(config);
        this.apiKey = config.apiKey;
        this.baseUrl = config.sandbox ? 'https://sandbox.asaas.com/api/v3' : 'https://www.asaas.com/api/v3';
    }

    async createTransparentCheckout(data) {
        // data: { amount, method: 'BOLETO' | 'PIX' | 'CREDIT_CARD', payer: { name, cpfCnpj }, ... }

        const billingType = data.method === 'boleto' ? 'BOLETO' :
            data.method === 'pix' ? 'PIX' : 'CREDIT_CARD';

        const payload = {
            customer: data.customerId, // Need to create customer first in Asaas usually, or pass ID
            billingType: billingType,
            value: data.amount,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days
            description: data.description,
            externalReference: data.externalReference
        };

        if (billingType === 'CREDIT_CARD') {
            payload.creditCard = {
                holderName: data.cardHolderName,
                number: data.cardNumber,
                expiryMonth: data.expiryMonth,
                expiryYear: data.expiryYear,
                ccv: data.ccv
            };
            payload.creditCardHolderInfo = data.payer; // { name, email, cpfCnpj, ... }
        }

        try {
            const response = await axios.post(`${this.baseUrl}/payments`, payload, {
                headers: { access_token: this.apiKey }
            });

            return {
                transactionId: response.data.id,
                status: response.data.status,
                invoiceUrl: response.data.invoiceUrl,
                bankSlipUrl: response.data.bankSlipUrl,
                pixQrCode: null, // Need separate call for Pix QR if not returned
                raw_response: response.data
            };
        } catch (error) {
            console.error('Asaas Error:', error.response ? error.response.data : error.message);
            throw new Error('Asaas payment failed');
        }
    }
}

module.exports = AsaasProvider;
