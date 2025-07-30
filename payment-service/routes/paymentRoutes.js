const express = require('express');
const router = express.Router();
const { processPayment, updatePaymentStatus } = require('../controllers/paymentController');
const verifyToken = require('../middleware/verifyToken');

router.post('/create-checkout-session', verifyToken, processPayment);
router.post('/update-payment-status', verifyToken, updatePaymentStatus);

module.exports = router;
