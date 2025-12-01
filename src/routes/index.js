const express = require('express');
const router = express.Router();

const userRoutes = require('../features/User/user.routes');
const productRoutes = require('../features/Product/product.routes');
const cartRoutes = require('../features/Cart/cart.routes');
const orderRoutes = require('../features/Order/order.routes');
const couponRoutes = require('../features/Coupon/coupon.routes');
const dashboardRoutes = require('../features/Dashboard/dashboard.routes');
const categoryRoutes = require('../features/Category/category.routes');
const paymentRoutes = require('../features/Payment/payment.routes');
const adminRoutes = require('../features/Admin/admin.routes');
const analyticsRoutes = require('../features/Analytics/analytics.routes');
const { StoreConfigController, ReviewController, WishlistController, UploadController } = require('../features/common.controllers');
const { upload } = require('../features/Upload/upload.service');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/shipping', require('../features/Shipping/shipping.routes'));
router.use('/integration', require('../features/Integration/integration.routes'));

// Config Routes
router.get('/config', StoreConfigController.getPublic);
router.post('/config', authMiddleware, adminMiddleware, StoreConfigController.update);
router.post('/config/bulk', authMiddleware, adminMiddleware, StoreConfigController.updateBulk);

// Review Routes
router.post('/reviews', authMiddleware, ReviewController.add);
router.get('/products/:productId/reviews', ReviewController.list);

// Wishlist Routes
router.post('/wishlist/toggle', authMiddleware, WishlistController.toggle);
router.get('/wishlist', authMiddleware, WishlistController.list);

// Upload Routes
router.post('/upload', authMiddleware, upload.single('file'), UploadController.upload);

module.exports = router;
