const express = require('express');
const router = express.Router();
const roleController = require('./role.controller');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth');

router.use(authMiddleware, adminMiddleware);

router.get('/', roleController.list);
router.get('/:id', roleController.get);
router.post('/', roleController.create);
router.put('/:id', roleController.update);
router.delete('/:id', roleController.delete);

module.exports = router;
