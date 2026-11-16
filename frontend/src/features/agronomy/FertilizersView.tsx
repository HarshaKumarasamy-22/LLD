import React, { useEffect, useState } from 'react';
import { api, AuthUser } from '../../services/api';

interface FertilizersViewProps {
  user: AuthUser;
  fields: any[];
}

export const FertilizersView: React.FC<FertilizersViewProps> = ({ user, fields }) => {
  const [types, setTypes] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [fieldId, setFieldId] = useState('');
  const [fertilizerTypeId, setFertilizerTypeId] = useState('');
  const [applicationDate, setApplicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantityKg, setQuantityKg] = useState<number | ''>('');
  const [method, setMethod] = useState('Manual broadcasting');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canApply = user.role === 'Administrator' || user.role === 'EstateManager' || user.role === 'FieldSupervisor';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, aData] = await Promise.all([
        api.getFertilizerTypes().catch(() => []),
        api.getFertilizerApplications().catch(() => []),
      ]);
      setTypes(tData);
      if (tData.length > 0 && !fertilizerTypeId) setFertilizerTypeId(tData[0].id);
      if (fields.length > 0 && !fieldId) setFieldId(fields[0].id);
      setApplications(aData);
    } finally {
      setLoading(false);
    }
  };

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!fieldId || !fertilizerTypeId) {
      setFormError('Please select both a field and a fertilizer type.');
      return;
    }

    if (!quantityKg || Number(quantityKg) <= 0) {
      setFormError('Quantity must be greater than zero kg.');
      return;
    }

    setSubmitting(true);
    try {
      await api.recordFertilizerApplication({
        fieldId,
        fertilizerTypeId,
        applicationDate,
        quantityKg: Number(quantityKg),
        method,
        notes: notes.trim() || undefined,
      });

      setSuccessMsg(`Recorded ${Number(quantityKg).toFixed(1)} kg fertilizer application!`);
      setQuantityKg('');
      setNotes('');

      const updated = await api.getFertilizerApplications();
      setApplications(updated);
    } catch (err: any) {
      setFormError(err.message || 'Failed to record fertilizer application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {canApply && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span>🌿</span>
            <span>Record Fertilizer Application (FR-041)</span>
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

          <form onSubmit={handleRecord} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Application Date</label>
                <input
                  type="date"
                  required
                  value={applicationDate}
                  onChange={(e) => setApplicationDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Field Block</label>
                <select
                  value={fieldId}
                  onChange={(e) => setFieldId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.code} - {f.name} ({f.areaHectares} ha)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fertilizer Type</label>
                <select
                  value={fertilizerTypeId}
                  onChange={(e) => setFertilizerTypeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity Applied (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 50.0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Application Method</label>
                <input
                  type="text"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  placeholder="e.g. Foliar spray, soil placement, broadcasting"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Weather, dosage note, contractor details..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs shadow transition disabled:opacity-50"
            >
              {submitting ? 'Recording Application...' : 'Save Fertilizer Application'}
            </button>
          </form>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Fertilizer Application History</h3>
          <span className="text-xs text-slate-400">{applications.length} applications logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Field</th>
                <th className="px-6 py-3.5">Fertilizer Type</th>
                <th className="px-6 py-3.5 text-right">Quantity (kg)</th>
                <th className="px-6 py-3.5">Method</th>
                <th className="px-6 py-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No fertilizer applications logged yet.
                  </td>
                </tr>
              ) : (
                applications.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-medium text-slate-800">{a.applicationDate}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-emerald-800">{a.fieldCode}</span> - {a.fieldName}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700">{a.fertilizerTypeName}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-slate-800">
                      {a.quantityKg.toFixed(1)} kg
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{a.method || 'Standard'}</td>
                    <td className="px-6 py-3.5 text-slate-400 max-w-xs truncate">{a.notes || '-'}</td>
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
