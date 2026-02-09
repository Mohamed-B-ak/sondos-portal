import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, FileText,
  Settings, LogOut, Shield
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function AdminSidebar({ onLogout }) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم', exact: true },
    { path: '/admin/clients', icon: Users, label: 'العملاء' },
    { path: '/admin/plans', icon: CreditCard, label: 'الباقات' },
    { path: '/admin/reports', icon: FileText, label: 'التقارير' },
    { path: '/admin/settings', icon: Settings, label: 'الإعدادات' },
  ];

  const isActive = (item) => item.exact
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path);

  return (
    <aside className={`w-72 border-l flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
      <div className={`p-6 border-b transition-colors ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Sondos AI</span>
            <p className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>لوحة الإدارة</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive(item) ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                : isDark ? 'text-gray-400 hover:bg-[#1a1a1d] hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}>
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={`p-4 border-t transition-colors ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
        <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">م</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>المدير العام</p>
            <p className={`text-sm truncate ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>admin@sondos.ai</p>
          </div>
          <button onClick={onLogout} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1a1a1d] text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
