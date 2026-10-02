import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { RunEvent } from '../../types';

interface ReplayControllerProps {
  events: RunEvent[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onCloseReplay: () => void;
}

export const ReplayController: React.FC<ReplayControllerProps> = ({
  events,
  currentStepIndex,
  onStepChange,
  onCloseReplay,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);

  // Playback loop
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      if (currentStepIndex >= events.length - 1) {
        setIsPlaying(false);
      } else {
        const interval = 1200 / speed;
        timer = setTimeout(() => {
          onStepChange(currentStepIndex + 1);
        }, interval);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, events.length, speed, onStepChange]);

  const currentEvent = events[currentStepIndex];

  return (
    <div className="sticky bottom-6 z-30 max-w-2xl mx-auto px-4 w-full">
      <div className="p-3 rounded-xl bg-[#0e121a]/95 backdrop-blur-md border border-indigo-500/40 shadow-2xl flex flex-col gap-2.5">
        {/* Top Info row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="font-mono text-indigo-300 font-semibold uppercase tracking-wider text-[11px]">
              Replay Mode Active
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300 font-mono text-[11px]">
              Step {currentStepIndex + 1} of {events.length}
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            {currentEvent ? currentEvent.title : 'Ready'}
          </div>
        </div>

        {/* Scrubber slider */}
        <input
          type="range"
          min={0}
          max={events.length - 1}
          value={currentStepIndex}
          onChange={(e) => onStepChange(Number(e.target.value))}
          className="w-full h-1.5 bg-[#1b2230] rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />

        {/* Controls row */}
        <div className="flex items-center justify-between pt-1">
          {/* Left: Restart */}
          <button
            onClick={() => onStepChange(0)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a212e] transition-colors"
            title="Reset to Start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Center Playback buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1a212e] disabled:opacity-30 transition-colors"
              title="Previous Step"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={() => onStepChange(Math.min(events.length - 1, currentStepIndex + 1))}
              disabled={currentStepIndex === events.length - 1}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1a212e] disabled:opacity-30 transition-colors"
              title="Next Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Speed pills + Exit */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded bg-[#131722] border border-[#202836] text-[10px] font-mono">
              {[0.5, 1, 2, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    speed === s ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button
              onClick={onCloseReplay}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-[#1a212e] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
