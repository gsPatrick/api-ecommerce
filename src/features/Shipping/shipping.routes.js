const express = require('express');
const router = express.Router();
const shippingController = require('./shipping.controller');

router.post('/calculate', shippingController.calculate);

module.exports = router;
