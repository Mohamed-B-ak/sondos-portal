import { useState, useEffect } from 'react';
import { 
  Users, UserCheck, Unplug, Clock,
  Loader2, DollarSign, Send, X, CheckCircle, AlertCircle,
  RefreshCw, Key, Coins, Timer
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { adminAPI } from '@/services/api/adminAPI';

export default function AdminDashboardPage() {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  
  // Transfer Balance Modal
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState({
    email: '',
    amount: '',
    operation: 'add',
    transfer_type: 'balance',
  });
  const [transferring, setTransferring] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadDashboard(); }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getDashboard();
      setDashboard(res.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferForm.email.trim()) {
      setToast({ type: 'error', text: 'البريد الإلكتروني مطلوب' });
      return;
    }
    if (!transferForm.amount || parseFloat(transferForm.amount) <= 0) {
      setToast({ type: 'error', text: 'المبلغ يجب أن يكون أكبر من صفر' });
      return;
    }
    setTransferring(true);
    try {
      const res = await adminAPI.transferBalance({
        email: transferForm.email.trim(),
        amount: parseFloat(transferForm.amount),
        operation: transferForm.operation,
        transfer_type: transferForm.transfer_type,
      });
      setToast({ type: 'success', text: res.message || 'تم التحويل بنجاح' });
      setShowTransfer(false);
      setTransferForm({ email: '', amount: '', operation: 'add', transfer_type: 'balance' });
      loadDashboard(); // Refresh to show updated balances
    } catch (err) {
      setToast({ type: 'error', text: err.message || 'فشل التحويل' });
    } finally {
      setTransferring(false);
    }
  };

  const handleQuickTransfer = (email) => {
    setTransferForm(prev => ({ ...prev, email }));
    setShowTransfer(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-purple-500' : 'text-purple-600'}`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
        <button onClick={loadDashboard} className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const { stats, recentClients, monthlyRegistrations } = dashboard;

  const statCards = [
    { label: 'إجمالي العملاء', value: stats.totalClients, icon: Users, color: 'purple' },
    { label: 'العملاء النشطين', value: stats.activeClients, icon: UserCheck, color: 'emerald' },
    { label: 'إجمالي الدقائق', value: stats.totalMinutes?.toFixed(1) || '0', icon: Timer, color: 'teal' },
    { label: 'إجمالي الرصيد', value: stats.totalCredits?.toFixed(1) || '0', icon: Coins, color: 'cyan' },
  ];

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl border ${
          toast.type === 'success'
            ? isDark ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            : isDark ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>لوحة تحكم المدير</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>نظرة عامة على أداء المنصة</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadDashboard} className={`p-3 rounded-xl border transition-colors ${isDark ? 'bg-[#111113] border-[#1f1f23] hover:bg-[#1a1a1d]' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
            <RefreshCw className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          <button onClick={() => setShowTransfer(true)}
            className="px-5 py-2.5 bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25">
            <DollarSign className="w-5 h-5" />
            تحويل رصيد
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} isDark={isDark} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Registrations Chart */}
        <div className={`rounded-2xl p-6 border transition-colors ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>تسجيلات العملاء الشهرية</h3>
          {monthlyRegistrations.length > 0 ? (
            <div className="h-64 flex items-end justify-between gap-3">
              {monthlyRegistrations.map((item, i) => {
                const maxCount = Math.max(...monthlyRegistrations.map(m => m.count), 1);
                const heightPercent = (item.count / maxCount) * 100;
                const monthLabel = new Date(item._id + '-01').toLocaleDateString('ar-SA', { month: 'short' });
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{item.count}</span>
                    <div className="w-full bg-gradient-to-t from-purple-600 to-pink-400 rounded-t-lg transition-all hover:from-purple-500 hover:to-pink-300 min-h-[8px]"
                      style={{ height: `${Math.max(heightPercent, 5)}%` }} />
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{monthLabel}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>لا توجد بيانات بعد</p>
            </div>
          )}
        </div>

        {/* Quick Transfer Card */}
        <div className={`rounded-2xl p-6 border transition-colors ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>تحويل رصيد سريع</h3>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>البريد الإلكتروني</label>
              <input type="email" value={transferForm.email} onChange={(e) => setTransferForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="client@example.com" dir="ltr"
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>المبلغ</label>
                <input type="number" value={transferForm.amount} onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00" min="0" step="0.01" dir="ltr"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>العملية</label>
                <select value={transferForm.operation} onChange={(e) => setTransferForm(prev => ({ ...prev, operation: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                  <option value="add">إضافة</option>
                  <option value="subtract">خصم</option>
                </select>
              </div>
            </div>
            <button onClick={handleTransfer} disabled={transferring}
              className="w-full py-3 bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 disabled:opacity-70">
              {transferring ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {transferring ? 'جاري التحويل...' : 'تحويل'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Clients Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>آخر العملاء المسجلين</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
                <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>العميل</th>
                <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الدقائق</th>
                <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الرصيد</th>
                <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الحالة</th>
                <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {recentClients.map((client) => (
                <tr key={client.id} className={`border-b transition-colors ${isDark ? 'border-[#1f1f23]/50 hover:bg-[#1a1a1d]' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                        <span className="text-purple-500 font-bold text-sm">{client.name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{client.name}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {client.minutes_balance != null ? client.minutes_balance.toFixed(1) : '—'}
                  </td>
                  <td className={`px-6 py-4 font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {client.credits_balance != null ? client.credits_balance.toFixed(1) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-sm ${client.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${client.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      {client.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleQuickTransfer(client.email)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${isDark ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}>
                      <DollarSign className="w-3.5 h-3.5" />
                      تحويل رصيد
                    </button>
                  </td>
                </tr>
              ))}
              {recentClients.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center">
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>لا يوجد عملاء بعد</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== Transfer Modal ====== */}
      {showTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowTransfer(false)}>
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>تحويل رصيد</h3>
              </div>
              <button onClick={() => setShowTransfer(false)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-[#1a1a1d] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>البريد الإلكتروني للعميل</label>
                <input type="email" value={transferForm.email} onChange={(e) => setTransferForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="client@example.com" dir="ltr" autoFocus
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>المبلغ</label>
                <input type="number" value={transferForm.amount} onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00" min="0" step="0.01" dir="ltr"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>العملية</label>
                  <select value={transferForm.operation} onChange={(e) => setTransferForm(prev => ({ ...prev, operation: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                    <option value="add">إضافة رصيد</option>
                    <option value="subtract">خصم رصيد</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>النوع</label>
                  <select value={transferForm.transfer_type} onChange={(e) => setTransferForm(prev => ({ ...prev, transfer_type: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                    <option value="balance">رصيد (Credits)</option>
                    <option value="minutes">دقائق</option>
                  </select>
                </div>
              </div>
              <div className={`p-3 rounded-xl text-sm flex items-start gap-2 ${isDark ? 'bg-purple-500/5 border border-purple-500/20 text-purple-300' : 'bg-purple-50 border border-purple-100 text-purple-700'}`}>
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>يتم التحويل عبر AutoCalls API مباشرة إلى حساب العميل</span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setShowTransfer(false)} className={`flex-1 py-3 rounded-xl font-medium border transition-colors ${isDark ? 'bg-[#1a1a1d] border-[#1f1f23] text-white hover:bg-[#222225]' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}>إلغاء</button>
                <button onClick={handleTransfer} disabled={transferring}
                  className="flex-1 py-3 bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                  {transferring ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {transferring ? 'جاري التحويل...' : 'تأكيد التحويل'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, isDark }) {
  const colorClasses = {
    purple: 'bg-purple-500/10 text-purple-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    teal: 'bg-teal-500/10 text-teal-500',
    cyan: 'bg-cyan-500/10 text-cyan-500',
    red: 'bg-red-500/10 text-red-500',
  };
  return (
    <div className={`rounded-2xl p-6 border transition-colors ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}