const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const PaymentAttempt = require('../models/PaymentAttempt');
const { logger } = require('../config/logger');

// Payme JSONRPC error codes
const PaymeError = {
  InvalidAmount: -31001,
  OrderNotFound: -31050,
  CantPerform: -31008,
  TransactionNotFound: -31003,
  AlreadyDone: -31060,
  Pending: -31050,
  InvalidAuth: -32504,
};

// Verify Payme auth header (Basic Auth with merchant key)
function verifyPaymeAuth(req) {
  var auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) return false;
  var decoded = Buffer.from(auth.slice(6), 'base64').toString();
  // Format: "Paycom:<PAYME_KEY>"
  var parts = decoded.split(':');
  return parts[1] === process.env.PAYME_KEY;
}

// Build JSONRPC response
function jsonrpc(id, result) {
  return { jsonrpc: '2.0', id: id, result: result };
}

function jsonrpcError(id, code, message, data) {
  return {
    jsonrpc: '2.0',
    id: id,
    error: { code: code, message: { ru: message, en: message, uz: message }, data: data || null },
  };
}

// Main Payme endpoint — handles all JSONRPC methods
router.post('/', express.json(), async function (req, res) {
  var body = req.body;
  var id = body.id;
  var method = body.method;
  var params = body.params || {};

  logger.info('Payme request', { method: method, params: params });

  // Auth check
  if (!verifyPaymeAuth(req)) {
    return res.json(jsonrpcError(id, PaymeError.InvalidAuth, 'Invalid authorization'));
  }

  try {
    switch (method) {
      case 'CheckPerformTransaction':
        return res.json(await checkPerform(id, params));
      case 'CreateTransaction':
        return res.json(await createTransaction(id, params));
      case 'PerformTransaction':
        return res.json(await performTransaction(id, params));
      case 'CancelTransaction':
        return res.json(await cancelTransaction(id, params));
      case 'CheckTransaction':
        return res.json(await checkTransaction(id, params));
      default:
        return res.json(jsonrpcError(id, -32601, 'Method not found'));
    }
  } catch (err) {
    logger.error('Payme handler error', { error: err.message, method: method });
    return res.json(jsonrpcError(id, -32400, 'Internal error'));
  }
});

// ── CheckPerformTransaction ────────────────────────────
async function checkPerform(id, params) {
  var orderId = params.account && params.account.order_id;
  var amount = params.amount; // in tiyins

  if (!orderId) {
    return jsonrpcError(id, PaymeError.OrderNotFound, 'Order ID required');
  }

  var order = await Order.findById(orderId);
  if (!order) {
    return jsonrpcError(id, PaymeError.OrderNotFound, 'Order not found');
  }

  // Verify amount matches (Payme sends in tiyins = sum * 100)
  var expectedTiyins = order.totalPrice * 100;
  if (amount !== expectedTiyins) {
    return jsonrpcError(id, PaymeError.InvalidAmount, 'Invalid amount');
  }

  // Order must be in payable state
  if (order.paymentStatus === 'paid') {
    return jsonrpcError(id, PaymeError.AlreadyDone, 'Already paid');
  }

  if (order.status === 'cancelled') {
    return jsonrpcError(id, PaymeError.CantPerform, 'Order cancelled');
  }

  return jsonrpc(id, { allow: true });
}

// ── CreateTransaction ──────────────────────────────────
async function createTransaction(id, params) {
  var paymeId = params.id;
  var orderId = params.account && params.account.order_id;
  var amount = params.amount;
  var time = params.time;

  var order = await Order.findById(orderId);
  if (!order) {
    return jsonrpcError(id, PaymeError.OrderNotFound, 'Order not found');
  }

  var expectedTiyins = order.totalPrice * 100;
  if (amount !== expectedTiyins) {
    return jsonrpcError(id, PaymeError.InvalidAmount, 'Invalid amount');
  }

  // Check if transaction already exists
  var existing = await PaymentAttempt.findOne({
    provider: 'payme',
    transactionId: paymeId,
  });

  if (existing) {
    // If exists and not expired, return it
    if (existing.status === 'pending' || existing.status === 'creating') {
      if (existing.isExpired()) {
        existing.status = 'expired';
        await existing.save();
        return jsonrpcError(id, PaymeError.CantPerform, 'Transaction expired');
      }
      return jsonrpc(id, {
        create_time: existing.createTime.getTime(),
        transaction: String(existing._id),
        state: 1,
      });
    }
    if (existing.status === 'paid') {
      return jsonrpc(id, {
        create_time: existing.createTime.getTime(),
        transaction: String(existing._id),
        state: 2,
      });
    }
    return jsonrpcError(id, PaymeError.CantPerform, 'Transaction in invalid state');
  }

  // Check for another active payment on this order
  var activePayment = await PaymentAttempt.findOne({
    order: order._id,
    provider: 'payme',
    status: { $in: ['pending', 'creating'] },
  });
  if (activePayment && !activePayment.isExpired()) {
    // Cancel old one
    activePayment.status = 'cancelled';
    activePayment.cancelReason = 1;
    activePayment.cancelTime = new Date();
    await activePayment.save();
  }

  // Create new payment attempt
  var attempt = await PaymentAttempt.create({
    order: order._id,
    provider: 'payme',
    transactionId: paymeId,
    amount: order.totalPrice,
    amountInTiyins: amount,
    status: 'creating',
    createTime: new Date(time),
  });

  return jsonrpc(id, {
    create_time: attempt.createTime.getTime(),
    transaction: String(attempt._id),
    state: 1,
  });
}

