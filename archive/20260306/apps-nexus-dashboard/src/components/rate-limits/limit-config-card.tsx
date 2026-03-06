'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface LimitConfig {
  enabled: boolean;
  window: number;
  maxRequests: number;
}

interface PerServerConfig extends LimitConfig {
  serverId?: string;
}

interface PerToolConfig extends LimitConfig {
  toolId?: string;
}

interface LimitConfigCardProps {
  title: string;
  description?: string;
  type: 'global' | 'per-ip' | 'per-server' | 'per-tool';
  config: LimitConfig | PerServerConfig | PerToolConfig;
  onConfigChange: (config: LimitConfig | PerServerConfig | PerToolConfig) => void;
  servers?: Array<{ id: string; name: string }>;
  tools?: Array<{ id: string; name: string }>;
}

export function LimitConfigCard({
  title,
  description,
  type,
  config,
  onConfigChange,
  servers = [],
  tools = [],
}: LimitConfigCardProps) {
  const isServerOrTool = type === 'per-server' || type === 'per-tool';
  const serverConfig = config as PerServerConfig;
  const toolConfig = config as PerToolConfig;

  return (
    <Card className="transition-all hover:shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) =>
              onConfigChange({ ...config, enabled })
            }
          />
        </div>
      </CardHeader>

      {config.enabled && (
        <CardContent className="space-y-4">
          {/* Server/Tool Selector */}
          {type === 'per-server' && servers.length > 0 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Server</label>
                <Select
                  value={serverConfig.serverId || ''}
                  onValueChange={(serverId) =>
                    onConfigChange({ ...config, serverId } as PerServerConfig)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a server..." />
                  </SelectTrigger>
                  <SelectContent>
                    {servers.map((server) => (
                      <SelectItem key={server.id} value={server.id}>
                        {server.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
            </>
          )}

          {type === 'per-tool' && tools.length > 0 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Tool</label>
                <Select
                  value={toolConfig.toolId || ''}
                  onValueChange={(toolId) =>
                    onConfigChange({ ...config, toolId } as PerToolConfig)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tool..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tools.map((tool) => (
                      <SelectItem key={tool.id} value={tool.id}>
                        {tool.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
            </>
          )}

          {/* Window Configuration */}
          <div className="space-y-2">
            <label htmlFor={`window-${type}`} className="text-sm font-medium">
              Time Window (seconds)
            </label>
            <Input
              id={`window-${type}`}
              type="number"
              min="1"
              max="3600"
              value={config.window}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  window: parseInt(e.target.value, 10),
                })
              }
              placeholder="60"
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              Time period over which requests are counted (1-3600 seconds)
            </p>
          </div>

          {/* Max Requests Configuration */}
          <div className="space-y-2">
            <label htmlFor={`max-${type}`} className="text-sm font-medium">
              Maximum Requests
            </label>
            <Input
              id={`max-${type}`}
              type="number"
              min="1"
              max="100000"
              value={config.maxRequests}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  maxRequests: parseInt(e.target.value, 10),
                })
              }
              placeholder="100"
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              Number of requests allowed per window (1-100000)
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
