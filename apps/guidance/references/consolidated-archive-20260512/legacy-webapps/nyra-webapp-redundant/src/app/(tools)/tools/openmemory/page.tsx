'use client';

import { useState } from 'react';
import { Database, Search, Clock, Activity, HardDrive, Zap, TrendingUp, X, FileText, GitBranch, MessageSquare, BarChart2, RefreshCw, CheckCircle2, AlertCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TimeRange = '1h' | '6h' | '24h';
type SegmentType = 'vector' | 'document' | 'conversation';
type SegmentStatus = 'healthy' | 'degraded' | 'slow' | 'error';
type OpStatus = 'active' | 'completed' | 'failed' | 'queued';

interface MemorySegment {
  id: string;
  name: string;
  type: SegmentType;
  size: string;
  sizeBytes: number;
  lastAccessed: string;
  retrievalCount: number;
  status: SegmentStatus;
  contentPreview: string;
  metadata: Record<string, string>;
  accessHistory: { time: string; latency: string; query: string }[];
  similarResults: { name: string; score: number }[];
  indexStatus: string;
  lastRebuild: string;
}

interface MemoryOperation {
  id: string;
  type: 'retrieve' | 'store' | 'search' | 'index' | 'evict';
  source: string;
  targetSegment: string;
  timestamp: string;
  status: OpStatus;
  latency?: string;
}

interface LatencyPoint {
  time: string;
  latency: number;
}

const SEGMENTS: MemorySegment[] = [
  {
    id: 'seg-001',
    name: 'Lead_Embeddings',
    type: 'vector',
    size: '128.4 MB',
    sizeBytes: 128400000,
    lastAccessed: '12s ago',
    retrievalCount: 4821,
    status: 'healthy',
    contentPreview: 'Dense vector representations of 18,432 lead profiles. Embedding dim: 1536. Model: text-embedding-3-large. Covers lead source, demographics, financial indicators.',
    metadata: { model: 'text-embedding-3-large', dim: '1536', count: '18432', created: '2026-02-14', updated: '2026-05-12' },
    accessHistory: [
      { time: '12s ago', latency: '2.1ms', query: 'mortgage leads near Austin TX' },
      { time: '4m ago', latency: '1.8ms', query: 'first-time buyer segment' },
      { time: '18m ago', latency: '3.2ms', query: 'high credit score refinance' },
    ],
    similarResults: [
      { name: 'Lead_Profiles', score: 0.94 },
      { name: 'Campaign_Targets', score: 0.87 },
      { name: 'Agent_Sessions', score: 0.61 },
    ],
    indexStatus: 'HNSW index healthy (ef=200)',
    lastRebuild: '2026-05-11 03:00 AM',
  },
  {
    id: 'seg-002',
    name: 'Compliance_Rules',
    type: 'document',
    size: '4.7 MB',
    sizeBytes: 4700000,
    lastAccessed: '2m ago',
    retrievalCount: 2103,
    status: 'healthy',
    contentPreview: 'TILA, RESPA, TRID regulatory documents, state-level mortgage guidelines (50 states), CFPB bulletins Q1-Q2 2026. Full-text indexed.',
    metadata: { format: 'PDF/text', documents: '847', regulations: 'TILA,RESPA,TRID', updated: '2026-05-01' },
    accessHistory: [
      { time: '2m ago', latency: '4.5ms', query: 'TRID disclosure requirements TX' },
      { time: '31m ago', latency: '3.9ms', query: 'RESPA Section 8 referral fees' },
      { time: '1h ago', latency: '5.1ms', query: 'state usury limits 2026' },
    ],
    similarResults: [
      { name: 'Audit_Logs', score: 0.79 },
      { name: 'Quote_Engine_State', score: 0.72 },
    ],
    indexStatus: 'BM25 + vector hybrid index healthy',
    lastRebuild: '2026-05-01 06:00 AM',
  },
  {
    id: 'seg-003',
    name: 'Agent_Sessions',
    type: 'conversation',
    size: '24.5 MB',
    sizeBytes: 24500000,
    lastAccessed: '4s ago',
    retrievalCount: 9341,
    status: 'healthy',
    contentPreview: 'Active and archived agent conversation threads. 1,203 sessions. Includes tool call history, reasoning traces, and decision logs for mortgage pipeline actions.',
    metadata: { sessions: '1203', active: '47', archived: '1156', retention: '90d' },
    accessHistory: [
      { time: '4s ago', latency: '1.2ms', query: 'session ctx lead_id:LC-4821' },
      { time: '22s ago', latency: '1.4ms', query: 'quote agent last action' },
      { time: '3m ago', latency: '0.9ms', query: 'compliance check thread' },
    ],
    similarResults: [
      { name: 'Lead_Embeddings', score: 0.61 },
      { name: 'Workflow_States', score: 0.88 },
    ],
    indexStatus: 'Flat index healthy (47 active)',
    lastRebuild: 'Rolling — no rebuild needed',
  },
  {
    id: 'seg-004',
    name: 'Quote_Engine_State',
    type: 'document',
    size: '15.8 MB',
    sizeBytes: 15800000,
    lastAccessed: '38s ago',
    retrievalCount: 3672,
    status: 'degraded',
    contentPreview: 'Lender rate sheets, product matrices, and pricing engine state snapshots. 38 active lender configs. Last rate sheet import: 2026-05-12 06:00 AM.',
    metadata: { lenders: '38', products: '214', rateSheets: '38', updated: '2026-05-12' },
    accessHistory: [
      { time: '38s ago', latency: '12.4ms', query: 'conventional 30yr rate Chase' },
      { time: '5m ago', latency: '9.8ms', query: 'FHA low credit product matrix' },
      { time: '22m ago', latency: '8.1ms', query: 'jumbo ARM lenders CA' },
    ],
    similarResults: [
      { name: 'Compliance_Rules', score: 0.72 },
      { name: 'Lead_Embeddings', score: 0.58 },
    ],
    indexStatus: 'Degraded — stale lender config detected',
    lastRebuild: '2026-05-12 06:00 AM',
  },
  {
    id: 'seg-005',
    name: 'Campaign_Templates',
    type: 'document',
    size: '8.2 MB',
    sizeBytes: 8200000,
    lastAccessed: '12m ago',
    retrievalCount: 1456,
    status: 'healthy',
    contentPreview: 'Email drip sequences, SMS templates, voicemail scripts for mortgage outreach. 234 templates across 18 campaign types. Personalization tokens indexed.',
    metadata: { templates: '234', campaigns: '18', tokens: '47', lastEdit: '2026-05-10' },
    accessHistory: [
      { time: '12m ago', latency: '2.8ms', query: 'refinance drip sequence day 3' },
      { time: '2h ago', latency: '3.1ms', query: 'first-time buyer SMS series' },
    ],
    similarResults: [
      { name: 'Agent_Sessions', score: 0.55 },
      { name: 'Lead_Embeddings', score: 0.63 },
    ],
    indexStatus: 'BM25 index healthy',
    lastRebuild: '2026-05-10 02:00 AM',
  },
  {
    id: 'seg-006',
    name: 'Audit_Logs',
    type: 'document',
    size: '47.1 MB',
    sizeBytes: 47100000,
    lastAccessed: '8m ago',
    retrievalCount: 891,
    status: 'slow',
    contentPreview: 'Immutable compliance audit trail for all mortgage operations. 90-day rolling window. TILA/RESPA/TRID event log with full action attribution.',
    metadata: { entries: '284721', window: '90d', compliance: 'TILA,RESPA,TRID', immutable: 'true' },
    accessHistory: [
      { time: '8m ago', latency: '28.3ms', query: 'audit lead LC-3201 TRID events' },
      { time: '1h ago', latency: '31.2ms', query: 'compliance events 2026-05-11' },
    ],
    similarResults: [
      { name: 'Compliance_Rules', score: 0.79 },
    ],
    indexStatus: 'Slow — index fragmentation at 68%',
    lastRebuild: '2026-04-28 03:00 AM',
  },
];

const LATENCY_DATA: Record<TimeRange, LatencyPoint[]> = {
  '1h': [
    { time: '10:00', latency: 2.1 }, { time: '10:05', latency: 1.8 }, { time: '10:10', latency: 3.4 },
    { time: '10:15', latency: 2.2 }, { time: '10:20', latency: 2.8 }, { time: '10:25', latency: 4.1 },
    { time: '10:30', latency: 3.1 }, { time: '10:35', latency: 2.5 }, { time: '10:40', latency: 28.3 },
    { time: '10:45', latency: 12.4 }, { time: '10:50', latency: 2.9 }, { time: '10:55', latency: 2.1 },
  ],
  '6h': [
    { time: '05:00', latency: 2.0 }, { time: '05:30', latency: 2.3 }, { time: '06:00', latency: 3.1 },
    { time: '06:30', latency: 2.8 }, { time: '07:00', latency: 4.2 }, { time: '07:30', latency: 3.5 },
    { time: '08:00', latency: 5.1 }, { time: '08:30', latency: 12.4 }, { time: '09:00', latency: 3.2 },
    { time: '09:30', latency: 28.3 }, { time: '10:00', latency: 3.1 }, { time: '10:30', latency: 2.9 },
  ],
  '24h': [
    { time: '11:00', latency: 1.8 }, { time: '13:00', latency: 2.1 }, { time: '15:00', latency: 3.4 },
    { time: '17:00', latency: 2.9 }, { time: '19:00', latency: 1.9 }, { time: '21:00', latency: 1.7 },
    { time: '23:00', latency: 1.6 }, { time: '01:00', latency: 1.5 }, { time: '03:00', latency: 1.8 },
    { time: '05:00', latency: 2.0 }, { time: '07:00', latency: 4.2 }, { time: '09:00', latency: 3.1 },
  ],
};

const OPERATIONS: MemoryOperation[] = [
  { id: 'op-1', type: 'retrieve', source: 'Quote Agent', targetSegment: 'Lead_Embeddings', timestamp: '10:55:42', status: 'completed', latency: '2.1ms' },
  { id: 'op-2', type: 'search', source: 'Compliance Engine', targetSegment: 'Compliance_Rules', timestamp: '10:55:38', status: 'completed', latency: '4.5ms' },
  { id: 'op-3', type: 'store', source: 'Session Manager', targetSegment: 'Agent_Sessions', timestamp: '10:55:31', status: 'active' },
  { id: 'op-4', type: 'retrieve', source: 'Rate Engine', targetSegment: 'Quote_Engine_State', timestamp: '10:55:18', status: 'completed', latency: '12.4ms' },
  { id: 'op-5', type: 'index', source: 'Audit Service', targetSegment: 'Audit_Logs', timestamp: '10:54:52', status: 'failed' },
  { id: 'op-6', type: 'retrieve', source: 'Campaign Worker', targetSegment: 'Campaign_Templates', timestamp: '10:54:41', status: 'completed', latency: '2.8ms' },
  { id: 'op-7', type: 'search', source: 'Lead Router', targetSegment: 'Lead_Embeddings', timestamp: '10:54:33', status: 'queued' },
  { id: 'op-8', type: 'evict', source: 'Cache Manager', targetSegment: 'Agent_Sessions', timestamp: '10:54:18', status: 'completed', latency: '0.3ms' },
];

// --- helpers ---

function segmentTypeIcon(type: SegmentType) {
  switch (type) {
    case 'vector': return <GitBranch size={14} className="text-purple-400" />;
    case 'document': return <FileText size={14} className="text-cyan-400" />;
    case 'conversation': return <MessageSquare size={14} className="text-pink-400" />;
  }
}

function segmentTypeLabel(type: SegmentType) {
  const colors: Record<SegmentType, string> = {
    vector: 'bg-purple-500/20 text-purple-400',
    document: 'bg-cyan-500/20 text-cyan-400',
    conversation: 'bg-pink-500/20 text-pink-400',
  };
  return <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${colors[type]}`}>{type}</span>;
}

function statusBadge(status: SegmentStatus) {
  const cfg: Record<SegmentStatus, { label: string; cls: string; dot: string }> = {
    healthy: { label: 'Healthy', cls: 'bg-green-500/20 text-green-400', dot: 'bg-green-400' },
    degraded: { label: 'Degraded', cls: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400' },
    slow: { label: 'Slow', cls: 'bg-orange-500/20 text-orange-400', dot: 'bg-orange-400' },
    error: { label: 'Error', cls: 'bg-red-500/20 text-red-400', dot: 'bg-red-400' },
  };
  const c = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded font-medium ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function opStatusBadge(status: OpStatus) {
  const cfg: Record<OpStatus, string> = {
    active: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
    queued: 'bg-gray-500/20 text-gray-400',
  };
  return <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${cfg[status]}`}>{status}</span>;
}

