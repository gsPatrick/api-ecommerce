const paymentService = require('./payment.service');

class PaymentController {
    async process(req, res) {
        try {
            const { orderId, ...paymentData } = req.body;
            const result = await paymentService.processPayment(orderId, paymentData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new PaymentController();
