import React, { useState } from 'react';
import { Modal } from './Modal';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { VehicleStatus } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AddVehicleModal({ isOpen, onClose }: Props) {
  const { refreshData } = useData();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    status: 'active' as VehicleStatus,
    department: '',
    mileage: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, String(v)));
      if (imageFile) {
        fd.append('image', imageFile);
      }

      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: fd
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
            console.error('Non-JSON error response:', errStr);
            errStr = `Server Error (${res.status})`;
          }
        } catch(e) {}
        throw new Error(errStr);
      }

      await refreshData();
      onClose();
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: '',
        status: 'active',
        department: '',
        mileage: 0
      });
      setImageFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Vehicle">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-xs">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Make</label>
            <input 
              type="text" required
              value={formData.make}
              onChange={e => setFormData({...formData, make: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Model</label>
            <input 
              type="text" required
              value={formData.model}
              onChange={e => setFormData({...formData, model: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Year</label>
            <input 
              type="number" required
              value={formData.year}
              onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">License Plate</label>
            <input 
              type="text" required
              value={formData.licensePlate}
              onChange={e => setFormData({...formData, licensePlate: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Status</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as VehicleStatus})}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500" 
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Department</label>
            <input 
              type="text"
              value={formData.department}
              onChange={e => setFormData({...formData, department: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Vehicle Image (Optional)</label>
          <input 
            type="file"
            accept="image/*"
            onChange={e => e.target.files && setImageFile(e.target.files[0])}
            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700" 
          />
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Add Vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
