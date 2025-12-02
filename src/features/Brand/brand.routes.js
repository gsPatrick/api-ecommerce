const express = require('express');
const router = express.Router();
const BrandController = require('./brand.controller');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth');

router.get('/', BrandController.list);
router.post('/', authMiddleware, adminMiddleware, BrandController.create);

module.exports = router;
