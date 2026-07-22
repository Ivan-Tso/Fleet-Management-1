import React, { useState, useEffect, useCallback } from 'react';
import { Fuel, X } from 'lucide-react';
import { Modal } from './Modal';

interface Vehicle {
  id: string;
  name: string;
  plate?: string;
}

interface AddFuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicleId?: string;
}

const AddFuelModal: React.FC<AddFuelModalProps> = ({ isOpen, onClose, onSuccess, vehicleId }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    vehicleId: vehicleId || '',
    date: new Date().toISOString().split('T')[0],
    liters: '',
    pricePerLiter: '',
    totalCost: '',
    isFullTank: false,
    mileage: '',
    station: '',
    notes: '',
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (vehicleId) {
      setFormData((prev) => ({ ...prev, vehicleId }));
    }
  }, [vehicleId]);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setFormData({
      vehicleId: vehicleId || '',
      date: today,
      liters: '',
      pricePerLiter: '',
      totalCost: '',
      isFullTank: false,
      mileage: '',
      station: '',
      notes: '',
    });
  }, [isOpen, vehicleId]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchVehicles = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/vehicles', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load vehicles');
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : data.vehicles || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load vehicles');
      }
    };
    fetchVehicles();
  }, [isOpen]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked = type === 'checkbox' ? (e as React.ChangeEvent<HTMLInputElement>).target.checked : undefined;

      setFormData((prev) => {
        const next = { ...prev, [name]: type === 'checkbox' ? checked : value };

        const liters = parseFloat(next.liters) || 0;
        const pricePerLiter = parseFloat(next.pricePerLiter) || 0;
        const totalCost = parseFloat(next.totalCost) || 0;

        if (name === 'liters' || name === 'totalCost') {
          if (liters > 0 && totalCost > 0) {
            next.pricePerLiter = (totalCost / liters).toFixed(2);
          }
        }

        if (name === 'liters' || name === 'pricePerLiter') {
          if (liters > 0 && pricePerLiter > 0) {
            next.totalCost = (liters * pricePerLiter).toFixed(2);
          }
        }

        return next;
      });
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.vehicleId) {
      setError('Please select a vehicle');
      return;
    }
    if (!formData.liters || parseFloat(formData.liters) <= 0) {
      setError('Liters must be greater than 0');
      return;
    }
    if (!formData.pricePerLiter || parseFloat(formData.pricePerLiter) <= 0) {
      setError('Price per liter must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/fuel-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicleId: formData.vehicleId,
          date: formData.date,
          liters: parseFloat(formData.liters),
          pricePerLiter: parseFloat(formData.pricePerLiter),
          totalCost: parseFloat(formData.totalCost),
          isFullTank: formData.isFullTank,
          mileage: formData.mileage ? parseInt(formData.mileage, 10) : undefined,
          station: formData.station || undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Failed to add fuel entry (${res.status})`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Fuel Entry">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Vehicle *</label>
          <select
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}{v.plate ? ` (${v.plate})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={today}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Liters *</label>
            <input
              type="number"
              name="liters"
              value={formData.liters}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Price/L *</label>
            <input
              type="number"
              name="pricePerLiter"
              value={formData.pricePerLiter}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Total Cost *</label>
            <input
              type="number"
              name="totalCost"
              value={formData.totalCost}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isFullTank"
            checked={formData.isFullTank}
            onChange={handleChange}
            id="isFullTank"
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500"
          />
          <label htmlFor="isFullTank" className="text-sm text-zinc-300">
            Full tank
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Mileage (km)</label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            min="0"
            placeholder="Odometer reading"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Station</label>
          <input
            type="text"
            name="station"
            value={formData.station}
            onChange={handleChange}
            placeholder="Gas station name"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Optional notes..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 transition-colors"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Fuel size={16} />
            {submitting ? 'Adding...' : 'Add Fuel Entry'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export { AddFuelModal };