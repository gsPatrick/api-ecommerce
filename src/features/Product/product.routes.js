const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth');

router.get('/', productController.getAll);
router.get('/filters', productController.getFilters);
router.get('/:id', productController.getOne);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, productController.create);
router.put('/:id', authMiddleware, adminMiddleware, productController.update);
router.delete('/:id', authMiddleware, adminMiddleware, productController.delete);

module.exports = router;
