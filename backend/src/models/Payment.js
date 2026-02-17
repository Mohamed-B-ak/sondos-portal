// =====================================================
// Payment Model — سجل المدفوعات (Moyasar)
// =====================================================
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // المستخدم
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // الباقة (اختياري - ممكن يكون شحن رصيد بدون باقة)
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    default: null
  },
  // معرف الدفع في مُيسّر
  moyasarPaymentId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  // المبلغ بالهللات
  amountHalala: {
    type: Number,
    required: true
  },
  // المبلغ بالريال (للعرض)
  amountDisplay: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'SAR'
  },
  // حالة الدفع
  status: {
    type: String,
    enum: ['pending', 'initiated', 'paid', 'failed', 'refunded', 'canceled'],
    default: 'pending',
    index: true
  },
  // نوع الدفع
  type: {
    type: String,
    enum: ['subscription', 'topup', 'one_time'],
    default: 'subscription'
  },
  // وصف الدفع
  description: {
    type: String,
    default: ''
  },
  // تفاصيل مصدر الدفع من مُيسّر
  source: {
    type: {
      type: String,  // creditcard, applepay, stcpay, etc.
      default: ''
    },
    company: String,  // visa, mastercard, mada
    name: String,
    number: String,   // masked: XXXX-XXXX-XXXX-1234
  },
  // الرد الكامل من مُيسّر (للتتبع)
  moyasarResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
    select: false  // لا يُرسل افتراضياً
  },
  // رسالة الخطأ
  errorMessage: {
    type: String,
    default: ''
  },
  // metadata إضافية
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // عنوان IP
  ipAddress: {
    type: String,
    default: ''
  },
  // تاريخ الدفع الناجح
  paidAt: {
    type: Date,
    default: null
  },
  // تاريخ الاسترجاع
  refundedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index مركب للبحث السريع
paymentSchema.index({ user: 1, status: 1, createdAt: -1 });
paymentSchema.index({ moyasarPaymentId: 1 });

// للعرض في الفرونت
paymentSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    moyasarPaymentId: this.moyasarPaymentId,
    amountDisplay: this.amountDisplay,
    currency: this.currency,
    status: this.status,
    type: this.type,
    description: this.description,
    source: this.source,
    plan: this.plan,
    paidAt: this.paidAt,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Payment', paymentSchema);
