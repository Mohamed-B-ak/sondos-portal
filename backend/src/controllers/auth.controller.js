const { validationResult } = require('express-validator');
const User = require('../models/User');
const Notification = require('../models/Notification');
const TokenBlacklist = require('../models/TokenBlacklist');
const { generateTokenPair, verifyRefreshToken, generateAccessToken } = require('../utils/token');
const { registerOnAutoCalls, setupClientWithPlan } = require('../utils/autocalls');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { name, email, phone, company, timezone, password, planId } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مسجل مسبقاً'
      });
    }

    let sondosApiKey = '';

    if (planId) {
      try {
        const setupResult = await setupClientWithPlan({
          name,
          email: email.toLowerCase(),
          password,
          timezone: timezone || 'Asia/Riyadh',
          planId,
        });
        sondosApiKey = setupResult.apiKey;
      } catch (setupError) {
        const errorMsg = setupError.name === 'AbortError'
          ? 'انتهت مهلة إعداد الحساب - حاول مرة أخرى'
          : 'فشل في إعداد الحساب مع الخطة: ' + setupError.message;
        return res.status(500).json({ success: false, message: errorMsg });
      }
    } else {
      try {
        const autoCallsResult = await registerOnAutoCalls({
          name,
          email: email.toLowerCase(),
          password,
          timezone: timezone || 'Asia/Riyadh',
        });
        sondosApiKey = autoCallsResult.apiKey;
      } catch (autoCallsError) {
        return res.status(500).json({
          success: false,
          message: 'فشل في إنشاء الحساب على منصة المكالمات: ' + autoCallsError.message
        });
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      company: company || '',
      timezone: timezone || 'Asia/Riyadh',
      password,
      role: 'client',
      planId: planId || null,
      sondosApiKey,
      api_key: sondosApiKey,
    });

    try {
      await Notification.create({
        userId: user._id,
        title: 'مرحباً بك في Sondos AI! 🎉',
        message: planId
          ? 'تم إنشاء حسابك وتفعيل الخطة بنجاح. المساعد الذكي جاهز للعمل.'
          : 'تم إنشاء حسابك بنجاح. يمكنك الآن إعداد المساعد الذكي الخاص بك.',
        type: 'success'
      });
    } catch (_) { /* non-blocking */ }

    const tokens = generateTokenPair(user._id);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: {
        user: user.toPublicJSON(),
        token: tokens.accessToken,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'الحساب معطل - تواصل مع الدعم' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    try {
      await Notification.create({
        userId: user._id,
        title: 'تسجيل دخول جديد 🔐',
        message: `تم تسجيل الدخول بنجاح - ${new Date().toLocaleString('ar-SA', { timeZone: user.timezone || 'Asia/Riyadh' })}`,
        type: 'info'
      });
    } catch (_) { /* silent */ }

    const tokens = generateTokenPair(user._id);

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        user: user.toPublicJSON(),
        token: tokens.accessToken,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token مطلوب' });
    }

    const isBlacklisted = await TokenBlacklist.isBlacklisted(refreshToken);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: 'التوكن ملغي — يرجى تسجيل الدخول' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Refresh token غير صالح أو منتهي' });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ success: false, message: 'نوع التوكن غير صالح' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'المستخدم غير موجود أو الحساب معطل' });
    }

    if (user.tokenVersion && decoded.iat) {
      const tokenIssuedAt = decoded.iat * 1000;
      if (tokenIssuedAt < user.tokenVersion) {
        return res.status(401).json({ success: false, message: 'تم تغيير كلمة المرور — يرجى تسجيل الدخول' });
      }
    }

    const newAccessToken = generateAccessToken(user._id);

    res.json({
      success: true,
      data: { token: newAccessToken, accessToken: newAccessToken }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await TokenBlacklist.revokeToken(refreshToken, decoded.id, 'logout');
      } catch (_) { /* token expired or invalid — still logged out */ }
    }

    res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};