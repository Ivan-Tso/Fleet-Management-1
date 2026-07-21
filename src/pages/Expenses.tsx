import { useState } from 'react';
import { Plus, Search, Filter, Receipt, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';
import { ExpenseType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { AddExpenseModal } from '../components/AddExpenseModal';

export function Expenses() {
  const { t } = useLanguage();
  const { expenses, vehicles } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.vehicleId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVehicleName = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.make} ${v.model}` : id;
  };

  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const TypeBadge = ({ type }: { type: ExpenseType }) => {
    const styles = {
      fuel: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      maintenance: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      toll: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
      insurance: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
      other: 'bg-zinc-800 text-zinc-400 border border-zinc-700'
    };
    
    return (
      <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest", styles[type])}>
        {t.common[type]}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 uppercase">{t.expenses.title}</h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{t.expenses.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.expenses.addExpense}
        </button>
      </div>

      <AddExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="grid gap-4 md:grid-cols-3 mb-4">
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden col-span-3 lg:col-span-1">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t.expenses.totalFiltered}</span>
          <div className="flex items-baseline space-x-2 z-10">
            <span className="text-4xl font-mono text-white">¥{totalExpenses.toFixed(2)}</span>
          </div>
          <DollarSign className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 text-emerald-500" />
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder={t.expenses.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-950 border border-zinc-800 text-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/50 text-zinc-500 uppercase text-[9px] tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">{t.expenses.table.id}</th>
                <th className="px-6 py-3 font-semibold">{t.expenses.table.type}</th>
                <th className="px-6 py-3 font-semibold">{t.expenses.table.vehicle}</th>
                <th className="px-6 py-3 font-semibold">{t.expenses.table.description}</th>
                <th className="px-6 py-3 font-semibold">{t.expenses.table.date}</th>
                <th className="px-6 py-3 font-semibold">{t.expenses.table.month}</th>
                <th className="px-6 py-3 font-semibold text-right">{t.expenses.table.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-zinc-800/30 transition border-none">
                  <td className="px-6 py-4 font-mono text-zinc-400">
                    <div className="flex items-center">
                      <Receipt className="w-3 h-3 mr-1 text-zinc-500" />
                      {expense.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <TypeBadge type={expense.type} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-zinc-200">{getVehicleName(expense.vehicleId)}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 font-mono">
                    {expense.date}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 font-mono">
                    {expense.month || '-'}
                  </td>
                  <td className="px-6 py-4 text-zinc-200 font-mono font-bold text-right">
                    ¥{expense.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-500 text-sm">
                    {t.expenses.noResults}
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
