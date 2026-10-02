import React from 'react';
import { Bot, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Run } from '../../types';

interface AgentsPageProps {
  runs: Run[];
  onSelectAgent: (agentName: string) => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({ runs, onSelectAgent }) => {
  const distinctAgentNames = Array.from(new Set(runs.map((r) => r.agentName)));

  const agentStats = distinctAgentNames.map((name) => {
    const agentRuns = runs.filter((r) => r.agentName === name);
    const successCount = agentRuns.filter((r) => r.status === 'SUCCESS').length;
    const failedCount = agentRuns.filter((r) => r.status === 'FAILED').length;
    const rate = agentRuns.length > 0 ? ((successCount / agentRuns.length) * 100).toFixed(1) : '100.0';
    const avgDuration =
      agentRuns.length > 0
        ? (agentRuns.reduce((acc, r) => acc + r.durationMs, 0) / agentRuns.length / 1000).toFixed(2)
        : '0.00';
    const totalTokens = agentRuns.reduce((acc, r) => acc + r.totalTokens, 0);

    return {
      name,
      total: agentRuns.length,
      successCount,
      failedCount,
      rate,
      avgDuration,
      totalTokens,
      lastModel: agentRuns[0]?.model || 'default',
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto text-xs text-slate-300">
      <div className="pb-4 border-b border-[#1b2230]">
        <h1 className="text-xl font-bold text-white tracking-tight">Active Agent Directory</h1>
        <p className="text-slate-400 mt-0.5">
          Per-agent execution frequency, health reliability, and token consumption.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentStats.map((agent) => (
          <div
            key={agent.name}
            className="p-5 rounded-xl bg-[#0c0f16] border border-[#1b2230] hover:border-[#283244] transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm text-white">{agent.name}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#171d28] font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block">Total Runs</span>
                  <span className="text-white font-bold">{agent.total}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Success Rate</span>
                  <span className={`font-bold ${Number(agent.rate) >= 90 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {agent.rate}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Avg Duration</span>
                  <span className="text-slate-200">{agent.avgDuration}s</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tokens Spent</span>
                  <span className="text-slate-200">{agent.totalTokens.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectAgent(agent.name)}
              className="w-full py-2 px-3 rounded-lg bg-[#141a24] hover:bg-[#1a2230] text-slate-200 hover:text-white border border-[#202836] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Inspect Traces</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
