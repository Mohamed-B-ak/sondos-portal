import { useState, useEffect } from "react";
import { 
  Users, 
  Globe, 
  Settings, 
  Bell, 
  Shield, 
  Key,
  Save,
  User,
  Mail,
  Phone,
  Building,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { authAPI, getStoredUser } from "@/services/api/authAPI";

export default function GeneralSettings() {
  const { isDark } = useTheme();
  const { t, isAr } = useLanguage();

  const TIMEZONES = [
    { value: 'Asia/Riyadh', label: t('sett.tzRiyadh') },
    { value: 'Asia/Dubai', label: t('sett.tzDubai') },
    { value: 'Asia/Kuwait', label: t('sett.tzKuwait') },
    { value: 'Asia/Qatar', label: t('sett.tzQatar') },
    { value: 'Asia/Bahrain', label: t('sett.tzBahrain') },
    { value: 'Asia/Muscat', label: t('sett.tzMuscat') },
    { value: 'Africa/Cairo', label: t('sett.tzCairo') },
    { value: 'Asia/Amman', label: t('sett.tzAmman') },
    { value: 'Asia/Beirut', label: t('sett.tzBeirut') },
    { value: 'Asia/Baghdad', label: t('sett.tzBaghdad') },
    { value: 'Africa/Casablanca', label: t('sett.tzMorocco') },
    { value: 'Africa/Tunis', label: t('sett.tzTunis') },
    { value: 'Africa/Algiers', label: t('sett.tzAlgiers') },
  ];

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    timezone: 'Asia/Riyadh',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [settings, setSettings] = useState({
    autoReply: true,
    recordCalls: true,
    emailNotifications: false,
    smsNotifications: true,
    weeklyReport: true,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      let userData = getStoredUser();
      const response = await authAPI.me();
      if (response.success && response.data) {
        userData = response.data;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      if (userData) {
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          company: userData.company || '',
          timezone: userData.timezone || 'Asia/Riyadh',
        });
        if (userData.settings) {
          setSettings(prev => ({ ...prev, ...userData.settings }));
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      const userData = getStoredUser();
      if (userData) {
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          company: userData.company || '',
          timezone: userData.timezone || 'Asia/Riyadh',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await authAPI.updateProfile({
        name: formData.name,
        phone: formData.phone,
        company: formData.company,
        timezone: formData.timezone,
        settings: settings,
      });
      if (response.success) {
        setMessage({ type: 'success', text: t('sett.savedSuccess') });
        if (response.data) setUser(response.data);
      } else {
        setMessage({ type: 'error', text: response.message || t('sett.saveError') });
      }
    } catch (error) {
      console.error('Save profile error:', error);
      setMessage({ type: 'error', text: error.message || t('sett.saveError') });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword) {
      setMessage({ type: 'error', text: t('sett.enterCurrentPassword') });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: t('sett.passwordMinLength') });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: t('sett.passwordMismatch') });
      return;
    }
    setChangingPassword(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await authAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      if (response.success) {
        setMessage({ type: 'success', text: t('sett.passwordChanged') });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: response.message || t('sett.passwordChangeError') });
      }
    } catch (error) {
      console.error('Password change error:', error);
      setMessage({ type: 'error', text: error.message || t('sett.passwordChangeError') });
    } finally {
      setChangingPassword(false);
    }
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-teal-500' : 'text-teal-600'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Message */}
      {message.text && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${
          message.type === 'success' 
            ? isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
            : isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Info */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Users className="w-5 h-5 text-teal-400" />
            {t('sett.accountInfo')}
          </h3>
          <div className="space-y-4">
            <InputField icon={User} label={t('sett.fullName')} value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} isDark={isDark} />
            <InputField icon={Mail} label={t('sett.email')} type="email" value={formData.email} disabled={true} hint={t('sett.emailHint')} isDark={isDark} />
            <InputField icon={Phone} label={t('sett.phone')} type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} isDark={isDark} />
            <InputField icon={Building} label={t('sett.company')} value={formData.company} onChange={(e) => handleInputChange('company', e.target.value)} isDark={isDark} />
          </div>
        </div>

        {/* Language & Time */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Globe className="w-5 h-5 text-cyan-400" />
            {t('sett.langAndTime')}
          </h3>
          <div className="space-y-4">
            <SelectField label={t('sett.defaultLang')} value={t('sett.arabic')} options={[{ value: 'ar', label: t('sett.arabic') }, { value: 'en', label: 'English' }]} disabled={true} isDark={isDark} />
            <SelectField label={t('sett.timezone')} value={formData.timezone} onChange={(e) => handleInputChange('timezone', e.target.value)} options={TIMEZONES} isDark={isDark} />
            <SelectField label={t('sett.dateFormat')} value="dd/mm/yyyy" options={[{ value: 'dd/mm/yyyy', label: t('sett.dmy') }, { value: 'mm/dd/yyyy', label: t('sett.mdy') }, { value: 'yyyy/mm/dd', label: t('sett.ymd') }]} isDark={isDark} />
          </div>
        </div>

        {/* Change Password */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Key className="w-5 h-5 text-yellow-400" />
            {t('sett.changePassword')}
          </h3>
          <div className="space-y-4">
            <PasswordField label={t('sett.currentPassword')} value={passwordData.currentPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))} show={showPasswords.current} onToggle={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))} isDark={isDark} />
            <PasswordField label={t('sett.newPassword')} value={passwordData.newPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} show={showPasswords.new} onToggle={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))} isDark={isDark} />
            <div>
              <PasswordField label={t('sett.confirmPassword')} value={passwordData.confirmPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} show={showPasswords.confirm} onToggle={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))} isDark={isDark} />
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{t('sett.passwordMismatch')}</p>
              )}
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                changingPassword || !passwordData.currentPassword || !passwordData.newPassword
                  ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                  : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
              }`}
            >
              {changingPassword ? (
                <><Loader2 className="w-5 h-5 animate-spin" />{t('sett.changingPassword')}</>
              ) : (
                <><Key className="w-5 h-5" />{t('sett.changePassword')}</>
              )}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Bell className="w-5 h-5 text-purple-400" />
            {t('sett.notifications')}
          </h3>
          <div className="space-y-4">
            <ToggleItem title={t('sett.emailNotifications')} description={t('sett.emailNotificationsDesc')} enabled={settings.emailNotifications} onToggle={() => toggleSetting('emailNotifications')} isDark={isDark} />
            <ToggleItem title={t('sett.smsNotifications')} description={t('sett.smsNotificationsDesc')} enabled={settings.smsNotifications} onToggle={() => toggleSetting('smsNotifications')} isDark={isDark} />
            <ToggleItem title={t('sett.weeklyReport')} description={t('sett.weeklyReportDesc')} enabled={settings.weeklyReport} onToggle={() => toggleSetting('weeklyReport')} isDark={isDark} />
          </div>
        </div>

        {/* Agent Settings */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Settings className="w-5 h-5 text-teal-400" />
            {t('sett.assistantSettings')}
          </h3>
          <div className="space-y-4">
            <ToggleItem title={t('sett.autoReply')} description={t('sett.autoReplyDesc')} enabled={settings.autoReply} onToggle={() => toggleSetting('autoReply')} isDark={isDark} />
            <ToggleItem title={t('sett.recordCalls')} description={t('sett.recordCallsDesc')} enabled={settings.recordCalls} onToggle={() => toggleSetting('recordCalls')} isDark={isDark} />
          </div>
        </div>

        {/* Account Details */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#111113] border border-[#1f1f23]' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Shield className="w-5 h-5 text-emerald-400" />
            {t('sett.accountDetails')}
          </h3>
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('sett.accountStatus')}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.isActive ? t('sett.accountActive') : t('sett.accountInactive')}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${user?.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {user?.isActive ? t('sett.active') : t('sett.inactive')}
              </span>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('sett.accountType')}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.role === 'admin' ? t('sett.admin') : t('sett.client')}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${user?.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-teal-500/10 text-teal-500'}`}>
                {user?.role === 'admin' ? t('sett.admin') : t('sett.client')}
              </span>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('sett.joinDate')}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') : '-'}</p>
              </div>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('sett.lastLogin')}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.lastLogin ? new Date(user.lastLogin).toLocaleString(isAr ? 'ar-SA' : 'en-US') : '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {message.type === 'success' ? t('sett.savedNote') : t('sett.unsavedNote')}
        </p>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadUserData}
            className={`px-6 py-3 font-medium rounded-xl transition-colors border ${isDark ? 'bg-[#1a1a1d] hover:bg-[#222225] text-white border-[#1f1f23]' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'}`}
          >
            {t('sett.discardChanges')}
          </button>
          <button 
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/25 flex items-center gap-2 disabled:opacity-70"
          >
            {saving ? (
              <><Loader2 className="w-5 h-5 animate-spin" />{t('sett.saving')}</>
            ) : (
              <><Save className="w-5 h-5" />{t('sett.saveChanges')}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================== Helper Components ==================

function InputField({ icon: Icon, label, type = "text", value, onChange, disabled, hint, isDark }) {
  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
      <div className="relative">
        {Icon && <Icon className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />}
        <input type={type} value={value} onChange={onChange} disabled={disabled}
          className={`w-full ${Icon ? 'pr-11' : 'px-4'} pl-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${
            disabled 
              ? isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-gray-500 cursor-not-allowed' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
          }`} />
      </div>
      {hint && <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{hint}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, disabled, isDark }) {
  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
      <select value={value} onChange={onChange} disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${
          disabled
            ? isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-gray-500 cursor-not-allowed' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            : isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
        }`}>
        {options.map((option, i) => (
          <option key={i} value={option.value || option}>{option.label || option}</option>
        ))}
      </select>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, isDark }) {
  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
      <div className="relative">
        <Key className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        <input type={show ? "text" : "password"} value={value} onChange={onChange}
          className={`w-full pr-11 pl-11 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
        <button type="button" onClick={onToggle} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}>
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
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
      <button onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? 'bg-teal-500' : isDark ? 'bg-[#2a2a2d]' : 'bg-gray-300'}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'left-1' : 'right-1'}`} />
      </button>
    </div>
  );
}
