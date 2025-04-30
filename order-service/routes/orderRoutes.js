const express = require('express');
const router = express.Router();
const { placeOrder, getOrderById } = require('../controllers/orderController');

router.post('/place', placeOrder);
router.get('/:orderId', getOrderById);

module.exports = router;
