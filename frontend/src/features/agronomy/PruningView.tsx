import React, { useEffect, useState } from 'react';
import { api, AuthUser } from '../../services/api';

interface PruningViewProps {
  user: AuthUser;
  fields: any[];
}

export const PruningView: React.FC<PruningViewProps> = ({ user, fields }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [fieldId, setFieldId] = useState('');
  const [pruningDate, setPruningDate] = useState(new Date().toISOString().split('T')[0]);
  const [pruningType, setPruningType] = useState('Clean Prune (Hard)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canRecord = user.role === 'Administrator' || user.role === 'EstateManager' || user.role === 'FieldSupervisor';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rData, sData] = await Promise.all([
        api.getPruningRecords().catch(() => []),
        api.getLastPruningByField().catch(() => []),
      ]);
      setRecords(rData);
      setSummaries(sData);
      if (fields.length > 0 && !fieldId) setFieldId(fields[0].id);
    } finally {
      setLoading(false);
    }
  };

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!fieldId) {
      setFormError('Please select a field block.');
      return;
    }

    setSubmitting(true);
    try {
      await api.recordPruning({
        fieldId,
        pruningDate,
        pruningType,
        notes: notes.trim() || undefined,
      });

      setSuccessMsg('Recorded pruning cycle entry successfully!');
      setNotes('');
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to record pruning.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Latest Pruning by Field Summary (FR-071) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
          <span>✂️</span>
          <span>Last Pruning Dates by Field Block (FR-071)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tracks the vegetative bush cycle and last recorded pruning interventions across active blocks.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {summaries.map((s) => (
            <div key={s.fieldId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="font-bold text-xs text-slate-800">{s.fieldCode} - {s.fieldName}</div>
              <div className="text-sm font-black text-emerald-800 mt-2">
                {s.lastPruningDate ? `Last Pruned: ${s.lastPruningDate}` : 'No Pruning on Record'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Type: {s.lastPruningType || 'N/A'} &bull; Cycles: {s.totalPruningCount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Pruning Entry Form */}
      {canRecord && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span>🌿</span>
            <span>Record Field Pruning Cycle (FR-070)</span>
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Field Block</label>
                <select
                  value={fieldId}
                  onChange={(e) => setFieldId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.code} - {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pruning Date</label>
                <input
                  type="date"
                  required
                  value={pruningDate}
                  onChange={(e) => setPruningDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pruning Type</label>
                <select
                  value={pruningType}
                  onChange={(e) => setPruningType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Clean Prune (Hard)">Clean Prune (Hard)</option>
                  <option value="Cut Across">Cut Across</option>
                  <option value="Skiffing">Skiffing / Light Prune</option>
                  <option value="Deep Skiff">Deep Skiff</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Height cut (inches), tipping schedule, resting period..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs shadow transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Pruning Record'}
            </button>
          </form>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Pruning Operations History</h3>
          <span className="text-xs text-slate-400">{records.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-3.5">Pruning Date</th>
                <th className="px-6 py-3.5">Field</th>
                <th className="px-6 py-3.5">Pruning Type</th>
                <th className="px-6 py-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    No pruning records found.
                  </td>
                </tr>
              ) : (
                records.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-medium text-slate-800">{p.pruningDate}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-emerald-800">{p.fieldCode}</span> - {p.fieldName}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700">{p.pruningType}</td>
                    <td className="px-6 py-3.5 text-slate-400 max-w-xs truncate">{p.notes || '-'}</td>
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
