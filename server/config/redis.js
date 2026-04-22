const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

// Bot state management helpers
const botState = {
  // Set user state with TTL (default 24 hours)
  async setState(telegramId, state, ttl = 86400) {
    const key = `bot:state:${telegramId}`;
    await redis.setex(key, ttl, JSON.stringify(state));
  },

  // Get user state
  async getState(telegramId) {
    const key = `bot:state:${telegramId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  // Delete user state
  async deleteState(telegramId) {
    const key = `bot:state:${telegramId}`;
    await redis.del(key);
  },

  // Store temporary order data during bot flow
  async setTempOrder(telegramId, orderData, ttl = 3600) {
    const key = `bot:temp_order:${telegramId}`;
    await redis.setex(key, ttl, JSON.stringify(orderData));
  },

  // Get temporary order data
  async getTempOrder(telegramId) {
    const key = `bot:temp_order:${telegramId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  // Store deep link token to order mapping
  async setToken(token, orderId, ttl = 86400) {
    const key = `token:${token}`;
    await redis.setex(key, ttl, orderId.toString());
  },

  // Get order ID by token
  async getToken(token) {
    const key = `token:${token}`;
    return await redis.get(key);
  },

  // Delete token
  async deleteToken(token) {
    const key = `token:${token}`;
    await redis.del(key);
  },
};

module.exports = { redis, botState };
