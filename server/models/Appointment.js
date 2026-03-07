const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  vehicle: {
    make: String,
    model: String,
    year: Number,
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['tire-change', 'tire-rotation', 'wheel-alignment', 'balancing', 'inspection', 'repair', 'other'],
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  scheduledTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: String,
  estimatedDuration: Number,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Appointment', appointmentSchema);
