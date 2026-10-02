import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  trend,
}) => {
  return (
    <div className="p-4 rounded-xl bg-[#0d1017] border border-[#1b2230] hover:border-[#263145] transition-colors">
      <div className="text-xs text-slate-400 font-medium mb-1.5">{label}</div>
      <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
        {value}
      </div>
      {(subValue || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          {trend && (
            <span
              className={`font-mono font-medium ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
          {subValue && <span>{subValue}</span>}
        </div>
      )}
    </div>
  );
};
