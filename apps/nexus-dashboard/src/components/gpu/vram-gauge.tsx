'use client';

import { cn, formatBytes } from '@/lib/utils';

interface VRAMGaugeProps {
  used: number;
  total: number;
  className?: string;
}

export function VRAMGauge({ used, total, className }: VRAMGaugeProps) {
  const percentage = (used / total) * 100;

  const getColor = (percent: number) => {
    if (percent > 90) return 'bg-red-500';
    if (percent > 70) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getTextColor = (percent: number) => {
    if (percent > 90) return 'text-red-600 dark:text-red-400';
    if (percent > 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">VRAM Usage</span>
        <span className={cn('font-bold', getTextColor(percentage))}>
          {percentage.toFixed(1)}%
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{formatBytes(used)}</span>
        <span>{formatBytes(total)}</span>
      </div>

      <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', getColor(percentage))}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 rounded-full shadow-inner" />
      </div>

      <div className="flex gap-2 text-xs text-muted-foreground pt-1">
        <span>Free: {formatBytes(total - used)}</span>
      </div>
    </div>
  );
}
