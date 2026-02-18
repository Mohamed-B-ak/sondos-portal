// =====================================================
// Public Controller — Endpoints خارجية للأنظمة المتصلة
// ─────────────────────────────────────────────────────
// هذه الـ endpoints لا تحتاج توكن مستخدم
// تعتمد على API Key للمصادقة
// =====================================================
const User = require('../models/User');

// ══════════════════════════════════════════════════════
// GET /api/public/automation-status
// ──────────────────────────────────────────────────────
// يُستخدم من الأنظمة الخارجية (n8n, make, custom)
// للتحقق من حالة الأتمتة قبل تنفيذ المكالمات
//
// المصادقة: X-API-Key header أو ?api_key query param
//
// Response:
// {
//   success: true,
//   automationEnabled: true/false,
//   user: { id, name, isActive }
// }
// ══════════════════════════════════════════════════════
exports.getAutomationStatus = async (req, res) => {
  try {
    // 1. استخراج API Key من الهيدر أو الكويري
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API Key مطلوب — أرسله في X-API-Key header أو api_key query parameter'
      });
    }

    // 2. البحث عن المستخدم بالـ API Key
    const user = await User.findOne({
      $or: [
        { sondosApiKey: apiKey },
        { api_key: apiKey }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'API Key غير صالح'
      });
    }

    // 3. التحقق من حالة الحساب
    if (!user.isActive) {
      return res.json({
        success: true,
        automationEnabled: false,
        reason: 'account_inactive',
        user: {
          id: user._id,
          name: user.name,
          isActive: false
        }
      });
    }

    // 4. إرجاع حالة الأتمتة
    res.json({
      success: true,
      automationEnabled: user.automationEnabled,
      user: {
        id: user._id,
        name: user.name,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('[Public Automation Status]', error.message);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};
