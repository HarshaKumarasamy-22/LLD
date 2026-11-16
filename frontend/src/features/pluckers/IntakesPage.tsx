import React, { useEffect, useState } from 'react';
import { api, AuthUser } from '../../services/api';

interface IntakesPageProps {
  user: AuthUser;
}

export const IntakesPage: React.FC<IntakesPageProps> = () => {
  const [fields, setFields] = useState<any[]>([]);
  const [pluckers, setPluckers] = useState<any[]>([]);
  const [intakes, setIntakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [selectedPluckerId, setSelectedPluckerId] = useState('');
  const [intakeDate, setIntakeDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('Morning');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fData, pData, iData] = await Promise.all([
        api.getFields().catch(() => []),
        api.getPluckers().catch(() => []),
        api.getPluckerIntakes().catch(() => []),
      ]);
      setFields(fData);
      setPluckers(pData);
      if (fData.length > 0 && !selectedFieldId) setSelectedFieldId(fData[0].id);
      if (pData.length > 0 && !selectedPluckerId) setSelectedPluckerId(pData[0].id);
      setIntakes(iData);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!selectedFieldId || !selectedPluckerId) {
      setFormError('Please select both a field and a plucker.');
      return;
    }

    if (!weightKg || Number(weightKg) <= 0) {
      setFormError('Intake leaf weight must be greater than zero kg.');
      return;
    }

    setSubmitting(true);
    try {
      await api.recordPluckerIntake({
        fieldId: selectedFieldId,
        pluckerId: selectedPluckerId,
        intakeDate,
        session: session === 'Full Day' ? undefined : session,
        weightKg: Number(weightKg),
        notes: notes.trim() || undefined,
      });

      setSuccessMsg(`Recorded ${Number(weightKg).toFixed(2)} kg plucker intake!`);
      setWeightKg('');
      setNotes('');

      const updated = await api.getPluckerIntakes();
      setIntakes(updated);
    } catch (err: any) {
      setFormError(err.message || 'Failed to record intake.');
    } finally {
      setSubmitting(false);
    }
  };

  const todayIntakes = intakes.filter((i) => i.intakeDate === intakeDate);
  const todayTotalKg = todayIntakes.reduce((sum, i) => sum + (i.weightKg || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Individual Plucker Intake</h2>
        <p className="text-xs text-slate-500 mt-1">
          Record individual leaf basket weighings per plucker employee. Stored independently from field batch totals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form (Left) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span>🧺</span>
            <span>Record Plucker Basket Weighing</span>
          </h3>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              ⚠️ {formError}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={handleRecordIntake} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={intakeDate}
                  onChange={(e) => setIntakeDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Field</label>
                <select
                  value={selectedFieldId}
                  onChange={(e) => setSelectedFieldId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.code} - {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Plucker</label>
                <select
                  value={selectedPluckerId}
                  onChange={(e) => setSelectedPluckerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {pluckers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.employeeCode} - {p.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Shift / Session</label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Morning">Morning Weighing</option>
                  <option value="Afternoon">Afternoon Weighing</option>
                  <option value="Full Day">Full Day</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Net Plucked Leaf Weight (kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 26.50"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Basket deduction, leaf condition, etc."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs shadow transition disabled:opacity-50"
            >
              {submitting ? 'Recording Intake...' : 'Save Plucker Intake'}
            </button>
          </form>
        </div>

        {/* Daily Plucker Summary (Right) */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-xl shadow-md p-6 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-blue-300">
              Daily Plucking Summary
            </div>
            <h4 className="text-base font-bold mt-1 text-white">Date: {intakeDate}</h4>

            <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-xs text-blue-200">Total Plucker Intake Today:</div>
              <div className="text-3xl font-extrabold text-white mt-1">
                {todayTotalKg.toFixed(2)} kg
              </div>
              <div className="text-[11px] text-blue-300 mt-2">
                Active weighings recorded: <span className="font-bold">{todayIntakes.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-[11px] text-blue-200/70 border-t border-white/10 pt-4 leading-relaxed">
            Note: Plucker intake is tracked per worker for productivity review and daily variance reconciliation against field weights.
          </div>
        </div>
      </div>

      {/* Plucker Intake History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Plucker Intake History</h3>
          <span className="text-xs text-slate-400">{intakes.length} total weighings</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Plucker Code</th>
                <th className="px-6 py-3.5">Worker Name</th>
                <th className="px-6 py-3.5">Field</th>
                <th className="px-6 py-3.5">Session</th>
                <th className="px-6 py-3.5 text-right">Net Weight (kg)</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {intakes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No plucker intakes recorded yet.
                  </td>
                </tr>
              ) : (
                intakes.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-medium text-slate-800">{i.intakeDate}</td>
                    <td className="px-6 py-3.5 font-bold text-blue-800">{i.pluckerCode}</td>
                    <td className="px-6 py-3.5 text-slate-800 font-medium">{i.pluckerName}</td>
                    <td className="px-6 py-3.5 text-slate-600">{i.fieldCode}</td>
                    <td className="px-6 py-3.5 text-slate-500">{i.session || 'Morning'}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-slate-800">
                      {i.weightKg.toFixed(2)} kg
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
