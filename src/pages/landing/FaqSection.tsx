import React, { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is SameWindow?',
      a: 'SameWindow is a dedicated developer-grade observability and flight recorder SaaS for autonomous AI agents and tool-calling applications. It records every decision, tool call, and error in a unified chronological timeline so you never have to jump between 6 different log silos.',
    },
    {
      q: 'What is an AI agent flight recorder?',
      a: 'Like an aircraft flight recorder that logs instrument states and telemetry before an incident, an AI agent flight recorder logs the precise order of user prompts, model reasoning, tool invocations, arguments, returned payloads, latency, and status codes throughout an agent execution.',
    },
    {
      q: 'Does SameWindow store prompts?',
      a: 'By default, prompt and completion previews are captured for replay. However, SameWindow includes zero prompt retention and full local redaction policies, allowing you to disable prompt storage entirely or redact specific keys before traces leave your servers.',
    },
    {
      q: 'Can I redact sensitive data?',
      a: 'Yes. The SameWindow SDK and server pipelines support configurable client-side and server-side redaction for passwords, API keys, bearer tokens, credit cards, emails, and any custom field names you specify.',
    },
    {
      q: 'Which AI frameworks are supported?',
      a: 'SameWindow integrates with any framework or architecture, including LangChain, LangGraph, Vercel AI SDK, AutoGen, CrewAI, OpenAI, Anthropic, Google Gemini, Groq, and custom bespoke tool-calling loops.',
    },
    {
      q: 'Does SameWindow affect agent performance?',
      a: 'No. Traces are buffered locally in memory and ingested asynchronously in non-blocking batches. In the unlikely event of network interruption or API downtime, the SDK fails silently and safely so your customer agent never crashes.',
    },
    {
      q: 'How does AI failure analysis work?',
      a: 'When you click "Analyze Failure", the execution trace is processed server-side via Groq running high-throughput Llama 3.3 70B. The model strictly evaluates provided trace evidence without inventing claims, providing concrete hypotheses and remediation steps.',
    },
    {
      q: 'How is pricing calculated?',
      a: 'Pricing is based on monthly recorded runs, retention duration, and AI analysis requests. We offer a generous Free tier (1,000 runs/month) and Developer tier ($19/month for 25,000 runs and full replay/comparison tools).',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-2">
        <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
          FAQ
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Everything developers ask about architecture, privacy, and performance.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-[#1b2230] bg-[#0c0f16] overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:text-white transition-colors gap-3"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400 shrink-0">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4" />}
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-[#161c28] text-xs text-slate-400 leading-relaxed font-sans">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
