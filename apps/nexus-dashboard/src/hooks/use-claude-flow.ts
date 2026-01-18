'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ClaudeFlowStatus } from '@/types/claude-flow';

interface UseClaudeFlowOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useClaudeFlow(options: UseClaudeFlowOptions = {}) {
  const { autoRefresh = true, refreshInterval = 5000 } = options;

  const [status, setStatus] = useState<ClaudeFlowStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/claude-flow/status');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setStatus(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to fetch Claude Flow status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStatus, autoRefresh, refreshInterval]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    lastUpdate,
    refresh,
  };
}
