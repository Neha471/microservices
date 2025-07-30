const Order = require('../models/orderModel');
const Product = require('./productModel');
const axios = require('axios');

async function fetchProductDetails(productId) {
  try {
    // Adjust the URL and port if your product service runs elsewhere
    const response = await axios.get(`http://product-service:5001/api/products/${productId}`);
    return response.data;
  } catch (error) {
    return null;
  }
}
// Place order from cart
exports.placeOrder = async (req, res) => {
  try {
    const { userId } = req.body;
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
      return res.status(400).json({ success: false, message: 'Inventory validation failed', details: insufficientStock });
    }
    // 4. Create order
    const orderStatus = 'PENDING';
    const order = new Order({
      user: userId,
      items: cart.items.map(i => ({ product: i.product._id || i.product, quantity: i.quantity })),
      total,
      status: orderStatus,
    });
    const orderRes = await order.save();
    return res.status(201).json({ success: true, order: orderRes, amount: total });
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
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const orders = await Order.find({ user: userId });

    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const enrichedItems = await Promise.all(order.items.map(async (item) => {
        const product = await fetchProductDetails(item.product);
        return {
          ...item.toObject(),
          product,
        };
      }));

      return {
        _id: order._id,
        user: order.user,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        items: enrichedItems,
      };
    }));

    res.status(200).json({ orders: enrichedOrders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.updateStatusOfOrder = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};