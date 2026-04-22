const { Telegraf, Markup } = require('telegraf');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');
const { botState } = require('../config/redis');
const { logger } = require('../config/logger');
var { getPaymeLink, getClickLink } = require('../utils/paymentLinks');

const STATES = {
  START: 'START',
  PHONE: 'PHONE',
  REVIEW: 'REVIEW',
  LOCATION: 'LOCATION',
  CONFIRM: 'CONFIRM',
  PAYMENT: 'PAYMENT',
  DONE: 'DONE',
};

function createBot() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    logger.warn('TELEGRAM_BOT_TOKEN not set — bot disabled');
    return null;
  }

  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  bot.catch(function (err, ctx) {
    logger.error('Bot error', { error: err.message });
    ctx.reply('Произошла ошибка. Попробуйте снова.').catch(function () { });
  });

  // ── /start TOKEN ─────────────────────────────────────
  bot.command('start', async function (ctx) {
    var token = ctx.message.text.split(' ')[1];

    if (!token) {
      return ctx.reply(
        '👋 Добро пожаловать в PneuMax!\n\nЧтобы сделать заказ, перейдите на сайт.',
        Markup.inlineKeyboard([
          Markup.button.url('🛒 Перейти на сайт', process.env.SITE_URL || 'https://pneumax.uz'),
        ])
      );
    }

    try {
      var order = await Order.findOne({ deepLinkToken: token });
      if (!order) {
        return ctx.reply('❌ Заказ не найден или ссылка устарела.');
      }
      if (!order.isTokenValid()) {
        return ctx.reply('⏰ Ссылка истекла (24 часа). Создайте новый заказ на сайте.');
      }
      if (order.status === 'completed' || order.paymentStatus === 'paid') {
        return ctx.reply('✅ Этот заказ уже обработан. Спасибо!');
      }

      order.telegramId = String(ctx.from.id);
      await order.save();

      await botState.setState(ctx.from.id, {
        state: STATES.START,
        orderId: String(order._id),
        token: token,
      });

      var items = await OrderItem.find({ order: order._id });
      var lines = items.map(function (i) {
        return '• ' + i.name + ' x' + i.quantity + ' — ' + i.price.toLocaleString() + ' сум';
      });

      await ctx.reply(
        '👋 Здравствуйте, ' + (ctx.from.first_name || '') + '!\n\n' +
        '📦 Ваш заказ с сайта:\n' + lines.join('\n') + '\n\n' +
        '💰 Итого: ' + order.totalPrice.toLocaleString() + ' сум\n\n' +
        'Нажмите кнопку ниже, чтобы начать оформление.',
        Markup.inlineKeyboard([
          [Markup.button.callback('🚀 Начать оформление', 'begin')],
        ])
      );
    } catch (err) {
      logger.error('start error', { error: err.message });
      ctx.reply('Ошибка. Попробуйте снова.');
    }
  });

  // ── 2.1 Begin → ask phone ───────────────────────────
  bot.action('begin', async function (ctx) {
    await ctx.answerCbQuery();
    var s = await botState.getState(ctx.from.id);
    if (!s) return ctx.reply('Сессия истекла. Начните с сайта.');

    await botState.setState(ctx.from.id, { ...s, state: STATES.PHONE });

    await ctx.reply(
      '📱 Шаг 1/4 — Телефон\n\nПоделитесь номером, нажав кнопку ниже.\n⚠️ Номер нельзя будет изменить позже.',
      Markup.keyboard([
        [Markup.button.contactRequest('📞 Отправить контакт')],
        ['❌ Отменить заказ'],
      ]).oneTime().resize()
    );
  });

  // ── 2.2 Phone handler ───────────────────────────────
  bot.on('contact', async function (ctx) {
    var s = await botState.getState(ctx.from.id);
    if (!s || s.state !== STATES.PHONE) return;

    var phone = ctx.message.contact.phone_number;
    var order = await Order.findById(s.orderId);
    if (!order) return ctx.reply('Заказ не найден.');

    order.customerPhone = phone;
    await order.save();

    await User.findOneAndUpdate(
      { telegramId: String(ctx.from.id) },
      { phone: phone, telegramUsername: ctx.from.username || '' },
      { upsert: false }
    );

    await botState.setState(ctx.from.id, { ...s, state: STATES.REVIEW, phone: phone });

    var items = await OrderItem.find({ order: order._id });
    var lines = items.map(function (i) {
      return '• ' + i.name + ' x' + i.quantity;
    });

    await ctx.reply(
      '✅ Номер сохранён: ' + phone + '\n\n' +
      '📋 Шаг 2/4 — Ваш заказ:\n' + lines.join('\n') + '\n' +
      '📍 Адрес: ' + (order.address || '—') + '\n' +
      '🏘️ Район: ' + (order.district || '—') + '\n\n' +
      '💰 Итого: ' + order.totalPrice.toLocaleString() + ' сум',
      Markup.inlineKeyboard([
        [Markup.button.callback('📍 Продолжить → Геолокация', 'ask_location')],
      ])
    );
  });

  // ── 2.4 Ask location ────────────────────────────────
  bot.action('ask_location', async function (ctx) {
    await ctx.answerCbQuery();
    var s = await botState.getState(ctx.from.id);
    if (!s) return;

    await botState.setState(ctx.from.id, { ...s, state: STATES.LOCATION });

    await ctx.reply(
      '📍 Шаг 3/4 — Геолокация\n\nОтправьте свою геопозицию для доставки.',
      Markup.keyboard([
        [Markup.button.locationRequest('📍 Отправить геопозицию')],
        ['❌ Отменить заказ'],
      ]).oneTime().resize()
    );
  });

  // ── Location handler ────────────────────────────────
  bot.on('location', async function (ctx) {
    var s = await botState.getState(ctx.from.id);
    if (!s || !s.orderId) return;

    var lat = ctx.message.location.latitude;
    var lon = ctx.message.location.longitude;

    var order = await Order.findById(s.orderId);
    if (!order) return ctx.reply('Заказ не найден.');

    order.latitude = lat;
    order.longitude = lon;
    await order.save();

    await botState.setState(ctx.from.id, { ...s, state: STATES.CONFIRM });

    // show confirmation
    var items = await OrderItem.find({ order: order._id });
    var lines = items.map(function (i) {
      return '• ' + i.name + ' x' + i.quantity + ' = ' + (i.price * i.quantity).toLocaleString() + ' сум';
    });
    var map = 'https://maps.google.com/?q=' + lat + ',' + lon;

    await ctx.reply(
      '📋 Шаг 4/4 — Подтверждение\n\n' +
      '👤 Имя: ' + (order.customerName || '—') + '\n' +
      '📱 Тел: ' + order.customerPhone + '\n' +
      '📍 Адрес: ' + (order.address || '—') + '\n' +
      '🏘️ Район: ' + (order.district || '—') + '\n' +
      '🗺️ Карта: ' + map + '\n\n' +
      '🛒 Товары:\n' + lines.join('\n') + '\n\n' +
      '💰 Итого: ' + order.totalPrice.toLocaleString() + ' сум',
      Markup.inlineKeyboard([
        [Markup.button.callback('✅ Подтвердить', 'confirm')],
        [Markup.button.callback('📍 Изменить геолокацию', 'change_loc')],
        [Markup.button.callback('❌ Отменить', 'cancel')],
      ])
    );
  });

  // ── Change location ─────────────────────────────────
  bot.action('change_loc', async function (ctx) {
    await ctx.answerCbQuery();
    var s = await botState.getState(ctx.from.id);
    if (!s) return;

    await botState.setState(ctx.from.id, { ...s, state: STATES.LOCATION });

    await ctx.reply(
      '📍 Отправьте новую геолокацию.',
      Markup.keyboard([
        [Markup.button.locationRequest('📍 Отправить новую')],
      ]).oneTime().resize()
    );
  });

  // ── 2.5 Confirm order ──────────────────────────────
  bot.action('confirm', async function (ctx) {
    await ctx.answerCbQuery();
    var s = await botState.getState(ctx.from.id);
    if (!s) return ctx.reply('Сессия истекла.');

    var order = await Order.findById(s.orderId);
    if (!order) return ctx.reply('Заказ не найден.');

    if (!order.latitude) {
      return ctx.reply('⚠️ Сначала отправьте геолокацию.',
        Markup.inlineKeyboard([[Markup.button.callback('📍 Отправить', 'change_loc')]]));
    }

    order.status = 'processing';
    await order.save();

    await botState.setState(ctx.from.id, { ...s, state: STATES.PAYMENT });

    var paymeUrl = getPaymeLink(String(order._id), order.totalPrice);
    var clickUrl = getClickLink(String(order._id), order.totalPrice);

    await ctx.reply(
      '💳 Выберите способ оплаты:\n\n💰 Сумма: ' + order.totalPrice.toLocaleString() + ' сум',
      Markup.inlineKeyboard([
        [Markup.button.url('� Payme', paymeUrl)],
        [Markup.button.url('🟢 Click', clickUrl)],
        [Markup.button.callback('💵 Наличные при доставке', 'pay_cash')],
      ])
    );

    // notify admin group
    await notifyAdmin(bot, order, ctx.from);
  });

  // ── 2.7 Payment — cash ─────────────────────────────
  bot.action('pay_cash', async function (ctx) {
    await ctx.answerCbQuery();
    await finishOrder(bot, ctx, 'cash');
  });

  // ── 2.8 Finish order ───────────────────────────────
  async function finishOrder(botInstance, ctx, method) {
    var s = await botState.getState(ctx.from.id);
    if (!s) return;

    var order = await Order.findById(s.orderId);
    if (!order) return;

    order.paymentMethod = method;
    order.paymentStatus = method === 'cash' ? 'pending' : 'paid';
    if (method !== 'cash') order.paidAt = new Date();
    await order.save();

    await botState.setState(ctx.from.id, { ...s, state: STATES.DONE });

    await ctx.reply(
      '🎉 Заказ принят!\n\n' +
      '📦 Номер заказа: ' + order._id + '\n' +
      '💳 Оплата: ' + method.toUpperCase() + '\n\n' +
      '⏰ Время доставки будет сообщено администратором.\n\n' +
      'Спасибо за покупку в PneuMax!',
      Markup.removeKeyboard()
    );

    // update admin
    await updateAdmin(botInstance, order);

    setTimeout(function () {
      botState.deleteState(ctx.from.id);
    }, 3600000);
  }

  // ── Cancel ──────────────────────────────────────────
  bot.action('cancel', async function (ctx) {
    await ctx.answerCbQuery('Отменено');
    var s = await botState.getState(ctx.from.id);
    if (s && s.orderId) {
      await Order.findByIdAndUpdate(s.orderId, { status: 'cancelled' });
    }
    await botState.deleteState(ctx.from.id);
    await ctx.reply('❌ Заказ отменён.', Markup.removeKeyboard());
  });

  bot.hears('❌ Отменить заказ', async function (ctx) {
    var s = await botState.getState(ctx.from.id);
    if (s && s.orderId) {
      await Order.findByIdAndUpdate(s.orderId, { status: 'cancelled' });
    }
    await botState.deleteState(ctx.from.id);
    await ctx.reply('Заказ отменён.', Markup.removeKeyboard());
  });

  // ── 3. Admin group notification ─────────────────────
  async function notifyAdmin(botInstance, order, from) {
    var groupId = process.env.TELEGRAM_ADMIN_GROUP;
    if (!groupId) return;

    var items = await OrderItem.find({ order: order._id });
    var lines = items.map(function (i) {
      return '• ' + i.name + ' x' + i.quantity + ' = ' + (i.price * i.quantity).toLocaleString() + ' сум';
    });
    var map = (order.latitude && order.longitude)
      ? 'https://maps.google.com/?q=' + order.latitude + ',' + order.longitude
      : '—';

    var premiumBadge = order.isPremiumOrder ? '👑 *PREMIUM* ' : '';
    var payMethod = { cash: '💵 Наличные', payme: '💳 Payme', click: '💳 Click' }[order.paymentMethod] || '—';
    var msg =
      '🔔 ' + premiumBadge + '*Новый заказ!*\n\n' +
      '🆔 ID: `' + order._id + '`\n' +
      '👤 Имя: ' + (order.customerName || from.first_name || '—') + '\n' +
      '📱 Тел: ' + (order.customerPhone || '—') + '\n' +
      '📍 Адрес: ' + (order.address || '—') + '\n' +
      '🏘️ Район: ' + (order.district || '—') + '\n' +
      '🗺️ Карта: ' + map + '\n' +
      '💳 Оплата: ' + payMethod + '\n\n' +
      '🛒 *Товары:*\n' + lines.join('\n') + '\n\n' +
      '💰 *Итого: ' + order.totalPrice.toLocaleString() + ' сум*';

    var adminButtons = [[{ text: '✅ Подтвердить', callback_data: 'adm_confirm_' + order._id }]];
    if (order.customerPhone) {
      adminButtons[0].push({ text: '� Позвонить', url: 'tel:' + order.customerPhone });
    }
    if (process.env.ADMIN_PANEL_URL) {
      adminButtons.push([{ text: '🔗 Открыть в панели', url: process.env.ADMIN_PANEL_URL + '/admin/orders/' + order._id }]);
    }

    try {
      await botInstance.telegram.sendMessage(groupId, msg, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: adminButtons },
      });
    } catch (e) {
      logger.error('Admin notify error', { error: e.message });
    }
  }

  async function updateAdmin(botInstance, order) {
    var groupId = process.env.TELEGRAM_ADMIN_GROUP;
    if (!groupId) return;

    var payStatus = {
      paid: '✅ Оплачено',
      pending: '⏳ Ожидает',
      refunded: '↩️ Возврат',
      cash: '💵 Наличные',
    }[order.paymentStatus] || order.paymentStatus;
    var msg =
      '✅ *Заказ подтверждён клиентом*\n\n' +
      '🆔 `' + order._id + '`\n' +
      '👤 ' + (order.customerName || '—') + '\n' +
      '💰 *' + order.totalPrice.toLocaleString() + ' сум*\n' +
      '💳 ' + payStatus + '\n' +
      '💬 ' + (order.paymentMethod || '—').toUpperCase();

    try {
      await botInstance.telegram.sendMessage(groupId, msg, { parse_mode: 'Markdown' });
    } catch (e) {
      logger.error('Admin update error', { error: e.message });
    }
  }

  // ── 4. Admin confirm from group ─────────────────────
  bot.action(/^adm_confirm_(.+)$/, async function (ctx) {
    var orderId = ctx.match[1];
    var adminIds = (process.env.TELEGRAM_ADMIN_IDS || '').split(',');
    if (!adminIds.includes(String(ctx.from.id))) {
      return ctx.answerCbQuery('❌ Нет доступа');
    }

    await ctx.answerCbQuery('Открываю...');
    await ctx.reply(
      'Подтвердить заказ ' + orderId + '\nОтветьте временем доставки (например: 2026-04-20 14:00):',
      Markup.forceReply()
    );
    await botState.setState(ctx.from.id, { action: 'ADM_CONFIRM', orderId: orderId }, 300);
  });

  // Admin text handler (delivery time)
  bot.on('text', async function (ctx) {
    var s = await botState.getState(ctx.from.id);
    if (!s || s.action !== 'ADM_CONFIRM') return;

    var dt = new Date(ctx.message.text);
    if (isNaN(dt.getTime())) {
      return ctx.reply('❌ Неверный формат. Используйте: YYYY-MM-DD HH:MM');
    }

    var order = await Order.findByIdAndUpdate(s.orderId, {
      status: 'confirmed',
      deliveryTime: dt,
      confirmedAt: new Date(),
    }, { new: true });

    if (order && order.telegramId) {
      try {
        await bot.telegram.sendMessage(order.telegramId,
          '✅ Ваш заказ подтверждён!\n\n' +
          '📦 ' + order._id + '\n' +
          '📅 Доставка: ' + dt.toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' }) + '\n\n' +
          'Спасибо!'
        );
      } catch (e) {
        logger.error('Customer notify error', { error: e.message });
      }
    }

    await ctx.reply('✅ Заказ ' + order._id + ' подтверждён.\n📅 Доставка: ' + dt.toLocaleString());
    await botState.deleteState(ctx.from.id);
  });

  return bot;
}

module.exports = { createBot };
