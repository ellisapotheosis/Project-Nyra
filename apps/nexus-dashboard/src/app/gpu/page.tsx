'use client';

import { useEffect } from 'react';
import { GPUWorkerCard } from '@/components/gpu-worker-card';
import { useNexusStore } from '@/lib/store';
import { NexusAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';

export default function GPUPage() {
  const { gpuWorkers, setGPUWorkers } = useNexusStore();

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const data = await NexusAPI.getGPUWorkers();
        setGPUWorkers(data);
      } catch (error) {
        console.error('Failed to fetch GPU workers:', error);
        // Demo data
        setGPUWorkers([
          {
            id: '1',
            name: 'GPU Worker 1',
            status: 'active',
            gpuModel: 'NVIDIA RTX 4090',
            vramTotal: 24 * 1024 * 1024 * 1024,
            vramUsed: 18.5 * 1024 * 1024 * 1024,
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
            gpuModel: 'NVIDIA A100',
            vramTotal: 80 * 1024 * 1024 * 1024,
            vramUsed: 2.1 * 1024 * 1024 * 1024,
            utilization: 5.2,
            temperature: 42,
            tasksProcessed: 2156,
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

    return () => {
      ws.close();
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
            Monitor GPU worker status and performance metrics
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gpuWorkers.map((worker) => (
          <GPUWorkerCard key={worker.id} worker={worker} />
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
