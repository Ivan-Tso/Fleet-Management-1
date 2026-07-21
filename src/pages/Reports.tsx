import { Download, FileText, PieChart, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function Reports() {
  const { t } = useLanguage();

  const reportTypes = t.reports.reportsList.map((r, i) => {
    const icons = [TrendingUp, FileText, PieChart];
    const colors = ['text-blue-500', 'text-amber-500', 'text-emerald-500'];
    return { ...r, icon: icons[i], color: colors[i] };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 uppercase">{t.reports.title}</h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{t.reports.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <div key={report.id} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col group hover:border-zinc-700 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <report.icon className={`w-6 h-6 ${report.color}`} />
              </div>
            </div>
            <h3 className="font-semibold text-zinc-100 uppercase tracking-tight text-sm mb-2">{report.title}</h3>
            <p className="text-xs text-zinc-400 mb-6 flex-1 pr-4 leading-relaxed">{report.description}</p>
            
            <button 
              onClick={() => alert(t.common?.comingSoon || 'Coming Soon!')}
              className="w-full flex items-center justify-center px-4 py-2 bg-zinc-950 border border-zinc-800 rounded text-[10px] font-bold uppercase tracking-widest text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <Download className="w-3 h-3 mr-2" />
              {t.reports.generateReport}
            </button>
          </div>
        ))}
      </div>
      
      {/* Mini preview component for style */}
      <div className="mt-8 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t.reports.recentReports}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded border border-zinc-800/50 hover:bg-zinc-800/30 transition">
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-sm font-semibold text-zinc-200">{t.reports.reportsList[1].title}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{t.reports.generatedText} 14 Oct 2023 | {t.reports.pdf}</p>
              </div>
            </div>
            <button 
              onClick={() => alert(t.common?.comingSoon || 'Coming Soon!')}
              className="p-2 text-zinc-500 hover:text-blue-400 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded border border-zinc-800/50 hover:bg-zinc-800/30 transition">
            <div className="flex items-center space-x-3">
              <PieChart className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-sm font-semibold text-zinc-200">{t.reports.reportsList[2].title}</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{t.reports.generatedText} 01 Oct 2023 | {t.reports.csv}</p>
              </div>
            </div>
            <button 
              onClick={() => alert(t.common?.comingSoon || 'Coming Soon!')}
              className="p-2 text-zinc-500 hover:text-blue-400 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
