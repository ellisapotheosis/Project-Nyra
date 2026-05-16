'use client';

import { useState } from 'react';
import {
  Bot,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Cpu,
  MemoryStick,
  X,
  ChevronRight,
  Zap,
  ListTodo,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TimeRange = '1h' | '6h' | '24h';
type AgentStatus = 'healthy' | 'warning' | 'degraded' | 'error';
type TaskStatus = 'completed' | 'running' | 'failed' | 'queued';

interface NerveAgent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  taskQueue: number;
  latencyMs: number;
  successRate: number;
  lastActivity: string;
  cpuPct: number;
  memoryMB: number;
  totalTasksCompleted: number;
  currentTask: string | null;
  uptime: string;
  responseTrend: number[];
  successTrend: number[];
  recentErrors: { message: string; time: string }[];
}

interface TaskExecution {
  id: string;
  agentId: string;
  agentName: string;
  taskName: string;
  status: TaskStatus;
  startTime: string;
  duration: string | null;
  inputTokens: number;
  outputTokens: number;
  errorMessage: string | null;
}

interface ErrorWarning {
  type: 'error' | 'warning';
  agentName: string;
  message: string;
  count: number;
  lastSeen: string;
  trend: 'up' | 'down' | 'flat';
}

const AGENTS: NerveAgent[] = [
  {
    id: 'ag-001',
    name: 'QuoteAgent',
    role: 'Mortgage Quote Generation',
    status: 'healthy',
    taskQueue: 3,
    latencyMs: 420,
    successRate: 98.2,
    lastActivity: '8s ago',
    cpuPct: 24,
    memoryMB: 312,
    totalTasksCompleted: 4821,
    currentTask: 'GenerateQuote(lead_id: LC-4821)',
    uptime: '18h 42m',
    responseTrend: [380, 410, 395, 420, 405, 420, 415, 420],
    successTrend: [98.0, 98.4, 97.9, 98.2, 98.5, 98.1, 98.3, 98.2],
    recentErrors: [],
  },
  {
    id: 'ag-002',
    name: 'ComplianceEngine',
    role: 'TILA / RESPA / TRID Validation',
    status: 'healthy',
    taskQueue: 1,
    latencyMs: 185,
    successRate: 99.7,
    lastActivity: '2m ago',
    cpuPct: 11,
    memoryMB: 128,
    totalTasksCompleted: 2103,
    currentTask: null,
    uptime: '18h 42m',
    responseTrend: [180, 190, 182, 185, 178, 188, 183, 185],
    successTrend: [99.5, 99.8, 99.6, 99.7, 99.9, 99.7, 99.6, 99.7],
    recentErrors: [],
  },
  {
    id: 'ag-003',
    name: 'LeadRouter',
    role: 'Lead Qualification & Routing',
    status: 'warning',
    taskQueue: 12,
    latencyMs: 890,
    successRate: 91.4,
    lastActivity: '4s ago',
    cpuPct: 67,
    memoryMB: 548,
    totalTasksCompleted: 9341,
    currentTask: 'RouteLeads(batch: 48)',
    uptime: '18h 42m',
    responseTrend: [480, 520, 610, 720, 780, 850, 870, 890],
    successTrend: [96.2, 95.1, 93.8, 92.9, 91.8, 91.5, 91.2, 91.4],
    recentErrors: [
      { message: 'Queue depth exceeded soft limit (10)', time: '4s ago' },
      { message: 'Lead scoring model response timeout', time: '18m ago' },
    ],
  },
  {
    id: 'ag-004',
    name: 'CampaignWorker',
    role: 'Email / SMS Campaign Dispatch',
    status: 'healthy',
    taskQueue: 0,
    latencyMs: 220,
    successRate: 97.6,
    lastActivity: '12m ago',
    cpuPct: 8,
    memoryMB: 96,
    totalTasksCompleted: 1456,
    currentTask: null,
    uptime: '18h 42m',
    responseTrend: [215, 222, 218, 225, 220, 218, 221, 220],
    successTrend: [97.8, 97.5, 97.7, 97.6, 97.9, 97.4, 97.8, 97.6],
    recentErrors: [],
  },
  {
    id: 'ag-005',
    name: 'DocProcessor',
    role: 'OCR & Document Extraction',
    status: 'degraded',
    taskQueue: 5,
    latencyMs: 2840,
    successRate: 84.3,
    lastActivity: '22s ago',
    cpuPct: 88,
    memoryMB: 1024,
    totalTasksCompleted: 892,
    currentTask: 'ProcessDocument(doc_id: DOC-2291)',
    uptime: '5h 14m',
    responseTrend: [1200, 1450, 1680, 1920, 2100, 2400, 2620, 2840],
    successTrend: [94.1, 92.0, 90.5, 88.8, 87.2, 86.1, 84.8, 84.3],
    recentErrors: [
      { message: 'OCR confidence below threshold for 3 docs', time: '22s ago' },
      { message: 'Memory pressure: GC pause 340ms', time: '4m ago' },
      { message: 'Unsupported format HEIC rejected', time: '31m ago' },
    ],
  },
  {
    id: 'ag-006',
    name: 'AuditLogger',
    role: 'Compliance Audit Trail',
    status: 'error',
    taskQueue: 0,
    latencyMs: 0,
    successRate: 0,
    lastActivity: '8m ago',
    cpuPct: 0,
    memoryMB: 64,
    totalTasksCompleted: 284721,
    currentTask: null,
    uptime: 'CRASHED',
    responseTrend: [38, 35, 40, 42, 38, 0, 0, 0],
    successTrend: [100, 100, 100, 100, 100, 0, 0, 0],
    recentErrors: [
      { message: 'Panic: write to immutable audit log rejected', time: '8m ago' },
      { message: 'Index rebuild failed — disk write error', time: '8m ago' },
    ],
  },
];

