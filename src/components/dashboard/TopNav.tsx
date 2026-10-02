import React, { useState } from 'react';
import { Play, ChevronRight, RefreshCw, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { Project } from '../../types';
import { SimulatorScenario } from '../../lib/simulator';

interface TopNavProps {
  breadcrumbs: { label: string; route?: string }[];
  onNavigate: (route: string) => void;
  activeProject?: Project;
  showDemoRuns: boolean;
  onToggleDemoRuns: () => void;
  onSimulateRun: (scenario?: SimulatorScenario) => void;
  isSimulating?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  breadcrumbs,
  onNavigate,
  activeProject,
  showDemoRuns,
  onToggleDemoRuns,
  onSimulateRun,
  isSimulating = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-14 border-b border-[#171d28] bg-[#090b0e]/95 backdrop-blur-md px-6 flex items-center justify-between z-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        {breadcrumbs.map((b, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            {b.route ? (
              <button
                onClick={() => onNavigate(b.route!)}
                className="hover:text-slate-200 transition-colors"
              >
                {b.label}
              </button>
            ) : (
              <span className="text-slate-200 font-medium">{b.label}</span>
            )}
          </React.Fragment>
        ))}
        {activeProject && (
          <span className="ml-2 text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
            {activeProject.environment}
          </span>
        )}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Toggle Sample Demo Data */}
        <button
          onClick={onToggleDemoRuns}
          title={showDemoRuns ? 'Hide sample demo traces' : 'Show sample demo traces'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            showDemoRuns
              ? 'bg-[#151c27] text-indigo-300 border-indigo-500/30 hover:border-indigo-400/50'
              : 'bg-[#10141d] text-slate-400 border-[#202736] hover:text-slate-300'
          }`}
        >
          {showDemoRuns ? <Eye className="w-3.5 h-3.5 text-indigo-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{showDemoRuns ? 'Sample Traces: ON' : 'Sample Traces: OFF'}</span>
        </button>

        {/* Simulate Live Agent Run Split/Dropdown Button */}
        <div className="relative">
          <div className="flex items-center rounded-md bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs">
            <button
              onClick={() => onSimulateRun('finance_401')}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {isSimulating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isSimulating ? 'Recording Trace...' : 'Simulate Run'}</span>
            </button>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={isSimulating}
              className="p-1.5 border-l border-indigo-700/60 text-indigo-200 hover:text-white"
              title="Select Simulation Scenario"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 top-10 w-64 rounded-xl bg-[#111622] border border-[#242c3c] shadow-2xl py-1.5 text-xs z-50">
              <div className="px-3 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Simulate Scenario
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onSimulateRun('finance_401');
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#182030] text-rose-300 flex flex-col"
              >
                <span className="font-semibold">401 Auth Failure (Refund Agent)</span>
                <span className="text-[10px] text-slate-400">Tests retry loop & AI Failure Analysis</span>
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onSimulateRun('sql_syntax');
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#182030] text-amber-300 flex flex-col"
              >
                <span className="font-semibold">SQL Grouping Failure (Analytics)</span>
                <span className="text-[10px] text-slate-400">Tests query exception & divergence</span>
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onSimulateRun('nominal_success');
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#182030] text-emerald-300 flex flex-col"
              >
                <span className="font-semibold">Nominal 200 OK (Voucher Agent)</span>
                <span className="text-[10px] text-slate-400">Tests successful multi-tool flow</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
