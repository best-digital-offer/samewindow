import React, { useState } from 'react';
import {
  Layers,
  Filter,
  Search,
  Maximize2,
  Minimize2,
  AlertTriangle,
} from 'lucide-react';
import { EventType, RunEvent } from '../../types';
import { TimelineNode } from './TimelineNode';

interface RunTimelineProps {
  events: RunEvent[];
  currentReplayStepIndex?: number;
  divergenceEventIndex?: number;
}

export const RunTimeline: React.FC<RunTimelineProps> = ({
  events,
  currentReplayStepIndex,
  divergenceEventIndex,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | EventType>('ALL');
  const [query, setQuery] = useState('');
  const [forceExpand, setForceExpand] = useState<boolean | undefined>(undefined);

  const filteredEvents = events.filter((ev) => {
    if (filterType !== 'ALL' && ev.type !== filterType) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const titleMatch = ev.title.toLowerCase().includes(q);
      const dataMatch = JSON.stringify(ev.data).toLowerCase().includes(q);
      return titleMatch || dataMatch;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      {/* Timeline Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#171d28]">
        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0e121a] border border-[#1b2230] text-xs">
          {(
            [
              { label: 'All Events', type: 'ALL' },
              { label: 'Models', type: 'MODEL_CALL' },
              { label: 'Tools', type: 'TOOL_CALL' },
              { label: 'Errors', type: 'ERROR' },
            ] as const
          ).map((item) => (
            <button
              key={item.type}
              onClick={() => setFilterType(item.type)}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                filterType === item.type
                  ? 'bg-[#1b2230] text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search & Expand toggles */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search trace events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-7 pr-3 py-1 text-xs bg-[#0e121a] border border-[#1b2230] rounded-lg text-slate-300 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/50 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={() => setForceExpand((prev) => (prev === true ? false : true))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-[#0e121a] border border-[#1b2230] hover:border-[#263145] transition-colors"
            title={forceExpand ? 'Collapse All' : 'Expand All'}
          >
            {forceExpand ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Vertical Timeline container with continuous hairline connecting wire */}
      <div className="relative">
        {/* Continuous hairline wire running down the left */}
        <div className="absolute left-[6px] top-4 bottom-4 w-px bg-[#1d2535]" />

        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No events matched your filter.
            </div>
          ) : (
            filteredEvents.map((event, idx) => {
              const actualIndex = events.findIndex((e) => e.id === event.id);
              const isCurrentStep = currentReplayStepIndex === actualIndex;
              const isDivergence = divergenceEventIndex === actualIndex;

              return (
                <TimelineNode
                  key={event.id}
                  event={event}
                  isCurrentReplayStep={isCurrentStep}
                  isDivergencePoint={isDivergence}
                  defaultExpanded={forceExpand}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
