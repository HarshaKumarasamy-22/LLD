import React, { useEffect, useState } from 'react';
import { api, AuthUser } from '../../services/api';

interface DashboardProps {
  user: AuthUser;
  setActiveTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ user, setActiveTab }) => {
  const [fields, setFields] = useState<any[]>([]);
  const [pluckers, setPluckers] = useState<any[]>([]);
  const [recentWeights, setRecentWeights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [fData, pData, wData] = await Promise.all([
        api.getFields().catch(() => []),
        api.getPluckers().catch(() => []),
        api.getFieldWeights().catch(() => []),
      ]);
      setFields(fData);
      setPluckers(pData);
      setRecentWeights(wData.slice(0, 5));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const totalArea = fields.reduce((sum, f) => sum + (f.areaHectares || 0), 0);
  const totalWeightRecorded = recentWeights.reduce((sum, w) => sum + (w.weightKg || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold tracking-tight">Welcome, {user.fullName}!</h2>
        <p className="text-emerald-100 text-xs mt-1">
          Role: <span className="font-semibold underline">{user.role}</span> &bull; Estate: {user.estateName}
        </p>
        <p className="text-emerald-200 text-xs mt-3 max-w-xl leading-relaxed">
          Operational overview for green leaf plucking, field weight reconciliation, and agronomy activities.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Active Fields</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{fields.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Total {totalArea.toFixed(1)} ha</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl">
            🗺️
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Active Pluckers</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{pluckers.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Registered workforce</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl">
            👥
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Recent Intake</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{totalWeightRecorded.toFixed(1)} kg</div>
            <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">Authoritative field weights</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl">
            ⚖️
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">System Status</div>
            <div className="text-lg font-bold text-emerald-600 mt-1">Operational</div>
            <div className="text-[11px] text-slate-400 mt-0.5">UTC / Colombo Timezone</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-xl">
            ✅
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('field-weights')}
          className="p-4 bg-white hover:bg-emerald-50/50 border border-slate-200 rounded-xl text-left transition shadow-sm group"
        >
          <div className="text-emerald-700 text-lg mb-1 group-hover:scale-105 transition-transform">⚖️</div>
          <div className="font-semibold text-slate-800 text-sm">Record Daily Field Weight</div>
          <div className="text-xs text-slate-500 mt-0.5">Enter authoritative green leaf field batch weights</div>
        </button>

        <button
          onClick={() => setActiveTab('intakes')}
          className="p-4 bg-white hover:bg-emerald-50/50 border border-slate-200 rounded-xl text-left transition shadow-sm group"
        >
          <div className="text-blue-700 text-lg mb-1 group-hover:scale-105 transition-transform">🧺</div>
          <div className="font-semibold text-slate-800 text-sm">Record Plucker Intake</div>
          <div className="text-xs text-slate-500 mt-0.5">Log individual plucker basket net weights</div>
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className="p-4 bg-white hover:bg-emerald-50/50 border border-slate-200 rounded-xl text-left transition shadow-sm group"
        >
          <div className="text-amber-700 text-lg mb-1 group-hover:scale-105 transition-transform">🔄</div>
          <div className="font-semibold text-slate-800 text-sm">View Daily Reconciliation</div>
          <div className="text-xs text-slate-500 mt-0.5">Compare field weight vs plucker sum variance</div>
        </button>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Recent Daily Field Weights</h3>
          <button
            onClick={() => setActiveTab('field-weights')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            View all &rarr;
          </button>
        </div>

        {recentWeights.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No daily field weight records yet. Click &quot;Record Daily Field Weight&quot; to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Field</th>
                  <th className="px-6 py-3">Session</th>
                  <th className="px-6 py-3 text-right">Net Weight (kg)</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentWeights.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3 text-slate-800 font-medium">{w.weightDate}</td>
                    <td className="px-6 py-3 text-slate-600">
                      <span className="font-semibold text-emerald-800">{w.fieldCode}</span> - {w.fieldName}
                    </td>
                    <td className="px-6 py-3 text-slate-500">{w.session || 'Full Day'}</td>
                    <td className="px-6 py-3 text-right font-bold text-slate-800">
                      {w.weightKg.toFixed(2)} kg
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
