const Product = require('../models/productModel');

// Add new product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all or search with pagination, sorting, and filtering
exports.getProducts = async (req, res) => {
  try {
    const {
      name,
      category,
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build query object
    let query = {};
    if (name) query.name = new RegExp(name, 'i');
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Fetch total count for pagination info
    const total = await Product.countDocuments(query);

    // Fetch paginated results
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      products,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update or reduce stock
exports.updateStock = async (req, res) => {
  const {reduceBy}=req.body;
  
  if(typeof reduceBy === 'number'){
  	return res.status(400).json({
    	message: "Invalid stock unit"
    })
  }
  
  try {
    let product = await Product.findById(req.params.id);
    if (!product) 
    	return res.status(404).json({ message: 'Product not found' });

    // Reduce stock by amount
    if (typeof reduceBy === 'number') {
      if (product.availableStock < reduceBy) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      product.availableStock -= reduceBy;
      await product.save();
      return res.json({ success: true, availableStock: product.availableStock });
    }

    res.status(400).json({ error: 'No valid stock operation provided' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
