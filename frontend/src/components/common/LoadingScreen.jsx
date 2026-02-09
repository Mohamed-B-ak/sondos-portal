import { useTheme } from '@/hooks/useTheme';

export default function LoadingScreen() {
  const { isDark } = useTheme();
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-[#0a0a0b]' : 'bg-[#f8fafc]'
    }`}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          جاري التحقق من الجلسة...
        </p>
      </div>
    </div>
  );
}
