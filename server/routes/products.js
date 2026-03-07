const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { category, parentCategory, categories, featured, active, search, page = 1, limit = 20, minPrice, maxPrice } = req.query;
    const query = {};
    if (categories) {
      const catIds = categories.split(',').filter(Boolean);
      query.category = { $in: catIds };
    } else if (category) {
      query.category = category;
    } else if (parentCategory) {
      const Category = require('../models/Category');
      const subcategories = await Category.find({ parent: parentCategory }).select('_id');
      const subcategoryIds = subcategories.map(s => s._id);
      query.category = { $in: subcategoryIds };
    }
    if (featured === 'true') query.isFeatured = true;
    if (active !== undefined) query.isActive = active === 'true';
    if (search) {
      query.$or = [
        { 'name.uz': { $regex: search, $options: 'i' } },
        { 'name.ru': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate({ path: 'category', populate: { path: 'parent' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
