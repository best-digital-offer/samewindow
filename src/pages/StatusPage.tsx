import React from 'react';
import { CheckCircle2, ShieldAlert, Activity } from 'lucide-react';
import { SYSTEM_STATUSES } from '../lib/constants';

export const StatusPage: React.FC = () => {
  return (
    <div className="py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-2">
        <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
          System Infrastructure
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          SameWindow Systems Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Real-time health telemetry across global trace ingestion nodes and AI analysis pipelines.
        </p>
      </div>

      {/* Global Status Banner */}
      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">All Systems Operational</span>
        </div>
        <span className="font-mono text-[11px] text-emerald-400">99.98% 30-Day Availability</span>
      </div>

      {/* Services Table */}
      <div className="rounded-xl border border-[#1b2230] bg-[#0c0f16] overflow-hidden">
        <div className="p-4 bg-[#090b0e] border-b border-[#1b2230] flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
          <span>Service Component</span>
          <span>Latency · Status</span>
        </div>

        <div className="divide-y divide-[#151b26] text-xs">
          {SYSTEM_STATUSES.map((s) => (
            <div key={s.name} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium text-slate-200">{s.name}</span>
              </div>

              <div className="flex items-center gap-4 font-mono text-[11px]">
                <span className="text-slate-400 hidden sm:inline">{s.latency}</span>
                <span className="text-emerald-400 font-semibold">{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#080b10] border border-[#1b2230] text-xs text-slate-400 flex items-center justify-between">
        <span>Incident response SLA: &lt; 15 minutes for enterprise tier</span>
        <span className="font-mono text-[11px]">Last checked: Just now</span>
      </div>
    </div>
  );
};
