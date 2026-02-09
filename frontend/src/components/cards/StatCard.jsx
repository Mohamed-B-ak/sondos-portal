import { useTheme } from '@/hooks/useTheme';

export default function StatCard({ icon: Icon, label, value, unit, trend, color = "teal" }) {
  const { isDark } = useTheme();

  const colors = {
    teal: "text-teal-500",
    cyan: "text-cyan-500",
    emerald: "text-emerald-500",
    orange: "text-orange-500",
    purple: "text-purple-500",
    red: "text-red-500",
    yellow: "text-yellow-500",
    blue: "text-blue-500",
  };

  return (
    <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
      isDark 
        ? 'bg-[#111113] border-[#1f1f23]' 
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <Icon className={`w-6 h-6 ${colors[color]} mb-3`} />
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {value} {unit && (
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{unit}</span>
        )}
      </p>
      {trend && (
        <p className="text-emerald-500 text-sm mt-2 flex items-center gap-1">
          {trend}
        </p>
      )}
    </div>
  );
}
