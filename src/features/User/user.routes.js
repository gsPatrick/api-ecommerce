const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authMiddleware } = require('../../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', authMiddleware, userController.getProfile);
router.get('/', authMiddleware, userController.getAll);

module.exports = router;
