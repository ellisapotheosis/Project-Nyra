'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Network, Server, Database, Zap, GitBranch, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@nyra/ui';
import { PageHeader } from '@nyra/ui';

interface Integration {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'degraded';
  type: 'api' | 'database' | 'queue' | 'cache' | 'storage' | 'auth';
  endpoint: string;
  latency: string;
  lastChecked: string;
  dataFlow: string;
  dependents: number;
}

interface DataFlow {
  id: string;
  source: string;
  target: string;
  protocol: string;
  recordsPerHour: number;
  lastSync: string;
  syncErrors: number;
}

interface EventStream {
  id: string;
  timestamp: string;
  source: string;
  target: string;
  eventType: string;
  status: 'success' | 'failure' | 'pending';
  details: string;
}

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const integrations: Integration[] = [
    {
      id: '1',
      name: 'TwentyCRM',
      status: 'healthy',
      type: 'api',
      endpoint: 'https://api.twenty.com/graphql',
      latency: '125ms',
      lastChecked: '1m ago',
      dataFlow: 'Leads, Contacts, Pipeline',
      dependents: 5,
    },
    {
      id: '2',
      name: 'Supabase PostgreSQL',
      status: 'healthy',
      type: 'database',
      endpoint: 'postgres://nyra-db.supabase.co',
      latency: '45ms',
      lastChecked: '30s ago',
      dataFlow: 'User accounts, Settings, Audit logs',
      dependents: 8,
    },
    {
      id: '3',
      name: 'Redis Cache',
      status: 'healthy',
      type: 'cache',
      endpoint: 'redis://cache.internal:6379',
      latency: '3ms',
      lastChecked: '15s ago',
      dataFlow: 'Session tokens, Rate limits',
      dependents: 6,
    },
    {
      id: '4',
      name: 'OpenRouter LLM',
      status: 'warning',
      type: 'api',
      endpoint: 'https://api.openrouter.ai/api/v1',
      latency: '485ms',
      lastChecked: '2m ago',
      dataFlow: 'Model inference requests',
      dependents: 3,
    },
    {
      id: '5',
      name: 'n8n Workflows',
      status: 'healthy',
      type: 'queue',
      endpoint: 'http://n8n.local:5678',
      latency: '87ms',
      lastChecked: '45s ago',
      dataFlow: 'Automation, Campaign execution',
      dependents: 4,
    },
    {
      id: '6',
      name: 'Activepieces',
      status: 'degraded',
      type: 'api',
      endpoint: 'http://activepieces.local:3000',
      latency: '245ms',
      lastChecked: '3m ago',
      dataFlow: 'Campaign workflows, Email triggers',
      dependents: 2,
    },
    {
      id: '7',
      name: 'S3 Document Storage',
      status: 'healthy',
      type: 'storage',
      endpoint: 's3://nyra-documents.aws',
      latency: '156ms',
      lastChecked: '1m ago',
      dataFlow: 'Loan documents, PDFs, Images',
      dependents: 3,
    },
    {
      id: '8',
      name: 'Auth0',
      status: 'healthy',
      type: 'auth',
      endpoint: 'https://nyra.auth0.com',
      latency: '234ms',
      lastChecked: '2m ago',
      dataFlow: 'User authentication, JWT tokens',
      dependents: 7,
    },
  ];

  const dataFlows: DataFlow[] = [
    {
      id: '1',
      source: 'TwentyCRM',
      target: 'Supabase',
      protocol: 'HTTP/GraphQL',
      recordsPerHour: 2847,
      lastSync: '2m ago',
      syncErrors: 0,
    },
    {
      id: '2',
      source: 'Supabase',
      target: 'Redis Cache',
      protocol: 'TCP',
      recordsPerHour: 15420,
      lastSync: '1m ago',
      syncErrors: 0,
    },
    {
      id: '3',
      source: 'n8n',
      target: 'Activepieces',
      protocol: 'REST API',
      recordsPerHour: 1256,
      lastSync: '30s ago',
      syncErrors: 2,
    },
    {
      id: '4',
      source: 'Quote Engine',
      target: 'S3 Storage',
      protocol: 'AWS SDK',
      recordsPerHour: 342,
      lastSync: '45s ago',
      syncErrors: 0,
    },
  ];

  const eventStream: EventStream[] = [
    {
      id: '1',
      timestamp: '2026-01-16 10:47:22',
      source: 'TwentyCRM',
      target: 'Quote Engine',
      eventType: 'lead.created',
      status: 'success',
      details: 'New lead synced from CRM #15847',
    },
    {
      id: '2',
      timestamp: '2026-01-16 10:46:15',
      source: 'Quote Engine',
      target: 'S3 Storage',
      eventType: 'document.uploaded',
      status: 'success',
      details: 'Generated quote PDF stored',
    },
    {
      id: '3',
      timestamp: '2026-01-16 10:45:48',
      source: 'Activepieces',
      target: 'Email Service',
      eventType: 'email.sent',
      status: 'failure',
      details: 'Retry attempt 2/3 - Invalid recipient email',
    },
    {
      id: '4',
      timestamp: '2026-01-16 10:44:32',
      source: 'Supabase',
      target: 'Redis Cache',
      eventType: 'cache.invalidate',
      status: 'success',
      details: 'User session cache refreshed',
    },
    {
      id: '5',
      timestamp: '2026-01-16 10:43:10',
      source: 'Auth0',
      target: 'API Gateway',
      eventType: 'auth.token_issued',
      status: 'success',
      details: 'JWT token generated for user session',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 size={16} className="text-green-400" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-400" />;
      case 'degraded':
        return <AlertTriangle size={16} className="text-orange-400" />;
      case 'error':
        return <AlertTriangle size={16} className="text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'degraded':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'error':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api':
        return <Zap size={14} />;
      case 'database':
        return <Database size={14} />;
      case 'queue':
        return <GitBranch size={14} />;
      case 'cache':
        return <Zap size={14} />;
      case 'storage':
        return <Server size={14} />;
      case 'auth':
        return <Eye size={14} />;
      default:
        return <Network size={14} />;
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-400 border-l-green-400';
      case 'failure':
        return 'bg-red-500/10 text-red-400 border-l-red-400';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-l-yellow-400';
      default:
        return 'bg-gray-500/10 text-gray-400 border-l-gray-400';
    }
  };

  const healthyCount = integrations.filter((i) => i.status === 'healthy').length;
  const warningCount = integrations.filter((i) => i.status === 'warning' || i.status === 'degraded').length;
  const errorCount = integrations.filter((i) => i.status === 'error').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="System Integrations"
        subtitle="Microservices Health, Data Flows & Event Streaming"
      />

      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Network size={14} /> Total Integrations
            </p>
            <p className="text-2xl font-bold text-cyan-400">{integrations.length}</p>
            <p className="text-xs text-slate-400 mt-1">Monitoring all services</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <CheckCircle2 size={14} /> Healthy
            </p>
            <p className="text-2xl font-bold text-green-400">{healthyCount}</p>
            <p className="text-xs text-slate-400 mt-1">Operating normally</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <AlertCircle size={14} /> Warnings
            </p>
            <p className="text-2xl font-bold text-yellow-400">{warningCount}</p>
            <p className="text-xs text-slate-400 mt-1">Attention needed</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <AlertTriangle size={14} /> Errors
            </p>
            <p className="text-2xl font-bold text-red-400">{errorCount}</p>
            <p className="text-xs text-slate-400 mt-1">Requires action</p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Directory */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Network size={18} /> Integration Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integrations.map((integration) => (
              <button
                key={integration.id}
                onClick={() => setSelectedIntegration(integration)}
                className={`w-full text-left p-4 rounded border transition hover:border-slate-700 hover:bg-slate-900/50 ${getStatusColor(
                  integration.status
                )}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(integration.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{integration.name}</p>
                        <span className="text-xs px-1.5 py-0.5 bg-slate-700/50 rounded flex items-center gap-1">
                          {getTypeIcon(integration.type)}
                          {integration.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{integration.endpoint}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-slate-300">{integration.latency}</p>
                    <p className="text-xs text-slate-500">{integration.dependents} services</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{integration.dataFlow}</span>
                  <span className="text-slate-500">Checked {integration.lastChecked}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Flow Routes */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <GitBranch size={18} /> Data Flow Routes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dataFlows.map((flow) => (
              <div key={flow.id} className="flex items-center justify-between p-4 rounded border border-slate-800 hover:border-slate-700">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold text-white">{flow.source}</p>
                    <span className="text-xs text-slate-500">→</span>
                    <p className="text-sm font-semibold text-white">{flow.target}</p>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>{flow.protocol}</span>
                    <span>{flow.recordsPerHour.toLocaleString()} records/hr</span>
                    <span>Last sync: {flow.lastSync}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {flow.syncErrors > 0 ? (
                    <p className="text-xs font-bold text-yellow-400">{flow.syncErrors} errors</p>
                  ) : (
                    <p className="text-xs font-bold text-green-400">Syncing</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Stream */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Eye size={18} /> Real-Time Event Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {eventStream.map((event) => (
              <div key={event.id} className={`border-l-4 p-3 rounded ${getEventStatusColor(event.status)}`}>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-white uppercase">{event.eventType}</p>
                    <span className="text-xs px-1.5 py-0.5 bg-slate-700/50 rounded">
                      {event.source} → {event.target}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{event.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300">{event.details}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Detail Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-black border border-cyan-400/30 max-w-2xl w-full">
            <CardHeader className="border-b border-purple-500/20">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    {getTypeIcon(selectedIntegration.type)}
                    {selectedIntegration.name}
                  </CardTitle>
                  <p className="text-sm text-slate-400 mt-1">{selectedIntegration.type.toUpperCase()} Integration</p>
                </div>
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Endpoint</p>
                <p className="text-sm text-white font-mono break-all">{selectedIntegration.endpoint}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedIntegration.status)}
                    <span className="text-sm font-semibold text-white capitalize">{selectedIntegration.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Latency</p>
                  <p className="text-lg font-bold text-cyan-400">{selectedIntegration.latency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Dependent Services</p>
                  <p className="text-lg font-bold text-purple-400">{selectedIntegration.dependents}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-500/20">
                <p className="text-xs text-gray-500 mb-2">Data Flow</p>
                <p className="text-sm text-gray-300">{selectedIntegration.dataFlow}</p>
              </div>

              <div className="pt-4 border-t border-purple-500/20">
                <p className="text-xs text-gray-500 mb-2">Last Health Check</p>
                <p className="text-sm text-gray-300">{selectedIntegration.lastChecked}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
