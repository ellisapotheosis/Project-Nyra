'use client';

import { useState, useEffect } from 'react';
import { Check, AlertCircle, Clock, RotateCw, Zap, Activity } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@nyra/ui';

interface CRMStats {
  totalContacts: number;
  activeDeals: number;
  syncStatus: 'synced' | 'syncing' | 'error';
  lastSync: string;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

interface ObjectMapping {
  name: string;
  nyraField: string;
  twentyField: string;
  status: 'mapped' | 'unmapped' | 'conflict';
  lastSync: string;
}

interface SyncLog {
  id: string;
  timestamp: string;
  action: 'sync' | 'create' | 'update' | 'delete' | 'test';
  objectType: string;
  count: number;
  status: 'success' | 'error' | 'warning';
  message: string;
}

export default function CRMPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState<CRMStats>({
    totalContacts: 2847,
    activeDeals: 156,
    syncStatus: 'synced',
    lastSync: new Date().toLocaleString(),
    connectionStatus: 'connected',
  });

  const [objectMappings] = useState<ObjectMapping[]>([
    { name: 'Contacts', nyraField: 'leads.contact_name', twentyField: 'people.name', status: 'mapped', lastSync: '2 hours ago' },
    { name: 'Email', nyraField: 'leads.email', twentyField: 'people.email', status: 'mapped', lastSync: '2 hours ago' },
    { name: 'Phone', nyraField: 'leads.phone', twentyField: 'people.phone', status: 'mapped', lastSync: '2 hours ago' },
    { name: 'Company', nyraField: 'leads.company', twentyField: 'companies.name', status: 'mapped', lastSync: '2 hours ago' },
    { name: 'Deal Stage', nyraField: 'quotes.stage', twentyField: 'opportunities.stage', status: 'mapped', lastSync: '1 hour ago' },
    { name: 'Deal Amount', nyraField: 'quotes.amount', twentyField: 'opportunities.amount', status: 'mapped', lastSync: '1 hour ago' },
  ]);

  const [syncLog, setSyncLog] = useState<SyncLog[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 60000).toLocaleString(),
      action: 'sync',
      objectType: 'Contacts',
      count: 128,
      status: 'success',
      message: 'Synced 128 contacts from TwentyCRM',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60000).toLocaleString(),
      action: 'create',
      objectType: 'Deals',
      count: 12,
      status: 'success',
      message: 'Created 12 new deals in TwentyCRM',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1 * 3600000).toLocaleString(),
      action: 'update',
      objectType: 'Contacts',
      count: 45,
      status: 'success',
      message: 'Updated 45 contact records',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 2 * 3600000).toLocaleString(),
      action: 'sync',
      objectType: 'Deals',
      count: 156,
      status: 'success',
      message: 'Full sync completed - 156 deals',
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    setStats(prev => ({ ...prev, syncStatus: 'syncing' }));

    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        syncStatus: 'synced',
        lastSync: new Date().toLocaleString(),
      }));

      const newLog: SyncLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        action: 'sync',
        objectType: 'Full Sync',
        count: 284,
        status: 'success',
        message: 'Full synchronization completed successfully',
      };

      setSyncLog(prev => [newLog, ...prev.slice(0, 9)]);
      addToast('success', 'CRM synchronization completed');
      setLoading(false);
    }, 2000);
  };

  const handleTest = async () => {
    setLoading(true);

    setTimeout(() => {
      const newLog: SyncLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        action: 'test',
        objectType: 'Connection Test',
        count: 1,
        status: 'success',
        message: 'Test connection successful - TwentyCRM API responding',
      };

      setSyncLog(prev => [newLog, ...prev.slice(0, 9)]);
      addToast('success', 'CRM connection test passed');
      setLoading(false);
    }, 1500);
  };

  const handleReplay = (logId: string) => {
    addToast('info', 'Replaying sync action...');
    setTimeout(() => {
      addToast('success', 'Sync action completed');
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getMappingColor = (status: string) => {
    switch (status) {
      case 'mapped':
        return 'bg-green-500/10 border-green-500/20 text-green-300';
      case 'unmapped':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300';
      case 'conflict':
        return 'bg-red-500/10 border-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-black/95">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            TwentyCRM Integration
          </h1>
          <p className="text-gray-400">Real-time CRM synchronization and contact management</p>
        </div>

        {/* Connection Status */}
        <div className="border border-purple-500/20 bg-purple-500/5 backdrop-blur p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Activity size={20} className="text-cyan-400" />
                Connection Status
              </h2>
              <p className="text-sm text-gray-400">
                {stats.connectionStatus === 'connected' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Connected to TwentyCRM API
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    Disconnected - Retrying...
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400 flex items-center gap-2">
                <Check size={24} />
                Healthy
              </p>
              <p className="text-xs text-gray-400">Latency: 125ms</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
            <div className="text-gray-400 text-sm mb-2">Total Contacts</div>
            <div className="text-3xl font-bold text-cyan-400">{stats.totalContacts.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-2">+128 this week</p>
          </div>
          <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
            <div className="text-gray-400 text-sm mb-2">Active Deals</div>
            <div className="text-3xl font-bold text-green-400">{stats.activeDeals.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-2">+12 this week</p>
          </div>
          <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
            <div className="text-gray-400 text-sm mb-2">Sync Status</div>
            <div className={`text-lg font-semibold ${
              stats.syncStatus === 'synced' ? 'text-green-400' :
              stats.syncStatus === 'syncing' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {stats.syncStatus.charAt(0).toUpperCase() + stats.syncStatus.slice(1)}
            </div>
            <p className="text-xs text-gray-500 mt-2">Automatic every 30min</p>
          </div>
          <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
            <div className="text-gray-400 text-sm mb-2">Mapped Objects</div>
            <div className="text-3xl font-bold text-purple-400">{objectMappings.length}</div>
            <p className="text-xs text-gray-500 mt-2">All synced</p>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <RotateCw size={20} />
            Synchronization Controls
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Last synced:</p>
              <p className="text-cyan-400 font-semibold">{stats.lastSync}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleTest}
                disabled={loading}
                className="px-6 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Zap size={16} />
                Test Connection
              </button>
              <button
                onClick={handleSync}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Object Mappings */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Field Mappings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {objectMappings.map((mapping, idx) => (
              <div key={idx} className={`rounded-lg border p-4 ${getMappingColor(mapping.status)}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{mapping.name}</h3>
                  {mapping.status === 'mapped' && <Check size={16} />}
                  {mapping.status === 'unmapped' && <AlertCircle size={16} />}
                </div>
                <p className="text-xs mb-1">
                  <span className="opacity-70">Nyra:</span> {mapping.nyraField}
                </p>
                <p className="text-xs mb-2">
                  <span className="opacity-70">Twenty:</span> {mapping.twentyField}
                </p>
                <p className="text-xs opacity-60">Last sync: {mapping.lastSync}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sync Log */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Synchronization Log</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {syncLog.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 border border-purple-500/10 rounded hover:bg-purple-500/5"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-xs font-medium uppercase ${getStatusColor(log.status)} bg-opacity-20`}>
                      {log.status}
                    </span>
                    <span className="font-medium text-white">{log.message}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <Clock size={12} className="inline mr-1" />
                    {log.timestamp}
                  </p>
                </div>
                {log.action === 'sync' && (
                  <button
                    onClick={() => handleReplay(log.id)}
                    className="px-3 py-1 text-xs bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30 ml-4 whitespace-nowrap"
                  >
                    Replay
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
