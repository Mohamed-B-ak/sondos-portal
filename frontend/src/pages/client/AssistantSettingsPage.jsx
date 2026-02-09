import { useState, useEffect } from "react";
import {
  Bot, Mic, Globe, Brain, Phone, MessageSquare, Settings,
  Webhook, Volume2, Clock, Shield, Zap, Save, RotateCcw,
  ChevronDown, Info, Sliders, PhoneIncoming, PhoneOutgoing,
  VolumeX, Timer, AlertCircle, FileText, Plus, Trash2, Play,
  Edit, Eye, X, Loader2, Search, Filter, Check, Copy, RefreshCw,
  CheckCircle, XCircle, Link, Unlink
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { assistantsAPI, callsAPI } from "@/services/api/sondosAPI";

export default function AssistantSettingsPage() {
  const { isDark } = useTheme();
  const { t, isAr } = useLanguage();
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDirection, setFilterDirection] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTestCallModal, setShowTestCallModal] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [voices, setVoices] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [models, setModels] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(true);

  useEffect(() => { loadAssistants(); loadDropdownData(); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Send notification to backend
  const sendNotification = async (title, message, type = 'info') => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type })
      });
    } catch (err) {
      // Silent fail
    }
  };

  const loadAssistants = async () => {
    setLoading(true); setError(null);
    try {
      const response = await assistantsAPI.getAll();
      let data = [];
      if (response.data && Array.isArray(response.data)) data = response.data;
      else if (Array.isArray(response)) data = response;
      else if (response.assistants && Array.isArray(response.assistants)) data = response.assistants;
      else if (response && typeof response === 'object') data = [response];
      setAssistants(data);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const loadDropdownData = async () => {
    setDropdownsLoading(true);
    try {
      const [voicesRes, languagesRes, modelsRes, phoneNumbersRes] = await Promise.allSettled([
        assistantsAPI.getVoices(), assistantsAPI.getLanguages(), assistantsAPI.getModels(), assistantsAPI.getPhoneNumbers()
      ]);
      const extract = (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (res.data && Array.isArray(res.data)) return res.data;
        for (const k of ['voices','languages','models','phone_numbers','phoneNumbers']) {
          if (res[k] && Array.isArray(res[k])) return res[k];
        }
        return [];
      };
      if (voicesRes.status === 'fulfilled') setVoices(extract(voicesRes.value));
      if (languagesRes.status === 'fulfilled') setLanguages(extract(languagesRes.value));
      if (modelsRes.status === 'fulfilled') setModels(extract(modelsRes.value));
      if (phoneNumbersRes.status === 'fulfilled') setPhoneNumbers(extract(phoneNumbersRes.value));
    } catch (err) { console.error('Error loading dropdown data:', err); }
    finally { setDropdownsLoading(false); }
  };

  const handleView = (a) => { setSelectedAssistant(a); setShowViewModal(true); };
  const handleEdit = (a) => { setSelectedAssistant(a); setShowEditModal(true); };
  const handleDelete = (a) => { setSelectedAssistant(a); setShowDeleteConfirm(true); };

  const confirmDelete = async () => {
    try {
      await assistantsAPI.delete(selectedAssistant.id);
      showToast(t('asst.deletedSuccess'), 'success');
      sendNotification(t('asst.deletedNotif'), t('asst.deletedNotifMsg').replace('"{name}"', selectedAssistant.name || selectedAssistant.id), 'warning');
      loadAssistants(); setShowDeleteConfirm(false); setSelectedAssistant(null);
    } catch (err) { showToast(err.message || t('asst.deleteFailed'), 'error'); setShowDeleteConfirm(false); }
  };

  const handleSave = async (assistantData, isNew = false) => {
    try {
      if (isNew) {
        console.log('➕ Creating new assistant:', assistantData);
        await assistantsAPI.create(assistantData);
        showToast(t('asst.createdSuccess'), 'success');
        sendNotification(t('asst.createdNotif'), t('asst.createdNotifMsg').replace('"{name}"', assistantData.name), 'success');
      } else {
        console.log('✏️ Updating assistant:', selectedAssistant.id, assistantData);
        await assistantsAPI.update(selectedAssistant.id, assistantData);
        showToast(t('asst.updatedSuccess'), 'success');
        sendNotification(t('asst.updatedNotif'), t('asst.updatedNotifMsg').replace('"{name}"', assistantData.name || selectedAssistant.name), 'success');
      }
      loadAssistants(); setShowCreateModal(false); setShowEditModal(false); setSelectedAssistant(null);
    } catch (err) { console.error('❌ Save error:', err); throw err; }
  };

  const handleToggleWebhook = async (assistant, enable) => {
    try {
      if (enable) {
        const url = prompt(t('asst.enterWebhookUrl'), assistant.webhook_url || '');
        if (url) { await assistantsAPI.enableInboundWebhook(assistant.id, url); showToast(t('asst.webhookEnabled')); sendNotification(t('asst.webhookEnabledNotif'), t('asst.webhookEnabledMsg').replace('"' + '{name}' + '"', assistant.name), 'success'); }
      } else {
        await assistantsAPI.disableWebhook(assistant.id); showToast(t('asst.webhookDisabled'));
        sendNotification(t('asst.webhookDisabledNotif'), t('asst.webhookDisabledMsg').replace('"' + '{name}' + '"', assistant.name), 'warning');
      }
      loadAssistants();
    } catch (err) { showToast(err.message || t('asst.webhookFailed'), 'error'); }
  };

  const handleTestCall = (a) => { setSelectedAssistant(a); setShowTestCallModal(true); };
  const executeTestCall = async (phone, variables = {}) => {
    try {
      await callsAPI.makeCall({ phone_number: phone, assistant_id: selectedAssistant.id, variables });
      showToast(t('asst.testCallSuccess')); sendNotification(t('asst.testCallNotif'), t('asst.testCallNotifMsg').replace('{phone}', phone), 'info'); setShowTestCallModal(false); setSelectedAssistant(null);
    } catch (err) { throw err; }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); showToast(t('asst.copied')); };

  const filtered = assistants.filter(a => {
    const s = !searchQuery || (a.name||'').toLowerCase().includes(searchQuery.toLowerCase()) || (a.assistant_name||'').toLowerCase().includes(searchQuery.toLowerCase());
    const d = !filterDirection || a.calls_direction === filterDirection || a.direction === filterDirection;
    return s && d;
  });

  const stats = {
    total: assistants.length,
    inbound: assistants.filter(a => ['receive','inbound'].includes(a.calls_direction || a.direction)).length,
    outbound: assistants.filter(a => ['make','outbound'].includes(a.calls_direction || a.direction)).length,
    active: assistants.filter(a => a.is_active || a.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      {toast.show && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />} {toast.message}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('asst.title')}</h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('asst.subtitle')}</p>
        </div>
        <button onClick={() => { setSelectedAssistant(null); setShowCreateModal(true); }} className="px-5 py-2.5 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-teal-500/25">
          <Plus className="w-5 h-5" /> {t('asst.createNew')}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Bot} label={t('asst.total')} value={stats.total} color="teal" isDark={isDark} />
        <StatCard icon={PhoneIncoming} label={t('asst.inbound')} value={stats.inbound} color="blue" isDark={isDark} />
        <StatCard icon={PhoneOutgoing} label={t('asst.outbound')} value={stats.outbound} color="purple" isDark={isDark} />
        <StatCard icon={Zap} label={t('asst.activeLabel')} value={stats.active} color="emerald" isDark={isDark} />
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {[{v:null,l:t('asst.all'),c:'teal'},{v:'inbound',l:t('asst.inbound'),c:'blue',i:PhoneIncoming},{v:'outbound',l:t('asst.outbound'),c:'purple',i:PhoneOutgoing}].map(f => (
            <button key={f.v||'all'} onClick={() => setFilterDirection(f.v)} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${filterDirection === f.v ? `bg-${f.c}-500 text-white` : isDark ? 'bg-[#111113] border border-[#1f1f23] text-gray-400 hover:text-white' : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'}`}>
              {f.i && <f.i className="w-4 h-4" />} {f.l}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input type="text" placeholder={t('asst.searchAssistant')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-4 pr-11 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${isDark ? 'bg-[#111113] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`} />
        </div>
        <button onClick={loadAssistants} disabled={loading} className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 ${isDark ? 'bg-[#111113] border-[#1f1f23] text-white hover:bg-[#1a1a1d]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {t('asst.refresh')}
        </button>
      </div>
      {error && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
          <AlertCircle className="w-5 h-5 text-red-500" /><span className={isDark ? 'text-red-400' : 'text-red-600'}>{error}</span>
          <button onClick={loadAssistants} className="mr-auto text-red-500 hover:underline">{t('asst.retry')}</button>
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-teal-500' : 'text-teal-600'}`} /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Bot className={`w-16 h-16 mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('asst.noAssistants')}</p>
          <button onClick={() => { setSelectedAssistant(null); setShowCreateModal(true); }} className="mt-4 text-teal-500 hover:underline">{t('asst.createFirst')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => <AssistantCard key={a.id} assistant={a} isDark={isDark} onView={() => handleView(a)} onEdit={() => handleEdit(a)} onDelete={() => handleDelete(a)} onTestCall={() => handleTestCall(a)} onCopyId={() => copyToClipboard(String(a.id))} onToggleWebhook={(e) => handleToggleWebhook(a, e)} />)}
        </div>
      )}
      {showViewModal && selectedAssistant && <ViewAssistantModal isDark={isDark} assistant={selectedAssistant} onClose={() => { setShowViewModal(false); setSelectedAssistant(null); }} onCopy={copyToClipboard} />}
      {showCreateModal && <EditAssistantModal isDark={isDark} assistant={null} voices={voices} languages={languages} models={models} phoneNumbers={phoneNumbers} onClose={() => { setShowCreateModal(false); setSelectedAssistant(null); }} onSave={(d) => handleSave(d, true)} />}
      {showEditModal && selectedAssistant && <EditAssistantModal isDark={isDark} assistant={selectedAssistant} voices={voices} languages={languages} models={models} phoneNumbers={phoneNumbers} onClose={() => { setShowEditModal(false); setSelectedAssistant(null); }} onSave={(d) => handleSave(d, false)} />}
      {showDeleteConfirm && selectedAssistant && <DeleteConfirmModal isDark={isDark} assistant={selectedAssistant} onClose={() => { setShowDeleteConfirm(false); setSelectedAssistant(null); }} onConfirm={confirmDelete} />}
      {showTestCallModal && selectedAssistant && <TestCallModal isDark={isDark} assistant={selectedAssistant} onClose={() => { setShowTestCallModal(false); setSelectedAssistant(null); }} onCall={executeTestCall} />}
    </div>
  );
}

// ==================== StatCard ====================
function StatCard({ icon: Icon, label, value, color, isDark }) {
  const c = { teal: 'bg-teal-500/10 text-teal-500', blue: 'bg-blue-500/10 text-blue-500', purple: 'bg-purple-500/10 text-purple-500', emerald: 'bg-emerald-500/10 text-emerald-500' };
  return (
    <div className={`rounded-xl p-4 border ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c[color]}`}><Icon className="w-5 h-5" /></div>
        <div><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p><p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p></div>
      </div>
    </div>
  );
}

// ==================== AssistantCard ====================
function AssistantCard({ assistant, isDark, onView, onEdit, onDelete, onTestCall, onCopyId, onToggleWebhook }) {
  const { t } = useLanguage();
  const name = assistant.name || assistant.assistant_name || t('asst.assistantHash').replace('{id}', assistant.id);
  const dir = (() => { const d = assistant.calls_direction || assistant.direction || 'receive'; return (d === 'make' || d === 'outbound') ? 'outbound' : 'inbound'; })();
  const lang = assistant.language || '-';
  const model = assistant.llm_model || assistant.model || '-';
  const active = assistant.is_active || assistant.status === 'active';
  const hook = assistant.is_webhook_active || assistant.webhook_url;
  return (
    <div className={`rounded-xl p-5 border transition-all ${isDark ? 'bg-[#111113] border-[#1f1f23] hover:border-teal-500/50' : 'bg-white border-gray-200 hover:border-teal-500/50'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dir === 'outbound' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
            {dir === 'outbound' ? <PhoneOutgoing className="w-6 h-6" /> : <PhoneIncoming className="w-6 h-6" />}
          </div>
          <div>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
            <div className="flex items-center gap-2">
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>ID: {assistant.id}</p>
              <button onClick={onCopyId} className={`p-1 rounded hover:bg-teal-500/10 ${isDark ? 'text-gray-500 hover:text-teal-400' : 'text-gray-400 hover:text-teal-500'}`}><Copy className="w-3 h-3" /></button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {active && <span className="px-2 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-500">{t('asst.activeLabel')}</span>}
          {hook && <span className="px-2 py-1 rounded-lg text-xs bg-cyan-500/10 text-cyan-500"><Webhook className="w-3 h-3" /></span>}
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2"><Globe className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{lang}</span></div>
        <div className="flex items-center gap-2"><Brain className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{model}</span></div>
        {assistant.phone_number && <div className="flex items-center gap-2"><Phone className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} /><span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} dir="ltr">{assistant.phone_number}</span></div>}
      </div>
      <div className="mb-4"><span className={`px-3 py-1 rounded-lg text-xs font-medium ${dir === 'outbound' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>{dir === 'outbound' ? t('asst.outbound') : t('asst.inbound')}</span></div>
      <div className="flex gap-2">
        <button onClick={onView} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 ${isDark ? 'bg-[#1a1a1d] text-white hover:bg-[#222225]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><Eye className="w-4 h-4" /> {t('asst.view')}</button>
        <button onClick={onEdit} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 ${isDark ? 'bg-[#1a1a1d] text-white hover:bg-[#222225]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><Edit className="w-4 h-4" /> {t('asst.edit')}</button>
        <button onClick={onTestCall} className="py-2 px-3 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"><Phone className="w-4 h-4" /></button>
        <button onClick={onDelete} className="py-2 px-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// ==================== ViewAssistantModal ====================
function ViewAssistantModal({ isDark, assistant, onClose, onCopy }) {
  const { t, isAr } = useLanguage();
  const name = assistant.name || assistant.assistant_name || t('asst.assistantHash').replace('{id}', assistant.id);
  const fields = [
    { k: 'id', l: t('asst.viewId'), v: assistant.id }, { k: 'name', l: t('asst.viewName'), v: name }, { k: 'language', l: t('asst.viewLang'), v: assistant.language },
    { k: 'llm_model', l: t('asst.viewModel'), v: assistant.llm_model || assistant.model }, { k: 'calls_direction', l: t('asst.viewDirection'), v: assistant.calls_direction || assistant.direction },
    { k: 'phone_number', l: t('asst.viewPhone'), v: assistant.phone_number }, { k: 'voice_id', l: t('asst.viewVoiceId'), v: assistant.voice_id },
    { k: 'timezone', l: t('asst.viewTimezone'), v: assistant.timezone }, { k: 'is_active', l: t('asst.viewActive'), v: assistant.is_active ? t('asst.yes') : t('asst.no') },
    { k: 'is_webhook_active', l: t('asst.viewWebhook'), v: assistant.is_webhook_active ? t('asst.yes') : t('asst.no') }, { k: 'webhook_url', l: t('asst.viewWebhookUrl'), v: assistant.webhook_url },
    { k: 'max_call_duration', l: t('asst.viewMaxDuration'), v: assistant.max_call_duration ? `${assistant.max_call_duration}s` : '-' },
    { k: 'record_call', l: t('asst.viewRecording'), v: assistant.record_call ? t('asst.yes') : t('asst.no') },
    { k: 'created_at', l: t('asst.viewCreatedAt'), v: assistant.created_at ? new Date(assistant.created_at).toLocaleString(isAr ? 'ar-SA' : 'en-US') : '-' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl ${isDark ? 'bg-[#111113]' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white"><Bot className="w-6 h-6" /></div>
            <div><h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{name}</h2><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ID: {assistant.id}</p></div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#1a1a1d]' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {assistant.system_prompt && <div className="mb-6"><h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>System Prompt</h3><div className={`p-4 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}><p className={`text-sm whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{assistant.system_prompt}</p></div></div>}
          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ k, l, v }) => v && (
              <div key={k} className={`p-3 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{l}</p>
                <div className="flex items-center justify-between">
                  <p className={`text-sm break-all ${isDark ? 'text-white' : 'text-gray-900'}`}>{String(v)}</p>
                  {['id','webhook_url','phone_number'].includes(k) && <button onClick={() => onCopy(String(v))} className={`p-1 rounded hover:bg-teal-500/10 ${isDark ? 'text-gray-500 hover:text-teal-400' : 'text-gray-400 hover:text-teal-500'}`}><Copy className="w-3 h-3" /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`p-6 border-t ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}><button onClick={onClose} className={`w-full py-3 rounded-xl font-medium ${isDark ? 'bg-[#1a1a1d] text-white hover:bg-[#222225]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>{t('asst.close')}</button></div>
      </div>
    </div>
  );
}

// ==================== Edit/Create Assistant Modal ====================
function EditAssistantModal({ isDark, assistant, voices, languages, models, phoneNumbers, onClose, onSave }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toUI = (val, def = 75) => { if (val == null) return def; return val > 1 ? Math.round(val) : Math.round(val * 100); };
  const toUISpeed = (val) => { if (val == null) return 100; return val > 1.5 ? Math.round(val) : Math.round(val * 100); };

  const [formData, setFormData] = useState({
    assistant_name: assistant?.assistant_name || assistant?.name || '',
    voice_id: assistant?.voice_id || '',
    language: assistant?.language || 'Arabic',
    llm_model: assistant?.llm_model || assistant?.model || 'GPT-4o-mini',
    calls_direction: assistant?.calls_direction || assistant?.direction || 'receive',
    engine_type: assistant?.engine_type || 'pipeline',
    timezone: assistant?.timezone || 'Asia/Riyadh',
    initial_message: assistant?.initial_message || assistant?.first_message || '',
    system_prompt: assistant?.system_prompt || '',
    phone_number_id: assistant?.phone_number_id || '',
    endpoint_type: assistant?.endpoint_type || 'ai',
    endpoint_sensitivity: assistant?.endpoint_sensitivity ?? 2.5,
    interrupt_sensitivity: assistant?.interrupt_sensitivity ?? 2.5,
    ambient_sound_volume: assistant?.ambient_sound_volume ?? 0,
    post_call_evaluation: assistant?.post_call_evaluation ?? false,
    send_webhook_only_on_completed: assistant?.send_webhook_only_on_completed ?? true,
    include_recording_in_webhook: assistant?.include_recording_in_webhook ?? false,
    is_webhook_active: assistant?.is_webhook_active ?? false,
    webhook_url: assistant?.webhook_url || '',
    use_min_interrupt_words: assistant?.use_min_interrupt_words ?? false,
    min_interrupt_words: assistant?.min_interrupt_words ?? 0,
    variables: assistant?.variables || {},
    post_call_schema: assistant?.post_call_schema || [],
    end_call_tool_description: assistant?.['end_call_tool.description'] || assistant?.end_call_tool_description || '',
    llm_temperature: assistant?.llm_temperature ?? 0.7,
    voice_stability: toUI(assistant?.voice_stability, 75),
    voice_similarity: toUI(assistant?.voice_similarity, 80),
    speech_speed: toUISpeed(assistant?.speech_speed),
    allow_interruptions: assistant?.allow_interruptions ?? true,
    filler_audios: assistant?.filler_audios ?? false,
    re_engagement_interval: assistant?.re_engagement_interval ?? 10,
    max_call_duration: assistant?.max_call_duration ?? 600,
    max_silence_duration: assistant?.max_silence_duration ?? 30,
    end_call_on_voicemail: assistant?.end_call_on_voicemail ?? false,
    noise_cancellation: assistant?.noise_cancellation ?? true,
    record_call: assistant?.record_call ?? true,
    who_speaks_first: assistant?.who_speaks_first || 'AI assistant',
  });

  const u = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  // Post Call Schema management
  const addSchema = () => u('post_call_schema', [...formData.post_call_schema, { name: '', type: 'string', description: '' }]);
  const updateSchema = (i, f, v) => { const arr = [...formData.post_call_schema]; arr[i] = { ...arr[i], [f]: v }; u('post_call_schema', arr); };
  const removeSchema = (i) => u('post_call_schema', formData.post_call_schema.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.assistant_name.trim()) { setError(t('asst.nameRequired')); return; }
    if (!formData.system_prompt.trim()) { setError(t('asst.promptRequired')); return; }
    if (!formData.voice_id) { setError(t('asst.voiceRequired')); return; }
    if (!formData.language) { setError(t('asst.langRequired')); return; }

    setLoading(true); setError("");
    try {
      let vid = formData.voice_id;
      if (typeof vid === 'string' && !isNaN(vid) && vid.trim()) vid = parseInt(vid, 10);

      // Convert UI -> API ranges
      const rs = parseFloat(formData.voice_stability);
      const stab = (!isNaN(rs) && rs > 1) ? rs / 100 : (rs || 0.75);
      const rm = parseFloat(formData.voice_similarity);
      const sim = (!isNaN(rm) && rm > 1) ? rm / 100 : (rm || 0.8);
      const rp = parseFloat(formData.speech_speed);
      let spd = (!isNaN(rp) && rp > 1.5) ? rp / 100 : (rp || 1);
      spd = Math.max(0.7, Math.min(1.2, spd));

      // Build post_call_schema - keys are just name, type, description
      const schema = (formData.post_call_schema || []).filter(s => s.name?.trim()).map(s => ({
        name: s.name.trim(),
        type: s.type || 'string',
        description: s.description?.trim() || '',
      }));

      // ============================================================
      // ALL 33 fields - booleans are real JS true/false
      // ============================================================
      const data = {
        assistant_name: formData.assistant_name.trim(),
        voice_id: vid,
        language: formData.language,
        llm_model: formData.llm_model,
        calls_direction: formData.calls_direction || 'receive',
        engine_type: formData.engine_type || 'pipeline',
        timezone: formData.timezone || 'Asia/Riyadh',
        initial_message: formData.initial_message?.trim() || '',
        system_prompt: formData.system_prompt.trim(),
        endpoint_type: formData.endpoint_type || 'ai',
        endpoint_sensitivity: parseFloat(formData.endpoint_sensitivity) || 2.5,
        interrupt_sensitivity: parseFloat(formData.interrupt_sensitivity) || 2.5,
        ambient_sound_volume: parseFloat(formData.ambient_sound_volume) || 0,
        post_call_evaluation: formData.post_call_evaluation === true,
        send_webhook_only_on_completed: formData.send_webhook_only_on_completed === true,
        include_recording_in_webhook: formData.include_recording_in_webhook === true,
        is_webhook_active: formData.is_webhook_active === true,
        webhook_url: formData.webhook_url || '',
        use_min_interrupt_words: formData.use_min_interrupt_words === true,
        min_interrupt_words: parseInt(formData.min_interrupt_words) || 0,
        variables: formData.variables || {},
        post_call_schema: schema,
        'end_call_tool.description': formData.end_call_tool_description || '',
        llm_temperature: parseFloat(formData.llm_temperature) || 0.7,
        voice_stability: stab,
        voice_similarity: sim,
        speech_speed: spd,
        allow_interruptions: formData.allow_interruptions === true,
        filler_audios: formData.filler_audios === true,
        re_engagement_interval: parseInt(formData.re_engagement_interval) || 10,
        max_call_duration: parseInt(formData.max_call_duration) || 600,
        max_silence_duration: parseInt(formData.max_silence_duration) || 30,
        end_call_on_voicemail: formData.end_call_on_voicemail === true,
        noise_cancellation: formData.noise_cancellation === true,
        record_call: formData.record_call === true,
        who_speaks_first: formData.who_speaks_first || 'AI assistant',
      };

      if (formData.phone_number_id) data.phone_number_id = parseInt(formData.phone_number_id);

      console.log('📤 Submitting data:', JSON.stringify(data, null, 2));
      await onSave(data);
    } catch (err) { console.error('❌ Submit error:', err); setError(err.message || t('asst.errorOccurred')); }
    finally { setLoading(false); }
  };

  const ic = `w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`;
  const lc = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  const tabs = [
    { id: 'basic', label: t('asst.tabBasic'), icon: Bot },
    { id: 'messages', label: t('asst.tabMessages'), icon: MessageSquare },
    { id: 'voice', label: t('asst.tabVoice'), icon: Volume2 },
    { id: 'call', label: t('asst.tabCall'), icon: Phone },
    { id: 'advanced', label: t('asst.tabAdvanced'), icon: Sliders },
    { id: 'webhook', label: t('asst.tabWebhook'), icon: Webhook },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl ${isDark ? 'bg-[#111113]' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{assistant ? t('asst.editAssistant') : t('asst.createNew')}</h2>
          <button onClick={onClose} className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#1a1a1d]' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
        </div>
        <div className={`flex gap-1 p-2 border-b overflow-x-auto ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-teal-500/10 text-teal-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">

            {/* === BASIC === */}
            {activeTab === 'basic' && <div className="space-y-4">
              <div><label className={lc}>{t('asst.assistantName')} <span className="text-red-500">*</span></label><input type="text" value={formData.assistant_name} onChange={e => u('assistant_name', e.target.value)} placeholder={t('asst.assistantNamePlaceholder')} className={ic} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lc}>{t('asst.language')} <span className="text-red-500">*</span></label>
                  <select value={formData.language} onChange={e => u('language', e.target.value)} className={ic}>
                    {languages.length > 0 ? languages.map(l => <option key={l.id} value={l.name}>{l.name}</option>) : <><option value="Arabic">Arabic</option><option value="English">English</option></>}
                  </select>
                </div>
                <div><label className={lc}>{t('asst.model')} <span className="text-red-500">*</span></label>
                  <select value={formData.llm_model} onChange={e => u('llm_model', e.target.value)} className={ic}>
                    {models.length > 0 ? models.map(m => <option key={m.id} value={m.name}>{m.name}</option>) : <><option value="GPT-4o-mini">GPT-4o-mini</option><option value="GPT-4o">GPT-4o</option></>}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lc}>{t('asst.callDirection')}</label><select value={formData.calls_direction} onChange={e => u('calls_direction', e.target.value)} className={ic}><option value="receive">{t('asst.inbound')}</option><option value="make">{t('asst.outbound')}</option></select></div>
                <div><label className={lc}>{t('asst.voiceLabel')} <span className="text-red-500">*</span></label>
                  <select value={formData.voice_id} onChange={e => u('voice_id', e.target.value)} className={ic}>
                    <option value="">{t('asst.selectVoice')}</option>
                    {voices.length > 0 ? voices.map(v => <option key={v.voice_id||v.id} value={v.voice_id||v.id}>{v.name||v.label} {v.language ? `(${v.language})` : ''} {v.gender ? `- ${v.gender}` : ''}</option>) : <><option value="1">{t('asst.voice1')}</option><option value="2">{t('asst.voice2')}</option></>}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lc}>{t('asst.phoneNumber')}</label><select value={formData.phone_number_id} onChange={e => u('phone_number_id', e.target.value)} className={ic}><option value="">{t('asst.selectOption')}</option>{phoneNumbers.map(p => <option key={p.id} value={p.id}>{p.number||p.phone_number} {p.name ? `(${p.name})` : ''}</option>)}</select></div>
                <div><label className={lc}>{t('asst.timezone')}</label><select value={formData.timezone} onChange={e => u('timezone', e.target.value)} className={ic}><option value="Asia/Riyadh">{t('asst.riyadh')}</option><option value="Asia/Dubai">{t('asst.dubai')}</option><option value="Africa/Cairo">{t('asst.cairo')}</option><option value="Europe/London">{t('asst.london')}</option><option value="America/New_York">{t('asst.newYork')}</option><option value="UTC">UTC</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lc}>{t('asst.engineType')}</label><select value={formData.engine_type} onChange={e => u('engine_type', e.target.value)} className={ic}><option value="pipeline">Pipeline</option><option value="multimodal">Multimodal</option></select></div>
                <div><label className={lc}>{t('asst.whoSpeaksFirst')}</label><select value={formData.who_speaks_first} onChange={e => u('who_speaks_first', e.target.value)} className={ic}><option value="AI assistant">{t('asst.theAssistant')}</option><option value="Customer">{t('asst.theCustomer')}</option></select></div>
              </div>
            </div>}

            {/* === MESSAGES === */}
            {activeTab === 'messages' && <div className="space-y-4">
              <div><label className={lc}>{t('asst.initialMessage')} <span className="text-red-500">*</span></label><textarea value={formData.initial_message} onChange={e => u('initial_message', e.target.value)} placeholder={t('asst.initialMessagePlaceholder')} rows={3} className={`${ic} resize-none`} /></div>
              <div><label className={lc}>System Prompt <span className="text-red-500">*</span></label><textarea value={formData.system_prompt} onChange={e => u('system_prompt', e.target.value)} placeholder={t('asst.systemPromptPlaceholder')} rows={8} className={`${ic} resize-none`} /></div>
              <div><label className={lc}>{t('asst.endCallToolDesc')}</label><textarea value={formData.end_call_tool_description} onChange={e => u('end_call_tool_description', e.target.value)} placeholder={t('asst.endCallToolPlaceholder')} rows={2} className={`${ic} resize-none`} maxLength={500} /><p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('asst.maxChars')}</p></div>
            </div>}

            {/* === VOICE === */}
            {activeTab === 'voice' && <div className="space-y-4">
              <div><label className={lc}>{t('asst.selectVoiceLabel')}</label>
                <select value={formData.voice_id} onChange={e => u('voice_id', e.target.value)} className={ic}>
                  <option value="">{t('asst.selectOnly')}</option>
                  {voices.length > 0 ? voices.map(v => <option key={v.voice_id||v.id} value={v.voice_id||v.id}>{v.name||v.label} {v.language ? `(${v.language})` : ''}</option>) : <><option value="1">{t('asst.voice1')}</option><option value="2">{t('asst.voice2')}</option></>}
                </select>
              </div>
              <Sld isDark={isDark} label={t('asst.voiceStability')} value={formData.voice_stability} min={0} max={100} u="%" onChange={v => u('voice_stability', v)} />
              <Sld isDark={isDark} label={t('asst.voiceSimilarity')} value={formData.voice_similarity} min={0} max={100} u="%" onChange={v => u('voice_similarity', v)} />
              <Sld isDark={isDark} label={t('asst.speechSpeed')} value={formData.speech_speed} min={50} max={150} u="%" onChange={v => u('speech_speed', v)} />
              <div><label className={lc}>{t('asst.modelTemp')}</label><div className="flex items-center gap-3"><input type="range" min={0} max={100} value={Math.round(formData.llm_temperature * 100)} onChange={e => u('llm_temperature', parseInt(e.target.value)/100)} className="flex-1 accent-teal-500" /><span className="text-teal-500 w-12">{formData.llm_temperature}</span></div></div>
            </div>}

            {/* === CALL === */}
            {activeTab === 'call' && <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lc}>{t('asst.maxCallDuration')}</label><input type="number" value={formData.max_call_duration} onChange={e => u('max_call_duration', parseInt(e.target.value)||600)} min={20} max={1200} className={ic} /></div>
                <div><label className={lc}>{t('asst.maxSilenceDuration')}</label><input type="number" value={formData.max_silence_duration} onChange={e => u('max_silence_duration', parseInt(e.target.value)||30)} min={1} max={120} className={ic} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lc}>{t('asst.reEngagementInterval')}</label><input type="number" value={formData.re_engagement_interval} onChange={e => u('re_engagement_interval', parseInt(e.target.value)||10)} min={7} max={600} className={ic} /></div>
                <div><label className={lc}>{t('asst.minInterruptWords')}</label><input type="number" value={formData.min_interrupt_words} onChange={e => u('min_interrupt_words', parseInt(e.target.value)||0)} min={0} max={10} className={ic} /></div>
              </div>
              <Tog isDark={isDark} label={t('asst.allowInterrupt')} desc={t('asst.allowInterruptDesc')} on={formData.allow_interruptions} toggle={() => u('allow_interruptions', !formData.allow_interruptions)} />
              <Tog isDark={isDark} label={t('asst.recordCall')} desc={t('asst.recordCallDesc')} on={formData.record_call} toggle={() => u('record_call', !formData.record_call)} />
              <Tog isDark={isDark} label={t('asst.noiseCancellation')} desc={t('asst.noiseCancellationDesc')} on={formData.noise_cancellation} toggle={() => u('noise_cancellation', !formData.noise_cancellation)} />
              <Tog isDark={isDark} label={t('asst.endOnVoicemail')} desc={t('asst.endOnVoicemailDesc')} on={formData.end_call_on_voicemail} toggle={() => u('end_call_on_voicemail', !formData.end_call_on_voicemail)} />
              <Tog isDark={isDark} label={t('asst.fillerAudios')} desc={t('asst.fillerAudiosDesc')} on={formData.filler_audios} toggle={() => u('filler_audios', !formData.filler_audios)} />
              <Tog isDark={isDark} label={t('asst.minInterruptWordsToggle')} desc={t('asst.minInterruptWordsDesc')} on={formData.use_min_interrupt_words} toggle={() => u('use_min_interrupt_words', !formData.use_min_interrupt_words)} />
            </div>}

            {/* === ADVANCED === */}
            {activeTab === 'advanced' && <div className="space-y-6">
              <div>
                <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('asst.endpointSettings')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lc}>{t('asst.endpointType')}</label><select value={formData.endpoint_type} onChange={e => u('endpoint_type', e.target.value)} className={ic}><option value="ai">AI</option><option value="vad">VAD</option></select></div>
                  <div><label className={lc}>{t('asst.endpointSensitivity')}</label><input type="number" value={formData.endpoint_sensitivity} onChange={e => u('endpoint_sensitivity', parseFloat(e.target.value)||2.5)} min={0} max={5} step={0.5} className={ic} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div><label className={lc}>{t('asst.interruptSensitivity')}</label><input type="number" value={formData.interrupt_sensitivity} onChange={e => u('interrupt_sensitivity', parseFloat(e.target.value)||2.5)} min={0} max={5} step={0.5} className={ic} /></div>
                  <div><label className={lc}>{t('asst.ambientSound')}</label><input type="number" value={formData.ambient_sound_volume} onChange={e => u('ambient_sound_volume', parseFloat(e.target.value)||0)} min={0} max={1} step={0.1} className={ic} /></div>
                </div>
              </div>
              <Tog isDark={isDark} label={t('asst.postCallEval')} desc={t('asst.postCallEvalDesc')} on={formData.post_call_evaluation} toggle={() => u('post_call_evaluation', !formData.post_call_evaluation)} />
              
              {/* Post Call Schema Editor */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Post Call Schema</h3>
                  <button type="button" onClick={addSchema} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 text-sm"><Plus className="w-4 h-4" /> {t('asst.addField')}</button>
                </div>
                {formData.post_call_schema.length === 0 ? (
                  <div className={`p-4 rounded-xl text-center text-sm ${isDark ? 'bg-[#0a0a0b] text-gray-500' : 'bg-gray-50 text-gray-400'}`}>{t('asst.noFields')}</div>
                ) : formData.post_call_schema.map((f, i) => (
                  <div key={i} className={`p-4 rounded-xl border mb-3 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23]' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('asst.fieldNum').replace('{num}', i+1)}</span>
                      <button type="button" onClick={() => removeSchema(i)} className="p-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('asst.fieldName')}</label><input type="text" value={f.name} onChange={e => updateSchema(i,'name',e.target.value)} placeholder="customer_satisfaction" className={`${ic} !py-2 !text-sm`} /></div>
                      <div><label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('asst.fieldType')}</label><select value={f.type} onChange={e => updateSchema(i,'type',e.target.value)} className={`${ic} !py-2 !text-sm`}><option value="string">string</option><option value="number">number</option><option value="boolean">boolean</option><option value="enum">enum</option></select></div>
                      <div><label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('asst.fieldDesc')}</label><input type="text" value={f.description} onChange={e => updateSchema(i,'description',e.target.value)} placeholder={t('asst.fieldDescPlaceholder')} className={`${ic} !py-2 !text-sm`} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>}

            {/* === WEBHOOK === */}
            {activeTab === 'webhook' && <div className="space-y-4">
              <Tog isDark={isDark} label={t('asst.enableWebhook')} desc={t('asst.enableWebhookDesc')} on={formData.is_webhook_active} toggle={() => u('is_webhook_active', !formData.is_webhook_active)} />
              {formData.is_webhook_active && <div><label className={lc}>{t('asst.webhookUrl')}</label><input type="url" value={formData.webhook_url} onChange={e => u('webhook_url', e.target.value)} placeholder="https://your-server.com/webhook" className={ic} dir="ltr" /></div>}
              <Tog isDark={isDark} label={t('asst.sendOnCompleted')} desc={t('asst.sendOnCompletedDesc')} on={formData.send_webhook_only_on_completed} toggle={() => u('send_webhook_only_on_completed', !formData.send_webhook_only_on_completed)} />
              <Tog isDark={isDark} label={t('asst.includeRecording')} desc={t('asst.includeRecordingDesc')} on={formData.include_recording_in_webhook} toggle={() => u('include_recording_in_webhook', !formData.include_recording_in_webhook)} />
            </div>}

            {error && <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm whitespace-pre-wrap">{error}</div>}
          </div>
          <div className={`flex gap-3 p-6 border-t ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
            <button type="button" onClick={onClose} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-[#1a1a1d] text-white hover:bg-[#222225]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>{t('asst.cancel')}</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70">
              {loading && <Loader2 className="w-5 h-5 animate-spin" />} {assistant ? t('asst.saveChanges') : t('asst.createAssistant')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Slider ====================
function Sld({ isDark, label, value, min, max, u: unit, onChange }) {
  return (<div><div className="flex justify-between mb-2"><label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label><span className="text-teal-500">{value}{unit}</span></div><input type="range" min={min} max={max} value={value} onChange={e => onChange(parseInt(e.target.value))} className="w-full accent-teal-500" /></div>);
}

// ==================== Toggle ====================
function Tog({ isDark, label, desc, on, toggle }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
      <div><p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p></div>
      <button type="button" onClick={toggle} className={`w-12 h-6 rounded-full relative transition-colors ${on ? 'bg-teal-500' : isDark ? 'bg-[#2a2a2d]' : 'bg-gray-300'}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${on ? 'left-7' : 'left-1'}`} /></button>
    </div>
  );
}

// ==================== DeleteConfirmModal ====================
function DeleteConfirmModal({ isDark, assistant, onClose, onConfirm }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const name = assistant.name || assistant.assistant_name || t('asst.assistantHash').replace('{id}', assistant.id);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`w-full max-w-sm rounded-2xl p-6 ${isDark ? 'bg-[#111113]' : 'bg-white'}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center"><Trash2 className="w-8 h-8 text-red-500" /></div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('asst.deleteAssistant')}</h3>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('asst.deleteConfirm').replace('{name}', name)}</p>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={loading} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-[#1a1a1d] text-white hover:bg-[#222225]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>{t('asst.cancel')}</button>
            <button onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }} disabled={loading} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">{loading && <Loader2 className="w-4 h-4 animate-spin" />} {t('asst.delete')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== TestCallModal ====================
function TestCallModal({ isDark, assistant, onClose, onCall }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [custName, setCustName] = useState('');
  const [email, setEmail] = useState('');
  const [showVars, setShowVars] = useState(false);
  const name = assistant.name || assistant.assistant_name || t('asst.assistantHash').replace('{id}', assistant.id);
  const ic = `w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`w-full max-w-md rounded-2xl ${isDark ? 'bg-[#111113]' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white"><Phone className="w-6 h-6" /></div>
            <div><h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('asst.testCall')}</h2><p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{name}</p></div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#1a1a1d]' : 'hover:bg-gray-100'}`}><X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /></button>
        </div>
        <form onSubmit={async e => { e.preventDefault(); if (!phone.trim()) { setError(t('asst.phoneRequired')); return; } setLoading(true); setError(''); try { const v = {}; if (custName.trim()) v.customer_name = custName.trim(); if (email.trim()) v.email = email.trim(); await onCall(phone.trim(), v); } catch (err) { setError(err.message || t('asst.failed')); } finally { setLoading(false); } }} className="p-6 space-y-4">
          <div><label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('asst.phoneNumber')} <span className="text-red-500">*</span></label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+966512345678" className={ic} dir="ltr" autoFocus /><p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('asst.internationalFormat')}</p></div>
          <button type="button" onClick={() => setShowVars(!showVars)} className={`flex items-center gap-2 text-sm ${isDark ? 'text-teal-400' : 'text-teal-600'}`}><ChevronDown className={`w-4 h-4 transition-transform ${showVars ? 'rotate-180' : ''}`} /> {t('asst.extraVars')}</button>
          {showVars && <div className={`space-y-4 p-4 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
            <div><label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('asst.customerName')}</label><input type="text" value={custName} onChange={e => setCustName(e.target.value)} placeholder="محمد" className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[#111113] border-[#1f1f23] text-white' : 'bg-white border-gray-200 text-gray-900'}`} /></div>
            <div><label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('asst.emailLabel')}</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[#111113] border-[#1f1f23] text-white' : 'bg-white border-gray-200 text-gray-900'}`} dir="ltr" /></div>
          </div>}
          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
          <div className={`p-3 rounded-xl ${isDark ? 'bg-teal-500/10' : 'bg-teal-50'} flex items-start gap-2`}><Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} /><p className={`text-sm ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{t('asst.testCallInfo').replace('{name}', name)}</p></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-[#1a1a1d] text-white hover:bg-[#222225]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>{t('asst.cancel')}</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-l from-emerald-500 to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t('asst.calling')}</> : <><Phone className="w-5 h-5" /> {t('asst.startCall')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}