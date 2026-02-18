const { validationResult } = require('express-validator');
const User = require('../models/User');

// GET /api/user/sondos-key — returns status only, NEVER the actual key
exports.getSondosKey = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const apiKey = user.sondosApiKey || user.api_key || '';
    const hasKey = !!apiKey && apiKey.length > 0;
    const masked = apiKey.length > 8
      ? apiKey.substring(0, 4) + '••••' + apiKey.substring(apiKey.length - 4)
      : apiKey ? '••••••••' : '';

    res.json({
      success: true,
      data: {
        hasKey,
        maskedKey: masked,
        // ⛔ apiKey is NEVER sent to frontend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

// PUT /api/user/sondos-key
exports.updateSondosKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    const user = await User.findById(req.user._id);
    user.sondosApiKey = apiKey;
    user.api_key = apiKey;
    await user.save();
    res.json({ success: true, message: 'تم حفظ مفتاح Sondos API بنجاح', data: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

// PUT /api/user/profile
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, phone, company, timezone, avatar, settings } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (company !== undefined) user.company = company;
    if (timezone) user.timezone = timezone;
    if (avatar !== undefined) user.avatar = avatar;
    if (settings) user.settings = { ...user.settings, ...settings };

    await user.save();
    res.json({ success: true, message: 'تم تحديث البيانات بنجاح', data: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

// PUT /api/user/password
exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

// ══════════════════════════════════════════════════════
// PUT /api/user/automation — تفعيل/إيقاف الأتمتة
// ══════════════════════════════════════════════════════
exports.updateAutomation = async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'يرجى إرسال قيمة صحيحة (true أو false)'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { automationEnabled: enabled },
      { new: true }
    );

    res.json({
      success: true,
      message: enabled ? 'تم تفعيل الأتمتة بنجاح' : 'تم إيقاف الأتمتة بنجاح',
      data: {
        automationEnabled: user.automationEnabled
      }
    });
  } catch (error) {
    console.error('[Update Automation]', error.message);
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

// GET /api/user/automation — جلب حالة الأتمتة (محمي)
exports.getAutomation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: {
        automationEnabled: user.automationEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};