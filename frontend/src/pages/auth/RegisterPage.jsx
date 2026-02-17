import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { 
  AlertCircle, 
  Zap, 
  Sun, 
  Moon, 
  User, 
  Loader2,
  Mail,
  Lock,
  Phone,
  Building2,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Globe,
  Check,
  Sparkles,
  Star,
  Crown,
  Rocket,
  CreditCard,
  Shield
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { paymentAPI } from "@/services/api/paymentAPI";

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

// Icons map for plans from DB
const ICON_MAP = { zap: Zap, star: Star, crown: Crown, rocket: Rocket };

// Colors for plans
const COLOR_MAP_DARK = {
  orange: { bg: 'border-orange-500', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400', icon: 'bg-orange-500/20 text-orange-400' },
  gray:   { bg: 'border-gray-400',   text: 'text-gray-300',   badge: 'bg-gray-500/20 text-gray-300',     icon: 'bg-gray-500/20 text-gray-400' },
  yellow: { bg: 'border-yellow-500',  text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400', icon: 'bg-yellow-500/20 text-yellow-400' },
  teal:   { bg: 'border-teal-500',    text: 'text-teal-400',   badge: 'bg-teal-500/20 text-teal-400',     icon: 'bg-teal-500/20 text-teal-400' },
};
const COLOR_MAP_LIGHT = {
  orange: { bg: 'border-orange-400', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700', icon: 'bg-orange-100 text-orange-600' },
  gray:   { bg: 'border-gray-400',   text: 'text-gray-600',   badge: 'bg-gray-100 text-gray-700',     icon: 'bg-gray-100 text-gray-600' },
  yellow: { bg: 'border-yellow-500',  text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800', icon: 'bg-yellow-100 text-yellow-700' },
  teal:   { bg: 'border-teal-500',    text: 'text-teal-600',   badge: 'bg-teal-100 text-teal-700',     icon: 'bg-teal-100 text-teal-600' },
};

const PERIOD_LABELS = {
  monthly:   { ar: 'شهرياً', en: '/month' },
  quarterly: { ar: 'كل 3 أشهر', en: '/quarter' },
  yearly:    { ar: 'سنوياً', en: '/year' },
  one_time:  { ar: 'مرة واحدة', en: 'one-time' },
};

// Timezones
const TIMEZONES = [
  { value: 'Asia/Riyadh', label: 'السعودية (الرياض) UTC+3' },
  { value: 'Asia/Dubai', label: 'الإمارات (دبي) UTC+4' },
  { value: 'Asia/Kuwait', label: 'الكويت UTC+3' },
  { value: 'Asia/Qatar', label: 'قطر (الدوحة) UTC+3' },
  { value: 'Asia/Bahrain', label: 'البحرين UTC+3' },
  { value: 'Asia/Muscat', label: 'عُمان (مسقط) UTC+4' },
  { value: 'Africa/Cairo', label: 'مصر (القاهرة) UTC+2' },
  { value: 'Asia/Amman', label: 'الأردن (عمّان) UTC+3' },
  { value: 'Asia/Beirut', label: 'لبنان (بيروت) UTC+2' },
  { value: 'Asia/Baghdad', label: 'العراق (بغداد) UTC+3' },
  { value: 'Africa/Casablanca', label: 'المغرب UTC+1' },
  { value: 'Africa/Tunis', label: 'تونس UTC+1' },
  { value: 'Africa/Algiers', label: 'الجزائر UTC+1' },
  { value: 'Europe/London', label: 'لندن UTC+0' },
  { value: 'Europe/Paris', label: 'باريس UTC+1' },
  { value: 'America/New_York', label: 'نيويورك UTC-5' },
  { value: 'America/Los_Angeles', label: 'لوس أنجلوس UTC-8' },
  { value: 'Asia/Karachi', label: 'باكستان UTC+5' },
  { value: 'Asia/Kolkata', label: 'الهند UTC+5:30' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // ── State ──
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", company: "",
    timezone: "Asia/Riyadh", password: "", confirmPassword: "",
    selectedPlan: null, // DB plan object (not just ID)
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Steps: 0=Plans, 1=Info, 2=Password, 3=Payment(Moyasar), 4=Success
  const [step, setStep] = useState(0);

  // ── Plans from DB ──
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // ── Moyasar ──
  const [paymentData, setPaymentData] = useState(null);
  const [paymentCreating, setPaymentCreating] = useState(false);
  const moyasarInitialized = useRef(false);

  // Load plans from DB on mount
  useEffect(() => {
    loadPlans();
  }, []);

  // Inject Moyasar dark/light CSS
  useEffect(() => {
    let styleEl = document.getElementById('moyasar-theme-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'moyasar-theme-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = isDark ? MOYASAR_DARK_CSS : MOYASAR_LIGHT_CSS;
  }, [isDark]);

  const loadPlans = async () => {
    setPlansLoading(true);
    try {
      const data = await paymentAPI.getPublicPlans();
      setPlans(data.plans || []);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setPlansLoading(false);
    }
  };

  // ── Handlers ──
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const selectPlan = (plan) => {
    setFormData(prev => ({ ...prev, selectedPlan: plan }));
  };

  const skipPlanSelection = () => {
    setFormData(prev => ({ ...prev, selectedPlan: null }));
    setStep(1);
  };

  const continueWithPlan = () => {
    if (formData.selectedPlan) setStep(1);
  };

  // ── Validation ──
  const validateStep1 = () => {
    if (!formData.name.trim()) { setError("الرجاء إدخال الاسم الكامل"); return false; }
    if (!formData.email.trim() || !formData.email.includes("@")) { setError("الرجاء إدخال بريد إلكتروني صحيح"); return false; }
    if (!formData.phone.trim()) { setError("الرجاء إدخال رقم الجوال"); return false; }
    if (!formData.timezone) { setError("الرجاء اختيار المنطقة الزمنية"); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (formData.password.length < 8) { setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل"); return false; }
    if (formData.password !== formData.confirmPassword) { setError("كلمات المرور غير متطابقة"); return false; }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) { setStep(2); setError(""); }
  };

  // ── Submit: Register then Payment ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    setError("");

    try {
      const response = await authRegister({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        timezone: formData.timezone,
        password: formData.password,
        planId: formData.selectedPlan?.id || null,
      });

      if (response.success) {
        // If user chose a plan → go to payment step
        if (formData.selectedPlan) {
          setStep(3);
          setLoading(false);
          // Create payment after small delay (allow auth state to settle)
          setTimeout(() => initPayment(), 300);
        } else {
          // No plan → go to success
          setStep(4);
          setTimeout(() => navigate("/"), 2000);
        }
      }
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء التسجيل");
      setLoading(false);
    }
  };

  // ── Moyasar Payment ──
  const initPayment = async () => {
    setPaymentCreating(true);
    setError("");
    try {
      const res = await paymentAPI.createPayment({
        planId: formData.selectedPlan.id,
        type: 'subscription',
      });
      setPaymentData(res);
      setTimeout(() => initMoyasarForm(res.moyasar), 200);
    } catch (err) {
      setError(err.message || "فشل إنشاء عملية الدفع");
    } finally {
      setPaymentCreating(false);
    }
  };

  const initMoyasarForm = (cfg) => {
    if (moyasarInitialized.current || !cfg) return;

    if (!window.Moyasar) {
      const script = document.createElement('script');
      script.src = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js';
      script.onload = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css';
        document.head.appendChild(link);
        createMoyasarForm(cfg);
      };
      document.head.appendChild(script);
    } else {
      createMoyasarForm(cfg);
    }
  };

  const createMoyasarForm = (cfg) => {
    if (!cfg || moyasarInitialized.current) return;
    const container = document.querySelector('.mysr-form');
    if (container) container.innerHTML = '';

    try {
      window.Moyasar.init({
        element: '.mysr-form',
        amount: cfg.amount,
        currency: cfg.currency,
        description: cfg.description,
        publishable_api_key: cfg.publishableKey,
        callback_url: cfg.callbackUrl,
        supported_networks: ['visa', 'mastercard', 'mada'],
        methods: ['creditcard', 'stcpay'],
        metadata: cfg.metadata,
        on_completed: async function (payment) {
          try {
            await paymentAPI.verifyPayment(cfg.metadata.payment_id, payment.id);
          } catch (e) {
            console.error('Pre-redirect verify:', e);
          }
        },
      });
      moyasarInitialized.current = true;
    } catch (e) {
      console.error('Moyasar init error:', e);
      setError('فشل تحميل نموذج الدفع');
    }
  };

  const skipPayment = () => {
    setStep(4);
    setTimeout(() => navigate("/"), 2000);
  };

  // ── Password Strength ──
  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { level: 0, text: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return { level: 1, text: "ضعيفة", color: "bg-red-500" };
    if (score <= 3) return { level: 2, text: "متوسطة", color: "bg-yellow-500" };
    if (score <= 4) return { level: 3, text: "قوية", color: "bg-emerald-500" };
    return { level: 4, text: "قوية جداً", color: "bg-emerald-500" };
  };
  const passwordStrength = getPasswordStrength();

  // ════════════════════════════════════════════════
  // Step 4: Success Screen
  // ════════════════════════════════════════════════
  if (step === 4) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`} dir="rtl">
        <div className="text-center">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            تم التسجيل بنجاح! 🎉
          </h1>
          <p className={`text-lg mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            مرحباً {formData.name}
          </p>
          {formData.selectedPlan && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-4 ${isDark ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">الباقة: {formData.selectedPlan.name}</span>
            </div>
          )}
          <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
            جاري تحويلك للوحة التحكم...
          </p>
          <Loader2 className={`w-6 h-6 animate-spin mx-auto mt-6 ${isDark ? 'text-teal-400' : 'text-teal-500'}`} />
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // Main Render
  // ════════════════════════════════════════════════
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`} dir="rtl">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-teal-500/5' : 'bg-teal-500/10'}`} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl ${isDark ? 'bg-cyan-500/5' : 'bg-cyan-500/10'}`} />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`absolute top-0 left-0 p-3 rounded-xl transition-all ${isDark ? 'bg-[#1a1a1d] hover:bg-[#222225] text-gray-400' : 'bg-white hover:bg-gray-100 text-gray-600 shadow-sm'}`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* ═══════════════════════════════════════════
            Step 0: Plan Selection (from DB)
        ═══════════════════════════════════════════ */}
        {step === 0 && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/25">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-400 to-cyan-400">باقتك</span>
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                اختر الباقة المناسبة لاحتياجاتك وادفع بعد التسجيل
              </p>
            </div>

            {/* Loading */}
            {plansLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-teal-500' : 'text-teal-600'}`} />
              </div>
            ) : (
              <>
                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                  {plans.map((plan) => {
                    const Icon = ICON_MAP[plan.icon] || Zap;
                    const colors = isDark ? COLOR_MAP_DARK[plan.color] || COLOR_MAP_DARK.teal : COLOR_MAP_LIGHT[plan.color] || COLOR_MAP_LIGHT.teal;
                    const isSelected = formData.selectedPlan?.id === plan.id;
                    const period = PERIOD_LABELS[plan.period];

                    return (
                      <div
                        key={plan.id}
                        onClick={() => selectPlan(plan)}
                        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? isDark
                              ? 'border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/20'
                              : 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-500/20'
                            : isDark
                              ? 'border-[#1f1f23] bg-[#111113] hover:border-[#2a2a2e] hover:bg-[#151517]'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        {/* Popular */}
                        {plan.isPopular && (
                          <div className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${colors.badge}`}>
                            <Sparkles className="w-3 h-3" />
                            الأكثر شيوعاً
                          </div>
                        )}

                        {/* Selected */}
                        {isSelected && (
                          <div className="absolute top-4 left-4 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}

                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                          isSelected ? 'bg-teal-500 text-white' : colors.icon
                        }`}>
                          <Icon className="w-7 h-7" />
                        </div>

                        {/* Name + Description */}
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {plan.name}
                        </h3>
                        <p className={`text-sm mb-4 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                          {plan.description}
                        </p>

                        {/* Price */}
                        <div className="mb-4">
                          <span className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {plan.priceDisplay}
                          </span>
                          <span className={`text-sm mr-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            ر.س
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {period?.ar}
                          </span>
                        </div>

                        {/* Features */}
                        <ul className="space-y-2">
                          {plan.features?.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <Check className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-teal-500' : colors.text}`} />
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                {f.label}: {f.value}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={continueWithPlan}
                    disabled={!formData.selectedPlan}
                    className={`px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      formData.selectedPlan
                        ? 'bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-teal-500/25 transform hover:scale-[1.02]'
                        : isDark ? 'bg-[#1a1a1d] text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    متابعة مع الباقة المختارة
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={skipPlanSelection}
                    className={`px-8 py-4 rounded-xl font-medium transition-all ${isDark ? 'bg-[#1a1a1d] text-gray-400 hover:bg-[#222225]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    تخطي واستمرار بدون باقة
                  </button>
                </div>
              </>
            )}

            {/* Login link */}
            <div className={`text-center pt-6 border-t border-dashed ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                لديك حساب بالفعل؟{" "}
                <button onClick={() => navigate("/login")} className="text-teal-500 hover:text-teal-400 font-medium">
                  تسجيل الدخول
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            Steps 1 & 2: Info + Password
        ═══════════════════════════════════════════ */}
        {(step === 1 || step === 2) && (
          <div className={`w-full max-w-md mx-auto p-8 rounded-3xl border transition-colors ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200 shadow-xl'}`}>
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>سندس AI</span>
            </div>

            {/* Selected Plan Badge */}
            {formData.selectedPlan && (
              <div className={`mb-6 p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-teal-500/10 border border-teal-500/20' : 'bg-teal-50 border border-teal-100'}`}>
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-teal-500" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                    {formData.selectedPlan.name}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-teal-500/70' : 'text-teal-600/70'}`}>
                    {formData.selectedPlan.priceDisplay} ر.س {PERIOD_LABELS[formData.selectedPlan.period]?.ar}
                  </p>
                </div>
              </div>
            )}

            {/* Progress: 3 steps if plan selected, 2 if not */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, ...(formData.selectedPlan ? [3] : [])].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step >= s ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : isDark ? 'bg-[#1a1a1d] text-gray-500' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > s ? <Check className="w-4 h-4" /> : s === 3 ? <CreditCard className="w-4 h-4" /> : s}
                  </div>
                  {s < (formData.selectedPlan ? 3 : 2) && (
                    <div className={`w-12 h-1 rounded-full ${step > s ? 'bg-gradient-to-r from-teal-500 to-cyan-500' : isDark ? 'bg-[#1f1f23]' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Info */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>إنشاء حساب جديد</h1>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>أدخل معلوماتك الأساسية</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>الاسم الكامل <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input type="text" placeholder="أحمد محمد" value={formData.name} onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full pr-12 pl-4 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      />
                    </div>
                  </div>
                  {/* Email */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>البريد الإلكتروني <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input type="email" placeholder="example@email.com" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} dir="ltr"
                        className={`w-full pr-12 pl-4 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      />
                    </div>
                  </div>
                  {/* Phone */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>رقم الجوال <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input type="tel" placeholder="+966 5X XXX XXXX" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} dir="ltr"
                        className={`w-full pr-12 pl-4 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      />
                    </div>
                  </div>
                  {/* Company */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>اسم الشركة <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>(اختياري)</span></label>
                    <div className="relative">
                      <Building2 className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input type="text" placeholder="مثال: شركة النجاح" value={formData.company} onChange={(e) => handleChange('company', e.target.value)}
                        className={`w-full pr-12 pl-4 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      />
                    </div>
                  </div>
                  {/* Timezone */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>المنطقة الزمنية <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Globe className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <select value={formData.timezone} onChange={(e) => handleChange('timezone', e.target.value)}
                        className={`w-full pr-12 pl-4 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 appearance-none ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      >
                        {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                      <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(0)}
                      className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-[#1a1a1d] text-gray-300 hover:bg-[#222225]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <ArrowRight className="w-5 h-5" /> السابق
                    </button>
                    <button onClick={handleNextStep}
                      className="flex-1 py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
                    >
                      التالي <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>تأمين حسابك</h1>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>اختر كلمة مرور قوية</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Password */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>كلمة المرور</label>
                    <div className="relative">
                      <Lock className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={(e) => handleChange('password', e.target.value)}
                        className={`w-full pr-12 pl-12 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-2 flex items-center gap-2 mb-1">
                        <div className="flex-1 flex gap-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength.level ? passwordStrength.color : isDark ? 'bg-[#1f1f23]' : 'bg-gray-200'}`} />
                          ))}
                        </div>
                        <span className={`text-xs ${passwordStrength.level <= 1 ? 'text-red-500' : passwordStrength.level <= 2 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>تأكيد كلمة المرور</label>
                    <div className="relative">
                      <Lock className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        className={`w-full pr-12 pl-12 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <p className={`text-xs mt-1 ${formData.password === formData.confirmPassword ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formData.password === formData.confirmPassword ? '✓ كلمات المرور متطابقة' : '✗ كلمات المرور غير متطابقة'}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                      <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)}
                      className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-[#1a1a1d] text-gray-300 hover:bg-[#222225]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <ArrowRight className="w-5 h-5" /> السابق
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> جاري التسجيل...</>
                      ) : formData.selectedPlan ? (
                        <>إنشاء الحساب والدفع <CreditCard className="w-5 h-5" /></>
                      ) : (
                        "إنشاء الحساب"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Login link */}
            <div className={`text-center mt-6 pt-6 border-t border-dashed ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                لديك حساب بالفعل؟{" "}
                <button onClick={() => navigate("/login")} className="text-teal-500 hover:text-teal-400 font-medium">تسجيل الدخول</button>
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            Step 3: Payment (Moyasar)
        ═══════════════════════════════════════════ */}
        {step === 3 && (
          <div className="w-full max-w-md mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/25">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                إتمام الدفع
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                تم إنشاء حسابك بنجاح! أكمل الدفع لتفعيل الباقة
              </p>
            </div>

            {/* Order Summary */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>ملخص الطلب</h3>
              <div className={`flex justify-between items-center p-4 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{formData.selectedPlan?.name}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {paymentData?.payment?.amountDisplay || formData.selectedPlan?.priceDisplay} ر.س
                </span>
              </div>
              <div className={`flex justify-between items-center mt-3 pt-3 border-t ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>الإجمالي</span>
                <span className="text-xl font-black text-teal-500">
                  {paymentData?.payment?.amountDisplay || formData.selectedPlan?.priceDisplay} ر.س
                </span>
              </div>
            </div>

            {/* Moyasar Form */}
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <CreditCard className="w-5 h-5 text-teal-500" />
                بيانات الدفع
              </h3>
              {paymentCreating ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-teal-500' : 'text-teal-600'}`} />
                </div>
              ) : (
                <div className="mysr-form"></div>
              )}
            </div>

            {error && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="text-sm">{error}</span>
              </div>
            )}

            {/* Security + Skip */}
            <div className={`flex items-center justify-center gap-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <Shield className="w-4 h-4" /><span>دفع آمن ومشفر</span><Lock className="w-4 h-4" /><span>PCI DSS</span>
            </div>

            <button onClick={skipPayment}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${isDark ? 'text-gray-500 hover:text-gray-400 hover:bg-[#1a1a1d]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              تخطي الدفع الآن — يمكنك الدفع لاحقاً من لوحة التحكم
            </button>
          </div>
        )}

        {/* Footer */}
        <p className={`text-center text-sm mt-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          © 2025 Sondos AI. جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}