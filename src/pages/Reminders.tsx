import { useState, useEffect, useCallback } from 'react';
import { Plus, Wrench, Shield, Search, Fuel, AlertTriangle, Bell, CheckCircle, Trash2, Calendar, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { Reminder, ReminderType, Vehicle } from '../types';
import { AddReminderModal } from '../components/AddReminderModal';

const REMINDER_ICONS: Record<ReminderType, typeof Wrench> = {
  maintenance: Wrench,
  insurance: Shield,
  inspection: Search,
  fuel: Fuel,
  tire: AlertTriangle,
  other: Bell,
};

const REMINDER_COLORS: Record<ReminderType, string> = {
  maintenance: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  insurance: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
  inspection: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
  fuel: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  tire: 'bg-red-500/10 text-red-400 border border-red-500/30',
  other: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
};

const ICON_BG_COLORS: Record<ReminderType, string> = {
  maintenance: 'bg-amber-500/10 border-amber-500/30',
  insurance: 'bg-purple-500/10 border-purple-500/30',
  inspection: 'bg-blue-500/10 border-blue-500/30',
  fuel: 'bg-emerald-500/10 border-emerald-500/30',
  tire: 'bg-red-500/10 border-red-500/30',
  other: 'bg-zinc-800 border-zinc-700',
};

const ICON_COLORS: Record<ReminderType, string> = {
  maintenance: 'text-amber-400',
  insurance: 'text-purple-400',
  inspection: 'text-blue-400',
  fuel: 'text-emerald-400',
  tire: 'text-red-400',
  other: 'text-zinc-400',
};

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function apiFetch(url: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [remindersData, vehiclesData] = await Promise.all([
        apiFetch('/api/reminders'),
        apiFetch('/api/vehicles'),
      ]);
      setReminders(remindersData);
      setVehicles(vehiclesData);
    } catch (err) {
      console.error('Failed to fetch reminders data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getVehicleName = (vehicleId: string): string => {
    const v = vehicles.find((v) => v.id === vehicleId);
    return v ? `${v.make} ${v.model} (${v.licensePlate})` : vehicleId;
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    if (completing[reminder.id]) return;
    try {
      setCompleting((prev) => ({ ...prev, [reminder.id]: true }));
      await apiFetch(`/api/reminders/${reminder.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isCompleted: !reminder.isCompleted }),
      });
      setReminders((prev) =>
        prev.map((r) => (r.id === reminder.id ? { ...r, isCompleted: !r.isCompleted } : r))
      );
    } catch (err) {
      console.error('Failed to update reminder:', err);
    } finally {
      setCompleting((prev) => ({ ...prev, [reminder.id]: false }));
    }
  };

  const handleDelete = async (id: string) => {
    if (deleting[id]) return;
    try {
      setDeleting((prev) => ({ ...prev, [id]: true }));
      await apiFetch(`/api/reminders/${id}`, { method: 'DELETE' });
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcoming = reminders.filter(
    (r) => !r.isCompleted && daysUntil(r.dueDate) >= 0 && daysUntil(r.dueDate) <= 7
  );
  const pending = reminders.filter((r) => !r.isCompleted && daysUntil(r.dueDate) > 7);
  const completed = reminders.filter((r) => r.isCompleted);

  const overdueCount = reminders.filter((r) => !r.isCompleted && daysUntil(r.dueDate) < 0).length;
  const completedThisMonth = completed.filter((r) => isThisMonth(r.dueDate)).length;

  const formatRepeat = (interval?: string): string => {
    if (!interval) return '-';
    const map: Record<string, string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    };
    return map[interval] || interval;
  };

  const RenderReminderCard = ({ reminder }: { reminder: Reminder }) => {
    const Icon = REMINDER_ICONS[reminder.type] || Bell;
    const days = daysUntil(reminder.dueDate);
    const isOverdue = days < 0;

    return (
      <div
        key={reminder.id}
        className={cn(
          'bg-zinc-900 rounded-2xl border p-5 hover:bg-zinc-800/30 transition flex flex-col group',
          reminder.isCompleted ? 'border-zinc-800/50 opacity-70' : 'border-zinc-800'
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2 rounded border transition-colors',
                ICON_BG_COLORS[reminder.type] || 'bg-zinc-800 border-zinc-700'
              )}
            >
              <Icon
                className={cn('w-4 h-4', ICON_COLORS[reminder.type] || 'text-zinc-400')}
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-200">{reminder.title}</h3>
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest inline-block mt-1',
                  REMINDER_COLORS[reminder.type] || 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                )}
              >
                {reminder.type}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleToggleComplete(reminder)}
              disabled={completing[reminder.id]}
              className={cn(
                'p-1.5 rounded transition',
                reminder.isCompleted
                  ? 'text-emerald-400 hover:text-emerald-300'
                  : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800'
              )}
              title={reminder.isCompleted ? 'Mark as pending' : 'Mark as completed'}
            >
              <CheckCircle
                className={cn(
                  'w-4 h-4',
                  reminder.isCompleted && 'fill-emerald-500/20',
                  completing[reminder.id] && 'animate-pulse'
                )}
              />
            </button>
            <button
              onClick={() => handleDelete(reminder.id)}
              disabled={deleting[reminder.id]}
              className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded transition"
              title="Delete reminder"
            >
              <Trash2 className={cn('w-4 h-4', deleting[reminder.id] && 'animate-pulse')} />
            </button>
          </div>
        </div>

        <div className="space-y-3 text-xs text-zinc-400">
          <div className="flex items-center justify-between py-1 border-b border-zinc-800/50">
            <span className="text-zinc-500">Vehicle</span>
            <span className="font-medium text-zinc-300">{getVehicleName(reminder.vehicleId)}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-zinc-800/50">
            <span className="text-zinc-500">Due Date</span>
            <span className="font-mono text-zinc-300 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {reminder.dueDate}
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-zinc-800/50">
            <span className="text-zinc-500">Days Remaining</span>
            <span
              className={cn(
                'font-mono font-bold',
                isOverdue ? 'text-red-400' : 'text-zinc-300'
              )}
            >
              {isOverdue ? `${Math.abs(days)} days overdue` : `${days} days`}
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-zinc-800/50">
            <span className="text-zinc-500">Repeat</span>
            <span className="font-mono text-zinc-300 flex items-center">
              <RefreshCw className="w-3 h-3 mr-1" />
              {formatRepeat(reminder.repeatInterval)}
            </span>
          </div>
          {reminder.description && (
            <div className="pt-1">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5">Description</p>
              <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{reminder.description}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SectionBlock = ({ title, items }: { title: string; items: Reminder[] }) => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">{title}</h2>
        <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 text-center">
          <p className="text-xs text-zinc-500">No reminders in this section</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((reminder) => (
            <RenderReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 uppercase">Reminders</h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Manage vehicle reminders</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </button>
      </div>

      <AddReminderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onReminderAdded={fetchData} />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Total Reminders</span>
          <span className="text-4xl font-mono text-white">{reminders.length}</span>
          <Bell className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 text-blue-500" />
        </div>
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Overdue</span>
          <span className={cn('text-4xl font-mono', overdueCount > 0 ? 'text-red-400' : 'text-white')}>
            {overdueCount}
          </span>
          <AlertTriangle className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 text-red-500" />
        </div>
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between h-28 relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Completed This Month</span>
          <span className="text-4xl font-mono text-emerald-400">{completedThisMonth}</span>
          <CheckCircle className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 text-emerald-500" />
        </div>
      </div>

      {/* Upcoming Section */}
      <SectionBlock title={`Upcoming (Next 7 Days)`} items={upcoming} />

      {/* Pending Section */}
      <SectionBlock title="Pending" items={pending} />

      {/* Completed Section */}
      <SectionBlock title="Completed" items={completed} />
    </div>
  );
}