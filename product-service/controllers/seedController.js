const Product = require('../models/productModel');

// Helper to generate random product data
function getRandomProduct() {
  const categories = ['Electronics', 'Books', 'Clothing', 'Home', 'Sports', 'Toys'];
  const adjectives = ['Awesome', 'Portable', 'New', 'Used', 'Refurbished', 'Eco', 'Smart', 'Classic'];
  const items = ['Phone', 'Laptop', 'Shirt', 'Mug', 'Sneakers', 'Backpack', 'Book', 'Watch', 'Headphones', 'Lamp'];

  const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${items[Math.floor(Math.random() * items.length)]}`;
  const description = `This is a ${name.toLowerCase()} for your needs.`;
  const price = parseFloat((Math.random() * 500 + 10).toFixed(2));
  const category = categories[Math.floor(Math.random() * categories.length)];
  const availableStock = Math.floor(Math.random() * 100) + 1;

  return { name, description, price, category, availableStock };
}

exports.seedProducts = async (req, res) => {
  try {
    // Remove existing products (optional, comment if not desired)
    // await Product.deleteMany({});
    const products = Array.from({ length: 50 }, getRandomProduct);
    const inserted = await Product.insertMany(products);
    res.status(201).json({ message: '50 random products seeded!', products: inserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
