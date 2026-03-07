const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['consultation', 'custom-order', 'calculator', 'contact'],
    default: 'consultation',
  },
  productModel: {
    type: String,
    default: '',
  },
  productQuantity: {
    type: String,
    default: '',
  },
  comment: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'completed', 'cancelled'],
    default: 'new',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  page: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ContactRequest', contactRequestSchema);
