import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vehicle, MaintenanceRecord, UsageLog, Expense } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  vehicles: Vehicle[];
  maintenance: MaintenanceRecord[];
  usageLogs: UsageLog[];
  expenses: Expense[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { token, logout } = useAuth();

  const refreshData = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || []);
        setMaintenance(data.maintenance || []);
        setUsageLogs(data.usageLogs || []);
        setExpenses(data.expenses || []);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      if (!document.hidden) refreshData();
    }, 5000); // Auto-refresh for webhooks
    const onVisible = () => { if (!document.hidden) refreshData(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [token]);

  return (
    <DataContext.Provider value={{ vehicles, maintenance, usageLogs, expenses, refreshData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

