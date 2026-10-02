import React from 'react';
import { Play, Sparkles, CheckCircle2, XCircle, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';

interface HeroProps {
  onStartFree: () => void;
  onViewDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartFree, onViewDemo }) => {
  return (
    <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] bg-gradient-to-b from-indigo-900/15 via-violet-900/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto text-center space-y-6">
        {/* Subtle kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121622] border border-[#222b3b] text-xs text-indigo-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="font-medium">The AI Agent Flight Recorder</span>
        </div>

        {/* Hero headline */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] text-balance">
          See exactly what your AI agent did.
        </h1>

        {/* Supporting copy */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed text-balance">
          SameWindow is the flight recorder for AI agents. Capture runs, inspect tool calls, replay failures, compare executions, and understand exactly where an agent went wrong.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartFree}
            className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group"
          >
            <span>Start Free</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={onViewDemo}
            className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-medium text-slate-300 bg-[#121622] hover:bg-[#18202e] border border-[#222b3b] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current text-indigo-400" />
            <span>View Interactive Flight Recorder</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          No credit card required. Free tier includes 1,000 runs/month.
        </p>
      </div>

      {/* Hero Visual: Realistic High-Fidelity Flight Recorder Window */}
      <div className="max-w-5xl mx-auto mt-12 rounded-xl border border-[#242d3d] bg-[#090c12] shadow-2xl overflow-hidden text-left">
        {/* Window Chrome */}
        <div className="px-4 py-2.5 bg-[#0e121a] border-b border-[#1f2635] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#323b4c]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#323b4c]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#323b4c]" />
            </div>
            <span className="ml-2 font-mono text-[11px] text-slate-400">
              samewindow://recorder/runs/1842
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-rose-400 font-bold">RUN #1842 · FAILED</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400">Customer Support Agent</span>
          </div>
        </div>

        {/* Inside Window: Split view with Run Timeline and AI Failure Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#1a212e]">
          {/* Left: Chronological Trace (7 cols) */}
          <div className="md:col-span-7 p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#161c27] text-[11px] text-slate-400">
              <span>CHRONOLOGICAL EXECUTION TIMELINE</span>
              <span>DURATION: 3.024s</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3 text-slate-300">
                <span className="text-slate-400 text-[11px] w-16 shrink-0">00:00.000</span>
                <span className="text-slate-200">User request received</span>
              </div>

              <div className="flex items-start gap-3 text-slate-300">
                <span className="text-slate-400 text-[11px] w-16 shrink-0">00:00.142</span>
                <span>Model: <span className="text-indigo-300">llama-3.3-70b-versatile</span></span>
              </div>

              <div className="flex items-start gap-3 text-slate-300">
                <span className="text-slate-400 text-[11px] w-16 shrink-0">00:00.481</span>
                <div className="flex items-center gap-2">
                  <span>Tool: <span className="text-white font-semibold">search_customer</span></span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1 rounded">200 OK</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-slate-300">
                <span className="text-slate-400 text-[11px] w-16 shrink-0">00:01.129</span>
                <div className="flex items-center gap-2">
                  <span>Tool: <span className="text-white font-semibold">get_order</span></span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1 rounded">200 OK</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded bg-rose-950/30 border border-rose-900/40 text-rose-300">
                <span className="text-rose-400 text-[11px] w-16 shrink-0">00:01.883</span>
                <div className="flex items-center gap-2">
                  <span>Tool: <span className="text-rose-200 font-bold">process_refund</span></span>
                  <span className="text-[10px] text-rose-300 bg-rose-900/60 px-1.5 py-0.2 rounded font-bold">
                    401 UNAUTHORIZED
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-slate-400">
                <span className="text-slate-400 text-[11px] w-16 shrink-0">00:02.147</span>
                <span>Retry invocation: <span className="text-slate-300">process_refund (401)</span></span>
              </div>

              <div className="flex items-start gap-3 text-rose-400 font-bold">
                <span className="text-rose-400 text-[11px] w-16 shrink-0">00:03.024</span>
                <span>FAILED: Agent terminated without refund execution</span>
              </div>
            </div>
          </div>

          {/* Right: Real-time AI Failure Analysis (5 cols) */}
          <div className="md:col-span-5 p-5 bg-[#0b0e14] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Failure Analysis</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Groq / Llama 3.3</span>
              </div>

              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-xs space-y-1.5">
                <div className="font-semibold text-rose-300">
                  Authentication failed while calling <code className="font-mono bg-rose-950/50 px-1 rounded">process_refund</code>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  First failure: <strong className="text-rose-300 font-mono">HTTP 401 Unauthorized</strong> at offset +00:01.883.
                </p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  The retry used the exact same invalid payment scope context without re-authenticating.
                </p>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1">
                <div className="text-slate-300 font-semibold">Recommended Fix:</div>
                <div className="flex items-center gap-1.5 text-indigo-300">
                  <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>Intercept 401 status to refresh gateway bearer token</span>
                </div>
              </div>
            </div>

            <button
              onClick={onViewDemo}
              className="w-full py-2 rounded-lg bg-[#141a24] hover:bg-[#1a2230] border border-[#242e40] text-xs font-medium text-slate-200 hover:text-white transition-colors text-center"
            >
              Open Full Interactive Inspector →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
