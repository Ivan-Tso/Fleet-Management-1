import { useState } from 'react';
import { Plus, Search, Filter, Hash } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { AddUsageLogModal } from '../components/AddUsageLogModal';

export function UsageLogs() {
  const { t } = useLanguage();
  const { usageLogs, vehicles } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredLogs = usageLogs.filter(log => 
    log.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.vehicleId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVehicleName = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.make} ${v.model}` : id;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 uppercase">{t.usageLogs.title}</h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{t.usageLogs.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.usageLogs.addLog}
        </button>
      </div>

      <AddUsageLogModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder={t.usageLogs.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/50 text-zinc-500 uppercase text-[9px] tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">{t.usageLogs.table.id}</th>
                <th className="px-6 py-3 font-semibold">{t.usageLogs.table.vehicle}</th>
                <th className="px-6 py-3 font-semibold">{t.usageLogs.table.driver}</th>
                <th className="px-6 py-3 font-semibold">{t.usageLogs.table.date}</th>
                <th className="px-6 py-3 font-semibold">{t.usageLogs.table.time}</th>
                <th className="px-6 py-3 font-semibold">{t.usageLogs.table.distance}</th>
                <th className="px-6 py-3 font-semibold">{t.usageLogs.table.purpose}</th>
                <th className="px-6 py-3 font-semibold">{t.usageLogs.table.destination}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/30 transition border-none">
                  <td className="px-6 py-4 font-mono text-zinc-400">
                    <div className="flex items-center">
                      <Hash className="w-3 h-3 mr-1 text-zinc-500" />
                      {log.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-zinc-200">{getVehicleName(log.vehicleId)}</span>
                    <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">{log.vehicleId}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    {log.driverName}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 font-mono">
                    {log.date}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 font-mono">
                    {log.startTime && log.endTime ? `${log.startTime} - ${log.endTime}` : log.startTime || log.endTime || '-'}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 font-mono">
                    {((log.endMileage || 0) - (log.startMileage || 0)).toLocaleString()} {t.vehicles.mi}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {log.purpose}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {log.destination || '-'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-zinc-500 text-sm">
                    {t.usageLogs.noResults}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
