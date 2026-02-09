import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Header from './Header';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout() {
  const { isDark } = useTheme();
  const { isAr } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${
        isDark ? 'bg-[#0a0a0b] text-white' : 'bg-[#f8fafc] text-gray-900'
      }`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <AdminSidebar onLogout={logout} user={user} />
      <main className="flex-1 overflow-auto">
        <Header userType="admin" user={user} onLogout={logout} />
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
