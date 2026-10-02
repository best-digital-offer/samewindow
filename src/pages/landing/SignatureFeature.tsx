import React from 'react';
import { GitCompare, ArrowRight, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface SignatureFeatureProps {
  onTryCompare: () => void;
}

export const SignatureFeature: React.FC<SignatureFeatureProps> = ({ onTryCompare }) => {
  return (
    <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-800/40 text-xs font-mono text-rose-300">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          <span>SIGNATURE CAPABILITY</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
          Find the first meaningful divergence.
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed text-balance">
          When an agent intermittently fails in production, comparing a successful execution against the failed execution immediately isolates what changed — whether an expired auth header, anomalous model output, or third-party API timeout.
        </p>
      </div>

      {/* Side-by-side Visual Diff Showcase */}
      <div className="rounded-xl border border-[#21293a] bg-[#090c12] p-5 sm:p-8 shadow-2xl space-y-6">
        {/* Highlight callout box */}
        <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-300 font-mono">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              First meaningful divergence detected at step 5: <code className="text-rose-200 font-bold bg-rose-900/50 px-1 py-0.5 rounded">process_refund</code>
            </span>
          </div>
          <button
            onClick={onTryCompare}
            className="px-3 py-1 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors self-start sm:self-auto"
          >
            Open in Diff Engine →
          </button>
        </div>

        {/* Timelines Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {/* Column A: SUCCESSFUL RUN */}
          <div className="p-4 rounded-xl bg-[#080d16] border border-emerald-950/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40 text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                SUCCESSFUL RUN (#1841)
              </span>
              <span className="text-[11px] text-slate-400 font-normal">2.110s · 3,120 tokens</span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="p-2 rounded bg-[#0b121e] border border-[#162234] flex items-center justify-between">
                <span>01. User request received</span>
                <span className="text-[10px] text-slate-400">+00:00.000</span>
              </div>
              <div className="p-2 rounded bg-[#0b121e] border border-[#162234] flex items-center justify-between">
                <span>02. Model call: Reasoning</span>
                <span className="text-[10px] text-slate-400">+00:00.138</span>
              </div>
              <div className="p-2 rounded bg-[#0b121e] border border-[#162234] flex items-center justify-between">
                <span>03. Tool: search_customer</span>
                <span className="text-[10px] text-emerald-400 font-bold">200 OK</span>
              </div>
              <div className="p-2 rounded bg-[#0b121e] border border-[#162234] flex items-center justify-between">
                <span>04. Tool: get_order</span>
                <span className="text-[10px] text-emerald-400 font-bold">200 OK</span>
              </div>
              <div className="p-2 rounded bg-[#0b121e] border border-emerald-500/40 flex items-center justify-between text-emerald-300 font-medium">
                <span>05. Tool: process_refund</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-bold">
                  200 OK
                </span>
              </div>
              <div className="p-2 rounded bg-[#0b121e] border border-[#162234] flex items-center justify-between">
                <span>06. Final response delivered</span>
                <span className="text-[10px] text-emerald-400 font-bold">COMPLETED</span>
              </div>
            </div>
          </div>

          {/* Column B: FAILED RUN */}
          <div className="p-4 rounded-xl bg-[#14080a] border border-rose-950/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rose-900/40 text-rose-400 font-bold">
              <span className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                FAILED RUN (#1842)
              </span>
              <span className="text-[11px] text-slate-400 font-normal">3.024s · 4,821 tokens</span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="p-2 rounded bg-[#180b0e] border border-[#2c1318] flex items-center justify-between">
                <span>01. User request received</span>
                <span className="text-[10px] text-slate-400">+00:00.000</span>
              </div>
              <div className="p-2 rounded bg-[#180b0e] border border-[#2c1318] flex items-center justify-between">
                <span>02. Model call: Reasoning</span>
                <span className="text-[10px] text-slate-400">+00:00.142</span>
              </div>
              <div className="p-2 rounded bg-[#180b0e] border border-[#2c1318] flex items-center justify-between">
                <span>03. Tool: search_customer</span>
                <span className="text-[10px] text-emerald-400 font-bold">200 OK</span>
              </div>
              <div className="p-2 rounded bg-[#180b0e] border border-[#2c1318] flex items-center justify-between">
                <span>04. Tool: get_order</span>
                <span className="text-[10px] text-emerald-400 font-bold">200 OK</span>
              </div>
              {/* Divergent Node */}
              <div className="p-2 rounded bg-rose-950/80 border-2 border-rose-500 flex items-center justify-between text-rose-200 font-bold shadow-md">
                <div className="flex items-center gap-2">
                  <span>05. Tool: process_refund</span>
                  <span className="text-[9px] uppercase bg-rose-800 text-white px-1 rounded animate-pulse">
                    FIRST DIVERGENCE
                  </span>
                </div>
                <span className="text-[10px] text-rose-200 bg-rose-900 px-1.5 py-0.5 rounded font-bold">
                  401 UNAUTHORIZED
                </span>
              </div>
              <div className="p-2 rounded bg-[#180b0e] border border-[#2c1318] flex items-center justify-between text-slate-400">
                <span>06. Retry: process_refund</span>
                <span className="text-[10px] text-rose-400 font-bold">401 RETRY FAILED</span>
              </div>
              <div className="p-2 rounded bg-[#180b0e] border border-[#2c1318] flex items-center justify-between text-rose-400 font-bold">
                <span>07. FAILED (Terminal abort)</span>
                <span className="text-[10px] text-rose-400 font-bold">ABORTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
