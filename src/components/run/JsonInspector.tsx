import React, { useState } from 'react';
import { Copy, Check, Search, ChevronDown, ChevronRight } from 'lucide-react';

interface JsonInspectorProps {
  data: any;
  defaultExpanded?: boolean;
}

export const JsonInspector: React.FC<JsonInspectorProps> = ({
  data,
  defaultExpanded = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('');
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = jsonString.split('\n');
  const filteredLines = filter.trim()
    ? lines.filter((l) => l.toLowerCase().includes(filter.toLowerCase()))
    : lines;

  return (
    <div className="rounded-lg border border-[#1d2433] bg-[#07090d] text-xs font-mono overflow-hidden">
      {/* Top tool strip */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0b0e14] border-b border-[#1b2230] text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span>{isExpanded ? 'Collapse JSON' : 'Expand JSON'}</span>
          </button>
          <span className="text-slate-400">({lines.length} lines)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick search in JSON */}
          <div className="relative hidden sm:block">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find key/value..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-6 pr-2 py-0.5 text-[10px] bg-[#10141d] border border-[#202836] rounded text-slate-300 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500/50 w-28"
            />
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#161c28] text-slate-400 hover:text-white transition-colors"
            title="Copy Raw JSON"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code body */}
      {isExpanded && (
        <div className="p-3 overflow-x-auto max-h-80 text-slate-300 selection:bg-indigo-500/20">
          <pre className="text-[11px] leading-relaxed">
            {filteredLines.map((line, idx) => (
              <div key={idx} className="flex">
                <span className="w-8 shrink-0 text-slate-400 select-none text-right pr-3 font-mono">
                  {idx + 1}
                </span>
                <span className="flex-1 whitespace-pre">{line}</span>
              </div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
};
