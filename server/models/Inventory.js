const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['tire', 'wheel', 'part', 'accessory', 'tool'],
  },
  brand: String,
  model: String,
  size: String,
  sku: {
    type: String,
    unique: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  minQuantity: {
    type: Number,
    default: 5,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  retailPrice: {
    type: Number,
    required: true,
  },
  supplier: String,
  location: String,
  description: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Inventory', inventorySchema);
