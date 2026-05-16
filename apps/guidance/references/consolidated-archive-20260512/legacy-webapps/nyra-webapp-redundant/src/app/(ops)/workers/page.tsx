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
  HardDrive,
  ListTodo,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Timer,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = '1h' | '6h' | '24h';
type WorkerStatus = 'active' | 'idle' | 'paused' | 'draining' | 'error';
type PoolHealth = 'healthy' | 'warning' | 'degraded' | 'error';
type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

interface ActiveTask {
  id: string;
  name: string;
  startedAt: string;
  elapsedMs: number;
  type: string;
}

interface TaskHistoryItem {
  id: string;
  name: string;
  status: 'completed' | 'failed';
  durationMs: number;
  completedAt: string;
  type: string;
}

interface Worker {
  id: string;
  label: string;
  status: WorkerStatus;
  assignedTasks: number;
  completedTasks: number;
  successRate: number;
  cpuPct: number;
  memPct: number;
  uptimeMinutes: number;
  tasksPerHour: number;
  avgLatencyMs: number;
  errorRate: number;
  activeTasks: ActiveTask[];
  taskHistory: TaskHistoryItem[];
  memUsedMb: number;
  memTotalMb: number;
}

interface QueuePoint {
  time: string;
  pending: number;
  inProgress: number;
  completed: number;
}

interface PerfPoint {
  time: string;
  tasksPerHour: number;
  avgLatencyMs: number;
  errorRate: number;
}

