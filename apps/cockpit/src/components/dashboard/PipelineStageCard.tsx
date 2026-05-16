'use client';

import { Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineStageCardProps {
  stage: string;
  count: number;
  previousCount?: number;
  color?: 'purple' | 'blue' | 'cyan' | 'pink' | 'green';
  onClick?: () => void;
}

export function PipelineStageCard({
  stage,
  count,
  previousCount,
  color = 'purple',
  onClick,
}: PipelineStageCardProps) {
  const colorClasses = {
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
    pink: 'bg-pink-500/10 border-pink-500/20 text-pink-300',
    green: 'bg-green-500/10 border-green-500/20 text-green-300',
  };

  const change = previousCount !== undefined ? count - previousCount : undefined;

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg border p-4 text-left transition-all hover:scale-105 hover:shadow-lg',
        colorClasses[color],
        'hover:shadow-lg'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider opacity-70">
            {stage}
          </p>
          <p className="mt-2 text-3xl font-bold">{count}</p>
        </div>
        <Users size={24} className="opacity-50" />
      </div>

      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium">
          <TrendingUp size={12} />
          <span>{change > 0 ? '+' : ''}{change} this week</span>
        </div>
      )}
    </button>
  );
}
