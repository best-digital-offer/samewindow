import React from 'react';
import { ArrowDown, AlertOctagon, RefreshCw, XCircle } from 'lucide-react';

export const StorySection: React.FC = () => {
  const failurePoints = [
    { label: 'Model', desc: 'Hallucinated arguments or invalid JSON schema' },
    { label: 'Tool', desc: 'Unchecked parameter types and missing field crashes' },
    { label: 'API Gateway', desc: 'Expired OAuth bearer tokens and 401 Unauthorized' },
    { label: 'Database', desc: 'Unindexed query timeouts and schema constraint violations' },
    { label: 'Retry Loops', desc: 'Blindly repeating identical invalid payload in retry loop' },
    { label: 'Context Window', desc: 'Token limit truncation cutting off essential memory' },
    { label: 'Output Parser', desc: 'Malformed markdown boundary preventing return to user' },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-16">
      {/* 1. Built for the way agents actually fail */}
      <div className="space-y-6">
        <div className="max-w-2xl space-y-2 text-left">
          <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
            Root Causes
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built for the way agents actually fail.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Unlike classical CRUD apps, agentic failures emerge from dynamic non-deterministic loops across 7 distinct failure surfaces.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {failurePoints.map((p, i) => (
            <div
              key={p.label}
              className="p-3.5 rounded-xl bg-[#0c0f16] border border-[#1b2230] space-y-1.5"
            >
              <div className="text-[10px] font-mono text-indigo-400 font-bold">0{i + 1}</div>
              <div className="text-xs font-bold text-white">{p.label}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. From black box to timeline */}
      <div className="rounded-xl border border-[#1d2535] bg-[#090c12] p-6 sm:p-8 space-y-8">
        <div className="max-w-xl space-y-2">
          <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
            Transformation
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            From black box to transparent timeline
          </h3>
          <p className="text-xs text-slate-400">
            Turn opaque stack traces into clear, chronological decision forensics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Before */}
          <div className="p-5 rounded-xl bg-[#140a0c] border border-rose-950/70 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">
              Before SameWindow
            </span>
            <div className="p-4 rounded-lg bg-[#0e0709] border border-[#2b1016] text-rose-300 font-mono text-xs">
              <span className="text-slate-400">// CloudWatch Error:</span><br />
              <span className="text-rose-400 font-semibold">“The agent run failed with unhandled exception at 14:32:21 UTC”</span>
            </div>
            <p className="text-xs text-slate-400">
              No context on what the model thought, what parameters it passed, or which specific tool trigger caused the crash.
            </p>
          </div>

          {/* After */}
          <div className="p-5 rounded-xl bg-[#0b0f19] border border-indigo-900/40 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-bold">
              With SameWindow
            </span>
            <div className="p-3 rounded-lg bg-[#070a12] border border-[#182132] font-mono text-[11px] space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-indigo-400">Request</span>
                <span className="text-slate-400">→</span>
                <span>Model Call</span>
                <span className="text-slate-400">→</span>
                <span>Tool search_customer</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-400">↓</span>
              </div>
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <span>Tool process_refund</span>
                <span className="text-slate-400">→</span>
                <span className="bg-rose-950 text-rose-300 px-1 rounded">401 UNAUTHORIZED</span>
                <span className="text-slate-400">→</span>
                <span>Retry Loop Failed</span>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Instant root cause visibility: the integration bearer token expired at +00:01.883ms.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
