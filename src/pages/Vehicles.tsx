import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Car } from 'lucide-react';
import { cn } from '../lib/utils';
import { VehicleStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { AddVehicleModal } from '../components/AddVehicleModal';
import { useSearchParams } from 'react-router-dom';

export function Vehicles() {
  const { t } = useLanguage();
  const { vehicles } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuth();
  const { refreshData } = useData();

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm(t.common.confirmDelete || 'Are you sure you want to delete this vehicle?')) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await refreshData();
      } else {
        alert('Failed to delete');
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (val) {
      searchParams.set('q', val);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams, { replace: true });
  };

  const filteredVehicles = vehicles.filter(v => 
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatusBadge = ({ status }: { status: VehicleStatus }) => {
    const styles = {
      active: 'text-emerald-400',
      maintenance: 'text-amber-400',
      inactive: 'text-slate-400'
    };
    
    return (
      <span className={cn("text-xs flex items-center capitalize", styles[status])}>
        <span className="mr-1.5">•</span> {t.common[status]}
      </span>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 uppercase">{t.vehicles.title}</h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{t.vehicles.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.vehicles.addVehicle}
        </button>
      </div>

      <AddVehicleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder={t.vehicles.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/50 text-zinc-500 uppercase text-[9px] tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">{t.vehicles.table.vehicle}</th>
                <th className="px-6 py-3 font-semibold">{t.vehicles.table.licensePlate}</th>
                <th className="px-6 py-3 font-semibold">{t.vehicles.table.status}</th>
                <th className="px-6 py-3 font-semibold">{t.vehicles.table.mileage}</th>
                <th className="px-6 py-3 font-semibold">{t.vehicles.table.department}</th>
                <th className="px-6 py-3 font-semibold text-right">{t.vehicles.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-zinc-800/30 transition border-none">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {vehicle.imageUrl ? (
                        <div className="w-10 h-10 rounded bg-zinc-800 overflow-hidden border border-zinc-700 flex-shrink-0">
                          <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center border border-zinc-700 flex-shrink-0">
                          <Car className="w-5 h-5 text-zinc-400" />
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="font-semibold text-zinc-200">{vehicle.make} {vehicle.model}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{vehicle.year} • {vehicle.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-zinc-300">
                    {vehicle.licensePlate}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={vehicle.status} />
                  </td>
                  <td className="px-6 py-4 text-zinc-400 font-mono">
                    {(vehicle.mileage || 0).toLocaleString()} {t.vehicles.mi}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {vehicle.department}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="text-red-500 hover:text-red-400 p-1 flex items-center justify-end rounded-md hover:bg-red-500/10 transition ml-auto"
                      title="Delete vehicle"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 text-sm">
                    {t.vehicles.noResults}
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
