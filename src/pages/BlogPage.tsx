import React from 'react';

type Article = {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  content: string[];
};

const ARTICLES: Article[] = [
  {
    slug: 'how-to-debug-an-ai-agent-in-production',
    title: 'How to Debug an AI Agent in Production',
    description: 'A practical workflow for finding the first meaningful failure in a production AI agent run.',
    readTime: '7 min read',
    content: [
      'Production AI agents fail differently from traditional request-response applications. A single user request can trigger model calls, tool calls, retries, state changes, and external APIs before the final response is produced.',
      'The most useful debugging unit is therefore the complete agent execution. Capture the ordered timeline, model calls, tool inputs and outputs, status codes, latency, retries, and the final state. Then locate the first event that materially changed the execution path.',
      'Do not start with the final error message. A final timeout may be a consequence of an earlier authentication error, malformed tool arguments, rate limit, or unexpected tool response. Finding the first meaningful divergence usually gives you a much smaller debugging surface.',
      'SameWindow is designed around this workflow: record the run, inspect the timeline, replay the execution, and compare it with a successful run.'
    ]
  },
  {
    slug: 'ai-agent-observability-vs-debugging',
    title: 'AI Agent Observability vs AI Agent Debugging',
    description: 'What observability tells you and what production debugging needs beyond dashboards and metrics.',
    readTime: '6 min read',
    content: [
      'AI agent observability and debugging overlap, but they answer different questions. Observability helps you understand system behavior across many executions. Debugging focuses on a particular execution and asks why it failed.',
      'Metrics such as error rate, latency, token usage, and tool-call counts are valuable fleet signals. They do not always explain why one run took a different path from another.',
      'A useful debugging trace preserves sequence and context. You need to see which model decision happened before a tool call, what arguments were generated, what the tool returned, and what happened next.',
      'For production agents, the two capabilities work best together: fleet-level observability identifies a problem and execution-level debugging explains it.'
    ]
  },
  {
    slug: 'how-to-trace-every-tool-call-in-an-ai-agent',
    title: 'How to Trace Every Tool Call in an AI Agent',
    description: 'A developer guide to capturing tool-call arguments, responses, status codes, latency, and ordering.',
    readTime: '6 min read',
    content: [
      'Tool calls are where an AI agent crosses from probabilistic reasoning into deterministic software systems. That boundary is one of the most important places to capture telemetry.',
      'For every tool invocation, record a stable event ID, tool name, start and end time, duration, sanitized arguments, response metadata, status, and the run ID. Keep the event ordered relative to model calls and other tools.',
      'Redaction should happen before telemetry leaves the application. API keys, authorization headers, passwords, payment details, and other secrets should never be copied into an observability system.',
      'With this structure, a developer can inspect a complete execution timeline instead of searching through unrelated application logs.'
    ]
  },
  {
    slug: 'how-to-replay-a-failed-ai-agent-run',
    title: 'How to Replay a Failed AI Agent Run',
    description: 'Why replay is useful for AI agents and what a replayable execution trace should contain.',
    readTime: '5 min read',
    content: [
      'Replay turns a production failure from a vague log entry into an execution that can be inspected step by step. The goal is not necessarily to reproduce every external side effect; it is to reproduce or simulate the recorded decision path.',
      'A replay system should preserve event ordering, model metadata, tool-call boundaries, timing information, and relevant inputs after redaction. External mutations should be mocked or explicitly protected during replay.',
      'Replay is particularly useful when a failure depends on a sequence of events. Developers can move through the timeline, inspect the exact failing tool call, and compare the execution with a known-good run.',
      'For safety, replay should clearly distinguish recorded data from live calls and require explicit controls before any external side effect is executed.'
    ]
  },
  {
    slug: 'find-the-first-failure-in-an-ai-agent-run',
    title: 'How to Find the First Failure in an AI Agent Run',
    description: 'A practical method for separating root-cause candidates from downstream errors.',
    readTime: '5 min read',
    content: [
      'The last error in an agent trace is often not the first failure. Retries, fallbacks, timeouts, and cascading tool errors can hide the event that actually changed the run.',
      'Start by ordering events by execution offset. Mark explicit errors and non-success status codes, then inspect the surrounding model and tool events. The first event that changes the expected execution path is usually the most useful investigation point.',
      'Comparing the failed run against a successful run makes this easier. Find the longest matching prefix and inspect the first meaningful difference after that prefix.',
      'This approach is deterministic enough to automate and can provide a strong evidence set for optional AI-assisted analysis.'
    ]
  },
  {
    slug: 'compare-successful-and-failed-ai-agent-runs',
    title: 'How to Compare a Successful and Failed AI Agent Run',
    description: 'Use execution comparison to identify where two otherwise similar agent runs diverged.',
    readTime: '6 min read',
    content: [
      'A failed run becomes much easier to understand when you have a successful run for comparison. Instead of asking why an entire execution failed, you can ask where the two executions stopped behaving the same way.',
      'Normalize events into comparable categories such as user input, model call, tool call, retry, and error. Match the common prefix, then inspect the first event with a materially different status, argument set, response, or timing.',
      'The difference may be environmental rather than a code change. Authentication state, rate limits, external data, model responses, tool availability, and network latency can all alter the path.',
      'A good comparison UI should show both executions side by side and make the first meaningful divergence obvious.'
    ]
  },
  {
    slug: 'why-traditional-logs-are-not-enough-for-ai-agents',
    title: 'Why Traditional Logs Aren’t Enough for AI Agents',
    description: 'Why ordinary application logs can lose the execution context developers need to debug agents.',
    readTime: '6 min read',
    content: [
      'Traditional logs are excellent for recording events, but AI agents create long, branching executions where order and context matter. A collection of individual log lines can make it difficult to reconstruct the decision path.',
      'An agent trace should preserve relationships between model calls, tool calls, retries, and errors. The trace should answer not only what happened, but what happened immediately before and after each event.',
      'This does not mean replacing existing logging. Instead, agent traces can provide an execution-level layer above application logs, while conventional logs continue to serve infrastructure and service-level debugging.',
      'The result is a clearer boundary between system monitoring and agent execution debugging.'
    ]
  },
  {
    slug: 'how-to-debug-langgraph-agents',
    title: 'How to Debug LangGraph Agents',
    description: 'A framework-oriented approach to tracing nodes, tool calls, state transitions, and failures in LangGraph workflows.',
    readTime: '7 min read',
    content: [
      'LangGraph workflows are naturally suited to execution tracing because their behavior can span multiple nodes, model calls, tools, and state transitions.',
      'For debugging, capture the graph execution ID and associate each meaningful node or tool event with it. Record state changes selectively and redact sensitive fields before transmission.',
      'When a workflow fails, inspect the last successful node and the first node where the observed state or output differs from the expected path. This makes the graph structure useful as a debugging map rather than only an application architecture diagram.',
      'The same execution-level principles apply whether your graph is simple or contains many branches and retries.'
    ]
  },
  {
    slug: 'how-to-debug-langchain-agents',
    title: 'How to Debug LangChain Agents',
    description: 'A practical guide to tracing model calls, tools, agent steps, errors, and latency in LangChain applications.',
    readTime: '7 min read',
    content: [
      'LangChain agents can produce a chain of model decisions and tool invocations that is difficult to understand from the final response alone.',
      'Capture the agent run as a timeline. Model calls should include model metadata and token counts when available. Tool events should include sanitized arguments, response metadata, status, and latency.',
      'When an agent fails, compare the failed execution with a successful execution using the same task or a similar input. Look for changes in tool selection, arguments, external responses, and retry behavior.',
      'The goal is to make the agent execution inspectable without coupling your debugging workflow to a single logging format.'
    ]
  },
  {
    slug: 'how-to-monitor-ai-agent-tool-calls',
    title: 'How to Monitor AI Agent Tool Calls',
    description: 'Track tool-call volume, latency, failures, retries, and cost without exposing secrets.',
    readTime: '6 min read',
    content: [
      'Tool-call monitoring gives teams an operational view of how agents interact with external systems. Useful dimensions include call count, error rate, latency, retry count, tool name, and environment.',
      'Aggregate metrics help identify unstable integrations, while individual traces explain what happened in a specific run. Keeping both levels makes investigation much faster.',
      'Telemetry must be designed around data minimization. Capture only what is useful for debugging, redact sensitive fields, and provide project-level controls for input and output capture.',
      'For cost analysis, combine model token usage with tool-call latency and run volume so developers can understand both AI and infrastructure costs.'
    ]
  }
];