interface FailedTask {
  id: string;
  name: string;
  workerId: string;
  workerLabel: string;
  failedAt: string;
  reason: string;
  attempts: number;
  type: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const WORKERS: Worker[] = [
  {
    id: 'worker-001',
    label: 'nyra-worker-01',
    status: 'active',
    assignedTasks: 4,
    completedTasks: 1842,
    successRate: 98.7,
    cpuPct: 74,
    memPct: 61,
    uptimeMinutes: 14280,
    tasksPerHour: 62,
    avgLatencyMs: 284,
    errorRate: 1.3,
    memUsedMb: 3942,
    memTotalMb: 6400,
    activeTasks: [
      { id: 'task-a1', name: 'Lead qualification — Smith, J.', startedAt: '11:02', elapsedMs: 18400, type: 'lead-qualify' },
      { id: 'task-a2', name: 'Quote generation — Ref #QT-8821', startedAt: '11:04', elapsedMs: 9200,  type: 'quote-gen'   },
      { id: 'task-a3', name: 'Document parse — W2 upload',      startedAt: '11:05', elapsedMs: 4100,  type: 'doc-parse'   },
      { id: 'task-a4', name: 'Rate lookup — 30yr fixed',        startedAt: '11:06', elapsedMs: 1800,  type: 'rate-lookup' },
    ],
    taskHistory: [
      { id: 'hist-01', name: 'Lead score — Davis, R.',    status: 'completed', durationMs: 312,  completedAt: '11:01', type: 'lead-score'  },
      { id: 'hist-02', name: 'Compliance check — #CR-440', status: 'completed', durationMs: 890,  completedAt: '10:58', type: 'compliance'  },
      { id: 'hist-03', name: 'Quote gen — Ref #QT-8819',  status: 'failed',    durationMs: 5100, completedAt: '10:54', type: 'quote-gen'   },
      { id: 'hist-04', name: 'Campaign trigger — #C-201', status: 'completed', durationMs: 140,  completedAt: '10:51', type: 'campaign'    },
      { id: 'hist-05', name: 'Rate lookup — 15yr fixed',  status: 'completed', durationMs: 198,  completedAt: '10:48', type: 'rate-lookup' },
    ],
  },
  {
    id: 'worker-002',
    label: 'nyra-worker-02',
    status: 'active',
    assignedTasks: 2,
    completedTasks: 2104,
    successRate: 99.1,
    cpuPct: 42,
    memPct: 44,
    uptimeMinutes: 20160,
    tasksPerHour: 48,
    avgLatencyMs: 198,
    errorRate: 0.9,
    memUsedMb: 2842,
    memTotalMb: 6400,
    activeTasks: [
      { id: 'task-b1', name: 'Compliance check — #CR-442', startedAt: '11:05', elapsedMs: 7800,  type: 'compliance' },
      { id: 'task-b2', name: 'Lead score — Martinez, K.', startedAt: '11:06', elapsedMs: 2400,  type: 'lead-score' },
    ],
    taskHistory: [
      { id: 'hist-11', name: 'Rate alert dispatch — #RA-98',  status: 'completed', durationMs: 88,  completedAt: '11:03', type: 'alert'      },
      { id: 'hist-12', name: 'Document parse — 1003 form',    status: 'completed', durationMs: 640, completedAt: '10:59', type: 'doc-parse'  },
      { id: 'hist-13', name: 'Lead qualify — Thompson, A.',   status: 'completed', durationMs: 310, completedAt: '10:56', type: 'lead-qualify'},
      { id: 'hist-14', name: 'Campaign trigger — #C-202',     status: 'completed', durationMs: 125, completedAt: '10:52', type: 'campaign'   },
      { id: 'hist-15', name: 'Quote gen — Ref #QT-8818',      status: 'completed', durationMs: 920, completedAt: '10:49', type: 'quote-gen'  },
    ],
  },
  {
    id: 'worker-003',
    label: 'nyra-worker-03',
    status: 'draining',
    assignedTasks: 1,
    completedTasks: 987,
    successRate: 96.8,
    cpuPct: 18,
    memPct: 35,
    uptimeMinutes: 8640,
    tasksPerHour: 11,
    avgLatencyMs: 410,
    errorRate: 3.2,
    memUsedMb: 2240,
    memTotalMb: 6400,
    activeTasks: [
      { id: 'task-c1', name: 'Document parse — Pay stubs', startedAt: '11:03', elapsedMs: 22000, type: 'doc-parse' },
    ],
    taskHistory: [
      { id: 'hist-21', name: 'Rate lookup — ARM 5/1',       status: 'failed',    durationMs: 30100, completedAt: '10:44', type: 'rate-lookup' },
      { id: 'hist-22', name: 'Lead qualify — Garcia, M.',   status: 'completed', durationMs: 480,   completedAt: '10:30', type: 'lead-qualify'},
      { id: 'hist-23', name: 'Quote gen — Ref #QT-8815',    status: 'failed',    durationMs: 30200, completedAt: '10:12', type: 'quote-gen'   },
      { id: 'hist-24', name: 'Compliance check — #CR-438',  status: 'completed', durationMs: 1100,  completedAt: '09:55', type: 'compliance'  },
      { id: 'hist-25', name: 'Lead score — Williams, B.',   status: 'completed', durationMs: 290,   completedAt: '09:40', type: 'lead-score'  },
    ],
  },
  {
    id: 'worker-004',
    label: 'nyra-worker-04',
    status: 'idle',
    assignedTasks: 0,
    completedTasks: 1561,
    successRate: 97.9,
    cpuPct: 4,
    memPct: 28,
    uptimeMinutes: 11520,
    tasksPerHour: 0,
    avgLatencyMs: 241,
    errorRate: 2.1,
    memUsedMb: 1792,
    memTotalMb: 6400,
    activeTasks: [],
    taskHistory: [
      { id: 'hist-31', name: 'Rate lookup — Jumbo 30yr',     status: 'completed', durationMs: 210, completedAt: '10:48', type: 'rate-lookup'  },
      { id: 'hist-32', name: 'Lead score — Chen, L.',        status: 'completed', durationMs: 330, completedAt: '10:42', type: 'lead-score'   },
      { id: 'hist-33', name: 'Campaign trigger — #C-199',    status: 'completed', durationMs: 118, completedAt: '10:36', type: 'campaign'     },
      { id: 'hist-34', name: 'Document parse — Bank stmts',  status: 'failed',    durationMs: 5400, completedAt: '10:28', type: 'doc-parse'   },
      { id: 'hist-35', name: 'Lead qualify — Johnson, R.',   status: 'completed', durationMs: 395, completedAt: '10:18', type: 'lead-qualify' },
    ],
  },
  {
    id: 'worker-005',
    label: 'nyra-worker-05',
    status: 'paused',
    assignedTasks: 0,
    completedTasks: 412,
    successRate: 94.2,
    cpuPct: 0,
    memPct: 22,
    uptimeMinutes: 2880,
    tasksPerHour: 0,
    avgLatencyMs: 528,
    errorRate: 5.8,
    memUsedMb: 1408,
    memTotalMb: 6400,
    activeTasks: [],
    taskHistory: [
      { id: 'hist-41', name: 'Quote gen — Ref #QT-8810',    status: 'failed',    durationMs: 30400, completedAt: '09:12', type: 'quote-gen'   },
      { id: 'hist-42', name: 'Compliance check — #CR-430',  status: 'completed', durationMs: 1240,  completedAt: '09:01', type: 'compliance'  },
      { id: 'hist-43', name: 'Lead qualify — Brown, T.',    status: 'failed',    durationMs: 30100, completedAt: '08:47', type: 'lead-qualify' },
      { id: 'hist-44', name: 'Rate lookup — FHA 30yr',      status: 'completed', durationMs: 290,   completedAt: '08:34', type: 'rate-lookup'  },
      { id: 'hist-45', name: 'Lead score — Wilson, P.',     status: 'completed', durationMs: 310,   completedAt: '08:21', type: 'lead-score'   },
    ],
  },
  {
    id: 'worker-006',
    label: 'nyra-worker-06',
    status: 'error',
    assignedTasks: 0,
    completedTasks: 238,
    successRate: 88.2,
    cpuPct: 0,
    memPct: 0,
    uptimeMinutes: 0,
    tasksPerHour: 0,
    avgLatencyMs: 0,
    errorRate: 11.8,
    memUsedMb: 0,
    memTotalMb: 6400,
    activeTasks: [],
    taskHistory: [
      { id: 'hist-51', name: 'Quote gen — Ref #QT-8800',    status: 'failed',    durationMs: 30500, completedAt: '07:22', type: 'quote-gen'   },
      { id: 'hist-52', name: 'Lead qualify — Taylor, S.',   status: 'failed',    durationMs: 30200, completedAt: '07:10', type: 'lead-qualify' },
      { id: 'hist-53', name: 'Compliance check — #CR-420',  status: 'completed', durationMs: 980,   completedAt: '06:58', type: 'compliance'  },
      { id: 'hist-54', name: 'Document parse — Tax return', status: 'failed',    durationMs: 30100, completedAt: '06:41', type: 'doc-parse'   },
      { id: 'hist-55', name: 'Rate lookup — VA 30yr',       status: 'completed', durationMs: 220,   completedAt: '06:28', type: 'rate-lookup'  },
    ],
  },
];

const QUEUE_DATA: Record<TimeRange, QueuePoint[]> = {
  '1h': [
    { time: '10:00', pending: 18, inProgress: 6,  completed: 42 },
    { time: '10:10', pending: 24, inProgress: 7,  completed: 58 },
    { time: '10:20', pending: 14, inProgress: 5,  completed: 74 },
    { time: '10:30', pending: 31, inProgress: 8,  completed: 88 },
    { time: '10:40', pending: 22, inProgress: 7,  completed: 104 },
    { time: '10:50', pending: 19, inProgress: 7,  completed: 121 },
  ],
  '6h': [
    { time: '05:00', pending: 4,  inProgress: 2,  completed: 88 },
    { time: '06:00', pending: 8,  inProgress: 3,  completed: 212 },
    { time: '07:00', pending: 22, inProgress: 6,  completed: 408 },
    { time: '08:00', pending: 38, inProgress: 9,  completed: 680 },
    { time: '09:00', pending: 28, inProgress: 7,  completed: 914 },
    { time: '10:00', pending: 19, inProgress: 7,  completed: 1142 },
  ],
  '24h': [
    { time: '00:00', pending: 2,  inProgress: 1,  completed: 210 },
    { time: '04:00', pending: 1,  inProgress: 1,  completed: 290 },
    { time: '08:00', pending: 34, inProgress: 8,  completed: 680 },
    { time: '12:00', pending: 48, inProgress: 9,  completed: 1440 },
    { time: '16:00', pending: 38, inProgress: 8,  completed: 2210 },
    { time: '20:00', pending: 12, inProgress: 4,  completed: 2880 },
  ],
};

const PERF_DATA: Record<TimeRange, PerfPoint[]> = {
  '1h': [
    { time: '10:00', tasksPerHour: 98,  avgLatencyMs: 310, errorRate: 1.8 },
    { time: '10:10', tasksPerHour: 112, avgLatencyMs: 288, errorRate: 1.2 },
    { time: '10:20', tasksPerHour: 88,  avgLatencyMs: 340, errorRate: 2.4 },
    { time: '10:30', tasksPerHour: 132, avgLatencyMs: 264, errorRate: 1.0 },
    { time: '10:40', tasksPerHour: 118, avgLatencyMs: 278, errorRate: 1.4 },
    { time: '10:50', tasksPerHour: 121, avgLatencyMs: 271, errorRate: 1.1 },
  ],
  '6h': [
    { time: '05:00', tasksPerHour: 28,  avgLatencyMs: 220, errorRate: 0.8 },
    { time: '06:00', tasksPerHour: 54,  avgLatencyMs: 248, errorRate: 1.0 },
    { time: '07:00', tasksPerHour: 96,  avgLatencyMs: 298, errorRate: 1.4 },
    { time: '08:00', tasksPerHour: 142, avgLatencyMs: 268, errorRate: 1.2 },
    { time: '09:00', tasksPerHour: 124, avgLatencyMs: 280, errorRate: 1.6 },
    { time: '10:00', tasksPerHour: 121, avgLatencyMs: 271, errorRate: 1.1 },
  ],
  '24h': [
    { time: '00:00', tasksPerHour: 14,  avgLatencyMs: 190, errorRate: 0.4 },
    { time: '04:00', tasksPerHour: 8,   avgLatencyMs: 172, errorRate: 0.2 },
    { time: '08:00', tasksPerHour: 138, avgLatencyMs: 268, errorRate: 1.2 },
    { time: '12:00', tasksPerHour: 168, avgLatencyMs: 312, errorRate: 2.1 },
    { time: '16:00', tasksPerHour: 144, avgLatencyMs: 290, errorRate: 1.8 },
    { time: '20:00', tasksPerHour: 62,  avgLatencyMs: 238, errorRate: 0.9 },
  ],
};

const FAILED_TASKS: FailedTask[] = [
  { id: 'fail-01', name: 'Quote gen — Ref #QT-8819',   workerId: 'worker-001', workerLabel: 'nyra-worker-01', failedAt: '10:54', reason: 'Rate API timeout (>30s)',         attempts: 3, type: 'quote-gen'    },
  { id: 'fail-02', name: 'Rate lookup — ARM 5/1',      workerId: 'worker-003', workerLabel: 'nyra-worker-03', failedAt: '10:44', reason: 'External rate feed unreachable',   attempts: 2, type: 'rate-lookup'  },
  { id: 'fail-03', name: 'Quote gen — Ref #QT-8815',   workerId: 'worker-003', workerLabel: 'nyra-worker-03', failedAt: '10:12', reason: 'Rate API timeout (>30s)',         attempts: 3, type: 'quote-gen'    },
  { id: 'fail-04', name: 'Document parse — Bank stmts',workerId: 'worker-004', workerLabel: 'nyra-worker-04', failedAt: '10:28', reason: 'OCR extraction failed — poor scan', attempts: 1, type: 'doc-parse'   },
  { id: 'fail-05', name: 'Quote gen — Ref #QT-8810',   workerId: 'worker-005', workerLabel: 'nyra-worker-05', failedAt: '09:12', reason: 'Rate API timeout (>30s)',         attempts: 3, type: 'quote-gen'    },
  { id: 'fail-06', name: 'Lead qualify — Brown, T.',   workerId: 'worker-005', workerLabel: 'nyra-worker-05', failedAt: '08:47', reason: 'LLM gateway 503 — upstream down',  attempts: 2, type: 'lead-qualify' },
  { id: 'fail-07', name: 'Quote gen — Ref #QT-8800',   workerId: 'worker-006', workerLabel: 'nyra-worker-06', failedAt: '07:22', reason: 'Rate API timeout (>30s)',         attempts: 3, type: 'quote-gen'    },
  { id: 'fail-08', name: 'Lead qualify — Taylor, S.',  workerId: 'worker-006', workerLabel: 'nyra-worker-06', failedAt: '07:10', reason: 'Worker OOM — process killed',     attempts: 1, type: 'lead-qualify' },
  { id: 'fail-09', name: 'Document parse — Tax return',workerId: 'worker-006', workerLabel: 'nyra-worker-06', failedAt: '06:41', reason: 'Worker OOM — process killed',     attempts: 1, type: 'doc-parse'   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUptime(minutes: number): string {
  if (minutes === 0) return 'down';
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function getWorkerStatusColors(status: WorkerStatus) {
  switch (status) {
    case 'active':   return { badge: 'bg-green-500/10 text-green-400 border-green-500/30',   dot: 'bg-green-400',                 text: 'text-green-400'  };
    case 'idle':     return { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',   dot: 'bg-slate-400',                 text: 'text-slate-400'  };
    case 'paused':   return { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',dot: 'bg-yellow-400',               text: 'text-yellow-400' };
    case 'draining': return { badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',      dot: 'bg-cyan-400 animate-pulse',   text: 'text-cyan-400'   };
    case 'error':    return { badge: 'bg-red-500/10 text-red-400 border-red-500/30',         dot: 'bg-red-400 animate-pulse',    text: 'text-red-400'    };
  }
}

function getWorkerStatusIcon(status: WorkerStatus) {
  switch (status) {
    case 'active':   return <CheckCircle2 size={13} className="text-green-400" />;
    case 'idle':     return <Clock        size={13} className="text-slate-400" />;
    case 'paused':   return <Pause        size={13} className="text-yellow-400" />;
    case 'draining': return <RefreshCw    size={13} className="text-cyan-400" />;
    case 'error':    return <XCircle      size={13} className="text-red-400" />;
  }
}

function getPoolHealth(workers: Worker[]): PoolHealth {
  const errCount     = workers.filter(w => w.status === 'error').length;
  const pausedCount  = workers.filter(w => w.status === 'paused').length;
  const activeCount  = workers.filter(w => w.status === 'active' || w.status === 'draining').length;
  if (errCount >= 2 || activeCount === 0) return 'error';
  if (errCount >= 1 || pausedCount >= 2)  return 'degraded';
  if (pausedCount >= 1)                   return 'warning';
  return 'healthy';
}

function getPoolHealthColors(health: PoolHealth) {
  switch (health) {
    case 'healthy':  return { badge: 'bg-green-500/10 text-green-400 border-green-500/30',   dot: 'bg-green-400',                text: 'text-green-400'  };
    case 'warning':  return { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-400' };
    case 'degraded': return { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', dot: 'bg-orange-400 animate-pulse', text: 'text-orange-400' };
    case 'error':    return { badge: 'bg-red-500/10 text-red-400 border-red-500/30',          dot: 'bg-red-400 animate-pulse',    text: 'text-red-400'    };
  }
}

function getTaskTypeColor(type: string): string {
  switch (type) {
    case 'quote-gen':    return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'lead-qualify': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    case 'lead-score':   return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'compliance':   return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'doc-parse':    return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
    case 'rate-lookup':  return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'campaign':     return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    case 'alert':        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    default:             return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}

// Group failure reasons for pattern detection
function getFailurePatterns(tasks: FailedTask[]): { reason: string; count: number; percentage: number }[] {
  const counts: Record<string, number> = {};
  tasks.forEach(t => { counts[t.reason] = (counts[t.reason] ?? 0) + 1; });
  const total = tasks.length;
  return Object.entries(counts)
    .map(([reason, count]) => ({ reason, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

// Simple SVG sparkline for bar charts
function BarSparkline({
  values,
  color,
  height = 48,
}: {
  values: number[];
  color: string;
  height?: number;
}) {
  const max = Math.max(...values, 1);
  const barW = 100 / (values.length * 2 - 1);
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      {values.map((v, i) => {
        const barHeight = (v / max) * (height - 4);
        const x = i * barW * 2;
        return (
          <rect
            key={i}
            x={x}
            y={height - barHeight - 2}
            width={barW}
            height={barHeight}
            fill={color}
            opacity={0.75}
            rx={1}
          />
        );
      })}
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WorkersPage() {
  const [timeRange, setTimeRange]     = useState<TimeRange>('1h');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  // Simulate action state per worker: record of workerId → status override
  const [actionStates, setActionStates] = useState<Record<string, WorkerStatus>>({});

  const queuePoints = QUEUE_DATA[timeRange];
  const perfPoints  = PERF_DATA[timeRange];

  // Effective workers with action overrides applied
  const effectiveWorkers = WORKERS.map(w =>
    actionStates[w.id] ? { ...w, status: actionStates[w.id] } : w
  );

  // Derived pool metrics
  const totalWorkers  = effectiveWorkers.length;
  const activeWorkers = effectiveWorkers.filter(w => w.status === 'active').length;
  const totalQueueLen = queuePoints[queuePoints.length - 1].pending;
  const avgTaskDuration = Math.round(
    effectiveWorkers.filter(w => w.avgLatencyMs > 0).reduce((s, w) => s + w.avgLatencyMs, 0) /
    Math.max(effectiveWorkers.filter(w => w.avgLatencyMs > 0).length, 1)
  );

  // Pool health
  const poolHealth      = getPoolHealth(effectiveWorkers);
  const poolHealthColors = getPoolHealthColors(poolHealth);

  // Capacity
  const totalAssigned   = effectiveWorkers.reduce((s, w) => s + w.assignedTasks, 0);
  const capacityPct     = Math.round((activeWorkers / Math.max(totalWorkers, 1)) * 100);
  const currentThroughput = perfPoints[perfPoints.length - 1].tasksPerHour;
  const latestQueue     = queuePoints[queuePoints.length - 1];

  // Estimated wait time based on queue depth + throughput
  const estWaitMinutes  = currentThroughput > 0
    ? Math.round((totalQueueLen / currentThroughput) * 60)
    : 999;

  // Failed task patterns
  const failurePatterns = getFailurePatterns(FAILED_TASKS);

  // Worker actions
  function handleWorkerAction(workerId: string, action: 'pause' | 'resume' | 'drain' | 'restart') {
    setActionStates(prev => {
      const worker = effectiveWorkers.find(w => w.id === workerId);
      if (!worker) return prev;
      let next: WorkerStatus = worker.status;
      if (action === 'pause')   next = 'paused';
      if (action === 'resume')  next = 'active';
      if (action === 'drain')   next = 'draining';
      if (action === 'restart') next = 'idle';
      return { ...prev, [workerId]: next };
    });
    // Reflect in the selected worker modal if open
    if (selectedWorker?.id === workerId) {
      setSelectedWorker(prev => prev ? { ...prev, status: actionStates[workerId] ?? prev.status } : null);
    }
  }

  // Effective selected worker (with action state applied)
  const effectiveSelected = selectedWorker
    ? effectiveWorkers.find(w => w.id === selectedWorker.id) ?? selectedWorker
    : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Worker Pool"
        subtitle="Task Queue Monitoring — Worker Status, Performance & Capacity"
      />

      {/* ── Time Range Selector ─────────────────────────────────────────────── */}
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

      {/* ── Metrics Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Users size={14} /> Total Workers
            </p>
            <p className="text-2xl font-bold text-cyan-400">{totalWorkers}</p>
            <p className="text-xs text-slate-400 mt-1">{activeWorkers} active</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Activity size={14} /> Active Workers
            </p>
            <p className="text-2xl font-bold text-green-400">{activeWorkers}</p>
            <p className="text-xs text-slate-400 mt-1">of {totalWorkers} total</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <ListTodo size={14} /> Task Queue Length
            </p>
            <p className="text-2xl font-bold text-orange-400">{totalQueueLen}</p>
            <p className="text-xs text-slate-400 mt-1">{totalAssigned} in-progress</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Timer size={14} /> Avg Task Duration
            </p>
            <p className="text-2xl font-bold text-purple-400">{formatMs(avgTaskDuration)}</p>
            <p className="text-xs text-slate-400 mt-1">across active workers</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Pool Status Banner ───────────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${poolHealthColors.dot}`} />
              <p className="text-sm font-semibold text-white">Pool Health</p>
              <span className={`text-xs px-2 py-0.5 rounded border font-semibold capitalize ${poolHealthColors.badge}`}>
                {poolHealth}
              </span>
            </div>
            <div className="flex items-center gap-8 flex-wrap">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Capacity Utilization</p>
                <p className="text-base font-bold text-white">{capacityPct}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Task Throughput</p>
                <p className="text-base font-bold text-purple-400">{currentThroughput}/hr</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">In-Progress</p>
                <p className="text-base font-bold text-cyan-400">{latestQueue.inProgress}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Est. Wait</p>
                <p className={`text-base font-bold ${estWaitMinutes < 5 ? 'text-green-400' : estWaitMinutes < 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {estWaitMinutes >= 999 ? '—' : `${estWaitMinutes}m`}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity size={12} className="text-purple-400 animate-pulse" />
                <span className="text-xs text-slate-400">Live</span>
              </div>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Capacity utilization</span>
              <span>{activeWorkers} / {totalWorkers} workers active</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r transition-all ${
                  capacityPct >= 90 ? 'from-red-500 to-rose-400' :
                  capacityPct >= 70 ? 'from-yellow-500 to-amber-400' :
                  'from-green-500 to-cyan-400'
                }`}
                style={{ width: `${capacityPct}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Worker List Grid ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
          <Cpu size={14} /> Workers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {effectiveWorkers.map((worker) => {
            const sc = getWorkerStatusColors(worker.status);
            return (
              <button
                key={worker.id}
                onClick={() => setSelectedWorker(worker)}
                className="text-left p-5 rounded border border-slate-800 hover:border-purple-500/40 hover:bg-purple-500/5 transition group bg-card/30 backdrop-blur-sm"
              >
                {/* Worker header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                    <p className="text-sm font-bold text-white font-mono">{worker.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded border font-semibold capitalize ${sc.badge}`}>
                      {worker.status}
                    </span>
                    <span className="text-xs text-slate-600 group-hover:text-slate-400 transition">→</span>
                  </div>
                </div>

                {/* CPU bar */}
                <div className="mb-2.5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 flex items-center gap-1"><Cpu size={10} /> CPU</span>
                    <span className={`font-semibold ${worker.cpuPct >= 85 ? 'text-red-400' : worker.cpuPct >= 70 ? 'text-orange-400' : 'text-cyan-300'}`}>
                      {worker.cpuPct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${
                        worker.cpuPct >= 85 ? 'from-red-500 to-rose-400' :
                        worker.cpuPct >= 70 ? 'from-orange-500 to-amber-400' :
                        'from-cyan-500 to-blue-400'
                      } transition-all`}
                      style={{ width: `${worker.cpuPct}%` }}
                    />
                  </div>
                </div>

                {/* Memory bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 flex items-center gap-1"><HardDrive size={10} /> Mem</span>
                    <span className={`font-semibold ${worker.memPct >= 85 ? 'text-red-400' : worker.memPct >= 70 ? 'text-orange-400' : 'text-purple-300'}`}>
                      {worker.memUsedMb > 0 ? `${(worker.memUsedMb / 1024).toFixed(1)} GB` : '—'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${
                        worker.memPct >= 85 ? 'from-red-500 to-rose-400' :
                        worker.memPct >= 70 ? 'from-orange-500 to-amber-400' :
                        'from-purple-500 to-pink-400'
                      } transition-all`}
                      style={{ width: `${worker.memPct}%` }}
                    />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Tasks</p>
                    <p className="text-sm font-bold text-cyan-400">{worker.assignedTasks}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Done</p>
                    <p className="text-sm font-bold text-slate-300">{worker.completedTasks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Success</p>
                    <p className={`text-sm font-bold ${worker.successRate >= 98 ? 'text-green-400' : worker.successRate >= 95 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {worker.status === 'error' ? '—' : `${worker.successRate}%`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Uptime</p>
                    <p className="text-sm font-bold text-slate-300">{formatUptime(worker.uptimeMinutes)}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Task Queue Visualization ─────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 size={18} /> Task Queue — {timeRange}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Current counts */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded border border-orange-500/20 bg-orange-500/5">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400" /> Pending
              </p>
              <p className="text-2xl font-bold text-orange-400">{latestQueue.pending}</p>
              <p className="text-xs text-slate-500 mt-1">awaiting dispatch</p>
            </div>
            <div className="p-4 rounded border border-cyan-500/20 bg-cyan-500/5">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> In-Progress
              </p>
              <p className="text-2xl font-bold text-cyan-400">{latestQueue.inProgress}</p>
              <p className="text-xs text-slate-500 mt-1">actively processing</p>
            </div>
            <div className="p-4 rounded border border-green-500/20 bg-green-500/5">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400" /> Completed
              </p>
              <p className="text-2xl font-bold text-green-400">{latestQueue.completed.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">in last {timeRange}</p>
            </div>
          </div>

          {/* Time-series bars */}
          <div className="space-y-4">
            {/* Pending */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Pending tasks over time</span>
                <span className="text-orange-400">{queuePoints[queuePoints.length - 1].pending} now</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {queuePoints.map((pt, i) => {
                  const max = Math.max(...queuePoints.map(p => p.pending), 1);
                  const h = (pt.pending / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex items-end h-12">
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition text-xs bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-white whitespace-nowrap z-10">
                          {pt.pending}
                        </div>
                        <div
                          className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t opacity-80 hover:opacity-100 transition"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">{pt.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* In-progress */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>In-progress tasks over time</span>
                <span className="text-cyan-400">{queuePoints[queuePoints.length - 1].inProgress} now</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {queuePoints.map((pt, i) => {
                  const max = Math.max(...queuePoints.map(p => p.inProgress), 1);
                  const h = (pt.inProgress / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex items-end h-12">
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition text-xs bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-white whitespace-nowrap z-10">
                          {pt.inProgress}
                        </div>
                        <div
                          className="w-full bg-gradient-to-t from-cyan-500 to-blue-400 rounded-t opacity-80 hover:opacity-100 transition"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">{pt.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Worker Performance Metrics ───────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp size={18} /> Performance Metrics — {timeRange}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tasks/hour */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-500">Tasks / Hour</span>
                <span className="text-purple-400 font-bold">{perfPoints[perfPoints.length - 1].tasksPerHour}/hr</span>
              </div>
              <BarSparkline values={perfPoints.map(p => p.tasksPerHour)} color="#a855f7" />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>{perfPoints[0].time}</span>
                <span>{perfPoints[perfPoints.length - 1].time}</span>
              </div>
            </div>

            {/* Avg latency */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-500">Avg Latency</span>
                <span className="text-cyan-400 font-bold">{perfPoints[perfPoints.length - 1].avgLatencyMs}ms</span>
              </div>
              <BarSparkline values={perfPoints.map(p => p.avgLatencyMs)} color="#22d3ee" />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>{perfPoints[0].time}</span>
                <span>{perfPoints[perfPoints.length - 1].time}</span>
              </div>
            </div>

            {/* Error rate */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-500">Error Rate</span>
                <span className={`font-bold ${perfPoints[perfPoints.length - 1].errorRate < 2 ? 'text-green-400' : 'text-red-400'}`}>
                  {perfPoints[perfPoints.length - 1].errorRate}%
                </span>
              </div>
              <BarSparkline values={perfPoints.map(p => p.errorRate)} color="#f43f5e" />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>{perfPoints[0].time}</span>
                <span>{perfPoints[perfPoints.length - 1].time}</span>
              </div>
            </div>
          </div>

          {/* Per-worker performance table */}
          <div className="mt-6 border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">Per-Worker Performance</p>
            <div className="space-y-2">
              {effectiveWorkers.map((w) => {
                const sc = getWorkerStatusColors(w.status);
                return (
                  <div key={w.id} className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 w-36 flex-shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      <span className="font-mono text-slate-300 truncate">{w.label}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-4 flex-wrap">
                      <span className="text-slate-500">
                        <span className="text-purple-400 font-bold">{w.tasksPerHour}</span>/hr
                      </span>
                      <span className="text-slate-500">
                        latency: <span className="text-cyan-400 font-bold">{w.avgLatencyMs > 0 ? `${w.avgLatencyMs}ms` : '—'}</span>
                      </span>
                      <span className="text-slate-500">
                        err: <span className={`font-bold ${w.errorRate < 2 ? 'text-green-400' : w.errorRate < 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {w.status === 'error' ? '—' : `${w.errorRate}%`}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Capacity Planning ────────────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap size={18} /> Capacity Planning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded border border-slate-800 text-center">
              <p className="text-xs text-slate-500 mb-2">Available Capacity</p>
              <p className="text-2xl font-bold text-green-400">{activeWorkers}</p>
              <p className="text-xs text-slate-500 mt-1">active workers</p>
            </div>
            <div className="p-4 rounded border border-slate-800 text-center">
              <p className="text-xs text-slate-500 mb-2">Queued Tasks</p>
              <p className="text-2xl font-bold text-orange-400">{totalQueueLen}</p>
              <p className="text-xs text-slate-500 mt-1">pending dispatch</p>
            </div>
            <div className="p-4 rounded border border-slate-800 text-center">
              <p className="text-xs text-slate-500 mb-2">Est. Wait Time</p>
              <p className={`text-2xl font-bold ${estWaitMinutes < 5 ? 'text-green-400' : estWaitMinutes < 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                {estWaitMinutes >= 999 ? '—' : `${estWaitMinutes}m`}
              </p>
              <p className="text-xs text-slate-500 mt-1">at current throughput</p>
            </div>
            <div className="p-4 rounded border border-slate-800 text-center">
              <p className="text-xs text-slate-500 mb-2">Utilization</p>
              <p className={`text-2xl font-bold ${capacityPct >= 90 ? 'text-red-400' : capacityPct >= 70 ? 'text-yellow-400' : 'text-green-400'}`}>
                {capacityPct}%
              </p>
              <p className="text-xs text-slate-500 mt-1">of pool active</p>
            </div>
          </div>

          {/* Worker capacity bar */}
          <div className="space-y-3">
            {effectiveWorkers.map((w) => {
              const sc = getWorkerStatusColors(w.status);
              const maxTasks = 8;
              const fillPct = Math.min((w.assignedTasks / maxTasks) * 100, 100);
              return (
                <div key={w.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-36 flex-shrink-0">
                    {getWorkerStatusIcon(w.status)}
                    <span className="text-xs font-mono text-slate-300 truncate">{w.label}</span>
                  </div>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${
                        w.status === 'error'   ? 'from-red-600 to-red-500' :
                        w.status === 'paused'  ? 'from-yellow-600 to-yellow-500' :
                        w.status === 'draining'? 'from-cyan-600 to-cyan-400' :
                        w.status === 'idle'    ? 'from-slate-600 to-slate-500' :
                        'from-purple-500 to-pink-400'
                      } transition-all`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400 w-12 text-right">{w.assignedTasks}/{maxTasks}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize w-20 text-center ${sc.badge}`}>
                      {w.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Failed Task Tracking ─────────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={18} /> Failed Task Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Failure patterns */}
          <div className="mb-5">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">Failure Patterns</p>
            <div className="space-y-2">
              {failurePatterns.map((fp) => (
                <div key={fp.reason} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 truncate">{fp.reason}</span>
                      <span className="text-red-400 font-bold flex-shrink-0 ml-2">{fp.count}x</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full"
                        style={{ width: `${fp.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 w-10 text-right flex-shrink-0">{fp.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent failures */}
          <div>
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">Recent Failures</p>
            <div className="space-y-2">
              {FAILED_TASKS.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded border border-red-500/10 bg-red-500/5 hover:border-red-500/20 transition"
                >
                  <XCircle size={14} className="text-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold text-white">{task.name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${getTaskTypeColor(task.type)}`}>
                        {task.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{task.reason}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-mono text-slate-400">{task.workerLabel}</p>
                    <p className="text-xs text-slate-600">{task.failedAt} · {task.attempts} attempt{task.attempts !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Worker Detail Modal ───────────────────────────────────────────────── */}
      {effectiveSelected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedWorker(null)}
        >
          <div
            className="bg-black border border-purple-500/30 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 flex items-start justify-between p-6 border-b border-purple-500/20 bg-black/90 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded border ${getWorkerStatusColors(effectiveSelected.status).badge}`}>
                  {getWorkerStatusIcon(effectiveSelected.status)}
                </div>
                <div>
                  <h2 className="text-white font-bold text-base font-mono">{effectiveSelected.label}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {effectiveSelected.id} · uptime {formatUptime(effectiveSelected.uptimeMinutes)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded border font-semibold capitalize ml-2 ${getWorkerStatusColors(effectiveSelected.status).badge}`}>
                  {effectiveSelected.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="p-1.5 hover:bg-red-500/20 rounded transition"
              >
                <X size={18} className="text-red-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Action Controls */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">Worker Controls</p>
                <div className="flex flex-wrap gap-2">
                  {effectiveSelected.status !== 'paused' && effectiveSelected.status !== 'error' && (
                    <button
                      onClick={() => handleWorkerAction(effectiveSelected.id, 'pause')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-xs font-medium hover:border-yellow-500/60 hover:bg-yellow-500/20 transition"
                    >
                      <Pause size={12} /> Pause Worker
                    </button>
                  )}
                  {(effectiveSelected.status === 'paused' || effectiveSelected.status === 'idle') && (
                    <button
                      onClick={() => handleWorkerAction(effectiveSelected.id, 'resume')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-green-500/40 bg-green-500/10 text-green-400 text-xs font-medium hover:border-green-500/60 hover:bg-green-500/20 transition"
                    >
                      <Play size={12} /> Resume Worker
                    </button>
                  )}
                  {effectiveSelected.status === 'active' && (
                    <button
                      onClick={() => handleWorkerAction(effectiveSelected.id, 'drain')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-xs font-medium hover:border-cyan-500/60 hover:bg-cyan-500/20 transition"
                    >
                      <RefreshCw size={12} /> Drain Worker
                    </button>
                  )}
                  <button
                    onClick={() => handleWorkerAction(effectiveSelected.id, 'restart')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-purple-500/40 bg-purple-500/10 text-purple-400 text-xs font-medium hover:border-purple-500/60 hover:bg-purple-500/20 transition"
                  >
                    <RotateCcw size={12} /> Force Restart
                  </button>
                </div>
              </div>

              {/* Full metrics */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">Full Metrics</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Tasks / Hour',   value: `${effectiveSelected.tasksPerHour}/hr`,         color: 'text-purple-400' },
                    { label: 'Avg Latency',    value: effectiveSelected.avgLatencyMs > 0 ? `${effectiveSelected.avgLatencyMs}ms` : '—', color: 'text-cyan-400' },
                    { label: 'Success Rate',   value: effectiveSelected.status === 'error' ? '—' : `${effectiveSelected.successRate}%`,   color: effectiveSelected.successRate >= 98 ? 'text-green-400' : 'text-yellow-400' },
                    { label: 'Error Rate',     value: effectiveSelected.status === 'error' ? '—' : `${effectiveSelected.errorRate}%`,     color: effectiveSelected.errorRate < 2 ? 'text-green-400' : effectiveSelected.errorRate < 5 ? 'text-yellow-400' : 'text-red-400' },
                    { label: 'Completed',      value: effectiveSelected.completedTasks.toLocaleString(), color: 'text-slate-300'   },
                    { label: 'Assigned',       value: `${effectiveSelected.assignedTasks}`,            color: 'text-orange-400' },
                    { label: 'CPU',            value: `${effectiveSelected.cpuPct}%`,                  color: effectiveSelected.cpuPct >= 85 ? 'text-red-400' : 'text-cyan-400' },
                    { label: 'Memory',         value: effectiveSelected.memUsedMb > 0 ? `${(effectiveSelected.memUsedMb / 1024).toFixed(1)} / ${(effectiveSelected.memTotalMb / 1024).toFixed(0)} GB` : '—', color: 'text-purple-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="p-3 rounded border border-slate-800">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className={`text-base font-bold ${color} mt-0.5`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource usage bars */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">Resource Usage Breakdown</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span className="flex items-center gap-1"><Cpu size={11} /> CPU Utilization</span>
                      <span className={effectiveSelected.cpuPct >= 85 ? 'text-red-400' : effectiveSelected.cpuPct >= 70 ? 'text-orange-400' : 'text-cyan-400'}>{effectiveSelected.cpuPct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          effectiveSelected.cpuPct >= 85 ? 'from-red-500 to-rose-400' :
                          effectiveSelected.cpuPct >= 70 ? 'from-orange-500 to-amber-400' :
                          'from-cyan-500 to-blue-400'
                        }`}
                        style={{ width: `${effectiveSelected.cpuPct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span className="flex items-center gap-1"><HardDrive size={11} /> Memory Usage</span>
                      <span className={effectiveSelected.memPct >= 85 ? 'text-red-400' : effectiveSelected.memPct >= 70 ? 'text-orange-400' : 'text-purple-400'}>
                        {effectiveSelected.memUsedMb > 0 ? `${effectiveSelected.memUsedMb} MB / ${effectiveSelected.memTotalMb} MB` : '—'}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          effectiveSelected.memPct >= 85 ? 'from-red-500 to-rose-400' :
                          effectiveSelected.memPct >= 70 ? 'from-orange-500 to-amber-400' :
                          'from-purple-500 to-pink-400'
                        }`}
                        style={{ width: `${effectiveSelected.memPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Active tasks */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">
                  Active Tasks ({effectiveSelected.activeTasks.length})
                </p>
                {effectiveSelected.activeTasks.length === 0 ? (
                  <div className="p-4 rounded border border-slate-800 text-slate-500 text-sm italic text-center">
                    No active tasks
                  </div>
                ) : (
                  <div className="space-y-2">
                    {effectiveSelected.activeTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded border border-cyan-500/10 bg-cyan-500/5">
                        <Activity size={13} className="text-cyan-400 animate-pulse flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white">{task.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Started {task.startedAt}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${getTaskTypeColor(task.type)}`}>
                            {task.type}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{formatMs(task.elapsedMs)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Task history */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">Task History (last 5)</p>
                <div className="space-y-2">
                  {effectiveSelected.taskHistory.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded border transition ${
                        task.status === 'completed'
                          ? 'border-green-500/10 bg-green-500/5 hover:border-green-500/20'
                          : 'border-red-500/10 bg-red-500/5 hover:border-red-500/20'
                      }`}
                    >
                      {task.status === 'completed'
                        ? <CheckCircle2 size={13} className="text-green-400 flex-shrink-0" />
                        : <XCircle      size={13} className="text-red-400 flex-shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">{task.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{task.completedAt}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${getTaskTypeColor(task.type)}`}>
                          {task.type}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{formatMs(task.durationMs)}</span>
                        {task.status === 'failed' && (
                          <span className="text-xs text-red-400 font-medium">failed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trend indicators */}
              <div className="border-t border-slate-800 pt-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-purple-400" />
                    <span className="text-slate-400">{effectiveSelected.tasksPerHour > 0 ? `${effectiveSelected.tasksPerHour} tasks/hr` : 'Not processing'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingDown size={12} className="text-cyan-400" />
                    <span className="text-slate-400">{effectiveSelected.avgLatencyMs > 0 ? `${effectiveSelected.avgLatencyMs}ms avg` : '—'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getWorkerStatusColors(effectiveSelected.status).dot}`} />
                  <span className="text-xs text-slate-400 capitalize">{effectiveSelected.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
