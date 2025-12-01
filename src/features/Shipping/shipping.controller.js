const shippingService = require('./shipping.service');

class ShippingController {
    async calculate(req, res) {
        try {
            const { zipCode, weight, price } = req.body;

            if (!zipCode) {
                return res.status(400).json({ error: 'Zip code is required' });
            }

            const result = await shippingService.calculateShipping(zipCode, weight, price);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ShippingController();
