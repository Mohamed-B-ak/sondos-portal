import { useState, useEffect } from "react";
import { 
  Key, Plus, Trash2, Copy, Check, CheckCircle, AlertCircle, 
  Loader2, Eye, EyeOff, Shield, RefreshCw, X, Save, Unplug
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { apiKeysAPI, setApiKey, getMaskedApiKey, hasApiKey, clearApiKey, assistantsAPI } from "@/services/api/sondosAPI";

export default function APISettingsPage({ embedded = false }) {
  const { isDark } = useTheme();
  const { t, isAr } = useLanguage();
  
  const [isConnected, setIsConnected] = useState(hasApiKey());
  
  // ============ Manual Input Mode ============
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [inputStatus, setInputStatus] = useState(null);
  const [inputMessage, setInputMessage] = useState("");

  // ============ Management Mode ============
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isConnected) loadKeys();
  }, [isConnected]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ============ Manual Input ============
  const handleVerifyAndSave = async () => {
    if (!apiKeyInput.trim()) {
      setInputStatus('error');
      setInputMessage(t('apiSettings.enterKey'));
      return;
    }
    setVerifying(true);
    setInputStatus(null);
    try {
      await setApiKey(apiKeyInput.trim());
      await assistantsAPI.getAll();
      setInputStatus('success');
      setInputMessage(t('apiSettings.verified'));
      setTimeout(() => setIsConnected(true), 1000);
    } catch (err) {
      setInputStatus('error');
      setInputMessage(err.message || t('apiSettings.invalidKey'));
      clearApiKey();
    } finally {
      setVerifying(false);
    }
  };

  // ============ Management ============
  const loadKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiKeysAPI.getAll();
      const data = res.api_keys || res.data || [];
      setKeys(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load keys error:', err);
      // If key was cleared by sondosApiCall (401), switch to manual input
      if (!hasApiKey()) {
        setIsConnected(false);
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      setToast({ type: 'error', text: t('apiSettings.nameRequired') });
      return;
    }
    setCreating(true);
    try {
      const res = await apiKeysAPI.create(newKeyName.trim());
      const key = res.api_key || res.data || res;
      setCreatedKey(key);
      setShowCreate(false);
      setNewKeyName("");
      loadKeys();
    } catch (err) {
      console.error('Create key error:', err);
      setToast({ type: 'error', text: t('apiSettings.createError') });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await apiKeysAPI.delete(id);
      setKeys(prev => prev.filter(k => (k.id || k._id) !== id));
      setDeleteTarget(null);
      setToast({ type: 'success', text: t('apiSettings.deleted') });
    } catch (err) {
      console.error('Delete key error:', err);
      setToast({ type: 'error', text: t('apiSettings.deleteError') });
    } finally {
      setDeleting(false);
    }
  };

  const handleDisconnect = () => {
    clearApiKey();
    setIsConnected(false);
    setKeys([]);
    setApiKeyInput("");
    setInputStatus(null);
    setToast({ type: 'success', text: t('apiSettings.disconnected') });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl border ${
          toast.type === 'success'
            ? isDark ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            : isDark ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.text}</span>
        </div>
      )}

      {/* Header — hidden when embedded in Settings */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('apiSettings.title')}
            </h1>
            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('apiSettings.subtitle')}
            </p>
          </div>
          {isConnected && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/25 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('apiSettings.createNew')}
            </button>
          )}
        </div>
      )}
      {embedded && isConnected && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/25 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('apiSettings.createNew')}
          </button>
        </div>
      )}

      {/* ====== MODE 1: No API Key — Manual Input ====== */}
      {!isConnected && (
        <div className={`rounded-2xl p-6 border ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Key className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('apiSettings.enterKeyManual')}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('apiSettings.enterKeyManualDesc')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>API Key</label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => { setApiKeyInput(e.target.value); setInputStatus(null); }}
                  placeholder={t('apiSettings.placeholder')}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${
                    isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
                  dir="ltr"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyAndSave()}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded ${isDark ? 'hover:bg-[#1f1f23]' : 'hover:bg-gray-200'}`}
                >
                  {showKey ? <EyeOff className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} /> : <Eye className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />}
                </button>
              </div>
            </div>

            {inputStatus && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                inputStatus === 'success'
                  ? isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                  : isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                {inputStatus === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                <span className="text-sm">{inputMessage}</span>
              </div>
            )}

            <button
              onClick={handleVerifyAndSave}
              disabled={verifying}
              className="w-full py-3 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 disabled:opacity-70"
            >
              {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {verifying ? t('apiSettings.verifying') : t('apiSettings.saveVerify')}
            </button>
          </div>

          <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'}`}>
            <h3 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('apiSettings.howToGet')}</h3>
            <ol className={`text-sm space-y-1 list-decimal list-inside ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <li>{t('apiSettings.step1')} <a href="https://app.sondos-ai.com" target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:underline">app.sondos-ai.com</a></li>
              <li>{t('apiSettings.step2')}</li>
              <li>{t('apiSettings.step3')}</li>
              <li>{t('apiSettings.step4')}</li>
            </ol>
          </div>
        </div>
      )}

      {/* ====== MODE 2: Connected — Management ====== */}
      {isConnected && (
        <>
          {/* Active Key Banner */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${isDark ? 'bg-teal-500/5 border-teal-500/20' : 'bg-teal-50 border-teal-200'}`}>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-teal-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('apiSettings.connectedAs')}</p>
              <p className={`text-sm font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`} dir="ltr">{getMaskedApiKey()}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
              {t('apiSettings.active')}
            </span>
            <button
              onClick={handleDisconnect}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/10 text-gray-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}
              title={t('apiSettings.disconnect')}
            >
              <Unplug className="w-5 h-5" />
            </button>
          </div>

          {/* Keys List */}
          <div className={`rounded-2xl border ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-[#1f1f23]' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-teal-500" />
                <div>
                  <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('apiSettings.yourKeys')}</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('apiSettings.yourKeysDesc')}</p>
                </div>
              </div>
              <button onClick={loadKeys} disabled={loading} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1a1a1d] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className={`w-7 h-7 animate-spin ${isDark ? 'text-teal-500' : 'text-teal-600'}`} />
              </div>
            )}

            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('apiSettings.loadError')}</p>
                <button onClick={loadKeys} className="text-teal-500 text-sm font-medium hover:underline">{t('apiSettings.retry')}</button>
              </div>
            )}

            {!loading && !error && keys.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-[#1a1a1d]' : 'bg-gray-100'}`}>
                  <Key className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                </div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('apiSettings.noKeys')}</p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('apiSettings.noKeysDesc')}</p>
                <button onClick={() => setShowCreate(true)} className="mt-2 px-5 py-2.5 bg-teal-500/10 text-teal-500 font-medium rounded-xl hover:bg-teal-500/20 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t('apiSettings.createNew')}
                </button>
              </div>
            )}

            {!loading && !error && keys.length > 0 && (
              <div className={`divide-y ${isDark ? 'divide-[#1f1f23]' : 'divide-gray-100'}`}>
                {keys.map((apiKey) => {
                  const id = apiKey.id || apiKey._id;
                  const name = apiKey.name || `Key #${id}`;
                  const created = apiKey.created_at || apiKey.createdAt;
                  const lastUsed = apiKey.last_used_at || apiKey.lastUsedAt;

                  return (
                    <div key={id} className={`flex items-center gap-4 px-6 py-4 transition-colors ${isDark ? 'hover:bg-[#0f0f10]' : 'hover:bg-gray-50'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-[#1a1a1d]' : 'bg-gray-100'}`}>
                        <Key className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{name}</p>
                        <div className={`flex items-center gap-3 text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {created && <span>{t('apiSettings.createdAt')}: {new Date(created).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</span>}
                          <span>{t('apiSettings.lastUsed')}: {lastUsed ? new Date(lastUsed).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') : t('apiSettings.never')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* How to use + Docs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-2xl p-6 border ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
          <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('apiSettings.howToUse')}</h3>
          <ol className={`text-sm space-y-2 list-decimal list-inside ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <li>{t('apiSettings.useStep1')}</li>
            <li>{t('apiSettings.useStep2')}</li>
            <li>{t('apiSettings.useStep3')}</li>
            <li>{t('apiSettings.useStep4')}</li>
          </ol>
        </div>
        <div className={`rounded-2xl p-6 border ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
          <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>📚 {t('apiSettings.documentation')}</h3>
          <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('apiSettings.docDesc')}</p>
          <a href="https://docs.sondos-ai.com/api-reference/introduction" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-teal-500 hover:text-teal-400 text-sm font-medium">
            docs.sondos-ai.com/api-reference
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      </div>

      {/* ====== Create Modal ====== */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('apiSettings.createKey')}</h3>
              <button onClick={() => setShowCreate(false)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-[#1a1a1d] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('apiSettings.keyName')}</label>
                <input type="text" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder={t('apiSettings.keyNamePlaceholder')}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${isDark ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                  autoFocus onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className={`flex-1 py-3 rounded-xl font-medium border transition-colors ${isDark ? 'bg-[#1a1a1d] border-[#1f1f23] text-white hover:bg-[#222225]' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}>{t('apiSettings.cancel')}</button>
                <button onClick={handleCreate} disabled={creating} className="flex-1 py-3 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  {creating ? t('apiSettings.creating') : t('apiSettings.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== Created Key Modal ====== */}
      {createdKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-500/10 flex items-center justify-center"><CheckCircle className="w-8 h-8 text-teal-500" /></div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('apiSettings.newKeyCreated')}</h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>⚠️ {t('apiSettings.newKeyWarning')}</p>
            </div>
            <div className={`p-4 rounded-xl font-mono text-sm break-all ${isDark ? 'bg-[#0a0a0b] text-teal-400' : 'bg-gray-50 text-teal-600'}`} dir="ltr">
              {createdKey.token || createdKey.key || createdKey.api_key || '—'}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => handleCopy(createdKey.token || createdKey.key || createdKey.api_key || '')}
                className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${copiedKey ? 'bg-emerald-500/10 text-emerald-500' : 'bg-teal-500/10 text-teal-500 hover:bg-teal-500/20'}`}>
                {copiedKey ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copiedKey ? t('apiSettings.copied') : t('apiSettings.copyKey')}
              </button>
              <button onClick={() => setCreatedKey(null)} className="flex-1 py-3 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold rounded-xl transition-all">{t('apiSettings.done')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Delete Confirm Modal ====== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? 'bg-[#111113] border-[#1f1f23]' : 'bg-white border-gray-200'}`} onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-500/10 flex items-center justify-center"><Trash2 className="w-7 h-7 text-red-500" /></div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('apiSettings.deleteKey')}</h3>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('apiSettings.deleteConfirm').replace('{name}', deleteTarget.name)}</p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setDeleteTarget(null)} className={`flex-1 py-3 rounded-xl font-medium border transition-colors ${isDark ? 'bg-[#1a1a1d] border-[#1f1f23] text-white hover:bg-[#222225]' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}>{t('apiSettings.cancel')}</button>
              <button onClick={() => handleDelete(deleteTarget.id)} disabled={deleting} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                {t('apiSettings.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}