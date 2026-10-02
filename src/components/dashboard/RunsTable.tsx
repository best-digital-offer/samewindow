import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Run, RunStatus } from '../../types';
import { exportRunsToCsv } from '../../lib/export';

interface RunsTableProps {
  runs: Run[];
  onSelectRun: (runId: string) => void;
  onCompareRuns?: (runAId: string, runBId: string) => void;
}

export const RunsTable: React.FC<RunsTableProps> = ({ runs, onSelectRun }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RunStatus>('ALL');
  const [agentFilter, setAgentFilter] = useState('ALL');

  const agents = Array.from(new Set(runs.map((r) => r.agentName)));

  const filteredRuns = runs.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (agentFilter !== 'ALL' && r.agentName !== agentFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.agentName.toLowerCase().includes(q) ||
        r.model.toLowerCase().includes(q) ||
        (r.errorMessage && r.errorMessage.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: RunStatus) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            SUCCESS
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-rose-400">
            <XCircle className="w-3.5 h-3.5" />
            FAILED
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-amber-400">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            RUNNING
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Run ID, agent, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0e121a] border border-[#1e2533] rounded-lg text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        {/* Filter Badges / Selects */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status buttons */}
          <div className="flex items-center p-0.5 bg-[#0e121a] border border-[#1e2533] rounded-lg text-xs">
            {(['ALL', 'SUCCESS', 'FAILED', 'RUNNING'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-colors ${
                  statusFilter === s
                    ? 'bg-[#1b2230] text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Agent dropdown */}
          {agents.length > 1 && (
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#0e121a] border border-[#1e2533] rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="ALL">All Agents</option>
              {agents.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          )}

          {/* Export CSV */}
          <button
            onClick={() => exportRunsToCsv(filteredRuns)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-[#0e121a] border border-[#1e2533] rounded-lg hover:border-[#2a3447] transition-colors"
            title="Export filtered runs to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-[#1b2230] bg-[#0c0f16] overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#090b0e] border-b border-[#1b2230] text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4">Run ID</th>
              <th className="py-2.5 px-4">Agent</th>
              <th className="py-2.5 px-4">Started</th>
              <th className="py-2.5 px-4 text-right">Duration</th>
              <th className="py-2.5 px-4 text-right">Tokens</th>
              <th className="py-2.5 px-4 text-right">Cost</th>
              <th className="py-2.5 px-4">Model</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#161c28]">
            {filteredRuns.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  No matching agent runs found.
                </td>
              </tr>
            ) : (
              filteredRuns.map((run) => (
                <tr
                  key={run.id}
                  onClick={() => onSelectRun(run.id)}
                  className="hover:bg-[#111622] cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(run.status)}
                      {run.isDemo && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950/40 text-amber-400 border border-amber-800/30">
                          DEMO
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-indigo-300 whitespace-nowrap">
                    {run.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                    {run.agentName}
                  </td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                    {new Date(run.startedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                    {(run.durationMs / 1000).toFixed(2)}s
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300 whitespace-nowrap">
                    {run.totalTokens.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300 whitespace-nowrap">
                    ${run.estimatedCost.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px] truncate max-w-[130px]">
                    {run.model}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-indigo-400 font-medium">
                      Inspect
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
