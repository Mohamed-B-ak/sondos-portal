import { useState, useEffect } from "react";
import {
  Clock, CreditCard, CheckCircle2, XCircle, 
  RefreshCw, Loader2, AlertCircle, Receipt
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { paymentAPI } from "@/services/api/paymentAPI";

const STATUS_CONFIG = {
  paid: { 
    icon: CheckCircle2, 
    labelAr: 'مكتمل', labelEn: 'Paid',
    dark: 'bg-teal-500/20 text-teal-400', 
    light: 'bg-teal-100 text-teal-700' 
  },
  pending: { 
    icon: Clock, 
    labelAr: 'معلق', labelEn: 'Pending',
    dark: 'bg-yellow-500/20 text-yellow-400', 
    light: 'bg-yellow-100 text-yellow-700' 
  },
  initiated: { 
    icon: Clock, 
    labelAr: 'قيد المعالجة', labelEn: 'Processing',
    dark: 'bg-blue-500/20 text-blue-400', 
    light: 'bg-blue-100 text-blue-700' 
  },
  failed: { 
    icon: XCircle, 
    labelAr: 'فشل', labelEn: 'Failed',
    dark: 'bg-red-500/20 text-red-400', 
    light: 'bg-red-100 text-red-700' 
  },
  refunded: { 
    icon: RefreshCw, 
    labelAr: 'مسترجع', labelEn: 'Refunded',
    dark: 'bg-purple-500/20 text-purple-400', 
    light: 'bg-purple-100 text-purple-700' 
  },
  canceled: { 
    icon: XCircle, 
    labelAr: 'ملغي', labelEn: 'Canceled',
    dark: 'bg-gray-500/20 text-gray-400', 
    light: 'bg-gray-100 text-gray-600' 
  },
};

export default function PaymentHistoryPage({ embedded = false }) {
  const { isDark } = useTheme();
  const { t, isAr } = useLanguage();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { loadHistory(); }, [page]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentAPI.getHistory({ page, limit: 15 });
      setPayments(res.payments || []);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-teal-500' : 'text-teal-600'}`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 rounded-2xl ${
        isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
      }`}>
        <AlertCircle className={`w-10 h-10 mb-3 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
        <p className={isDark ? 'text-red-400' : 'text-red-600'}>{error}</p>
        <button onClick={loadHistory} className="mt-3 px-4 py-2 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500/30">
          {t('pay.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!embedded && (
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('pay.historyTitle')}
          </h2>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('pay.historySubtitle')}
          </p>
        </div>
      )}

      {payments.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl ${
          isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200'
        }`}>
          <Receipt className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>{t('pay.noPayments')}</p>
        </div>
      ) : (
        <div className={`rounded-2xl overflow-hidden ${
          isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          {payments.map((payment, index) => {
            const cfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            
            return (
              <div
                key={payment.id}
                className={`flex items-center justify-between p-4 ${
                  index < payments.length - 1 ? (isDark ? 'border-b border-[#1f1f23]' : 'border-b border-gray-100') : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <CreditCard className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {payment.description}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')
                        : '-'}
                      {payment.source?.company ? ` • ${payment.source.company}` : ''}
                      {payment.source?.number ? ` ${payment.source.number}` : ''}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {payment.amountDisplay} {t('pay.sar')}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    isDark ? cfg.dark : cfg.light
                  }`}>
                    <StatusIcon className="w-3 h-3" />
                    {isAr ? cfg.labelAr : cfg.labelEn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                p === page
                  ? 'bg-teal-500 text-white'
                  : isDark ? 'bg-[#1a1a1d] text-gray-400 hover:bg-[#222225]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
