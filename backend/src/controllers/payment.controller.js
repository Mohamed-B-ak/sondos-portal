// =====================================================
// Payment Controller — مُيسّر (Moyasar) Integration
// ─────────────────────────────────────────────────────
// Flow:
// 1. Client selects plan → POST /api/payments/create
// 2. Backend creates Payment record → returns Moyasar config
// 3. Frontend shows Moyasar form → user pays
// 4. Moyasar redirects to callback → GET /api/payments/callback
// 5. Backend verifies payment → activates subscription
// 6. Moyasar sends webhook → POST /api/payments/webhook
// =====================================================
const Payment = require('../models/Payment');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const moyasar = require('../utils/moyasar');

// ══════════════════════════════════════════════════════
// GET /api/payments/config
// Returns Moyasar publishable key + available plans
// ══════════════════════════════════════════════════════
exports.getConfig = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 });
    
    res.json({
      success: true,
      publishableKey: moyasar.getPublishableKey(),
      callbackUrl: moyasar.getCallbackUrl(),
      plans: plans.map(p => ({
        id: p._id,
        name: p.name,
        nameEn: p.nameEn,
        description: p.description,
        descriptionEn: p.descriptionEn,
        priceHalala: p.priceHalala,
        priceDisplay: p.priceDisplay,
        currency: p.currency,
        period: p.period,
        features: p.features,
        limits: p.limits,
        color: p.color,
        icon: p.icon,
        isPopular: p.isPopular,
      })),
    });
  } catch (error) {
    console.error('[Payment Config]', error.message);
    res.status(500).json({ success: false, message: 'فشل تحميل إعدادات الدفع' });
  }
};

// ══════════════════════════════════════════════════════
// POST /api/payments/create
// Creates a pending payment record before Moyasar form
// ══════════════════════════════════════════════════════
exports.createPayment = async (req, res) => {
  try {
    const { planId, type = 'subscription' } = req.body;
    const userId = req.user._id;
    
    // التحقق من الباقة
    let plan = null;
    let amountHalala;
    let description;
    
    if (type === 'subscription' || type === 'one_time') {
      if (!planId) {
        return res.status(400).json({ success: false, message: 'يرجى اختيار باقة' });
      }
      
      plan = await Plan.findById(planId);
      if (!plan || !plan.isActive) {
        return res.status(404).json({ success: false, message: 'الباقة غير متاحة' });
      }
      
      amountHalala = plan.priceHalala;
      description = `اشتراك ${plan.name} - سندس AI`;
    } else if (type === 'topup') {
      // شحن رصيد مخصص
      const { amount } = req.body;
      if (!amount || amount < 1) {
        return res.status(400).json({ success: false, message: 'المبلغ غير صالح' });
      }
      amountHalala = Math.round(amount * 100);
      description = `شحن رصيد ${amount} ر.س - سندس AI`;
    } else {
      return res.status(400).json({ success: false, message: 'نوع الدفع غير صالح' });
    }
    
    // إنشاء سجل الدفع
    const payment = await Payment.create({
      user: userId,
      plan: plan?._id || null,
      amountHalala,
      amountDisplay: amountHalala / 100,
      currency: 'SAR',
      status: 'pending',
      type,
      description,
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      metadata: {
        planName: plan?.name || '',
        userName: req.user.name,
        userEmail: req.user.email,
      },
    });
    
    // إرجاع البيانات اللازمة لـ Moyasar Form
    res.status(201).json({
      success: true,
      payment: {
        id: payment._id,
        amountHalala: payment.amountHalala,
        amountDisplay: payment.amountDisplay,
        currency: payment.currency,
        description: payment.description,
      },
      moyasar: {
        publishableKey: moyasar.getPublishableKey(),
        amount: payment.amountHalala,
        currency: payment.currency,
        description: payment.description,
        callbackUrl: `${moyasar.getCallbackUrl()}?payment_id=${payment._id}`,
        metadata: {
          payment_id: payment._id.toString(),
          user_id: userId.toString(),
          plan_id: plan?._id?.toString() || '',
        },
      },
    });
  } catch (error) {
    console.error('[Create Payment]', error.message);
    res.status(500).json({ success: false, message: 'فشل إنشاء عملية الدفع' });
  }
};

