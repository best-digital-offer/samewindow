import React, { useState } from 'react';
import {
  GitCompare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Run } from '../../types';
import { compareRuns } from '../../lib/divergence';
import { AIService } from '../../services/aiService';

interface RunComparisonProps {
  runs: Run[];
  initialRunAId?: string;
  initialRunBId?: string;
  onSelectRunDetail: (runId: string) => void;
}

export const RunComparison: React.FC<RunComparisonProps> = ({
  runs,
  initialRunAId,
  initialRunBId,
  onSelectRunDetail,
}) => {
  // Find a good pair by default (e.g. 1841 Success and 1842 Failed)
  const defaultRunA = runs.find((r) => r.status === 'SUCCESS') || runs[0];
  const defaultRunB = runs.find((r) => r.status === 'FAILED') || runs[1] || runs[0];

  const [runAId, setRunAId] = useState<string>(initialRunAId || defaultRunA?.id || '');
  const [runBId, setRunBId] = useState<string>(initialRunBId || defaultRunB?.id || '');
  const [explaining, setExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const runA = runs.find((r) => r.id === runAId);
  const runB = runs.find((r) => r.id === runBId);

  if (!runA || !runB) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Please record or select at least two runs to compare executions.
      </div>
    );
  }

  const comparison = compareRuns(runA, runB);
  const maxEvents = Math.max(runA.events.length, runB.events.length);

  const handleExplainDifference = async () => {
    setExplaining(true);
    try {
      const explanation = await AIService.explainComparison(comparison);
      setAiExplanation(explanation);
    } catch {
      setAiExplanation('Could not complete difference analysis.');
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1a212e]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Differential Flight Recorder</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1">
            Compare Agent Executions
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify the exact step, tool payload, or latency spike where one execution deviated from another.
          </p>
        </div>

        {/* Explain difference button */}
        <button
          onClick={handleExplainDifference}
          disabled={explaining}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors shadow-sm self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{explaining ? 'Analyzing with AI...' : 'Explain Difference'}</span>
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Run A Selector */}
        <div className="p-3.5 rounded-xl bg-[#0c0f16] border border-[#1b2230] space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Reference Run (Run A)</span>
            <span className="text-indigo-400">Baseline</span>
          </label>
          <select
            value={runAId}
            onChange={(e) => {
              setRunAId(e.target.value);
              setAiExplanation(null);
            }}
            className="w-full p-2 text-xs bg-[#10141d] border border-[#222b3b] rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500/50"
          >
            {runs.map((r) => (
              <option key={r.id} value={r.id}>
                #{r.id} · {r.agentName} ({r.status}) · {(r.durationMs / 1000).toFixed(2)}s
              </option>
            ))}
          </select>
        </div>

        {/* Run B Selector */}
        <div className="p-3.5 rounded-xl bg-[#0c0f16] border border-[#1b2230] space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Target Run (Run B)</span>
            <span className="text-rose-400">Comparator</span>
          </label>
          <select
            value={runBId}
            onChange={(e) => {
              setRunBId(e.target.value);
              setAiExplanation(null);
            }}
            className="w-full p-2 text-xs bg-[#10141d] border border-[#222b3b] rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500/50"
          >
            {runs.map((r) => (
              <option key={r.id} value={r.id}>
                #{r.id} · {r.agentName} ({r.status}) · {(r.durationMs / 1000).toFixed(2)}s
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Delta Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#0a0d14] border border-[#1a212e]">
          <div className="text-[11px] text-slate-400">Status</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-mono font-bold ${runA.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {runA.status}
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className={`text-xs font-mono font-bold ${runB.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {runB.status}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0a0d14] border border-[#1a212e]">
          <div className="text-[11px] text-slate-400">Duration Delta</div>
          <div className="text-xs font-mono font-bold text-slate-200 mt-1 tabular-nums">
            {(runA.durationMs / 1000).toFixed(2)}s vs {(runB.durationMs / 1000).toFixed(2)}s
            <span className={`ml-1 text-[10px] ${comparison.durationDiffMs > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              ({comparison.durationDiffMs > 0 ? '+' : ''}{(comparison.durationDiffMs / 1000).toFixed(2)}s)
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0a0d14] border border-[#1a212e]">
          <div className="text-[11px] text-slate-400">Tokens Delta</div>
          <div className="text-xs font-mono font-bold text-slate-200 mt-1 tabular-nums">
            {runA.totalTokens} vs {runB.totalTokens}
            <span className="ml-1 text-[10px] text-slate-400">
              ({comparison.tokenDiff > 0 ? '+' : ''}{comparison.tokenDiff})
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0a0d14] border border-[#1a212e]">
          <div className="text-[11px] text-slate-400">Cost Delta</div>
          <div className="text-xs font-mono font-bold text-emerald-400 mt-1 tabular-nums">
            ${runA.estimatedCost.toFixed(4)} vs ${runB.estimatedCost.toFixed(4)}
          </div>
        </div>
      </div>

      {/* First Meaningful Divergence Banner */}
      {comparison.divergence ? (
        <div className="p-4 rounded-xl bg-[#140b0e] border border-rose-600/40 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                First Meaningful Divergence Identified
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60">
              Step {comparison.divergence.indexB + 1}
            </span>
          </div>
          <p className="text-xs text-rose-200 font-mono leading-relaxed">
            {comparison.divergence.description}
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Both runs followed an identical tool and model execution path with no status divergence.</span>
        </div>
      )}

      {/* AI Difference Explanation if generated */}
      {aiExplanation && (
        <div className="p-4 rounded-xl bg-[#0c121e] border border-indigo-500/40 shadow-xl space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Comparative Root Cause Analysis</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
            {aiExplanation}
          </p>
        </div>
      )}

      {/* Event-by-Event Side by Side Grid */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Synchronized Event Sequence (Step-by-Step)
        </h3>

        <div className="space-y-2.5">
          {Array.from({ length: maxEvents }).map((_, idx) => {
            const evA = runA.events[idx];
            const evB = runB.events[idx];

            const isDiv =
              comparison.divergence &&
              (comparison.divergence.indexA === idx || comparison.divergence.indexB === idx);

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4 text-xs transition-colors ${
                  isDiv
                    ? 'border-rose-500/70 bg-[#140b0e]'
                    : 'border-[#1b2230] bg-[#090c12]'
                }`}
              >
                {/* Event A */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="text-indigo-400 font-bold">A #{idx + 1}</span>
                    {evA && <span>+{evA.offsetMs}ms</span>}
                  </div>
                  {evA ? (
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{evA.title}</span>
                        {evA.statusCode && (
                          <span className={`text-[10px] font-mono px-1 rounded ${evA.statusCode < 400 ? 'text-emerald-400 bg-emerald-950' : 'text-rose-400 bg-rose-950'}`}>
                            {evA.statusCode}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                        {evA.type === 'USER_INPUT' && evA.data.userInput}
                        {evA.type === 'TOOL_CALL' && `args: ${JSON.stringify(evA.data.toolCall?.arguments || {})}`}
                        {evA.type === 'MODEL_CALL' && `model: ${evA.data.modelCall?.model}`}
                        {evA.type === 'FINAL_RESPONSE' && evA.data.finalResponse}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic text-[11px]">Run A ended</div>
                  )}
                </div>

                {/* Event B */}
                <div className="space-y-1 md:border-l md:border-[#1a212e] md:pl-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="text-rose-400 font-bold">B #{idx + 1}</span>
                    {evB && <span>+{evB.offsetMs}ms</span>}
                  </div>
                  {evB ? (
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{evB.title}</span>
                        {evB.statusCode && (
                          <span className={`text-[10px] font-mono px-1 rounded ${evB.statusCode < 400 ? 'text-emerald-400 bg-emerald-950' : 'text-rose-400 bg-rose-950 font-bold'}`}>
                            {evB.statusCode}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                        {evB.type === 'USER_INPUT' && evB.data.userInput}
                        {evB.type === 'TOOL_CALL' && `args: ${JSON.stringify(evB.data.toolCall?.arguments || {})}`}
                        {evB.type === 'ERROR' && `error: ${evB.data.error?.message}`}
                        {evB.type === 'FINAL_RESPONSE' && evB.data.finalResponse}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic text-[11px]">Run B ended</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
