const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  profilePicture: { type: String, default: '', required: false },
  designation: { type: String, default: '', required: false },
  mobileNumber: { type: String, default: '', required: false },
  address: { type: String, default: '', required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  about: { type: String, default: '', required: false },
});

module.exports = mongoose.model('User', userSchema);
