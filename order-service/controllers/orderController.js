const Order = require('../models/orderModel');
const axios = require('axios');

// Place order from cart
exports.placeOrder = async (req, res) => {
  try {
    const { userId } = req.body;
    // 1. Get cart items
    const cartRes = await axios.get(`http://localhost:5002/api/cart/${userId}`);
    const cart = cartRes.data;
    console.log(cart)
    if (!cart.items.length) return res.status(400).json({ message: 'Cart is empty' });

    // 2. Validate inventory
    const inventoryRes = await axios.post('http://localhost:5004/api/inventory/validate', { items: cart.items });
    if (!inventoryRes.data.success) return res.status(400).json({ message: 'Inventory validation failed', details: inventoryRes.data.details });

    // 3. Call Payment Service
    let paymentResult;
    try {
      paymentResult = await axios.post('http://localhost:5005/api/payment', { userId, amount: inventoryRes.data.total });
    } catch (err) {
      return res.status(400).json({ message: 'Payment failed', error: err.response?.data || err.message });
    }

    // 4. Create order
    console.log("paymentResult",paymentResult);
    const orderStatus = paymentResult.data.success ? 'Confirmed' : 'Cancelled';
    const order = new Order({
      user: userId,
      items: cart.items.map(i => ({ product: i.product._id || i.product, quantity: i.quantity })),
      total: inventoryRes.data.total,
      status: orderStatus,
    });
    console.log("order",order);
    await order.save();

    // 5. Reduce inventory if confirmed
    if (orderStatus === 'Confirmed') {
      await axios.post('http://localhost:5004/api/inventory/reduce', { items: cart.items });
    }

    res.status(201).json(order);
  } catch (err) {
    console.log("error msg",err);
    res.status(500).json({ error: err.message });
  }
};