const TASK_HISTORY: TaskExecution[] = [
  { id: 't-001', agentId: 'ag-001', agentName: 'QuoteAgent', taskName: 'GenerateQuote(LC-4821)', status: 'running', startTime: '10:55:34', duration: null, inputTokens: 1240, outputTokens: 0, errorMessage: null },
  { id: 't-002', agentId: 'ag-002', agentName: 'ComplianceEngine', taskName: 'ValidateTRID(LC-4820)', status: 'completed', startTime: '10:55:12', duration: '182ms', inputTokens: 890, outputTokens: 412, errorMessage: null },
  { id: 't-003', agentId: 'ag-003', agentName: 'LeadRouter', taskName: 'RouteLeads(batch:48)', status: 'running', startTime: '10:55:08', duration: null, inputTokens: 3200, outputTokens: 0, errorMessage: null },
  { id: 't-004', agentId: 'ag-005', agentName: 'DocProcessor', taskName: 'ProcessDocument(DOC-2291)', status: 'running', startTime: '10:55:02', duration: null, inputTokens: 512, outputTokens: 0, errorMessage: null },
  { id: 't-005', agentId: 'ag-006', agentName: 'AuditLogger', taskName: 'WriteAuditEntry(LC-4819)', status: 'failed', startTime: '10:54:48', duration: '—', inputTokens: 220, outputTokens: 0, errorMessage: 'Panic: write to immutable audit log rejected' },
  { id: 't-006', agentId: 'ag-001', agentName: 'QuoteAgent', taskName: 'GenerateQuote(LC-4818)', status: 'completed', startTime: '10:54:22', duration: '408ms', inputTokens: 1180, outputTokens: 894, errorMessage: null },
  { id: 't-007', agentId: 'ag-004', agentName: 'CampaignWorker', taskName: 'SendDripEmail(camp:18)', status: 'completed', startTime: '10:43:11', duration: '214ms', inputTokens: 640, outputTokens: 310, errorMessage: null },
  { id: 't-008', agentId: 'ag-003', agentName: 'LeadRouter', taskName: 'ScoreLead(LC-4817)', status: 'failed', startTime: '10:40:05', duration: '—', inputTokens: 820, outputTokens: 0, errorMessage: 'Lead scoring model response timeout after 30s' },
  { id: 't-009', agentId: 'ag-002', agentName: 'ComplianceEngine', taskName: 'ValidateRESPA(LC-4816)', status: 'completed', startTime: '10:38:50', duration: '175ms', inputTokens: 910, outputTokens: 388, errorMessage: null },
  { id: 't-010', agentId: 'ag-005', agentName: 'DocProcessor', taskName: 'ProcessDocument(DOC-2290)', status: 'completed', startTime: '10:30:14', duration: '2810ms', inputTokens: 480, outputTokens: 920, errorMessage: null },
];

