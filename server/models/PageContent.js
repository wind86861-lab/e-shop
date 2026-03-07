const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
});

pageContentSchema.index({ page: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('PageContent', pageContentSchema);
