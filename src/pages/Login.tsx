import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Car } from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { language: lang, toggleLanguage } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        login(data.token, data.user);
        navigate('/');
      } else {
        try {
          const data = await res.json();
          setError(data.error || 'Login failed');
        } catch(e) {
          setError(`Server Error (${res.status})`);
        }
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="flex justify-center mb-6 relative">
          <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl">
            <Car className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center tracking-tight text-zinc-100 mb-2">FleetConnect</h1>
        <p className="text-zinc-500 text-center mb-8 text-sm">Please sign in to continue</p>
        
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-lg text-center font-medium">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5 relative">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-colors mt-2 text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 flex justify-center space-x-4">
          <button onClick={toggleLanguage} className={`text-xs font-bold uppercase tracking-widest ${lang === 'en' ? 'text-blue-500' : 'text-zinc-600 hover:text-zinc-400'} transition`}>EN</button>
          <button onClick={toggleLanguage} className={`text-xs font-bold uppercase tracking-widest ${lang === 'zh' ? 'text-blue-500' : 'text-zinc-600 hover:text-zinc-400'} transition`}>中</button>
        </div>
      </div>
    </div>
  );
}
