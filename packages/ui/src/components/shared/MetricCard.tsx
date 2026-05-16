'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function MetricCard({
  label,
  value,
  unit,
  change,
  trend,
  icon,
  variant = 'default',
}: MetricCardProps) {
  const variantStyles = {
    default: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    success: 'bg-green-500/10 border-green-500/20 text-green-300',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
    danger: 'bg-red-500/10 border-red-500/20 text-red-300',
  };

  const trendColor = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  return (
    <div className={cn('rounded-lg border p-4', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white">{value}</p>
            {unit && <p className="text-sm text-gray-400">{unit}</p>}
          </div>
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5">
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className={cn('mt-3 flex items-center gap-1', trendColor[trend || 'neutral'])}>
          {trend === 'up' && <TrendingUp size={14} />}
          {trend === 'down' && <TrendingDown size={14} />}
          <span className="text-xs font-medium">
            {Math.abs(change)}% {trend === 'down' ? 'decrease' : 'increase'}
          </span>
        </div>
      )}
    </div>
  );
}
