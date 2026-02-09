// =====================================================
// Auth Routes — Login, Register, Refresh, Logout
// =====================================================
const router = require('express').Router();
const { body } = require('express-validator');
const authCtrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

// ── Public routes ──

router.post('/register', [
  body('name').trim().notEmpty().withMessage('الاسم مطلوب'),
  body('email').isEmail().withMessage('البريد الإلكتروني غير صالح'),
  body('phone').trim().notEmpty().withMessage('رقم الجوال مطلوب'),
  body('password').isLength({ min: 8 }).withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
], authCtrl.register);

router.post('/login', [
  body('email').isEmail().withMessage('البريد الإلكتروني غير صالح'),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة')
], authCtrl.login);

// ✅ NEW: Refresh access token (no auth needed, uses refresh token in body)
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token مطلوب')
], authCtrl.refresh);

// ✅ NEW: Logout (blacklist refresh token)
router.post('/logout', authCtrl.logout);

// ── Protected routes ──

router.get('/me', protect, authCtrl.me);

module.exports = router;