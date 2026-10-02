import React from 'react';
import {
  Play,
  GitCompare,
  Sparkles,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { Run } from '../../types';
import { exportRunToJson } from '../../lib/export';

interface RunHeaderProps {
  run: Run;
  onBack: () => void;
  onReplayClick: () => void;
  isReplaying: boolean;
  onCompareClick: () => void;
  onAnalyzeClick: () => void;
  onDeleteClick: () => void;
  isAnalyzing?: boolean;
}

export const RunHeader: React.FC<RunHeaderProps> = ({
  run,
  onBack,
  onReplayClick,
  isReplaying,
  onCompareClick,
  onAnalyzeClick,
  onDeleteClick,
  isAnalyzing = false,
}) => {
  return (
    <div className="border-b border-[#1a212e] bg-[#090b0f] p-6 space-y-4">
      {/* Top back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141a24] transition-colors"
            title="Back to runs list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Run</span>
              <span className="text-sm font-mono font-semibold text-indigo-300">
                #{run.id}
              </span>
              {run.status === 'SUCCESS' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3" /> SUCCESS
                </span>
              ) : run.status === 'FAILED' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950/50 text-rose-400 border border-rose-800/40">
                  <XCircle className="w-3 h-3" /> FAILED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/50 text-amber-400 border border-amber-800/40">
                  <Clock className="w-3 h-3 animate-spin" /> RUNNING
                </span>
              )}
              {run.isDemo && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/30">
                  SAMPLE DEMO TRACE
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
              {run.agentName}
            </h1>
          </div>
        </div>

        {/* Action button bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Replay */}
          <button
            onClick={onReplayClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isReplaying
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-[#121620] text-slate-300 border-[#222b3b] hover:text-white hover:bg-[#18202d]'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isReplaying ? 'fill-current' : ''}`} />
            <span>{isReplaying ? 'Exit Replay' : 'Replay Run'}</span>
          </button>

          {/* Compare */}
          <button
            onClick={onCompareClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#121620] border border-[#222b3b] hover:text-white hover:bg-[#18202d] rounded-lg transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>

          {/* AI Failure Analysis */}
          <button
            onClick={onAnalyzeClick}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/50 border border-indigo-700/50 hover:bg-indigo-900/60 rounded-lg transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isAnalyzing ? 'Analyzing with AI...' : 'Analyze Failure'}</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={() => exportRunToJson(run)}
            className="p-1.5 text-slate-400 hover:text-white bg-[#121620] border border-[#222b3b] hover:bg-[#18202d] rounded-lg transition-colors"
            title="Export Trace JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={onDeleteClick}
            className="p-1.5 text-slate-400 hover:text-rose-400 bg-[#121620] border border-[#222b3b] hover:bg-[#18202d] rounded-lg transition-colors"
            title="Delete Run"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-2.5 rounded-lg bg-[#0e121a] border border-[#1a212e]">
          <div className="text-[11px] text-slate-400">Started</div>
          <div className="text-xs font-mono font-medium text-slate-200 mt-0.5">
            {new Date(run.startedAt).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-[#0e121a] border border-[#1a212e]">
          <div className="text-[11px] text-slate-400">Duration</div>
          <div className="text-xs font-mono font-medium text-slate-200 mt-0.5 tabular-nums">
            {(run.durationMs / 1000).toFixed(3)}s
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-[#0e121a] border border-[#1a212e]">
          <div className="text-[11px] text-slate-400">Total Tokens</div>
          <div className="text-xs font-mono font-medium text-slate-200 mt-0.5 tabular-nums">
            {run.totalTokens.toLocaleString()}
            <span className="text-[10px] text-slate-400 ml-1">
              ({run.inputTokens} in / {run.outputTokens} out)
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-[#0e121a] border border-[#1a212e]">
          <div className="text-[11px] text-slate-400">Estimated Cost</div>
          <div className="text-xs font-mono font-medium text-emerald-300 mt-0.5 tabular-nums">
            ${run.estimatedCost.toFixed(4)}
          </div>
        </div>
      </div>

      {run.errorMessage && (
        <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300 flex items-start gap-2">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Execution Failure: </span>
            <span className="font-mono">{run.errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
