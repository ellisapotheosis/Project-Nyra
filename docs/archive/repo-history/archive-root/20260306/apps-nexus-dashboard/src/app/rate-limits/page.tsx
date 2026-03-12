'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LimitConfigCard } from '@/components/rate-limits/limit-config-card';
import { LimitStats } from '@/components/rate-limits/limit-stats';
import { Save, AlertCircle, Plus, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface RedisNode {
  id: string;
  url: string;
}

// Mock data - in production, this would come from an API
const mockServers = [
  { id: 'server-1', name: 'Main Server - US-East' },
  { id: 'server-2', name: 'Backup Server - US-West' },
  { id: 'server-3', name: 'EU Server - Frankfurt' },
];

const mockTools = [
  { id: 'tool-1', name: 'GPT-4 Turbo' },
  { id: 'tool-2', name: 'Claude 3 Opus' },
  { id: 'tool-3', name: 'Text Embedding Ada' },
  { id: 'tool-4', name: 'Vision API' },
];

const mockStats = [
  {
    id: 'global',
    label: 'Global Rate Limit',
    currentUsage: 8750,
    maxLimit: 10000,
    requestsRemaining: 1250,
    resetAt: new Date(Date.now() + 45 * 60 * 1000),
    trend: { direction: 'up' as const, percentage: 12 },
  },
  {
    id: 'ip-avg',
    label: 'Per-IP Average',
    currentUsage: 245,
    maxLimit: 500,
    requestsRemaining: 255,
    resetAt: new Date(Date.now() + 52 * 60 * 1000),
    trend: { direction: 'down' as const, percentage: 3 },
  },
  {
    id: 'server-us-east',
    label: 'US-East Server Limit',
    currentUsage: 4200,
    maxLimit: 5000,
    requestsRemaining: 800,
    resetAt: new Date(Date.now() + 38 * 60 * 1000),
    trend: { direction: 'up' as const, percentage: 8 },
  },
  {
    id: 'tool-gpt4',
    label: 'GPT-4 Turbo Limit',
    currentUsage: 1890,
    maxLimit: 2000,
    requestsRemaining: 110,
    resetAt: new Date(Date.now() + 28 * 60 * 1000),
    trend: { direction: 'up' as const, percentage: 15 },
  },
];

export default function RateLimitsPage() {
  const [backend, setBackend] = useState<'memory' | 'redis'>('memory');
  const [useRedis, setUseRedis] = useState(false);
  const [redisNodes, setRedisNodes] = useState<RedisNode[]>([
    { id: '1', url: 'redis://localhost:6379' },
  ]);

  const [globalConfig, setGlobalConfig] = useState<LimitConfig>({
    enabled: true,
    window: 60,
    maxRequests: 10000,
  });

  const [perIpConfig, setPerIpConfig] = useState<LimitConfig>({
    enabled: true,
    window: 60,
    maxRequests: 500,
  });

  const [perServerConfigs, setPerServerConfigs] = useState<PerServerConfig[]>([
    { enabled: true, window: 60, maxRequests: 5000, serverId: 'server-1' },
    { enabled: true, window: 60, maxRequests: 5000, serverId: 'server-2' },
  ]);

  const [perToolConfigs, setPerToolConfigs] = useState<PerToolConfig[]>([
    { enabled: true, window: 60, maxRequests: 2000, toolId: 'tool-1' },
    { enabled: true, window: 60, maxRequests: 1500, toolId: 'tool-2' },
  ]);

  const [allowOverrides, setAllowOverrides] = useState(true);
  const [overriddenUsers, setOverriddenUsers] = useState<
    Array<{ id: string; multiplier: number }>
  >([
    { id: 'premium-user-1', multiplier: 2 },
    { id: 'premium-user-2', multiplier: 1.5 },
  ]);

  const addRedisNode = () => {
    setRedisNodes([
      ...redisNodes,
      { id: String(Date.now()), url: '' },
    ]);
  };

  const removeRedisNode = (id: string) => {
    setRedisNodes(redisNodes.filter((node) => node.id !== id));
  };

  const updateRedisNode = (id: string, url: string) => {
    setRedisNodes(
      redisNodes.map((node) => (node.id === id ? { ...node, url } : node))
    );
  };

  const addServerConfig = () => {
    setPerServerConfigs([
      ...perServerConfigs,
      { enabled: true, window: 60, maxRequests: 5000, serverId: '' },
    ]);
  };

  const removeServerConfig = (index: number) => {
    setPerServerConfigs(perServerConfigs.filter((_, i) => i !== index));
  };

  const addToolConfig = () => {
    setPerToolConfigs([
      ...perToolConfigs,
      { enabled: true, window: 60, maxRequests: 2000, toolId: '' },
    ]);
  };

  const removeToolConfig = (index: number) => {
    setPerToolConfigs(perToolConfigs.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const config = {
        backend: useRedis ? 'redis' : 'memory',
        redisCluster: useRedis ? redisNodes : undefined,
        global: globalConfig,
        perIp: perIpConfig,
        perServer: perServerConfigs,
        perTool: perToolConfigs,
        allowOverrides,
        overriddenUsers,
      };
      console.log('Saving config:', config);
      // In production, this would call an API
      // await api.saveRateLimitConfig(config);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rate Limiting</h1>
          <p className="text-muted-foreground mt-1">
            Configure and monitor API rate limit settings
          </p>
        </div>
        <Button onClick={handleSave} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>

      <Tabs defaultValue="configuration" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="overrides">User Overrides</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          {/* Backend Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Backend Storage</CardTitle>
              <CardDescription>
                Choose where rate limit counters are stored
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {/* Memory Backend */}
                <div className="flex items-center gap-4 p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => { setBackend('memory'); setUseRedis(false); }}>
                  <input
                    type="radio"
                    id="memory"
                    name="backend"
                    checked={!useRedis}
                    onChange={() => { setBackend('memory'); setUseRedis(false); }}
                    className="cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="memory" className="font-medium cursor-pointer">
                      In-Memory Storage
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Fast local storage. Resets on server restart. Single instance only.
                    </p>
                  </div>
                </div>

                {/* Redis Backend */}
                <div className="flex items-center gap-4 p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => { setBackend('redis'); setUseRedis(true); }}>
                  <input
                    type="radio"
                    id="redis"
                    name="backend"
                    checked={useRedis}
                    onChange={() => { setBackend('redis'); setUseRedis(true); }}
                    className="cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="redis" className="font-medium cursor-pointer">
                      Redis Cluster
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Distributed storage. Persists across restarts. Supports multiple instances.
                    </p>
                  </div>
                </div>
              </div>

              {/* Redis Configuration */}
              {useRedis && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Redis Cluster URLs</h4>
                        <p className="text-sm text-muted-foreground">
                          Add Redis nodes for clustering support
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={addRedisNode}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Node
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {redisNodes.map((node, index) => (
                        <div key={node.id} className="flex gap-2">
                          <Input
                            placeholder="redis://host:6379"
                            value={node.url}
                            onChange={(e) =>
                              updateRedisNode(node.id, e.target.value)
                            }
                            className="flex-1 bg-muted/50"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRedisNode(node.id)}
                            disabled={redisNodes.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Rate Limit Configuration Cards */}
          <div className="grid grid-cols-1 gap-4">
            <LimitConfigCard
              title="Global Rate Limit"
              description="Maximum requests across all sources"
              type="global"
              config={globalConfig}
              onConfigChange={setGlobalConfig}
            />

            <LimitConfigCard
              title="Per-IP Rate Limit"
              description="Maximum requests per unique IP address"
              type="per-ip"
              config={perIpConfig}
              onConfigChange={setPerIpConfig}
            />

            {/* Per-Server Limits */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Per-Server Limits</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure rate limits for specific servers
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addServerConfig}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Server
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {perServerConfigs.map((config, index) => (
                  <div key={index} className="relative">
                    <LimitConfigCard
                      title={`Server ${index + 1}`}
                      type="per-server"
                      config={config}
                      servers={mockServers}
                      onConfigChange={(newConfig) => {
                        const updated = [...perServerConfigs];
                        updated[index] = newConfig as PerServerConfig;
                        setPerServerConfigs(updated);
                      }}
                    />
                    {perServerConfigs.length > 1 && (
                      <button
                        onClick={() => removeServerConfig(index)}
                        className="absolute top-2 right-2 p-1 hover:bg-muted rounded transition-colors"
                        title="Remove server config"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Per-Tool Limits */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Per-Tool Limits</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure rate limits for specific AI tools
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addToolConfig}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tool
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {perToolConfigs.map((config, index) => (
                  <div key={index} className="relative">
                    <LimitConfigCard
                      title={`Tool ${index + 1}`}
                      type="per-tool"
                      config={config}
                      tools={mockTools}
                      onConfigChange={(newConfig) => {
                        const updated = [...perToolConfigs];
                        updated[index] = newConfig as PerToolConfig;
                        setPerToolConfigs(updated);
                      }}
                    />
                    {perToolConfigs.length > 1 && (
                      <button
                        onClick={() => removeToolConfig(index)}
                        className="absolute top-2 right-2 p-1 hover:bg-muted rounded transition-colors"
                        title="Remove tool config"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Real-time rate limit usage statistics. Updates every 5 seconds.
            </AlertDescription>
          </Alert>

          <LimitStats stats={mockStats} />

          {/* Additional monitoring info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monitoring Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Alert Threshold (%)</label>
                <Input
                  type="number"
                  min="50"
                  max="100"
                  defaultValue="85"
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Alert when usage exceeds this percentage
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Email Notifications</div>
                  <div className="text-xs text-muted-foreground">
                    Notify when limits are approached
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Log to Syslog</div>
                  <div className="text-xs text-muted-foreground">
                    Send events to system log
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Overrides Tab */}
        <TabsContent value="overrides" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Per-User/Group Overrides</CardTitle>
                  <CardDescription>
                    Configure custom rate limits for specific users or groups
                  </CardDescription>
                </div>
                <Switch
                  checked={allowOverrides}
                  onCheckedChange={setAllowOverrides}
                />
              </div>
            </CardHeader>

            {allowOverrides && (
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Multipliers are applied to all rate limits. For example, 2.0x
                    means the user gets double the normal rate limit.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {overriddenUsers.map((user, index) => (
                    <div key={user.id} className="flex gap-3 items-end">
                      <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">User/Group ID</label>
                        <Input
                          value={user.id}
                          onChange={(e) => {
                            const updated = [...overriddenUsers];
                            updated[index].id = e.target.value;
                            setOverriddenUsers(updated);
                          }}
                          placeholder="user-id or group-name"
                          className="bg-muted/50"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Multiplier</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="10"
                          value={user.multiplier}
                          onChange={(e) => {
                            const updated = [...overriddenUsers];
                            updated[index].multiplier = parseFloat(e.target.value);
                            setOverriddenUsers(updated);
                          }}
                          placeholder="1.5"
                          className="bg-muted/50"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setOverriddenUsers(
                            overriddenUsers.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setOverriddenUsers([
                      ...overriddenUsers,
                      { id: '', multiplier: 1.5 },
                    ]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Override
                </Button>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
