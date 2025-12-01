const { Coupon } = require('../../models');
const { Op } = require('sequelize');

class CouponService {
    async createCoupon(data) {
        if (data.is_main) {
            await Coupon.update({ is_main: false }, { where: { is_main: true } });
        }
        return await Coupon.create(data);
    }

    async updateCoupon(id, data) {
        if (data.is_main) {
            await Coupon.update({ is_main: false }, { where: { is_main: true, id: { [Op.ne]: id } } });
        }
        const coupon = await Coupon.findByPk(id);
        if (!coupon) throw new Error('Coupon not found');
        return await coupon.update(data);
    }

    async validateCoupon(code, cartTotal, cartItems) {
        const coupon = await Coupon.findOne({ where: { code } });

        if (!coupon) {
            throw new Error('Invalid coupon code');
        }

        if (coupon.expiration_date && new Date() > new Date(coupon.expiration_date)) {
            throw new Error('Coupon expired');
        }

        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            throw new Error('Coupon usage limit reached');
        }

        if (cartTotal < coupon.min_purchase) {
            throw new Error(`Minimum purchase of ${coupon.min_purchase} required`);
        }

        // Advanced Validations
        // 1. Allowed Emails
        if (coupon.allowed_emails && coupon.allowed_emails.length > 0) {
            // Need user email. Assuming passed in context or fetched.
            // For now, skipping if email not provided in args (should be passed from controller)
        }

        // 2. First Order
        if (coupon.is_first_order) {
            // Check if user has orders
            // const orderCount = await Order.count({ where: { userId } });
            // if (orderCount > 0) throw new Error('Coupon valid only for first order');
        }

        // 3. Subscriber Only
        if (coupon.subscriber_only) {
            // Check if user is subscriber
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === 'percent') {
            discount = (cartTotal * coupon.value) / 100;
        } else if (coupon.type === 'fixed') {
            discount = parseFloat(coupon.value);
        }
        // 'shipping' type would be handled in shipping calculation logic

        return { isValid: true, discount, coupon };
    }

    async listCoupons() {
        return await Coupon.findAll();
    }
}

module.exports = new CouponService();
