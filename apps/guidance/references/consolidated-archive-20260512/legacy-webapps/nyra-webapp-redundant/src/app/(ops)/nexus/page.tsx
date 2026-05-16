'use client';

import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  GitBranch,
  Globe,
  Network,
  Route,
  Server,
  Shield,
  TrendingUp,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

// ─── Types ───────────────────────────────────────────────────────────────────

type TimeRange = '1h' | '6h' | '24h';
type RouterStatus = 'healthy' | 'warning' | 'degraded' | 'error';
type ProviderStatus = 'healthy' | 'warning' | 'degraded' | 'error';

interface LatencyPercentilePoint {
  time: string;
  p50: number;
  p95: number;
  p99: number;
}

interface ModelDistribution {
  model: string;
  provider: string;
  requests: number;
  percentage: number;
  color: string;
  dotColor: string;
}

interface ProviderHealth {
  name: string;
  status: ProviderStatus;
  responseTimeMs: number;
  requestsToday: number;
  errorRate: number;
  lastChecked: string;
}

interface FallbackEvent {
  primaryModel: string;
  fallbackModel: string;
  reason: string;
  count: number;
  lastTriggered: string;
  trend: 'up' | 'down' | 'flat';
}

interface RoutePolicy {
  id: string;
  name: string;
  matchCondition: string;
  targetModel: string;
  fallbackChain: string[];
  activeRequests: number;
  priority: number;
  status: 'active' | 'inactive';
  totalRoutedToday: number;
  avgLatencyMs: number;
  errorRate: number;
  description: string;
  conditions: { field: string; operator: string; value: string }[];
  execStats: { routed: number; fallbackTriggered: number; errors: number; avgMs: number };
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const metricsByRange: Record<TimeRange, { requestVolume: number; avgLatencyMs: number; successRate: number; errorCount: number; uptimeSeconds: number }> = {
  '1h':  { requestVolume: 1_240,  avgLatencyMs: 312,  successRate: 98.7, errorCount: 16,    uptimeSeconds: 3600 },
  '6h':  { requestVolume: 7_831,  avgLatencyMs: 328,  successRate: 98.2, errorCount: 141,   uptimeSeconds: 21600 },
  '24h': { requestVolume: 28_447, avgLatencyMs: 341,  successRate: 97.8, errorCount: 626,   uptimeSeconds: 86400 },
};

const latencyDataByRange: Record<TimeRange, LatencyPercentilePoint[]> = {
  '1h': [
    { time: '10:00', p50: 210, p95: 480, p99: 920 },
    { time: '10:10', p50: 198, p95: 440, p99: 850 },
    { time: '10:20', p50: 245, p95: 610, p99: 1340 },
    { time: '10:30', p50: 220, p95: 510, p99: 1020 },
    { time: '10:40', p50: 188, p95: 420, p99: 810 },
    { time: '10:50', p50: 205, p95: 470, p99: 890 },
  ],
  '6h': [
    { time: '05:00', p50: 180, p95: 390, p99: 760 },
    { time: '06:00', p50: 195, p95: 420, p99: 810 },
    { time: '07:00', p50: 310, p95: 680, p99: 1480 },
    { time: '08:00', p50: 290, p95: 640, p99: 1290 },
    { time: '09:00', p50: 240, p95: 530, p99: 1050 },
    { time: '10:00', p50: 210, p95: 480, p99: 920 },
  ],
  '24h': [
    { time: '00:00', p50: 155, p95: 320, p99: 610 },
    { time: '04:00', p50: 142, p95: 298, p99: 580 },
    { time: '08:00', p50: 288, p95: 640, p99: 1310 },
    { time: '12:00', p50: 334, p95: 740, p99: 1620 },
    { time: '16:00', p50: 298, p95: 670, p99: 1380 },
    { time: '20:00', p50: 212, p95: 480, p99: 940 },
  ],
};

const modelDistributionByRange: Record<TimeRange, ModelDistribution[]> = {
  '1h': [
    { model: 'claude-sonnet-4-5',  provider: 'Anthropic',   requests: 434,  percentage: 35.0, color: 'from-purple-500 to-purple-400', dotColor: 'bg-purple-400' },
    { model: 'deepseek-r1',        provider: 'DeepSeek',    requests: 310,  percentage: 25.0, color: 'from-cyan-500 to-cyan-400',     dotColor: 'bg-cyan-400'   },
    { model: 'llama-3.1-70b',      provider: 'Ollama',      requests: 248,  percentage: 20.0, color: 'from-pink-500 to-pink-400',     dotColor: 'bg-pink-400'   },
    { model: 'qwen-2.5-72b',       provider: 'Ollama',      requests: 186,  percentage: 15.0, color: 'from-amber-500 to-amber-400',   dotColor: 'bg-amber-400'  },
    { model: 'claude-haiku-4-5',   provider: 'Anthropic',   requests: 62,   percentage: 5.0,  color: 'from-emerald-500 to-emerald-400', dotColor: 'bg-emerald-400' },
  ],
  '6h': [
    { model: 'claude-sonnet-4-5',  provider: 'Anthropic',   requests: 2741, percentage: 35.0, color: 'from-purple-500 to-purple-400', dotColor: 'bg-purple-400' },
    { model: 'deepseek-r1',        provider: 'DeepSeek',    requests: 1958, percentage: 25.0, color: 'from-cyan-500 to-cyan-400',     dotColor: 'bg-cyan-400'   },
    { model: 'llama-3.1-70b',      provider: 'Ollama',      requests: 1566, percentage: 20.0, color: 'from-pink-500 to-pink-400',     dotColor: 'bg-pink-400'   },
    { model: 'qwen-2.5-72b',       provider: 'Ollama',      requests: 1175, percentage: 15.0, color: 'from-amber-500 to-amber-400',   dotColor: 'bg-amber-400'  },
    { model: 'claude-haiku-4-5',   provider: 'Anthropic',   requests: 391,  percentage: 5.0,  color: 'from-emerald-500 to-emerald-400', dotColor: 'bg-emerald-400' },
  ],
  '24h': [
    { model: 'claude-sonnet-4-5',  provider: 'Anthropic',   requests: 9956, percentage: 35.0, color: 'from-purple-500 to-purple-400', dotColor: 'bg-purple-400' },
    { model: 'deepseek-r1',        provider: 'DeepSeek',    requests: 7112, percentage: 25.0, color: 'from-cyan-500 to-cyan-400',     dotColor: 'bg-cyan-400'   },
    { model: 'llama-3.1-70b',      provider: 'Ollama',      requests: 5689, percentage: 20.0, color: 'from-pink-500 to-pink-400',     dotColor: 'bg-pink-400'   },
    { model: 'qwen-2.5-72b',       provider: 'Ollama',      requests: 4267, percentage: 15.0, color: 'from-amber-500 to-amber-400',   dotColor: 'bg-amber-400'  },
    { model: 'claude-haiku-4-5',   provider: 'Anthropic',   requests: 1423, percentage: 5.0,  color: 'from-emerald-500 to-emerald-400', dotColor: 'bg-emerald-400' },
  ],
};

const providerHealth: ProviderHealth[] = [
  { name: 'Anthropic',   status: 'healthy',  responseTimeMs: 824,  requestsToday: 11379, errorRate: 0.4,  lastChecked: '12s ago'  },
  { name: 'OpenRouter',  status: 'warning',  responseTimeMs: 1480, requestsToday: 7112,  errorRate: 2.1,  lastChecked: '8s ago'   },
  { name: 'Ollama (GPU Workers)', status: 'healthy', responseTimeMs: 312, requestsToday: 9956, errorRate: 0.2, lastChecked: '4s ago' },
  { name: 'DeepSeek',    status: 'healthy',  responseTimeMs: 640,  requestsToday: 7112,  errorRate: 0.8,  lastChecked: '6s ago'   },
  { name: 'LiteLLM',     status: 'degraded', responseTimeMs: 2240, requestsToday: 3892,  errorRate: 4.7,  lastChecked: '15s ago'  },
];

const fallbackEvents: FallbackEvent[] = [
  { primaryModel: 'claude-sonnet-4-5', fallbackModel: 'deepseek-r1',    reason: 'Rate limit exceeded (429)',    count: 87,  lastTriggered: '3m ago',  trend: 'down' },
  { primaryModel: 'llama-3.1-70b',     fallbackModel: 'qwen-2.5-72b',   reason: 'GPU worker timeout (>30s)',    count: 34,  lastTriggered: '11m ago', trend: 'flat' },
  { primaryModel: 'deepseek-r1',       fallbackModel: 'claude-haiku-4-5',reason: 'Context length exceeded',      count: 21,  lastTriggered: '28m ago', trend: 'up'   },
  { primaryModel: 'LiteLLM',           fallbackModel: 'claude-sonnet-4-5',reason: 'Upstream 503 error',           count: 18,  lastTriggered: '7m ago',  trend: 'up'   },
  { primaryModel: 'qwen-2.5-72b',      fallbackModel: 'llama-3.1-70b',   reason: 'Model not loaded on worker',   count: 9,   lastTriggered: '1h ago',  trend: 'down' },
];

const routePolicies: RoutePolicy[] = [
  {
    id: 'rp-001',
    name: 'Compliance & Legal Routing',
    matchCondition: 'tag = "compliance" OR tag = "legal"',
    targetModel: 'claude-sonnet-4-5',
    fallbackChain: ['claude-haiku-4-5', 'deepseek-r1'],
    activeRequests: 3,
    priority: 1,
    status: 'active',
    totalRoutedToday: 2841,
    avgLatencyMs: 924,
    errorRate: 0.3,
    description: 'Routes all compliance-tagged and legal requests to Claude Sonnet for maximum accuracy and regulatory safety. Fallback preserves Anthropic provenance first.',
    conditions: [
      { field: 'tag', operator: '=', value: '"compliance"' },
      { field: 'tag', operator: '=', value: '"legal"' },
      { field: 'metadata.priority', operator: '>=', value: '"high"' },
    ],
    execStats: { routed: 2841, fallbackTriggered: 14, errors: 8, avgMs: 924 },
  },
  {
    id: 'rp-002',
    name: 'Local GPU — Simple Transforms',
    matchCondition: 'complexity = "low" AND cost_tier = "free"',
    targetModel: 'qwen-2.5-72b',
    fallbackChain: ['llama-3.1-70b', 'deepseek-r1'],
    activeRequests: 12,
    priority: 2,
    status: 'active',
    totalRoutedToday: 8934,
    avgLatencyMs: 198,
    errorRate: 0.1,
    description: 'Routes low-complexity tasks (variable transforms, type annotation, simple code) to local GPU workers to minimize cost. Sub-200ms average latency.',
    conditions: [
      { field: 'complexity', operator: '=', value: '"low"' },
      { field: 'cost_tier', operator: '=', value: '"free"' },
      { field: 'token_estimate', operator: '<', value: '2048' },
    ],
    execStats: { routed: 8934, fallbackTriggered: 62, errors: 9, avgMs: 198 },
  },
  {
    id: 'rp-003',
    name: 'Architecture & Deep Analysis',
    matchCondition: 'complexity = "high" AND tag = "architecture"',
    targetModel: 'deepseek-r1',
    fallbackChain: ['claude-sonnet-4-5'],
    activeRequests: 1,
    priority: 3,
    status: 'active',
    totalRoutedToday: 1204,
    avgLatencyMs: 3410,
    errorRate: 1.2,
    description: 'Routes high-complexity architecture and reasoning tasks to DeepSeek R1 for chain-of-thought analysis. Falls back to Claude Sonnet if R1 is unavailable.',
    conditions: [
      { field: 'complexity', operator: '=', value: '"high"' },
      { field: 'tag', operator: '=', value: '"architecture"' },
      { field: 'reasoning_required', operator: '=', value: 'true' },
    ],
    execStats: { routed: 1204, fallbackTriggered: 38, errors: 14, avgMs: 3410 },
  },
  {
    id: 'rp-004',
    name: 'Quote Generation Pipeline',
    matchCondition: 'source = "quote-engine"',
    targetModel: 'llama-3.1-70b',
    fallbackChain: ['qwen-2.5-72b', 'deepseek-r1', 'claude-haiku-4-5'],
    activeRequests: 5,
    priority: 4,
    status: 'active',
    totalRoutedToday: 5621,
    avgLatencyMs: 412,
    errorRate: 0.7,
    description: 'Dedicated routing for the mortgage quote generation pipeline. Uses Llama 70B for rate calculations and product matching. Three-tier fallback ensures 99.9% availability.',
    conditions: [
      { field: 'source', operator: '=', value: '"quote-engine"' },
      { field: 'operation', operator: 'in', value: '["rate_calc","product_match","scenario_gen"]' },
    ],
    execStats: { routed: 5621, fallbackTriggered: 94, errors: 39, avgMs: 412 },
  },
  {
    id: 'rp-005',
    name: 'Default Catch-All',
    matchCondition: '*',
    targetModel: 'claude-haiku-4-5',
    fallbackChain: ['llama-3.1-70b'],
    activeRequests: 0,
    priority: 99,
    status: 'active',
    totalRoutedToday: 847,
    avgLatencyMs: 280,
    errorRate: 0.5,
    description: 'Lowest-priority catch-all policy. Any request not matched by higher-priority rules lands here. Routes to Claude Haiku for cost efficiency.',
    conditions: [
      { field: '*', operator: 'matches', value: 'any' },
    ],
    execStats: { routed: 847, fallbackTriggered: 12, errors: 4, avgMs: 280 },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getStatusColors(status: RouterStatus | ProviderStatus) {
  switch (status) {
    case 'healthy':  return { badge: 'bg-green-500/10 text-green-400 border-green-500/30',  dot: 'bg-green-400',  text: 'text-green-400'  };
    case 'warning':  return { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400', text: 'text-yellow-400' };
    case 'degraded': return { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', dot: 'bg-orange-400', text: 'text-orange-400' };
    case 'error':    return { badge: 'bg-red-500/10 text-red-400 border-red-500/30',          dot: 'bg-red-400',    text: 'text-red-400'    };
  }
}

function getStatusIcon(status: RouterStatus | ProviderStatus) {
  switch (status) {
    case 'healthy':  return <CheckCircle2 size={14} className="text-green-400" />;
    case 'warning':  return <AlertCircle  size={14} className="text-yellow-400" />;
    case 'degraded': return <AlertTriangle size={14} className="text-orange-400" />;
    case 'error':    return <XCircle      size={14} className="text-red-400" />;
  }
}

function getTrendIcon(trend: FallbackEvent['trend']) {
  if (trend === 'up')   return <TrendingUp size={12} className="text-red-400" />;
  if (trend === 'down') return <TrendingUp size={12} className="text-green-400 rotate-180" />;
  return <Activity size={12} className="text-slate-400" />;
}

// SVG pie chart (no external deps)
function PieChart({ slices }: { slices: { percentage: number; color: string; label: string }[] }) {
  let cumulative = 0;
  const cx = 50;
  const cy = 50;
  const r = 40;

  const paths = slices.map((slice) => {
    const startAngle = (cumulative / 100) * 360 - 90;
    cumulative += slice.percentage;
    const endAngle = (cumulative / 100) * 360 - 90;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad   = (endAngle   * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArc = slice.percentage > 50 ? 1 : 0;

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { d, color: slice.color, label: slice.label, pct: slice.percentage };
  });

  // Map gradient color string to a plain fill color
  const colorMap: Record<string, string> = {
    'from-purple-500 to-purple-400':   '#a855f7',
    'from-cyan-500 to-cyan-400':       '#22d3ee',
    'from-pink-500 to-pink-400':       '#ec4899',
    'from-amber-500 to-amber-400':     '#f59e0b',
    'from-emerald-500 to-emerald-400': '#10b981',
  };

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={colorMap[p.color] ?? '#6366f1'}
          opacity={0.85}
          className="hover:opacity-100 transition-opacity"
        >
          <title>{p.label}: {p.pct}%</title>
        </path>
      ))}
      {/* inner donut hole */}
      <circle cx={cx} cy={cy} r={24} fill="#0a0a0f" />
      <text x={cx} y={cy - 3} textAnchor="middle" className="fill-white" style={{ fontSize: 7, fontWeight: 700 }}>
        ROUTING
      </text>
      <text x={cx} y={cy + 7} textAnchor="middle" style={{ fontSize: 6, fill: '#94a3b8' }}>
        distribution
      </text>
    </svg>
  );
}

// Multi-line latency sparkline using SVG
function LatencyGraph({ data }: { data: LatencyPercentilePoint[] }) {
  const allValues = data.flatMap(d => [d.p50, d.p95, d.p99]);
  const maxVal = Math.max(...allValues);
  const w = 100;
  const h = 60;
  const pad = 4;

  const toCoords = (values: number[]) =>
    values.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - (v / maxVal) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

  const areaCoords = (values: number[]) => {
    const pts = values.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - (v / maxVal) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return [`${pad},${h - pad}`, ...pts, `${(w - pad).toFixed(1)},${h - pad}`].join(' ');
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36" preserveAspectRatio="none">
        <defs>
          <linearGradient id="p99Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="p95Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="p50Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaCoords(data.map(d => d.p99))} fill="url(#p99Grad)" />
        <polygon points={areaCoords(data.map(d => d.p95))} fill="url(#p95Grad)" />
        <polygon points={areaCoords(data.map(d => d.p50))} fill="url(#p50Grad)" />
        <polyline points={toCoords(data.map(d => d.p99))} fill="none" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" />
        <polyline points={toCoords(data.map(d => d.p95))} fill="none" stroke="#fb923c" strokeWidth="1.2" strokeLinecap="round" />
        <polyline points={toCoords(data.map(d => d.p50))} fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        {data.filter((_, i) => i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1).map(d => (
          <span key={d.time}>{d.time}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function NexusRouterPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedPolicy, setSelectedPolicy] = useState<RoutePolicy | null>(null);

  const metrics      = metricsByRange[timeRange];
  const latencyData  = latencyDataByRange[timeRange];
  const modelDist    = modelDistributionByRange[timeRange];
  const routerStatus: RouterStatus = 'healthy';

  const latestLatency = latencyData[latencyData.length - 1];
  const statusColors  = getStatusColors(routerStatus);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nexus Router"
        subtitle="LLM Gateway — Request Routing, Model Distribution & Provider Health"
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

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <BarChart3 size={14} /> Request Volume
            </p>
            <p className="text-2xl font-bold text-purple-400">{metrics.requestVolume.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">in last {timeRange}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Clock size={14} /> Avg Latency
            </p>
            <p className="text-2xl font-bold text-cyan-400">{metrics.avgLatencyMs}ms</p>
            <p className="text-xs text-slate-400 mt-1">
              p50 {latestLatency.p50}ms · p99 {latestLatency.p99}ms
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <CheckCircle2 size={14} /> Success Rate
            </p>
            <p className="text-2xl font-bold text-green-400">{metrics.successRate}%</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div
                className="bg-gradient-to-r from-green-500 to-cyan-500 h-1.5 rounded-full"
                style={{ width: `${metrics.successRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <XCircle size={14} /> Error Count
            </p>
            <p className="text-2xl font-bold text-red-400">{metrics.errorCount.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">
              {(100 - metrics.successRate).toFixed(1)}% error rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Router Status + Uptime ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-lg border ${statusColors.badge}`}>
                <Network size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Router Status</p>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${statusColors.dot} animate-pulse`} />
                  <span className={`text-base font-bold capitalize ${statusColors.text}`}>{routerStatus}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 flex-wrap">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Uptime</p>
                <p className="text-lg font-bold text-white">{formatUptime(metrics.uptimeSeconds)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Active Policies</p>
                <p className="text-lg font-bold text-purple-400">{routePolicies.filter(p => p.status === 'active').length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Active Requests</p>
                <p className="text-lg font-bold text-cyan-400">{routePolicies.reduce((s, p) => s + p.activeRequests, 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Providers Online</p>
                <p className="text-lg font-bold text-green-400">
                  {providerHealth.filter(p => p.status === 'healthy').length}/{providerHealth.length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Model Distribution + Latency Graph ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Pie Chart */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Route size={18} /> Model Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              <div className="w-48 h-48 mx-auto">
                <PieChart slices={modelDist.map(m => ({ percentage: m.percentage, color: m.color, label: m.model }))} />
              </div>
              <div className="space-y-2">
                {modelDist.map((m) => (
                  <div key={m.model} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.dotColor}`} />
                      <span className="text-slate-300 font-mono truncate">{m.model}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <span className="text-slate-500">{m.requests.toLocaleString()}</span>
                      <span className="text-white font-bold w-10 text-right">{m.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latency Percentile Graph */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp size={18} /> Latency Percentiles — {timeRange}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LatencyGraph data={latencyData} />

            {/* Legend */}
            <div className="flex items-center gap-6 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-0.5 bg-purple-400 rounded" />
                p50
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-0.5 bg-orange-400 rounded" />
                p95
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-0.5 bg-red-400 rounded" />
                p99
              </span>
            </div>

            {/* Current values */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'p50', value: latestLatency.p50, color: 'text-purple-400' },
                { label: 'p95', value: latestLatency.p95, color: 'text-orange-400' },
                { label: 'p99', value: latestLatency.p99, color: 'text-red-400'    },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 rounded border border-slate-800 text-center">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className={`text-xl font-bold ${color} mt-1`}>{value}ms</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Provider Health ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe size={18} /> Provider Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {providerHealth.map((provider) => {
              const sc = getStatusColors(provider.status);
              return (
                <div
                  key={provider.name}
                  className={`flex items-center gap-4 p-4 rounded border ${sc.badge} flex-wrap`}
                >
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStatusIcon(provider.status)}
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${provider.status === 'healthy' ? 'animate-pulse' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{provider.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Last checked: {provider.lastChecked}</p>
                  </div>
                  <div className="flex items-center gap-6 flex-wrap flex-shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Response</p>
                      <p className={`text-sm font-bold ${
                        provider.responseTimeMs < 500 ? 'text-green-400' :
                        provider.responseTimeMs < 1000 ? 'text-yellow-400' :
                        provider.responseTimeMs < 2000 ? 'text-orange-400' : 'text-red-400'
                      }`}>{provider.responseTimeMs}ms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Reqs Today</p>
                      <p className="text-sm font-bold text-white">{provider.requestsToday.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Error Rate</p>
                      <p className={`text-sm font-bold ${
                        provider.errorRate < 1 ? 'text-green-400' :
                        provider.errorRate < 3 ? 'text-yellow-400' :
                        provider.errorRate < 5 ? 'text-orange-400' : 'text-red-400'
                      }`}>{provider.errorRate}%</p>
                    </div>
                    <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden self-center">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          provider.errorRate < 1 ? 'from-green-500 to-emerald-400' :
                          provider.errorRate < 3 ? 'from-yellow-500 to-amber-400' :
                          provider.errorRate < 5 ? 'from-orange-500 to-orange-400' : 'from-red-500 to-rose-400'
                        }`}
                        style={{ width: `${Math.min(provider.errorRate * 10, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize flex-shrink-0 ${sc.badge}`}>
                      {provider.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Fallback Chain Activity ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <GitBranch size={18} /> Fallback Chain Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fallbackEvents.map((ev) => (
              <div
                key={`${ev.primaryModel}-${ev.fallbackModel}`}
                className="flex items-center gap-4 p-4 rounded border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white font-mono">{ev.primaryModel}</span>
                    <span className="text-slate-500 text-xs">→</span>
                    <span className="text-sm font-semibold text-pink-400 font-mono">{ev.fallbackModel}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{ev.reason}</p>
                  <p className="text-xs text-slate-600 mt-0.5">Last triggered: {ev.lastTriggered}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(ev.trend)}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-400">{ev.count}</p>
                    <p className="text-xs text-slate-500">triggers</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Active Route Policies ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield size={18} /> Active Route Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {routePolicies.map((policy) => (
              <button
                key={policy.id}
                onClick={() => setSelectedPolicy(policy)}
                className="w-full text-left p-4 rounded border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/40 transition group"
              >
                <div className="flex items-start gap-4">
                  {/* Priority badge */}
                  <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-400">
                    {policy.priority === 99 ? '*' : policy.priority}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-white group-hover:text-cyan-400">
                        {policy.name}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30 font-medium">
                        {policy.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mb-2">{policy.matchCondition}</p>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-slate-500">Target:</span>
                      <span className="text-purple-400 font-mono font-semibold">{policy.targetModel}</span>
                      {policy.fallbackChain.length > 0 && (
                        <>
                          <span className="text-slate-600">→ fallback:</span>
                          {policy.fallbackChain.map((fb, i) => (
                            <span key={i} className="text-pink-400 font-mono">{fb}</span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0 text-right">
                    {policy.activeRequests > 0 && (
                      <div>
                        <p className="text-sm font-bold text-cyan-400">{policy.activeRequests}</p>
                        <p className="text-xs text-slate-500">active</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-white">{policy.totalRoutedToday.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">today</p>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${policy.avgLatencyMs < 500 ? 'text-green-400' : policy.avgLatencyMs < 2000 ? 'text-yellow-400' : 'text-orange-400'}`}>
                        {policy.avgLatencyMs}ms
                      </p>
                      <p className="text-xs text-slate-500">avg</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-cyan-400 self-center" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Route Policy Detail Modal ── */}
      {selectedPolicy && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPolicy(null)}
        >
          <div
            className="bg-black border border-purple-500/30 rounded-lg max-w-2xl w-full max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-start justify-between p-6 border-b border-purple-500/20 bg-black/90 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded border border-purple-500/30 bg-purple-500/10">
                  <Server size={16} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">{selectedPolicy.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Policy ID: {selectedPolicy.id} · Priority {selectedPolicy.priority}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="p-1.5 hover:bg-red-500/20 rounded transition flex-shrink-0 ml-4"
              >
                <X size={18} className="text-red-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Description</p>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 border border-slate-800 rounded p-3">
                  {selectedPolicy.description}
                </p>
              </div>

              {/* Match Conditions */}
              <div>
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Match Conditions</p>
                <div className="space-y-1.5">
                  {selectedPolicy.conditions.map((cond, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded border border-slate-800 font-mono text-xs">
                      <span className="text-cyan-400">{cond.field}</span>
                      <span className="text-slate-500">{cond.operator}</span>
                      <span className="text-pink-400">{cond.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target + Fallback Chain */}
              <div>
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Target Model + Fallback Chain</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-3 py-2 rounded border border-purple-500/40 bg-purple-500/10 text-sm font-semibold text-purple-300 font-mono">
                    {selectedPolicy.targetModel}
                    <span className="text-xs text-purple-500 ml-1">(primary)</span>
                  </div>
                  {selectedPolicy.fallbackChain.map((fb, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-slate-600 text-xs">→</span>
                      <div className="px-3 py-2 rounded border border-pink-500/30 bg-pink-500/5 text-sm font-semibold text-pink-400 font-mono">
                        {fb}
                        <span className="text-xs text-pink-600 ml-1">(#{i + 1})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Stats */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Execution Statistics</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Routed',            value: selectedPolicy.execStats.routed.toLocaleString(),            color: 'text-cyan-400'   },
                    { label: 'Fallback Triggered', value: selectedPolicy.execStats.fallbackTriggered.toLocaleString(), color: 'text-orange-400' },
                    { label: 'Errors',             value: selectedPolicy.execStats.errors.toLocaleString(),            color: 'text-red-400'    },
                    { label: 'Avg Latency',        value: `${selectedPolicy.execStats.avgMs}ms`,                       color: 'text-purple-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="p-3 rounded border border-slate-800 text-center">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className={`text-xl font-bold ${color} mt-1`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Gradient progress — fallback rate */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Fallback Rate</span>
                    <span className="text-orange-400 font-semibold">
                      {((selectedPolicy.execStats.fallbackTriggered / selectedPolicy.execStats.routed) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-400"
                      style={{ width: `${Math.min((selectedPolicy.execStats.fallbackTriggered / selectedPolicy.execStats.routed) * 100 * 10, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Error Rate</span>
                    <span className="text-red-400 font-semibold">
                      {((selectedPolicy.execStats.errors / selectedPolicy.execStats.routed) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-red-500 to-rose-400"
                      style={{ width: `${Math.min((selectedPolicy.execStats.errors / selectedPolicy.execStats.routed) * 100 * 20, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Active status footer */}
              <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full bg-green-400 ${selectedPolicy.activeRequests > 0 ? 'animate-pulse' : ''}`} />
                  <span className="text-xs text-slate-400">
                    {selectedPolicy.activeRequests > 0
                      ? `${selectedPolicy.activeRequests} active request${selectedPolicy.activeRequests !== 1 ? 's' : ''} in flight`
                      : 'No active requests'}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 rounded border border-green-500/30 bg-green-500/10 text-green-400 font-medium capitalize">
                  {selectedPolicy.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
