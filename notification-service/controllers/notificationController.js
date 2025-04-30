const Notification = require('../models/notificationModel');
const axios = require('axios');

// Log a notification (success or failure)
exports.logNotification = async (req, res) => {
  try {
    const { user, order, message, status } = req.body;
    const notification = new Notification({ user, order, message, status });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all notifications (for testing/demo)
exports.getNotifications = async (req, res) => {
  try {
    // Optionally filter by user if userId is provided as query param
    const filter = {};
    if (req.query.userId) {
      filter.user = req.query.userId;
    }
    // Fetch notifications, sorted by creation date
    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    // Group statuses by order
    const orderStatusMap = {};
    notifications.forEach((notif) => {
      if (notif.order) {
        const orderId = notif.order.toString();
        if (!orderStatusMap[orderId]) {
          orderStatusMap[orderId] = [];
        }
        orderStatusMap[orderId].push({ status: notif.status, message: notif.message, createdAt: notif.createdAt });
      }
    });
    // Prepare result: list of { order, statuses: [ {status, message, createdAt}, ... ] }
    const result = Object.entries(orderStatusMap).map(([order, statuses]) => ({ order, statuses }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch order info from order service
exports.fetchOrderInfo = async (req, res) => {
  try {
    const { orderId } = req.params;
    // Set the correct port for your order-service below (default 5003 used as example)
    const orderServiceUrl = `http://localhost:5003/api/orders/${orderId}`;
    const response = await axios.get(orderServiceUrl);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order status and details for a particular user
exports.getUserOrderStatuses = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }
    // Fetch all notifications for this user
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    // Group statuses by order
    const orderStatusMap = {};
    notifications.forEach((notif) => {
      if (notif.order) {
        const orderId = notif.order.toString();
        if (!orderStatusMap[orderId]) {
          orderStatusMap[orderId] = [];
        }
        orderStatusMap[orderId].push({ status: notif.status, message: notif.message, createdAt: notif.createdAt });
      }
    });
    // For each order, fetch order details from order-service
    const results = await Promise.all(Object.entries(orderStatusMap).map(async ([order, statuses]) => {
      let orderDetails = null;
      try {
        const orderServiceUrl = `http://localhost:5003/api/orders/${order}`;
        const response = await axios.get(orderServiceUrl);
        orderDetails = response.data;
      } catch (err) {
        orderDetails = { error: 'Order details not found or service unavailable' };
      }
      return { order, orderDetails, statuses };
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
