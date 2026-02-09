// =====================================================
// Sondos API Proxy Routes
// ─────────────────────────────────────────────────────
// /api/sondos/* → https://app.sondos-ai.com/api/*
// Requires authentication. API key read from DB.
// =====================================================
const router = require('express').Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const sondosCtrl = require('../controllers/sondos.controller');

// Multer: store files in memory for proxying
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// All routes require authentication
router.use(protect);

// ── Validate API key (test only, no save) ──
router.post('/validate-key', sondosCtrl.validateKey);

// ── File upload routes (MUST be before the catch-all) ──
router.post('/user/ai/stt', upload.single('audio'), sondosCtrl.proxyUpload);
router.post('/user/leads/import', upload.single('file'), sondosCtrl.proxyUpload);
router.post('/user/knowledgebases/*/documents', upload.single('file'), sondosCtrl.proxyUpload);
router.post('/user/knowledgebases/*/files', upload.single('file'), sondosCtrl.proxyUpload);

// ── Catch-all: forward everything else as JSON ──
router.all('/*', sondosCtrl.proxyJSON);

module.exports = router;
