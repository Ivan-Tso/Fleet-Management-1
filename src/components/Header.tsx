import { Bell, Search, User, Globe2, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { t, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/?q=${encodeURIComponent(searchValue.trim())}`);
      // Assuming vehicles is the home page, but wait, the root is Dashboard.
      // Let's explicitly navigate to /vehicles if it exists, or just pass q to wherever they go.
      navigate(`/vehicles?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center flex-1">
        <div className="relative w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-4 h-4 text-zinc-500" />
          </span>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 text-sm bg-zinc-900 border border-zinc-800 text-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-zinc-600"
            placeholder={t.header.searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-zinc-400">{t.header.systemOperational}</span>
        </div>
        <div className="h-4 w-px bg-zinc-800"></div>

        <button 
          onClick={toggleLanguage}
          className="flex items-center space-x-1 px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded transition-colors text-zinc-400 hover:text-zinc-200"
        >
          <Globe2 className="w-4 h-4" />
          <span className="text-xs font-bold uppercase">{t.header.languageToggle}</span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-950"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-zinc-800 text-xs font-bold uppercase tracking-widest text-zinc-500">
                Notifications
              </div>
              <div className="p-4 text-sm text-zinc-400 text-center">
                No new notifications
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex flex-col items-end mr-3">
              <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">{user?.username || t.header.adminUser}</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{user?.role === 'admin' ? t.header.fleetManager : 'User'}</span>
            </div>
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-full border border-zinc-700 text-zinc-300 group-hover:border-zinc-600 transition-colors">
              <User className="w-4 h-4" />
            </div>
          </div>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
              <button 
                onClick={logout}
                className="w-full flex items-center px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
