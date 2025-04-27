const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} = require('../controllers/cartController');

router.get('/', async (req, res) => {
  try {
    
    res.json({ msg: 'Hello!!!! Server is running' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/add', addToCart);
router.get('/:userId', getCart);
router.delete('/remove', removeFromCart);
router.put('/update', updateCartItem);

module.exports = router;
