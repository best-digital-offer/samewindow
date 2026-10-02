import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sampleCode = `import { SameWindow } from "samewindow";

const sw = new SameWindow({
  apiKey: process.env.SAMEWINDOW_API_KEY,
  projectId: process.env.SAMEWINDOW_PROJECT_ID
});

// Start flight recording
const run = sw.startRun({
  agent: "customer-support",
  model: "llama-3.3-70b-versatile"
});

run.userInput("Refund order #ORD-9821");

// Record model & tool calls
run.toolCall("search_customer", { customerId });
run.toolCall("get_order", { orderId });

// Fail-safe: finishes run and buffers trace asynchronously
run.end();`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      num: '01',
      title: 'Instrument',
      desc: 'Add the lightweight SameWindow SDK to your Python, LangGraph, Vercel AI SDK, or TypeScript agent architecture with two lines of code.',
    },
    {
      num: '02',
      title: 'Record',
      desc: 'SameWindow asynchronously captures prompt tokens, tool inputs, responses, error payloads, and execution latency without blocking your agent.',
    },
    {
      num: '03',
      title: 'Understand',
      desc: 'Replay the run in a chronological timeline, inspect raw JSON schemas, compare against previous executions, and analyze failures with Groq.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
      <div className="max-w-2xl space-y-2 text-left">
        <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
          Implementation
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Three steps to complete agent observability.
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Designed to fail safely. If SameWindow is unreachable, your customer’s agent application never breaks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Steps Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-5 rounded-xl bg-[#0c0f16] border border-[#1b2230] space-y-2"
            >
              <div className="text-xs font-mono text-indigo-400 font-bold">
                {s.num} — {s.title}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Beautiful Code Card (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-[#202737] bg-[#07090e] shadow-2xl overflow-hidden font-mono text-xs">
          <div className="px-4 py-2.5 bg-[#0c1017] border-b border-[#1b2332] flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] text-slate-300">agent-handler.ts</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-[#161c28] transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-4 overflow-x-auto text-slate-300 leading-relaxed selection:bg-indigo-500/20">
            <pre className="text-[11px]">
              <code>{sampleCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};
