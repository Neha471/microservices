const Inventory = require('../models/inventoryModel');
const fetchProductStock = require('../utils/fetchProductStock');
const axios = require('axios');

// Validate inventory for order using product service
exports.validateInventory = async (req, res) => {
  try {
    const { items } = req.body; // [{ product, quantity }]
    let total = 0;
    const details = [];
    for (const item of items) {
      const productId = item.product._id || item.product;
      const product = await fetchProductStock(productId);
      if (!product || product.stock < item.quantity) {
        details.push({ product: productId, available: product ? product.stock : 0 });
      } else {
        total += (product.price || 100) * item.quantity; // fallback price
      }
    }
    if (details.length) {
      return res.json({ success: false, details });
    }
    res.json({ success: true, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reduce inventory after order using product service
exports.reduceInventory = async (req, res) => {
  try {
    const { items } = req.body;
    console.log("items",items);
    for (const item of items) {
      const productId = item.product._id || item.product;
      // Call product service to reduce stock
      await axios.put(`http://product-service:5001/api/products/${productId}/stock`, {
        reduceBy: item.quantity
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
