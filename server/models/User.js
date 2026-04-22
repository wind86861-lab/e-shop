const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'technician', 'customer'],
    default: 'customer',
  },
  phone: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  // Telegram integration fields
  telegramId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  telegramUsername: String,
  // Premium user fields
  isPremium: {
    type: Boolean,
    default: false,
  },
  premiumExpiresAt: {
    type: Date,
    default: null,
  },
  // User type for pricing
  userType: {
    type: String,
    enum: ['regular', 'premium'],
    default: 'regular',
  },
}, {
  timestamps: true,
});

// Virtual to check if premium is active
userSchema.virtual('isPremiumActive').get(function () {
  if (!this.isPremium || !this.premiumExpiresAt) return false;
  return new Date() < this.premiumExpiresAt;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
