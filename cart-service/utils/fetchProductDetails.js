const axios = require('axios');

/**
 * Fetch product details from product service by productId
 * @param {String} productId
 * @returns {Promise<Object|null>} Product details or null if not found
 */
async function fetchProductDetails(productId) {
  try {
    // Adjust the URL and port if your product service runs elsewhere
    const response = await axios.get(`http://product-service:5001/api/products/${productId}`);
    return response.data;
  } catch (error) {
    return null;
  }
}

module.exports = fetchProductDetails;
