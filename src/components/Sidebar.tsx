import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, Wrench, Settings, LogOut, ClipboardList, Wallet, BarChart, Bot, Users, Fuel, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const { t, language } = useLanguage();
  const { logout, user } = useAuth();

  const navItems = [
    { name: t.nav.dashboard, href: '/', icon: LayoutDashboard },
    { name: t.nav.vehicles, href: '/vehicles', icon: Car },
    { name: t.nav.maintenance, href: '/maintenance', icon: Wrench },
    { name: language === 'zh' ? 'AI分析' : 'AI Analysis', href: '/ai-analysis', icon: Bot },
    { name: t.nav.usageLogs, href: '/usage', icon: ClipboardList },
    { name: t.nav.expenses, href: '/expenses', icon: Wallet },
    { name: t.nav.fuel, href: '/fuel', icon: Fuel },
    { name: t.nav.reminders, href: '/reminders', icon: Bell },
    { name: t.nav.reports, href: '/reports', icon: BarChart },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: language === 'zh' ? '用户管理' : 'Users', href: '/users', icon: Users });
  }

  navItems.push({ name: t.nav.settings, href: '/settings', icon: Settings });

  return (
    <div className="flex flex-col w-64 h-full bg-zinc-950 text-zinc-100 border-r border-zinc-800">
      <div className="flex items-center justify-center py-6 border-b border-zinc-800">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white mr-3">F</div>
        <span className="text-xl font-semibold tracking-tight uppercase">{t.sidebar.fleetTrack}</span>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors group border",
                isActive 
                  ? "bg-zinc-900 border-zinc-800 text-blue-400" 
                  : "border-transparent text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300 hover:border-zinc-800/50"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 mr-3", 
                isActive ? "text-blue-500" : "text-zinc-500 group-hover:text-zinc-400"
              )} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button onClick={logout} className="flex items-center w-full px-4 py-3 text-xs font-bold uppercase tracking-widest text-zinc-500 rounded hover:bg-zinc-900/50 hover:text-zinc-300 transition-colors group border border-transparent hover:border-zinc-800/50">
          <LogOut className="w-5 h-5 mr-3 text-zinc-500 group-hover:text-zinc-400" />
          <span>{t.sidebar.signOut}</span>
        </button>
      </div>
    </div>
  );
}

