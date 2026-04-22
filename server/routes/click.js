const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Order = require('../models/Order');
const PaymentAttempt = require('../models/PaymentAttempt');
const { logger } = require('../config/logger');

// Click error codes
var ClickError = {
  Success: 0,
  SignFailed: -1,
  InvalidAmount: -2,
  ActionNotFound: -3,
  AlreadyPaid: -4,
  OrderNotFound: -5,
  TransactionError: -6,
  BadRequest: -8,
  TransactionCancelled: -9,
};

// Verify Click signature
function verifyClickSign(params) {
  var serviceId = process.env.CLICK_SERVICE_ID;
  var secretKey = process.env.CLICK_SECRET_KEY;

  var signString = params.click_trans_id +
    serviceId +
    secretKey +
    params.merchant_trans_id +
    (params.merchant_prepare_id || '') +
    params.amount +
    params.action +
    params.sign_time;

  var hash = crypto.createHash('md5').update(signString).digest('hex');
  return hash === params.sign_string;
}

// ── Prepare (action=0) — Click asks: can we start payment? ──
router.post('/prepare', express.urlencoded({ extended: true }), express.json(), async function (req, res) {
  var p = req.body;
  logger.info('Click Prepare', { body: p });

  // Verify signature
  if (!verifyClickSign(p)) {
    return res.json({
      error: ClickError.SignFailed,
      error_note: 'Invalid sign',
    });
  }

  if (Number(p.action) !== 0) {
    return res.json({ error: ClickError.ActionNotFound, error_note: 'Invalid action' });
  }

  var orderId = p.merchant_trans_id;
  var order = await Order.findById(orderId);

  if (!order) {
    return res.json({ error: ClickError.OrderNotFound, error_note: 'Order not found' });
  }

  if (order.paymentStatus === 'paid') {
    return res.json({ error: ClickError.AlreadyPaid, error_note: 'Already paid' });
  }

  // Verify amount
  if (Number(p.amount) !== order.totalPrice) {
    return res.json({ error: ClickError.InvalidAmount, error_note: 'Invalid amount' });
  }

  // Create payment attempt
  var attempt = await PaymentAttempt.create({
    order: order._id,
    provider: 'click',
    transactionId: String(p.click_trans_id),
    amount: order.totalPrice,
    status: 'creating',
    createTime: new Date(),
  });

  return res.json({
    error: ClickError.Success,
    error_note: 'Success',
    click_trans_id: p.click_trans_id,
    merchant_trans_id: orderId,
    merchant_prepare_id: String(attempt._id),
  });
});

// ── Complete (action=1) — Click says: payment done ──
router.post('/complete', express.urlencoded({ extended: true }), express.json(), async function (req, res) {
  var p = req.body;
  logger.info('Click Complete', { body: p });

  // Verify signature
  if (!verifyClickSign(p)) {
    return res.json({ error: ClickError.SignFailed, error_note: 'Invalid sign' });
  }

  if (Number(p.action) !== 1) {
    return res.json({ error: ClickError.ActionNotFound, error_note: 'Invalid action' });
  }

  var prepareId = p.merchant_prepare_id;
  var orderId = p.merchant_trans_id;

  var attempt = await PaymentAttempt.findById(prepareId);
  if (!attempt) {
    return res.json({ error: ClickError.TransactionError, error_note: 'Prepare not found' });
  }

  if (attempt.status === 'paid') {
    return res.json({ error: ClickError.AlreadyPaid, error_note: 'Already completed' });
  }

  if (attempt.status === 'cancelled') {
    return res.json({ error: ClickError.TransactionCancelled, error_note: 'Cancelled' });
  }

  var order = await Order.findById(orderId);
  if (!order) {
    return res.json({ error: ClickError.OrderNotFound, error_note: 'Order not found' });
  }

  // Check if Click reports error (p.error < 0 means payment failed on Click side)
  if (Number(p.error) < 0) {
    attempt.status = 'cancelled';
    attempt.cancelTime = new Date();
    await attempt.save();
    return res.json({
      error: ClickError.TransactionCancelled,
      error_note: 'Payment failed on provider side',
    });
  }

  // Payment successful
  attempt.status = 'paid';
  attempt.performTime = new Date();
  attempt.providerTransactionId = String(p.click_paydoc_id || p.click_trans_id);
  await attempt.save();

  // Update order
  order.paymentStatus = 'paid';
  order.paymentMethod = 'online';
  order.paymentId = String(p.click_trans_id);
  order.paidAt = new Date();
  await order.save();

  logger.info('Click payment completed', { orderId: orderId, amount: order.totalPrice });

  // Notify via Telegram
  var { sendTelegramMessage } = require('../utils/telegram');
  var msg = '💳 <b>Оплата получена (Click)</b>\n\n' +
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

  return res.json({
    error: ClickError.Success,
    error_note: 'Success',
    click_trans_id: p.click_trans_id,
    merchant_trans_id: orderId,
    merchant_confirm_id: String(attempt._id),
  });
});

module.exports = router;
