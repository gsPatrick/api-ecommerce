const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth');

router.post('/track', analyticsController.track);
router.get('/funnel', authMiddleware, adminMiddleware, analyticsController.getFunnel);
router.get('/reports/sales', authMiddleware, adminMiddleware, analyticsController.getReports);
router.get('/reports/products', authMiddleware, adminMiddleware, analyticsController.getProductPerformance);
router.get('/reports/customers', authMiddleware, adminMiddleware, analyticsController.getCustomerInsights);
router.get('/reports/carts', authMiddleware, adminMiddleware, analyticsController.getCartAnalysis);

module.exports = router;
