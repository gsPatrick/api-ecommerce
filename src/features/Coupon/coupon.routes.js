const express = require('express');
const router = express.Router();
const couponController = require('./coupon.controller');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth');

router.post('/validate', couponController.validate);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, couponController.create);
router.get('/', authMiddleware, adminMiddleware, couponController.list);

module.exports = router;
