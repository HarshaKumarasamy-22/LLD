import React from 'react';
import { APP_CONFIG } from '../config/appConfig';
import { AuthUser } from '../services/api';

interface NavbarProps {
  user: AuthUser;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, activeTab, setActiveTab, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'fields', label: 'Field Registry', icon: '🗺️' },
    { id: 'pluckers', label: 'Pluckers', icon: '👥' },
    { id: 'field-weights', label: 'Daily Field Weights', icon: '⚖️' },
    { id: 'intakes', label: 'Plucker Intakes', icon: '🧺' },
    { id: 'agronomy', label: 'Agronomy', icon: '🌿' },
    { id: 'reconciliation', label: 'Reconciliation', icon: '🔄' },
  ];

  return (
    <nav className="bg-emerald-900 text-white shadow-lg sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Brand Name (Configurable) */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <span className="text-2xl">🍃</span>
            <div>
              <span className="text-lg font-bold tracking-tight text-emerald-100">{APP_CONFIG.name}</span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full font-mono">
                {user.estateName}
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                    active
                      ? 'bg-emerald-800 text-white shadow-inner font-semibold'
                      : 'text-emerald-100 hover:bg-emerald-800/70 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-emerald-100">{user.fullName}</div>
              <span className="inline-block text-[10px] font-medium bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded">
                {user.role}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="bg-emerald-800 hover:bg-red-700 text-emerald-100 hover:text-white px-2.5 py-1.5 rounded text-xs transition"
              title="Sign Out"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden flex overflow-x-auto px-2 py-1.5 bg-emerald-950/80 border-t border-emerald-800/50 space-x-1 text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap px-2.5 py-1.5 rounded ${
              activeTab === item.id ? 'bg-emerald-700 text-white font-medium' : 'text-emerald-300'
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};
