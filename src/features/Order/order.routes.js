const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth');

router.post('/', authMiddleware, orderController.create);
router.get('/my-orders', authMiddleware, orderController.listMyOrders);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, orderController.listAll);
router.put('/:id/status', authMiddleware, adminMiddleware, orderController.updateStatus);

module.exports = router;
