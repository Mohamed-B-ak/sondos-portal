import { useState, useEffect } from 'react';
import { 
  Search, Plus, Eye, Edit, Trash2, 
  Phone, Mail, Building, Calendar,
  Users, UserCheck, UserX, Loader2,
  X, Save, DollarSign, Send, CheckCircle,
  AlertCircle, Key, RefreshCw, EyeOff, Copy, Check
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { adminAPI } from '@/services/api/adminAPI';

export default function AdminClientsPage() {
  const { isDark } = useTheme();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  // Modals
  const [viewClient, setViewClient] = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Transfer Balance
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferOperation, setTransferOperation] = useState('add');
  const [transferring, setTransferring] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Copy state
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    loadClients();
  }, [filterStatus, pagination.page]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadClients();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 20 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (filterStatus !== 'all') params.status = filterStatus;
      params.role = 'client';

      const res = await adminAPI.getUsers(params);
      setClients(res.data.users);
      setPagination(res.data.pagination);

      // Also get total counts for stats
      const allRes = await adminAPI.getUsers({ role: 'client', limit: 1 });
      const activeRes = await adminAPI.getUsers({ role: 'client', status: 'active', limit: 1 });
      const inactiveRes = await adminAPI.getUsers({ role: 'client', status: 'inactive', limit: 1 });
      setStats({
        total: allRes.data.pagination.total,
        active: activeRes.data.pagination.total,
        inactive: inactiveRes.data.pagination.total,
      });
    } catch (err) {
      console.error('Load clients error:', err);
      setToast({ type: 'error', text: err.message || 'خطأ في تحميل العملاء' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (client) => {
    try {
      await adminAPI.updateUserStatus(client.id, !client.isActive);
      setToast({ type: 'success', text: client.isActive ? 'تم تعطيل الحساب' : 'تم تفعيل الحساب' });
      loadClients();
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminAPI.deleteUser(deleteTarget.id);
      setToast({ type: 'success', text: 'تم حذف العميل بنجاح' });
      setDeleteTarget(null);
      loadClients();
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (client) => {
    setEditForm({
      name: client.name,
      phone: client.phone,
      company: client.company || '',
      sondosApiKey: client.sondosApiKey || '',
      isActive: client.isActive,
    });
    setEditClient(client);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await adminAPI.updateUser(editClient.id, editForm);
      setToast({ type: 'success', text: 'تم تحديث بيانات العميل' });
      setEditClient(null);
      loadClients();
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setToast({ type: 'error', text: 'المبلغ يجب أن يكون أكبر من صفر' });
      return;
    }
    setTransferring(true);
    try {
      const res = await adminAPI.transferBalance({
        email: transferTarget.email,
        amount: parseFloat(transferAmount),
        operation: transferOperation,
        transfer_type: 'balance',
      });
      setToast({ type: 'success', text: res.message || 'تم التحويل بنجاح' });
      setTransferTarget(null);
      setTransferAmount('');
    } catch (err) {
      setToast({ type: 'error', text: err.message || 'فشل التحويل' });
    } finally {
      setTransferring(false);
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>إدارة العملاء</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>عرض وإدارة جميع عملاء المنصة</p>
        </div>
        <button onClick={loadClients} className={`p-3 rounded-xl border transition-colors ${
          isDark ? 'bg-[#111113] border-[#1f1f23] hover:bg-[#1a1a1d]' : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}>
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Users} label="إجمالي العملاء" value={stats.total} color="purple" isDark={isDark} />
        <StatCard icon={UserCheck} label="العملاء النشطين" value={stats.active} color="emerald" isDark={isDark} />
        <StatCard icon={UserX} label="غير نشط" value={stats.inactive} color="red" isDark={isDark} />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="بحث بالاسم، البريد، الشركة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-80 pl-4 pr-11 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                isDark ? 'bg-[#111113] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
          <div className={`flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'active', label: 'نشط' },
              { id: 'inactive', label: 'غير نشط' },
            ].map((f) => (
              <button key={f.id} onClick={() => { setFilterStatus(f.id); setPagination(prev => ({ ...prev, page: 1 })); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === f.id ? 'bg-purple-500/20 text-purple-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          {pagination.total} عميل
        </p>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className={`w-7 h-7 animate-spin ${isDark ? 'text-purple-500' : 'text-purple-600'}`} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
                  <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>العميل</th>
                  <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الهاتف</th>
                  <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>API</th>
                  <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>تاريخ التسجيل</th>
                  <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الحالة</th>
                  <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className={`border-b transition-colors ${isDark ? 'border-[#1f1f23]/50 hover:bg-[#1a1a1d]' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                          <span className="text-purple-500 font-bold text-sm">{client.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{client.name}</p>
                          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`} dir="ltr">
                      {client.phone}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        client.sondosApiKey
                          ? 'bg-teal-500/10 text-teal-500'
                          : isDark ? 'bg-gray-500/10 text-gray-500' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {client.sondosApiKey ? 'متصل' : 'غير متصل'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(client.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggleStatus(client)}
                        className={`flex items-center gap-1.5 text-sm cursor-pointer hover:opacity-80 transition-opacity ${client.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full ${client.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        {client.isActive ? 'نشط' : 'معطل'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewClient(client)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#222225]' : 'hover:bg-gray-100'}`} title="عرض">
                          <Eye className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        </button>
                        <button onClick={() => handleEdit(client)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#222225]' : 'hover:bg-gray-100'}`} title="تعديل">
                          <Edit className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        </button>
                        <button onClick={() => { setTransferTarget(client); setTransferAmount(''); setTransferOperation('add'); }} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-purple-500/10' : 'hover:bg-purple-50'}`} title="تحويل رصيد">
                          <DollarSign className="w-4 h-4 text-purple-500" />
                        </button>
                        <button onClick={() => setDeleteTarget(client)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'}`} title="حذف">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>لا يوجد عملاء</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className={`flex items-center justify-center gap-2 px-6 py-4 border-t ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setPagination(prev => ({ ...prev, page }))}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === pagination.page
                    ? 'bg-purple-500 text-white'
                    : isDark ? 'text-gray-400 hover:bg-[#1a1a1d]' : 'text-gray-500 hover:bg-gray-100'
                }`}>
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ====== View Client Modal ====== */}
      {viewClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setViewClient(null)}>
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>بيانات العميل</h3>
              <button onClick={() => setViewClient(null)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-[#1a1a1d] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <InfoRow label="الاسم" value={viewClient.name} isDark={isDark} />
              <InfoRow label="البريد" value={viewClient.email} isDark={isDark} dir="ltr" copyable onCopy={() => handleCopy(viewClient.email, 'email')} copied={copiedField === 'email'} />
              <InfoRow label="الهاتف" value={viewClient.phone} isDark={isDark} dir="ltr" copyable onCopy={() => handleCopy(viewClient.phone, 'phone')} copied={copiedField === 'phone'} />
              <InfoRow label="الشركة" value={viewClient.company || '—'} isDark={isDark} />
              <InfoRow label="كلمة المرور" value={viewClient.plainPassword || '—'} isDark={isDark} dir="ltr" copyable onCopy={() => handleCopy(viewClient.plainPassword, 'password')} copied={copiedField === 'password'} />
              <InfoRow label="مفتاح API" value={viewClient.sondosApiKey || '—'} isDark={isDark} dir="ltr" copyable={!!viewClient.sondosApiKey} onCopy={() => handleCopy(viewClient.sondosApiKey, 'apikey')} copied={copiedField === 'apikey'} />
              <InfoRow label="الحالة" value={viewClient.isActive ? 'نشط ✅' : 'معطل ❌'} isDark={isDark} />
              <InfoRow label="تاريخ التسجيل" value={new Date(viewClient.createdAt).toLocaleDateString('ar-SA')} isDark={isDark} />
              <InfoRow label="آخر تسجيل دخول" value={viewClient.lastLogin ? new Date(viewClient.lastLogin).toLocaleString('ar-SA') : 'لم يسجل دخول بعد'} isDark={isDark} />
            </div>
          </div>
        </div>
      )}

      {/* ====== Edit Client Modal ====== */}
      {editClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditClient(null)}>
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>تعديل العميل</h3>
              <button onClick={() => setEditClient(null)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-[#1a1a1d] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <FormField label="الاسم" value={editForm.name} onChange={(v) => setEditForm(prev => ({ ...prev, name: v }))} isDark={isDark} />
              <FormField label="الهاتف" value={editForm.phone} onChange={(v) => setEditForm(prev => ({ ...prev, phone: v }))} isDark={isDark} dir="ltr" />
              <FormField label="الشركة" value={editForm.company} onChange={(v) => setEditForm(prev => ({ ...prev, company: v }))} isDark={isDark} />
              <FormField label="مفتاح Sondos API" value={editForm.sondosApiKey} onChange={(v) => setEditForm(prev => ({ ...prev, sondosApiKey: v }))} isDark={isDark} dir="ltr" placeholder="sk-..." />
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setEditClient(null)} className={`flex-1 py-3 rounded-xl font-medium border transition-colors ${isDark ? 'bg-[#1a1a1d] border-[#1f1f23] text-white hover:bg-[#222225]' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}>إلغاء</button>
                <button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-3 bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {saving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== Transfer Balance Modal ====== */}
      {transferTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setTransferTarget(null)}>
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>تحويل رصيد</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{transferTarget.name}</p>
                </div>
              </div>
              <button onClick={() => setTransferTarget(null)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-[#1a1a1d] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>البريد الإلكتروني</p>
                <p className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`} dir="ltr">{transferTarget.email}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>المبلغ ($)</label>
                <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00" min="0" step="0.01" autoFocus
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                  dir="ltr" onKeyDown={(e) => e.key === 'Enter' && handleTransfer()} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>العملية</label>
                <select value={transferOperation} onChange={(e) => setTransferOperation(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                  <option value="add">إضافة رصيد</option>
                  <option value="subtract">خصم رصيد</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setTransferTarget(null)} className={`flex-1 py-3 rounded-xl font-medium border transition-colors ${isDark ? 'bg-[#1a1a1d] border-[#1f1f23] text-white hover:bg-[#222225]' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}>إلغاء</button>
                <button onClick={handleTransfer} disabled={transferring} className="flex-1 py-3 bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                  {transferring ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {transferring ? 'جاري التحويل...' : 'تأكيد التحويل'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== Delete Confirm Modal ====== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`} onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-500/10 flex items-center justify-center"><Trash2 className="w-7 h-7 text-red-500" /></div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>حذف العميل</h3>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                هل أنت متأكد من حذف <strong>{deleteTarget.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setDeleteTarget(null)} className={`flex-1 py-3 rounded-xl font-medium border transition-colors ${isDark ? 'bg-[#1a1a1d] border-[#1f1f23] text-white hover:bg-[#222225]' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}>إلغاء</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper Components ──

function StatCard({ icon: Icon, label, value, color, isDark }) {
  const colorClasses = {
    purple: 'bg-purple-500/10 text-purple-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    red: 'bg-red-500/10 text-red-500',
  };
  return (
    <div className={`rounded-xl p-4 border ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, isDark, dir, copyable, onCopy, copied }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`} dir={dir}>{value}</span>
        {copyable && value && value !== '—' && (
          <button onClick={onCopy} className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-[#1f1f23]' : 'hover:bg-gray-200'}`}>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className={`w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />}
          </button>
        )}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, isDark, dir, placeholder }) {
  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
        dir={dir} />
    </div>
  );
}