// ── PerformTransaction ─────────────────────────────────
async function performTransaction(id, params) {
  var paymeId = params.id;

  var attempt = await PaymentAttempt.findOne({
    provider: 'payme',
    transactionId: paymeId,
  });

  if (!attempt) {
    return jsonrpcError(id, PaymeError.TransactionNotFound, 'Transaction not found');
  }

  if (attempt.status === 'paid') {
    return jsonrpc(id, {
      transaction: String(attempt._id),
      perform_time: attempt.performTime.getTime(),
      state: 2,
    });
  }

  if (attempt.status !== 'creating') {
    return jsonrpcError(id, PaymeError.CantPerform, 'Cannot perform this transaction');
  }

  if (attempt.isExpired()) {
    attempt.status = 'expired';
    await attempt.save();
    return jsonrpcError(id, PaymeError.CantPerform, 'Transaction expired');
  }

  // Mark payment as successful
  attempt.status = 'paid';
  attempt.performTime = new Date();
  await attempt.save();

  // Update order
  var order = await Order.findById(attempt.order);
  if (order) {
    order.paymentStatus = 'paid';
    order.paymentMethod = 'online';
    order.paymentId = paymeId;
    order.paidAt = new Date();
    await order.save();

    logger.info('Payme payment completed', { orderId: String(order._id), amount: attempt.amount });

    // Notify via Telegram
    var { sendTelegramMessage } = require('../utils/telegram');
    var msg = '💳 <b>Оплата получена (Payme)</b>\n\n' +
      '🆔 Заказ: ' + order._id + '\n' +
      '💰 Сумма: ' + order.totalPrice.toLocaleString() + ' сум\n' +
      '✅ Статус: Оплачено';
    sendTelegramMessage(msg).catch(function () {});

    // Notify customer bot
    if (order.telegramId && process.env.TELEGRAM_BOT_TOKEN) {
      var { Telegraf } = require('telegraf');
      var tempBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
      tempBot.telegram.sendMessage(order.telegramId,
        '✅ Оплата получена!\n\n📦 Заказ: ' + order._id + '\n💰 ' + order.totalPrice.toLocaleString() + ' сум\n\n⏰ Время доставки будет сообщено.'
      ).catch(function () {});
    }
  }

  return jsonrpc(id, {
    transaction: String(attempt._id),
    perform_time: attempt.performTime.getTime(),
    state: 2,
  });
}

// ── CancelTransaction ──────────────────────────────────
async function cancelTransaction(id, params) {
  var paymeId = params.id;
  var reason = params.reason;

  var attempt = await PaymentAttempt.findOne({
    provider: 'payme',
    transactionId: paymeId,
  });

  if (!attempt) {
    return jsonrpcError(id, PaymeError.TransactionNotFound, 'Transaction not found');
  }

  if (attempt.status === 'cancelled') {
    return jsonrpc(id, {
      transaction: String(attempt._id),
      cancel_time: attempt.cancelTime.getTime(),
      state: -1,
    });
  }

  var wasCompleted = attempt.status === 'paid';

  attempt.status = wasCompleted ? 'refunded' : 'cancelled';
  attempt.cancelTime = new Date();
  attempt.cancelReason = reason;
  if (wasCompleted) attempt.refundedAt = new Date();
  await attempt.save();

  // If was paid, update order
  if (wasCompleted) {
    var order = await Order.findById(attempt.order);
    if (order) {
      order.paymentStatus = 'refunded';
      await order.save();
      logger.info('Payme refund', { orderId: String(order._id) });
    }
  }

  return jsonrpc(id, {
    transaction: String(attempt._id),
    cancel_time: attempt.cancelTime.getTime(),
    state: wasCompleted ? -2 : -1,
  });
}

// ── CheckTransaction ───────────────────────────────────
async function checkTransaction(id, params) {
  var paymeId = params.id;

  var attempt = await PaymentAttempt.findOne({
    provider: 'payme',
    transactionId: paymeId,
  });

  if (!attempt) {
    return jsonrpcError(id, PaymeError.TransactionNotFound, 'Transaction not found');
  }

  var stateMap = {
    pending: 1,
    creating: 1,
    paid: 2,
    cancelled: -1,
    expired: -1,
    refunded: -2,
  };

  return jsonrpc(id, {
    create_time: attempt.createTime ? attempt.createTime.getTime() : 0,
    perform_time: attempt.performTime ? attempt.performTime.getTime() : 0,
    cancel_time: attempt.cancelTime ? attempt.cancelTime.getTime() : 0,
    transaction: String(attempt._id),
    state: stateMap[attempt.status] || 1,
    reason: attempt.cancelReason,
  });
}

module.exports = router;
