import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Fuel, TrendingDown, Gauge, DollarSign, Trash2 } from 'lucide-react';
import { FuelLog, Vehicle } from '../types';
import { AddFuelModal } from '../components/AddFuelModal';

export function FuelLogs() {
  const [token] = useState(() => localStorage.getItem('token'));
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [fuelRes, vehicleRes] = await Promise.all([
        fetch('/api/fuel-logs', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/vehicles', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (fuelRes.ok) setFuelLogs(await fuelRes.json());
      if (vehicleRes.ok) setVehicles(await vehicleRes.json());
    } catch (e) {
      console.error('Error fetching fuel logs:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getVehicleName = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.make} ${v.model}` : id;
  };

  const filteredLogs = fuelLogs.filter(log =>
    getVehicleName(log.vehicleId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.station && log.station.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate consumption (km/L) for a fuel log entry:
  // Find the previous full tank entry for the same vehicle and divide mileage difference by liters difference
  const getConsumption = (log: FuelLog): number | null => {
    if (!log.isFullTank || log.mileage == null) return null;
    const prev = fuelLogs
      .filter(
        l =>
          l.vehicleId === log.vehicleId &&
          l.isFullTank &&
          l.mileage != null &&
          l.id !== log.id &&
          new Date(l.date) < new Date(log.date)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (!prev || prev.mileage == null) return null;
    const kmDiff = log.mileage - prev.mileage;
    if (kmDiff <= 0 || log.liters <= 0) return null;
    return kmDiff / log.liters;
  };

  // Summary calculations
  const totalCost = filteredLogs.reduce((sum, l) => sum + l.totalCost, 0);
  const totalLiters = filteredLogs.reduce((sum, l) => sum + l.liters, 0);
  const avgPricePerLiter =
    filteredLogs.length > 0
      ? filteredLogs.reduce((sum, l) => sum + l.pricePerLiter, 0) / filteredLogs.length
      : 0;

  const consumptions = filteredLogs
    .map(l => getConsumption(l))
    .filter((c): c is number => c !== null);
  const avgConsumption =
    consumptions.length > 0
      ? consumptions.reduce((a, b) => a + b, 0) / consumptions.length
      : 0;

  const handleDelete = async (id: string) => {
    if (!token) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/fuel-logs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFuelLogs(prev => prev.filter(l => l.id !== id));
      }
    } catch (e) {
      console.error('Error deleting fuel log:', e);
    } finally {
      setDeleting(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 uppercase">
            Fuel Logs
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">
            Fuel consumption tracking
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Fuel Entry
        </button>
      </div>

      <AddFuelModal isOpen={isModalOpen} onClose={handleModalClose} />

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-4">
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Total Fuel Cost
          </span>
          <div className="flex items-baseline space-x-2 z-10">
            <span className="text-3xl font-mono text-white">${totalCost.toFixed(2)}</span>
          </div>
          <DollarSign className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 text-emerald-500" />
        </div>
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Total Liters
          </span>
          <div className="flex items-baseline space-x-2 z-10">
            <span className="text-3xl font-mono text-white">{totalLiters.toFixed(1)}</span>
            <span className="text-zinc-500 text-sm font-mono">L</span>
          </div>
          <Fuel className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 text-blue-500" />
        </div>
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Avg Price/Liter
          </span>
          <div className="flex items-baseline space-x-2 z-10">
            <span className="text-3xl font-mono text-white">${avgPricePerLiter.toFixed(2)}</span>
          </div>
          <TrendingDown className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 text-amber-500" />
        </div>
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Avg Consumption
          </span>
          <div className="flex items-baseline space-x-2 z-10">
            <span className="text-3xl font-mono text-white">
              {avgConsumption > 0 ? avgConsumption.toFixed(1) : '-'}
            </span>
            {avgConsumption > 0 && (
              <span className="text-zinc-500 text-xs font-mono">km/L</span>
            )}
          </div>
          <Gauge className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 text-cyan-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by vehicle or station..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/50 text-zinc-500 uppercase text-[9px] tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Vehicle</th>
                <th className="px-6 py-3 font-semibold">Liters</th>
                <th className="px-6 py-3 font-semibold">Price/L</th>
                <th className="px-6 py-3 font-semibold">Total Cost</th>
                <th className="px-6 py-3 font-semibold">Mileage</th>
                <th className="px-6 py-3 font-semibold">Station</th>
                <th className="px-6 py-3 font-semibold">Full Tank</th>
                <th className="px-6 py-3 font-semibold">Consumption</th>
                <th className="px-6 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-12 text-center text-zinc-500 text-sm"
                  >
                    Loading fuel logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-12 text-center text-zinc-500 text-sm"
                  >
                    No fuel logs found.
                  </td>
                </tr>
              ) : (
                [...filteredLogs]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(log => (
                    <tr key={log.id} className="hover:bg-zinc-800/30 transition border-none">
                      <td className="px-6 py-4 font-mono text-zinc-300 whitespace-nowrap">
                        {new Date(log.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-zinc-200">
                          {getVehicleName(log.vehicleId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-300">
                        {log.liters.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-300">
                        ${log.pricePerLiter.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-200 font-semibold">
                        ${log.totalCost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-400">
                        {log.mileage != null ? log.mileage.toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{log.station || '-'}</td>
                      <td className="px-6 py-4">
                        {log.isFullTank ? (
                          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Full
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-zinc-800 text-zinc-500 border border-zinc-700">
                            Partial
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-300">
                        {(() => {
                          const c = getConsumption(log);
                          return c != null ? `${c.toFixed(1)} km/L` : '-';
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={deleting === log.id}
                          className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}