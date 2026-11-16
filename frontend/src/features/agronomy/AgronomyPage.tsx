import React, { useEffect, useState } from 'react';
import { api, AuthUser } from '../../services/api';
import { FertilizersView } from './FertilizersView';
import { SoilPHView } from './SoilPHView';
import { WeedingView } from './WeedingView';
import { PruningView } from './PruningView';

interface AgronomyPageProps {
  user: AuthUser;
}

export const AgronomyPage: React.FC<AgronomyPageProps> = ({ user }) => {
  const [subTab, setSubTab] = useState<'fertilizers' | 'soil-ph' | 'weeding' | 'pruning'>('fertilizers');
  const [fields, setFields] = useState<any[]>([]);

  useEffect(() => {
    api.getFields().then(setFields).catch(() => []);
  }, []);

  const tabs = [
    { id: 'fertilizers', label: 'Fertilizer Applications', icon: '🌿' },
    { id: 'soil-ph', label: 'Soil pH Monitoring', icon: '🧪' },
    { id: 'weeding', label: 'Weeding Management', icon: '🌾' },
    { id: 'pruning', label: 'Pruning Cycles', icon: '✂️' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Agronomy & Field Maintenance</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track soil health, fertilizer dosage, weeding tasks, and bush pruning interventions.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
                subTab === tab.id
                  ? 'bg-white text-emerald-800 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {subTab === 'fertilizers' && <FertilizersView user={user} fields={fields} />}
      {subTab === 'soil-ph' && <SoilPHView user={user} fields={fields} />}
      {subTab === 'weeding' && <WeedingView user={user} fields={fields} />}
      {subTab === 'pruning' && <PruningView user={user} fields={fields} />}
    </div>
  );
};
