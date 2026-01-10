'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/metric-card';
import { PerformanceChart } from '@/components/performance-chart';
import { Activity, Zap, Clock, DollarSign, Users, AlertCircle } from 'lucide-react';
import { useNexusStore } from '@/lib/store';
import { NexusAPI } from '@/lib/api';
import { formatNumber, formatDuration } from '@/lib/utils';

export default function DashboardPage() {
  const { metrics, setMetrics, setWSConnected } = useNexusStore();
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Initial data fetch
    const fetchData = async () => {
      try {
        const data = await NexusAPI.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchData();

    // WebSocket connection for real-time updates
    const ws = NexusAPI.connectWebSocket((data) => {
      if (data.type === 'metrics') {
        setMetrics(data.payload);
      } else if (data.type === 'chart') {
        setChartData((prev) => [...prev.slice(-19), data.payload]);
      }
    });

    ws.onopen = () => setWSConnected(true);
    ws.onclose = () => setWSConnected(false);

    // Poll for updates every 30 seconds as fallback
    const interval = setInterval(fetchData, 30000);

    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, [setMetrics, setWSConnected]);

  // Generate mock chart data for demo
  useEffect(() => {
    const generateMockData = () => {
      const now = new Date();
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5 * 60000);
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          requests: Math.floor(Math.random() * 100) + 50,
          latency: Math.floor(Math.random() * 50) + 20,
          errors: Math.floor(Math.random() * 5),
        });
      }
      setChartData(data);
    };

    if (chartData.length === 0) {
      generateMockData();
    }
  }, [chartData.length]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your Nexus Router performance and system metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Requests"
          value={formatNumber(metrics.totalRequests)}
          icon={Activity}
          iconColor="text-blue-500"
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate.toFixed(1)}%`}
          icon={Zap}
          iconColor="text-green-500"
          trend={{ value: 2.3, isPositive: true }}
        />
        <MetricCard
          title="Avg Latency"
          value={formatDuration(metrics.avgLatency)}
          icon={Clock}
          iconColor="text-yellow-500"
          trend={{ value: 5.1, isPositive: false }}
        />
        <MetricCard
          title="Active Connections"
          value={formatNumber(metrics.activeConnections)}
          icon={Users}
          iconColor="text-purple-500"
        />
        <MetricCard
          title="Queued Tasks"
          value={formatNumber(metrics.queuedTasks)}
          icon={AlertCircle}
          iconColor="text-orange-500"
        />
        <MetricCard
          title="Total Cost"
          value={`$${metrics.totalCost.toFixed(2)}`}
          icon={DollarSign}
          iconColor="text-emerald-500"
          description="Last 24 hours"
        />
      </div>

      <PerformanceChart data={chartData} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">WebSocket</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Gateway</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Healthy</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium">
              Refresh All Servers
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium">
              Clear Cache
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium">
              Export Metrics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
