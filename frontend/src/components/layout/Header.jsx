import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sun, Moon, CheckCircle2, AlertTriangle, XCircle, Info, Check, Trash2 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';

const API_BASE = '/api';

// Time ago - translated
const timeAgo = (date, t) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return t('header.justNow');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t('header.minutesAgo').replace('{n}', minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('header.hoursAgo').replace('{n}', hours);
  const days = Math.floor(hours / 24);
  if (days < 30) return t('header.daysAgo').replace('{n}', days);
  return t('header.monthsAgo').replace('{n}', Math.floor(days / 30));
};

// Notification type config
const typeConfig = {
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  error:   { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  info:    { icon: Info, color: 'text-teal-500', bg: 'bg-teal-500/10' },
};

export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { t, lang, toggleLanguage } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (err) {
      // Silent fail
    }
  };

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark one as read
  const markAsRead = async (id) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const removed = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (removed && !removed.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  return (
    <header className={`h-16 border-b flex items-center justify-between px-8 transition-colors duration-300 ${
      isDark 
        ? 'bg-[#111113] border-[#1f1f23]' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder={t('header.search')}
            className={`w-80 pl-4 pr-11 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-colors ${
              isDark 
                ? 'bg-[#0a0a0b] border border-[#1f1f23] text-white placeholder-gray-500' 
                : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${
            isDark 
              ? 'bg-[#1a1a1d] hover:bg-[#222225] text-teal-400' 
              : 'bg-gray-100 hover:bg-gray-200 text-teal-600'
          }`}
          title={lang === 'ar' ? t('header.switchToEn') : t('header.switchToAr')}
        >
          {lang === 'ar' ? 'EN' : 'ع'}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl transition-all ${
            isDark 
              ? 'bg-[#1a1a1d] hover:bg-[#222225] text-yellow-400' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
          title={isDark ? t('header.lightMode') : t('header.darkMode')}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`relative p-2.5 rounded-xl transition-colors ${
              isOpen
                ? isDark ? 'bg-[#1a1a1d]' : 'bg-gray-100'
                : isDark ? 'hover:bg-[#1a1a1d]' : 'hover:bg-gray-100'
            }`}
          >
            <Bell className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 flex items-center justify-center px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className={`absolute top-full mt-2 w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
              lang === 'ar' ? 'left-0' : 'right-0'
            } ${
              isDark 
                ? 'bg-[#111113] border-[#1f1f23]' 
                : 'bg-white border-gray-200'
            }`}>
              {/* Dropdown Header */}
              <div className={`flex items-center justify-between px-5 py-4 border-b ${
                isDark ? 'border-[#1f1f23]' : 'border-gray-100'
              }`}>
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('header.notifications')}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="min-w-[22px] h-[22px] flex items-center justify-center px-1.5 text-xs font-bold text-white bg-teal-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs font-medium text-teal-500 hover:text-teal-400 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {t('header.markAllRead')}
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('header.noNotifications')}
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const config = typeConfig[notif.type] || typeConfig.info;
                    const Icon = config.icon;

                    return (
                      <div
                        key={notif._id}
                        className={`flex items-start gap-3 px-5 py-4 border-b transition-colors cursor-pointer group ${
                          isDark 
                            ? `border-[#1f1f23] ${!notif.read ? 'bg-teal-500/5' : ''} hover:bg-[#1a1a1d]`
                            : `border-gray-50 ${!notif.read ? 'bg-teal-50/50' : ''} hover:bg-gray-50`
                        }`}
                        onClick={() => !notif.read && markAsRead(notif._id)}
                      >
                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${config.bg}`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                            )}
                            <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {notif.title}
                            </p>
                          </div>
                          <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {notif.message}
                          </p>
                          <p className={`text-xs mt-1.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            {timeAgo(notif.createdAt, t)}
                          </p>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                          className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0 ${
                            isDark 
                              ? 'hover:bg-[#222225] text-gray-500 hover:text-red-400'
                              : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}