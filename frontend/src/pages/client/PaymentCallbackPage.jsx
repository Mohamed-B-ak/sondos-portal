import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { paymentAPI } from "@/services/api/paymentAPI";

/**
 * Payment Callback Page
 * ─────────────────────
 * Moyasar redirects here after payment with:
 *   ?id=MOYASAR_PAYMENT_ID&status=paid&payment_id=OUR_PAYMENT_ID
 */
export default function PaymentCallbackPage() {
  const { isDark } = useTheme();
  const { t, isAr } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying'); // verifying | success | failed
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const moyasarPaymentId = searchParams.get('id');
    const paymentId = searchParams.get('payment_id');
    const moyasarStatus = searchParams.get('status');

    if (!moyasarPaymentId || !paymentId) {
      setStatus('failed');
      setMessage(t('pay.invalidCallback'));
      return;
    }

    // لو مُيسّر أرسل status=failed مباشرة
    if (moyasarStatus === 'failed') {
      setStatus('failed');
      setMessage(searchParams.get('message') || t('pay.failed'));
      return;
    }

    try {
      const res = await paymentAPI.verifyPayment(paymentId, moyasarPaymentId);

      if (res.status === 'paid') {
        setStatus('success');
        setMessage(t('pay.successMsg'));
      } else if (res.status === 'failed') {
        setStatus('failed');
        setMessage(res.message || t('pay.failedMsg'));
      } else {
        // Still processing
        setStatus('success');
        setMessage(t('pay.processingMsg'));
      }
    } catch (err) {
      setStatus('failed');
      setMessage(err.message || t('pay.verifyError'));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center space-y-6">
        {/* ── Verifying ── */}
        {status === 'verifying' && (
          <>
            <Loader2 className={`w-16 h-16 animate-spin mx-auto ${isDark ? 'text-teal-500' : 'text-teal-600'}`} />
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('pay.verifying')}
            </h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              {t('pay.doNotClose')}
            </p>
          </>
        )}

        {/* ── Success ── */}
        {status === 'success' && (
          <>
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              isDark ? 'bg-teal-500/20' : 'bg-teal-100'
            }`}>
              <CheckCircle2 className={`w-10 h-10 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
            </div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('pay.successTitle')}
            </h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{message}</p>

            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/25"
            >
              {t('pay.goToDashboard')}
              <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </>
        )}

        {/* ── Failed ── */}
        {status === 'failed' && (
          <>
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              isDark ? 'bg-red-500/20' : 'bg-red-100'
            }`}>
              <XCircle className={`w-10 h-10 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('pay.failedTitle')}
            </h2>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{message}</p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/payment')}
                className={`px-6 py-3 rounded-xl font-bold transition-colors ${
                  isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                {t('pay.tryAgain')}
              </button>
              <button
                onClick={() => navigate('/')}
                className={`px-6 py-3 rounded-xl font-bold transition-colors ${
                  isDark ? 'bg-[#1a1a1d] hover:bg-[#222225] text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {t('pay.goToDashboard')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
