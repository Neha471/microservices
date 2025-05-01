const express = require('express');
const router = express.Router();
const { placeOrder, getOrderById, getOrdersByUserId } = require('../controllers/orderController');

router.post('/place', placeOrder);
router.get('/:orderId', getOrderById);
router.get('/user/:userId', getOrdersByUserId);

module.exports = router;
