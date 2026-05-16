'use client';

import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Cpu,
  Server,
  Thermometer,
  XCircle,
  Zap,
  RefreshCw,
  Clock,
  Layers,
  GitBranch,
  HardDrive,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

type TimeRange = '1h' | '6h' | '24h';
type NodeStatus = 'healthy' | 'warning' | 'degraded' | 'error';
type ClusterStatus = 'healthy' | 'warning' | 'error';

interface GpuNode {
  id: string;
  label: string;
  role: 'orchestrator' | 'gpu-worker';
  status: NodeStatus;
  gpuModel: string;
  vramTotalGb: number;
  vramUsedGb: number;
  gpuUtilPct: number;
  cpuCores: number;
  temperatureC: number;
  powerDrawW: number;
  powerCapW: number;
  activeProcesses: number;
  uptimeHours: number;
  queuedTasks: number;
  activeWorkload: string | null;
}

interface UtilPoint {
  time: string;
  cluster: number;
  orchestrator: number;
  worker5090: number;
  worker3090: number;
  worker3060: number;
}

interface WorkloadAssignment {
  nodeId: string;
  model: string;
  modelShort: string;
  status: 'running' | 'idle' | 'loading';
  tokensThroughput: string;
  contextLen: string;
  vramGb: number;
}

interface SyncNode {
  id: string;
  label: string;
  lastSync: string;
  queuedFiles: number;
  syncStatus: 'synced' | 'syncing' | 'stale' | 'error';
  bytesQueued: string;
}

interface TempHistPoint {
  time: string;
  temp: number;
}