// ══════════════════════════════════════════════════════
// POST /api/payments/verify
// Called after Moyasar redirect — verifies payment status
// ══════════════════════════════════════════════════════
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, moyasarPaymentId } = req.body;
    
    if (!paymentId || !moyasarPaymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'بيانات التحقق غير مكتملة' 
      });
    }
    
    // 1. جلب سجل الدفع المحلي
    const payment = await Payment.findOne({ 
      _id: paymentId, 
      user: req.user._id 
    });
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'عملية الدفع غير موجودة' });
    }
    
    // لو الدفع مكتمل مسبقاً
    if (payment.status === 'paid') {
      return res.json({ 
        success: true, 
        status: 'paid', 
        message: 'الدفع مكتمل مسبقاً',
        payment: payment.toPublicJSON(),
      });
    }
    
    // 2. التحقق من مُيسّر
    const moyasarPayment = await moyasar.fetchPayment(moyasarPaymentId);
    
    // 3. التحقق من المبلغ والعملة
    if (moyasarPayment.amount !== payment.amountHalala || 
        moyasarPayment.currency?.toLowerCase() !== payment.currency.toLowerCase()) {
      payment.status = 'failed';
      payment.errorMessage = 'عدم تطابق المبلغ أو العملة';
      await payment.save();
      
      return res.status(400).json({ 
        success: false, 
        status: 'failed',
        message: 'عدم تطابق بيانات الدفع' 
      });
    }
    
    // 4. تحديث حالة الدفع
    payment.moyasarPaymentId = moyasarPaymentId;
    payment.moyasarResponse = moyasarPayment;
    
    // حفظ بيانات مصدر الدفع
    if (moyasarPayment.source) {
      payment.source = {
        type: moyasarPayment.source.type || '',
        company: moyasarPayment.source.company || moyasarPayment.source.brand || '',
        name: moyasarPayment.source.name || '',
        number: moyasarPayment.source.number || '',
      };
    }
    
    if (moyasarPayment.status === 'paid') {
      payment.status = 'paid';
      payment.paidAt = new Date();
      await payment.save();
      
      // 5. تفعيل الاشتراك
      await activateSubscription(payment);
      
      return res.json({
        success: true,
        status: 'paid',
        message: 'تم الدفع بنجاح!',
        payment: payment.toPublicJSON(),
      });
      
    } else if (moyasarPayment.status === 'failed') {
      payment.status = 'failed';
      payment.errorMessage = moyasarPayment.source?.message || 'فشل الدفع';
      await payment.save();
      
      return res.json({
        success: true,
        status: 'failed',
        message: payment.errorMessage,
        payment: payment.toPublicJSON(),
      });
      
    } else {
      // initiated أو غيره
      payment.status = 'initiated';
      await payment.save();
      
      return res.json({
        success: true,
        status: moyasarPayment.status,
        message: 'الدفع قيد المعالجة',
        payment: payment.toPublicJSON(),
      });
    }
    
  } catch (error) {
    console.error('[Verify Payment]', error.message);
    res.status(500).json({ success: false, message: 'فشل التحقق من الدفع' });
  }
};

// ══════════════════════════════════════════════════════
// POST /api/payments/webhook
// Moyasar webhook — no auth required, signature verified
// ══════════════════════════════════════════════════════
exports.webhook = async (req, res) => {
  try {
    const signature = req.headers['x-moyasar-signature'] || '';
    const rawBody = req.rawBody || JSON.stringify(req.body);
    
    // التحقق من التوقيع (اختياري إذا لم يتم إعداد السر)
    if (process.env.MOYASAR_WEBHOOK_SECRET) {
      const isValid = moyasar.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.warn('[Webhook] Invalid signature');
        return res.status(401).json({ message: 'Invalid signature' });
      }
    }
    
    const { id, status, amount, currency, metadata } = req.body;
    
    console.log(`[Webhook] Payment ${id} → ${status}`);
    
    // البحث عن الدفع
    let payment = await Payment.findOne({ moyasarPaymentId: id });
    
    // لو ما لقينا بالـ moyasarId، نبحث بالـ metadata
    if (!payment && metadata?.payment_id) {
      payment = await Payment.findById(metadata.payment_id);
    }
    
    if (!payment) {
      console.warn(`[Webhook] Payment not found: ${id}`);
      return res.status(200).json({ received: true }); // Always return 200 to Moyasar
    }
    
    // تحديث الحالة
    payment.moyasarPaymentId = id;
    payment.moyasarResponse = req.body;
    
    if (req.body.source) {
      payment.source = {
        type: req.body.source.type || '',
        company: req.body.source.company || req.body.source.brand || '',
        name: req.body.source.name || '',
        number: req.body.source.number || '',
      };
    }
    
    switch (status) {
      case 'paid':
        if (payment.status !== 'paid') {
          payment.status = 'paid';
          payment.paidAt = new Date();
          await payment.save();
          await activateSubscription(payment);
          console.log(`[Webhook] Payment ${id} marked as paid ✅`);
        }
        break;
        
      case 'failed':
        payment.status = 'failed';
        payment.errorMessage = req.body.source?.message || 'فشل الدفع';
        await payment.save();
        console.log(`[Webhook] Payment ${id} failed ❌`);
        break;
        
      case 'refunded':
        payment.status = 'refunded';
        payment.refundedAt = new Date();
        await payment.save();
        // إلغاء الاشتراك عند الاسترجاع
        await Subscription.findOneAndUpdate(
          { lastPayment: payment._id },
          { status: 'canceled' }
        );
        console.log(`[Webhook] Payment ${id} refunded 💸`);
        break;
        
      default:
        payment.status = status === 'initiated' ? 'initiated' : payment.status;
        await payment.save();
    }
    
    // دائماً نرجع 200 لـ Moyasar
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('[Webhook Error]', error.message);
    // حتى لو فيه خطأ، نرجع 200 عشان Moyasar ما يعيد المحاولة بشكل مفرط
    res.status(200).json({ received: true, error: 'Processing error' });
  }
};

