import React, { useState, useEffect } from 'react';
import { HealthCheck } from '../types/manifest';
import { useInstallStore } from '../store/installStore';

interface HealthDashboardProps {
  onComplete?: () => void;
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({ onComplete }) => {
  const { logs: installLogs } = useInstallStore();
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    loadHealthChecks();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadHealthChecks, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadHealthChecks = async () => {
    try {
      // TODO: Load actual health check data from backend
      const mockHealthChecks: HealthCheck[] = [
        {
          service: 'Docker',
          status: 'healthy',
          message: 'Docker daemon running',
          lastCheck: new Date(),
          details: {
            version: '24.0.7',
            containers: 3,
            images: 12,
          },
        },
        {
          service: 'PostgreSQL',
          status: 'healthy',
          message: 'Database accepting connections',
          lastCheck: new Date(),
          details: {
            version: '16.1',
            connections: 5,
            databases: 3,
          },
        },
        {
          service: 'Infisical',
          status: 'healthy',
          message: 'Secret management service operational',
          lastCheck: new Date(),
          details: {
            authenticated: true,
            secrets: 42,
          },
        },
        {
          service: 'Gitea',
          status: 'degraded',
          message: 'Service running but slow response',
          lastCheck: new Date(),
          details: {
            responseTime: 2500,
            repositories: 15,
          },
        },
        {
          service: 'Claude Flow',
          status: 'healthy',
          message: 'MCP server active',
          lastCheck: new Date(),
          details: {
            version: '3.0.0-alpha.12',
            agents: 0,
            memory: '150MB',
          },
        },
        {
          service: 'WSL',
          status: 'healthy',
          message: 'Ubuntu 24.04 running',
          lastCheck: new Date(),
          details: {
            distro: 'Ubuntu',
            version: '24.04',
            kernel: '5.15.0',
          },
        },
      ];
      setHealthChecks(mockHealthChecks);
    } catch (error) {
      console.error('Failed to load health checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'unhealthy':
        return '✗';
      case 'degraded':
        return '⚠';
      default:
        return '?';
    }
  };

  const healthyCount = healthChecks.filter((h) => h.status === 'healthy').length;
  const degradedCount = healthChecks.filter((h) => h.status === 'degraded').length;
  const unhealthyCount = healthChecks.filter((h) => h.status === 'unhealthy').length;

  const overallStatus: HealthCheck['status'] =
    unhealthyCount > 0 ? 'unhealthy' : degradedCount > 0 ? 'degraded' : 'healthy';

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading health checks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Health Dashboard</h1>
          <p className="text-gray-600">Monitor services and view installation logs</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-5 h-5"
          />
          <span className="text-sm font-medium">Auto-refresh</span>
        </label>
      </div>

      {/* Overall Status Card */}
      <div
        className={`mb-6 p-6 rounded-lg border-2 ${getStatusColor(overallStatus)} transition-all`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getStatusIcon(overallStatus)}</span>
              <h2 className="text-2xl font-bold">System {overallStatus}</h2>
            </div>
            <p className="text-sm">
              {healthyCount} healthy • {degradedCount} degraded • {unhealthyCount} unhealthy
            </p>
          </div>
          <button
            onClick={loadHealthChecks}
            className="px-4 py-2 bg-white border-2 border-current rounded-lg hover:bg-opacity-50 transition-colors"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Health Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {healthChecks.map((check) => (
          <div
            key={check.service}
            className={`bg-white border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
              selectedService === check.service ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() =>
              setSelectedService(selectedService === check.service ? null : check.service)
            }
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-lg">{check.service}</h3>
              <span
                className={`px-2 py-0.5 text-xs rounded font-medium border ${getStatusColor(
                  check.status
                )}`}
              >
                {getStatusIcon(check.status)} {check.status}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">{check.message}</p>

            {check.details && (
              <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
                {Object.entries(check.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Last check: {check.lastCheck.toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      {/* Real-time Logs */}
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden mb-8">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Installation Logs</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{installLogs.length} entries</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
        </div>

        <div className="bg-gray-900 text-gray-100 p-4 h-80 overflow-y-auto font-mono text-sm">
          {installLogs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No logs yet</div>
          ) : (
            <div className="space-y-1">
              {installLogs.slice(-50).map((log, index) => (
                <div
                  key={index}
                  className={`
                    ${log.level === 'error' ? 'text-red-400' : ''}
                    ${log.level === 'warn' ? 'text-yellow-400' : ''}
                    ${log.level === 'success' ? 'text-green-400' : ''}
                    ${log.level === 'info' ? 'text-gray-300' : ''}
                  `}
                >
                  <span className="text-gray-500">
                    [{log.timestamp.toLocaleTimeString()}]
                  </span>{' '}
                  {log.component && (
                    <span className="text-blue-400">[{log.component}]</span>
                  )}{' '}
                  {log.message}
                  {log.details && (
                    <div className="ml-4 text-gray-400 text-xs">{log.details}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Complete Installation
        </button>
      </div>
    </div>
  );
};
