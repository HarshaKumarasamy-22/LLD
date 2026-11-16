import React, { useEffect, useState } from 'react';
import { api, AuthUser } from '../../services/api';

interface PluckersPageProps {
  user: AuthUser;
}

export const PluckersPage: React.FC<PluckersPageProps> = ({ user }) => {
  const [pluckers, setPluckers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [employeeCode, setEmployeeCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canRegister = user.role === 'Administrator' || user.role === 'EstateManager' || user.role === 'FieldSupervisor';

  useEffect(() => {
    loadPluckers();
  }, []);

  const loadPluckers = async () => {
    setLoading(true);
    try {
      const data = await api.getPluckers();
      setPluckers(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPlucker = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!employeeCode.trim() || !fullName.trim()) {
      setFormError('Employee code and full name are required.');
      return;
    }

    setSaving(true);
    try {
      await api.createPlucker({
        employeeCode: employeeCode.trim(),
        fullName: fullName.trim(),
      });

      setShowAddModal(false);
      setEmployeeCode('');
      setFullName('');
      await loadPluckers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to register plucker.');
    } finally {
      setSaving(false);
    }
  };

  const filteredPluckers = pluckers.filter(
    (p) =>
      p.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Plucker Registry</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain authorized plucker workforce, employee identification codes, and assignments.
          </p>
        </div>

        {canRegister && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs shadow transition flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Register New Plucker</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by plucker code (e.g. PLK-101) or full name..."
          className="w-full max-w-sm px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
        <div className="text-xs text-slate-400">
          Showing {filteredPluckers.length} of {pluckers.length} pluckers
        </div>
      </div>

      {/* Pluckers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-3.5">Plucker Code</th>
                <th className="px-6 py-3.5">Full Name</th>
                <th className="px-6 py-3.5">Division</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPluckers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    No pluckers registered yet.
                  </td>
                </tr>
              ) : (
                filteredPluckers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-bold text-blue-800">{p.employeeCode}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">{p.fullName}</td>
                    <td className="px-6 py-3.5 text-slate-500">{p.divisionName || 'Estate Wide'}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          p.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {p.isActive ? 'Active Worker' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Plucker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Register New Plucker</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleRegisterPlucker} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Employee / Plucker Code
                </label>
                <input
                  type="text"
                  required
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  placeholder="e.g. PLK-104"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Selvam Subramaniam"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium disabled:opacity-50"
                >
                  {saving ? 'Registering...' : 'Save Plucker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
