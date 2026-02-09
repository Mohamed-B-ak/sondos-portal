import { useTheme } from '@/hooks/useTheme';

export default function QuickActionCard({ icon: Icon, title, description, onClick, color = "teal" }) {
  const { isDark } = useTheme();

  const colorClasses = {
    teal: {
      hover: 'hover:border-teal-500/30',
      iconBg: 'bg-teal-500/10 group-hover:bg-teal-500/20',
      iconColor: 'text-teal-500',
    },
    cyan: {
      hover: 'hover:border-cyan-500/30',
      iconBg: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
      iconColor: 'text-cyan-500',
    },
    gray: {
      hover: 'hover:border-gray-500/30',
      iconBg: 'bg-gray-500/10 group-hover:bg-gray-500/20',
      iconColor: 'text-gray-500',
    },
  };

  const colors = colorClasses[color] || colorClasses.teal;

  return (
    <button 
      onClick={onClick}
      className={`rounded-2xl p-6 text-right border transition-all group w-full ${colors.hover} ${
        isDark 
          ? 'bg-[#111113] border-[#1f1f23] hover:bg-[#151517]' 
          : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'
      }`}
    >
      <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center mb-4 transition-colors`}>
        <Icon className={`w-6 h-6 ${colors.iconColor}`} />
      </div>
      <h3 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      {description && (
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
      )}
    </button>
  );
}
