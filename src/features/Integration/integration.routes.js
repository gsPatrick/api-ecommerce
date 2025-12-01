const express = require('express');
const router = express.Router();
const { Product } = require('../../models');

// Webhook to update stock from Brechó
router.post('/webhook/update-stock', async (req, res) => {
    try {
        const { sku, status, stock } = req.body;

        if (!sku) {
            return res.status(400).json({ error: 'SKU is required' });
        }

        const product = await Product.findOne({ where: { sku } });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const updates = {};

        // Update stock if provided
        if (stock !== undefined) {
            updates.stock = stock;
        }

        // Map Brechó status to E-commerce status/stock logic
        // If status is 'VENDIDA', 'DEVOLVIDA_FORNECEDOR', etc., set stock to 0
        const soldStatuses = ['VENDIDA', 'DEVOLVIDA_FORNECEDOR', 'BAIXADA'];
        if (soldStatuses.includes(status)) {
            updates.stock = 0;
            // Optionally update status to 'archived' or keep 'published' but out of stock
            // updates.status = 'archived'; 
        } else if (status === 'DISPONIVEL') {
            updates.stock = 1; // Assuming unique items
            updates.status = 'published';
        }

        await product.update(updates);

        console.log(`[Integration] Updated product ${sku}: stock=${updates.stock}, status=${status}`);

        return res.json({ success: true, message: 'Stock updated' });
    } catch (error) {
        console.error('[Integration] Webhook error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
