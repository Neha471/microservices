const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: false },
  message: { type: String, required: true },
  status: { type: String, enum: ['Confirmed', 'Cancelled'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
