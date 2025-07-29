const express = require('express');
const router = express.Router();
const { processPayment, updatePaymentStatus } = require('../controllers/paymentController');

router.post('/create-checkout-session', processPayment);
router.post('/update-payment-status', updatePaymentStatus);

module.exports = router;
