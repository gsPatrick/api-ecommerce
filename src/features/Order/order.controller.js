```javascript
const orderService = require('./order.service');

class OrderController {
    async create(req, res) {
        try {
            const { shippingAddress, paymentMethod, shippingCost, discount, notes, couponCode, items } = req.body;

            const order = await orderService.createOrder({
                userId: req.user.id,
                shippingAddress,
                paymentMethod,
                shippingCost,
                discount,
                notes,
                couponCode,
                items
            });

            res.status(201).json(order);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async listMyOrders(req, res) {
        try {
            const orders = await orderService.getOrders(req.user.id);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async listAll(req, res) {
        try {
            const orders = await orderService.getAllOrders();
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const order = await orderService.updateStatus(req.params.id, status);
            res.json(order);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new OrderController();
