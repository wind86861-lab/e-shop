const mongoose = require('mongoose');

const paymentAttemptSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  },
  provider: {
    type: String,
    enum: ['payme', 'click', 'cash'],
    required: true,
  },
  // Provider-specific transaction ID
  transactionId: { type: String, default: '' },
  // Payme-specific: their internal transaction ID
  providerTransactionId: { type: String, default: '' },
  amount: { type: Number, required: true },
  // Amount in tiyins (Payme uses tiyins = sum * 100)
  amountInTiyins: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'creating', 'paid', 'cancelled', 'expired', 'refunded'],
    default: 'pending',
  },
  // Timestamps from provider
  createTime: { type: Date, default: null },
  performTime: { type: Date, default: null },
  cancelTime: { type: Date, default: null },
  // Cancel reason (Payme cancel reasons: 1-5)
  cancelReason: { type: Number, default: null },
  // Refund info
  refundedAt: { type: Date, default: null },
  refundReason: { type: String, default: '' },
  // Expiry: 30 minutes from creation
  expiresAt: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 30 * 60 * 1000);
    },
  },
  // Raw provider response for debugging
  rawResponse: { type: mongoose.Schema.Types.Mixed, default: null },
}, {
  timestamps: true,
});

// Check if payment attempt is expired
paymentAttemptSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt && this.status === 'pending';
};

// Indexes
paymentAttemptSchema.index({ transactionId: 1, provider: 1 });
paymentAttemptSchema.index({ status: 1, expiresAt: 1 });
paymentAttemptSchema.index({ order: 1, provider: 1, status: 1 });

module.exports = mongoose.model('PaymentAttempt', paymentAttemptSchema);
