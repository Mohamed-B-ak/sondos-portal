const { validationResult } = require('express-validator');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const TokenBlacklist = require('../models/TokenBlacklist');
const { generateTokenPair, verifyRefreshToken, generateAccessToken } = require('../utils/token');
const { registerOnAutoCalls, setupClientWithPlan } = require('../utils/autocalls');
const moyasar = require('../utils/moyasar');

// Map plan slug → external service plan code
const SLUG_TO_PLAN_CODE = {
  'bronze': 'PLN-001',
  'silver': 'PLN-002',
  'gold': 'PLN-003',
};

// ══════════════════════════════════════════════════════
// POST /api/auth/register-with-payment
// Flow: Verify Moyasar payment → Create user → Call siyadah → Link payment
// ══════════════════════════════════════════════════════
exports.registerWithPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { name, email, phone, company, timezone, password, planId, moyasarPaymentId } = req.body;

    if (!planId || !moyasarPaymentId) {
      return res.status(400).json({ success: false, message: 'بيانات الدفع والباقة مطلوبة' });
    }

    // ── 1. Check duplicate email ──
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني مسجل مسبقاً' });
    }

    // ── 2. Look up plan from DB ──
    let plan = null;
    if (planId.match(/^[0-9a-fA-F]{24}$/)) {
      plan = await Plan.findById(planId);
    }
    if (!plan) plan = await Plan.findOne({ planCode: planId });
    if (!plan) plan = await Plan.findOne({ slug: planId });
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'الباقة غير متاحة' });
    }

    // ── 3. Verify Moyasar payment ──
    let moyasarPayment;
    try {
      moyasarPayment = await moyasar.fetchPayment(moyasarPaymentId);
      console.log(`[RegisterWithPayment] Moyasar status: ${moyasarPayment.status}, amount: ${moyasarPayment.amount}`);
    } catch (err) {
      console.error('[RegisterWithPayment] Moyasar verify failed:', err.message);
      return res.status(400).json({ success: false, message: 'فشل التحقق من عملية الدفع' });
    }

    if (moyasarPayment.status !== 'paid') {
      return res.status(400).json({ success: false, message: `الدفع غير مكتمل - الحالة: ${moyasarPayment.status}` });
    }

    // Check payment hasn't been used before
    const existingPayment = await Payment.findOne({ moyasarPaymentId });
    if (existingPayment) {
      return res.status(400).json({ success: false, message: 'عملية الدفع مستخدمة مسبقاً' });
    }

    // ── 4. Create user on external service (siyadah) ──
    const resolvedPlanCode = plan.planCode || SLUG_TO_PLAN_CODE[plan.slug] || 'PLN-001';
    let sondosApiKey = '';

    try {
      console.log(`[RegisterWithPayment] Calling siyadah with plan_id: ${resolvedPlanCode}`);
      const setupResult = await setupClientWithPlan({
        name,
        email: email.toLowerCase(),
        password,
        timezone: timezone || 'Asia/Riyadh',
        planId: resolvedPlanCode,
      });
      sondosApiKey = setupResult.apiKey;
    } catch (setupError) {
      console.error('[RegisterWithPayment] Siyadah failed:', setupError.message);
      const errorMsg = setupError.name === 'AbortError'
        ? 'انتهت مهلة إعداد الحساب - تم استلام الدفع وسيتم التفعيل يدوياً'
        : 'فشل في إعداد الحساب - تم استلام الدفع وسيتم التفعيل يدوياً: ' + setupError.message;
      return res.status(500).json({ success: false, message: errorMsg });
    }

    // ── 5. Create user in our DB ──
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      company: company || '',
      timezone: timezone || 'Asia/Riyadh',
      password,
      role: 'client',
      planId: plan._id,
      sondosApiKey,
      api_key: sondosApiKey,
    });

    // ── 6. Create Payment record ──
    const payment = await Payment.create({
      user: user._id,
      plan: plan._id,
      moyasarPaymentId,
      amountHalala: plan.priceHalala,
      amountDisplay: plan.priceDisplay,
      currency: 'SAR',
      status: 'paid',
      type: 'subscription',
      description: `اشتراك ${plan.name} - سندس AI`,
      paidAt: new Date(),
      source: {
        type: moyasarPayment.source?.type || 'creditcard',
        company: moyasarPayment.source?.company || '',
        name: moyasarPayment.source?.name || '',
        number: moyasarPayment.source?.number || '',
      },
      metadata: {
        planName: plan.name,
        userName: name,
        userEmail: email.toLowerCase(),
        registrationType: 'register-with-payment',
      },
    });

    // ── 7. Create Subscription ──
    const endDate = new Date();
    switch (plan.period) {
      case 'monthly': endDate.setMonth(endDate.getMonth() + 1); break;
      case 'quarterly': endDate.setMonth(endDate.getMonth() + 3); break;
      case 'yearly': endDate.setFullYear(endDate.getFullYear() + 1); break;
      case 'one_time': endDate.setFullYear(endDate.getFullYear() + 99); break;
    }

    await Subscription.create({
      user: user._id,
      plan: plan._id,
      lastPayment: payment._id,
      status: 'active',
      startDate: new Date(),
      endDate,
      renewalCount: 1,
    });

    // ── 8. Welcome notification ──
    try {
      await Notification.create({
        userId: user._id,
        title: 'مرحباً بك في Sondos AI! 🎉',
        message: `تم إنشاء حسابك وتفعيل ${plan.name} بنجاح. المساعد الذكي جاهز للعمل.`,
        type: 'success'
      });
    } catch (_) {}

    // ── 9. Return tokens ──
    const tokens = generateTokenPair(user._id);
    console.log(`[RegisterWithPayment] ✅ Success: ${email} → ${plan.name} (${resolvedPlanCode})`);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب وتفعيل الاشتراك بنجاح',
      data: {
        user: user.toPublicJSON(),
        token: tokens.accessToken,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }
    });
  } catch (error) {
    console.error('[RegisterWithPayment] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ══════════════════════════════════════════════════════
// POST /api/auth/register (original — without payment, skip plan)
// ══════════════════════════════════════════════════════
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { name, email, phone, company, timezone, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني مسجل مسبقاً' });
    }

    let sondosApiKey = '';
    try {
      const autoCallsResult = await registerOnAutoCalls({
        name, email: email.toLowerCase(), password, timezone: timezone || 'Asia/Riyadh',
      });
      sondosApiKey = autoCallsResult.apiKey;
    } catch (autoCallsError) {
      return res.status(500).json({
        success: false,
        message: 'فشل في إنشاء الحساب على منصة المكالمات: ' + autoCallsError.message
      });
    }

    const user = await User.create({
      name, email: email.toLowerCase(), phone, company: company || '',
      timezone: timezone || 'Asia/Riyadh', password, role: 'client',
      planId: null, sondosApiKey, api_key: sondosApiKey,
    });

    try {
      await Notification.create({
        userId: user._id,
        title: 'مرحباً بك في Sondos AI! 🎉',
        message: 'تم إنشاء حسابك بنجاح. يمكنك الآن إعداد المساعد الذكي الخاص بك.',
        type: 'success'
      });
    } catch (_) {}

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
      success: false, message: 'حدث خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'الحساب معطل - تواصل مع الدعم' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    try {
      await Notification.create({
        userId: user._id,
        title: 'تسجيل دخول جديد 🔐',
        message: `تم تسجيل الدخول بنجاح - ${new Date().toLocaleString('ar-SA', { timeZone: user.timezone || 'Asia/Riyadh' })}`,
        type: 'info'
      });
    } catch (_) {}

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
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token مطلوب' });

    const isBlacklisted = await TokenBlacklist.isBlacklisted(refreshToken);
    if (isBlacklisted) return res.status(401).json({ success: false, message: 'التوكن ملغي — يرجى تسجيل الدخول' });

    let decoded;
    try { decoded = verifyRefreshToken(refreshToken); }
    catch (error) { return res.status(401).json({ success: false, message: 'Refresh token غير صالح أو منتهي' }); }

    if (decoded.type !== 'refresh') return res.status(401).json({ success: false, message: 'نوع التوكن غير صالح' });

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'المستخدم غير موجود أو الحساب معطل' });

    if (user.tokenVersion && decoded.iat) {
      const tokenIssuedAt = decoded.iat * 1000;
      if (tokenIssuedAt < user.tokenVersion) {
        return res.status(401).json({ success: false, message: 'تم تغيير كلمة المرور — يرجى تسجيل الدخول' });
      }
    }

    const newAccessToken = generateAccessToken(user._id);
    res.json({ success: true, data: { token: newAccessToken, accessToken: newAccessToken } });
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
      } catch (_) {}
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