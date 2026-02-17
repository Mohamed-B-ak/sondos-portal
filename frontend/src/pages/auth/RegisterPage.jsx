import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  Zap, Star, Crown, Rocket, CreditCard, Shield, Lock,
  Check, Loader2, AlertCircle, Eye, EyeOff, ArrowLeft,
  ArrowRight, User, Mail, Phone, Building2, Globe, ChevronLeft
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { paymentAPI } from "@/services/api/paymentAPI";

// ── Constants ──
const ICON_MAP = { zap: Zap, star: Star, crown: Crown, rocket: Rocket };
const COLOR_MAP = {
  orange: { bg: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400' },
  gray: { bg: 'from-gray-400/20 to-slate-400/20', border: 'border-gray-400/30', text: 'text-gray-300', badge: 'bg-gray-500/20 text-gray-300' },
  yellow: { bg: 'from-yellow-500/20 to-amber-400/20', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400' },
  teal: { bg: 'from-teal-500/20 to-cyan-500/20', border: 'border-teal-500/30', text: 'text-teal-400', badge: 'bg-teal-500/20 text-teal-400' },
};
const COLOR_MAP_LIGHT = {
  orange: { bg: 'from-orange-50 to-amber-50', border: 'border-orange-200', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  gray: { bg: 'from-gray-50 to-slate-50', border: 'border-gray-200', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-700' },
  yellow: { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  teal: { bg: 'from-teal-50 to-cyan-50', border: 'border-teal-200', text: 'text-teal-600', badge: 'bg-teal-100 text-teal-700' },
};
const PERIOD_LABELS = {
  monthly: { ar: 'شهرياً', en: '/month' },
  quarterly: { ar: 'كل 3 أشهر', en: '/quarter' },
  yearly: { ar: 'سنوياً', en: '/year' },
  one_time: { ar: 'مرة واحدة', en: 'one-time' },
};

// ── Dark mode CSS for Moyasar form ──
const MOYASAR_DARK_CSS = `
  .mysr-form label, .mysr-form .mysr-label { color: #d1d5db !important; }
  .mysr-form input, .mysr-form select, .mysr-form .mysr-input {
    background-color: #0a0a0b !important; border: 1px solid #2a2a2d !important;
    color: #ffffff !important; border-radius: 10px !important; padding: 12px 14px !important;
  }
  .mysr-form input::placeholder { color: #6b7280 !important; }
  .mysr-form input:focus { border-color: #14b8a6 !important; box-shadow: 0 0 0 2px rgba(20,184,166,0.25) !important; }
  .mysr-form .mysr-methods .mysr-method { background-color: #111113 !important; border-color: #1f1f23 !important; color: #d1d5db !important; }
  .mysr-form .mysr-methods .mysr-method.active { background-color: #0a0a0b !important; border-color: #14b8a6 !important; color: #fff !important; }
  .mysr-form button[type="submit"], .mysr-form .mysr-btn-submit, .mysr-form .mysr-btn {
    background: linear-gradient(to left, #14b8a6, #06b6d4) !important; color: #fff !important;
    border: none !important; border-radius: 12px !important; padding: 14px !important; font-weight: 700 !important;
  }
  .mysr-form .mysr-error { color: #f87171 !important; }
  .mysr-form { direction: ltr; text-align: left; }
`;
const MOYASAR_LIGHT_CSS = `
  .mysr-form input { border-radius: 10px !important; padding: 12px 14px !important; }
  .mysr-form button[type="submit"], .mysr-form .mysr-btn-submit, .mysr-form .mysr-btn {
    background: linear-gradient(to left, #14b8a6, #06b6d4) !important; color: #fff !important;
    border: none !important; border-radius: 12px !important; padding: 14px !important; font-weight: 700 !important;
  }
  .mysr-form { direction: ltr; text-align: left; }
`;

export default function RegisterPage() {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── State ──
  // Steps: 0=plan, 1=info, 2=password, 3=payment, 4=registering, 5=success
  const [step, setStep] = useState(0);
  const [plans, setPlans] = useState([]);
  const [publishableKey, setPublishableKey] = useState('');
  const [plansLoading, setPlansLoading] = useState(true);
  const [formData, setFormData] = useState({
    selectedPlan: null,
    name: '', email: '', phone: '', company: '', timezone: 'Asia/Riyadh',
    password: '', confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const moyasarInitialized = useRef(false);

  // ── Redirect if already logged in ──
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  // ── Load plans from DB ──
  useEffect(() => { loadPlans(); }, []);

  // ── Inject Moyasar CSS ──
  useEffect(() => {
    let el = document.getElementById('moyasar-theme-css');
    if (!el) { el = document.createElement('style'); el.id = 'moyasar-theme-css'; document.head.appendChild(el); }
    el.textContent = isDark ? MOYASAR_DARK_CSS : MOYASAR_LIGHT_CSS;
  }, [isDark]);

  // ── Handle payment callback redirect ──
  useEffect(() => {
    const paymentCallback = searchParams.get('payment_callback');
    if (paymentCallback && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [searchParams, isAuthenticated, navigate]);

  const loadPlans = async () => {
    setPlansLoading(true);
    try {
      const data = await paymentAPI.getPublicPlans();
      setPlans(data.plans || []);
      setPublishableKey(data.publishableKey || '');
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setPlansLoading(false);
    }
  };

  // ── Form handlers ──
  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const selectPlan = (plan) => {
    updateField('selectedPlan', plan);
    setStep(1);
  };

  const skipPlan = () => {
    updateField('selectedPlan', null);
    setStep(1);
  };

  // ── Validation ──
  const validateInfo = () => {
    if (!formData.name.trim()) { setError('الاسم مطلوب'); return false; }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) { setError('البريد الإلكتروني غير صالح'); return false; }
    if (!formData.phone.trim()) { setError('رقم الجوال مطلوب'); return false; }
    setError(''); return true;
  };

  const validatePassword = () => {
    if (formData.password.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return false; }
    if (formData.password !== formData.confirmPassword) { setError('كلمات المرور غير متطابقة'); return false; }
    setError(''); return true;
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strengthLabel = ['', 'ضعيفة', 'متوسطة', 'قوية', 'قوية جداً'];
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500', 'bg-emerald-500'];

  // ── Step 2 submit: password → go to payment (with plan) or register (skip) ──
  const handlePasswordSubmit = async () => {
    if (!validatePassword()) return;

    if (formData.selectedPlan) {
      // Has plan → go to Moyasar payment
      setStep(3);
      setTimeout(() => initMoyasarForm(), 200);
    } else {
      // No plan → register directly (skip plan flow)
      await registerWithoutPayment();
    }
  };

  // ── Register WITHOUT payment (skip plan) ──
  const registerWithoutPayment = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, email: formData.email, phone: formData.phone,
          company: formData.company, timezone: formData.timezone, password: formData.password,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setStep(5);
        setTimeout(() => { window.location.href = '/'; }, 2000);
      } else {
        setError(data.message || 'فشل إنشاء الحساب');
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  // ── Moyasar payment form (Step 3) ──
  const initMoyasarForm = () => {
    if (moyasarInitialized.current) return;
    const plan = formData.selectedPlan;
    if (!plan || !publishableKey) {
      setError('بيانات الدفع غير متوفرة');
      return;
    }

    const loadAndCreate = () => {
      const container = document.querySelector('.mysr-form');
      if (container) container.innerHTML = '';

      try {
        const frontendUrl = window.location.origin;
        window.Moyasar.init({
          element: '.mysr-form',
          amount: plan.priceHalala,
          currency: plan.currency || 'SAR',
          description: `اشتراك ${plan.name} - سندس AI`,
          publishable_api_key: publishableKey,
          callback_url: `${frontendUrl}/register?payment_callback=true`,
          supported_networks: ['visa', 'mastercard', 'mada'],
          methods: ['creditcard', 'stcpay'],
          metadata: {
            plan_id: plan.id,
            plan_name: plan.name,
            user_email: formData.email,
          },
          on_completed: function(payment) {
            console.log('[Register] Payment completed:', payment.id);
            registerWithPayment(payment.id);
          },
          on_failure: function(err) {
            setError(err?.message || 'فشل عملية الدفع');
            setStep(3);
            moyasarInitialized.current = false;
          },
        });
        moyasarInitialized.current = true;
      } catch (e) {
        console.error('Moyasar init error:', e);
        setError('فشل تحميل نموذج الدفع');
      }
    };

    if (!window.Moyasar) {
      const script = document.createElement('script');
      script.src = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js';
      script.onload = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css';
        document.head.appendChild(link);
        setTimeout(loadAndCreate, 100);
      };
      document.head.appendChild(script);
    } else {
      loadAndCreate();
    }
  };

  // ── Register WITH payment (after Moyasar success) ──
  const registerWithPayment = async (moyasarPaymentId) => {
    setStep(4); // registering step
    setError('');

    try {
      const res = await fetch('/api/auth/register-with-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          timezone: formData.timezone,
          password: formData.password,
          planId: formData.selectedPlan.id,
          moyasarPaymentId,
        }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setStep(5);
        setTimeout(() => { window.location.href = '/'; }, 2500);
      } else {
        setError(data.message || 'فشل إنشاء الحساب بعد الدفع');
        setStep(3);
        moyasarInitialized.current = false;
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب');
      setStep(3);
      moyasarInitialized.current = false;
    }
  };

  // ── Step count for progress bar ──
  const totalSteps = formData.selectedPlan ? 4 : 3; // plan→info→pass→pay or plan→info→pass
  const currentStep = step > totalSteps ? totalSteps : step;

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-xl rounded-3xl p-8 ${isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-lg'}`}>

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>سندس AI</span>
          </div>
        </div>

        {/* Selected plan badge */}
        {formData.selectedPlan && step >= 1 && step < 5 && (
          <div className={`flex items-center justify-center gap-2 mb-4 p-3 rounded-xl ${isDark ? 'bg-teal-500/10 border border-teal-500/20' : 'bg-teal-50 border border-teal-200'}`}>
            <CreditCard className="w-4 h-4 text-teal-500" />
            <span className={`text-sm font-medium ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
              {formData.selectedPlan.name} — {formData.selectedPlan.priceDisplay} ر.س {PERIOD_LABELS[formData.selectedPlan.period]?.ar}
            </span>
          </div>
        )}

        {/* Progress bar */}
        {step >= 1 && step <= 4 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i + 1 < currentStep ? 'bg-teal-500 text-white'
                  : i + 1 === currentStep ? `bg-gradient-to-br from-teal-500 to-cyan-500 text-white ring-4 ${isDark ? 'ring-teal-500/20' : 'ring-teal-100'}`
                  : isDark ? 'bg-[#1a1a1d] text-gray-500' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i + 1 < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-8 h-1 rounded ${i + 1 < currentStep ? 'bg-teal-500' : isDark ? 'bg-[#1f1f23]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* ═══ STEP 0: Select Plan ═══ */}
        {step === 0 && (
          <div>
            <h2 className={`text-xl font-bold text-center mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>اختر باقتك</h2>
            <p className={`text-center text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>اختر الباقة المناسبة لاحتياجاتك</p>

            {plansLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
            ) : (
              <div className="space-y-3">
                {plans.map(plan => {
                  const colors = isDark ? COLOR_MAP[plan.color] || COLOR_MAP.teal : COLOR_MAP_LIGHT[plan.color] || COLOR_MAP_LIGHT.teal;
                  const Icon = ICON_MAP[plan.icon] || Zap;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => selectPlan(plan)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-right ${
                        plan.isPopular
                          ? `bg-gradient-to-br ${colors.bg} ${colors.border} ring-2 ${isDark ? 'ring-yellow-500/30' : 'ring-yellow-400/30'}`
                          : isDark ? 'bg-[#0a0a0b] border-[#1f1f23] hover:border-[#2a2a2d]' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`p-3 rounded-xl flex-shrink-0 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                          {plan.isPopular && <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>⭐ الأكثر طلباً</span>}
                        </div>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.priceDisplay}</span>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}> ر.س {PERIOD_LABELS[plan.period]?.ar}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <button onClick={skipPlan} className={`w-full mt-4 py-3 rounded-xl text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
              تخطي — سجل بدون باقة ←
            </button>

            <p className={`text-center text-sm mt-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              لديك حساب بالفعل؟ <Link to="/login" className="text-teal-500 hover:underline">تسجيل الدخول</Link>
            </p>
          </div>
        )}

        {/* ═══ STEP 1: User Info ═══ */}
        {step === 1 && (
          <div>
            <h2 className={`text-xl font-bold text-center mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>معلوماتك الأساسية</h2>
            <p className={`text-center text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>أدخل بياناتك لإنشاء حسابك</p>

            <div className="space-y-4">
              <InputField icon={User} label="الاسم الكامل" value={formData.name} onChange={v => updateField('name', v)} isDark={isDark} />
              <InputField icon={Mail} label="البريد الإلكتروني" type="email" value={formData.email} onChange={v => updateField('email', v)} isDark={isDark} dir="ltr" />
              <InputField icon={Phone} label="رقم الجوال" value={formData.phone} onChange={v => updateField('phone', v)} isDark={isDark} dir="ltr" />
              <InputField icon={Building2} label="الشركة (اختياري)" value={formData.company} onChange={v => updateField('company', v)} isDark={isDark} />
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { if (validateInfo()) setStep(2); }}
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-l from-teal-500 to-cyan-500 text-white hover:from-teal-400 hover:to-cyan-400 transition-all flex items-center justify-center gap-2">
                التالي <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setStep(0)}
                className={`px-4 py-3 rounded-xl flex items-center gap-2 ${isDark ? 'bg-[#1a1a1d] text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}>
                <ArrowRight className="w-4 h-4" /> السابق
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: Password ═══ */}
        {step === 2 && (
          <div>
            <h2 className={`text-xl font-bold text-center mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Lock className="w-5 h-5 inline-block ml-2 text-teal-500" />
              تأمين حسابك
            </h2>
            <p className={`text-center text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>اختر كلمة مرور قوية</p>

            <div className="space-y-4">
              {/* Password */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>كلمة المرور</label>
                <div className={`flex items-center rounded-xl border px-4 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23]' : 'bg-gray-50 border-gray-200'}`}>
                  <Lock className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input type={showPass ? 'text' : 'password'} value={formData.password}
                    onChange={e => updateField('password', e.target.value)}
                    className={`flex-1 py-3 px-3 bg-transparent outline-none text-right ${isDark ? 'text-white' : 'text-gray-900'}`} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {formData.password && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{strengthLabel[getPasswordStrength()]}</span>
                    <div className="flex gap-1 flex-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= getPasswordStrength() ? strengthColor[getPasswordStrength()] : isDark ? 'bg-[#1f1f23]' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>تأكيد كلمة المرور</label>
                <div className={`flex items-center rounded-xl border px-4 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23]' : 'bg-gray-50 border-gray-200'}`}>
                  <Lock className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input type={showConfirm ? 'text' : 'password'} value={formData.confirmPassword}
                    onChange={e => updateField('confirmPassword', e.target.value)}
                    className={`flex-1 py-3 px-3 bg-transparent outline-none text-right ${isDark ? 'text-white' : 'text-gray-900'}`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-xs text-teal-500 mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> كلمات المرور متطابقة</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handlePasswordSubmit} disabled={loading}
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-l from-teal-500 to-cyan-500 text-white hover:from-teal-400 hover:to-cyan-400 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  formData.selectedPlan ? (
                    <><CreditCard className="w-4 h-4" /> المتابعة للدفع</>
                  ) : (
                    <><ArrowLeft className="w-4 h-4" /> إنشاء الحساب</>
                  )
                )}
              </button>
              <button onClick={() => setStep(1)}
                className={`px-4 py-3 rounded-xl flex items-center gap-2 ${isDark ? 'bg-[#1a1a1d] text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}>
                <ArrowRight className="w-4 h-4" /> السابق
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Payment ═══ */}
        {step === 3 && formData.selectedPlan && (
          <div>
            <h2 className={`text-xl font-bold text-center mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <CreditCard className="w-5 h-5 inline-block ml-2 text-teal-500" />
              إتمام الدفع
            </h2>
            <p className={`text-center text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ادفع أولاً ثم يتم إنشاء حسابك تلقائياً</p>

            {/* Order summary */}
            <div className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-[#0a0a0b] border border-[#1f1f23]' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{formData.selectedPlan.name}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formData.selectedPlan.priceDisplay} ر.س</span>
              </div>
              <div className={`flex justify-between items-center mt-2 pt-2 border-t ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>المجموع</span>
                <span className="text-lg font-black text-teal-500">{formData.selectedPlan.priceDisplay} ر.س</span>
              </div>
            </div>

            {/* Moyasar form */}
            <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0a0a0b] border border-[#1f1f23]' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="mysr-form"></div>
            </div>

            {/* Security badges */}
            <div className={`flex items-center justify-center gap-3 mt-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Shield className="w-3 h-3" /> <span>دفع آمن ومشفر</span>
              <Lock className="w-3 h-3" /> <span>PCI DSS</span>
            </div>

            <button onClick={() => { setStep(2); moyasarInitialized.current = false; }}
              className={`w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2 ${isDark ? 'bg-[#1a1a1d] text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}>
              <ArrowRight className="w-4 h-4" /> الرجوع
            </button>
          </div>
        )}

        {/* ═══ STEP 4: Registering (processing) ═══ */}
        {step === 4 && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>جاري إنشاء حسابك...</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>تم استلام الدفع — نقوم الآن بإعداد حسابك والمساعد الذكي</p>
            <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>الرجاء عدم إغلاق الصفحة</p>
          </div>
        )}

        {/* ═══ STEP 5: Success ═══ */}
        {step === 5 && (
          <div className="text-center py-8">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-teal-500/20' : 'bg-teal-100'}`}>
              <Check className="w-10 h-10 text-teal-500" />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>مرحباً بك! 🎉</h2>
            <p className={`mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {formData.selectedPlan
                ? `تم إنشاء حسابك وتفعيل ${formData.selectedPlan.name} بنجاح`
                : 'تم إنشاء حسابك بنجاح'
              }
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>جاري تحويلك للوحة التحكم...</p>
            <Loader2 className="w-5 h-5 animate-spin text-teal-500 mx-auto mt-3" />
          </div>
        )}

        {/* Footer links */}
        {step >= 1 && step <= 3 && (
          <p className={`text-center text-sm mt-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            لديك حساب بالفعل؟ <Link to="/login" className="text-teal-500 hover:underline">تسجيل الدخول</Link>
          </p>
        )}

        {/* Copyright */}
        <p className={`text-center text-xs mt-6 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
          © Sondos AI 2025. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
}

// ── Reusable Input Field ──
function InputField({ icon: Icon, label, value, onChange, type = 'text', isDark, dir }) {
  return (
    <div>
      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
      <div className={`flex items-center rounded-xl border px-4 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23]' : 'bg-gray-50 border-gray-200'}`}>
        <Icon className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          dir={dir || 'auto'}
          className={`flex-1 py-3 px-3 bg-transparent outline-none ${dir === 'ltr' ? 'text-left' : 'text-right'} ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}
        />
      </div>
    </div>
  );
}