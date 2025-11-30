const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth');

router.get('/stats', authMiddleware, adminMiddleware, dashboardController.getStats);

module.exports = router;
