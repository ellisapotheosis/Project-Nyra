'use client';

import { cn } from '@/lib/utils';
import { Thermometer } from 'lucide-react';

interface TemperatureGaugeProps {
  temperature: number;
  className?: string;
}

const getTemperatureColor = (temp: number) => {
  if (temp >= 80) return { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400' };
  if (temp >= 70) return { bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' };
  return { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
};

const getTemperatureStatus = (temp: number) => {
  if (temp >= 80) return 'Critical';
  if (temp >= 70) return 'Warning';
  return 'Optimal';
};

export function TemperatureGauge({ temperature, className }: TemperatureGaugeProps) {
  const colors = getTemperatureColor(temperature);
  const status = getTemperatureStatus(temperature);

  // Normalize temperature for visual gauge (0-100°C)
  const normalizedTemp = Math.min(temperature, 100);
  const percentage = (normalizedTemp / 100) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Temperature</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-2xl font-bold', colors.text)}>{temperature}</span>
          <span className="text-xs text-muted-foreground">°C</span>
        </div>
      </div>

      {/* Circular gauge representation */}
      <div className="relative w-full h-12 bg-secondary rounded-full overflow-hidden">
        <div className="absolute inset-0 flex items-center px-3">
          <div className="flex-1 relative h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
            {/* Cold zone (green) */}
            <div className="absolute left-0 top-0 h-full w-1/3 bg-emerald-500/30" />
            {/* Warm zone (yellow) */}
            <div className="absolute left-1/3 top-0 h-full w-1/3 bg-yellow-500/30" />
            {/* Hot zone (red) */}
            <div className="absolute right-0 top-0 h-full w-1/3 bg-red-500/30" />

            {/* Indicator */}
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-300',
                colors.bg
              )}
              style={{ left: `calc(${percentage}% - 6px)` }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>0°C</span>
        <span className="text-center">50°C</span>
        <span className="text-right">100°C</span>
      </div>

      <div className="inline-block">
        <span
          className={cn(
            'px-2 py-1 text-xs font-semibold rounded-md',
            temperature >= 80
              ? 'bg-red-500/20 text-red-700 dark:text-red-300'
              : temperature >= 70
              ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
              : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
          )}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
