'use client';

import { useState } from 'react';
import { useMetrics } from '@/hooks/use-metrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, DollarSign, Server, Zap, Download, RefreshCw } from 'lucide-react';
import { MetricsChart } from '@/components/observability/metrics-chart';
import { LatencyHistogram } from '@/components/observability/latency-histogram';
import { TraceViewer } from '@/components/observability/trace-viewer';
import { LogStream } from '@/components/observability/log-stream';

export default function ObservabilityDashboard() {
  const {
    metrics,
    history,
    isLoading,
    error,
    isConnected,
    timeRange,
    setTimeRange,
    refreshMetrics,
    exportData,
  } = useMetrics();

  const [selectedTab, setSelectedTab] = useState('overview');

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error.message}</p>
            <Button onClick={refreshMetrics} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Observability Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time metrics, traces, and logs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={refreshMetrics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportData('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.requests.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Success rate: {metrics.requests.successRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">P95 Latency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.latency.p95.toFixed(0)}ms</div>
              <p className="text-xs text-muted-foreground">
                P50: {metrics.latency.p50.toFixed(0)}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.tokenUsage.total / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground">
                Input: {(metrics.tokenUsage.input / 1000).toFixed(1)}K | Output: {(metrics.tokenUsage.output / 1000).toFixed(1)}K
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalCost.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground">
                Cache hit rate: {metrics.cacheHitRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.providers.length}</div>
              <p className="text-xs text-muted-foreground">
                Uptime: {Math.floor(metrics.uptime / 60)}m
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="latency">Latency Distribution</TabsTrigger>
          <TabsTrigger value="traces">Distributed Traces</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Request Rate</CardTitle>
                <CardDescription>Requests over time</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricsChart
                  data={history}
                  metric="requestCount"
                  label="Requests"
                  color="hsl(var(--primary))"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
                <CardDescription>Percentage of successful requests</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricsChart
                  data={history}
                  metric="successRate"
                  label="Success Rate (%)"
                  color="hsl(142, 76%, 36%)"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Latency</CardTitle>
                <CardDescription>Response time over time</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricsChart
                  data={history}
                  metric="avgLatency"
                  label="Latency (ms)"
                  color="hsl(217, 91%, 60%)"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Token Usage</CardTitle>
                <CardDescription>Total tokens consumed</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricsChart
                  data={history}
                  metric="totalTokens"
                  label="Tokens"
                  color="hsl(280, 65%, 60%)"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="latency">
          <Card>
            <CardHeader>
              <CardTitle>Latency Distribution</CardTitle>
              <CardDescription>
                Histogram showing latency percentiles (p50, p95, p99)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LatencyHistogram />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traces">
          <Card>
            <CardHeader>
              <CardTitle>Distributed Traces</CardTitle>
              <CardDescription>
                Request traces with timing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TraceViewer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Log Stream</CardTitle>
              <CardDescription>
                Real-time application logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogStream />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
