const express = require('express');
const router = express.Router();
const roleController = require('./role.controller');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth');

router.use(authMiddleware, adminMiddleware);

router.post('/', roleController.create);
router.get('/', roleController.list);
router.put('/:id', roleController.update);
router.delete('/:id', roleController.delete);

module.exports = router;
