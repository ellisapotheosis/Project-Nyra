'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Download, Upload } from 'lucide-react';

export default function ConfigPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Manage Nexus Router settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API Settings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic router settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Router Name</label>
                <Input defaultValue="Nexus Router" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Model</label>
                <Input defaultValue="gpt-4-turbo" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-refresh Dashboard</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically refresh metrics every 30 seconds
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Dark Mode</div>
                  <div className="text-sm text-muted-foreground">
                    Enable dark theme for the dashboard
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure API endpoints and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">API Base URL</label>
                <Input defaultValue="http://localhost:8000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <Input type="password" defaultValue="••••••••••••••••" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable API Rate Limiting</div>
                  <div className="text-sm text-muted-foreground">
                    Limit requests per client to prevent abuse
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rate Limit (requests/minute)</label>
                <Input type="number" defaultValue="60" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
              <CardDescription>Optimize router performance and caching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable Response Caching</div>
                  <div className="text-sm text-muted-foreground">
                    Cache responses to reduce latency for repeated requests
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cache TTL (seconds)</label>
                <Input type="number" defaultValue="300" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable Request Batching</div>
                  <div className="text-sm text-muted-foreground">
                    Batch multiple requests to improve throughput
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Concurrent Requests</label>
                <Input type="number" defaultValue="100" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Advanced configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable Debug Logging</div>
                  <div className="text-sm text-muted-foreground">
                    Log detailed debug information (may impact performance)
                  </div>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable Telemetry</div>
                  <div className="text-sm text-muted-foreground">
                    Send anonymous usage data to improve the platform
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium">WebSocket Reconnect Interval (ms)</label>
                <Input type="number" defaultValue="5000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Health Check Interval (seconds)</label>
                <Input type="number" defaultValue="30" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
