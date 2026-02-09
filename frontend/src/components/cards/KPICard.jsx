import { useTheme } from '@/hooks/useTheme';

export default function KPICard({ icon: Icon, title, value, trend, color = "cyan", trendDown }) {
  const { isDark } = useTheme();

  const colors = {
    cyan: "bg-cyan-500/10 text-cyan-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    teal: "bg-teal-500/10 text-teal-500",
    purple: "bg-purple-500/10 text-purple-500",
    orange: "bg-orange-500/10 text-orange-500",
    blue: "bg-blue-500/10 text-blue-500",
    red: "bg-red-500/10 text-red-500",
    yellow: "bg-yellow-500/10 text-yellow-500",
    gray: "bg-gray-500/10 text-gray-500",
  };

  return (
    <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
      isDark 
        ? 'bg-[#111113] border-[#1f1f23]' 
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trendDown ? "text-red-500" : "text-emerald-500"}`}>
            {trend}
          </span>
        )}
      </div>
      <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
