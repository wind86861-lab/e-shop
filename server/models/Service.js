const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  vehicle: {
    make: String,
    model: String,
    year: Number,
    vin: String,
  },
  serviceType: {
    type: String,
    required: true,
  },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number,
  }],
  laborCost: {
    type: Number,
    default: 0,
  },
  partsCost: {
    type: Number,
    default: 0,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid',
  },
  paymentMethod: String,
  notes: String,
  completedDate: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Service', serviceSchema);
