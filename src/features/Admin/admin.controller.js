const inventoryService = require('../Inventory/inventory.service');
const { Payment, StockMovement, Product, ProductVariation } = require('../../models');

class AdminController {
    // Inventory Management
    async adjustStock(req, res) {
        try {
            const { productId, variationId, quantity, type, reason } = req.body;
            const newStock = await inventoryService.adjustStock({
                productId,
                variationId,
                quantity,
                type,
                reason,
                userId: req.user.id
            });
            res.json({ newStock });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getStockHistory(req, res) {
        try {
            const { productId, variationId } = req.query;
            const history = await inventoryService.getHistory(productId, variationId);
            res.json(history);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Payment Management
    async listPayments(req, res) {
        try {
            const payments = await Payment.findAll({ order: [['createdAt', 'DESC']] });
            res.json(payments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async approvePayment(req, res) {
        try {
            const { id } = req.params;
            const payment = await Payment.findByPk(id);
            if (!payment) return res.status(404).json({ error: 'Payment not found' });

            payment.status = 'approved';
            await payment.save();

            // Hook: Update Order status to 'paid' or 'processing'
            // const order = await Order.findByPk(payment.orderId);
            // order.status = 'processing';
            // await order.save();

            res.json(payment);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AdminController();
