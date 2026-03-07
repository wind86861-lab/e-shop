const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  title: {
    uz: { type: String, default: '' },
    ru: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  description: {
    uz: { type: String, default: '' },
    ru: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  image: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
