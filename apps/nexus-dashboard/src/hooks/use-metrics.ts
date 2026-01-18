import { useState, useEffect, useCallback } from 'react';
import { NexusAPI } from '@/lib/api';
import { useWebSocket } from './use-websocket';

const WS_URL = process.env.NEXT_PUBLIC_NEXUS_URL
  ? process.env.NEXT_PUBLIC_NEXUS_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/metrics'
  : 'ws://localhost:8000/ws/metrics';

interface MetricsData {
  timestamp: number;
  uptime: number;
  requests: {
    total: number;
    success: number;
    error: number;
    timeout: number;
    successRate: number;
  };
  latency: {
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
    mean: number;
  };
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  totalCost: number;
  cacheHitRate: number;
  activeConnections: number;
  providers: any[];
  routes: any[];
}

interface MetricsHistoryPoint {
  timestamp: number;
  requestCount: number;
  successRate: number;
  avgLatency: number;
  totalTokens: number;
  totalCost: number;
  errorCount: number;
  cacheHitRate: number;
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [history, setHistory] = useState<MetricsHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket({
    url: WS_URL,
    onMessage: (data) => {
      if (data.type === 'metrics_snapshot') {
        setMetrics(data.data);
        setIsLoading(false);
      } else if (data.type === 'metrics_update') {
        // Handle incremental updates
        setMetrics((prev) => {
          if (!prev) return prev;
          return { ...prev, ...data.data };
        });
      }
    },
    onError: (err) => {
      console.error('WebSocket error:', err);
      setError(new Error('WebSocket connection failed'));
    },
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [metricsData, historyData] = await Promise.all([
          NexusAPI.getMetrics(),
          NexusAPI.getMetricsHistory(timeRange),
        ]);

        setMetrics(metricsData);
        setHistory(historyData.dataPoints || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [timeRange]);

  // Refresh history when time range changes
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyData = await NexusAPI.getMetricsHistory(timeRange);
        setHistory(historyData.dataPoints || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      }
    };

    if (!isLoading && metrics) {
      fetchHistory();
    }
  }, [timeRange, isLoading, metrics]);

  const refreshMetrics = useCallback(async () => {
    try {
      const metricsData = await NexusAPI.getMetrics();
      setMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh metrics'));
    }
  }, []);

  const exportData = useCallback(async (format: 'json' | 'csv' | 'opentelemetry' = 'json') => {
    try {
      // This will trigger a download
      window.open(`${process.env.NEXT_PUBLIC_NEXUS_URL || 'http://localhost:8000'}/api/metrics/export?format=${format}&period=${timeRange}`, '_blank');
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  }, [timeRange]);

  return {
    metrics,
    history,
    isLoading,
    error,
    isConnected,
    timeRange,
    setTimeRange,
    refreshMetrics,
    exportData,
  };
}