function opTypeColor(type: MemoryOperation['type']) {
  const colors: Record<string, string> = {
    retrieve: 'text-cyan-400',
    store: 'text-green-400',
    search: 'text-purple-400',
    index: 'text-pink-400',
    evict: 'text-orange-400',
  };
  return colors[type] || 'text-gray-400';
}

function statusIcon(status: SegmentStatus) {
  switch (status) {
    case 'healthy': return <CheckCircle2 size={16} className="text-green-400" />;
    case 'degraded': return <AlertCircle size={16} className="text-yellow-400" />;
    case 'slow': return <AlertCircle size={16} className="text-orange-400" />;
    case 'error': return <AlertTriangle size={16} className="text-red-400" />;
  }
}

// Mini sparkline chart using SVG
function LatencyChart({ data }: { data: LatencyPoint[] }) {
  const max = Math.max(...data.map(d => d.latency));
  const min = 0;
  const range = max - min || 1;
  const w = 100;
  const h = 60;
  const pad = 4;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((d.latency - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = [
    `${pad},${h - pad}`,
    ...data.map((d, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - ((d.latency - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    }),
    `${w - pad},${h - pad}`,
  ].join(' ');

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32" preserveAspectRatio="none">
        <defs>
          <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#latencyGrad)" />
        <polyline points={points} fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* spikes in orange/red */}
        {data.map((d, i) => {
          if (d.latency < 10) return null;
          const x = pad + (i / (data.length - 1)) * (w - pad * 2);
          const y = h - pad - ((d.latency - min) / range) * (h - pad * 2);
          return <circle key={i} cx={x} cy={y} r="2" fill={d.latency > 20 ? '#f87171' : '#fb923c'} />;
        })}
      </svg>
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        {data.filter((_, i) => i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1).map(d => (
          <span key={d.time}>{d.time}</span>
        ))}
      </div>
      <div className="absolute top-0 right-0 text-xs">
        <span className="text-gray-500">peak: </span>
        <span className="text-orange-400 font-mono">{max.toFixed(1)}ms</span>
      </div>
    </div>
  );
}

export default function OpenMemoryDashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [selectedSegment, setSelectedSegment] = useState<MemorySegment | null>(null);

  const latencyData = LATENCY_DATA[timeRange];

  // Derived metrics
  const totalSegments = SEGMENTS.length;
  const activeRetrievals = OPERATIONS.filter(o => o.status === 'active').length;
  const cacheHitRate = 91.4;
  const avgLatency = (OPERATIONS.filter(o => o.latency).map(o => parseFloat(o.latency!)).reduce((a, b) => a + b, 0) / OPERATIONS.filter(o => o.latency).length).toFixed(1);

  const cacheHits = 4821;
  const cacheMisses = 427;
  const hitRatio = ((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(1);

  const totalStorageBytes = SEGMENTS.reduce((sum, s) => sum + s.sizeBytes, 0);
  const vectorBytes = SEGMENTS.filter(s => s.type === 'vector').reduce((sum, s) => sum + s.sizeBytes, 0);
  const documentBytes = SEGMENTS.filter(s => s.type === 'document').reduce((sum, s) => sum + s.sizeBytes, 0);
  const conversationBytes = SEGMENTS.filter(s => s.type === 'conversation').reduce((sum, s) => sum + s.sizeBytes, 0);

  const toMB = (b: number) => (b / 1e6).toFixed(1);
  const pct = (b: number) => ((b / totalStorageBytes) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-black/95">
      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* Header + Time Range */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              OpenMemory Monitor
            </h1>
            <p className="text-gray-400">Memory operations, retrieval performance, and segment health</p>
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
                <p className="text-xs text-gray-400">Total Memory Segments</p>
                <Database size={16} className="text-cyan-400" />
              </div>
              <p className="text-3xl font-bold text-cyan-400">{totalSegments}</p>
              <p className="text-xs text-gray-600 mt-1">{SEGMENTS.filter(s => s.status === 'healthy').length} healthy</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Active Retrievals</p>
                <Activity size={16} className="text-green-400" />
              </div>
              <p className="text-3xl font-bold text-green-400">{activeRetrievals}</p>
              <p className="text-xs text-gray-600 mt-1">{OPERATIONS.filter(o => o.status === 'queued').length} queued</p>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Cache Hit Rate</p>
                <Zap size={16} className="text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-purple-400">{cacheHitRate}%</p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-400"
                  style={{ width: `${cacheHitRate}%` }}
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
              <p className="text-3xl font-bold text-pink-400">{avgLatency}ms</p>
              <p className="text-xs text-gray-600 mt-1">from completed ops</p>
            </CardContent>
          </Card>
        </div>

        {/* Middle row: Latency graph + Cache efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Latency Graph */}
          <div className="lg:col-span-2 border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-purple-400" />
                Query Latency — {timeRange}
              </h2>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> {'>'} 10ms</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> {'>'} 20ms</span>
              </div>
            </div>
            <LatencyChart data={latencyData} />
          </div>

          {/* Cache Efficiency */}
          <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <BarChart2 size={18} className="text-cyan-400" />
              Cache Efficiency
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Hits</span>
                  <span className="text-green-400 font-mono">{cacheHits.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-cyan-400" style={{ width: `${hitRatio}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Misses</span>
                  <span className="text-red-400 font-mono">{cacheMisses.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-400" style={{ width: `${(100 - parseFloat(hitRatio)).toFixed(1)}%` }} />
                </div>
              </div>

              <div className="border-t border-purple-500/10 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Hit Ratio Trend</span>
                </div>
                <p className="text-2xl font-bold text-cyan-400 mt-1">{hitRatio}%</p>
                <p className="text-xs text-green-400 mt-1">▲ +2.1% vs last window</p>
              </div>

              <div className="border-t border-purple-500/10 pt-3 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Total requests</span>
                  <span className="text-gray-300 font-mono">{(cacheHits + cacheMisses).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Evictions</span>
                  <span className="text-orange-400 font-mono">183</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Usage Breakdown */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
            <HardDrive size={18} className="text-pink-400" />
            Storage Usage Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Vector DB', bytes: vectorBytes, color: 'from-purple-500 to-purple-400', textColor: 'text-purple-400', bg: 'bg-purple-500' },
              { label: 'Document Store', bytes: documentBytes, color: 'from-cyan-500 to-cyan-400', textColor: 'text-cyan-400', bg: 'bg-cyan-500' },
              { label: 'Conversation Cache', bytes: conversationBytes, color: 'from-pink-500 to-pink-400', textColor: 'text-pink-400', bg: 'bg-pink-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-400">{item.label}</span>
                  <span className={`font-mono font-semibold ${item.textColor}`}>{toMB(item.bytes)} MB</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${item.color}`}
                    style={{ width: `${pct(item.bytes)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{pct(item.bytes)}% of {toMB(totalStorageBytes)} MB total</p>
              </div>
            ))}
          </div>
        </div>

        {/* Memory Segment Directory */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-5">
            <Database size={18} className="text-cyan-400" />
            Memory Segment Directory
          </h2>
          <div className="space-y-2">
            {SEGMENTS.map(segment => (
              <button
                key={segment.id}
                onClick={() => setSelectedSegment(segment)}
                className="w-full text-left border border-purple-500/10 hover:border-purple-500/30 p-4 rounded transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {segmentTypeIcon(segment.type)}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white group-hover:text-cyan-400 font-mono">{segment.name}</p>
                        {segmentTypeLabel(segment.type)}
                        {statusBadge(segment.status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        Size: <span className="text-gray-300">{segment.size}</span>
                        {' · '}Last accessed: <span className="text-gray-300">{segment.lastAccessed}</span>
                        {' · '}Index: <span className={segment.status === 'healthy' ? 'text-green-400' : segment.status === 'slow' ? 'text-orange-400' : 'text-yellow-400'}>{segment.indexStatus}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-cyan-400">{segment.retrievalCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">retrievals</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-cyan-400" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active Memory Operations */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-5">
            <Activity size={18} className="text-green-400" />
            Active Memory Operations
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-purple-500/10">
                  <th className="text-left pb-3 pr-4">Type</th>
                  <th className="text-left pb-3 pr-4">Source</th>
                  <th className="text-left pb-3 pr-4">Target Segment</th>
                  <th className="text-left pb-3 pr-4">Timestamp</th>
                  <th className="text-left pb-3 pr-4">Latency</th>
                  <th className="text-left pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/5">
                {OPERATIONS.map(op => (
                  <tr key={op.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pr-4">
                      <span className={`font-mono font-semibold uppercase text-xs ${opTypeColor(op.type)}`}>{op.type}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-300">{op.source}</td>
                    <td className="py-3 pr-4 text-gray-400 font-mono text-xs">{op.targetSegment}</td>
                    <td className="py-3 pr-4 text-gray-500 font-mono text-xs">{op.timestamp}</td>
                    <td className="py-3 pr-4">
                      {op.latency
                        ? <span className="font-mono text-cyan-400">{op.latency}</span>
                        : <span className="text-gray-600">—</span>
                      }
                    </td>
                    <td className="py-3">{opStatusBadge(op.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Semantic Search Index Status */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Search size={18} className="text-purple-400" />
            Semantic Search Index Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SEGMENTS.map(segment => (
              <div key={segment.id} className="border border-purple-500/10 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-mono text-gray-300">{segment.name}</p>
                  {statusIcon(segment.status)}
                </div>
                <p className={`text-xs mb-1 ${
                  segment.status === 'healthy' ? 'text-green-400' :
                  segment.status === 'slow' ? 'text-orange-400' :
                  segment.status === 'degraded' ? 'text-yellow-400' : 'text-red-400'
                }`}>{segment.indexStatus}</p>
                <p className="text-xs text-gray-600">
                  <RefreshCw size={10} className="inline mr-1" />
                  Last rebuild: {segment.lastRebuild}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Segment Detail Modal */}
      {selectedSegment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-purple-500/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-purple-500/20 bg-black/90 backdrop-blur">
              <div className="flex items-center gap-3">
                {segmentTypeIcon(selectedSegment.type)}
                <h2 className="text-lg font-bold text-white font-mono">{selectedSegment.name}</h2>
                {segmentTypeLabel(selectedSegment.type)}
                {statusBadge(selectedSegment.status)}
              </div>
              <button
                onClick={() => setSelectedSegment(null)}
                className="p-1.5 hover:bg-red-500/20 rounded transition"
              >
                <X size={18} className="text-red-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Content Preview */}
              <div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Content Preview</p>
                <p className="text-sm text-gray-300 leading-relaxed bg-black/50 border border-purple-500/10 rounded p-4">
                  {selectedSegment.contentPreview}
                </p>
              </div>

              {/* Metadata */}
              <div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Metadata</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedSegment.metadata).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs border border-purple-500/10 rounded px-3 py-2">
                      <span className="text-gray-500">{k}</span>
                      <span className="text-cyan-400 font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Access History */}
              <div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Recent Access History</p>
                <div className="space-y-2">
                  {selectedSegment.accessHistory.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-xs border border-purple-500/10 rounded px-3 py-2">
                      <span className="text-gray-400 truncate mr-4 max-w-xs">{entry.query}</span>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-cyan-400 font-mono">{entry.latency}</span>
                        <span className="text-gray-600">{entry.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Similarity Search Results */}
              <div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Similarity Search — Related Segments</p>
                <div className="space-y-2">
                  {selectedSegment.similarResults.map((result, i) => (
                    <div key={i} className="flex items-center justify-between text-xs border border-purple-500/10 rounded px-3 py-2">
                      <span className="text-gray-300 font-mono">{result.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-slate-800 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                            style={{ width: `${result.score * 100}%` }}
                          />
                        </div>
                        <span className="text-purple-400 font-mono w-10 text-right">{(result.score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Index Status */}
              <div className="border-t border-purple-500/20 pt-4">
                <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Index Status</p>
                <div className="flex items-start gap-3">
                  {statusIcon(selectedSegment.status)}
                  <div>
                    <p className={`text-sm font-medium ${
                      selectedSegment.status === 'healthy' ? 'text-green-400' :
                      selectedSegment.status === 'slow' ? 'text-orange-400' :
                      selectedSegment.status === 'degraded' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{selectedSegment.indexStatus}</p>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <RefreshCw size={10} />
                      Last rebuild: {selectedSegment.lastRebuild}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
