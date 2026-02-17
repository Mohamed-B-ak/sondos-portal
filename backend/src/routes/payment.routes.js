// =====================================================
// Payment Routes — مسارات المدفوعات (Moyasar)
// =====================================================
const router = require('express').Router();
const { body } = require('express-validator');
const paymentCtrl = require('../controllers/payment.controller');
const { protect, adminOnly } = require('../middleware/auth');

// ── Public: Webhook (no auth — Moyasar calls this) ──
router.post('/webhook', paymentCtrl.webhook);

// ── Protected: Client routes ──
router.use(protect);

// Get payment config (publishable key + plans)
router.get('/config', paymentCtrl.getConfig);

// Create a new payment
router.post('/create', [
  body('type').isIn(['subscription', 'topup', 'one_time']).withMessage('نوع الدفع غير صالح'),
], paymentCtrl.createPayment);

// Verify payment after Moyasar redirect
router.post('/verify', [
  body('paymentId').notEmpty().withMessage('معرف الدفع مطلوب'),
  body('moyasarPaymentId').notEmpty().withMessage('معرف مُيسّر مطلوب'),
], paymentCtrl.verifyPayment);

// Payment history
router.get('/history', paymentCtrl.getHistory);

// Current subscription
router.get('/subscription', paymentCtrl.getSubscription);

// ── Admin routes ──
router.get('/admin/all', adminOnly, paymentCtrl.adminGetAll);
router.post('/admin/refund/:id', adminOnly, paymentCtrl.adminRefund);

module.exports = router;
