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

module.exports = router;