const ERRORS_WARNINGS: ErrorWarning[] = [
  { type: 'error', agentName: 'AuditLogger', message: 'Panic: write to immutable audit log rejected — disk write error', count: 2, lastSeen: '8m ago', trend: 'up' },
  { type: 'warning', agentName: 'LeadRouter', message: 'Queue depth exceeded soft limit (10) — 12 tasks pending', count: 1, lastSeen: '4s ago', trend: 'up' },
  { type: 'warning', agentName: 'DocProcessor', message: 'Memory pressure: GC pause 340ms, CPU at 88%', count: 3, lastSeen: '4m ago', trend: 'up' },
  { type: 'warning', agentName: 'LeadRouter', message: 'Lead scoring model response timeout — latency degraded', count: 5, lastSeen: '18m ago', trend: 'flat' },
  { type: 'warning', agentName: 'DocProcessor', message: 'OCR confidence below 70% threshold on 3 documents', count: 3, lastSeen: '22s ago', trend: 'down' },
];

const METRICS_BY_RANGE: Record<TimeRange, {
  totalAgents: number;
  activeAgents: number;
  taskCompletionRate: string;
  avgResponseMs: number;
}> = {
  '1h': { totalAgents: 6, activeAgents: 4, taskCompletionRate: '94.1%', avgResponseMs: 760 },
  '6h': { totalAgents: 6, activeAgents: 5, taskCompletionRate: '95.8%', avgResponseMs: 680 },
  '24h': { totalAgents: 6, activeAgents: 6, taskCompletionRate: '96.4%', avgResponseMs: 590 },
};

// --- helpers ---

