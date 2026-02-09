import { useState } from 'react';
import { 
  Plus, Edit, Trash2, Check, Crown, Star, Zap,
  Phone, Clock, Users, Mic
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const plansData = [
  {
    id: 1,
    name: 'الباقة البرونزية',
    price: 500,
    period: 'شهرياً',
    color: 'orange',
    icon: Zap,
    features: [
      { label: 'عدد المكالمات', value: '500 مكالمة' },
      { label: 'مدة المكالمة', value: '5 دقائق' },
      { label: 'عدد الأصوات', value: '2 صوت' },
      { label: 'الدعم الفني', value: 'بريد إلكتروني' },
    ],
    clients: 31,
    popular: false,
  },
  {
    id: 2,
    name: 'الباقة الفضية',
    price: 1000,
    period: 'شهرياً',
    color: 'gray',
    icon: Star,
    features: [
      { label: 'عدد المكالمات', value: '1500 مكالمة' },
      { label: 'مدة المكالمة', value: '10 دقائق' },
      { label: 'عدد الأصوات', value: '4 أصوات' },
      { label: 'الدعم الفني', value: 'واتساب + بريد' },
    ],
    clients: 55,
    popular: false,
  },
  {
    id: 3,
    name: 'الباقة الذهبية',
    price: 2000,
    period: 'شهرياً',
    color: 'yellow',
    icon: Crown,
    features: [
      { label: 'عدد المكالمات', value: 'غير محدود' },
      { label: 'مدة المكالمة', value: '15 دقيقة' },
      { label: 'عدد الأصوات', value: 'جميع الأصوات' },
      { label: 'الدعم الفني', value: 'أولوية 24/7' },
    ],
    clients: 70,
    popular: true,
  },
];

export default function AdminPlansPage() {
  const { isDark } = useTheme();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            إدارة الباقات
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            إنشاء وتعديل باقات الاشتراك
          </p>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25">
          <Plus className="w-5 h-5" />
          إضافة باقة
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-3 gap-6">
        {plansData.map((plan) => (
          <PlanCard key={plan.id} plan={plan} isDark={isDark} />
        ))}
      </div>

      {/* Plans Comparison Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'
      }`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            مقارنة الباقات
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
              <th className={`text-right px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الميزة</th>
              <th className={`text-center px-6 py-4 text-sm font-medium text-orange-500`}>البرونزية</th>
              <th className={`text-center px-6 py-4 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الفضية</th>
              <th className={`text-center px-6 py-4 text-sm font-medium text-yellow-500`}>الذهبية</th>
            </tr>
          </thead>
          <tbody>
            {[
              { feature: 'عدد المكالمات', bronze: '500', silver: '1,500', gold: 'غير محدود' },
              { feature: 'مدة المكالمة القصوى', bronze: '5 دقائق', silver: '10 دقائق', gold: '15 دقيقة' },
              { feature: 'عدد الأصوات', bronze: '2', silver: '4', gold: 'الكل' },
              { feature: 'تسجيل المكالمات', bronze: false, silver: true, gold: true },
              { feature: 'التقارير المتقدمة', bronze: false, silver: true, gold: true },
              { feature: 'API Access', bronze: false, silver: false, gold: true },
              { feature: 'الدعم الفني', bronze: 'بريد', silver: 'واتساب', gold: '24/7' },
            ].map((row, i) => (
              <tr 
                key={i}
                className={`border-b ${isDark ? 'border-[#1f1f23]/50' : 'border-gray-100'}`}
              >
                <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {row.feature}
                </td>
                <td className="px-6 py-4 text-center">
                  {typeof row.bronze === 'boolean' ? (
                    row.bronze ? (
                      <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>—</span>
                    )
                  ) : (
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{row.bronze}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {typeof row.silver === 'boolean' ? (
                    row.silver ? (
                      <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>—</span>
                    )
                  ) : (
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{row.silver}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {typeof row.gold === 'boolean' ? (
                    row.gold ? (
                      <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>—</span>
                    )
                  ) : (
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.gold}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlanCard({ plan, isDark }) {
  const colorClasses = {
    orange: {
      gradient: 'from-orange-500 to-orange-400',
      bg: 'bg-orange-500/10',
      text: 'text-orange-500',
      border: 'border-orange-500/30',
    },
    gray: {
      gradient: 'from-gray-500 to-gray-400',
      bg: isDark ? 'bg-gray-500/10' : 'bg-gray-100',
      text: isDark ? 'text-gray-400' : 'text-gray-600',
      border: isDark ? 'border-gray-500/30' : 'border-gray-300',
    },
    yellow: {
      gradient: 'from-yellow-500 to-yellow-400',
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-500',
      border: 'border-yellow-500/30',
    },
  };

  const colors = colorClasses[plan.color];
  const Icon = plan.icon;

  return (
    <div className={`rounded-2xl border p-6 relative overflow-hidden transition-colors ${
      plan.popular 
        ? `border-yellow-500/50 ${isDark ? 'bg-[#111113]' : 'bg-white'}` 
        : isDark 
          ? 'bg-[#111113] border-[#1f1f23]' 
          : 'bg-white border-gray-200'
    }`}>
      {plan.popular && (
        <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
          الأكثر شعبية
        </div>
      )}

      {/* Icon */}
      <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center mb-4`}>
        <Icon className={`w-7 h-7 ${colors.text}`} />
      </div>

      {/* Name & Price */}
      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {plan.name}
      </h3>
      <div className="flex items-baseline gap-2 mb-6">
        <span className={`text-4xl font-bold ${colors.text}`}>{plan.price}</span>
        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>ريال / {plan.period}</span>
      </div>

      {/* Features */}
      <div className="space-y-3 mb-6">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{feature.label}</span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{feature.value}</span>
          </div>
        ))}
      </div>

      {/* Clients Count */}
      <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${
        isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'
      }`}>
        <Users className={`w-5 h-5 ${colors.text}`} />
        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{plan.clients} عميل مشترك</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${
          isDark 
            ? 'bg-[#1a1a1d] hover:bg-[#222225] text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
        }`}>
          <Edit className="w-4 h-4 inline ml-2" />
          تعديل
        </button>
        <button className={`p-2.5 rounded-xl transition-colors ${
          isDark 
            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' 
            : 'bg-red-50 hover:bg-red-100 text-red-500'
        }`}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
