import React, { useState } from 'react';
import { APP_CONFIG } from '../../config/appConfig';
import { api, setAuthSession, AuthUser } from '../../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@teaestate.local');
  const [password, setPassword] = useState('Estate@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.login(email, password);
      setAuthSession(response);
      onLoginSuccess(response);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Estate@12345');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 text-2xl shadow-inner mb-3">
            🌱
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{APP_CONFIG.name}</h1>
          <p className="text-xs text-slate-500 mt-1">{APP_CONFIG.tagline}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800"
              placeholder="e.g. admin@teaestate.local"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Estate Portal'}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
            One-Click Demo Roles
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@teaestate.local')}
              className="p-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded text-slate-700 text-center font-medium transition border border-slate-200/60"
            >
              👑 Administrator
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('manager@teaestate.local')}
              className="p-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded text-slate-700 text-center font-medium transition border border-slate-200/60"
            >
              📋 Estate Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('supervisor@teaestate.local')}
              className="p-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded text-slate-700 text-center font-medium transition border border-slate-200/60"
            >
              🧑‍🌾 Field Supervisor
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('dataentry@teaestate.local')}
              className="p-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded text-slate-700 text-center font-medium transition border border-slate-200/60"
            >
              ✍️ Data Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
