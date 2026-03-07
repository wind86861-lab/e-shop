const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    uz: { type: String, required: true },
    ru: { type: String, required: true },
    en: { type: String, required: true },
  },
  excerpt: {
    uz: { type: String, default: '' },
    ru: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  content: {
    uz: { type: String, default: '' },
    ru: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  image: {
    type: String,
    default: '',
  },
  author: {
    type: String,
    default: 'Admin',
  },
  category: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
  }],
  views: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Blog', blogSchema);
