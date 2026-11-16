import React, { useEffect, useState } from 'react';
import { api, AuthUser } from '../../services/api';

interface FieldWeightsPageProps {
  user: AuthUser;
}

export const FieldWeightsPage: React.FC<FieldWeightsPageProps> = () => {
  const [fields, setFields] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Entry State
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('Full Day');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // MTD Summary State
  const [mtdData, setMtdData] = useState<any | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedFieldId) {
      loadMtdSummary(selectedFieldId, weightDate);
    }
  }, [selectedFieldId, weightDate]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [fData, wData] = await Promise.all([
        api.getFields().catch(() => []),
        api.getFieldWeights().catch(() => []),
      ]);
      setFields(fData);
      if (fData.length > 0 && !selectedFieldId) {
        setSelectedFieldId(fData[0].id);
      }
      setWeights(wData);
    } finally {
      setLoading(false);
    }
  };

  const loadMtdSummary = async (fieldId: string, cutoff: string) => {
    try {
      const summary = await api.getMtdSummary(fieldId, cutoff);
      setMtdData(summary);
    } catch {
      setMtdData(null);
    }
  };

  const handleRecordWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!selectedFieldId) {
      setFormError('Please select a field.');
      return;
    }

    if (!weightKg || Number(weightKg) <= 0) {
      setFormError('Green-leaf weight must be greater than zero kg.');
      return;
    }

    setSubmitting(true);
    try {
      await api.recordFieldWeight({
        fieldId: selectedFieldId,
        weightDate,
        session: session === 'Full Day' ? undefined : session,
        weightKg: Number(weightKg),
        notes: notes.trim() || undefined,
      });

      setSuccessMsg(`Successfully recorded ${Number(weightKg).toFixed(2)} kg for field!`);
      setWeightKg('');
      setNotes('');

      // Refresh list and MTD
      const updatedWeights = await api.getFieldWeights();
      setWeights(updatedWeights);
      await loadMtdSummary(selectedFieldId, weightDate);
    } catch (err: any) {
      setFormError(err.message || 'Failed to record weight.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Daily Field Green-Leaf Weight</h2>
        <p className="text-xs text-slate-500 mt-1">
          Record authoritative field-level weighbridge/intake weights and monitor automated Month-To-Date (MTD) totals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form (Left) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span>⚖️</span>
            <span>Record Field Weight Entry</span>
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

          <form onSubmit={handleRecordWeight} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Weighing Date</label>
                <input
                  type="date"
                  required
                  value={weightDate}
                  onChange={(e) => setWeightDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Collection Field Block</label>
                <select
                  value={selectedFieldId}
                  onChange={(e) => setSelectedFieldId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.code} - {f.name} ({f.areaHectares} ha)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Net Measured Green-Leaf Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 320.50"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Session / Shift</label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Full Day">Full Day Intake</option>
                  <option value="Morning">Morning Session</option>
                  <option value="Afternoon">Afternoon Session</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Weighbridge slip no, weather condition, etc."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs shadow transition disabled:opacity-50"
            >
              {submitting ? 'Saving Weight...' : 'Save Authoritative Field Weight'}
            </button>
          </form>
        </div>

        {/* Live MTD Summary Card (Right) */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-xl shadow-md p-6 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-emerald-300">
              Automated MTD Calculation
            </div>
            <h4 className="text-base font-bold mt-1 text-white">
              {selectedField ? `${selectedField.code} - ${selectedField.name}` : 'Select Field'}
            </h4>
            <p className="text-xs text-emerald-200/80 mt-1">
              MTD sum from 1st of month through {weightDate}
            </p>

            <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-xs text-emerald-200">Month-To-Date (MTD) Total:</div>
              <div className="text-3xl font-extrabold text-white mt-1">
                {mtdData ? `${mtdData.mtdWeightKg.toFixed(2)} kg` : '0.00 kg'}
              </div>
              <div className="text-[11px] text-emerald-300 mt-2">
                Entries recorded this month: <span className="font-bold">{mtdData?.totalEntries || 0}</span>
              </div>
              {selectedField && selectedField.areaHectares > 0 && mtdData && (
                <div className="text-[11px] text-emerald-300 mt-1">
                  Yield per ha: {(mtdData.mtdWeightKg / selectedField.areaHectares).toFixed(2)} kg/ha
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 text-[11px] text-emerald-200/70 border-t border-white/10 pt-4 leading-relaxed">
            Note: As per SRS requirements, MTD is computed on-the-fly from saved daily field weights to prevent redundant data drift.
          </div>
        </div>
      </div>

      {/* Historical Field Weight Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Recorded Field Weights History</h3>
          <span className="text-xs text-slate-400">{weights.length} entries recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Field</th>
                <th className="px-6 py-3.5">Session</th>
                <th className="px-6 py-3.5 text-right">Net Weight (kg)</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weights.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No field weights recorded yet.
                  </td>
                </tr>
              ) : (
                weights.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-medium text-slate-800">{w.weightDate}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-emerald-800">{w.fieldCode}</span> - {w.fieldName}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{w.session || 'Full Day'}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-slate-800">
                      {w.weightKg.toFixed(2)} kg
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-400 max-w-xs truncate">{w.notes || '-'}</td>
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
