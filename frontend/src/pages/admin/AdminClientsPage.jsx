import { useState } from 'react';
import { 
  Search, Filter, Plus, Eye, Edit, Trash2, 
  MoreVertical, Phone, Mail, Building, Calendar,
  Users, UserCheck, UserX, Crown
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const clientsData = [
  { id: 1, name: 'مستشفى الرياض', email: 'info@riyadh-hospital.com', phone: '0112345678', plan: 'الباقة الذهبية', status: 'active', calls: 12500, balance: 5000, joinDate: '2024/01/15' },
  { id: 2, name: 'مركز الشفاء الطبي', email: 'contact@shifa.com', phone: '0119876543', plan: 'الباقة الفضية', status: 'active', calls: 8560, balance: 2500, joinDate: '2024/02/01' },
  { id: 3, name: 'عيادات النور', email: 'info@alnoor.com', phone: '0114567890', plan: 'الباقة البرونزية', status: 'active', calls: 4320, balance: 1200, joinDate: '2024/02/15' },
  { id: 4, name: 'مجمع الصحة', email: 'health@complex.com', phone: '0117654321', plan: 'الباقة الذهبية', status: 'active', calls: 15670, balance: 8000, joinDate: '2024/01/01' },
  { id: 5, name: 'مركز العناية', email: 'care@center.com', phone: '0118765432', plan: 'الباقة الفضية', status: 'pending', calls: 2340, balance: 500, joinDate: '2024/03/01' },
  { id: 6, name: 'عيادة الأمل', email: 'hope@clinic.com', phone: '0113456789', plan: 'الباقة البرونزية', status: 'inactive', calls: 890, balance: 0, joinDate: '2024/01/20' },
];

export default function AdminClientsPage() {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredClients = clientsData.filter(client => {
    const matchesSearch = client.name.includes(searchQuery) || client.email.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalClients = clientsData.length;
  const activeClients = clientsData.filter(c => c.status === 'active').length;
  const pendingClients = clientsData.filter(c => c.status === 'pending').length;
  const inactiveClients = clientsData.filter(c => c.status === 'inactive').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            إدارة العملاء
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            عرض وإدارة جميع عملاء المنصة
          </p>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25">
          <Plus className="w-5 h-5" />
          إضافة عميل
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} label="إجمالي العملاء" value={totalClients} color="purple" isDark={isDark} />
        <StatCard icon={UserCheck} label="العملاء النشطين" value={activeClients} color="emerald" isDark={isDark} />
        <StatCard icon={Crown} label="قيد المراجعة" value={pendingClients} color="yellow" isDark={isDark} />
        <StatCard icon={UserX} label="غير نشط" value={inactiveClients} color="red" isDark={isDark} />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="بحث بالاسم أو البريد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-80 pl-4 pr-11 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                isDark 
                  ? 'bg-[#111113] border-[#1f1f23] text-white placeholder-gray-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
          <div className={`flex items-center gap-1 p-1 rounded-xl border ${
            isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'
          }`}>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'active', label: 'نشط' },
              { id: 'pending', label: 'معلق' },
              { id: 'inactive', label: 'غير نشط' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === f.id 
                    ? 'bg-purple-500/20 text-purple-500' 
                    : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          {filteredClients.length} عميل
        </p>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'
      }`}>
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
              <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>العميل</th>
              <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الباقة</th>
              <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>المكالمات</th>
              <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الرصيد</th>
              <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>تاريخ الانضمام</th>
              <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الحالة</th>
              <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr 
                key={client.id}
                className={`border-b transition-colors ${
                  isDark 
                    ? 'border-[#1f1f23]/50 hover:bg-[#1a1a1d]' 
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{client.name}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{client.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    client.plan === 'الباقة الذهبية' 
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : client.plan === 'الباقة الفضية'
                        ? isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-200 text-gray-600'
                        : 'bg-orange-500/20 text-orange-500'
                  }`}>
                    {client.plan}
                  </span>
                </td>
                <td className={`px-6 py-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {client.calls.toLocaleString()}
                </td>
                <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {client.balance.toLocaleString()} ريال
                </td>
                <td className={`px-6 py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {client.joinDate}
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-sm ${
                    client.status === 'active' 
                      ? 'text-emerald-500' 
                      : client.status === 'pending'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      client.status === 'active' 
                        ? 'bg-emerald-500' 
                        : client.status === 'pending'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`} />
                    {client.status === 'active' ? 'نشط' : client.status === 'pending' ? 'معلق' : 'غير نشط'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-[#222225]' : 'hover:bg-gray-100'
                    }`}>
                      <Eye className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    <button className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-[#222225]' : 'hover:bg-gray-100'
                    }`}>
                      <Edit className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    <button className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-50'
                    }`}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, isDark }) {
  const colorClasses = {
    purple: 'bg-purple-500/10 text-purple-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    red: 'bg-red-500/10 text-red-500',
  };

  return (
    <div className={`rounded-xl p-4 border ${
      isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'
    }`}>
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
