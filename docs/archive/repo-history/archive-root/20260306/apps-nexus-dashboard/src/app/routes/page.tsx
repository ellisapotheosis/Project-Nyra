'use client';

import { useEffect } from 'react';
import { ModelRouteConfig } from '@/components/model-route-config';
import { useNexusStore } from '@/lib/store';
import { NexusAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

export default function RoutesPage() {
  const { modelRoutes, setModelRoutes, updateModelRoute } = useNexusStore();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await NexusAPI.getModelRoutes();
        setModelRoutes(data);
      } catch (error) {
        console.error('Failed to fetch routes:', error);
        // Demo data
        setModelRoutes([
          {
            id: '1',
            pattern: '/v1/chat/completions',
            targetModel: 'gpt-4-turbo',
            priority: 10,
            enabled: true,
          },
          {
            id: '2',
            pattern: '/v1/embeddings',
            targetModel: 'text-embedding-3-large',
            priority: 8,
            enabled: true,
          },
          {
            id: '3',
            pattern: '/v1/images/generations',
            targetModel: 'dall-e-3',
            priority: 5,
            enabled: true,
          },
          {
            id: '4',
            pattern: '/v1/audio/transcriptions',
            targetModel: 'whisper-1',
            priority: 7,
            enabled: false,
          },
        ]);
      }
    };

    fetchRoutes();
  }, [setModelRoutes]);

  const handleUpdate = async (id: string, updates: any) => {
    try {
      await NexusAPI.updateModelRoute(id, updates);
      updateModelRoute(id, updates);
    } catch (error) {
      console.error('Failed to update route:', error);
      // Optimistic update even on error for demo
      updateModelRoute(id, updates);
    }
  };

  const handleRefresh = async () => {
    try {
      const data = await NexusAPI.getModelRoutes();
      setModelRoutes(data);
    } catch (error) {
      console.error('Failed to refresh routes:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Routes</h1>
          <p className="text-muted-foreground mt-1">
            Configure request routing patterns and target models
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Route
          </Button>
        </div>
      </div>

      <ModelRouteConfig routes={modelRoutes} onUpdate={handleUpdate} />

      {modelRoutes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No routes configured</p>
          <Button className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Route
          </Button>
        </div>
      )}
    </div>
  );
}
