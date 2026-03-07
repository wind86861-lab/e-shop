const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  title: {
    uz: { type: String, required: true },
    ru: { type: String, required: true },
    en: { type: String, required: true },
  },
  company: {
    type: String,
    default: '',
  },
  inn: {
    type: String,
    default: '',
  },
  director: {
    uz: { type: String, default: '' },
    ru: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  founded: {
    type: String,
    default: '',
  },
  address: {
    uz: { type: String, default: '' },
    ru: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  fullAddress: {
    type: String,
    default: '',
  },
  phones: [{
    type: String,
  }],
  mapUrl: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
  showOnHomepage: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Branch', branchSchema);
