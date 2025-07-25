const mongoose = require('mongoose');
const Product = require('../models/productModel');
require('dotenv').config();

const imageMappings = {
    'book': 'https://ik.imagekit.io/NEHA531/book.jpg',
    'lamp': 'https://ik.imagekit.io/NEHA531/lamp.jpg',
    'sneakers': 'https://ik.imagekit.io/NEHA531/sneaker.jpg',
    'shirt': 'https://ik.imagekit.io/NEHA531/shirt.webp',
    'phone': 'https://ik.imagekit.io/NEHA531/download.jpg',
    'headphones': 'https://ik.imagekit.io/NEHA531/headphones.jpg',
    'backpack': 'https://ik.imagekit.io/NEHA531/backpack.jpg',
  };

// Function to update product images based on keywords
const updateProductImages = async () => {
  try {
    // Process each image mapping
    for (const [keyword, imageUrl] of Object.entries(imageMappings)) {
      console.log(`\nUpdating products with keyword: ${keyword}`);
      
      // Create a case-insensitive regex for the keyword
      const regex = new RegExp(keyword, 'i');
      
      // Find and update all matching products
      const result = await Product.updateMany(
        { 
          $or: [
            { name: { $regex: regex } },
            { description: { $regex: regex } },
            { category: { $regex: regex } }
          ]
        },
        { $set: { image: imageUrl } }
      );
      
      console.log(`Updated ${result.modifiedCount} products for keyword: ${keyword}`);
    }
    
    console.log('\nImage update process completed!');
  } catch (error) {
    console.error('Error updating product images:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

module.exports = { updateProductImages };
