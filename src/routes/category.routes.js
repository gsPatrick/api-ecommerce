const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
// const authMiddleware = require('../middleware/auth'); // Uncomment if protection needed

router.get('/', CategoryController.index);
router.get('/:id', CategoryController.show);
router.post('/', CategoryController.create); // Protect in production
router.put('/:id', CategoryController.update); // Protect in production
router.delete('/:id', CategoryController.delete); // Protect in production

module.exports = router;
