const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { authMiddleware } = require('../../middleware/auth');

router.post('/process', authMiddleware, paymentController.process);

module.exports = router;
