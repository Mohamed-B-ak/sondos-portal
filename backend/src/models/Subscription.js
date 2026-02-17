// =====================================================
// Subscription Model — اشتراكات العملاء
// =====================================================
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  // آخر عملية دفع
  lastPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'canceled', 'pending'],
    default: 'pending',
    index: true
  },
  // تواريخ الاشتراك
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  // التجديد التلقائي
  autoRenew: {
    type: Boolean,
    default: false
  },
  // عدد مرات التجديد
  renewalCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index مركب
subscriptionSchema.index({ user: 1, status: 1 });

// التحقق من صلاحية الاشتراك
subscriptionSchema.methods.isValid = function() {
  if (this.status !== 'active') return false;
  if (!this.endDate) return false;
  return new Date() < this.endDate;
};

// تفعيل الاشتراك بعد الدفع
subscriptionSchema.methods.activate = function(payment, plan) {
  this.status = 'active';
  this.lastPayment = payment._id;
  this.startDate = new Date();
  
  // حساب تاريخ الانتهاء بناءً على نوع الباقة
  const end = new Date();
  switch (plan.period) {
    case 'monthly':
      end.setMonth(end.getMonth() + 1);
      break;
    case 'quarterly':
      end.setMonth(end.getMonth() + 3);
      break;
    case 'yearly':
      end.setFullYear(end.getFullYear() + 1);
      break;
    case 'one_time':
      end.setFullYear(end.getFullYear() + 99); // دائم
      break;
  }
  this.endDate = end;
  this.renewalCount += 1;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
