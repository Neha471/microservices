const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  availableStock: Number,
  image: { type: String, default: '' } // Adding image field to store product image URL
});

module.exports = mongoose.model('Product', productSchema);
