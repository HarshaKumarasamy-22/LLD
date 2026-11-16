import React, { useEffect, useState } from 'react';
import { api, AuthUser } from '../../services/api';

interface WeedingViewProps {
  user: AuthUser;
  fields: any[];
}

export const WeedingView: React.FC<WeedingViewProps> = ({ user, fields }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Plan Form State
  const [fieldId, setFieldId] = useState('');
  const [plannedDate, setPlannedDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('Manual slash / hand weeding');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Completion Dialog State
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().split('T')[0]);
  const [responsiblePerson, setResponsiblePerson] = useState(user.fullName || '');

  const canManage = user.role === 'Administrator' || user.role === 'EstateManager' || user.role === 'FieldSupervisor';

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getWeedingActivities({ statusFilter: statusFilter || undefined });
      setActivities(data);
      if (fields.length > 0 && !fieldId) setFieldId(fields[0].id);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fieldId) {
      setFormError('Please select a field block.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createWeedingPlan({
        fieldId,
        plannedDate,
        method,
        notes: notes.trim() || undefined,
      });

      setNotes('');
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to schedule weeding.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    try {
      await api.completeWeeding(selectedActivity.id, {
        completedDate,
        responsiblePerson,
      });

      setSelectedActivity(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to mark weeding completed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Schedule Weeding Plan Form */}
      {canManage && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span>🌾</span>
            <span>Schedule Weeding Activity (FR-060)</span>
          </h3>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleCreatePlan} className="space-y-4">
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Planned Date</label>
                <input
                  type="date"
                  required
                  value={plannedDate}
                  onChange={(e) => setPlannedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Weeding Method</label>
                <input
                  type="text"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  placeholder="e.g. Mechanical brush cutter, manual slash"
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
                placeholder="Target weed species, labor gang assigned..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs shadow transition disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Schedule Weeding Activity'}
            </button>
          </form>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 text-xs">
        {['', 'Overdue', 'Planned', 'Completed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              statusFilter === st
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st === '' ? 'All Activities' : st}
          </button>
        ))}
      </div>

      {/* Weeding Activities Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Weeding Schedule & History (FR-062)</h3>
          <span className="text-xs text-slate-400">{activities.length} activities</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-3.5">Planned Date</th>
                <th className="px-6 py-3.5">Field</th>
                <th className="px-6 py-3.5">Method</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Completed Date</th>
                <th className="px-6 py-3.5">Responsible</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No weeding activities found.
                  </td>
                </tr>
              ) : (
                activities.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-medium text-slate-800">{w.plannedDate}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-emerald-800">{w.fieldCode}</span> - {w.fieldName}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{w.method || 'Standard'}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          w.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : w.status === 'Overdue'
                            ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 font-medium">{w.completedDate || '-'}</td>
                    <td className="px-6 py-3.5 text-slate-500">{w.responsiblePerson || '-'}</td>
                    <td className="px-6 py-3.5 text-right">
                      {w.status !== 'Completed' && canManage && (
                        <button
                          onClick={() => setSelectedActivity(w)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition"
                        >
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completion Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-3">
              Mark Weeding as Completed: {selectedActivity.fieldCode}
            </h3>

            <form onSubmit={handleComplete} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Actual Completion Date</label>
                <input
                  type="date"
                  required
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Supervisor / Responsible Person</label>
                <input
                  type="text"
                  required
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedActivity(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
