/**
 * GPU Workers Panel Component
 * Manages Wake-on-LAN, status monitoring, and GPU utilization for worker PCs
 */

import React, { useEffect, useState } from 'react';
import { gpuWorkerService } from '../services/gpuWorkerService';
import { GPUWorker, WorkerStatus, GPUUtilization } from '../types/gpu-worker';

interface WorkerCardProps {
  worker: GPUWorker;
  utilization: GPUUtilization | null;
  onWake: (workerName: string) => void;
  onSleep: (workerName: string) => void;
  isLoading: boolean;
}

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, utilization, onWake, onSleep, isLoading }) => {
  const getStatusColor = (status: WorkerStatus): string => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-400';
      case 'waking': return 'bg-yellow-500 animate-pulse';
      case 'sleeping': return 'bg-blue-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusText = (status: WorkerStatus): string => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'waking': return 'Waking...';
      case 'sleeping': return 'Shutting Down...';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status: WorkerStatus): string => {
    switch (status) {
      case 'online': return '●';
      case 'offline': return '○';
      case 'waking': return '⏳';
      case 'sleeping': return '🌙';
      case 'error': return '⚠';
      default: return '?';
    }
  };

  const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const canWake = worker.wol_enabled && (worker.status === 'offline' || worker.status === 'error');
  const canSleep = (worker.status === 'online') && (!worker.always_on || worker.disconnectable);
  const isTransitioning = worker.status === 'waking' || worker.status === 'sleeping';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${getStatusColor(worker.status)}`} />
          <div>
            <h3 className="text-xl font-bold text-gray-800">{worker.displayName}</h3>
            <p className="text-sm text-gray-500">{worker.hostname}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl">{getStatusIcon(worker.status)}</span>
          <p className="text-sm font-medium text-gray-700">{getStatusText(worker.status)}</p>
        </div>
      </div>

      {/* GPU Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎮</span>
          <h4 className="font-semibold text-gray-800">{worker.gpu.model}</h4>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">VRAM:</span>
            <span className="ml-2 font-medium">{worker.gpu.vram}</span>
          </div>
          <div>
            <span className="text-gray-600">CUDA Cores:</span>
            <span className="ml-2 font-medium">{worker.gpu.cuda_cores.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* GPU Utilization (if online) */}
      {worker.status === 'online' && utilization && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-800 mb-3">GPU Utilization</h4>
          <div className="space-y-2">
            {/* GPU Usage */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">GPU Usage</span>
                <span className="font-medium">{utilization.utilization}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    utilization.utilization > 80 ? 'bg-red-500' :
                    utilization.utilization > 50 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${utilization.utilization}%` }}
                />
              </div>
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Memory</span>
                <span className="font-medium">
                  {utilization.memory_used}GB / {utilization.memory_total}GB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(utilization.memory_used / utilization.memory_total) * 100}%` }}
                />
              </div>
            </div>

            {/* Temperature */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Temperature</span>
              <span className="font-medium">{utilization.temperature}°C</span>
            </div>
          </div>
        </div>
      )}

      {/* Network Info */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="bg-gray-50 rounded p-2">
          <span className="text-gray-600">IP:</span>
          <p className="font-mono font-medium">{worker.ip}</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <span className="text-gray-600">MAC:</span>
          <p className="font-mono font-medium text-xs">{worker.mac}</p>
        </div>
      </div>

      {/* Timestamps */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-600">Last Wake:</span>
          <span className="font-medium">{formatTimestamp(worker.last_wake_time)}</span>
        </div>
        {worker.boot_time && (
          <div className="flex justify-between">
            <span className="text-gray-600">Boot Time:</span>
            <span className="font-medium">{worker.boot_time}s</span>
          </div>
        )}
      </div>

      {/* Status Badges */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {worker.always_on && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            ⚡ Always-On
          </span>
        )}
        {worker.wol_enabled && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            ✓ WoL Enabled
          </span>
        )}
        {worker.disconnectable && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            📱 Mobile
          </span>
        )}
        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
          {worker.role}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onWake(worker.name)}
          disabled={!canWake || isLoading || isTransitioning}
          className={`
            flex-1 py-2 px-4 rounded-lg font-medium transition-all
            ${canWake && !isLoading && !isTransitioning
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {worker.status === 'waking' ? '⏳ Waking...' : '🌐 Wake'}
        </button>

        <button
          onClick={() => onSleep(worker.name)}
          disabled={!canSleep || isLoading || isTransitioning}
          className={`
            flex-1 py-2 px-4 rounded-lg font-medium transition-all
            ${canSleep && !isLoading && !isTransitioning
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {worker.status === 'sleeping' ? '🌙 Sleeping...' : '🌙 Sleep'}
        </button>
      </div>

      {/* WoL Disabled Warning */}
      {!worker.wol_enabled && worker.status === 'offline' && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <p className="text-yellow-800">
            ⚠ Wake-on-LAN is disabled for this worker
            {worker.always_on && ' (configured as always-on)'}
          </p>
        </div>
      )}
    </div>
  );
};

export const GPUWorkersPanel: React.FC = () => {
  const [workers, setWorkers] = useState<GPUWorker[]>([]);
  const [utilizations, setUtilizations] = useState<Map<string, GPUUtilization | null>>(new Map());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Load workers on mount
  useEffect(() => {
    loadWorkers();
    gpuWorkerService.startStatusMonitoring();

    return () => {
      gpuWorkerService.stopStatusMonitoring();
    };
  }, []);

  // Update GPU utilization for online workers
  useEffect(() => {
    const interval = setInterval(async () => {
      const onlineWorkers = workers.filter(w => w.status === 'online');
      for (const worker of onlineWorkers) {
        const util = await gpuWorkerService.getGPUUtilization(worker.name);
        setUtilizations(prev => new Map(prev.set(worker.name, util)));
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [workers]);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const loadedWorkers = await gpuWorkerService.loadWorkers();
      setWorkers(loadedWorkers);

      // Check status for all workers
      for (const worker of loadedWorkers) {
        await gpuWorkerService.checkWorkerStatus(worker.name);
      }

      // Refresh workers with updated status
      setWorkers(gpuWorkerService.getWorkers());
    } catch (error) {
      console.error('Failed to load workers:', error);
      showNotification('error', 'Failed to load GPU workers');
    } finally {
      setLoading(false);
    }
  };

  const handleWake = async (workerName: string) => {
    try {
      setActionLoading(true);
      showNotification('info', `Waking ${workerName}...`);

      const result = await gpuWorkerService.wakeWorker(workerName);

      if (result.success) {
        showNotification('success', `${workerName} woken successfully (boot time: ${result.boot_time}s)`);
      } else {
        showNotification('error', `Failed to wake ${workerName}: ${result.error}`);
      }

      setWorkers(gpuWorkerService.getWorkers());
    } catch (error) {
      console.error('Wake error:', error);
      showNotification('error', 'Failed to wake worker');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSleep = async (workerName: string) => {
    if (!confirm(`Are you sure you want to shut down ${workerName}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      showNotification('info', `Shutting down ${workerName}...`);

      const result = await gpuWorkerService.sleepWorker(workerName);

      if (result.success) {
        showNotification('success', `${workerName} shutdown successfully`);
      } else {
        showNotification('error', `Failed to shutdown ${workerName}: ${result.error}`);
      }

      setWorkers(gpuWorkerService.getWorkers());
    } catch (error) {
      console.error('Sleep error:', error);
      showNotification('error', 'Failed to shutdown worker');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWakeAll = async () => {
    try {
      setActionLoading(true);
      showNotification('info', 'Waking all WoL-enabled workers...');

      const results = await gpuWorkerService.wakeAllWorkers();
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      showNotification(
        failCount === 0 ? 'success' : 'info',
        `Wake complete: ${successCount} success, ${failCount} failed`
      );

      setWorkers(gpuWorkerService.getWorkers());
    } catch (error) {
      console.error('Wake all error:', error);
      showNotification('error', 'Failed to wake workers');
    } finally {
      setActionLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const getNotificationColor = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-400 text-green-800';
      case 'error': return 'bg-red-100 border-red-400 text-red-800';
      case 'info': return 'bg-blue-100 border-blue-400 text-blue-800';
    }
  };

  const onlineCount = workers.filter(w => w.status === 'online').length;
  const offlineCount = workers.filter(w => w.status === 'offline').length;
  const wolEnabledCount = workers.filter(w => w.wol_enabled).length;

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading GPU workers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">GPU Workers Management</h1>
        <p className="text-gray-600">
          Monitor and control GPU worker PCs with Wake-on-LAN
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg border ${getNotificationColor(notification.type)}`}>
          {notification.message}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Total Workers</div>
          <div className="text-2xl font-bold text-gray-800">{workers.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Online</div>
          <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Offline</div>
          <div className="text-2xl font-bold text-gray-600">{offlineCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">WoL Enabled</div>
          <div className="text-2xl font-bold text-blue-600">{wolEnabledCount}</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-3">
        <button
          onClick={handleWakeAll}
          disabled={actionLoading || wolEnabledCount === 0}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
        >
          🌐 Wake All Workers
        </button>
        <button
          onClick={loadWorkers}
          disabled={actionLoading}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
        >
          🔄 Refresh Status
        </button>
      </div>

      {/* Worker Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workers.map(worker => (
          <WorkerCard
            key={worker.name}
            worker={worker}
            utilization={utilizations.get(worker.name) || null}
            onWake={handleWake}
            onSleep={handleSleep}
            isLoading={actionLoading}
          />
        ))}
      </div>

      {/* Empty State */}
      {workers.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No GPU Workers Found</h3>
          <p className="text-gray-600 mb-4">
            Configure GPU workers in hardware-detection.json
          </p>
          <button
            onClick={loadWorkers}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all"
          >
            Reload Workers
          </button>
        </div>
      )}
    </div>
  );
};

export default GPUWorkersPanel;
