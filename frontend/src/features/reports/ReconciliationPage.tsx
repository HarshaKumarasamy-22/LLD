import React, { useEffect, useState } from 'react';
import { api, AuthUser } from '../../services/api';

interface ReconciliationPageProps {
  user: AuthUser;
}

export const ReconciliationPage: React.FC<ReconciliationPageProps> = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReconciliation();
  }, [date]);

  const loadReconciliation = async () => {
    setLoading(true);
    try {
      const data = await api.getReconciliation(date);
      setItems(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const totalFieldWeight = items.reduce((sum, item) => sum + (item.totalFieldWeightKg || 0), 0);
  const totalPluckerIntake = items.reduce((sum, item) => sum + (item.totalPluckerIntakeKg || 0), 0);
  const netVarianceKg = totalPluckerIntake - totalFieldWeight;
  const netVariancePct = totalFieldWeight > 0 ? (netVarianceKg / totalFieldWeight) * 100 : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Daily Intake vs Field Weight Reconciliation</h2>
          <p className="text-xs text-slate-500 mt-1">
            Compare authoritative field weights against individual plucker intakes by field block and date.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Reconciliation Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Summary Variance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Field Weight</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{totalFieldWeight.toFixed(2)} kg</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Weighbridge / Authoritative</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Plucker Intake</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{totalPluckerIntake.toFixed(2)} kg</div>
          <div className="text-[11px] text-blue-600 mt-0.5">Sum of worker baskets</div>
        </div>

        <div
          className={`p-5 rounded-xl border shadow-sm ${
            Math.abs(netVarianceKg) < 0.01
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
              : netVarianceKg < 0
              ? 'bg-amber-50/60 border-amber-200 text-amber-900'
              : 'bg-blue-50/60 border-blue-200 text-blue-900'
          }`}
        >
          <div className="text-xs font-semibold uppercase">Daily Net Variance</div>
          <div className="text-2xl font-extrabold mt-1">
            {netVarianceKg > 0 ? `+${netVarianceKg.toFixed(2)}` : netVarianceKg.toFixed(2)} kg
          </div>
          <div className="text-[11px] mt-0.5 font-medium">
            {netVariancePct !== null
              ? `${netVariancePct > 0 ? `+${netVariancePct.toFixed(2)}` : netVariancePct.toFixed(2)}% variance`
              : 'N/A (no field weight)'}
          </div>
        </div>
      </div>

      {/* Reconciliation Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Field-wise Variance Breakdown for {date}</h3>
          <span className="text-xs text-slate-400">{items.length} active field blocks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-3.5">Field Code</th>
                <th className="px-6 py-3.5">Field Name</th>
                <th className="px-6 py-3.5 text-right">Field Weight (kg)</th>
                <th className="px-6 py-3.5 text-right">Plucker Intake (kg)</th>
                <th className="px-6 py-3.5 text-right">Variance (kg)</th>
                <th className="px-6 py-3.5 text-right">Variance (%)</th>
                <th className="px-6 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No field weights or plucker intakes recorded for {date}. Select another date above.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isExact = Math.abs(item.varianceKg) < 0.01;
                  const isNegative = item.varianceKg < 0;

                  return (
                    <tr key={item.fieldId} className="hover:bg-slate-50/70">
                      <td className="px-6 py-3.5 font-bold text-emerald-800">{item.fieldCode}</td>
                      <td className="px-6 py-3.5 text-slate-800 font-medium">{item.fieldName}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-slate-800">
                        {item.totalFieldWeightKg.toFixed(2)} kg
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold text-blue-800">
                        {item.totalPluckerIntakeKg.toFixed(2)} kg
                      </td>
                      <td
                        className={`px-6 py-3.5 text-right font-extrabold ${
                          isExact
                            ? 'text-slate-600'
                            : isNegative
                            ? 'text-amber-700'
                            : 'text-blue-700'
                        }`}
                      >
                        {item.varianceKg > 0 ? `+${item.varianceKg.toFixed(2)}` : item.varianceKg.toFixed(2)} kg
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-slate-600">
                        {item.variancePercentage !== null
                          ? `${item.variancePercentage > 0 ? `+${item.variancePercentage.toFixed(2)}` : item.variancePercentage.toFixed(2)}%`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                            isExact
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : Math.abs(item.variancePercentage || 0) <= 5
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-red-50 text-red-700 border border-red-200/60'
                          }`}
                        >
                          {isExact ? 'Reconciled' : isNegative ? 'Under Intake' : 'Over Intake'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
