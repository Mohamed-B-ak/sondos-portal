// =====================================================
// Public Routes — مسارات عامة للأنظمة الخارجية
// ─────────────────────────────────────────────────────
// لا تحتاج توكن مستخدم — تعتمد على API Key
// =====================================================
const router = require('express').Router();
const publicCtrl = require('../controllers/public.controller');

// GET /api/public/automation-status
// التحقق من حالة الأتمتة — للأنظمة الخارجية
router.get('/automation-status', publicCtrl.getAutomationStatus);

module.exports = router;
