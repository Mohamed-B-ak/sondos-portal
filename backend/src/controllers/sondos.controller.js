// =====================================================
// Sondos API Proxy Controller
// ─────────────────────────────────────────────────────
// All Sondos API requests go through Backend.
// Frontend NEVER touches app.sondos-ai.com directly.
// API Key stays server-side only.
// =====================================================
const User = require('../models/User');

const SONDOS_API_BASE = 'https://app.sondos-ai.com/api';

// ── Helper: Get user's Sondos API key from DB ──
async function getUserApiKey(userId) {
  const user = await User.findById(userId).select('+sondosApiKey +api_key');
  if (!user) return null;
  return user.sondosApiKey || user.api_key || null;
}

// ── Helper: Extract target path from request ──
function getTargetUrl(req) {
  const path = req.originalUrl.replace(/^\/api\/sondos\//, '').split('?')[0];
  const queryString = Object.keys(req.query).length
    ? '?' + new URLSearchParams(req.query).toString()
    : '';
  return `${SONDOS_API_BASE}/${path}${queryString}`;
}

// ══════════════════════════════════════════════════════
// JSON Proxy — handles GET, POST, PUT, PATCH, DELETE
// ══════════════════════════════════════════════════════
exports.proxyJSON = async (req, res) => {
  try {
    const apiKey = await getUserApiKey(req.user._id);
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'مفتاح Sondos API غير موجود. يرجى إضافة المفتاح في الإعدادات.',
      });
    }

    const targetUrl = getTargetUrl(req);

    const fetchOptions = {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    if (!['GET', 'HEAD'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);

    if (response.status === 204) return res.status(204).end();

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('[Sondos Proxy]', req.method, req.originalUrl, error.message);
    return res.status(502).json({
      success: false,
      message: 'فشل الاتصال بمنصة Sondos AI',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

// ══════════════════════════════════════════════════════
// File Upload Proxy — handles multipart/form-data
// Used for: STT audio, leads CSV import, KB documents/files
// ══════════════════════════════════════════════════════
exports.proxyUpload = async (req, res) => {
  try {
    const apiKey = await getUserApiKey(req.user._id);
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'مفتاح Sondos API غير موجود.',
      });
    }

    // If no file was uploaded, treat as JSON request (e.g. website document creation)
    if (!req.file && !(req.files && req.files.length)) {
      return exports.proxyJSON(req, res);
    }

    const targetUrl = getTargetUrl(req);

    // Build FormData using Node 18+ native FormData
    const formData = new FormData();

    // Add text fields from multer-parsed body
    if (req.body) {
      for (const [key, value] of Object.entries(req.body)) {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      }
    }

    // Add single file
    if (req.file) {
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      formData.append(req.file.fieldname, blob, req.file.originalname);
    }

    // Add multiple files
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append(file.fieldname, blob, file.originalname);
      }
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        // Content-Type is set automatically by fetch with correct boundary
      },
      body: formData,
    });

    if (response.status === 204) return res.status(204).end();

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('[Sondos Upload Proxy]', req.originalUrl, error.message);
    return res.status(502).json({
      success: false,
      message: 'فشل رفع الملف إلى منصة Sondos AI',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

// ══════════════════════════════════════════════════════
// Validate API Key (test without saving to DB)
// ══════════════════════════════════════════════════════
exports.validateKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ success: false, message: 'مفتاح API مطلوب' });
    }

    const response = await fetch(`${SONDOS_API_BASE}/user/me`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return res.json({ success: true, valid: true, user: data });
    }

    return res.json({ success: true, valid: false, message: 'مفتاح API غير صالح' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'فشل التحقق من المفتاح' });
  }
};
