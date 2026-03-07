const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  vehicles: [{
    make: String,
    model: String,
    year: Number,
    vin: String,
    licensePlate: String,
  }],
  notes: String,
  totalSpent: {
    type: Number,
    default: 0,
  },
  lastVisit: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Customer', customerSchema);
