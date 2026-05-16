'use client';

import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Play,
  TrendingUp,
  Zap,
  XCircle,
  Timer,
  GitBranch,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

type ExecutionStatus = 'running' | 'completed' | 'failed' | 'pending';
type TriggerType = 'webhook' | 'schedule' | 'manual' | 'event';
type WorkflowStatus = 'healthy' | 'warning' | 'degraded' | 'error';

interface Workflow {
  id: string;
  name: string;
  triggerType: TriggerType;
  lastExecution: string;
  executionCount: number;
  status: WorkflowStatus;
  successRate: number;
  avgDuration: string;
}

interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  timestamp: string;
  duration: string;
  triggerType: TriggerType;
  steps: ExecutionStep[];
  errorMessage?: string;
}

interface ExecutionStep {
  name: string;
  status: 'success' | 'failed' | 'skipped';
  duration: string;
  output?: string;
}

interface ErrorPattern {
  pattern: string;
  count: number;
  lastSeen: string;
  affectedWorkflows: number;
  severity: 'low' | 'medium' | 'high';
}

interface ResourcePoint {
  time: string;
  cpu: number;
  memory: number;
}

export default function ActivepiecesPage() {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('24h');
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);

  const metricsByRange = {
    '1h': { totalWorkflows: 24, activeExecutions: 3, successRate: 97.2, avgExecTime: '4.1s', running: 3, completed: 41, failed: 2, pending: 1 },
    '6h': { totalWorkflows: 24, activeExecutions: 3, successRate: 96.8, avgExecTime: '4.4s', running: 3, completed: 248, failed: 11, pending: 4 },
    '24h': { totalWorkflows: 24, activeExecutions: 3, successRate: 95.4, avgExecTime: '4.7s', running: 3, completed: 892, failed: 47, pending: 12 },
  };

  const metrics = metricsByRange[timeRange];

  const workflows: Workflow[] = [
    { id: 'wf-001', name: 'Lead Intake → CRM Sync', triggerType: 'webhook', lastExecution: '2m ago', executionCount: 312, status: 'healthy', successRate: 99.1, avgDuration: '2.3s' },
    { id: 'wf-002', name: 'Campaign Email Blast', triggerType: 'schedule', lastExecution: '1h ago', executionCount: 48, status: 'healthy', successRate: 98.7, avgDuration: '18.4s' },
    { id: 'wf-003', name: 'Compliance Alert Router', triggerType: 'event', lastExecution: '14m ago', executionCount: 87, status: 'warning', successRate: 91.4, avgDuration: '3.1s' },
    { id: 'wf-004', name: 'Quote Generation Pipeline', triggerType: 'webhook', lastExecution: '5m ago', executionCount: 194, status: 'healthy', successRate: 97.4, avgDuration: '6.8s' },
    { id: 'wf-005', name: 'Document Upload Processor', triggerType: 'event', lastExecution: '38m ago', executionCount: 56, status: 'degraded', successRate: 83.9, avgDuration: '11.2s' },
    { id: 'wf-006', name: 'Nightly DB Reconciliation', triggerType: 'schedule', lastExecution: '6h ago', executionCount: 21, status: 'healthy', successRate: 100, avgDuration: '42.1s' },
    { id: 'wf-007', name: 'Slack Notification Fanout', triggerType: 'event', lastExecution: '7m ago', executionCount: 428, status: 'healthy', successRate: 99.8, avgDuration: '0.9s' },
    { id: 'wf-008', name: 'Rate Lock Expiry Monitor', triggerType: 'schedule', lastExecution: '3h ago', executionCount: 12, status: 'error', successRate: 66.7, avgDuration: '8.5s' },
  ];

  const executions: Execution[] = [
    {
      id: 'exec-4821',
      workflowId: 'wf-001',
      workflowName: 'Lead Intake → CRM Sync',
      status: 'completed',
      timestamp: '2026-05-12 10:48:22',
      duration: '2.1s',
      triggerType: 'webhook',
      steps: [
        { name: 'Parse Webhook Payload', status: 'success', duration: '12ms', output: 'Lead data extracted' },
        { name: 'Validate Required Fields', status: 'success', duration: '8ms', output: 'All fields present' },
        { name: 'Push to TwentyCRM', status: 'success', duration: '1.9s', output: 'Record created: #15849' },
        { name: 'Send Confirmation Slack', status: 'success', duration: '180ms', output: 'Message sent to #leads' },
      ],
    },
    {
      id: 'exec-4820',
      workflowId: 'wf-004',
      workflowName: 'Quote Generation Pipeline',
      status: 'running',
      timestamp: '2026-05-12 10:47:58',
      duration: '1m 12s',
      triggerType: 'webhook',
      steps: [
        { name: 'Receive Quote Request', status: 'success', duration: '15ms', output: 'Loan: $425,000 @ 6.75%' },
        { name: 'Fetch Rate Sheet', status: 'success', duration: '340ms', output: 'Current rates loaded' },
        { name: 'Run Compliance Check', status: 'success', duration: '2.1s', output: 'TILA/RESPA passed' },
        { name: 'Generate PDF Quote', status: 'failed', duration: '–', output: 'PDF service timeout after 30s' },
      ],
      errorMessage: 'PDF generation service timed out (30s limit exceeded)',
    },
    {
      id: 'exec-4819',
      workflowId: 'wf-003',
      workflowName: 'Compliance Alert Router',
      status: 'failed',
      timestamp: '2026-05-12 10:46:14',
      duration: '3.4s',
      triggerType: 'event',
      steps: [
        { name: 'Receive Compliance Event', status: 'success', duration: '11ms', output: 'Event: rate_exceeded' },
        { name: 'Evaluate Routing Rules', status: 'success', duration: '45ms', output: 'Route: compliance-team' },
        { name: 'Send Email Alert', status: 'failed', duration: '3.3s', output: 'SMTP connection refused' },
        { name: 'Fallback SMS', status: 'skipped', duration: '–' },
      ],
      errorMessage: 'SMTP connection refused on port 587 — check mail relay credentials',
    },
    {
      id: 'exec-4818',
      workflowId: 'wf-007',
      workflowName: 'Slack Notification Fanout',
      status: 'completed',
      timestamp: '2026-05-12 10:45:07',
      duration: '0.8s',
      triggerType: 'event',
      steps: [
        { name: 'Parse Event Payload', status: 'success', duration: '9ms', output: 'Event parsed' },
        { name: 'Fan Out to Channels', status: 'success', duration: '771ms', output: '3 messages sent' },
      ],
    },
    {
      id: 'exec-4817',
      workflowId: 'wf-005',
      workflowName: 'Document Upload Processor',
      status: 'failed',
      timestamp: '2026-05-12 10:43:51',
      duration: '11.8s',
      triggerType: 'event',
      steps: [
        { name: 'Receive File Upload Event', status: 'success', duration: '18ms', output: 'File: W2_2025.pdf (2.1MB)' },
        { name: 'Virus Scan', status: 'success', duration: '4.2s', output: 'Clean' },
        { name: 'Extract Text (OCR)', status: 'failed', duration: '7.5s', output: 'OCR engine returned empty result' },
        { name: 'Store in Document Vault', status: 'skipped', duration: '–' },
      ],
      errorMessage: 'OCR extraction failed: document may be image-only or corrupted',
    },
    {
      id: 'exec-4816',
      workflowId: 'wf-002',
      workflowName: 'Campaign Email Blast',
      status: 'completed',
      timestamp: '2026-05-12 09:00:01',
      duration: '17.9s',
      triggerType: 'schedule',
      steps: [
        { name: 'Fetch Target Segment', status: 'success', duration: '1.2s', output: '142 recipients' },
        { name: 'Render Email Template', status: 'success', duration: '380ms', output: 'Template: monthly_rates' },
        { name: 'Batch Send via SendGrid', status: 'success', duration: '16.3s', output: '142/142 sent' },
      ],
    },
  ];

  const errorPatterns: ErrorPattern[] = [
    { pattern: 'SMTP connection refused (port 587)', count: 14, lastSeen: '14m ago', affectedWorkflows: 2, severity: 'high' },
    { pattern: 'PDF service timeout (>30s)', count: 9, lastSeen: '1m ago', affectedWorkflows: 1, severity: 'high' },
    { pattern: 'OCR engine empty result', count: 8, lastSeen: '6m ago', affectedWorkflows: 1, severity: 'medium' },
    { pattern: 'CRM API 429 rate limit', count: 5, lastSeen: '2h ago', affectedWorkflows: 3, severity: 'medium' },
    { pattern: 'Webhook payload missing required fields', count: 3, lastSeen: '4h ago', affectedWorkflows: 2, severity: 'low' },
  ];

  const resourceData: Record<'1h' | '6h' | '24h', ResourcePoint[]> = {
    '1h': [
      { time: '10:00', cpu: 22, memory: 41 },
      { time: '10:10', cpu: 35, memory: 43 },
      { time: '10:20', cpu: 28, memory: 44 },
      { time: '10:30', cpu: 61, memory: 52 },
      { time: '10:40', cpu: 45, memory: 50 },
      { time: '10:50', cpu: 38, memory: 48 },
    ],
    '6h': [
      { time: '05:00', cpu: 12, memory: 38 },
      { time: '06:00', cpu: 18, memory: 39 },
      { time: '07:00', cpu: 44, memory: 47 },
      { time: '08:00', cpu: 67, memory: 58 },
      { time: '09:00', cpu: 55, memory: 55 },
      { time: '10:00', cpu: 38, memory: 48 },
    ],
    '24h': [
      { time: '00:00', cpu: 8, memory: 35 },
      { time: '04:00', cpu: 12, memory: 36 },
      { time: '08:00', cpu: 67, memory: 58 },
      { time: '12:00', cpu: 72, memory: 64 },
      { time: '16:00', cpu: 58, memory: 60 },
      { time: '20:00', cpu: 31, memory: 45 },
    ],
  };

  const resources = resourceData[timeRange];

  const getStatusColor = (status: WorkflowStatus | ExecutionStatus) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'warning':
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'degraded':
      case 'running':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'error':
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: WorkflowStatus | ExecutionStatus) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return <CheckCircle2 size={14} className="text-green-400" />;
      case 'warning':
        return <AlertCircle size={14} className="text-yellow-400" />;
      case 'pending':
        return <Clock size={14} className="text-yellow-400" />;
      case 'degraded':
        return <AlertTriangle size={14} className="text-orange-400" />;
      case 'running':
        return <Activity size={14} className="text-orange-400 animate-pulse" />;
      case 'error':
      case 'failed':
        return <XCircle size={14} className="text-red-400" />;
      default:
        return <Activity size={14} className="text-gray-400" />;
    }
  };

  const getTriggerColor = (trigger: TriggerType) => {
    switch (trigger) {
      case 'webhook': return 'bg-cyan-500/20 text-cyan-300';
      case 'schedule': return 'bg-purple-500/20 text-purple-300';
      case 'manual': return 'bg-gray-500/20 text-gray-300';
      case 'event': return 'bg-pink-500/20 text-pink-300';
    }
  };

  const getSeverityColor = (severity: ErrorPattern['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getStepStatusColor = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'skipped': return 'text-slate-500';
    }
  };

  const getStepIcon = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />;
      case 'failed': return <XCircle size={14} className="text-red-400 flex-shrink-0" />;
      case 'skipped': return <Clock size={14} className="text-slate-500 flex-shrink-0" />;
    }
  };

  const maxCpu = Math.max(...resources.map((r) => r.cpu));
  const maxMem = Math.max(...resources.map((r) => r.memory));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Activepieces"
        subtitle="Workflow Automation — Execution Monitoring & Health Dashboard"
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
              <GitBranch size={14} /> Total Workflows
            </p>
            <p className="text-2xl font-bold text-cyan-400">{metrics.totalWorkflows}</p>
            <p className="text-xs text-slate-400 mt-1">
              {workflows.filter((w) => w.status === 'healthy').length} healthy
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Play size={14} /> Active Executions
            </p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
              <p className="text-2xl font-bold text-orange-400">{metrics.activeExecutions}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">{metrics.pending} pending</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <TrendingUp size={14} /> Success Rate
            </p>
            <p className="text-2xl font-bold text-green-400">{metrics.successRate}%</p>
            <p className="text-xs text-slate-400 mt-1">{metrics.failed} failed this period</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Timer size={14} /> Avg Execution Time
            </p>
            <p className="text-2xl font-bold text-purple-400">{metrics.avgExecTime}</p>
            <p className="text-xs text-slate-400 mt-1">{metrics.completed} completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Execution Status Breakdown */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 size={18} /> Execution Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Running', count: metrics.running, color: 'from-orange-500 to-orange-400', textColor: 'text-orange-400' },
              { label: 'Completed', count: metrics.completed, color: 'from-green-500 to-emerald-400', textColor: 'text-green-400' },
              { label: 'Failed', count: metrics.failed, color: 'from-red-500 to-rose-400', textColor: 'text-red-400' },
              { label: 'Pending', count: metrics.pending, color: 'from-yellow-500 to-amber-400', textColor: 'text-yellow-400' },
            ].map(({ label, count, color, textColor }) => {
              const total = metrics.running + metrics.completed + metrics.failed + metrics.pending;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={label} className="p-4 rounded border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className={`text-xs font-bold ${textColor}`}>{pct}%</p>
                  </div>
                  <p className={`text-3xl font-bold ${textColor}`}>{count.toLocaleString()}</p>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${color} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Workflows List */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap size={18} /> Active Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="flex items-center gap-4 p-4 rounded border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex-shrink-0">{getStatusIcon(wf.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white truncate">{wf.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getTriggerColor(wf.triggerType)}`}>
                      {wf.triggerType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Last run: {wf.lastExecution} • {wf.executionCount.toLocaleString()} executions
                  </p>
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          wf.successRate >= 97
                            ? 'from-green-500 to-emerald-400'
                            : wf.successRate >= 90
                            ? 'from-yellow-500 to-amber-400'
                            : 'from-red-500 to-rose-400'
                        }`}
                        style={{ width: `${wf.successRate}%` }}
                      />
                    </div>
                    <p className={`text-sm font-bold w-10 text-right ${
                      wf.successRate >= 97 ? 'text-green-400' : wf.successRate >= 90 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {wf.successRate}%
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">avg {wf.avgDuration}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Executions Timeline */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock size={18} /> Recent Executions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {executions.map((exec) => (
              <button
                key={exec.id}
                onClick={() => setSelectedExecution(exec)}
                className="w-full text-left p-4 rounded border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 p-1.5 rounded border ${getStatusColor(exec.status)}`}>
                    {getStatusIcon(exec.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-cyan-400 truncate">
                      {exec.workflowName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {exec.timestamp} · {exec.steps.length} steps
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right space-y-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getTriggerColor(exec.triggerType)}`}>
                      {exec.triggerType}
                    </span>
                    <p className="text-xs text-slate-400">{exec.duration}</p>
                  </div>
                  <span className="text-xs text-slate-600 group-hover:text-slate-400 flex-shrink-0">→</span>
                </div>
                {exec.errorMessage && (
                  <p className="text-xs text-red-400 mt-2 ml-9 truncate">{exec.errorMessage}</p>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Patterns */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={18} /> Error Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {errorPatterns.map((ep) => (
              <div key={ep.pattern} className={`flex items-center gap-4 p-4 rounded border ${getSeverityColor(ep.severity)}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{ep.pattern}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {ep.affectedWorkflows} workflow{ep.affectedWorkflows !== 1 ? 's' : ''} affected · last seen {ep.lastSeen}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right space-y-1">
                  <p className={`text-lg font-bold ${
                    ep.severity === 'high' ? 'text-red-400' : ep.severity === 'medium' ? 'text-yellow-400' : 'text-slate-400'
                  }`}>
                    {ep.count}×
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${getSeverityColor(ep.severity)}`}>
                    {ep.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage Graph */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Cpu size={18} /> Resource Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* CPU */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-400 font-medium">CPU</p>
                <p className="text-xs font-bold text-purple-400">{resources[resources.length - 1].cpu}% now</p>
              </div>
              <div className="flex items-end gap-1.5 h-20">
                {resources.map((point, i) => {
                  const heightPct = maxCpu > 0 ? (point.cpu / maxCpu) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-purple-500 to-pink-400 rounded-t opacity-80 hover:opacity-100 transition"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-xs text-slate-600">{point.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Memory */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-400 font-medium">Memory</p>
                <p className="text-xs font-bold text-cyan-400">{resources[resources.length - 1].memory}% now</p>
              </div>
              <div className="flex items-end gap-1.5 h-20">
                {resources.map((point, i) => {
                  const heightPct = maxMem > 0 ? (point.memory / maxMem) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-cyan-500 to-blue-400 rounded-t opacity-80 hover:opacity-100 transition"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-xs text-slate-600">{point.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution Detail Modal */}
      {selectedExecution && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedExecution(null)}
        >
          <Card
            className="bg-black border border-cyan-400/30 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-purple-500/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded border ${getStatusColor(selectedExecution.status)}`}>
                    {getStatusIcon(selectedExecution.status)}
                  </div>
                  <div>
                    <CardTitle className="text-white text-base">{selectedExecution.workflowName}</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">Execution #{selectedExecution.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExecution(null)}
                  className="text-gray-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <span className={`text-xs px-2 py-1 rounded border font-semibold capitalize ${getStatusColor(selectedExecution.status)}`}>
                    {selectedExecution.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Duration</p>
                  <p className="text-sm font-bold text-white">{selectedExecution.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Trigger</p>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${getTriggerColor(selectedExecution.triggerType)}`}>
                    {selectedExecution.triggerType}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Started</p>
                  <p className="text-xs text-slate-300">{selectedExecution.timestamp}</p>
                </div>
              </div>

              {/* Error Banner */}
              {selectedExecution.errorMessage && (
                <div className="p-3 rounded border border-red-500/30 bg-red-500/10 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{selectedExecution.errorMessage}</p>
                </div>
              )}

              {/* Execution Trace */}
              <div>
                <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Execution Trace</p>
                <div className="space-y-2">
                  {selectedExecution.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded border border-slate-800">
                      <div className="flex-shrink-0 mt-0.5">{getStepIcon(step.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-semibold ${getStepStatusColor(step.status)}`}>{step.name}</p>
                          <p className="text-xs text-slate-500 flex-shrink-0">{step.duration}</p>
                        </div>
                        {step.output && (
                          <p className="text-xs text-slate-500 mt-1 font-mono">{step.output}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step summary bar */}
              <div className="pt-4 border-t border-purple-500/20">
                <p className="text-xs text-slate-500 mb-3">Step Summary</p>
                <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                  {selectedExecution.steps.map((step, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${
                        step.status === 'success'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                          : step.status === 'failed'
                          ? 'bg-gradient-to-r from-red-500 to-rose-400'
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-4 mt-2">
                  <p className="text-xs text-green-400">{selectedExecution.steps.filter((s) => s.status === 'success').length} passed</p>
                  <p className="text-xs text-red-400">{selectedExecution.steps.filter((s) => s.status === 'failed').length} failed</p>
                  <p className="text-xs text-slate-500">{selectedExecution.steps.filter((s) => s.status === 'skipped').length} skipped</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
