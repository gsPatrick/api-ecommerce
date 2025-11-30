const cartService = require('./cart.service');

class CartController {
    async getCart(req, res) {
        try {
            const cart = await cartService.getCart(req.user.id);
            res.json(cart);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addItem(req, res) {
        try {
            const cart = await cartService.addToCart(req.user.id, req.body);
            res.json(cart);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateItem(req, res) {
        try {
            const { quantity } = req.body;
            const cart = await cartService.updateItem(req.user.id, req.params.itemId, quantity);
            res.json(cart);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async removeItem(req, res) {
        try {
            const cart = await cartService.removeItem(req.user.id, req.params.itemId);
            res.json(cart);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CartController();
