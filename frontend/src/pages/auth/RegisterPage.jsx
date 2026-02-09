import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
  Calendar,
  Headphones,
  TrendingUp,
  Check,
  Sparkles
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { authAPI } from "@/services/api/authAPI";

// قائمة المناطق الزمنية
const TIMEZONES = [
  { value: 'Asia/Riyadh', label: 'السعودية (الرياض) UTC+3', labelEn: 'Saudi Arabia (Riyadh)' },
  { value: 'Asia/Dubai', label: 'الإمارات (دبي) UTC+4', labelEn: 'UAE (Dubai)' },
  { value: 'Asia/Kuwait', label: 'الكويت UTC+3', labelEn: 'Kuwait' },
  { value: 'Asia/Qatar', label: 'قطر (الدوحة) UTC+3', labelEn: 'Qatar (Doha)' },
  { value: 'Asia/Bahrain', label: 'البحرين UTC+3', labelEn: 'Bahrain' },
  { value: 'Asia/Muscat', label: 'عُمان (مسقط) UTC+4', labelEn: 'Oman (Muscat)' },
  { value: 'Africa/Cairo', label: 'مصر (القاهرة) UTC+2', labelEn: 'Egypt (Cairo)' },
  { value: 'Asia/Amman', label: 'الأردن (عمّان) UTC+3', labelEn: 'Jordan (Amman)' },
  { value: 'Asia/Beirut', label: 'لبنان (بيروت) UTC+2', labelEn: 'Lebanon (Beirut)' },
  { value: 'Asia/Baghdad', label: 'العراق (بغداد) UTC+3', labelEn: 'Iraq (Baghdad)' },
  { value: 'Africa/Casablanca', label: 'المغرب UTC+1', labelEn: 'Morocco' },
  { value: 'Africa/Tunis', label: 'تونس UTC+1', labelEn: 'Tunisia' },
  { value: 'Africa/Algiers', label: 'الجزائر UTC+1', labelEn: 'Algeria' },
  { value: 'Europe/London', label: 'لندن UTC+0', labelEn: 'London' },
  { value: 'Europe/Paris', label: 'باريس UTC+1', labelEn: 'Paris' },
  { value: 'America/New_York', label: 'نيويورك UTC-5', labelEn: 'New York' },
  { value: 'America/Los_Angeles', label: 'لوس أنجلوس UTC-8', labelEn: 'Los Angeles' },
  { value: 'Asia/Karachi', label: 'باكستان UTC+5', labelEn: 'Pakistan' },
  { value: 'Asia/Kolkata', label: 'الهند UTC+5:30', labelEn: 'India' },
];

