'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Activity, Clock, Settings } from 'lucide-react';
import { MCPServer } from '@/lib/store';
import { cn } from '@/lib/utils';
import { ServerConfigDialog } from './mcp/server-config-dialog';

interface ServerCardProps {
  server: MCPServer;
  onTest?: () => void;
}

export function ServerCard({ server, onTest }: ServerCardProps) {
  const [configOpen, setConfigOpen] = useState(false);
  const statusColors = {
    online: 'success',
    offline: 'destructive',
    error: 'warning',
  } as const;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{server.name}</CardTitle>
          </div>
          <Badge variant={statusColors[server.status]}>
            {server.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">URL</span>
            <span className="font-mono text-xs">{server.url}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Tools Available
            </span>
            <span className="font-semibold">{server.tools}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Latency
            </span>
            <span
              className={cn(
                'font-semibold',
                server.latency < 100
                  ? 'text-green-600'
                  : server.latency < 300
                  ? 'text-yellow-600'
                  : 'text-red-600'
              )}
            >
              {server.latency}ms
            </span>
          </div>

          <div className="text-xs text-muted-foreground">
            Last checked: {new Date(server.lastCheck).toLocaleTimeString()}
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfigOpen(true)}>
              <Settings className="h-4 w-4 mr-1" />
              Configure
            </Button>
            {onTest && (
              <Button variant="outline" size="sm" className="flex-1" onClick={onTest}>
                Test Connection
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <ServerConfigDialog
        server={server}
        open={configOpen}
        onOpenChange={setConfigOpen}
        onSave={(headers) => {
          console.log('Headers saved for', server.name, ':', headers);
        }}
      />
    </Card>
  );
}
