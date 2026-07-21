import React, { useState } from 'react';
import { Modal } from './Modal';
import { useData } from '../contexts/DataContext';
import { ExpenseType } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AddExpenseModal({ isOpen, onClose }: Props) {
  const { vehicles, refreshData } = useData();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: 'fuel' as ExpenseType,
    date: new Date().toISOString().split('T')[0],
    month: '',
    amount: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Clean up data based on type
    const payload = { ...formData };
    if (payload.type === 'toll') {
      payload.date = ''; // tolls use month instead of exact date
    } else {
      payload.month = ''; // others use precise date
    }

    try {
      const res = await fetch('/api/webhook/expenses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
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
        vehicleId: '', type: 'fuel', date: new Date().toISOString().split('T')[0], month: '', amount: '', description: ''
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense">
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
          <label className="block text-xs text-zinc-400 mb-1">Type</label>
          <select 
            required
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as ExpenseType})}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="fuel">Fuel</option>
            <option value="toll">Toll</option>
            <option value="maintenance">Maintenance</option>
            <option value="insurance">Insurance</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formData.type === 'toll' ? (
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Month</label>
              <input 
                type="month" required
                value={formData.month}
                onChange={e => setFormData({...formData, month: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Date</label>
              <input 
                type="date" required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Amount</label>
            <input 
              type="number" required min="0" step="0.01"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Description</label>
          <input 
            type="text" required
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
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
            {loading ? 'Saving...' : 'Save Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

