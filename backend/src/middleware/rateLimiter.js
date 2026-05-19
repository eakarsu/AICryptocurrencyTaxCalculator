const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

// 20 AI calls per hour per user
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req, res) => req.userId ? String(req.userId) : ipKeyGenerator(req, res),
  message: { error: 'Too many AI requests. Limit is 20 per hour per user.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter: 100 requests per 15 minutes
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req, res) => req.userId ? String(req.userId) : ipKeyGenerator(req, res),
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { aiRateLimiter, apiRateLimiter };
