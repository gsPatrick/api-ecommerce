const couponService = require('./coupon.service');

class CouponController {
    async create(req, res) {
        try {
            const coupon = await couponService.createCoupon(req.body);
            res.status(201).json(coupon);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async list(req, res) {
        try {
            const coupons = await couponService.listCoupons();
            res.json(coupons);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async validate(req, res) {
        try {
            const { code, cartTotal, cartItems } = req.body;
            const result = await couponService.validateCoupon(code, cartTotal, cartItems);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new CouponController();