// الخطط المتاحة
const PLANS = [
  {
    id: 'PLN-001',
    name: 'خطة حجز المواعيد',
    description: 'مثالية للعيادات والمستشفيات لأتمتة حجز وتأكيد المواعيد الطبية',
    icon: Calendar,
    color: 'teal',
    features: [
      'مساعد ذكي للحجز والتأكيد',
      'تدفق أتمتة جاهز',
      'دعم اللغة العربية',
      'تقارير ما بعد المكالمة'
    ]
  },
  {
    id: 'PLN-002',
    name: 'خطة خدمة العملاء',
    description: 'حل متكامل لخدمة العملاء والرد على الاستفسارات على مدار الساعة',
    icon: Headphones,
    color: 'blue',
    features: [
      'رد تلقائي على الاستفسارات',
      'تحويل للموظف عند الحاجة',
      'تسجيل المكالمات',
      'تحليل المشاعر'
    ]
  },
  {
    id: 'PLN-003',
    name: 'خطة المبيعات',
    description: 'زد مبيعاتك مع مكالمات المتابعة الذكية وتأهيل العملاء المحتملين',
    icon: TrendingUp,
    color: 'purple',
    features: [
      'مكالمات متابعة تلقائية',
      'تأهيل العملاء المحتملين',
      'جدولة المواعيد',
      'تكامل مع CRM'
    ]
  }
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    timezone: "Asia/Riyadh",
    password: "",
    confirmPassword: "",
    selectedPlan: null, // الخطة المختارة
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: Plans, 1: Info, 2: Password, 3: Success
  const { isDark, toggleTheme } = useTheme();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const selectPlan = (planId) => {
    setFormData(prev => ({ ...prev, selectedPlan: planId }));
  };

  // Skip plan selection
  const skipPlanSelection = () => {
    setFormData(prev => ({ ...prev, selectedPlan: null }));
    setStep(1);
  };

  // Continue with selected plan
  const continueWithPlan = () => {
    if (formData.selectedPlan) {
      setStep(1);
    }
  };

  // Validate Step 1
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError("الرجاء إدخال الاسم الكامل");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("الرجاء إدخال بريد إلكتروني صحيح");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("الرجاء إدخال رقم الجوال");
      return false;
    }
    if (!formData.timezone) {
      setError("الرجاء اختيار المنطقة الزمنية");
      return false;
    }
    return true;
  };

  // Validate Step 2
  const validateStep2 = () => {
    if (formData.password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setLoading(true);
    setError("");

    try {
      // Call backend API via auth context
      const response = await authRegister({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        timezone: formData.timezone,
        password: formData.password,
        planId: formData.selectedPlan,
      });

      if (response.success) {
        // Show success screen
        setStep(3);
        
        // After 2 seconds, redirect to dashboard
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
      
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء التسجيل");
      setLoading(false);
    }
  };

  // Password strength indicator
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

  // Get selected plan info
  const getSelectedPlan = () => {
    return PLANS.find(p => p.id === formData.selectedPlan);
  };

  // Success Screen
  if (step === 3) {
    const selectedPlan = getSelectedPlan();
    return (
      <div 
        className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
          isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'
        }`} 
        dir="rtl"
      >
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
          {selectedPlan && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-4 ${
              isDark ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-600'
            }`}>
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">تم تفعيل: {selectedPlan.name}</span>
            </div>
          )}
          <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            جاري تحويلك للوحة التحكم...
          </p>
          <Loader2 className={`w-6 h-6 animate-spin mx-auto mt-6 ${isDark ? 'text-teal-400' : 'text-teal-500'}`} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'
      }`} 
      dir="rtl"
    >
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl ${
          isDark ? 'bg-teal-500/5' : 'bg-teal-500/10'
        }`} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl ${
          isDark ? 'bg-cyan-500/5' : 'bg-cyan-500/10'
        }`} />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`absolute top-0 left-0 p-3 rounded-xl transition-all ${
            isDark 
              ? 'bg-[#1a1a1d] hover:bg-[#222225] text-gray-400' 
              : 'bg-white hover:bg-gray-100 text-gray-600 shadow-sm'
          }`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Step 0: Plan Selection */}
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
                اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-400 to-cyan-400">خطتك</span>
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                اختر الخطة المناسبة لاحتياجاتك وسنجهز حسابك بالكامل
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                const isSelected = formData.selectedPlan === plan.id;
                
                return (
                  <div
                    key={plan.id}
                    onClick={() => selectPlan(plan.id)}
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
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-4 left-4 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                      isSelected
                        ? 'bg-teal-500 text-white'
                        : isDark
                          ? 'bg-[#1a1a1d] text-gray-400'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    {/* Plan Info */}
                    <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      {plan.description}
                    </p>

                    {/* Plan ID Badge */}
                    <span className={`inline-block text-xs px-2 py-1 rounded-full mb-4 ${
                      isSelected
                        ? 'bg-teal-500/20 text-teal-400'
                        : isDark
                          ? 'bg-[#1f1f23] text-gray-500'
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      {plan.id}
                    </span>

                    {/* Features */}
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Check className={`w-4 h-4 flex-shrink-0 ${
                            isSelected ? 'text-teal-500' : isDark ? 'text-gray-600' : 'text-gray-400'
                          }`} />
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            {feature}
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
                    : isDark
                      ? 'bg-[#1a1a1d] text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                متابعة مع الخطة المختارة
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={skipPlanSelection}
                className={`px-8 py-4 rounded-xl font-medium transition-all ${
                  isDark 
                    ? 'bg-[#1a1a1d] text-gray-400 hover:bg-[#222225] hover:text-gray-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                تخطي واستمرار بدون خطة
              </button>
            </div>

            {/* Back to Login */}
            <div className={`text-center pt-6 border-t border-dashed ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                لديك حساب بالفعل؟{" "}
                <button 
                  onClick={() => navigate("/login")}
                  className="text-teal-500 hover:text-teal-400 font-medium"
                >
                  تسجيل الدخول
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Step 1 & 2: Form Steps */}
        {(step === 1 || step === 2) && (
          <div className={`w-full max-w-md mx-auto p-8 rounded-3xl border transition-colors ${
            isDark 
              ? 'bg-[#111113] border-[#1f1f23]' 
              : 'bg-white border-gray-200 shadow-xl'
          }`}>
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                سندس AI
              </span>
            </div>

            {/* Selected Plan Badge */}
            {formData.selectedPlan && (
              <div className={`mb-6 p-3 rounded-xl flex items-center gap-3 ${
                isDark ? 'bg-teal-500/10 border border-teal-500/20' : 'bg-teal-50 border border-teal-100'
              }`}>
                {(() => {
                  const plan = getSelectedPlan();
                  const Icon = plan?.icon || Calendar;
                  return (
                    <>
                      <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-teal-500" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                          {plan?.name}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-teal-500/70' : 'text-teal-600/70'}`}>
                          {plan?.id}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step >= s
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                      : isDark
                        ? 'bg-[#1a1a1d] text-gray-500'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 2 && (
                    <div className={`w-12 h-1 rounded-full ${
                      step > s 
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500' 
                        : isDark ? 'bg-[#1f1f23]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      إنشاء حساب جديد
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      أدخل معلوماتك الأساسية
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      الاسم الكامل <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        placeholder="أحمد محمد"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full pr-12 pl-4 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${
                          isDark 
                            ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      البريد الإلكتروني <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full pr-12 pl-4 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${
                          isDark 
                            ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                        }`}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      رقم الجوال <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="tel"
                        placeholder="+966 5X XXX XXXX"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={`w-full pr-12 pl-4 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${
                          isDark 
                            ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                        }`}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Company (Optional) */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      اسم الشركة / المنشأة <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>(اختياري)</span>
                    </label>
                    <div className="relative">
                      <Building2 className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        placeholder="مثال: شركة النجاح"
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className={`w-full pr-12 pl-4 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${
                          isDark 
                            ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      المنطقة الزمنية <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <select
                        value={formData.timezone}
                        onChange={(e) => handleChange('timezone', e.target.value)}
                        className={`w-full pr-12 pl-4 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 appearance-none ${
                          isDark 
                            ? 'bg-[#0a0a0b] border-[#1f1f23] text-white' 
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      >
                        {TIMEZONES.map(tz => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                      isDark 
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                        : 'bg-red-50 border border-red-200 text-red-600'
                    }`}>
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        isDark 
                          ? 'bg-[#1a1a1d] text-gray-300 hover:bg-[#222225]' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <ArrowRight className="w-5 h-5" />
                      السابق
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-1 py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
                    >
                      التالي
                      <ArrowLeft className="w-5 h-5" />
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
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      تأمين حسابك
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      اختر كلمة مرور قوية
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Password */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <Lock className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className={`w-full pr-12 pl-12 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${
                          isDark 
                            ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 flex gap-1">
                            {[1, 2, 3, 4].map(i => (
                              <div 
                                key={i} 
                                className={`h-1 flex-1 rounded-full transition-colors ${
                                  i <= passwordStrength.level 
                                    ? passwordStrength.color 
                                    : isDark ? 'bg-[#1f1f23]' : 'bg-gray-200'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className={`text-xs ${
                            passwordStrength.level <= 1 ? 'text-red-500' :
                            passwordStrength.level <= 2 ? 'text-yellow-500' : 'text-emerald-500'
                          }`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                      <Lock className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        className={`w-full pr-12 pl-12 py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${
                          isDark 
                            ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' 
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Match indicator */}
                    {formData.confirmPassword && (
                      <p className={`text-xs mt-1 ${
                        formData.password === formData.confirmPassword 
                          ? 'text-emerald-500' 
                          : 'text-red-500'
                      }`}>
                        {formData.password === formData.confirmPassword 
                          ? '✓ كلمات المرور متطابقة' 
                          : '✗ كلمات المرور غير متطابقة'}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                      isDark 
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                        : 'bg-red-50 border border-red-200 text-red-600'
                    }`}>
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className={`flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        isDark 
                          ? 'bg-[#1a1a1d] text-gray-300 hover:bg-[#222225]' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <ArrowRight className="w-5 h-5" />
                      السابق
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {formData.selectedPlan 
                            ? "جاري إعداد حسابك وتفعيل الخطة..." 
                            : "جاري التسجيل..."}
                        </>
                      ) : (
                        "إنشاء الحساب"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Back to Login */}
            <div className={`text-center mt-6 pt-6 border-t border-dashed ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                لديك حساب بالفعل؟{" "}
                <button 
                  onClick={() => navigate("/login")}
                  className="text-teal-500 hover:text-teal-400 font-medium"
                >
                  تسجيل الدخول
                </button>
              </p>
            </div>
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