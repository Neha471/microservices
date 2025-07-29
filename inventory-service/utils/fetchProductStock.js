const axios = require('axios');

/**
 * Fetch product stock from product service
 * @param {String} productId
 * @returns {Promise<{stock: number, price: number}|null>}
 */
async function fetchProductStock(productId) {
  try {
    const response = await axios.get(`http://product-service:5001/api/products/${productId}`);
    const { availableStock, price } = response.data;
    return { stock: availableStock, price: price || 0 };
  } catch (error) {
    return null;
  }
}

module.exports = fetchProductStock;
