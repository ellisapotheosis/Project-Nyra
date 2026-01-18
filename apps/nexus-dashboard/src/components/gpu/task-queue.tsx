'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';

export interface QueuedTask {
  id: string;
  modelName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  estimatedTime?: number;
  queuePosition?: number;
}

interface TaskQueueProps {
  tasks: QueuedTask[];
  maxDisplay?: number;
  className?: string;
}

const getStatusIcon = (status: QueuedTask['status']) => {
  switch (status) {
    case 'running':
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'failed':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
  }
};

const getStatusColor = (status: QueuedTask['status']) => {
  switch (status) {
    case 'running':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    case 'failed':
      return 'bg-red-500/10 text-red-700 dark:text-red-300';
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
  }
};

export function TaskQueue({
  tasks,
  maxDisplay = 5,
  className,
}: TaskQueueProps) {
  const displayTasks = tasks.slice(0, maxDisplay);
  const hasMore = tasks.length > maxDisplay;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Task Queue</h3>
        <Badge variant="secondary" className="text-xs">
          {tasks.length} tasks
        </Badge>
      </div>

      {tasks.length === 0 ? (
        <div className="py-4 text-center text-sm text-muted-foreground">
          No tasks in queue
        </div>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {displayTasks.map((task, index) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors text-sm"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getStatusIcon(task.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-muted-foreground">
                      #{task.queuePosition ?? index + 1}
                    </span>
                    <span className="truncate text-foreground">{task.modelName}</span>
                  </div>
                  {task.progress !== undefined && task.status === 'running' && (
                    <div className="mt-1 h-1 w-full bg-primary/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {task.estimatedTime && task.status === 'pending' && (
                  <span className="text-xs text-muted-foreground">
                    ~{(task.estimatedTime / 1000).toFixed(1)}s
                  </span>
                )}
                <Badge
                  className={cn('text-xs font-semibold', getStatusColor(task.status))}
                  variant="outline"
                >
                  {task.status}
                </Badge>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="py-2 text-center text-xs text-muted-foreground">
              +{tasks.length - maxDisplay} more tasks
            </div>
          )}
        </div>
      )}
    </div>
  );
}
