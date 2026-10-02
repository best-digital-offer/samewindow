import React, { useState } from 'react';
import {
  MessageSquare,
  Cpu,
  Wrench,
  AlertOctagon,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Code2,
  FileText,
} from 'lucide-react';
import { RunEvent } from '../../types';
import { JsonInspector } from './JsonInspector';

interface TimelineNodeProps {
  event: RunEvent;
  isCurrentReplayStep?: boolean;
  isDivergencePoint?: boolean;
  divergenceNote?: string;
  defaultExpanded?: boolean;
}

export const TimelineNode: React.FC<TimelineNodeProps> = ({
  event,
  isCurrentReplayStep = false,
  isDivergencePoint = false,
  divergenceNote,
  defaultExpanded = false,
}) => {
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(
    defaultExpanded || event.type === 'ERROR' || (event.statusCode && event.statusCode >= 400)
  );
  const [viewMode, setViewMode] = useState<'HUMAN' | 'JSON'>('HUMAN');

  React.useEffect(() => {
    if (isCurrentReplayStep) {
      setIsExpanded(true);
      nodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isCurrentReplayStep]);

  // Format offset ms to mm:ss.fff
  const formatOffset = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const millis = ms % 1000;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  };

  const getEventIcon = () => {
    switch (event.type) {
      case 'USER_INPUT':
        return <MessageSquare className="w-3.5 h-3.5 text-sky-400" />;
      case 'MODEL_CALL':
        return <Cpu className="w-3.5 h-3.5 text-indigo-400" />;
      case 'TOOL_CALL':
        return event.statusCode && event.statusCode >= 400 ? (
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
        ) : (
          <Wrench className="w-3.5 h-3.5 text-emerald-400" />
        );
      case 'ERROR':
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />;
      case 'FINAL_RESPONSE':
        return <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`relative pl-7 transition-all duration-200 ${
        isCurrentReplayStep ? 'scale-[1.01]' : ''
      }`}
    >
      {/* Node Bullet point on the vertical timeline wire */}
      <div
        className={`absolute left-0 top-3.5 w-3.5 h-3.5 -translate-x-[7px] rounded-full border flex items-center justify-center transition-colors ${
          isDivergencePoint
            ? 'bg-rose-600 border-rose-400 ring-4 ring-rose-500/20'
            : isCurrentReplayStep
            ? 'bg-indigo-600 border-white ring-4 ring-indigo-500/30'
            : event.type === 'ERROR' || (event.statusCode && event.statusCode >= 400)
            ? 'bg-rose-950 border-rose-500'
            : 'bg-[#121620] border-[#293345]'
        }`}
      />

      {/* Divergence alert banner if this node is the first branch */}
      {isDivergencePoint && (
        <div className="mb-2 p-2 rounded-lg bg-rose-950/40 border border-rose-700/50 text-xs text-rose-300 font-mono flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              First Meaningful Divergence Detected
            </span>
          </div>
          {divergenceNote && <span className="text-[11px] text-rose-200">{divergenceNote}</span>}
        </div>
      )}

      {/* Card container */}
      <div
        className={`rounded-xl border transition-all ${
          isDivergencePoint
            ? 'border-rose-500/60 bg-[#12080a]'
            : isCurrentReplayStep
            ? 'border-indigo-500 bg-[#0f1422] shadow-lg shadow-indigo-950/30'
            : 'border-[#1b2230] bg-[#0c0f16] hover:border-[#283347]'
        }`}
      >
        {/* Header summary row */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3.5 flex items-center justify-between cursor-pointer select-none gap-3"
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="p-1 rounded bg-[#131822] border border-[#202836] shrink-0">
              {getEventIcon()}
            </div>
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-semibold text-slate-100 truncate">
                {event.title}
              </span>
              {event.statusCode && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                    event.statusCode < 400
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                      : 'bg-rose-950/70 text-rose-300 border-rose-800/50 font-bold'
                  }`}
                >
                  {event.statusCode}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {event.durationMs !== undefined && event.durationMs > 0 && (
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                {event.durationMs}ms
              </span>
            )}
            <span className="text-[11px] font-mono text-slate-400 tabular-nums bg-[#10141d] px-1.5 py-0.5 rounded border border-[#1b2230]">
              +{formatOffset(event.offsetMs)}
            </span>
            <div className="text-slate-400">
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </div>
          </div>
        </div>

        {/* Expanded detail section */}
        {isExpanded && (
          <div className="px-3.5 pb-3.5 pt-1 border-t border-[#181f2c] space-y-3">
            {/* View switcher: Human View vs Raw JSON */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#080a0e] border border-[#1b2230]">
                <button
                  onClick={() => setViewMode('HUMAN')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                    viewMode === 'HUMAN'
                      ? 'bg-[#18202e] text-white font-medium shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Human View</span>
                </button>
                <button
                  onClick={() => setViewMode('JSON')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                    viewMode === 'JSON'
                      ? 'bg-[#18202e] text-white font-medium shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  <span>Raw JSON</span>
                </button>
              </div>
            </div>

            {/* Body */}
            {viewMode === 'JSON' ? (
              <JsonInspector data={event.data} />
            ) : (
              <div className="space-y-2.5 text-xs text-slate-300">
                {/* USER INPUT VIEW */}
                {event.type === 'USER_INPUT' && (
                  <div className="p-3 rounded-lg bg-[#080b10] border border-[#1a212e] text-slate-200 leading-relaxed font-sans">
                    <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">Prompt Query</div>
                    {event.data.userInput}
                  </div>
                )}

                {/* MODEL CALL VIEW */}
                {event.type === 'MODEL_CALL' && event.data.modelCall && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded bg-[#080b10] border border-[#1a212e]">
                        <span className="text-slate-400 block text-[10px]">Model</span>
                        <span className="text-indigo-300 font-semibold">{event.data.modelCall.model}</span>
                      </div>
                      <div className="p-2 rounded bg-[#080b10] border border-[#1a212e]">
                        <span className="text-slate-400 block text-[10px]">Input Tokens</span>
                        <span className="text-slate-200 tabular-nums">{event.data.modelCall.inputTokens}</span>
                      </div>
                      <div className="p-2 rounded bg-[#080b10] border border-[#1a212e]">
                        <span className="text-slate-400 block text-[10px]">Output Tokens</span>
                        <span className="text-slate-200 tabular-nums">{event.data.modelCall.outputTokens}</span>
                      </div>
                      <div className="p-2 rounded bg-[#080b10] border border-[#1a212e]">
                        <span className="text-slate-400 block text-[10px]">Latency</span>
                        <span className="text-slate-200 tabular-nums">{event.data.modelCall.latencyMs}ms</span>
                      </div>
                    </div>

                    {event.data.modelCall.promptPreview && (
                      <div className="p-2.5 rounded bg-[#080b10] border border-[#1a212e]">
                        <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">System & Context</div>
                        <div className="text-slate-300 font-mono text-[11px] leading-relaxed line-clamp-2">
                          {event.data.modelCall.promptPreview}
                        </div>
                      </div>
                    )}

                    {event.data.modelCall.responsePreview && (
                      <div className="p-2.5 rounded bg-[#080b10] border border-[#1a212e]">
                        <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">Model Decision</div>
                        <div className="text-slate-200 font-mono text-[11px] leading-relaxed">
                          {event.data.modelCall.responsePreview}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TOOL CALL VIEW */}
                {event.type === 'TOOL_CALL' && event.data.toolCall && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs pb-1">
                      <span className="font-mono text-slate-300">
                        Tool: <strong className="text-white">{event.data.toolCall.toolName}</strong>
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        Latency: {event.data.toolCall.latencyMs}ms
                      </span>
                    </div>

                    {/* Arguments */}
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">Arguments</div>
                      <JsonInspector data={event.data.toolCall.arguments} defaultExpanded={false} />
                    </div>

                    {/* Response */}
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">Response Payload</div>
                      <JsonInspector data={event.data.toolCall.response} defaultExpanded={true} />
                    </div>
                  </div>
                )}

                {/* ERROR VIEW */}
                {event.type === 'ERROR' && event.data.error && (
                  <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-300 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Error Type: {event.data.error.errorType}</span>
                      {event.data.error.statusCode && (
                        <span className="font-mono text-[11px]">HTTP {event.data.error.statusCode}</span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-rose-200">
                      {event.data.error.message}
                    </div>
                    {event.data.error.culpritTool && (
                      <div className="text-[11px] text-rose-400">
                        Culprit Tool: <code className="font-mono">{event.data.error.culpritTool}</code>
                      </div>
                    )}
                  </div>
                )}

                {/* FINAL RESPONSE VIEW */}
                {event.type === 'FINAL_RESPONSE' && (
                  <div className="p-3 rounded-lg bg-[#080b10] border border-[#1a212e] text-slate-200 leading-relaxed font-sans">
                    <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">Final Agent Output</div>
                    {event.data.finalResponse}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
