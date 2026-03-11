'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Activity, Clock, Settings } from 'lucide-react';
import { AIProvider } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ProviderCardProps {
  provider: AIProvider;
  onTest?: () => void;
  onToggle?: (enabled: boolean) => void;
  onClick?: () => void;
}

export function ProviderCard({ provider, onTest, onToggle, onClick }: ProviderCardProps) {
  const statusColors = {
    online: 'default',
    offline: 'secondary',
    error: 'destructive',
  } as const;

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'anthropic':
        return '🔮';
      case 'openai':
        return '🤖';
      case 'google':
        return '🔍';
      case 'aws-bedrock':
        return '☁️';
      case 'openrouter':
        return '🔀';
      case 'meta':
        return '🦙';
      case 'cohere':
        return '💬';
      default:
        return '🔧';
    }
  };

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md cursor-pointer",
        !provider.enabled && "opacity-60"
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getProviderIcon(provider.type)}</span>
            <CardTitle className="text-lg">{provider.name}</CardTitle>
          </div>
          <Badge variant={statusColors[provider.status]}>
            {provider.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <span className="font-mono text-xs capitalize">{provider.type}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Token Forwarding
            </span>
            <Badge variant={provider.tokenForwarding ? 'default' : 'secondary'} className="text-xs">
              {provider.tokenForwarding ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Settings className="h-3 w-3" />
              API Key
            </span>
            <span className="font-mono text-xs">
              {provider.apiKey ? '••••••••' : 'Not set'}
            </span>
          </div>

          {provider.lastHealthCheck && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last check: {new Date(provider.lastHealthCheck).toLocaleTimeString()}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Switch
                checked={provider.enabled}
                onCheckedChange={(checked) => {
                  onToggle?.(checked);
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm text-muted-foreground">
                {provider.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {onTest && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onTest();
                }}
              >
                Test
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
