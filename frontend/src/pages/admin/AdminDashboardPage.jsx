import { 
  Users, CreditCard, Phone, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Activity,
  DollarSign, UserPlus, PhoneCall
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function AdminDashboardPage() {
  const { isDark } = useTheme();

  const stats = [
    { label: 'إجمالي العملاء', value: '156', trend: '+12%', trendUp: true, icon: Users, color: 'purple' },
    { label: 'العملاء النشطين', value: '142', trend: '+8%', trendUp: true, icon: Activity, color: 'emerald' },
    { label: 'الإيرادات الشهرية', value: '125,000', unit: 'ريال', trend: '+18%', trendUp: true, icon: DollarSign, color: 'teal' },
    { label: 'المكالمات اليوم', value: '3,456', trend: '+5%', trendUp: true, icon: PhoneCall, color: 'cyan' },
  ];

  const recentClients = [
    { name: 'مستشفى الرياض', plan: 'الباقة الذهبية', calls: 1234, status: 'active' },
    { name: 'مركز الشفاء الطبي', plan: 'الباقة الفضية', calls: 856, status: 'active' },
    { name: 'عيادات النور', plan: 'الباقة البرونزية', calls: 432, status: 'active' },
    { name: 'مجمع الصحة', plan: 'الباقة الذهبية', calls: 1567, status: 'active' },
    { name: 'مركز العناية', plan: 'الباقة الفضية', calls: 234, status: 'pending' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          لوحة تحكم المدير
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          نظرة عامة على أداء المنصة
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} isDark={isDark} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className={`rounded-2xl p-6 border transition-colors ${
          isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            الإيرادات الشهرية
          </h3>
          <div className="h-64 flex items-end justify-between gap-3">
            {[45, 65, 55, 80, 70, 95, 85, 75, 90, 100, 88, 92].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-pink-400 rounded-t-lg transition-all hover:from-purple-500 hover:to-pink-300"
                  style={{ height: `${value}%` }}
                />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {['ي', 'ف', 'م', 'أ', 'م', 'ي', 'ي', 'أ', 'س', 'أ', 'ن', 'د'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Clients Distribution */}
        <div className={`rounded-2xl p-6 border transition-colors ${
          isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            توزيع الباقات
          </h3>
          <div className="space-y-4">
            <PlanBar label="الباقة الذهبية" value={45} color="yellow" isDark={isDark} />
            <PlanBar label="الباقة الفضية" value={35} color="gray" isDark={isDark} />
            <PlanBar label="الباقة البرونزية" value={20} color="orange" isDark={isDark} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dashed ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}">
            <div className="text-center">
              <p className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>70</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ذهبية</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>55</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>فضية</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>31</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>برونزية</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Clients Table */}
      <div className={`rounded-2xl border overflow-hidden transition-colors ${
        isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'
      }`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            آخر العملاء
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
              <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                العميل
              </th>
              <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                الباقة
              </th>
              <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                المكالمات
              </th>
              <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                الحالة
              </th>
            </tr>
          </thead>
          <tbody>
            {recentClients.map((client, i) => (
              <tr 
                key={i} 
                className={`border-b transition-colors ${
                  isDark 
                    ? 'border-[#1f1f23]/50 hover:bg-[#1a1a1d]' 
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <td className="px-6 py-4">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {client.name}
                  </p>
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
                <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {client.calls.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-sm ${
                    client.status === 'active' ? 'text-emerald-500' : 'text-yellow-500'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      client.status === 'active' ? 'bg-emerald-500' : 'bg-yellow-500'
                    } ${client.status === 'active' ? 'animate-pulse' : ''}`} />
                    {client.status === 'active' ? 'نشط' : 'معلق'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, trend, trendUp, icon: Icon, color, isDark }) {
  const colorClasses = {
    purple: 'bg-purple-500/10 text-purple-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    teal: 'bg-teal-500/10 text-teal-500',
    cyan: 'bg-cyan-500/10 text-cyan-500',
  };

  return (
    <div className={`rounded-2xl p-6 border transition-colors ${
      isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-sm font-medium flex items-center gap-1 ${
          trendUp ? 'text-emerald-500' : 'text-red-500'
        }`}>
          {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trend}
        </span>
      </div>
      <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {value} {unit && <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{unit}</span>}
      </p>
    </div>
  );
}

function PlanBar({ label, value, color, isDark }) {
  const colorClasses = {
    yellow: 'from-yellow-500 to-yellow-400',
    gray: 'from-gray-500 to-gray-400',
    orange: 'from-orange-500 to-orange-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{label}</span>
        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}%</span>
      </div>
      <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-[#1f1f23]' : 'bg-gray-200'}`}>
        <div 
          className={`h-full bg-gradient-to-l ${colorClasses[color]} rounded-full transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
