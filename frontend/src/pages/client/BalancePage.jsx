import { useState, useEffect } from "react";
import { 
  Plus, 
  Wallet, 
  TrendingDown, 
  RefreshCw, 
  Clock,
  CreditCard,
  AlertCircle,
  Loader2,
  ExternalLink,
  Phone,
  DollarSign
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { userAPI, callsAPI } from "@/services/api/sondosAPI";

export default function BalancePage() {
  const { isDark } = useTheme();
  const { t, isAr } = useLanguage();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);
  
  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user data (includes balance)
      const userResponse = await userAPI.me();
      console.log('User data:', userResponse);
      setUserData(userResponse);
      
      // Fetch recent calls for usage stats
      try {
        const callsResponse = await callsAPI.getAll({ per_page: 10 });
        console.log('Calls response:', callsResponse);
        if (callsResponse?.data && Array.isArray(callsResponse.data)) {
          setRecentCalls(callsResponse.data);
        }
      } catch (callsError) {
        console.log('Could not fetch calls:', callsError);
      }
      
    } catch (err) {
      console.error('Error loading balance:', err);
      setError(err.message || t('bal.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculate total cost from recent calls (with safety check)
  const totalSpent = Array.isArray(recentCalls) 
    ? recentCalls.reduce((sum, call) => {
        const cost = parseFloat(call?.total_cost) || 0;
        return sum + cost;
      }, 0)
    : 0;
  
  // Get balance value - API returns total_balance
  const balance = parseFloat(userData?.total_balance ?? userData?.balance ?? userData?.credits ?? 0);
  const currency = userData?.currency || 'SAR';

  // Safe number formatting
  const formatNumber = (num, decimals = 2) => {
    const n = parseFloat(num);
    return isNaN(n) ? '0.00' : n.toFixed(decimals);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-teal-500' : 'text-teal-600'}`} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('bal.title')}</h1>
        </div>
        
        <div className={`flex flex-col items-center justify-center p-8 rounded-2xl ${
          isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
        }`}>
          <AlertCircle className={`w-12 h-12 mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
          <p className={`text-lg font-medium mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            {error}
          </p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t('bal.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('bal.title')}</h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('bal.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-3 rounded-xl transition-colors ${
              isDark 
                ? 'bg-[#1a1a1d] hover:bg-[#222225] border border-[#1f1f23]' 
                : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''} ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <a
            href="https://app.sondos-ai.com/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/25"
          >
            <Plus className="w-5 h-5" />
            {t('bal.recharge')}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Balance */}
        <div className={`rounded-2xl p-6 ${
          isDark 
            ? 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30' 
            : 'bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-teal-500/20' : 'bg-teal-100'}`}>
              <Wallet className={`w-6 h-6 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              isDark ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-700'
            }`}>
                {t('bal.currentBalance')}
            </span>
          </div>
          <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatNumber(balance)}
            <span className={`text-lg mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {currency === 'SAR' ? t('bal.sar') : currency}
            </span>
          </p>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('bal.lastUpdate')}
          </p>
        </div>

        {/* Total Spent */}
        <div className={`rounded-2xl p-6 ${
          isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <TrendingDown className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
            }`}>
              {t('bal.consumption')}
            </span>
          </div>
          <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatNumber(totalSpent, 3)}
            <span className={`text-lg mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {currency === 'SAR' ? t('bal.sar') : currency}
            </span>
          </p>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('bal.lastCalls').replace('{count}', recentCalls.length)}
          </p>
        </div>

        {/* Calls Count */}
        <div className={`rounded-2xl p-6 ${
          isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Phone className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
            }`}>
              {t('bal.calls')}
            </span>
          </div>
          <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {recentCalls.length}
            <span className={`text-lg mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('bal.call')}
            </span>
          </p>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('bal.recentCalls')}
          </p>
        </div>
      </div>

      {/* User Info Card */}
      {userData && (
        <div className={`rounded-2xl p-6 ${
          isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <CreditCard className="w-5 h-5 text-teal-500" />
            {t('bal.accountInfo')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem 
              label={t('bal.name')} 
              value={userData.name || '-'} 
              isDark={isDark}
            />
            <InfoItem 
              label={t('bal.email')} 
              value={userData.email || '-'} 
              isDark={isDark}
            />
            <InfoItem 
              label={t('bal.totalBalance')} 
              value={`${formatNumber(balance)} ${currency === 'SAR' ? t('bal.sar') : currency}`} 
              isDark={isDark}
            />
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className={`rounded-2xl p-6 ${
        isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <Clock className="w-5 h-5 text-cyan-500" />
          {t('bal.recentCalls')}
        </h3>
        
        {recentCalls.length > 0 ? (
          <div className="space-y-3">
            {recentCalls.slice(0, 5).map((call, index) => (
              <div 
                key={call.id || index}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    call.type === 'inbound' 
                      ? isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                      : isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                  }`}>
                    <Phone className={`w-4 h-4 ${
                      call.type === 'inbound'
                        ? isDark ? 'text-blue-400' : 'text-blue-600'
                        : isDark ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {call.client_phone_number || t('bal.callLabel')}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {call.created_at ? new Date(call.created_at).toLocaleString(isAr ? 'ar-SA' : 'en-US') : '-'}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`font-bold ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                    -{formatNumber(call.total_cost || 0, 3)} {currency === 'SAR' ? t('bal.sar') : currency}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {call.duration ? `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')} ${t('bal.minute')}` : '-'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('bal.noRecentCalls')}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href="https://app.sondos-ai.com/billing"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-between p-6 rounded-2xl transition-all hover:scale-[1.02] ${
            isDark 
              ? 'bg-gradient-to-l from-teal-500/20 to-cyan-500/20 border border-teal-500/30 hover:border-teal-500/50' 
              : 'bg-gradient-to-l from-teal-50 to-cyan-50 border border-teal-200 hover:border-teal-300'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-teal-500/20' : 'bg-teal-100'}`}>
              <CreditCard className={`w-8 h-8 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('bal.recharge')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('bal.addBalance')}
              </p>
            </div>
          </div>
          <ExternalLink className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </a>

        <a
          href="https://app.sondos-ai.com/billing/history"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-between p-6 rounded-2xl transition-all hover:scale-[1.02] ${
            isDark 
              ? 'bg-[#111113] border border-[#1f1f23] hover:border-[#2a2a2d]' 
              : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Clock className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('bal.transactionHistory')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('bal.viewAllTransactions')}
              </p>
            </div>
          </div>
          <ExternalLink className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </a>
      </div>
    </div>
  );
}

// Info Item Component
function InfoItem({ label, value, isDark }) {
  return (
    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
      <p className={`text-sm mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}