const CircuitBreaker = require('../utils/circuitBreaker');
const axios = require('axios');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require('../model/payment');

const createCheckoutSession = async (req, res) => {
  try {
    const {userId} = req.body;

    if(!userId ){
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await axios.post('http://order-service:5003/api/orders/place', { userId });
    const order = await response.data;

    // Ensure amount is properly formatted to 2 decimal places before any calculations
    const amount = parseFloat(order.amount.toFixed(2));
    const orderId = order.order._id;

    const payment = new Payment({
      userId,
      amount,
      currency: 'usd',
      orderId,
      status: 'PENDING',
    });

    const paymentResponse = await payment.save();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Test Product",
            },
            unit_amount: Math.round(amount * 100), // Convert to cents (already properly formatted)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/payment/success/?paymentId=${paymentResponse._id}&orderId=${orderId}`,
      cancel_url: `http://localhost:5173/payment/cancel/?paymentId=${paymentResponse._id}&orderId=${orderId}`,
    });

    // Update the payment with the Stripe session ID
    await Payment.findByIdAndUpdate(paymentResponse._id, { 
      stripeSessionId: session.id 
    });

    return { id: session.id };
  } catch (err) {
    console.log('session creation failed', err)
    return { error: err.message };
  }
};

const breaker = new CircuitBreaker(createCheckoutSession, 3, 5000);

exports.processPayment = async (req, res) => {
  try {
    const result = await breaker.execute(req, res);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(503).json({ success: false, error: err.message });
  }
};


exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId, status } = req.body;
    const payment = await Payment.findByIdAndUpdate(paymentId, { status }, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};