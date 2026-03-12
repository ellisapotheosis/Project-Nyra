'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VRAMGauge } from './vram-gauge';
import { TemperatureGauge } from './temperature-gauge';
import { TaskQueue, type QueuedTask } from './task-queue';
import { Progress } from '@/components/ui/progress';
import { GPUWorker } from '@/lib/store';
import { cn, formatPercentage } from '@/lib/utils';
import { Cpu, Zap, Gauge3, CheckCircle2 } from 'lucide-react';

interface WorkerCardProps {
  worker: GPUWorker;
  tasks?: QueuedTask[];
}

export function WorkerCard({ worker, tasks = [] }: WorkerCardProps) {
  const statusColors = {
    active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    idle: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    offline: 'bg-red-500/10 text-red-700 dark:text-red-300',
  } as const;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-xl">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{worker.name}</CardTitle>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {worker.gpuModel}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn('text-xs font-semibold flex-shrink-0', statusColors[worker.status])}
          >
            {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* VRAM Gauge */}
        <div>
          <VRAMGauge used={worker.vramUsed} total={worker.vramTotal} />
        </div>

        {/* Temperature Gauge */}
        <div>
          <TemperatureGauge temperature={worker.temperature} />
        </div>

        {/* Utilization and Tasks */}
        <div className="space-y-3 pt-2 border-t">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Utilization</span>
              </div>
              <span className="text-sm font-bold text-primary">
                {formatPercentage(worker.utilization)}
              </span>
            </div>
            <Progress value={worker.utilization} className="h-2" />
          </div>

          {/* Current Model Badge */}
          {worker.currentModel && (
            <div className="flex items-center gap-2">
              <Gauge3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Model:</span>
              <Badge variant="secondary" className="text-xs font-mono">
                {worker.currentModel}
              </Badge>
            </div>
          )}

          {/* Tasks Processed */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Processed:</span>
            <span className="text-xs font-bold text-foreground">
              {worker.tasksProcessed.toLocaleString()} tasks
            </span>
          </div>
        </div>

        {/* Task Queue */}
        {tasks.length > 0 && (
          <div className="pt-2 border-t">
            <TaskQueue tasks={tasks} maxDisplay={3} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
