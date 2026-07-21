import React, { useState } from 'react';
import { Modal } from './Modal';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AddUsageLogModal({ isOpen, onClose }: Props) {
  const { vehicles, refreshData } = useData();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverName: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    startMileage: '',
    endMileage: '',
    purpose: '',
    destination: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const sMileage = parseFloat(formData.startMileage) || 0;
    const eMileage = parseFloat(formData.endMileage) || 0;
    if (eMileage < sMileage) {
      setError('End Mileage cannot be less than Start Mileage.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/webhook/usage-logs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        let errStr = 'Failed to save.';
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            errStr = data.error || errStr;
          } else {
            errStr = await res.text();
          }
        } catch(e) {}
        throw new Error(errStr);
      }
      await refreshData();
      onClose();
      setFormData({
        vehicleId: '', driverName: '', date: new Date().toISOString().split('T')[0], startTime: '', endTime: '', startMileage: '', endMileage: '', purpose: '', destination: ''
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Usage Log">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-xs">{error}</div>}
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Vehicle</label>
          <select 
            required
            value={formData.vehicleId}
            onChange={e => setFormData({...formData, vehicleId: e.target.value})}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="">Select Vehicle</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.make} {v.model} ({v.licensePlate})</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Driver Name</label>
          <input 
            type="text" required
            value={formData.driverName}
            onChange={e => setFormData({...formData, driverName: e.target.value})}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Date</label>
            <input 
              type="date" required
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
          <div></div>
          
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Start Time</label>
            <input 
              type="time" 
              value={formData.startTime}
              onChange={e => setFormData({...formData, startTime: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-xs text-zinc-400 mb-1">End Time</label>
            <input 
              type="time" 
              value={formData.endTime}
              onChange={e => setFormData({...formData, endTime: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Start Mileage</label>
            <input 
              type="number" required min="0" step="0.1"
              value={formData.startMileage}
              onChange={e => setFormData({...formData, startMileage: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-xs text-zinc-400 mb-1">End Mileage</label>
            <input 
              type="number" required min="0" step="0.1"
              value={formData.endMileage}
              onChange={e => setFormData({...formData, endMileage: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Destination</label>
          <input 
            type="text"
            value={formData.destination}
            onChange={e => setFormData({...formData, destination: e.target.value})}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Purpose</label>
          <input 
            type="text" required
            value={formData.purpose}
            onChange={e => setFormData({...formData, purpose: e.target.value})}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div className="pt-4 flex justify-end space-x-2 border-t border-zinc-800">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Log'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
