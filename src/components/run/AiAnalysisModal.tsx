import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import { AIAnalysisResult } from '../../types';
import { Modal } from '../common/Modal';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AIAnalysisResult | null;
  loading: boolean;
  onRetry: () => void;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
  loading,
  onRetry,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopySummary = () => {
    if (!analysis) return;
    const text = `SameWindow AI Failure Analysis
Model: ${analysis.modelUsed} (${analysis.provider})
Summary: ${analysis.summary}
First Failure: ${analysis.first_failure}
Likely Cause: ${analysis.likely_cause}
Evidence:
${analysis.evidence.map((e) => `- ${e}`).join('\n')}
Recommended Next Steps:
${analysis.recommended_next_steps.map((s) => `- ${s}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Agent Failure Analysis" maxWidth="max-w-2xl">
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <Sparkles className="w-5 h-5 text-indigo-400 absolute inset-0 m-auto" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Analyzing Trace with Groq / Llama 3.3...</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Inspecting chronological event offsets, HTTP statuses, and tool execution payloads for root causes.
            </p>
          </div>
        </div>
      ) : analysis ? (
        <div className="space-y-4 text-xs text-slate-300">
          {/* AI Disclaimer & Engine Badge */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#111622] border border-[#202737] text-[11px]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-300">
                Grounded analysis by{' '}
                <strong className="text-white font-mono">{analysis.modelUsed}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                {analysis.provider} provider
              </span>
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                title="Copy analysis summary"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* 1. Summary */}
          <div className="p-3.5 rounded-xl bg-[#090c12] border border-[#1b2230] space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Executive Summary
            </div>
            <p className="text-sm text-slate-100 leading-relaxed font-sans font-medium">
              {analysis.summary}
            </p>
          </div>

          {/* 2. First Failure */}
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              First Meaningful Failure Point
            </div>
            <p className="text-xs font-mono text-rose-200 leading-relaxed">
              {analysis.first_failure}
            </p>
          </div>

          {/* 3. Likely Cause */}
          <div className="p-3.5 rounded-xl bg-[#090c12] border border-[#1b2230] space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Likely Root Cause
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {analysis.likely_cause}
            </p>
          </div>

          {/* 4. Evidence */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Supporting Evidence from Trace
            </div>
            <div className="space-y-1.5">
              {analysis.evidence.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#0a0d14] border border-[#19202c] text-xs font-mono text-slate-300 flex items-start gap-2"
                >
                  <span className="text-indigo-400 shrink-0 font-bold">[{idx + 1}]</span>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Recommended Next Steps */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Recommended Remediation Steps
            </div>
            <div className="space-y-1.5">
              {analysis.recommended_next_steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#0c121d] border border-indigo-900/30 text-xs text-slate-200 flex items-start gap-2.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-[#171d28]">
            <span>Hypothesis strictly grounded in provided execution telemetry.</span>
            <button
              onClick={onRetry}
              className="text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Re-run analysis
            </button>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-slate-400">
          <p>Click below to inspect this run with Groq-powered failure reasoning.</p>
          <button
            onClick={onRetry}
            className="mt-3 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg"
          >
            Start Analysis
          </button>
        </div>
      )}
    </Modal>
  );
};