interface PowerHistPoint {
  time: string;
  power: number;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const NODES: GpuNode[] = [
  {
    id: 'orchestrator',
    label: 'orchestrator',
    role: 'orchestrator',
    status: 'healthy',
    gpuModel: 'None (CPU-only)',
    vramTotalGb: 0,
    vramUsedGb: 0,
    gpuUtilPct: 0,
    cpuCores: 16,
    temperatureC: 48,
    powerDrawW: 85,
    powerCapW: 150,
    activeProcesses: 12,
    uptimeHours: 312,
    queuedTasks: 0,
    activeWorkload: 'Nexus Router · LiteLLM · Prometheus',
  },
  {
    id: 'worker-5090',
    label: 'worker-5090',
    role: 'gpu-worker',
    status: 'healthy',
    gpuModel: 'RTX 5090',
    vramTotalGb: 48,
    vramUsedGb: 38.4,
    gpuUtilPct: 82,
    cpuCores: 24,
    temperatureC: 71,
    powerDrawW: 480,
    powerCapW: 575,
    activeProcesses: 3,
    uptimeHours: 289,
    queuedTasks: 4,
    activeWorkload: 'DeepSeek-R1 236B',
  },
  {
    id: 'worker-3090',
    label: 'worker-3090ti',
    role: 'gpu-worker',
    status: 'warning',
    gpuModel: 'RTX 3090 Ti',
    vramTotalGb: 24,
    vramUsedGb: 20.8,
    gpuUtilPct: 68,
    cpuCores: 16,
    temperatureC: 83,
    powerDrawW: 390,
    powerCapW: 450,
    activeProcesses: 2,
    uptimeHours: 189,
    queuedTasks: 2,
    activeWorkload: 'Llama 3.1 70B',
  },
  {
    id: 'worker-3060',
    label: 'worker-3060',
    role: 'gpu-worker',
    status: 'healthy',
    gpuModel: 'RTX 3060',
    vramTotalGb: 12,
    vramUsedGb: 7.2,
    gpuUtilPct: 45,
    cpuCores: 12,
    temperatureC: 62,
    powerDrawW: 155,
    powerCapW: 200,
    activeProcesses: 1,
    uptimeHours: 401,
    queuedTasks: 1,
    activeWorkload: 'CodeLlama 34B',
  },
];

const UTIL_DATA: Record<TimeRange, UtilPoint[]> = {
  '1h': [
    { time: '10:00', cluster: 58, orchestrator: 22, worker5090: 80, worker3090: 65, worker3060: 40 },
    { time: '10:10', cluster: 62, orchestrator: 25, worker5090: 84, worker3090: 70, worker3060: 42 },
    { time: '10:20', cluster: 55, orchestrator: 18, worker5090: 78, worker3090: 60, worker3060: 38 },
    { time: '10:30', cluster: 74, orchestrator: 30, worker5090: 91, worker3090: 82, worker3060: 48 },
    { time: '10:40', cluster: 70, orchestrator: 28, worker5090: 88, worker3090: 76, worker3060: 44 },
    { time: '10:50', cluster: 66, orchestrator: 24, worker5090: 82, worker3090: 68, worker3060: 45 },
  ],
  '6h': [
    { time: '05:00', cluster: 28, orchestrator: 14, worker5090: 38, worker3090: 30, worker3060: 18 },
    { time: '06:00', cluster: 35, orchestrator: 16, worker5090: 52, worker3090: 38, worker3060: 22 },
    { time: '07:00', cluster: 52, orchestrator: 20, worker5090: 72, worker3090: 58, worker3060: 34 },
    { time: '08:00', cluster: 71, orchestrator: 28, worker5090: 90, worker3090: 80, worker3060: 46 },
    { time: '09:00', cluster: 65, orchestrator: 26, worker5090: 85, worker3090: 72, worker3060: 42 },
    { time: '10:00', cluster: 66, orchestrator: 24, worker5090: 82, worker3090: 68, worker3060: 45 },
  ],
  '24h': [
    { time: '00:00', cluster: 18, orchestrator: 10, worker5090: 24, worker3090: 20, worker3060: 12 },
    { time: '04:00', cluster: 14, orchestrator: 8,  worker5090: 18, worker3090: 15, worker3060: 10 },
    { time: '08:00', cluster: 64, orchestrator: 25, worker5090: 88, worker3090: 72, worker3060: 44 },
    { time: '12:00', cluster: 78, orchestrator: 32, worker5090: 95, worker3090: 88, worker3060: 54 },
    { time: '16:00', cluster: 70, orchestrator: 28, worker5090: 86, worker3090: 78, worker3060: 50 },
    { time: '20:00', cluster: 42, orchestrator: 18, worker5090: 56, worker3090: 48, worker3060: 28 },
  ],
};

const WORKLOADS: WorkloadAssignment[] = [
  { nodeId: 'worker-5090', model: 'DeepSeek-R1 236B', modelShort: 'DeepSeek-R1', status: 'running', tokensThroughput: '48 tok/s', contextLen: '32K', vramGb: 38.4 },
  { nodeId: 'worker-3090', model: 'Llama 3.1 70B',   modelShort: 'Llama 3.1',   status: 'running', tokensThroughput: '62 tok/s', contextLen: '8K',  vramGb: 20.8 },
  { nodeId: 'worker-3060', model: 'CodeLlama 34B',   modelShort: 'CodeLlama',   status: 'running', tokensThroughput: '38 tok/s', contextLen: '16K', vramGb: 7.2 },
];

const SYNC_NODES: SyncNode[] = [
  { id: 'orchestrator', label: 'orchestrator',   lastSync: '12s ago',  queuedFiles: 0,  syncStatus: 'synced',  bytesQueued: '0 B' },
  { id: 'worker-5090',  label: 'worker-5090',    lastSync: '18s ago',  queuedFiles: 2,  syncStatus: 'syncing', bytesQueued: '1.4 MB' },
  { id: 'worker-3090',  label: 'worker-3090ti',  lastSync: '2m ago',   queuedFiles: 0,  syncStatus: 'synced',  bytesQueued: '0 B' },
  { id: 'worker-3060',  label: 'worker-3060',    lastSync: '45s ago',  queuedFiles: 0,  syncStatus: 'synced',  bytesQueued: '0 B' },
];

const TEMP_HISTORY: Record<string, TempHistPoint[]> = {
  'orchestrator': [
    { time: '10:00', temp: 44 }, { time: '10:10', temp: 46 }, { time: '10:20', temp: 47 },
    { time: '10:30', temp: 50 }, { time: '10:40', temp: 49 }, { time: '10:50', temp: 48 },
  ],
  'worker-5090': [
    { time: '10:00', temp: 68 }, { time: '10:10', temp: 70 }, { time: '10:20', temp: 69 },
    { time: '10:30', temp: 74 }, { time: '10:40', temp: 72 }, { time: '10:50', temp: 71 },
  ],
  'worker-3090': [
    { time: '10:00', temp: 78 }, { time: '10:10', temp: 80 }, { time: '10:20', temp: 81 },
    { time: '10:30', temp: 85 }, { time: '10:40', temp: 84 }, { time: '10:50', temp: 83 },
  ],
  'worker-3060': [
    { time: '10:00', temp: 58 }, { time: '10:10', temp: 60 }, { time: '10:20', temp: 61 },
    { time: '10:30', temp: 64 }, { time: '10:40', temp: 63 }, { time: '10:50', temp: 62 },
  ],
};

const POWER_HISTORY: Record<string, PowerHistPoint[]> = {
  'orchestrator': [
    { time: '10:00', power: 80 }, { time: '10:10', power: 83 }, { time: '10:20', power: 82 },
    { time: '10:30', power: 89 }, { time: '10:40', power: 87 }, { time: '10:50', power: 85 },
  ],
  'worker-5090': [
    { time: '10:00', power: 445 }, { time: '10:10', power: 462 }, { time: '10:20', power: 455 },
    { time: '10:30', power: 491 }, { time: '10:40', power: 478 }, { time: '10:50', power: 480 },
  ],
  'worker-3090': [
    { time: '10:00', power: 365 }, { time: '10:10', power: 378 }, { time: '10:20', power: 382 },
    { time: '10:30', power: 398 }, { time: '10:40', power: 395 }, { time: '10:50', power: 390 },
  ],
  'worker-3060': [
    { time: '10:00', power: 142 }, { time: '10:10', power: 148 }, { time: '10:20', power: 151 },
    { time: '10:30', power: 158 }, { time: '10:40', power: 156 }, { time: '10:50', power: 155 },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUptime(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const d = Math.floor(hours / 24);
  const h = hours % 24;
  return h > 0 ? `${d}d ${h}h` : `${d}d`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FleetPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [selectedNode, setSelectedNode] = useState<GpuNode | null>(null);

  const utilPoints = UTIL_DATA[timeRange];
  const maxCluster = Math.max(...utilPoints.map((p) => p.cluster));

  // Derived cluster metrics
  const totalNodes = NODES.length;
  const healthyCount = NODES.filter((n) => n.status === 'healthy').length;
  const degradedCount = NODES.filter((n) => n.status === 'degraded' || n.status === 'warning').length;
  const errorCount = NODES.filter((n) => n.status === 'error').length;

  const clusterStatus: ClusterStatus =
    errorCount > 0 ? 'error' : degradedCount > 0 ? 'warning' : 'healthy';

  // ─── Status helpers ─────────────────────────────────────────────────────────

  const getNodeStatusColor = (status: NodeStatus) => {
    switch (status) {
      case 'healthy':  return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'warning':  return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'degraded': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'error':    return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
  };

  const getNodeStatusDot = (status: NodeStatus) => {
    switch (status) {
      case 'healthy':  return 'bg-green-400';
      case 'warning':  return 'bg-yellow-400 animate-pulse';
      case 'degraded': return 'bg-orange-400 animate-pulse';
      case 'error':    return 'bg-red-400 animate-pulse';
    }
  };

  const getNodeStatusIcon = (status: NodeStatus) => {
    switch (status) {
      case 'healthy':  return <CheckCircle2 size={14} className="text-green-400" />;
      case 'warning':  return <AlertCircle size={14} className="text-yellow-400" />;
      case 'degraded': return <AlertTriangle size={14} className="text-orange-400" />;
      case 'error':    return <XCircle size={14} className="text-red-400" />;
    }
  };

  const getClusterStatusColor = (status: ClusterStatus) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'error':   return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
  };

  const getTempColor = (temp: number) => {
    if (temp >= 85) return 'text-red-400';
    if (temp >= 75) return 'text-orange-400';
    if (temp >= 65) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getTempBarColor = (temp: number) => {
    if (temp >= 85) return 'from-red-500 to-rose-400';
    if (temp >= 75) return 'from-orange-500 to-amber-400';
    if (temp >= 65) return 'from-yellow-500 to-amber-400';
    return 'from-green-500 to-emerald-400';
  };

  const getVramBarColor = (usedPct: number) => {
    if (usedPct >= 90) return 'from-red-500 to-rose-400';
    if (usedPct >= 75) return 'from-orange-500 to-amber-400';
    return 'from-purple-500 to-pink-400';
  };

  const getSyncStatusColor = (status: SyncNode['syncStatus']) => {
    switch (status) {
      case 'synced':  return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'syncing': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'stale':   return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'error':   return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
  };

  const getWorkloadStatusColor = (status: WorkloadAssignment['status']) => {
    switch (status) {
      case 'running': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'idle':    return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      case 'loading': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    }
  };

  // Per-node util accessor for the chart lines
  const getNodeUtil = (point: UtilPoint, nodeId: string): number => {
    switch (nodeId) {
      case 'orchestrator': return point.orchestrator;
      case 'worker-5090':  return point.worker5090;
      case 'worker-3090':  return point.worker3090;
      case 'worker-3060':  return point.worker3060;
      default: return 0;
    }
  };

  const NODE_LINE_COLORS: Record<string, string> = {
    'orchestrator': 'bg-slate-400',
    'worker-5090':  'bg-purple-400',
    'worker-3090':  'bg-pink-400',
    'worker-3060':  'bg-cyan-400',
  };

  const NODE_LINE_TEXT: Record<string, string> = {
    'orchestrator': 'text-slate-400',
    'worker-5090':  'text-purple-400',
    'worker-3090':  'text-pink-400',
    'worker-3060':  'text-cyan-400',
  };

  // ─── Detail modal data ───────────────────────────────────────────────────────
  const selectedTempHist   = selectedNode ? TEMP_HISTORY[selectedNode.id]  ?? [] : [];
  const selectedPowerHist  = selectedNode ? POWER_HISTORY[selectedNode.id] ?? [] : [];
  const maxTemp  = selectedTempHist.length  > 0 ? Math.max(...selectedTempHist.map((p) => p.temp))   : 100;
  const maxPower = selectedPowerHist.length > 0 ? Math.max(...selectedPowerHist.map((p) => p.power)) : 500;
  const selectedWorkload = selectedNode
    ? WORKLOADS.find((w) => w.nodeId === selectedNode.id) ?? null
    : null;

  // ─── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      <PageHeader
        title="GPU Fleet"
        subtitle="Cluster Monitoring — GPU Nodes, Workloads & Syncthing Status"
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

      {/* ── Metrics cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Server size={14} /> Total Nodes
            </p>
            <p className="text-2xl font-bold text-cyan-400">{totalNodes}</p>
            <p className="text-xs text-slate-400 mt-1">orchestrator + 3 workers</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <CheckCircle2 size={14} /> Healthy
            </p>
            <p className="text-2xl font-bold text-green-400">{healthyCount}</p>
            <p className="text-xs text-slate-400 mt-1">of {totalNodes} nodes</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <AlertTriangle size={14} /> Degraded
            </p>
            <p className="text-2xl font-bold text-yellow-400">{degradedCount}</p>
            <p className="text-xs text-slate-400 mt-1">warning or degraded</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <XCircle size={14} /> Errors
            </p>
            <p className="text-2xl font-bold text-red-400">{errorCount}</p>
            <p className="text-xs text-slate-400 mt-1">
              {errorCount === 0 ? 'All systems nominal' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Cluster health banner ─────────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${
                clusterStatus === 'healthy' ? 'bg-green-400' :
                clusterStatus === 'warning' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-400 animate-pulse'
              }`} />
              <p className="text-sm font-semibold text-white">Cluster Health</p>
              <span className={`text-xs px-2 py-0.5 rounded border font-semibold capitalize ${getClusterStatusColor(clusterStatus)}`}>
                {clusterStatus}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <RefreshCw size={12} className="text-cyan-400" />
                Last sync: 12s ago
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-slate-500" />
                2026-05-12 10:50:14
              </span>
              <span className="flex items-center gap-1.5">
                <Activity size={12} className="text-purple-400 animate-pulse" />
                Live monitoring
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── GPU node grid ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
          <Cpu size={14} /> GPU Nodes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {NODES.map((node) => {
            const vramPct = node.vramTotalGb > 0
              ? Math.round((node.vramUsedGb / node.vramTotalGb) * 100)
              : 0;
            const powerPct = Math.round((node.powerDrawW / node.powerCapW) * 100);
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="text-left p-5 rounded border border-slate-800 hover:border-purple-500/40 hover:bg-purple-500/5 transition group bg-card/30 backdrop-blur-sm"
              >
                {/* Node header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${getNodeStatusDot(node.status)}`} />
                    <p className="text-sm font-bold text-white font-mono">{node.label}</p>
                    {node.role === 'orchestrator' && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">control-plane</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded border font-semibold capitalize ${getNodeStatusColor(node.status)}`}>
                      {node.status}
                    </span>
                    <span className="text-xs text-slate-600 group-hover:text-slate-400 transition">→</span>
                  </div>
                </div>

                {/* GPU model */}
                <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                  <Cpu size={12} />
                  {node.gpuModel}
                </p>

                {/* VRAM bar */}
                {node.vramTotalGb > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">VRAM</span>
                      <span className={`font-semibold ${
                        vramPct >= 90 ? 'text-red-400' : vramPct >= 75 ? 'text-orange-400' : 'text-purple-300'
                      }`}>
                        {node.vramUsedGb} / {node.vramTotalGb} GB ({vramPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getVramBarColor(vramPct)} rounded-full transition-all`}
                        style={{ width: `${vramPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* GPU util bar */}
                {node.vramTotalGb > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">GPU util</span>
                      <span className="text-pink-300 font-semibold">{node.gpuUtilPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-400 rounded-full transition-all"
                        style={{ width: `${node.gpuUtilPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Processes</p>
                    <p className="text-sm font-bold text-cyan-400">{node.activeProcesses}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Temp</p>
                    <p className={`text-sm font-bold ${getTempColor(node.temperatureC)}`}>
                      {node.temperatureC}°C
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Power</p>
                    <p className="text-sm font-bold text-orange-400">{node.powerDrawW}W</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Uptime</p>
                    <p className="text-sm font-bold text-slate-300">{formatUptime(node.uptimeHours)}</p>
                  </div>
                </div>

                {/* Active workload */}
                {node.activeWorkload && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Activity size={11} className="text-green-400" />
                      {node.activeWorkload}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GPU utilization graph ─────────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 size={18} /> GPU Utilization — Cluster &amp; Per-Node ({timeRange})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Aggregate cluster bars */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 font-medium">Aggregate cluster GPU %</p>
                <p className="text-xs font-bold text-purple-400">
                  {utilPoints[utilPoints.length - 1].cluster}% now
                </p>
              </div>
              <div className="flex items-end gap-1.5 h-24">
                {utilPoints.map((point, i) => {
                  const heightPct = maxCluster > 0 ? (point.cluster / maxCluster) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex items-end justify-center h-20">
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white whitespace-nowrap z-10">
                          {point.cluster}%
                        </div>
                        <div
                          className="w-full bg-gradient-to-t from-purple-500 to-pink-400 rounded-t opacity-80 hover:opacity-100 transition"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">{point.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per-node breakdown */}
            <div className="border-t border-slate-800 pt-4">
              <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Per-node breakdown</p>
              <div className="space-y-3">
                {NODES.map((node) => {
                  const latestUtil = getNodeUtil(utilPoints[utilPoints.length - 1], node.id);
                  return (
                    <div key={node.id} className="flex items-center gap-3">
                      <p className={`text-xs font-mono w-24 flex-shrink-0 ${NODE_LINE_TEXT[node.id] ?? 'text-slate-400'}`}>
                        {node.label}
                      </p>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${
                            node.id === 'orchestrator' ? 'from-slate-500 to-slate-400' :
                            node.id === 'worker-5090'  ? 'from-purple-500 to-pink-400' :
                            node.id === 'worker-3090'  ? 'from-pink-500 to-rose-400' :
                            'from-cyan-500 to-blue-400'
                          } rounded-full transition-all`}
                          style={{ width: `${latestUtil}%` }}
                        />
                      </div>
                      <p className={`text-xs font-bold w-10 text-right ${NODE_LINE_TEXT[node.id] ?? 'text-slate-400'}`}>
                        {latestUtil}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              {NODES.map((node) => (
                <span key={node.id} className="flex items-center gap-1.5">
                  <span className={`inline-block w-3 h-3 rounded-sm ${NODE_LINE_COLORS[node.id] ?? 'bg-slate-400'}`} />
                  {node.label}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Workload distribution ─────────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers size={18} /> Workload Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {WORKLOADS.map((wl) => {
              const node = NODES.find((n) => n.id === wl.nodeId);
              const vramPct = node
                ? Math.round((wl.vramGb / node.vramTotalGb) * 100)
                : 0;
              return (
                <div
                  key={wl.nodeId}
                  className="flex items-center gap-4 p-4 rounded border border-slate-800 hover:border-slate-700 transition"
                >
                  {/* Node label */}
                  <div className="flex-shrink-0 w-32">
                    <p className="text-xs text-slate-500">Node</p>
                    <p className="text-sm font-bold text-white font-mono">{wl.nodeId}</p>
                  </div>

                  {/* Model name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-purple-300">{wl.model}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize ${getWorkloadStatusColor(wl.status)}`}>
                        {wl.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{wl.tokensThroughput}</span>
                      <span>ctx: {wl.contextLen}</span>
                      <span>VRAM: {wl.vramGb} GB ({vramPct}%)</span>
                    </div>
                  </div>

                  {/* VRAM mini-bar */}
                  <div className="flex-shrink-0 w-24">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getVramBarColor(vramPct)} rounded-full`}
                        style={{ width: `${vramPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-1 text-right">{vramPct}% VRAM</p>
                  </div>
                </div>
              );
            })}

            {/* Orchestrator — no model loaded */}
            <div className="flex items-center gap-4 p-4 rounded border border-slate-800 opacity-50">
              <div className="flex-shrink-0 w-32">
                <p className="text-xs text-slate-500">Node</p>
                <p className="text-sm font-bold text-white font-mono">orchestrator</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500 italic">CPU-only — no model loaded</p>
                <p className="text-xs text-slate-600 mt-1">Nexus Router · LiteLLM proxy</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Syncthing status ─────────────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <GitBranch size={18} /> Syncthing — Node Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SYNC_NODES.map((sn) => (
              <div
                key={sn.id}
                className={`flex items-center gap-3 p-4 rounded border ${getSyncStatusColor(sn.syncStatus)}`}
              >
                <div className="flex-shrink-0">
                  {sn.syncStatus === 'synced'  && <CheckCircle2 size={18} className="text-green-400" />}
                  {sn.syncStatus === 'syncing' && <RefreshCw size={18} className="text-cyan-400 animate-spin" />}
                  {sn.syncStatus === 'stale'   && <AlertCircle size={18} className="text-yellow-400" />}
                  {sn.syncStatus === 'error'   && <XCircle size={18} className="text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-white font-mono">{sn.label}</p>
                    <span className="text-xs font-semibold capitalize">{sn.syncStatus}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {sn.lastSync}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive size={10} />
                      {sn.queuedFiles} queued file{sn.queuedFiles !== 1 ? 's' : ''} ({sn.bytesQueued})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Node detail modal ─────────────────────────────────────────────────── */}
      {selectedNode && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNode(null)}
        >
          <Card
            className="bg-black border border-cyan-400/30 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-purple-500/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded border ${getNodeStatusColor(selectedNode.status)}`}>
                    {getNodeStatusIcon(selectedNode.status)}
                  </div>
                  <div>
                    <CardTitle className="text-white text-base font-mono">{selectedNode.label}</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedNode.role === 'orchestrator' ? 'Control Plane' : 'GPU Worker'} · uptime {formatUptime(selectedNode.uptimeHours)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Full specs */}
              <div>
                <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Full Specs</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded border border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">GPU Model</p>
                    <p className="text-sm font-bold text-white">{selectedNode.gpuModel}</p>
                  </div>
                  <div className="p-3 rounded border border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">VRAM</p>
                    <p className="text-sm font-bold text-purple-400">
                      {selectedNode.vramTotalGb > 0 ? `${selectedNode.vramTotalGb} GB` : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 rounded border border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">CPU Cores</p>
                    <p className="text-sm font-bold text-cyan-400">{selectedNode.cpuCores} cores</p>
                  </div>
                  <div className="p-3 rounded border border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Temperature</p>
                    <p className={`text-sm font-bold ${getTempColor(selectedNode.temperatureC)}`}>
                      {selectedNode.temperatureC}°C
                    </p>
                  </div>
                  <div className="p-3 rounded border border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Power Draw</p>
                    <p className="text-sm font-bold text-orange-400">
                      {selectedNode.powerDrawW}W / {selectedNode.powerCapW}W
                    </p>
                  </div>
                  <div className="p-3 rounded border border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Queued Tasks</p>
                    <p className="text-sm font-bold text-pink-400">{selectedNode.queuedTasks}</p>
                  </div>
                </div>
              </div>

              {/* Active workload */}
              {selectedWorkload ? (
                <div className="p-4 rounded border border-purple-500/30 bg-purple-500/5">
                  <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Active Workload</p>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-base font-bold text-purple-300">{selectedWorkload.model}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>{selectedWorkload.tokensThroughput}</span>
                        <span>context: {selectedWorkload.contextLen}</span>
                        <span>VRAM: {selectedWorkload.vramGb} GB</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border font-semibold capitalize ${getWorkloadStatusColor(selectedWorkload.status)}`}>
                      {selectedWorkload.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded border border-slate-800 text-slate-500 text-sm italic">
                  No model loaded — {selectedNode.activeWorkload ?? 'idle'}
                </div>
              )}

              {/* Temperature history */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1.5">
                    <Thermometer size={12} /> Temperature History
                  </p>
                  <p className={`text-xs font-bold ${getTempColor(selectedNode.temperatureC)}`}>
                    {selectedNode.temperatureC}°C now
                  </p>
                </div>
                <div className="flex items-end gap-1.5 h-20">
                  {selectedTempHist.map((point, i) => {
                    const heightPct = maxTemp > 0 ? (point.temp / maxTemp) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full flex items-end h-16">
                          <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white whitespace-nowrap z-10">
                            {point.temp}°C
                          </div>
                          <div
                            className={`w-full bg-gradient-to-t ${getTempBarColor(selectedNode.temperatureC)} rounded-t opacity-80`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{point.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Power history */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1.5">
                    <Zap size={12} /> Power Draw History
                  </p>
                  <p className="text-xs font-bold text-orange-400">{selectedNode.powerDrawW}W now</p>
                </div>
                <div className="flex items-end gap-1.5 h-20">
                  {selectedPowerHist.map((point, i) => {
                    const heightPct = maxPower > 0 ? (point.power / maxPower) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full flex items-end h-16">
                          <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white whitespace-nowrap z-10">
                            {point.power}W
                          </div>
                          <div
                            className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t opacity-80"
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{point.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
