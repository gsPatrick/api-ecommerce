const express = require('express');
const router = express.Router();
const AttributeController = require('./attribute.controller');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth');

router.get('/', AttributeController.list);
router.post('/option', authMiddleware, adminMiddleware, AttributeController.addOption);

module.exports = router;
