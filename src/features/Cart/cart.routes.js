const express = require('express');
const router = express.Router();
const cartController = require('./cart.controller');
const { authMiddleware } = require('../../middleware/auth');

router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:itemId', cartController.updateItem);
router.delete('/items/:itemId', cartController.removeItem);

module.exports = router;
