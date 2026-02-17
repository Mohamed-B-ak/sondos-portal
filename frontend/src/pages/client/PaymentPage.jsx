import { useState, useEffect, useRef } from "react";
import {
  CreditCard, Crown, Star, Zap, Rocket,
  Check, Loader2, AlertCircle, ArrowRight,
  Shield, Lock, ChevronLeft, Sparkles
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { paymentAPI } from "@/services/api/paymentAPI";

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
  .mysr-form label,
  .mysr-form .mysr-label { color: #d1d5db !important; }
  .mysr-form input,
  .mysr-form select,
  .mysr-form .mysr-input {
    background-color: #0a0a0b !important;
    border: 1px solid #2a2a2d !important;
    color: #ffffff !important;
    border-radius: 10px !important;
    padding: 12px 14px !important;
  }
  .mysr-form input::placeholder { color: #6b7280 !important; }
  .mysr-form input:focus {
    border-color: #14b8a6 !important;
    box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.25) !important;
  }
  .mysr-form .mysr-methods .mysr-method {
    background-color: #111113 !important;
    border-color: #1f1f23 !important;
    color: #d1d5db !important;
  }
  .mysr-form .mysr-methods .mysr-method.active {
    background-color: #0a0a0b !important;
    border-color: #14b8a6 !important;
    color: #ffffff !important;
  }
  .mysr-form button[type="submit"],
  .mysr-form .mysr-btn-submit,
  .mysr-form .mysr-btn {
    background: linear-gradient(to left, #14b8a6, #06b6d4) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 14px !important;
    font-weight: 700 !important;
    font-size: 16px !important;
  }
  .mysr-form .mysr-error { color: #f87171 !important; }
  .mysr-form .mysr-networks img { filter: brightness(1.2); }
  .mysr-form { direction: ltr; text-align: left; }
`;

const MOYASAR_LIGHT_CSS = `
  .mysr-form input {
    border-radius: 10px !important;
    padding: 12px 14px !important;
  }
  .mysr-form button[type="submit"],
  .mysr-form .mysr-btn-submit,
  .mysr-form .mysr-btn {
    background: linear-gradient(to left, #14b8a6, #06b6d4) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 14px !important;
    font-weight: 700 !important;
    font-size: 16px !important;
  }
  .mysr-form { direction: ltr; text-align: left; }
`;

export default function PaymentPage({ embedded = false }) {
  const { isDark } = useTheme();
  const { t, isAr } = useLanguage();

  // State
  const [step, setStep] = useState('plans'); // plans → form → processing → result
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const moyasarFormRef = useRef(null);
  const moyasarInitialized = useRef(false);

  // Inject Moyasar dark/light CSS
  useEffect(() => {
    let styleEl = document.getElementById('moyasar-theme-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'moyasar-theme-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = isDark ? MOYASAR_DARK_CSS : MOYASAR_LIGHT_CSS;
    return () => { /* keep style on unmount — other pages may use it */ };
  }, [isDark]);

  // Load config + plans
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentAPI.getConfig();
      setConfig(data);
      setPlans(data.plans || []);
    } catch (err) {
      setError(err.message || t('pay.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Handle plan selection → create payment → show Moyasar form
  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan);
    setCreating(true);
    setError(null);

    try {
      const res = await paymentAPI.createPayment({
        planId: plan.id,
        type: 'subscription',
      });

      setPaymentData(res);
      setStep('form');

      // Initialize Moyasar form after state update
      setTimeout(() => initMoyasarForm(res.moyasar), 100);
    } catch (err) {
      setError(err.message || t('pay.createError'));
    } finally {
      setCreating(false);
    }
  };

  // Initialize Moyasar payment form
  const initMoyasarForm = (moyasarConfig) => {
    if (moyasarInitialized.current) return;

    // Load Moyasar script if not loaded
    if (!window.Moyasar) {
      const script = document.createElement('script');
      script.src = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js';
      script.onload = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css';
        document.head.appendChild(link);
        createForm(moyasarConfig);
      };
      document.head.appendChild(script);
    } else {
      createForm(moyasarConfig);
    }
  };

  const createForm = (cfg) => {
    if (!cfg || moyasarInitialized.current) return;

    // Clear any previous form
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
        on_initiating: function() {
          setStep('processing');
        },
        on_completed: async function(payment) {
          try {
            const verifyRes = await paymentAPI.verifyPayment(
              cfg.metadata.payment_id,
              payment.id
            );
            if (verifyRes.status === 'paid') {
              setResult({ success: true, payment: verifyRes.payment });
              setStep('result');
            }
          } catch (e) {
            console.error('Pre-redirect verify failed:', e);
          }
        },
        on_failure: function(error) {
          setResult({ 
            success: false, 
            message: error?.message || t('pay.failed') 
          });
          setStep('result');
        },
      });

      moyasarInitialized.current = true;
    } catch (e) {
      console.error('Moyasar init error:', e);
      setError(t('pay.formError'));
    }
  };

  // Go back to plans
  const handleBack = () => {
    setStep('plans');
    setSelectedPlan(null);
    setPaymentData(null);
    setResult(null);
    setError(null);
    moyasarInitialized.current = false;
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-teal-500' : 'text-teal-600'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {step === 'plans' ? t('pay.title') : step === 'form' ? t('pay.checkout') : step === 'processing' ? t('pay.processing') : t('pay.resultTitle')}
            </h1>
            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {step === 'plans' ? t('pay.subtitle') : selectedPlan?.name || ''}
            </p>
          </div>
          {step !== 'plans' && step !== 'result' && (
            <button onClick={handleBack} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              isDark ? 'bg-[#1a1a1d] hover:bg-[#222225] text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}>
              <ChevronLeft className="w-4 h-4" />
              {t('pay.back')}
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${
          isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* ═══ STEP 1: Plan Selection ═══ */}
      {step === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const colors = isDark ? COLOR_MAP[plan.color] || COLOR_MAP.teal : COLOR_MAP_LIGHT[plan.color] || COLOR_MAP_LIGHT.teal;
            const Icon = ICON_MAP[plan.icon] || Zap;
            const periodLabel = PERIOD_LABELS[plan.period];

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 transition-all hover:scale-[1.02] cursor-pointer border ${
                  plan.isPopular ? `bg-gradient-to-br ${colors.bg} ${colors.border} ring-2 ring-offset-2 ${isDark ? 'ring-yellow-500/50 ring-offset-[#0a0a0b]' : 'ring-yellow-400/50 ring-offset-white'}` 
                  : isDark ? 'bg-[#111113] border-[#1f1f23] hover:border-[#2a2a2d]' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
                onClick={() => !creating && handleSelectPlan(plan)}
              >
                {/* Popular badge */}
                {plan.isPopular && (
                  <div className={`absolute -top-3 ${isAr ? 'right-4' : 'left-4'} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${colors.badge}`}>
                    <Sparkles className="w-3 h-3" />
                    {t('pay.popular')}
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {isAr ? plan.name : plan.nameEn}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {isAr ? plan.description : plan.descriptionEn}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {plan.priceDisplay}
                  </span>
                  <span className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'} ${isAr ? 'mr-2' : 'ml-2'}`}>
                    {t('pay.sar')}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {isAr ? periodLabel?.ar : periodLabel?.en}
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className={`w-4 h-4 flex-shrink-0 ${colors.text}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {isAr ? `${f.label}: ${f.value}` : `${f.labelEn}: ${f.valueEn}`}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  disabled={creating}
                  className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    plan.isPopular
                      ? 'bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-teal-500/25'
                      : isDark
                        ? 'bg-white/10 hover:bg-white/15 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {creating && selectedPlan?.id === plan.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {t('pay.subscribe')}
                      <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ STEP 2: Payment Form ═══ */}
      {step === 'form' && (
        <div className="max-w-lg mx-auto space-y-6">
          {/* Order summary */}
          <div className={`rounded-2xl p-6 ${
            isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'
          }`}>
            <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('pay.orderSummary')}
            </h3>
            <div className={`flex justify-between items-center p-4 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                {selectedPlan?.name}
              </span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {paymentData?.payment?.amountDisplay} {t('pay.sar')}
              </span>
            </div>
            <div className={`flex justify-between items-center mt-3 pt-3 border-t ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('pay.total')}
              </span>
              <span className="text-xl font-black text-teal-500">
                {paymentData?.payment?.amountDisplay} {t('pay.sar')}
              </span>
            </div>
          </div>

          {/* Moyasar Form Container */}
          <div className={`rounded-2xl p-6 ${
            isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'
          }`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <CreditCard className="w-5 h-5 text-teal-500" />
              {t('pay.paymentDetails')}
            </h3>
            <div className="mysr-form" ref={moyasarFormRef}></div>
          </div>

          {/* Security badge */}
          <div className={`flex items-center justify-center gap-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Shield className="w-4 h-4" />
            <span>{t('pay.secure')}</span>
            <Lock className="w-4 h-4" />
            <span>PCI DSS</span>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: Processing ═══ */}
      {step === 'processing' && (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className={`w-12 h-12 animate-spin mb-4 ${isDark ? 'text-teal-500' : 'text-teal-600'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('pay.processingMsg')}
          </p>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('pay.doNotClose')}
          </p>
        </div>
      )}

      {/* ═══ STEP 4: Result ═══ */}
      {step === 'result' && (
        <div className="max-w-md mx-auto text-center space-y-6">
          {result?.success ? (
            <>
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                isDark ? 'bg-teal-500/20' : 'bg-teal-100'
              }`}>
                <Check className={`w-10 h-10 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('pay.successTitle')}
              </h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                {t('pay.successMsg')}
              </p>
            </>
          ) : (
            <>
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                isDark ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <AlertCircle className={`w-10 h-10 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('pay.failedTitle')}
              </h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                {result?.message || t('pay.failedMsg')}
              </p>
            </>
          )}

          <button
            onClick={handleBack}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              result?.success
                ? 'bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white'
                : isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'
            }`}
          >
            {result?.success ? t('pay.goToDashboard') : t('pay.tryAgain')}
          </button>
        </div>
      )}
    </div>
  );
}