// ══════════════════════════════════════════════════════
// GET /api/payments/history
// Payment history for the authenticated user
// ══════════════════════════════════════════════════════
exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = { user: req.user._id };
    if (status) query.status = status;
    
    const payments = await Payment.find(query)
      .populate('plan', 'name nameEn priceDisplay')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Payment.countDocuments(query);
    
    res.json({
      success: true,
      payments: payments.map(p => p.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Payment History]', error.message);
    res.status(500).json({ success: false, message: 'فشل تحميل سجل المدفوعات' });
  }
};

// ══════════════════════════════════════════════════════
// GET /api/payments/subscription
// Get current subscription status
// ══════════════════════════════════════════════════════
exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      user: req.user._id,
      status: 'active'
    })
    .populate('plan')
    .populate('lastPayment');
    
    if (!subscription) {
      return res.json({ 
        success: true, 
        subscription: null,
        message: 'لا يوجد اشتراك فعال'
      });
    }
    
    res.json({
      success: true,
      subscription: {
        id: subscription._id,
        plan: subscription.plan ? {
          id: subscription.plan._id,
          name: subscription.plan.name,
          nameEn: subscription.plan.nameEn,
          priceDisplay: subscription.plan.priceDisplay,
          period: subscription.plan.period,
          features: subscription.plan.features,
          limits: subscription.plan.limits,
        } : null,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        isValid: subscription.isValid(),
        autoRenew: subscription.autoRenew,
        renewalCount: subscription.renewalCount,
      },
    });
  } catch (error) {
    console.error('[Get Subscription]', error.message);
    res.status(500).json({ success: false, message: 'فشل تحميل بيانات الاشتراك' });
  }
};

// ══════════════════════════════════════════════════════
// Helper: Activate subscription after successful payment
// ══════════════════════════════════════════════════════
async function activateSubscription(payment) {
  try {
    if (!payment.plan) return; // شحن رصيد بدون باقة
    
    const plan = await Plan.findById(payment.plan);
    if (!plan) return;
    
    // البحث عن اشتراك قائم أو إنشاء جديد
    let subscription = await Subscription.findOne({
      user: payment.user,
      plan: payment.plan,
      status: { $in: ['active', 'pending', 'expired'] }
    });
    
    if (!subscription) {
      subscription = new Subscription({
        user: payment.user,
        plan: payment.plan,
      });
    }
    
    // تفعيل الاشتراك
    subscription.activate(payment, plan);
    await subscription.save();
    
    // تحديث planId في المستخدم
    await User.findByIdAndUpdate(payment.user, { planId: plan._id.toString() });
    
    console.log(`[Subscription] Activated for user ${payment.user} — Plan: ${plan.name}`);
  } catch (error) {
    console.error('[Activate Subscription]', error.message);
  }
}

// ══════════════════════════════════════════════════════
// ADMIN: GET /api/payments/admin/all
// All payments (admin only)
// ══════════════════════════════════════════════════════
exports.adminGetAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, userId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;
    
    const payments = await Payment.find(query)
      .populate('user', 'name email phone company')
      .populate('plan', 'name priceDisplay')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Payment.countDocuments(query);
    
    // إحصائيات سريعة
    const stats = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: {
        _id: null,
        totalRevenue: { $sum: '$amountDisplay' },
        totalPayments: { $sum: 1 },
        avgPayment: { $avg: '$amountDisplay' },
      }}
    ]);
    
    res.json({
      success: true,
      payments,
      stats: stats[0] || { totalRevenue: 0, totalPayments: 0, avgPayment: 0 },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Admin Payments]', error.message);
    res.status(500).json({ success: false, message: 'فشل تحميل المدفوعات' });
  }
};

// ══════════════════════════════════════════════════════
// ADMIN: POST /api/payments/admin/refund/:id
// Refund a payment
// ══════════════════════════════════════════════════════
exports.adminRefund = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'الدفعة غير موجودة' });
    }
    
    if (payment.status !== 'paid') {
      return res.status(400).json({ success: false, message: 'لا يمكن استرجاع دفعة غير مكتملة' });
    }
    
    if (!payment.moyasarPaymentId) {
      return res.status(400).json({ success: false, message: 'لا يوجد معرف دفع في مُيسّر' });
    }
    
    // استرجاع من مُيسّر
    await moyasar.refundPayment(payment.moyasarPaymentId);
    
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    await payment.save();
    
    // إلغاء الاشتراك
    await Subscription.findOneAndUpdate(
      { lastPayment: payment._id },
      { status: 'canceled' }
    );
    
    res.json({ success: true, message: 'تم استرجاع المبلغ بنجاح' });
  } catch (error) {
    console.error('[Admin Refund]', error.message);
    res.status(500).json({ success: false, message: 'فشل استرجاع المبلغ' });
  }
};
