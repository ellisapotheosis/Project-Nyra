'use client';

import { useEffect, useState } from 'react';
import { WorkerCard } from '@/components/gpu/worker-card';
import { useNexusStore } from '@/lib/store';
import { NexusAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import type { QueuedTask } from '@/components/gpu/task-queue';

// Mock task queue data - in production, this would come from the API
const mockTaskQueues: Record<string, QueuedTask[]> = {
  '1': [
    {
      id: '1-1',
      modelName: 'llama-3.1-70b',
      status: 'running',
      progress: 65,
      queuePosition: 1,
    },
    {
      id: '1-2',
      modelName: 'mistral-7b',
      status: 'pending',
      estimatedTime: 2400,
      queuePosition: 2,
    },
    {
      id: '1-3',
      modelName: 'neural-chat-7b',
      status: 'pending',
      estimatedTime: 5200,
      queuePosition: 3,
    },
  ],
  '2': [
    {
      id: '2-1',
      modelName: 'mixtral-8x7b',
      status: 'running',
      progress: 42,
      queuePosition: 1,
    },
    {
      id: '2-2',
      modelName: 'llama-3.1-70b',
      status: 'pending',
      estimatedTime: 3100,
      queuePosition: 2,
    },
  ],
  '3': [],
};

export default function GPUPage() {
  const { gpuWorkers, setGPUWorkers } = useNexusStore();
  const [taskQueues, setTaskQueues] = useState<Record<string, QueuedTask[]>>(mockTaskQueues);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const data = await NexusAPI.getGPUWorkers();
        setGPUWorkers(data);
      } catch (error) {
        console.error('Failed to fetch GPU workers:', error);
        // Demo data with realistic GPU models
        setGPUWorkers([
          {
            id: '1',
            name: 'GPU Worker 1',
            status: 'active',
            gpuModel: 'NVIDIA RTX 5090',
            vramTotal: 32 * 1024 * 1024 * 1024,
            vramUsed: 24.3 * 1024 * 1024 * 1024,
            utilization: 87.5,
            temperature: 72,
            tasksProcessed: 1243,
            currentModel: 'llama-3.1-70b',
          },
          {
            id: '2',
            name: 'GPU Worker 2',
            status: 'active',
            gpuModel: 'NVIDIA RTX 4090',
            vramTotal: 24 * 1024 * 1024 * 1024,
            vramUsed: 15.2 * 1024 * 1024 * 1024,
            utilization: 65.3,
            temperature: 68,
            tasksProcessed: 987,
            currentModel: 'mixtral-8x7b',
          },
          {
            id: '3',
            name: 'GPU Worker 3',
            status: 'idle',
            gpuModel: 'NVIDIA RTX 3090',
            vramTotal: 24 * 1024 * 1024 * 1024,
            vramUsed: 2.1 * 1024 * 1024 * 1024,
            utilization: 5.2,
            temperature: 42,
            tasksProcessed: 2156,
            currentModel: undefined,
          },
          {
            id: '4',
            name: 'GPU Worker 4',
            status: 'offline',
            gpuModel: 'NVIDIA RTX 3060',
            vramTotal: 12 * 1024 * 1024 * 1024,
            vramUsed: 0,
            utilization: 0,
            temperature: 0,
            tasksProcessed: 543,
            currentModel: undefined,
          },
        ]);
      }
    };

    fetchWorkers();

    // Real-time updates via WebSocket
    const ws = NexusAPI.connectWebSocket((data) => {
      if (data.type === 'gpu_update') {
        setGPUWorkers(data.payload);
      }
    });

    // Simulate real-time task queue updates
    const taskUpdateInterval = setInterval(() => {
      setTaskQueues((prev) => {
        const updated = { ...prev };
        // Simulate progress updates
        Object.keys(updated).forEach((workerId) => {
          updated[workerId] = updated[workerId].map((task) => {
            if (task.status === 'running' && task.progress !== undefined) {
              const newProgress = Math.min(task.progress + Math.random() * 5, 100);
              if (newProgress >= 100) {
                return {
                  ...task,
                  status: 'completed' as const,
                  progress: 100,
                };
              }
              return { ...task, progress: newProgress };
            }
            return task;
          });
        });
        return updated;
      });
    }, 2000);

    return () => {
      ws.close();
      clearInterval(taskUpdateInterval);
    };
  }, [setGPUWorkers]);

  const handleRefresh = async () => {
    try {
      const data = await NexusAPI.getGPUWorkers();
      setGPUWorkers(data);
    } catch (error) {
      console.error('Failed to refresh GPU workers:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GPU Workers</h1>
          <p className="text-muted-foreground mt-1">
            Monitor GPU worker status, performance metrics, and task queues
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Worker
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Workers</p>
          <p className="text-2xl font-bold mt-1">{gpuWorkers.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
            {gpuWorkers.filter((w) => w.status === 'active').length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Idle</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">
            {gpuWorkers.filter((w) => w.status === 'idle').length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg Temperature</p>
          <p className="text-2xl font-bold mt-1">
            {gpuWorkers.length > 0
              ? (
                  gpuWorkers.reduce((sum, w) => sum + w.temperature, 0) / gpuWorkers.length
                ).toFixed(1)
              : '0'}
            °C
          </p>
        </div>
      </div>

      {/* Worker Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {gpuWorkers.map((worker) => (
          <WorkerCard
            key={worker.id}
            worker={worker}
            tasks={taskQueues[worker.id] || []}
          />
        ))}
      </div>

      {gpuWorkers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No GPU workers configured</p>
          <Button className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Worker
          </Button>
        </div>
      )}
    </div>
  );
}
