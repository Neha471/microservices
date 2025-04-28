const CircuitBreaker = require('../utils/circuitBreaker');

// Mock payment action
async function mockPayment() {
  // Randomly succeed or fail
  if (Math.random() < 0.7) {
    return { success: true, message: 'Payment succeeded' };
  } else {
    throw new Error('Payment failed');
  }
}

const breaker = new CircuitBreaker(mockPayment, 3, 5000);

exports.processPayment = async (req, res) => {
  try {
    const result = await breaker.execute();
    res.json(result);
  } catch (err) {
    res.status(503).json({ success: false, error: err.message });
  }
};
