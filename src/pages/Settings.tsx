import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Copy, Check, Loader2, AlertCircle } from 'lucide-react';

export function Settings() {
  const { t, language } = useLanguage();
  const { refreshData } = useData();
  const { token, user } = useAuth();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [isClearing, setIsClearing] = useState(false);
  
  const [emailAlerts, setEmailAlerts] = useState(user?.email_alerts ?? true);
  const [weeklyReports, setWeeklyReports] = useState(user?.weekly_reports ?? false);
  const [username, setUsername] = useState(user?.username || 'Admin User');
  const [email, setEmail] = useState(user?.email || `${user?.username || 'admin'}@fleettrack.com`);
  const { login } = useAuth();

  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem('aiProvider') || 'default');
  const [aiApiKey, setAiApiKey] = useState(() => localStorage.getItem('aiKey') || '');
  const [aiSaveSuccess, setAiSaveSuccess] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(text);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      alert(language === 'zh' ? '复制失败，请手动复制' : 'Failed to copy, please copy manually');
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, email, email_alerts: emailAlerts, weekly_reports: weeklyReports })
      });
      if (res.ok) {
        const data = await res.json();
        if (token && data.user) {
          login(token, data.user);
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(language === 'zh' ? '保存失败' : 'Failed to save');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAiConfig = () => {
    localStorage.setItem('aiProvider', aiProvider);
    if (aiProvider === 'default') {
      localStorage.removeItem('aiKey');
      setAiApiKey('');
    } else {
      localStorage.setItem('aiKey', aiApiKey);
    }
    setAiSaveSuccess(true);
    setTimeout(() => setAiSaveSuccess(false), 3000);
  };

  const handleClearData = async () => {
    const confirmMsg = language === 'zh' ? '确定要清除所有数据吗？此操作不可逆！' : 'Are you sure you want to clear all data? This cannot be undone!';
    if (!window.confirm(confirmMsg)) return;
    
    setIsClearing(true);
    try {
      const res = await fetch('/api/data/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        await refreshData();
        alert(language === 'zh' ? '数据已清除' : 'Data successfully cleared');
      } else {
        alert(language === 'zh' ? '清除数据失败' : 'Failed to clear data');
      }
    } catch (err) {
      console.error(err);
      alert(language === 'zh' ? '发生错误' : 'An error occurred');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100 uppercase">{t.settings.title}</h1>
        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{t.settings.subtitle}</p>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 divide-y divide-zinc-800">
        <div className="p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">{t.settings.profileInfo}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">{t.settings.fullName}</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">{t.settings.emailAddress}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-4 py-2 bg-white text-blue-600 rounded text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition shadow-lg disabled:opacity-50 flex items-center"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t.settings.saveChanges}
              </button>
              {saveSuccess && <span className="text-xs text-emerald-500 flex items-center"><Check className="w-3 h-3 mr-1"/> {language === 'zh' ? '已保存' : 'Saved'}</span>}
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">{t.settings.notifications}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-zinc-200">{t.settings.emailAlerts}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{t.settings.emailAlertsDesc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:border-zinc-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-zinc-200">{t.settings.weeklyReports}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{t.settings.weeklyReportsDesc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={weeklyReports} onChange={(e) => setWeeklyReports(e.target.checked)} />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:border-zinc-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center">
            {language === 'zh' ? 'AI 模型配置' : 'AI Configuration'}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">
                  {language === 'zh' ? '大模型提供商' : 'AI Provider'}
                </label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="default">{language === 'zh' ? '系统默认 (Google Gemini)' : 'System Default (Google Gemini)'}</option>
                  <option value="gemini_custom">{language === 'zh' ? '自定义 Google Gemini' : 'Custom Google Gemini'}</option>
                  <option value="openai">{language === 'zh' ? 'OpenAI (GPT-4o 等)' : 'OpenAI (GPT-4o, etc.)'}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className={`text-xs uppercase tracking-widest ${aiProvider === 'default' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {language === 'zh' ? 'API 密钥 (API Key)' : 'API Key'}
                </label>
                <input
                  type="password"
                  disabled={aiProvider === 'default'}
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  placeholder={aiProvider === 'default' ? (language === 'zh' ? '无需填写' : 'Not required') : 'sk-...'}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSaveAiConfig}
                className="px-4 py-2 bg-white text-blue-600 rounded text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition shadow-lg flex items-center"
              >
                {language === 'zh' ? '保存配置' : 'Save Config'}
              </button>
              {aiSaveSuccess && <span className="text-xs text-emerald-500 flex items-center"><Check className="w-3 h-3 mr-1"/>{language === 'zh' ? '已保存' : 'Saved'}</span>}
            </div>
            
            <div className="mt-4 flex items-start gap-2 text-zinc-400 bg-zinc-900/50 p-3 rounded border border-zinc-800">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-xs leading-relaxed">
                {language === 'zh' 
                  ? '注意: 自定义 API 密钥将仅保存在您的浏览器本地，并在分析请求中通过请求头发送。若选择 OpenAI，系统将默认调用 gpt-4o 模型进行保养分析。'
                  : 'Note: Custom API keys are stored locally in your browser and sent securely via headers during analysis requests. If OpenAI is selected, the system defaults to gpt-4o for maintenance analysis.'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#0078D4] mb-4 flex items-center">
            {t.settings.msFormsIntegration}
          </h2>
          <p className="text-sm text-zinc-400 mb-6">{t.settings.msFormsDesc}</p>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-zinc-200">{t.settings.webhookUrl}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5 mb-2">{t.settings.webhookDesc}</p>
              
              <div className="space-y-3">
                {[
                  { name: 'Usage Logs', path: `/api/webhook/usage-logs?token=${token}` },
                  { name: 'Expenses', path: `/api/webhook/expenses?token=${token}` },
                  { name: 'Maintenance', path: `/api/webhook/maintenance?token=${token}` }
                ].map(webhook => {
                  const fullUrl = `${window.location.protocol}//${window.location.host}${webhook.path}`;
                  const isCopied = copiedUrl === fullUrl;
                  
                  return (
                    <div key={webhook.name} className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-xs font-bold w-24 text-zinc-400">{webhook.name}</span>
                      <div className="flex-1 flex bg-zinc-950 border border-zinc-800 rounded overflow-hidden">
                        <input 
                          type="text" 
                          readOnly 
                          value={fullUrl} 
                          className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none"
                        />
                        <button 
                          onClick={() => copyToClipboard(fullUrl)}
                          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition flex items-center justify-center min-w-[80px]"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          <span className="ml-1.5 text-xs">{isCopied ? t.settings.copied : t.settings.copy}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-start gap-2 text-yellow-500/80 bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs">
                  {language === 'zh' ? '注意：上方生成的 Webhook URL 包含您的个人访问令牌，请不要分享给他人。配置 MS Forms 时，请将此链接作为接受 POST 动作的端点。' : 'Note: The generated Webhook URLs include your personal access token. Do not share them. Use these URLs as POST endpoints when configuring MS Forms/Power Automate.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4">{t.settings.dangerZone}</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">{t.settings.dangerDesc}</p>
          <button 
            onClick={handleClearData}
            disabled={isClearing}
            className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition disabled:opacity-50 flex items-center"
          >
            {isClearing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {t.settings.clearData}
          </button>
        </div>
      </div>
    </div>
  );
}
