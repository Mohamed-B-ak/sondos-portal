import { useState } from 'react';
import { 
  Settings, Shield, Globe, Bell, Database, 
  Key, Save, Server
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function AdminSettingsPage() {
  const { isDark } = useTheme();
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newRegistrations: true,
    emailNotifications: true,
    slackNotifications: false,
    autoBackup: true,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            إعدادات النظام
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            إدارة إعدادات المنصة العامة
          </p>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-l from-purple-500 to-pink-500 text-white font-bold rounded-xl flex items-center gap-2">
          <Save className="w-5 h-5" />
          حفظ الإعدادات
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className={`rounded-2xl border p-6 ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Settings className="w-5 h-5 text-purple-500" />
            الإعدادات العامة
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>اسم المنصة</label>
              <input defaultValue="Sondos AI" className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white' : 'bg-gray-50 border-gray-200'}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>البريد الإلكتروني</label>
              <input defaultValue="support@sondos.ai" className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white' : 'bg-gray-50 border-gray-200'}`} />
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border p-6 ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Server className="w-5 h-5 text-purple-500" />
            حالة النظام
          </h3>
          <div className="space-y-4">
            <ToggleItem title="وضع الصيانة" description="تعطيل الوصول مؤقتاً" enabled={settings.maintenanceMode} onToggle={() => toggleSetting('maintenanceMode')} isDark={isDark} />
            <ToggleItem title="التسجيلات الجديدة" description="السماح بتسجيل عملاء جدد" enabled={settings.newRegistrations} onToggle={() => toggleSetting('newRegistrations')} isDark={isDark} />
          </div>
        </div>

        <div className={`rounded-2xl border p-6 ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Bell className="w-5 h-5 text-purple-500" />
            الإشعارات
          </h3>
          <div className="space-y-4">
            <ToggleItem title="إشعارات البريد" description="إرسال تنبيهات عبر البريد" enabled={settings.emailNotifications} onToggle={() => toggleSetting('emailNotifications')} isDark={isDark} />
            <ToggleItem title="إشعارات Slack" description="إرسال تنبيهات لـ Slack" enabled={settings.slackNotifications} onToggle={() => toggleSetting('slackNotifications')} isDark={isDark} />
          </div>
        </div>

        <div className={`rounded-2xl border p-6 ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Shield className="w-5 h-5 text-purple-500" />
            الأمان
          </h3>
          <div className="space-y-4">
            <button className={`w-full py-3 rounded-xl font-medium ${isDark ? 'bg-[#0a0a0b] text-white' : 'bg-gray-100 text-gray-900'}`}>
              <Key className="w-4 h-4 inline ml-2" />
              إعادة تعيين مفاتيح API
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ title, description, enabled, onToggle, isDark }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
      <div>
        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
      </div>
      <button onClick={onToggle} className={`w-12 h-6 rounded-full relative ${enabled ? 'bg-purple-500' : isDark ? 'bg-[#2a2a2d]' : 'bg-gray-300'}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'left-1' : 'right-1'}`} />
      </button>
    </div>
  );
}
