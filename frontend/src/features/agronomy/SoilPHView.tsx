import React, { useEffect, useState } from 'react';
import { api, AuthUser } from '../../services/api';

interface SoilPHViewProps {
  user: AuthUser;
  fields: any[];
}

export const SoilPHView: React.FC<SoilPHViewProps> = ({ user, fields }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [latestList, setLatestList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [fieldId, setFieldId] = useState('');
  const [testedDate, setTestedDate] = useState(new Date().toISOString().split('T')[0]);
  const [phValue, setPhValue] = useState<number | ''>('');
  const [sampleRef, setSampleRef] = useState('');
  const [testerName, setTesterName] = useState(user.fullName || '');
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
      const [rData, lData] = await Promise.all([
        api.getSoilPHRecords().catch(() => []),
        api.getLatestSoilPHByField().catch(() => []),
      ]);
      setRecords(rData);
      setLatestList(lData);
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

    if (phValue === '' || Number(phValue) < 0 || Number(phValue) > 14) {
      setFormError('Measured soil pH must be between 0.00 and 14.00 inclusive.');
      return;
    }

    setSubmitting(true);
    try {
      const val = Number(phValue);
      await api.recordSoilPH({
        fieldId,
        testedDate,
        phValue: val,
        sampleRef: sampleRef.trim() || undefined,
        testerName: testerName.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setSuccessMsg(`Recorded pH ${val.toFixed(2)} reading for field!`);
      setPhValue('');
      setSampleRef('');
      setNotes('');

      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to record soil pH.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Latest Soil pH per Field Cards */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
          <span>🧪</span>
          <span>Latest Soil pH by Field Block (FR-051 & FR-052)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tea Agronomy advisory optimal target: <span className="font-bold text-emerald-700">4.50 - 5.50 pH</span>. Readings outside limits are flagged.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {latestList.map((item) => {
            const hasData = item.latestPHValue !== null && item.latestPHValue !== undefined;
            const isOpt = item.isOptimal;

            return (
              <div
                key={item.fieldId}
                className={`p-4 rounded-xl border transition ${
                  !hasData
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : isOpt
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/80 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs">{item.fieldCode} - {item.fieldName}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      !hasData
                        ? 'bg-slate-200 text-slate-600'
                        : isOpt
                        ? 'bg-emerald-200/80 text-emerald-800'
                        : 'bg-amber-200/80 text-amber-900'
                    }`}
                  >
                    {!hasData ? 'No Reading' : isOpt ? 'Optimal' : 'Advisory Alert'}
                  </span>
                </div>
                <div className="text-2xl font-black mt-2">
                  {hasData ? `${item.latestPHValue.toFixed(2)} pH` : 'N/A'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Tested: {item.latestTestedDate || 'Never'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Record New pH Reading */}
      {canRecord && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span>🔬</span>
            <span>Record Field Soil pH Reading (FR-050)</span>
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Testing Date</label>
                <input
                  type="date"
                  required
                  value={testedDate}
                  onChange={(e) => setTestedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Field Block</label>
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Measured pH Value (0.00 - 14.00)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="14.0"
                  required
                  value={phValue}
                  onChange={(e) => setPhValue(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 5.15"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sample Reference #</label>
                <input
                  type="text"
                  value={sampleRef}
                  onChange={(e) => setSampleRef(e.target.value)}
                  placeholder="e.g. LAB-2026-N12"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tested By / Lab Technician</label>
                <input
                  type="text"
                  value={testerName}
                  onChange={(e) => setTesterName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs shadow transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Soil pH Reading'}
            </button>
          </form>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Soil pH Testing History</h3>
          <span className="text-xs text-slate-400">{records.length} readings on record</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-3.5">Tested Date</th>
                <th className="px-6 py-3.5">Field</th>
                <th className="px-6 py-3.5 text-right">Measured pH</th>
                <th className="px-6 py-3.5 text-center">Advisory Status</th>
                <th className="px-6 py-3.5">Sample Ref</th>
                <th className="px-6 py-3.5">Tester</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No soil pH records tested yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-medium text-slate-800">{r.testedDate}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-emerald-800">{r.fieldCode}</span> - {r.fieldName}
                    </td>
                    <td className="px-6 py-3.5 text-right font-black text-slate-800 text-sm">
                      {r.phValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                          r.isOptimal
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-300'
                        }`}
                      >
                        {r.isOptimal ? 'Optimal Range' : 'Out of Advisory Range'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 font-mono text-[11px]">{r.sampleRef || '-'}</td>
                    <td className="px-6 py-3.5 text-slate-500">{r.testerName || '-'}</td>
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
