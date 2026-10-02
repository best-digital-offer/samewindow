import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Copy,
  Check,
  Terminal,
  Shield,
  Layers,
  Play,
  Key,
} from 'lucide-react';

interface DocsPageProps {
  currentSubPage?: string;
  onNavigate: (route: string) => void;
}

export const DocsPage: React.FC<DocsPageProps> = ({ currentSubPage = 'quickstart', onNavigate }) => {
  const [activeTab, setActiveTab] = useState(currentSubPage || 'quickstart');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const navItems = [
    { id: 'quickstart', label: 'Quickstart', icon: Terminal },
    { id: 'javascript', label: 'TypeScript / JS SDK', icon: Code2 },
    { id: 'runs', label: 'Concepts: Runs', icon: Layers },
    { id: 'events', label: 'Concepts: Events', icon: BookOpen },
    { id: 'replay', label: 'Replay Engine', icon: Play },
    { id: 'api', label: 'Ingestion REST API', icon: Key },
    { id: 'security', label: 'Privacy & Redaction', icon: Shield },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start">
      {/* Docs Sidebar */}
      <aside className="w-full md:w-56 shrink-0 space-y-1 text-xs">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 mb-2">
          Documentation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                isActive
                  ? 'bg-[#182030] text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#121622]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Docs Content */}
      <main className="flex-1 max-w-3xl space-y-8 text-xs text-slate-300 leading-relaxed">
        {/* Quickstart Tab */}
        {activeTab === 'quickstart' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Quickstart Guide</h1>
              <p className="text-slate-400 mt-1">
                Instrument your first AI agent with SameWindow in less than 2 minutes.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">1. Install the SDK</h3>
              <div className="rounded-lg bg-[#07090d] border border-[#1b2230] p-3 font-mono text-[11px] flex items-center justify-between">
                <span className="text-indigo-300">npm install samewindow</span>
                <button
                  onClick={() => copySnippet('npm install samewindow', 'npm')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedKey === 'npm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">2. Initialize and Record a Run</h3>
              <div className="rounded-lg bg-[#07090d] border border-[#1b2230] p-4 font-mono text-[11px] space-y-2 overflow-x-auto">
                <div className="flex justify-end pb-1 border-b border-[#161c28]">
                  <button
                    onClick={() =>
                      copySnippet(
                        `import { SameWindow } from "samewindow";\n\nconst sw = new SameWindow({\n  apiKey: process.env.SAMEWINDOW_API_KEY,\n  projectId: process.env.SAMEWINDOW_PROJECT_ID,\n});\n\nconst run = sw.startRun({\n  agent: "customer-support",\n  model: "llama-3.3-70b-versatile"\n});\n\nrun.userInput("Refund order #ORD-9821");\nrun.toolCall("search_customer", { customerId });\nrun.end();`,
                        'code1'
                      )
                    }
                    className="flex items-center gap-1 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'code1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'code1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-slate-300">
                  {`import { SameWindow } from "samewindow";

const sw = new SameWindow({
  apiKey: process.env.SAMEWINDOW_API_KEY,
  projectId: process.env.SAMEWINDOW_PROJECT_ID,
});

const run = sw.startRun({
  agent: "customer-support",
  model: "llama-3.3-70b-versatile"
});

run.userInput("Refund order #ORD-9821");
run.toolCall("search_customer", { customerId });
run.end();`}
                </pre>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/40 text-xs text-indigo-200">
              <strong>Fail-Safe Architecture:</strong> The SDK operates asynchronously. If your network fails or SameWindow is temporarily unavailable, your agent will never throw an unhandled error or experience latency degradations.
            </div>
          </div>
        )}

        {/* JavaScript SDK Tab */}
        {activeTab === 'javascript' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">TypeScript & JavaScript SDK</h1>
            <p className="text-slate-400">
              The SameWindow client exposes high-level recorder helpers and low-level batch flush controllers.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#0a0d14] border border-[#1b2230] space-y-2">
                <code className="text-indigo-400 font-mono font-semibold">sw.startRun(options)</code>
                <p className="text-xs text-slate-300">
                  Initializes a new in-memory flight recorder instance and starts the millisecond timer.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#0a0d14] border border-[#1b2230] space-y-2">
                <code className="text-indigo-400 font-mono font-semibold">run.toolCall(name, args, response, status, latencyMs)</code>
                <p className="text-xs text-slate-300">
                  Captures a tool call, automatic parameter redaction, response payload, and HTTP return code.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#0a0d14] border border-[#1b2230] space-y-2">
                <code className="text-indigo-400 font-mono font-semibold">run.modelCall(modelParams)</code>
                <p className="text-xs text-slate-300">
                  Logs token usage (input/output), inference latency, and estimated provider cost.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#0a0d14] border border-[#1b2230] space-y-2">
                <code className="text-indigo-400 font-mono font-semibold">run.error(errorType, message, statusCode, culpritTool)</code>
                <p className="text-xs text-slate-300">
                  Marks the run as FAILED and captures the culprit step and error message for root cause analysis.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Runs Tab */}
        {activeTab === 'runs' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white tracking-tight">Concepts: Agent Runs</h1>
            <p className="text-slate-400">
              A <strong>Run</strong> represents a discrete, bounded agent task — from the moment the user or webhook submits a prompt until the agent delivers its terminal response or terminates with an error.
            </p>
            <div className="p-4 rounded-lg bg-[#0c0f16] border border-[#1b2230] space-y-2">
              <h4 className="font-semibold text-white">Run Lifecycle States:</h4>
              <ul className="space-y-1.5 list-disc pl-4 text-xs text-slate-300">
                <li><strong className="text-amber-400">RUNNING:</strong> Agent currently executing steps.</li>
                <li><strong className="text-emerald-400">SUCCESS:</strong> Execution completed with terminal output.</li>
                <li><strong className="text-rose-400">FAILED:</strong> Execution aborted following unhandled tool failure or exception.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white tracking-tight">Concepts: Events & Timeline</h1>
            <p className="text-slate-400">
              Each event in SameWindow has a strictly monotonically increasing millisecond offset relative to the run's start time (<code className="font-mono">+00:01.883</code>).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#090c12] border border-[#1b2230]">
                <strong className="text-white">USER_INPUT</strong>
                <p className="text-[11px] text-slate-400 mt-1">The initial prompt or webhook trigger payload.</p>
              </div>
              <div className="p-3 rounded-lg bg-[#090c12] border border-[#1b2230]">
                <strong className="text-white">MODEL_CALL</strong>
                <p className="text-[11px] text-slate-400 mt-1">LLM inference step, tokens, and temperature.</p>
              </div>
              <div className="p-3 rounded-lg bg-[#090c12] border border-[#1b2230]">
                <strong className="text-white">TOOL_CALL</strong>
                <p className="text-[11px] text-slate-400 mt-1">Function invocation, arguments, and result.</p>
              </div>
              <div className="p-3 rounded-lg bg-[#090c12] border border-[#1b2230]">
                <strong className="text-white">ERROR</strong>
                <p className="text-[11px] text-slate-400 mt-1">Status code 4xx/5xx or unhandled exception.</p>
              </div>
            </div>
          </div>
        )}

        {/* Replay Tab */}
        {activeTab === 'replay' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white tracking-tight">Replay Engine</h1>
            <p className="text-slate-400">
              SameWindow's Replay Engine recreates the exact state machine of your agent run.
            </p>
            <p className="text-xs text-slate-300">
              Use the playback toolbar to step forward, step backward, or scrub the timeline to observe how tool arguments and model decisions compounded leading up to a crash.
            </p>
          </div>
        )}

        {/* API Tab */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white tracking-tight">Ingestion REST API</h1>
            <p className="text-slate-400">
              You can send telemetry traces directly via HTTP POST if not using the JS SDK.
            </p>
            <div className="p-4 rounded-lg bg-[#07090d] border border-[#1b2230] font-mono text-[11px] space-y-2">
              <span className="text-slate-400">POST /api/ingest</span><br />
              <span className="text-slate-400">Authorization: Bearer sw_live_...</span><br />
              <span className="text-slate-400">X-Project-Id: proj_default</span><br />
              <span className="text-indigo-300">{"{ \"runs\": [ { \"id\": \"run_...\", \"agentName\": \"...\", \"events\": [...] } ] }"}</span>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white tracking-tight">Privacy & Redaction</h1>
            <p className="text-slate-400">
              Never send passwords, bearer tokens, or API secrets into telemetry storage.
            </p>
            <div className="p-4 rounded-lg bg-[#0c0f16] border border-[#1b2230] font-mono text-[11px]">
              {`samewindow.configure({\n  captureInput: true,\n  captureOutput: true,\n  redact: [\n    "email",\n    "authorization",\n    "apiKey",\n    "password",\n    "creditCard"\n  ]\n});`}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
