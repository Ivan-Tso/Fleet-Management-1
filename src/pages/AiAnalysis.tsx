import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Bot, UploadCloud, FileText, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function AiAnalysis() {
  const { vehicles } = useData();
  const { language: lang } = useLanguage();
  const { token, user } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchPreviousAnalysis = async (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    if (!vehicleId) return;
    
    try {
      const res = await fetch(`/api/ai-analysis/${vehicleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        setAnalysis('');
      }
    } catch {
      setAnalysis('');
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('vehicleId', selectedVehicle);
    if (file) {
      formData.append('manuals', file);
    }
    if (customPrompt) {
      formData.append('customPrompt', customPrompt);
    }

    try {
      const aiProvider = localStorage.getItem('aiProvider') || 'default';
      const aiKey = localStorage.getItem('aiKey') || '';
      
      const headers: any = { 'Authorization': `Bearer ${token}` };
      if (aiProvider !== 'default' && aiKey) {
        headers['x-ai-provider'] = aiProvider;
        headers['x-ai-key'] = aiKey;
      }

      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers,
        body: formData
      });

      if (!res.ok) {
        let errStr = 'Failed to analyze.';
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            errStr = data.error || errStr;
          } else {
            errStr = await res.text();
            console.error('Non-JSON error response:', errStr);
            errStr = `Server Error (${res.status}): Please check console.`;
          }
        } catch(e) {}
        throw new Error(errStr);
      }

      const data = await res.json();
      
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Failed to analyze.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 uppercase flex items-center">
            <Bot className="w-5 h-5 mr-2 text-blue-500" />
            {lang === 'zh' ? 'AI 维修分析' : 'AI Maintenance Analysis'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">
            {lang === 'zh' ? '上传手册并获取车辆智能分析' : 'Upload manuals to get smart analysis'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleAnalyze} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  {lang === 'zh' ? '选择车辆' : 'Select Vehicle'}
                </label>
                <select 
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  value={selectedVehicle}
                  onChange={e => fetchPreviousAnalysis(e.target.value)}
                  required
                >
                  <option value="">{lang === 'zh' ? '-- 请选择车辆 --' : '-- Select a vehicle --'}</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.make} {v.model} ({v.licensePlate})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  {lang === 'zh' ? '上传手册/文件 (可选)' : 'Upload Manual / Doc (Optional)'}
                </label>
                <label className="border-2 border-dashed border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/50 transition">
                  <UploadCloud className="w-8 h-8 text-zinc-600 mb-2" />
                  <span className="text-sm font-medium text-zinc-400">
                    {file ? file.name : (lang === 'zh' ? '点击选择文件' : 'Click to select file')}
                  </span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".txt,.pdf,.md"
                    onChange={e => e.target.files && setFile(e.target.files[0])}
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  {lang === 'zh' ? '附加提示/问题 (可选)' : 'Custom Prompt / Question (Optional)'}
                </label>
                <textarea
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder={lang === 'zh' ? '例如：重点分析这辆车的刹车系统，或预估下个月的保险和保养费用。' : 'e.g. Focus on the braking system, or estimate insurance and maintenance costs for next month.'}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 min-h-[80px]"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || !selectedVehicle}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-widest transition"
              >
                {loading ? (lang === 'zh' ? '分析中...' : 'Analyzing...') : (lang === 'zh' ? '开始AI分析' : 'Start AI Analysis')}
              </button>
              
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 min-h-[400px]">
            {analysis ? (
              <div className="prose prose-invert prose-blue max-w-none prose-sm font-sans markdown-body">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-4">
                <FileText className="w-16 h-16 opacity-20" />
                <p className="text-sm uppercase tracking-widest font-bold">
                  {lang === 'zh' ? '尚未生成分析报告' : 'No analysis generated yet'}
                </p>
                <p className="text-xs max-w-md text-center text-zinc-500">
                  {lang === 'zh' ? '选择您的车辆并（可选）上传相关的维修手册以获取个性化的人工智能维护建议并预测未来成本。' : 'Select your vehicle and optionally upload relevant manuals to get personalized AI maintenance suggestions and predict future costs.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
