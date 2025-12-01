const axios = require('axios');

class BrechoProvider {
    constructor() {
        this.baseUrl = process.env.BRECHO_API_URL;
        this.apiKey = process.env.BRECHO_API_KEY;
        this.enabled = process.env.INTEGRATION_ENABLED === 'true';
    }

    async createProductInBrecho(productData) {
        if (!this.enabled) return null;

        try {
            // Map fields to Brechó expected format
            const payload = {
                descricao_curta: productData.name,
                descricao_detalhada: productData.description || productData.name,
                preco_venda: productData.price,
                sku_ecommerce: productData.sku,
                tipo_aquisicao: 'COMPRA',
                fornecedorId: null // Loja Própria
            };

            const response = await axios.post(`${this.baseUrl}/catalogo/pecas`, payload, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`, // Assuming Bearer or just key, user said "sua_chave_secreta_aqui" so maybe just a header? 
                    // The user prompt said "BRECHO_API_KEY=sua_chave_secreta_aqui". 
                    // Usually internal integration uses a specific header or Bearer. 
                    // I'll assume a custom header or Bearer. Let's stick to a simple header for now or Bearer if it's a standard JWT.
                    // But wait, Brechó API likely expects a JWT for 'Authorization'. 
                    // If this is a server-to-server key, Brechó needs to handle it.
                    // For now I will send it as 'x-api-key' or similar if I was designing it, 
                    // but since I am modifying Brechó too, I can decide.
                    // Let's use 'x-integration-secret' to avoid conflict with User JWT.
                    'x-integration-secret': this.apiKey
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error creating product in Brechó:', error.response?.data || error.message);
            // Don't throw, just return null to not break local flow, or throw if strict.
            // User said "Trate erros para não travar a venda, mas logue o erro de integração." for orders.
            // For product creation, maybe we want to know? 
            // "Receba o ID e o codigo_etiqueta retornados pelo Brechó."
            // If it fails, we won't have the ID.
            return null;
        }
    }

    async notifyOrder(orderData) {
        if (!this.enabled) return;

        try {
            const payload = {
                externalId: orderData.id,
                items: orderData.items.map(item => ({
                    sku: item.sku, // or brechoId if available
                    quantity: item.quantity,
                    price: item.price
                })),
                customer: {
                    name: orderData.user?.name,
                    email: orderData.user?.email
                }
            };

            await axios.post(`${this.baseUrl}/integracao/webhook/pedido`, payload, {
                headers: {
                    'x-integration-secret': this.apiKey
                }
            });
        } catch (error) {
            console.error('Error notifying order to Brechó:', error.response?.data || error.message);
        }
    }
}

module.exports = new BrechoProvider();
