// =====================================================
// Rate Limiting Middleware — PRODUCTION READY
// =====================================================
const rateLimit = require('express-rate-limit');

// ── Login: 5 attempts per 15 min per IP ──
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'محاولات كثيرة — حاول مرة أخرى بعد 15 دقيقة'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Track by IP + email to prevent distributed attacks on single account
    const email = req.body?.email?.toLowerCase() || '';
    return `${req.ip}_${email}`;
  },
});

// ── Register: 3 attempts per hour per IP ──
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح — حاول مرة أخرى لاحقاً'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── General API: 100 requests per 15 min ──
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'طلبات كثيرة — حاول لاحقاً' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, registerLimiter, apiLimiter };