const express = require('express');
const router = express.Router();
const { processPayment } = require('../controllers/paymentController');

router.post('/create-checkout-session', processPayment);

module.exports = router;
