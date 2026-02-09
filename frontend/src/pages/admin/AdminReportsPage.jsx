import { 
  Download, Calendar, TrendingUp, Phone, 
  DollarSign, Users, FileText, Filter
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function AdminReportsPage() {
  const { isDark } = useTheme();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            التقارير
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            تقارير وإحصائيات المنصة
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className={`px-4 py-2.5 rounded-xl border focus:outline-none ${
            isDark 
              ? 'bg-[#111113] border-[#1f1f23] text-white' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <option>آخر 7 أيام</option>
            <option>آخر 30 يوم</option>
            <option>آخر 3 أشهر</option>
            <option>هذه السنة</option>
          </select>
          <button className="px-5 py-2.5 bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25">
            <Download className="w-5 h-5" />
            تصدير التقارير
          </button>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-4 gap-4">
        <ReportCard 
          icon={Phone} 
          title="تقرير المكالمات" 
          value="45,678" 
          subtitle="إجمالي المكالمات" 
          color="purple" 
          isDark={isDark} 
        />
        <ReportCard 
          icon={DollarSign} 
          title="تقرير الإيرادات" 
          value="125,000" 
          subtitle="ريال هذا الشهر" 
          color="emerald" 
          isDark={isDark} 
        />
        <ReportCard 
          icon={Users} 
          title="تقرير العملاء" 
          value="156" 
          subtitle="عميل نشط" 
          color="cyan" 
          isDark={isDark} 
        />
        <ReportCard 
          icon={TrendingUp} 
          title="معدل النمو" 
          value="+18%" 
          subtitle="مقارنة بالشهر الماضي" 
          color="teal" 
          isDark={isDark} 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Calls Trend */}
        <div className={`rounded-2xl p-6 border ${
          isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            اتجاه المكالمات
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 65, 45, 80, 55, 70, 90, 75, 85, 60, 95, 88].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-pink-400 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${value}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>يناير</span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>ديسمبر</span>
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className={`rounded-2xl p-6 border ${
          isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            توزيع الإيرادات حسب الباقة
          </h3>
          <div className="flex items-center justify-center h-48">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90">
                <circle cx="96" cy="96" r="70" fill="none" stroke={isDark ? '#1f1f23' : '#e5e7eb'} strokeWidth="24" />
                <circle cx="96" cy="96" r="70" fill="none" stroke="#eab308" strokeWidth="24" strokeDasharray="198 242" strokeLinecap="round" />
                <circle cx="96" cy="96" r="70" fill="none" stroke="#6b7280" strokeWidth="24" strokeDasharray="132 308" strokeDashoffset="-198" strokeLinecap="round" />
                <circle cx="96" cy="96" r="70" fill="none" stroke="#f97316" strokeWidth="24" strokeDasharray="110 330" strokeDashoffset="-330" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ذهبية 45%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-500 rounded-full" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>فضية 30%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>برونزية 25%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className={`rounded-2xl border ${
        isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'
      }`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            التقارير المتاحة
          </h3>
        </div>
        <div className="p-6 grid grid-cols-3 gap-4">
          {[
            { title: 'تقرير المكالمات الشامل', icon: Phone, desc: 'تفاصيل جميع المكالمات' },
            { title: 'تقرير الإيرادات', icon: DollarSign, desc: 'تحليل الإيرادات والأرباح' },
            { title: 'تقرير العملاء', icon: Users, desc: 'قائمة ونشاط العملاء' },
            { title: 'تقرير الباقات', icon: FileText, desc: 'استخدام الباقات' },
            { title: 'تقرير الأداء', icon: TrendingUp, desc: 'مؤشرات الأداء الرئيسية' },
            { title: 'تقرير مخصص', icon: Filter, desc: 'إنشاء تقرير مخصص' },
          ].map((report, i) => (
            <button
              key={i}
              className={`p-4 rounded-xl border text-right transition-all group ${
                isDark 
                  ? 'bg-[#0a0a0b] border-[#1f1f23] hover:border-purple-500/30' 
                  : 'bg-gray-50 border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <report.icon className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{report.title}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{report.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportCard({ icon: Icon, title, value, subtitle, color, isDark }) {
  const colorClasses = {
    purple: 'bg-purple-500/10 text-purple-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    cyan: 'bg-cyan-500/10 text-cyan-500',
    teal: 'bg-teal-500/10 text-teal-500',
  };

  return (
    <div className={`rounded-xl p-5 border ${
      isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'
    }`}>
      <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{subtitle}</p>
    </div>
  );
}
