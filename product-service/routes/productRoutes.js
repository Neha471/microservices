const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateStock,
} = require('../controllers/productController');
const { seedProducts } = require('../controllers/seedController');

// router.post('/seed', seedProducts);
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;
