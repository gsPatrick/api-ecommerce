const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth');

router.use(authMiddleware, adminMiddleware);

// Inventory
router.post('/inventory/adjust', adminController.adjustStock);
router.get('/inventory/history', adminController.getStockHistory);

// Payments
router.get('/payments', adminController.listPayments);
router.put('/payments/:id/approve', adminController.approvePayment);

const superAdminController = require('./superAdmin.controller');

// Dashboard
router.get('/dashboard/executive', superAdminController.getExecutiveDashboard);

// Store Configs
router.post('/configs/init', superAdminController.initConfigs);
router.get('/configs', superAdminController.getAllConfigs);
router.put('/configs', superAdminController.updateBulkConfigs);

// Shipping Rules
router.get('/shipping-rules', superAdminController.getShippingRules);
router.post('/shipping-rules', superAdminController.createShippingRule);
router.put('/shipping-rules/:id', superAdminController.updateShippingRule);
router.delete('/shipping-rules/:id', superAdminController.deleteShippingRule);

module.exports = router;
