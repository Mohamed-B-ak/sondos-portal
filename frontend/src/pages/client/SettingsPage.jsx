import { useState } from "react";
import { useLocation } from "react-router-dom";
import { 
  Settings, 
  Key,
  Wallet,
  Zap
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import GeneralSettings from "./settings/GeneralSettings";
import AutomationSettings from "./settings/AutomationSettings";
import BalancePage from "./BalancePage";
import APISettingsPage from "./APISettingsPage";

export default function SettingsPage() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();

  // Read tab from URL ONCE on mount (for redirects from /balance → /settings?tab=balance)
  // No navigate(), no useEffect — pure state only
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'automation' || tab === 'balance' || tab === 'api') return tab;
    return 'general';
  });

  const tabs = [
    { id: 'general', icon: Settings, label: t('sett.tabGeneral') },
    { id: 'automation', icon: Zap, label: t('sett.tabAutomation') || 'الأتمتة' },
    { id: 'balance', icon: Wallet, label: t('sett.tabBalance') },
    { id: 'api', icon: Key, label: t('sett.tabApi') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('sett.title')}
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          {t('sett.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1.5 rounded-2xl ${
        isDark 
          ? 'bg-[#111113] border border-[#1f1f23]' 
          : 'bg-gray-100 border border-gray-200'
      }`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex-1 ${
                isActive
                  ? isDark
                    ? 'bg-[#1a1a1d] text-teal-400 shadow-sm border border-[#2a2a2d]'
                    : 'bg-white text-teal-600 shadow-sm border border-gray-200'
                  : isDark
                    ? 'text-gray-500 hover:text-gray-300 hover:bg-[#0f0f10]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && <GeneralSettings />}
      {activeTab === 'automation' && <AutomationSettings />}
      {activeTab === 'balance' && <BalancePage embedded />}
      {activeTab === 'api' && <APISettingsPage embedded />}
    </div>
  );
}