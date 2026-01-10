'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Thermometer, Zap } from 'lucide-react';
import { GPUWorker } from '@/lib/store';
import { cn, formatBytes, formatPercentage } from '@/lib/utils';

interface GPUWorkerCardProps {
  worker: GPUWorker;
}

export function GPUWorkerCard({ worker }: GPUWorkerCardProps) {
  const statusColors = {
    active: 'success',
    idle: 'warning',
    offline: 'destructive',
  } as const;

  const vramPercentage = (worker.vramUsed / worker.vramTotal) * 100;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{worker.name}</CardTitle>
          </div>
          <Badge variant={statusColors[worker.status]}>
            {worker.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">
              GPU Model
            </div>
            <div className="text-sm font-semibold">{worker.gpuModel}</div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">VRAM Usage</span>
              <span className="font-semibold">
                {formatBytes(worker.vramUsed)} / {formatBytes(worker.vramTotal)}
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  vramPercentage > 90
                    ? 'bg-red-500'
                    : vramPercentage > 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                )}
                style={{ width: `${vramPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                <Zap className="h-3 w-3" />
                Utilization
              </div>
              <div className="text-lg font-bold">
                {formatPercentage(worker.utilization)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                <Thermometer className="h-3 w-3" />
                Temperature
              </div>
              <div
                className={cn(
                  'text-lg font-bold',
                  worker.temperature > 80
                    ? 'text-red-600'
                    : worker.temperature > 70
                    ? 'text-yellow-600'
                    : 'text-green-600'
                )}
              >
                {worker.temperature}°C
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tasks Processed</span>
              <span className="font-bold text-primary">{worker.tasksProcessed}</span>
            </div>
            {worker.currentModel && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Current Model</span>
                <span className="font-mono text-xs">{worker.currentModel}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
