const Order = require('../models/orderModel');
const Product = require('./productModel');

// Place order from cart
exports.placeOrder = async (req, res) => {
  try {
    const { userId } = req.body;
    const axios = require('axios');
    // 1. Get cart items from cart service
    const cartRes = await axios.get(`http://cart-service:5002/api/cart/${userId}`);
    const cart = cartRes.data;
    if (!cart.items.length) return res.status(400).json({ message: 'Cart is empty' });

    // 2. Validate inventory directly using Product model
    let total = 0;
    let insufficientStock = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id || item.product);
      if (!product) {
        insufficientStock.push({ product: item.product, reason: 'Product not found' });
        continue;
      }
      if (product.availableStock < item.quantity) {
        insufficientStock.push({ product: product._id, reason: 'Insufficient stock', available: product.availableStock });
      } else {
        total += product.price * item.quantity;
      }
    }
    if (insufficientStock.length > 0) {
      return res.status(400).json({ message: 'Inventory validation failed', details: insufficientStock });
    }

    // 3. Mock payment confirmation
    const paymentSuccess = Math.random() > 0.2; // 80% chance payment succeeds

    // 4. Create order
    const orderStatus = paymentSuccess ? 'Confirmed' : 'Cancelled';
    const order = new Order({
      user: userId,
      items: cart.items.map(i => ({ product: i.product._id || i.product, quantity: i.quantity })),
      total,
      status: orderStatus,
    });
    await order.save();

    // 5. Reduce inventory if confirmed
    if (orderStatus === 'Confirmed') {
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(
          item.product._id || item.product,
          { $inc: { availableStock: -item.quantity } }
        );
      }
    }

    // Notify notification service on order result
    if (orderStatus === 'Confirmed') {
      try {
        await axios.post('http://notification-service:5010/api/notifications/log', {
          user: userId,
          order: order._id,
          message: `Order #${order._id} placed successfully!`,
          status: 'Confirmed',
        });
        // Also log a system notification
        await axios.post('http://notification-service:5010/api/notifications/log', {
          user: null,
          order: order._id,
          message: `Order #${order._id} was placed by user ${userId}.`,
          status: 'Confirmed',
        });
      } catch (notifyErr) {
        console.error('Failed to notify notification service:', notifyErr.message);
      }
    } else if (orderStatus === 'Cancelled') {
      try {
        await axios.post('http://notification-service:5010/api/notifications/log', {
          user: userId,
          order: order._id,
          message: `Order #${order._id} was cancelled due to payment failure or other issues.`,
          status: 'Cancelled',
        });
        // Also log a system notification
        await axios.post('http://notification-service:5010/api/notifications/log', {
          user: null,
          order: order._id,
          message: `Order #${order._id} for user ${userId} was cancelled.`,
          status: 'Cancelled',
        });
      } catch (notifyErr) {
        console.error('Failed to notify notification service:', notifyErr.message);
      }
    }
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ user: userId }); // Adjust field name if needed
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};
