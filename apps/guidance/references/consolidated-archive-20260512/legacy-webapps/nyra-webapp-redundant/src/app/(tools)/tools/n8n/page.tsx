'use client';

import { useState } from 'react';
import { Activity, AlertCircle, AlertTriangle, CheckCircle, Clock, Zap, BarChart3, GitBranch, Layers, RefreshCw, Slack, Globe, Database, Mail, MessageSquare, Webhook } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

type TimeRange = '1h' | '6h' | '24h';
type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';
type TriggerType = 'webhook' | 'schedule' | 'manual' | 'event';

interface WorkflowExecution {
  id: string;
  workflowName: string;
  triggerType: TriggerType;
  status: ExecutionStatus;
  priority: 'high' | 'medium' | 'low';
  queuePosition: number | null;
  startedAt: string;
  duration: string | null;
  errorMessage: string | null;
  errorLog: string | null;
}

interface HistoryEntry {
  id: string;
  timestamp: string;
  workflowName: string;
  status: ExecutionStatus;
  duration: string;
  errorMessage: string | null;
}

interface Integration {
  name: string;
  icon: React.ReactNode;
  activeConnections: number;
  lastActivity: string;
  status: 'connected' | 'warning' | 'disconnected';
  executionsToday: number;
}

interface PerformancePoint {
  label: string;
  avgMs: number;
  executions: number;
}

