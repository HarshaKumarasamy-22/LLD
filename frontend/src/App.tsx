import { useState, useEffect } from 'react';
import { AuthUser, getStoredUser, clearAuthSession } from './services/api';
import { LoginPage } from './features/auth/LoginPage';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { FieldsPage } from './features/fields/FieldsPage';
import { PluckersPage } from './features/pluckers/PluckersPage';
import { FieldWeightsPage } from './features/field-weights/FieldWeightsPage';
import { IntakesPage } from './features/pluckers/IntakesPage';
import { ReconciliationPage } from './features/reports/ReconciliationPage';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [initChecked, setInitChecked] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }
    setInitChecked(true);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!initChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xs">
        Loading Estate Portal...
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && <DashboardPage user={user} setActiveTab={setActiveTab} />}
        {activeTab === 'fields' && <FieldsPage user={user} />}
        {activeTab === 'pluckers' && <PluckersPage user={user} />}
        {activeTab === 'field-weights' && <FieldWeightsPage user={user} />}
        {activeTab === 'intakes' && <IntakesPage user={user} />}
        {activeTab === 'reconciliation' && <ReconciliationPage user={user} />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-3 text-center text-[11px] text-slate-400">
        Smart Tea Estate Management System &bull; Version 1.0 &bull; Licensed for Estate Operations
      </footer>
    </div>
  );
}
