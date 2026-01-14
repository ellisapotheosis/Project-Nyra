'use client';

import { useEffect } from 'react';
import { ServerCard } from '@/components/server-card';
import { useNexusStore } from '@/lib/store';
import { NexusAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

export default function ServersPage() {
  const { servers, setServers } = useNexusStore();

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const data = await NexusAPI.getServers();
        setServers(data);
      } catch (error) {
        console.error('Failed to fetch servers:', error);
        // Demo data
        setServers([
          {
            id: '1',
            name: 'Primary MCP Server',
            status: 'online',
            url: 'http://localhost:3000',
            tools: 42,
            latency: 45,
            lastCheck: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Secondary MCP Server',
            status: 'online',
            url: 'http://localhost:3001',
            tools: 38,
            latency: 62,
            lastCheck: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Development Server',
            status: 'offline',
            url: 'http://localhost:3002',
            tools: 15,
            latency: 999,
            lastCheck: new Date(Date.now() - 300000).toISOString(),
          },
        ]);
      }
    };

    fetchServers();
  }, [setServers]);

  const handleRefresh = async () => {
    try {
      const data = await NexusAPI.getServers();
      setServers(data);
    } catch (error) {
      console.error('Failed to refresh servers:', error);
    }
  };

  const handleTestServer = async (serverId: string) => {
    try {
      await NexusAPI.testServer(serverId);
    } catch (error) {
      console.error('Failed to test server:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MCP Servers</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your Model Context Protocol servers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Server
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servers.map((server) => (
          <ServerCard
            key={server.id}
            server={server}
            onTest={() => handleTestServer(server.id)}
          />
        ))}
      </div>

      {servers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No servers configured</p>
          <Button className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Server
          </Button>
        </div>
      )}
    </div>
  );
}
