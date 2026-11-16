import React from 'react';
import { APP_CONFIG } from './config/appConfig';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-md p-8 border border-slate-100 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mb-4 text-2xl font-bold">
          🌱
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          {APP_CONFIG.name}
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          {APP_CONFIG.tagline}
        </p>

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-2 text-left text-sm text-slate-600">
          <div className="flex justify-between py-1">
            <span className="font-medium text-slate-500">Frontend Stack:</span>
            <span className="text-slate-800">React + TypeScript + Vite + Tailwind</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-medium text-slate-500">Backend Stack:</span>
            <span className="text-slate-800">ASP.NET Core Web API (.NET 11)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-medium text-slate-500">Database:</span>
            <span className="text-slate-800">PostgreSQL 16 (via Docker Compose)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-medium text-slate-500">Branding:</span>
            <span className="text-emerald-600 font-medium">Configurable at deployment</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg text-xs">
            Repository Skeleton Initialized on branch: main
          </div>
        </div>
      </div>
    </div>
  );
}
