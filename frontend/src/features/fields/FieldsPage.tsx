import React, { useEffect, useState } from 'react';
import { api, AuthUser } from '../../services/api';

interface FieldsPageProps {
  user: AuthUser;
}

export const FieldsPage: React.FC<FieldsPageProps> = ({ user }) => {
  const [fields, setFields] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [areaHectares, setAreaHectares] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canEdit = user.role === 'Administrator' || user.role === 'EstateManager';

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    setLoading(true);
    try {
      const data = await api.getFields();
      setFields(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!code.trim() || !name.trim()) {
      setFormError('Field code and name are required.');
      return;
    }

    if (!areaHectares || Number(areaHectares) <= 0) {
      setFormError('Area must be a positive number greater than 0 ha.');
      return;
    }

    setSaving(true);
    try {
      await api.createField({
        code: code.trim(),
        name: name.trim(),
        areaHectares: Number(areaHectares),
        notes: notes.trim() || undefined,
      });

      setShowAddModal(false);
      setCode('');
      setName('');
      setAreaHectares('');
      setNotes('');
      await loadFields();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create field.');
    } finally {
      setSaving(false);
    }
  };

  const filteredFields = fields.filter(
    (f) =>
      f.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Field Registry</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain estate divisions, field blocks, and official productive areas (ha).
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs shadow transition flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Add New Field</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by code (e.g. FLD-01) or field name..."
          className="w-full max-w-sm px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
        <div className="text-xs text-slate-400">
          Showing {filteredFields.length} of {fields.length} fields
        </div>
      </div>

      {/* Fields Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Field Name</th>
                <th className="px-6 py-3.5">Division</th>
                <th className="px-6 py-3.5 text-right">Area (ha)</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFields.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No fields found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredFields.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-bold text-emerald-800">{f.code}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-800">{f.name}</td>
                    <td className="px-6 py-3.5 text-slate-500">{f.divisionName || 'Main Division'}</td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-700">
                      {f.areaHectares.toFixed(2)} ha
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          f.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {f.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-400 max-w-xs truncate">{f.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Field Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Add New Field Block</h3>
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

            <form onSubmit={handleCreateField} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Field Code (Unique within estate)
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. FLD-04"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Field Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. High Cliff Clonal"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Area in Hectares (ha)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={areaHectares}
                  onChange={(e) => setAreaHectares(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 4.25"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Topography, clone type, elevation..."
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
                  {saving ? 'Saving...' : 'Save Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
