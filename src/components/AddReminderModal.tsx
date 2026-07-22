import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Bell, Calendar, RotateCcw } from 'lucide-react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  vehicleId?: string;
}

const REMINDER_TYPES = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'tire', label: 'Tire' },
  { value: 'other', label: 'Other' },
] as const;

const REPEAT_INTERVALS = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export function AddReminderModal({ isOpen, onClose, onSuccess, vehicleId: presetVehicleId }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    vehicleId: presetVehicleId || '',
    type: 'maintenance',
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    repeatInterval: 'none',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        vehicleId: presetVehicleId || '',
        type: 'maintenance',
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        repeatInterval: 'none',
      });
      setError('');
      fetchVehicles();
    }
  }, [isOpen, presetVehicleId]);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
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
        } catch (e) {}
        throw new Error(errStr);
      }

      onSuccess?.();
      onClose();
      setFormData({
        vehicleId: '',
        type: 'maintenance',
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        repeatInterval: 'none',
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Reminder">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-xs">{error}</div>}

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Vehicle</label>
          <select
            required
            value={formData.vehicleId}
            onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="">Select Vehicle</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.make} {v.model} ({v.licensePlate})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Type</label>
          <div className="relative">
            <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <select
              required
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded pl-9 pr-3 py-2 outline-none focus:border-blue-500 appearance-none"
            >
              {REMINDER_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Title</label>
          <input
            type="text" required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Oil Change Due"
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Reminder details..."
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Due Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                type="date" required
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded pl-9 pr-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Repeat</label>
            <div className="relative">
              <RotateCcw className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <select
                value={formData.repeatInterval}
                onChange={e => setFormData({ ...formData, repeatInterval: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded pl-9 pr-3 py-2 outline-none focus:border-blue-500 appearance-none"
              >
                {REPEAT_INTERVALS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
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
            {loading ? 'Saving...' : 'Save Reminder'}
          </button>
        </div>
      </form>
    </Modal>
  );
}