// =====================================================
// Auth Routes — Login, Register, Refresh, Logout
// =====================================================
const router = require('express').Router();
const { body } = require('express-validator');
const authCtrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

// ── Validation rules ──
const registerValidation = [
  body('name').trim().notEmpty().withMessage('الاسم مطلوب'),
  body('email').isEmail().withMessage('البريد الإلكتروني غير صالح'),
  body('phone').trim().notEmpty().withMessage('رقم الجوال مطلوب'),
  body('password').isLength({ min: 8 }).withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
];

// ── Public routes ──

// Register WITHOUT payment (skip plan)
router.post('/register', registerValidation, authCtrl.register);

// Register WITH payment (pay first → then create account)
router.post('/register-with-payment', [
  ...registerValidation,
  body('planId').notEmpty().withMessage('الباقة مطلوبة'),
  body('moyasarPaymentId').notEmpty().withMessage('معرف الدفع مطلوب'),
], authCtrl.registerWithPayment);

router.post('/login', [
  body('email').isEmail().withMessage('البريد الإلكتروني غير صالح'),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة')
], authCtrl.login);

router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token مطلوب')
], authCtrl.refresh);

router.post('/logout', authCtrl.logout);

// ── Protected routes ──

router.get('/me', protect, authCtrl.me);

module.exports = router;