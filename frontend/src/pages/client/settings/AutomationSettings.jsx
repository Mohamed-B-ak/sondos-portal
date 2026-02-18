import { useState, useEffect } from "react";
import {
  Power, Loader2, CheckCircle, AlertCircle,
  Shield, Wifi, WifiOff, Copy, Check, ExternalLink
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { apiCall } from "@/services/api/httpClient";

export default function AutomationSettings() {
  const { isDark } = useTheme();
  const { t, isAr } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/user/automation');
      if (res.success) {
        setAutomationEnabled(res.data.automationEnabled);
      }
    } catch (err) {
      console.error('Load automation status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    // لو بيوقف الأتمتة — نعرض تأكيد أول
    if (automationEnabled) {
      setShowConfirm(true);
    } else {
      // لو بيفعلها — مباشرة
      performToggle(true);
    }
  };

  const performToggle = async (newValue) => {
    setToggling(true);
    setMessage({ type: '', text: '' });
    setShowConfirm(false);
    try {
      const res = await apiCall('/user/automation', {
        method: 'PUT',
        body: JSON.stringify({ enabled: newValue }),
      });
      if (res.success) {
        setAutomationEnabled(res.data.automationEnabled);
        setMessage({
          type: 'success',
          text: res.data.automationEnabled
            ? (isAr ? 'تم تفعيل الأتمتة بنجاح' : 'Automation enabled successfully')
            : (isAr ? 'تم إيقاف الأتمتة بنجاح' : 'Automation disabled successfully')
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || (isAr ? 'حدث خطأ' : 'An error occurred')
      });
    } finally {
      setToggling(false);
    }
  };

  const endpointUrl = `${window.location.origin}/api/public/automation-status`;

  const handleCopyEndpoint = async () => {
    try {
      await navigator.clipboard.writeText(endpointUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = endpointUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-teal-500' : 'text-teal-600'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Message */}
      {message.text && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${
          message.type === 'success'
            ? isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
            : isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Main Toggle Card ── */}
        <div className={`rounded-2xl p-6 ${
          automationEnabled
            ? isDark ? 'bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/30' : 'bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200'
            : isDark ? 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30' : 'bg-gradient-to-br from-red-50 to-orange-50 border border-red-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                automationEnabled
                  ? isDark ? 'bg-teal-500/20' : 'bg-teal-100'
                  : isDark ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <Power className={`w-6 h-6 ${
                  automationEnabled
                    ? isDark ? 'text-teal-400' : 'text-teal-600'
                    : isDark ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {isAr ? 'التحكم بالأتمتة' : 'Automation Control'}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isAr ? 'تفعيل أو إيقاف المكالمات التلقائية' : 'Enable or disable automatic calls'}
                </p>
              </div>
            </div>
          </div>

          {/* Big Toggle */}
          <div className={`flex items-center justify-between p-5 rounded-xl ${isDark ? 'bg-black/20' : 'bg-white/60'}`}>
            <div className="flex items-center gap-3">
              {automationEnabled ? (
                <Wifi className={`w-5 h-5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              ) : (
                <WifiOff className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
              )}
              <div>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {automationEnabled
                    ? (isAr ? 'الأتمتة مفعّلة' : 'Automation Enabled')
                    : (isAr ? 'الأتمتة متوقفة' : 'Automation Disabled')
                  }
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {automationEnabled
                    ? (isAr ? 'المكالمات التلقائية تعمل بشكل طبيعي' : 'Automatic calls are running normally')
                    : (isAr ? 'لن يتم إجراء أي مكالمات تلقائية' : 'No automatic calls will be made')
                  }
                </p>
              </div>
            </div>

            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 ${
                toggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${
                automationEnabled
                  ? `bg-teal-500 ${isDark ? 'focus:ring-teal-500/30' : 'focus:ring-teal-300'}`
                  : `${isDark ? 'bg-[#2a2a2d]' : 'bg-gray-300'} ${isDark ? 'focus:ring-gray-600' : 'focus:ring-gray-300'}`
              }`}
            >
              <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
                automationEnabled ? 'left-9' : 'left-1'
              }`}>
                {toggling && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
              </span>
            </button>
          </div>

          {/* Warning when disabled */}
          {!automationEnabled && (
            <div className={`mt-4 flex items-center gap-3 p-4 rounded-xl ${
              isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
            }`}>
              <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
              <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                {isAr
                  ? 'تنبيه: الأتمتة متوقفة حالياً — جميع المكالمات التلقائية لن تعمل حتى يتم إعادة التفعيل.'
                  : 'Warning: Automation is currently disabled — all automatic calls are stopped until re-enabled.'
                }
              </p>
            </div>
          )}
        </div>

        {/* ── API Endpoint Info Card ── */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <ExternalLink className="w-5 h-5 text-cyan-400" />
            {isAr ? 'الربط مع الأنظمة الخارجية' : 'External System Integration'}
          </h3>

          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {isAr
              ? 'استخدم هذا الـ Endpoint من أنظمتك الخارجية للتحقق من حالة الأتمتة قبل تنفيذ أي مكالمة.'
              : 'Use this endpoint from your external systems to check automation status before making calls.'
            }
          </p>

          {/* Method + URL */}
          <div className={`rounded-xl overflow-hidden mb-4 ${isDark ? 'bg-[#0a0a0b] border border-[#1f1f23]' : 'bg-gray-50 border border-gray-200'}`}>
            <div className={`flex items-center gap-2 px-4 py-2 border-b ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-500">GET</span>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {isAr ? 'حالة الأتمتة' : 'Automation Status'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 gap-2">
              <code className={`text-xs break-all flex-1 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} dir="ltr">
                {endpointUrl}
              </code>
              <button
                onClick={handleCopyEndpoint}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : isDark ? 'hover:bg-[#1a1a1d] text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Auth info */}
          <div className={`rounded-xl p-4 space-y-3 ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {isAr ? 'المصادقة:' : 'Authentication:'}
            </p>
            <div className={`text-xs space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} dir="ltr">
              <p>
                <span className="font-medium text-cyan-500">Header:</span>{' '}
                <code className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-[#111113]' : 'bg-gray-200'}`}>
                  X-API-Key: your_sondos_api_key
                </code>
              </p>
              <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                {isAr ? 'أو' : 'or'}
              </p>
              <p>
                <span className="font-medium text-cyan-500">Query:</span>{' '}
                <code className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-[#111113]' : 'bg-gray-200'}`}>
                  ?api_key=your_sondos_api_key
                </code>
              </p>
            </div>
          </div>

          {/* Example response */}
          <div className="mt-4">
            <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {isAr ? 'مثال على الاستجابة:' : 'Example Response:'}
            </p>
            <pre className={`text-xs p-4 rounded-xl overflow-x-auto ${isDark ? 'bg-[#0a0a0b] text-gray-300' : 'bg-gray-50 text-gray-700'}`} dir="ltr">
{JSON.stringify({
  success: true,
  automationEnabled: automationEnabled,
  user: {
    id: "...",
    name: "...",
    isActive: true
  }
}, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-gray-50 border border-gray-200'}`}>
        <Shield className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {isAr
            ? 'الـ Endpoint الخارجي يعمل بالقراءة فقط (GET) ولا يسمح بتغيير الإعداد. فقط أنت تقدر تفعّل أو توقف الأتمتة من هذه الصفحة.'
            : 'The external endpoint is read-only (GET) and cannot change the setting. Only you can enable/disable automation from this page.'
          }
        </p>
      </div>

      {/* ══════ Confirmation Modal ══════ */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}>
          <div className={`w-full max-w-sm rounded-2xl overflow-hidden ${isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-2xl'}`}>
            <div className="p-6 text-center space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                <WifiOff className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {isAr ? 'إيقاف الأتمتة؟' : 'Disable Automation?'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {isAr
                  ? 'سيتم إيقاف جميع المكالمات التلقائية فوراً. هل أنت متأكد؟'
                  : 'All automatic calls will stop immediately. Are you sure?'
                }
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    isDark ? 'bg-[#1a1a1d] hover:bg-[#222225] text-gray-300 border border-[#2a2a2d]' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() => performToggle(false)}
                  className="flex-1 py-3 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  {isAr ? 'نعم، إيقاف' : 'Yes, Disable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
