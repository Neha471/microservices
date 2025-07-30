const express = require('express');
const router = express.Router();
const { placeOrder, getOrderById, getOrdersByUserId, updateStatusOfOrder } = require('../controllers/orderController');


router.get('/all', getOrdersByUserId);
router.post('/place', placeOrder);
router.get('/:orderId', getOrderById);
router.post('/update-order-status', updateStatusOfOrder);

module.exports = router;
