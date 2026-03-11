'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Database,
  Activity,
  Clock,
  MoreVertical,
  Trash2,
  Edit,
  Power,
  PowerOff,
  PlayCircle
} from 'lucide-react';
import { EnhancedMCPServer } from '@/lib/types/mcp';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MCPServerCardProps {
  server: EnhancedMCPServer;
  onTest?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleEnabled?: () => void;
}

export function MCPServerCard({
  server,
  onTest,
  onEdit,
  onDelete,
  onToggleEnabled
}: MCPServerCardProps) {
  const statusColors = {
    online: 'default',
    offline: 'destructive',
    error: 'warning',
  } as const;

  const protocolBadgeColors = {
    stdio: 'default',
    sse: 'secondary',
    http: 'outline',
  } as const;

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      !server.enabled && 'opacity-60'
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{server.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={protocolBadgeColors[server.protocol]}>
              {server.protocol.toUpperCase()}
            </Badge>
            <Badge variant={statusColors[server.status]}>
              {server.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onTest && (
                  <DropdownMenuItem onClick={onTest}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Test Connection
                  </DropdownMenuItem>
                )}
                {onToggleEnabled && (
                  <DropdownMenuItem onClick={onToggleEnabled}>
                    {server.enabled ? (
                      <>
                        <PowerOff className="mr-2 h-4 w-4" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Power className="mr-2 h-4 w-4" />
                        Enable
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {server.description && (
            <p className="text-sm text-muted-foreground">{server.description}</p>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Tools Available
            </span>
            <span className="font-semibold">{server.toolsCount}</span>
          </div>

          {server.latency !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Latency
              </span>
              <span
                className={cn(
                  'font-semibold',
                  server.latency < 100
                    ? 'text-green-600 dark:text-green-400'
                    : server.latency < 300
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {server.latency}ms
              </span>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {server.lastCheck ? (
              <>Last checked: {new Date(server.lastCheck).toLocaleTimeString()}</>
            ) : (
              <>Never checked</>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Badge variant="outline" className="text-xs">
              {server.config.authType === 'none' ? 'No Auth' : server.config.authType.toUpperCase()}
            </Badge>
            {!server.enabled && (
              <Badge variant="secondary" className="text-xs">
                Disabled
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
