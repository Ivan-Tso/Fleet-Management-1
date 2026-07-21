import { Car, Activity, Wrench, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { useMemo } from 'react';

export function Dashboard() {
  const { t } = useLanguage();
  const { vehicles, maintenance } = useData();

  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const inMaintenance = vehicles.filter(v => v.status === 'maintenance').length;
  const inactiveVehicles = vehicles.filter(v => v.status === 'inactive').length;

  const stats = [
    { name: t.dashboard.totalVehicles, value: vehicles.length, icon: Car, color: 'text-blue-500' },
    { name: t.dashboard.active, value: activeVehicles, icon: Activity, color: 'text-emerald-500' },
    { name: t.dashboard.inMaintenance, value: inMaintenance, icon: Wrench, color: 'text-amber-500' },
    { name: t.dashboard.inactive, value: inactiveVehicles, icon: AlertCircle, color: 'text-zinc-500' },
  ];

  const maintenanceData = useMemo(() => {
    const byMonth: Record<string, number> = {};
    for (const m of maintenance) {
      const key = m.date?.slice(0, 7); // 'YYYY-MM'
      if (key) byMonth[key] = (byMonth[key] || 0) + m.cost;
    }
    const entries = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
    
    // If not enough data, pad with empty months based on current month
    if (entries.length < 6) {
      const padCount = 6 - entries.length;
      const d = new Date();
      for (let i = 0; i < padCount; i++) {
        d.setMonth(d.getMonth() - 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${yyyy}-${mm}`;
        if (!byMonth[key]) entries.unshift([key, 0]);
      }
      entries.sort(([a], [b]) => a.localeCompare(b)).slice(-6);
    }
    
    return entries.map(([month, cost]) => {
      // month is YYYY-MM
      return { name: month, cost };
    });
  }, [maintenance]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100 uppercase">{t.dashboard.title}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{stat.name}</span>
            <div className="flex items-baseline space-x-2 z-10">
              <span className="text-4xl font-mono text-white">{stat.value}</span>
            </div>
            <stat.icon className={`absolute -bottom-2 -right-2 w-16 h-16 opacity-10 ${stat.color}`} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Chart */}
        <div className="col-span-2 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">{t.dashboard.maintenanceCosts}</span>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" /* zinc-800 */ />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={(val) => `¥${val}`} />
                <Tooltip cursor={{ fill: '#27272a' }} contentStyle={{ borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#18181b', color: '#f4f4f5' }} />
                <Bar dataKey="cost" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-1 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t.dashboard.recentPriority}</span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {maintenance.map((record) => {
               // Assign color based on status for the mock UI
               const borderColor = record.status === 'in_progress' ? 'border-yellow-500' : 'border-blue-500';
               return (
                 <div key={record.id} className={`p-3 bg-zinc-950 border-l-2 ${borderColor} rounded`}>
                   <p className="text-xs font-bold text-zinc-200">{record.vehicleId}: {t.common[record.type.toLowerCase() as keyof typeof t.common] || record.type}</p>
                   <p className="text-[10px] text-zinc-500 mt-1">{record.description} • {record.date}</p>
                 </div>
               );
            })}
          </div>
          <button className="mt-4 w-full p-2 bg-zinc-800 hover:bg-zinc-700 transition-colors rounded text-[11px] font-semibold text-zinc-400">{t.dashboard.viewAllLogs}</button>
        </div>
      </div>
    </div>
  );
}