function agentStatusConfig(status: AgentStatus) {
  const cfg: Record<AgentStatus, { label: string; cls: string; dot: string; textColor: string }> = {
    healthy:  { label: 'Healthy',  cls: 'bg-green-500/20 text-green-400',  dot: 'bg-green-400',  textColor: 'text-green-400' },
    warning:  { label: 'Warning',  cls: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400', textColor: 'text-yellow-400' },
    degraded: { label: 'Degraded', cls: 'bg-orange-500/20 text-orange-400', dot: 'bg-orange-400', textColor: 'text-orange-400' },
    error:    { label: 'Error',    cls: 'bg-red-500/20 text-red-400',       dot: 'bg-red-400',    textColor: 'text-red-400' },
  };
  return cfg[status];
}

function taskStatusConfig(status: TaskStatus) {
  switch (status) {
    case 'completed': return { label: 'Completed', cls: 'bg-green-500/20 text-green-400',  icon: <CheckCircle2 size={12} className="text-green-400" /> };
    case 'running':   return { label: 'Running',   cls: 'bg-cyan-500/20 text-cyan-400',    icon: <RefreshCw size={12} className="text-cyan-400 animate-spin" /> };
    case 'failed':    return { label: 'Failed',    cls: 'bg-red-500/20 text-red-400',      icon: <XCircle size={12} className="text-red-400" /> };
    case 'queued':    return { label: 'Queued',    cls: 'bg-gray-500/20 text-gray-400',    icon: <Clock size={12} className="text-gray-400" /> };
  }
}

function latencyColor(ms: number): string {
  if (ms === 0) return 'text-red-400';
  if (ms < 500) return 'text-green-400';
  if (ms < 1000) return 'text-yellow-400';
  if (ms < 2000) return 'text-orange-400';
  return 'text-red-400';
}

function successRateColor(rate: number): string {
  if (rate === 0) return 'text-red-400';
  if (rate >= 97) return 'text-green-400';
  if (rate >= 93) return 'text-yellow-400';
  if (rate >= 85) return 'text-orange-400';
  return 'text-red-400';
}

function cpuBarColor(pct: number): string {
  if (pct >= 80) return 'from-red-500 to-orange-400';
  if (pct >= 60) return 'from-orange-500 to-yellow-400';
  return 'from-purple-500 to-pink-400';
}

function memBarColor(mb: number): string {
  if (mb >= 900) return 'from-red-500 to-orange-400';
  if (mb >= 500) return 'from-orange-500 to-yellow-400';
  return 'from-cyan-500 to-purple-400';
}

function MiniSparkline({ data, color = '#a855f7' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pad = 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-7" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up')   return <TrendingUp size={12} className="text-red-400" />;
  if (trend === 'down') return <TrendingUp size={12} className="text-green-400 rotate-180" />;
  return <Activity size={12} className="text-slate-400" />;
}

export default function NervePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [selectedAgent, setSelectedAgent] = useState<NerveAgent | null>(null);

  const metrics = METRICS_BY_RANGE[timeRange];

  const healthyCnt  = AGENTS.filter(a => a.status === 'healthy').length;
  const warningCnt  = AGENTS.filter(a => a.status === 'warning').length;
  const degradedCnt = AGENTS.filter(a => a.status === 'degraded').length;
  const errorCnt    = AGENTS.filter(a => a.status === 'error').length;

  return (
    <div className="min-h-screen bg-black/95">
      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* Header + Time Range */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Nerve
            </h1>
            <p className="text-gray-400">Agent orchestration monitor — task execution, performance, and resource utilization</p>
          </div>
          <div className="flex items-center gap-1 bg-black/40 border border-purple-500/20 rounded-lg p-1 flex-shrink-0">
            {(['1h', '6h', '24h'] as TimeRange[]).map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-4 py-1.5 rounded text-sm font-medium transition ${
                  timeRange === r
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Total Nerve Agents</p>
                <Bot size={16} className="text-cyan-400" />
              </div>
              <p className="text-3xl font-bold text-cyan-400">{metrics.totalAgents}</p>
              <p className="text-xs text-gray-600 mt-1">{healthyCnt} healthy</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Active Agents</p>
                <Activity size={16} className="text-green-400" />
              </div>
              <p className="text-3xl font-bold text-green-400">{metrics.activeAgents}</p>
              <p className="text-xs text-gray-600 mt-1">processing tasks</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Task Completion Rate</p>
                <CheckCircle2 size={16} className="text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-purple-400">{metrics.taskCompletionRate}</p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-400"
                  style={{ width: metrics.taskCompletionRate }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Avg Response Time</p>
                <Clock size={16} className="text-pink-400" />
              </div>
              <p className="text-3xl font-bold text-pink-400">{metrics.avgResponseMs}ms</p>
              <p className="text-xs text-gray-600 mt-1">across all agents</p>
            </CardContent>
          </Card>
        </div>

        {/* Fleet Health Summary Bar */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 size={18} /> Agent Fleet Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-4">
              {healthyCnt  > 0 && <div className="bg-green-500  opacity-80" style={{ width: `${(healthyCnt / AGENTS.length) * 100}%` }} title={`Healthy: ${healthyCnt}`} />}
              {warningCnt  > 0 && <div className="bg-yellow-500 opacity-80" style={{ width: `${(warningCnt / AGENTS.length) * 100}%` }} title={`Warning: ${warningCnt}`} />}
              {degradedCnt > 0 && <div className="bg-orange-500 opacity-80" style={{ width: `${(degradedCnt / AGENTS.length) * 100}%` }} title={`Degraded: ${degradedCnt}`} />}
              {errorCnt    > 0 && <div className="bg-red-500    opacity-80" style={{ width: `${(errorCnt / AGENTS.length) * 100}%` }} title={`Error: ${errorCnt}`} />}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Healthy',  count: healthyCnt,  dotCls: 'bg-green-400',  textCls: 'text-green-400' },
                { label: 'Warning',  count: warningCnt,  dotCls: 'bg-yellow-400', textCls: 'text-yellow-400' },
                { label: 'Degraded', count: degradedCnt, dotCls: 'bg-orange-400', textCls: 'text-orange-400' },
                { label: 'Error',    count: errorCnt,    dotCls: 'bg-red-400',    textCls: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dotCls}`} />
                  <div>
                    <p className={`text-sm font-bold ${s.textCls}`}>{s.count}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent Status Grid */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-5">
            <Bot size={18} className="text-cyan-400" />
            Agent Status Grid
          </h2>
          <div className="space-y-2">
            {AGENTS.map(agent => {
              const sc = agentStatusConfig(agent.status);
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="w-full text-left border border-purple-500/10 hover:border-purple-500/30 p-4 rounded transition group"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Name + status */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sc.dot} ${agent.status === 'healthy' ? 'animate-pulse' : ''}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-white group-hover:text-cyan-400 font-mono">{agent.name}</p>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${sc.cls}`}>
                            {sc.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{agent.role}</p>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="hidden md:grid grid-cols-4 gap-6 flex-shrink-0 text-right">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Queue</p>
                        <p className={`text-sm font-bold ${agent.taskQueue > 8 ? 'text-orange-400' : agent.taskQueue > 4 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {agent.taskQueue}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Latency</p>
                        <p className={`text-sm font-bold ${latencyColor(agent.latencyMs)}`}>
                          {agent.latencyMs === 0 ? '—' : `${agent.latencyMs}ms`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Success</p>
                        <p className={`text-sm font-bold ${successRateColor(agent.successRate)}`}>
                          {agent.successRate === 0 ? '—' : `${agent.successRate}%`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Last Active</p>
                        <p className="text-sm font-bold text-gray-300">{agent.lastActivity}</p>
                      </div>
                    </div>

                    <ChevronRight size={16} className="text-gray-600 group-hover:text-cyan-400 flex-shrink-0" />
                  </div>

                  {/* Mobile stats */}
                  <div className="md:hidden grid grid-cols-4 gap-2 mt-3 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Queue</p>
                      <p className={`text-sm font-bold ${agent.taskQueue > 8 ? 'text-orange-400' : 'text-green-400'}`}>{agent.taskQueue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Latency</p>
                      <p className={`text-sm font-bold ${latencyColor(agent.latencyMs)}`}>{agent.latencyMs === 0 ? '—' : `${agent.latencyMs}ms`}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Success</p>
                      <p className={`text-sm font-bold ${successRateColor(agent.successRate)}`}>{agent.successRate === 0 ? '—' : `${agent.successRate}%`}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Active</p>
                      <p className="text-sm font-bold text-gray-300">{agent.lastActivity}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Task Execution Timeline */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-5">
            <ListTodo size={18} className="text-pink-400" />
            Task Execution History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-purple-500/10">
                  <th className="text-left pb-3 pr-4">Task</th>
                  <th className="text-left pb-3 pr-4">Agent</th>
                  <th className="text-left pb-3 pr-4">Start</th>
                  <th className="text-left pb-3 pr-4">Duration</th>
                  <th className="text-left pb-3 pr-4">Tokens In/Out</th>
                  <th className="text-left pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/5">
                {TASK_HISTORY.map(task => {
                  const sc = taskStatusConfig(task.status);
                  return (
                    <tr key={task.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 pr-4">
                        <p className="text-xs font-mono text-gray-300 truncate max-w-[180px]">{task.taskName}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-purple-400 font-semibold">{task.agentName}</span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-500 font-mono">{task.startTime}</td>
                      <td className="py-3 pr-4">
                        {task.duration
                          ? <span className="text-xs font-mono text-cyan-400">{task.duration}</span>
                          : <span className="text-xs text-gray-600">—</span>
                        }
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-400 font-mono">
                        {task.inputTokens}/{task.outputTokens > 0 ? task.outputTokens : '…'}
                      </td>
                      <td className="py-3">
                        <div>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${sc.cls}`}>
                            {sc.icon} {sc.label}
                          </span>
                          {task.errorMessage && (
                            <p className="text-xs text-red-400 mt-1 max-w-[200px] truncate">{task.errorMessage}</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agent Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Response Time Trends */}
          <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
              <TrendingUp size={18} className="text-purple-400" />
              Response Time Trends
            </h2>
            <div className="space-y-4">
              {AGENTS.filter(a => a.status !== 'error').map(agent => (
                <div key={agent.id} className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-gray-300 truncate">{agent.name}</p>
                    <p className={`text-xs font-bold mt-0.5 ${latencyColor(agent.latencyMs)}`}>
                      {agent.latencyMs}ms
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <MiniSparkline
                      data={agent.responseTrend}
                      color={agent.status === 'healthy' ? '#22c55e' : agent.status === 'warning' ? '#eab308' : '#f97316'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Success Rate Trends */}
          <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
              <Zap size={18} className="text-cyan-400" />
              Success Rate Trends
            </h2>
            <div className="space-y-4">
              {AGENTS.filter(a => a.status !== 'error').map(agent => {
                const barW = agent.successRate;
                return (
                  <div key={agent.id}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono text-gray-300">{agent.name}</span>
                      <span className={`font-bold ${successRateColor(agent.successRate)}`}>{agent.successRate}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          agent.successRate >= 97 ? 'bg-gradient-to-r from-green-500 to-cyan-400' :
                          agent.successRate >= 93 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                          'bg-gradient-to-r from-orange-500 to-red-400'
                        }`}
                        style={{ width: `${barW}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resource Usage Dashboard */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-5">
            <Cpu size={18} className="text-pink-400" />
            Resource Usage by Agent
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENTS.map(agent => {
              const sc = agentStatusConfig(agent.status);
              const maxMem = 1024;
              return (
                <div key={agent.id} className="border border-purple-500/10 rounded p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono font-semibold text-white truncate">{agent.name}</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium ${sc.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>

                  {agent.status === 'error' ? (
                    <p className="text-xs text-red-400 font-semibold">Agent crashed — no resource data</p>
                  ) : (
                    <>
                      {/* CPU */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500 flex items-center gap-1"><Cpu size={10} /> CPU</span>
                          <span className={`font-mono font-semibold ${agent.cpuPct >= 80 ? 'text-red-400' : agent.cpuPct >= 60 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                            {agent.cpuPct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full bg-gradient-to-r ${cpuBarColor(agent.cpuPct)}`}
                            style={{ width: `${agent.cpuPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Memory */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500 flex items-center gap-1"><MemoryStick size={10} /> Mem</span>
                          <span className={`font-mono font-semibold ${agent.memoryMB >= 900 ? 'text-red-400' : agent.memoryMB >= 500 ? 'text-yellow-400' : 'text-purple-400'}`}>
                            {agent.memoryMB} MB
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full bg-gradient-to-r ${memBarColor(agent.memoryMB)}`}
                            style={{ width: `${(agent.memoryMB / maxMem) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-600 pt-1">
                        <span>Uptime: <span className="text-gray-400">{agent.uptime}</span></span>
                        <span>Tasks: <span className="text-gray-400">{agent.totalTasksCompleted.toLocaleString()}</span></span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Errors & Warnings */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-5">
            <AlertTriangle size={18} className="text-orange-400" />
            Errors &amp; Warnings
          </h2>
          <div className="space-y-3">
            {ERRORS_WARNINGS.map((item, idx) => (
              <div key={idx} className={`flex items-start gap-4 p-4 rounded border transition ${
                item.type === 'error'
                  ? 'border-red-500/20 bg-red-500/5 hover:border-red-500/30'
                  : 'border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/30'
              }`}>
                <div className="flex-shrink-0 mt-0.5">
                  {item.type === 'error'
                    ? <AlertCircle size={16} className="text-red-400" />
                    : <AlertTriangle size={16} className="text-yellow-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-white">{item.agentName}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase ${
                      item.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>{item.type}</span>
                    <span className="flex items-center gap-1"><TrendIcon trend={item.trend} /></span>
                  </div>
                  <p className="text-xs text-gray-300">{item.message}</p>
                  <p className="text-xs text-gray-600 mt-1">Last seen: {item.lastSeen}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-lg font-bold ${item.type === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>{item.count}</p>
                  <p className="text-xs text-gray-500">occurrences</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAgent(null)}
        >
          <div
            className="bg-black border border-purple-500/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-purple-500/20 bg-black/90 backdrop-blur">
              <div className="flex items-center gap-3 min-w-0">
                <Bot size={18} className="text-cyan-400 flex-shrink-0" />
                <h2 className="text-lg font-bold text-white font-mono truncate">{selectedAgent.name}</h2>
                {(() => {
                  const sc = agentStatusConfig(selectedAgent.status);
                  return (
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${sc.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  );
                })()}
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="p-1.5 hover:bg-red-500/20 rounded transition flex-shrink-0 ml-4"
              >
                <X size={18} className="text-red-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Role + Current Task */}
              <div className="space-y-3">
                <div className="flex justify-between p-3 rounded border border-purple-500/10">
                  <span className="text-xs text-gray-500">Role</span>
                  <span className="text-xs text-gray-200 font-medium">{selectedAgent.role}</span>
                </div>
                <div className="flex justify-between p-3 rounded border border-purple-500/10">
                  <span className="text-xs text-gray-500">Uptime</span>
                  <span className={`text-xs font-medium ${selectedAgent.uptime === 'CRASHED' ? 'text-red-400' : 'text-green-400'}`}>
                    {selectedAgent.uptime}
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded border border-purple-500/10">
                  <span className="text-xs text-gray-500">Current Task</span>
                  <span className="text-xs font-mono text-cyan-400 truncate max-w-xs text-right">
                    {selectedAgent.currentTask ?? 'Idle'}
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded border border-purple-500/10">
                  <span className="text-xs text-gray-500">Total Tasks Completed</span>
                  <span className="text-xs font-bold text-purple-400">{selectedAgent.totalTasksCompleted.toLocaleString()}</span>
                </div>
              </div>

              {/* Performance */}
              <div>
                <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Performance</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded border border-purple-500/10 text-center">
                    <p className={`text-xl font-bold ${latencyColor(selectedAgent.latencyMs)}`}>
                      {selectedAgent.latencyMs === 0 ? '—' : `${selectedAgent.latencyMs}ms`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Response Latency</p>
                  </div>
                  <div className="p-3 rounded border border-purple-500/10 text-center">
                    <p className={`text-xl font-bold ${successRateColor(selectedAgent.successRate)}`}>
                      {selectedAgent.successRate === 0 ? '—' : `${selectedAgent.successRate}%`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Success Rate</p>
                  </div>
                  <div className="p-3 rounded border border-purple-500/10 text-center">
                    <p className={`text-xl font-bold ${selectedAgent.taskQueue > 8 ? 'text-orange-400' : 'text-green-400'}`}>
                      {selectedAgent.taskQueue}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Task Queue</p>
                  </div>
                </div>
              </div>

              {/* Response Time Sparkline */}
              <div>
                <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Response Trend (recent)</p>
                <div className="p-3 rounded border border-purple-500/10 bg-black/40">
                  {selectedAgent.status === 'error' ? (
                    <p className="text-xs text-red-400 text-center py-2">No data — agent crashed</p>
                  ) : (
                    <svg viewBox="0 0 300 60" className="w-full h-16" preserveAspectRatio="none">
                      {(() => {
                        const data = selectedAgent.responseTrend;
                        const max = Math.max(...data);
                        const min = Math.min(...data);
                        const range = max - min || 1;
                        const w = 300; const h = 60; const pad = 4;
                        const points = data.map((v, i) => {
                          const x = pad + (i / (data.length - 1)) * (w - pad * 2);
                          const y = h - pad - ((v - min) / range) * (h - pad * 2);
                          return `${x},${y}`;
                        }).join(' ');
                        const areaPoints = [
                          `${pad},${h - pad}`,
                          ...data.map((v, i) => {
                            const x = pad + (i / (data.length - 1)) * (w - pad * 2);
                            const y = h - pad - ((v - min) / range) * (h - pad * 2);
                            return `${x},${y}`;
                          }),
                          `${w - pad},${h - pad}`,
                        ].join(' ');
                        const color = selectedAgent.status === 'healthy' ? '#22c55e' : selectedAgent.status === 'warning' ? '#eab308' : '#f97316';
                        const gradId = `grad-${selectedAgent.id}`;
                        return (
                          <>
                            <defs>
                              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                                <stop offset="100%" stopColor={color} stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <polygon points={areaPoints} fill={`url(#${gradId})`} />
                            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </>
                        );
                      })()}
                    </svg>
                  )}
                </div>
              </div>

              {/* Resource Usage */}
              {selectedAgent.status !== 'error' && (
                <div>
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Resource Usage</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-400 flex items-center gap-1"><Cpu size={10} /> CPU Usage</span>
                        <span className={`font-mono font-bold ${selectedAgent.cpuPct >= 80 ? 'text-red-400' : selectedAgent.cpuPct >= 60 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                          {selectedAgent.cpuPct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${cpuBarColor(selectedAgent.cpuPct)}`}
                          style={{ width: `${selectedAgent.cpuPct}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-400 flex items-center gap-1"><MemoryStick size={10} /> Memory</span>
                        <span className={`font-mono font-bold ${selectedAgent.memoryMB >= 900 ? 'text-red-400' : selectedAgent.memoryMB >= 500 ? 'text-yellow-400' : 'text-purple-400'}`}>
                          {selectedAgent.memoryMB} MB
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${memBarColor(selectedAgent.memoryMB)}`}
                          style={{ width: `${(selectedAgent.memoryMB / 1024) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Errors */}
              {selectedAgent.recentErrors.length > 0 && (
                <div className="border-t border-purple-500/20 pt-4">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Recent Errors</p>
                  <div className="space-y-2">
                    {selectedAgent.recentErrors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded border border-red-500/20 bg-red-500/5">
                        <AlertCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-red-300">{err.message}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{err.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