const slugify = (value: string) => value.replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();

export const BLOG_ARTICLES = ARTICLES;

export const BlogPage: React.FC<{ slug?: string; onNavigate: (route: string) => void }> = ({ slug, onNavigate }) => {
  const article = slug ? ARTICLES.find((item) => item.slug === slug) : undefined;

  if (article) {
    return (
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <button onClick={() => onNavigate('/blog')} className="text-xs text-indigo-300 hover:text-indigo-200 mb-8">
          ← Back to Blog
        </button>
        <div className="text-xs text-slate-500 font-mono mb-3">SAMEWINDOW / ENGINEERING</div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">{article.title}</h1>
        <p className="mt-5 text-lg text-slate-400 leading-relaxed">{article.description}</p>
        <div className="mt-4 text-xs text-slate-500">{article.readTime}</div>
        <div className="mt-12 space-y-7">
          {article.content.map((paragraph) => (
            <p key={paragraph} className="text-base leading-8 text-slate-300">{paragraph}</p>
          ))}
        </div>
        <div className="mt-12 rounded-xl border border-[#222b3b] bg-[#0d1118] p-6">
          <div className="text-sm font-semibold text-white">Debug the execution, not just the error.</div>
          <p className="mt-2 text-sm text-slate-400">Record AI agent runs, inspect tool calls, replay failures, and compare successful and failed executions.</p>
          <button onClick={() => onNavigate('/signup')} className="mt-4 px-4 py-2 rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500">Start Free</button>
        </div>
      </article>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="max-w-3xl">
        <div className="text-xs font-mono text-indigo-300 mb-3">ENGINEERING BLOG</div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">AI agent debugging, tracing, and production engineering</h1>
        <p className="mt-5 text-lg text-slate-400 leading-relaxed">Practical guides for debugging AI agents, tracing tool calls, replaying failed runs, and finding the first meaningful divergence in production.</p>
      </div>
      <div className="mt-12 grid md:grid-cols-2 gap-5">
        {ARTICLES.map((item) => (
          <button key={item.slug} onClick={() => onNavigate('/blog/' + item.slug)} className="text-left rounded-xl border border-[#222b3b] bg-[#0d1118] p-6 hover:border-indigo-500/40 hover:bg-[#101620] transition-colors">
            <div className="text-xs font-mono text-slate-500">{item.readTime}</div>
            <h2 className="mt-3 text-lg font-semibold text-white">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{item.description}</p>
            <div className="mt-5 text-xs text-indigo-300">Read article →</div>
          </button>
        ))}
      </div>
    </main>
  );
};
