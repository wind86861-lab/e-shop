const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });
};

router.post('/register', protect, admin, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, role, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'technician',
      phone,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =====================================================
// STAGE 1: ADMIN PREMIUM MANAGEMENT
// =====================================================

/**
 * POST /api/admin/users/:id/premium
 * Stage 1: Grant or revoke premium status for a user
 * Body: { isPremium: boolean, durationDays: number }
 */
router.post('/admin/users/:id/premium', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isPremium, durationDays = 30 } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isPremium = isPremium;
    if (isPremium) {
      // Set premium expiry date
      user.premiumExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
      user.userType = 'premium';
    } else {
      user.premiumExpiresAt = null;
      user.userType = 'regular';
    }

    await user.save();

    res.json({
      message: isPremium ? 'Premium status granted' : 'Premium status revoked',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error('Premium update error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/admin/users
 * Stage 1: Get all users with premium info
 */
router.get('/admin/users', protect, admin, async (req, res) => {
  try {
    const { isPremium, page = 1, limit = 20 } = req.query;
    const query = {};
    if (isPremium !== undefined) query.isPremium = isPremium === 'true';

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/auth/admin/broadcast
 * Send a Telegram message to all users (or filtered by userType)
 * Body: { message: string, userType?: 'all'|'premium'|'regular', parseMode?: 'Markdown'|'HTML' }
 */
router.post('/admin/broadcast', protect, admin, async (req, res) => {
  try {
    const { message, userType = 'all', parseMode = 'HTML' } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(503).json({ message: 'Telegram bot not configured' });
    }

    const query = { telegramId: { $exists: true, $ne: null } };
    if (userType === 'premium') query.isPremium = true;
    if (userType === 'regular') query.isPremium = { $ne: true };

    const users = await User.find(query).select('telegramId name');

    const { Telegraf } = require('telegraf');
    const tempBot = new Telegraf(botToken);

    let sent = 0, failed = 0;
    for (const u of users) {
      try {
        await tempBot.telegram.sendMessage(u.telegramId, message, { parse_mode: parseMode });
        sent++;
        // Throttle: ~30 msg/sec Telegram limit
        await new Promise(r => setTimeout(r, 35));
      } catch {
        failed++;
      }
    }

    res.json({ sent, failed, total: users.length });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