export default function N8nWorkflowPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedFailed, setSelectedFailed] = useState<WorkflowExecution | null>(null);

  // --- Metrics (time-range aware) ---
  const metrics: Record<TimeRange, { activeWorkflows: number; executions: number; successRate: number; failedCount: number; execPerHour: number; avgQueueWait: string }> = {
    '1h':  { activeWorkflows: 4,  executions: 38,   successRate: 94.7, failedCount: 2,  execPerHour: 38,  avgQueueWait: '1.2s' },
    '6h':  { activeWorkflows: 7,  executions: 214,  successRate: 97.2, failedCount: 6,  execPerHour: 36,  avgQueueWait: '0.9s' },
    '24h': { activeWorkflows: 12, executions: 847,  successRate: 98.1, failedCount: 16, execPerHour: 35,  avgQueueWait: '0.8s' },
  };

  // --- Performance graph data ---
  const performanceData: Record<TimeRange, PerformancePoint[]> = {
    '1h': [
      { label: '0m',  avgMs: 1240, executions: 6  },
      { label: '10m', avgMs: 980,  executions: 8  },
      { label: '20m', avgMs: 1450, executions: 5  },
      { label: '30m', avgMs: 1120, executions: 7  },
      { label: '40m', avgMs: 890,  executions: 6  },
      { label: '50m', avgMs: 1380, executions: 6  },
    ],
    '6h': [
      { label: '1h', avgMs: 1050, executions: 34 },
      { label: '2h', avgMs: 1340, executions: 41 },
      { label: '3h', avgMs: 920,  executions: 28 },
      { label: '4h', avgMs: 1180, executions: 38 },
      { label: '5h', avgMs: 1420, executions: 45 },
      { label: '6h', avgMs: 1100, executions: 28 },
    ],
    '24h': [
      { label: '4h',  avgMs: 980,  executions: 142 },
      { label: '8h',  avgMs: 1240, executions: 98  },
      { label: '12h', avgMs: 1560, executions: 187 },
      { label: '16h', avgMs: 1100, executions: 163 },
      { label: '20h', avgMs: 890,  executions: 145 },
      { label: '24h', avgMs: 1320, executions: 112 },
    ],
  };

  // --- Execution queue ---
  const executionQueue: WorkflowExecution[] = [
    { id: 'ex-001', workflowName: 'Lead Intake → CRM Sync',       triggerType: 'webhook',  status: 'running',   priority: 'high',   queuePosition: null, startedAt: '10:47:12 AM', duration: '1m 23s',  errorMessage: null, errorLog: null },
    { id: 'ex-002', workflowName: 'Daily Rate Sheet Broadcast',    triggerType: 'schedule', status: 'pending',   priority: 'medium', queuePosition: 1,    startedAt: '10:45:00 AM', duration: null,       errorMessage: null, errorLog: null },
    { id: 'ex-003', workflowName: 'Slack Alert: Pipeline Update',  triggerType: 'event',   status: 'pending',   priority: 'low',    queuePosition: 2,    startedAt: '10:45:30 AM', duration: null,       errorMessage: null, errorLog: null },
    { id: 'ex-004', workflowName: 'Document OCR Processing',       triggerType: 'webhook',  status: 'running',   priority: 'high',   queuePosition: null, startedAt: '10:46:55 AM', duration: '0m 48s',  errorMessage: null, errorLog: null },
    { id: 'ex-005', workflowName: 'Email Follow-up Sequence',      triggerType: 'schedule', status: 'completed', priority: 'medium', queuePosition: null, startedAt: '10:40:00 AM', duration: '2m 05s',  errorMessage: null, errorLog: null },
    { id: 'ex-006', workflowName: 'Compliance Flag Notification',  triggerType: 'event',   status: 'failed',    priority: 'high',   queuePosition: null, startedAt: '10:38:44 AM', duration: '0m 14s',  errorMessage: 'Slack API rate limit exceeded (429)', errorLog: 'Error: Request to https://slack.com/api/chat.postMessage failed\nStatus: 429 Too Many Requests\nRetry-After: 30\nStack: SlackAPIError at sendNotification (slack.node.ts:42)\n  at WorkflowExecutor.run (executor.ts:218)' },
  ];

  // --- Execution history ---
  const historyEntries: Record<TimeRange, HistoryEntry[]> = {
    '1h': [
      { id: 'h-01', timestamp: '10:47 AM', workflowName: 'Lead Intake → CRM Sync',      status: 'running',   duration: '1m 23s', errorMessage: null },
      { id: 'h-02', timestamp: '10:46 AM', workflowName: 'Document OCR Processing',      status: 'running',   duration: '0m 48s', errorMessage: null },
      { id: 'h-03', timestamp: '10:45 AM', workflowName: 'Email Follow-up Sequence',     status: 'completed', duration: '2m 05s', errorMessage: null },
      { id: 'h-04', timestamp: '10:42 AM', workflowName: 'Compliance Flag Notification', status: 'failed',    duration: '0m 14s', errorMessage: 'Slack API rate limit exceeded (429)' },
      { id: 'h-05', timestamp: '10:38 AM', workflowName: 'Daily Rate Sheet Broadcast',   status: 'completed', duration: '1m 52s', errorMessage: null },
      { id: 'h-06', timestamp: '10:30 AM', workflowName: 'Lead Score Refresh',           status: 'completed', duration: '3m 11s', errorMessage: null },
    ],
    '6h': [
      { id: 'h-07', timestamp: '10:47 AM', workflowName: 'Lead Intake → CRM Sync',      status: 'running',   duration: '1m 23s', errorMessage: null },
      { id: 'h-08', timestamp: '09:30 AM', workflowName: 'Quote Engine Batch',           status: 'completed', duration: '4m 18s', errorMessage: null },
      { id: 'h-09', timestamp: '08:15 AM', workflowName: 'Webhook Relay: Zapier',        status: 'failed',    duration: '0m 07s', errorMessage: 'Connection timeout after 5s' },
      { id: 'h-10', timestamp: '07:00 AM', workflowName: 'Daily Rate Sheet Broadcast',   status: 'completed', duration: '2m 34s', errorMessage: null },
      { id: 'h-11', timestamp: '06:00 AM', workflowName: 'Agent Memory Sync',            status: 'completed', duration: '1m 08s', errorMessage: null },
      { id: 'h-12', timestamp: '05:30 AM', workflowName: 'Compliance Audit Export',      status: 'completed', duration: '5m 22s', errorMessage: null },
    ],
    '24h': [
      { id: 'h-13', timestamp: '10:47 AM', workflowName: 'Lead Intake → CRM Sync',      status: 'running',   duration: '1m 23s', errorMessage: null },
      { id: 'h-14', timestamp: '08:00 AM', workflowName: 'Morning Pipeline Digest',      status: 'completed', duration: '3m 05s', errorMessage: null },
      { id: 'h-15', timestamp: '04:00 AM', workflowName: 'Nightly DB Backup Trigger',    status: 'completed', duration: '7m 42s', errorMessage: null },
      { id: 'h-16', timestamp: '02:30 AM', workflowName: 'Lead Score Refresh',           status: 'failed',    duration: '0m 22s', errorMessage: 'Database connection pool exhausted' },
      { id: 'h-17', timestamp: '12:00 AM', workflowName: 'Compliance Archive Job',       status: 'completed', duration: '9m 14s', errorMessage: null },
      { id: 'h-18', timestamp: 'Yesterday', workflowName: 'Rate Sheet Distribution',     status: 'completed', duration: '2m 48s', errorMessage: null },
    ],
  };

  // --- Integrations ---
  const integrations: Integration[] = [
    { name: 'Slack',        icon: <Slack size={16} />,        activeConnections: 3,  lastActivity: '2m ago',  status: 'warning',      executionsToday: 124 },
    { name: 'Twenty CRM',   icon: <Database size={16} />,     activeConnections: 5,  lastActivity: '1m ago',  status: 'connected',    executionsToday: 312 },
    { name: 'Zapier Relay', icon: <Zap size={16} />,          activeConnections: 1,  lastActivity: '18m ago', status: 'warning',      executionsToday: 48  },
    { name: 'Email (SMTP)', icon: <Mail size={16} />,         activeConnections: 2,  lastActivity: '5m ago',  status: 'connected',    executionsToday: 89  },
    { name: 'Webhooks',     icon: <Webhook size={16} />,      activeConnections: 8,  lastActivity: 'just now',status: 'connected',    executionsToday: 203 },
    { name: 'OpenWebUI',    icon: <MessageSquare size={16} />,activeConnections: 1,  lastActivity: '12m ago', status: 'connected',    executionsToday: 34  },
    { name: 'Nexus Router', icon: <Globe size={16} />,        activeConnections: 4,  lastActivity: 'just now',status: 'connected',    executionsToday: 445 },
    { name: 'Activepieces', icon: <GitBranch size={16} />,    activeConnections: 0,  lastActivity: '2h ago',  status: 'disconnected', executionsToday: 0   },
  ];

  // --- Helpers ---
  const m = metrics[timeRange];
  const perfData = performanceData[timeRange];
  const history = historyEntries[timeRange];
  const maxMs = Math.max(...perfData.map((p) => p.avgMs));

  const getStatusColor = (status: ExecutionStatus) => {
    switch (status) {
      case 'running':   return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'pending':   return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'failed':    return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
  };

  const getStatusDot = (status: ExecutionStatus) => {
    switch (status) {
      case 'running':   return 'bg-green-400 animate-pulse';
      case 'pending':   return 'bg-yellow-400';
      case 'completed': return 'bg-cyan-400';
      case 'failed':    return 'bg-red-400';
    }
  };

  const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case 'running':   return <Activity size={14} className="text-green-400 animate-pulse" />;
      case 'pending':   return <Clock size={14} className="text-yellow-400" />;
      case 'completed': return <CheckCircle size={14} className="text-cyan-400" />;
      case 'failed':    return <AlertTriangle size={14} className="text-red-400" />;
    }
  };

  const getTriggerBadge = (trigger: TriggerType) => {
    const styles: Record<TriggerType, string> = {
      webhook:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
      schedule: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      manual:   'bg-gray-500/20 text-gray-300 border-gray-500/30',
      event:    'bg-pink-500/20 text-pink-300 border-pink-500/30',
    };
    return styles[trigger];
  };

  const getPriorityColor = (priority: WorkflowExecution['priority']) => {
    switch (priority) {
      case 'high':   return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low':    return 'text-slate-400';
    }
  };

  const getIntegrationStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected':    return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'warning':      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'disconnected': return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
  };

  const failedInQueue = executionQueue.filter((e) => e.status === 'failed');

  return (
    <div className="space-y-8">
      <PageHeader
        title="n8n Workflows"
        subtitle="Workflow Execution Tracking - Queue, History & Performance Dashboard"
      />

      {/* Time Range Selector */}
      <div className="flex gap-2 justify-end">
        {(['1h', '6h', '24h'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              timeRange === range
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                : 'bg-gray-500/10 text-gray-400 border border-gray-500/20 hover:border-gray-500/30'
            }`}
          >
            {range.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Layers size={14} /> Active Workflows
            </p>
            <p className="text-2xl font-bold text-purple-400">{m.activeWorkflows}</p>
            <p className="text-xs text-green-400 mt-1">Currently running</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Zap size={14} /> Executions
            </p>
            <p className="text-2xl font-bold text-cyan-400">{m.executions.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">In last {timeRange}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <CheckCircle size={14} /> Success Rate
            </p>
            <p className="text-2xl font-bold text-green-400">{m.successRate}%</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div
                className="bg-gradient-to-r from-green-500 to-cyan-500 h-1.5 rounded-full"
                style={{ width: `${m.successRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <AlertTriangle size={14} /> Failed Count
            </p>
            <p className="text-2xl font-bold text-orange-400">{m.failedCount}</p>
            <p className="text-xs text-slate-400 mt-1">
              {m.failedCount > 0 ? (
                <button
                  onClick={() => failedInQueue.length > 0 && setSelectedFailed(failedInQueue[0])}
                  className="text-orange-400 hover:text-orange-300 underline underline-offset-2"
                >
                  View details
                </button>
              ) : (
                'No failures'
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Execution Queue + History side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Queue */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock size={18} /> Execution Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {executionQueue.map((exec) => (
                <button
                  key={exec.id}
                  onClick={() => exec.status === 'failed' && setSelectedFailed(exec)}
                  className={`w-full text-left p-3 rounded border transition ${
                    exec.status === 'failed'
                      ? 'border-red-500/30 hover:border-red-400/50 hover:bg-red-500/5 cursor-pointer'
                      : 'border-slate-800 hover:border-slate-700 cursor-default'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${getStatusDot(exec.status)}`} />
                      <p className="text-sm font-semibold text-white truncate">{exec.workflowName}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {getStatusIcon(exec.status)}
                      <span className={`text-xs font-medium capitalize px-1.5 py-0.5 rounded border ${getStatusColor(exec.status)}`}>
                        {exec.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${getTriggerBadge(exec.triggerType)}`}>
                      {exec.triggerType}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(exec.priority)}`}>
                      {exec.priority} priority
                    </span>
                    {exec.queuePosition !== null && (
                      <span className="text-xs text-slate-500">Queue #{exec.queuePosition}</span>
                    )}
                    {exec.duration && (
                      <span className="text-xs text-slate-500">{exec.duration}</span>
                    )}
                  </div>
                  {exec.status === 'failed' && exec.errorMessage && (
                    <p className="text-xs text-red-400 mt-2 truncate">{exec.errorMessage}</p>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Execution History Timeline */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity size={18} /> Execution History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {history.map((entry, index) => (
                <div key={entry.id} className="flex gap-3">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center">
                    <span className={`h-3 w-3 rounded-full flex-shrink-0 mt-1 ${getStatusDot(entry.status)}`} />
                    {index < history.length - 1 && (
                      <div className="w-px flex-1 bg-slate-800 my-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className={`pb-4 flex-1 ${index < history.length - 1 ? '' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-white leading-tight">{entry.workflowName}</p>
                      <span className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">{entry.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(entry.status)}
                        <span className={`text-xs capitalize ${
                          entry.status === 'running' ? 'text-green-400' :
                          entry.status === 'completed' ? 'text-cyan-400' :
                          entry.status === 'pending' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>{entry.status}</span>
                      </div>
                      <span className="text-xs text-slate-500">{entry.duration}</span>
                    </div>
                    {entry.errorMessage && (
                      <p className="text-xs text-red-400 mt-1 italic">{entry.errorMessage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Graph */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 size={18} /> Execution Performance — Avg Duration ({timeRange})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-3 h-44">
              {perfData.map((point, i) => {
                const barHeight = (point.avgMs / maxMs) * 100;
                const isHigh = point.avgMs > maxMs * 0.75;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full flex flex-col items-center justify-end h-36">
                      <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition text-xs text-center bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white whitespace-nowrap z-10">
                        {point.avgMs}ms · {point.executions} runs
                      </div>
                      <div
                        className={`w-full rounded-t transition-all ${
                          isHigh
                            ? 'bg-gradient-to-t from-orange-500 to-pink-400 opacity-80 hover:opacity-100'
                            : 'bg-gradient-to-t from-purple-500 to-cyan-400 opacity-80 hover:opacity-100'
                        }`}
                        style={{ height: `${barHeight}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{point.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-gradient-to-t from-purple-500 to-cyan-400" />
                Normal (&lt;{Math.round(maxMs * 0.75)}ms)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-gradient-to-t from-orange-500 to-pink-400" />
                Elevated (&ge;{Math.round(maxMs * 0.75)}ms)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <GitBranch size={18} /> Integration Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className={`flex items-center gap-3 p-3 rounded border ${getIntegrationStatusColor(integration.status)}`}
              >
                <div className="flex-shrink-0">{integration.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{integration.name}</p>
                    <span className="text-xs font-medium capitalize">{integration.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {integration.activeConnections} connection{integration.activeConnections !== 1 ? 's' : ''} · {integration.executionsToday} today
                  </p>
                  <p className="text-xs text-slate-600">Last: {integration.lastActivity}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 size={18} /> Resource Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Executions / hour</span>
                  <span className="text-cyan-400 font-semibold">{m.execPerHour}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${Math.min((m.execPerHour / 60) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">Capacity: 60/hr</p>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Queue fill level</span>
                  <span className="text-purple-400 font-semibold">
                    {executionQueue.filter((e) => e.status === 'pending').length} pending
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full"
                    style={{ width: `${(executionQueue.filter((e) => e.status === 'pending').length / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">Max queue depth: 10</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded border border-slate-800">
                <div>
                  <p className="text-xs text-slate-500">Avg Queue Wait Time</p>
                  <p className="text-lg font-bold text-pink-400">{m.avgQueueWait}</p>
                </div>
                <Clock size={24} className="text-slate-600" />
              </div>
              <div className="flex items-center justify-between p-3 rounded border border-slate-800">
                <div>
                  <p className="text-xs text-slate-500">Active Workers</p>
                  <p className="text-lg font-bold text-cyan-400">{m.activeWorkflows}</p>
                </div>
                <Activity size={24} className="text-slate-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Failed Workflow Detail Modal */}
      {selectedFailed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFailed(null)}
        >
          <Card
            className="bg-black/90 border border-red-500/30 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-red-500/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                  <CardTitle className="text-white text-base">{selectedFailed.workflowName}</CardTitle>
                </div>
                <button
                  onClick={() => setSelectedFailed(null)}
                  className="text-slate-400 hover:text-white transition text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-sm font-semibold text-red-400 capitalize">Failed</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Trigger</p>
                  <span className={`text-xs px-2 py-0.5 rounded border ${getTriggerBadge(selectedFailed.triggerType)}`}>
                    {selectedFailed.triggerType}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Started At</p>
                  <p className="text-sm text-white">{selectedFailed.startedAt}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Duration</p>
                  <p className="text-sm text-white">{selectedFailed.duration ?? '—'}</p>
                </div>
              </div>

              {/* Error message */}
              <div>
                <p className="text-xs text-slate-500 mb-2">Error Message</p>
                <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                  <p className="text-sm text-red-300 font-medium">{selectedFailed.errorMessage}</p>
                </div>
              </div>

              {/* Error log */}
              {selectedFailed.errorLog && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Error Log</p>
                  <pre className="bg-slate-900 border border-slate-700 rounded p-3 text-xs text-slate-300 whitespace-pre-wrap font-mono overflow-x-auto">
                    {selectedFailed.errorLog}
                  </pre>
                </div>
              )}

              {/* Retry options */}
              <div className="border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-500 mb-3">Retry Options</p>
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition text-sm font-medium">
                    <RefreshCw size={14} />
                    Retry Now
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition text-sm font-medium">
                    <Clock size={14} />
                    Schedule Retry
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded bg-slate-700/50 text-slate-400 border border-slate-700 hover:bg-slate-700 transition text-sm font-medium">
                    Skip &amp; Dismiss
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
