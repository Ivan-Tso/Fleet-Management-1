import { useState } from 'react';
import { Plus, Search, Calendar, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { MaintenanceStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { AddMaintenanceModal } from '../components/AddMaintenanceModal';

export function Maintenance() {
  const { t } = useLanguage();
  const { vehicles, maintenance } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const StatusBadge = ({ status }: { status: MaintenanceStatus }) => {
    const styles = {
      completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      in_progress: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
      scheduled: 'bg-zinc-800 text-zinc-400 border border-zinc-700'
    };
    
    return (
      <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest", styles[status])}>
        {t.common[status]}
      </span>
    );
  }

  const getVehicleDetails = (vehicleId: string) => {
    const v = vehicles.find(v => v.id === vehicleId);
    return v ? `${v.make} ${v.model} (${v.licensePlate})` : vehicleId;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 uppercase">{t.maintenance.title}</h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{t.maintenance.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.maintenance.logMaintenance}
        </button>
      </div>

      <AddMaintenanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {maintenance.map((record) => (
          <div key={record.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 hover:bg-zinc-800/30 transition flex flex-col group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-zinc-950 rounded mr-3 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                  <FileText className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-200">{t.common[record.type.toLowerCase() as keyof typeof t.common] || record.type}</h3>
                  <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{record.id}</p>
                </div>
              </div>
              <StatusBadge status={record.status} />
            </div>
            
            <div className="space-y-3 mt-4 text-xs text-zinc-400">
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-500">{t.maintenance.vehicle}</span>
                <span className="font-medium text-zinc-300">{getVehicleDetails(record.vehicleId)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-500">{t.maintenance.date}</span>
                <span className="font-mono text-zinc-300 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {record.date}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-500">{t.maintenance.cost}</span>
                <span className="font-mono font-bold text-zinc-200">¥{record.cost.toFixed(2)}</span>
              </div>
              <div className="pt-2">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">{t.maintenance.description}</p>
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{record.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
