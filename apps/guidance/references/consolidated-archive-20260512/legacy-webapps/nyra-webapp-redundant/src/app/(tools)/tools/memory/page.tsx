'use client';

import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  FileText,
  HardDrive,
  Layers,
  MessageSquare,
  RefreshCw,
  Settings,
  Shield,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = '1h' | '6h' | '24h';

type EfficiencyLevel = 'efficient' | 'good' | 'monitor' | 'optimize';

interface MemoryConsumer {
  id: string;
  name: string;
  category: 'conversation' | 'document' | 'vector';
  sizeMB: number;
  lastAccessed: string;
  accessCount: number;
  efficiency: EfficiencyLevel;
  fragmentationPct: number;
  detail: {
    description: string;
    topQueries: string[];
    created: string;
    retentionPolicy: string;
    recommendation: string | null;
  };
}

interface CleanupRecord {
  id: string;
  timestamp: string;
  operation: string;
  spaceReclaimedMB: number;
  itemsRemoved: number;
  triggeredBy: 'manual' | 'scheduled' | 'policy';
  status: 'completed' | 'failed' | 'partial';
}

interface CachePoint {
  time: string;
  hitRate: number;
  pressure: number;
}

interface OptimizationRec {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savingsMB: number;
  action: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const CONSUMERS: MemoryConsumer[] = [
  {
    id: 'mc-001',
    name: 'Lead_Embeddings_v3',
    category: 'vector',
    sizeMB: 128.4,
    lastAccessed: '4s ago',
    accessCount: 9341,
    efficiency: 'efficient',
    fragmentationPct: 3,
    detail: {
      description:
        'Dense 1536-dim embeddings for 18,432 lead profiles. Covers demographics, financial signals, and source attribution. HNSW index with ef=200.',
      topQueries: [
        'mortgage leads near Austin TX',
        'first-time buyer segment',
        'high credit score refinance',
      ],
      created: '2026-02-14',
      retentionPolicy: 'Indefinite (active leads)',
      recommendation: null,
    },
  },
  {
    id: 'mc-002',
    name: 'Audit_Logs_90d',
    category: 'document',
    sizeMB: 47.1,
    lastAccessed: '8m ago',
    accessCount: 891,
    efficiency: 'optimize',
    fragmentationPct: 68,
    detail: {
      description:
        'Immutable TILA/RESPA/TRID compliance audit trail. 284,721 entries over 90-day rolling window. BM25 index with high fragmentation.',
      topQueries: [
        'audit lead LC-3201 TRID events',
        'compliance events 2026-05-11',
        'rate-lock disclosure log',
      ],
      created: '2026-02-12',
      retentionPolicy: '90 days (regulatory minimum)',
      recommendation:
        'Index fragmentation at 68% — defragment index to recover ~18 MB and restore query speed.',
    },
  },
  {
    id: 'mc-003',
    name: 'Agent_Sessions',
    category: 'conversation',
    sizeMB: 24.5,
    lastAccessed: '4s ago',
    accessCount: 4821,
    efficiency: 'good',
    fragmentationPct: 11,
    detail: {
      description:
        '1,203 agent conversation threads. 47 active, 1,156 archived. Includes tool call traces, reasoning chains, and decision logs.',
      topQueries: [
        'session ctx lead_id:LC-4821',
        'quote agent last action',
        'compliance check thread',
      ],
      created: '2026-01-28',
      retentionPolicy: '90 days active / 30 days archived',
      recommendation:
        'Consolidate 847 archived sessions older than 30 days — estimated 14 MB savings.',
    },
  },
  {
    id: 'mc-004',
    name: 'Quote_Engine_State',
    category: 'document',
    sizeMB: 15.8,
    lastAccessed: '38s ago',
    accessCount: 3672,
    efficiency: 'monitor',
    fragmentationPct: 29,
    detail: {
      description:
        '38 lender rate sheets, 214 product matrices, and pricing snapshots. Stale config detected for 3 lenders.',
      topQueries: [
        'conventional 30yr rate Chase',
        'FHA low credit product matrix',
        'jumbo ARM lenders CA',
      ],
      created: '2026-03-01',
      retentionPolicy: 'Rolling — replaced on import',
      recommendation: 'Purge 3 stale lender configs — estimated 2.4 MB savings.',
    },
  },
  {
    id: 'mc-005',
    name: 'Campaign_Templates',
    category: 'document',
    sizeMB: 8.2,
    lastAccessed: '12m ago',
    accessCount: 1456,
    efficiency: 'efficient',
    fragmentationPct: 5,
    detail: {
      description:
        '234 email/SMS/voicemail templates across 18 campaign types. Personalization tokens fully indexed. BM25 index healthy.',
      topQueries: [
        'refinance drip sequence day 3',
        'first-time buyer SMS series',
        'rate-lock expiry voicemail',
      ],
      created: '2026-02-20',
      retentionPolicy: '1 year (marketing archive)',
      recommendation: null,
    },
  },
  {
    id: 'mc-006',
    name: 'Compliance_Rules',
    category: 'document',
    sizeMB: 4.7,
    lastAccessed: '2m ago',
    accessCount: 2103,
    efficiency: 'efficient',
    fragmentationPct: 2,
    detail: {
      description:
        'TILA, RESPA, TRID regulatory texts, 50-state guidelines, and CFPB bulletins Q1–Q2 2026. Hybrid BM25 + vector index.',
      topQueries: [
        'TRID disclosure requirements TX',
        'RESPA Section 8 referral fees',
        'state usury limits 2026',
      ],
      created: '2026-01-15',
      retentionPolicy: 'Indefinite (regulatory reference)',
      recommendation: null,
    },
  },
];

const CLEANUP_HISTORY: CleanupRecord[] = [
  {
    id: 'cl-001',
    timestamp: '2026-05-12 03:00 AM',
    operation: 'Archive old conversation threads (>60d)',
    spaceReclaimedMB: 22.4,
    itemsRemoved: 312,
    triggeredBy: 'scheduled',
    status: 'completed',
  },
  {
    id: 'cl-002',
    timestamp: '2026-05-11 03:00 AM',
    operation: 'Rebuild Audit_Logs BM25 index',
    spaceReclaimedMB: 8.1,
    itemsRemoved: 0,
    triggeredBy: 'scheduled',
    status: 'completed',
  },
  {
    id: 'cl-003',
    timestamp: '2026-05-10 11:24 AM',
    operation: 'Purge expired lender rate sheets',
    spaceReclaimedMB: 5.6,
    itemsRemoved: 7,
    triggeredBy: 'manual',
    status: 'completed',
  },
  {
    id: 'cl-004',
    timestamp: '2026-05-09 03:00 AM',
    operation: 'Defragment Lead_Embeddings HNSW index',
    spaceReclaimedMB: 14.2,
    itemsRemoved: 0,
    triggeredBy: 'scheduled',
    status: 'completed',
  },
  {
    id: 'cl-005',
    timestamp: '2026-05-08 02:15 AM',
    operation: 'Evict stale vector cache entries',
    spaceReclaimedMB: 0,
    itemsRemoved: 1840,
    triggeredBy: 'policy',
    status: 'partial',
  },
  {
    id: 'cl-006',
    timestamp: '2026-05-07 03:00 AM',
    operation: 'Compact document store segments',
    spaceReclaimedMB: 9.3,
    itemsRemoved: 0,
    triggeredBy: 'scheduled',
    status: 'failed',
  },
];

const OPT_RECS: OptimizationRec[] = [
  {
    id: 'opt-001',
    title: 'Defragment Audit_Logs index',
    description:
      'BM25 index fragmentation at 68% is causing 28ms average query latency. Defragmentation will restore sub-5ms performance.',
    impact: 'high',
    savingsMB: 18,
    action: 'Defragment now',
  },
  {
    id: 'opt-002',
    title: 'Consolidate archived conversations',
    description:
      '847 agent sessions older than 30 days are stored at full fidelity. Compressing them to summary format frees ~14 MB.',
    impact: 'high',
    savingsMB: 14,
    action: 'Consolidate',
  },
  {
    id: 'opt-003',
    title: 'Archive unused campaign templates',
    description:
      '67 templates unused in the last 90 days can be moved to cold storage without affecting active campaigns.',
    impact: 'medium',
    savingsMB: 2.3,
    action: 'Archive',
  },
  {
    id: 'opt-004',
    title: 'Purge stale lender configs',
    description:
      '3 lender rate sheets have not been updated in over 14 days and are flagged as stale. Safe to purge.',
    impact: 'medium',
    savingsMB: 2.4,
    action: 'Purge stale',
  },
  {
    id: 'opt-005',
    title: 'Rebuild Lead_Embeddings index',
    description:
      'Minor fragmentation (3%) detected. Scheduled rebuild at 03:00 AM will maintain peak HNSW performance.',
    impact: 'low',
    savingsMB: 0.8,
    action: 'Schedule rebuild',
  },
];

const CACHE_DATA: Record<TimeRange, CachePoint[]> = {
  '1h': [
    { time: '10:00', hitRate: 89.2, pressure: 32 },
    { time: '10:05', hitRate: 90.1, pressure: 34 },
    { time: '10:10', hitRate: 91.4, pressure: 31 },
    { time: '10:15', hitRate: 91.8, pressure: 36 },
    { time: '10:20', hitRate: 90.4, pressure: 48 },
    { time: '10:25', hitRate: 88.9, pressure: 62 },
    { time: '10:30', hitRate: 91.2, pressure: 45 },
    { time: '10:35', hitRate: 92.0, pressure: 38 },
    { time: '10:40', hitRate: 91.4, pressure: 35 },
    { time: '10:45', hitRate: 90.8, pressure: 37 },
    { time: '10:50', hitRate: 91.4, pressure: 33 },
    { time: '10:55', hitRate: 91.4, pressure: 31 },
  ],
  '6h': [
    { time: '05:00', hitRate: 87.1, pressure: 22 },
    { time: '05:30', hitRate: 88.4, pressure: 25 },
    { time: '06:00', hitRate: 89.2, pressure: 28 },
    { time: '06:30', hitRate: 90.1, pressure: 31 },
    { time: '07:00', hitRate: 91.4, pressure: 44 },
    { time: '07:30', hitRate: 90.8, pressure: 58 },
    { time: '08:00', hitRate: 88.2, pressure: 71 },
    { time: '08:30', hitRate: 89.9, pressure: 65 },
    { time: '09:00', hitRate: 91.0, pressure: 52 },
    { time: '09:30', hitRate: 90.4, pressure: 41 },
    { time: '10:00', hitRate: 91.2, pressure: 35 },
    { time: '10:30', hitRate: 91.4, pressure: 31 },
  ],
  '24h': [
    { time: '11:00', hitRate: 84.2, pressure: 18 },
    { time: '13:00', hitRate: 86.8, pressure: 24 },
    { time: '15:00', hitRate: 88.1, pressure: 35 },
    { time: '17:00', hitRate: 90.2, pressure: 52 },
    { time: '19:00', hitRate: 91.4, pressure: 48 },
    { time: '21:00', hitRate: 92.1, pressure: 38 },
    { time: '23:00', hitRate: 93.0, pressure: 29 },
    { time: '01:00', hitRate: 94.2, pressure: 20 },
    { time: '03:00', hitRate: 93.8, pressure: 18 },
    { time: '05:00', hitRate: 91.4, pressure: 22 },
    { time: '07:00', hitRate: 89.0, pressure: 44 },
    { time: '09:00', hitRate: 91.4, pressure: 31 },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function efficiencyColor(level: EfficiencyLevel): string {
  switch (level) {
    case 'efficient': return 'text-green-400';
    case 'good':      return 'text-yellow-400';
    case 'monitor':   return 'text-orange-400';
    case 'optimize':  return 'text-red-400';
  }
}

function efficiencyBg(level: EfficiencyLevel): string {
  switch (level) {
    case 'efficient': return 'bg-green-500/20 border-green-500/30 text-green-400';
    case 'good':      return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
    case 'monitor':   return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
    case 'optimize':  return 'bg-red-500/20 border-red-500/30 text-red-400';
  }
}

function efficiencyBarColor(level: EfficiencyLevel): string {
  switch (level) {
    case 'efficient': return 'from-green-500 to-emerald-400';
    case 'good':      return 'from-yellow-500 to-amber-400';
    case 'monitor':   return 'from-orange-500 to-amber-500';
    case 'optimize':  return 'from-red-500 to-rose-400';
  }
}

function categoryIcon(cat: MemoryConsumer['category'], size = 14) {
  switch (cat) {
    case 'vector':       return <Database size={size} className="text-purple-400" />;
    case 'document':     return <FileText size={size} className="text-cyan-400" />;
    case 'conversation': return <MessageSquare size={size} className="text-pink-400" />;
  }
}

function categoryLabel(cat: MemoryConsumer['category']) {
  const styles: Record<MemoryConsumer['category'], string> = {
    vector:       'bg-purple-500/20 text-purple-400',
    document:     'bg-cyan-500/20 text-cyan-400',
    conversation: 'bg-pink-500/20 text-pink-400',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${styles[cat]}`}>
      {cat}
    </span>
  );
}

function impactBadge(impact: OptimizationRec['impact']) {
  const styles: Record<string, string> = {
    high:   'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low:    'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium uppercase ${styles[impact]}`}>
      {impact}
    </span>
  );
}

function cleanupStatusBadge(status: CleanupRecord['status']) {
  const styles: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400',
    partial:   'bg-yellow-500/20 text-yellow-400',
    failed:    'bg-red-500/20 text-red-400',
  };
  const icons = {
    completed: <CheckCircle2 size={12} />,
    partial:   <AlertCircle size={12} />,
    failed:    <AlertTriangle size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium capitalize ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
}

function cleanupTriggerBadge(trigger: CleanupRecord['triggeredBy']) {
  const styles: Record<string, string> = {
    manual:    'bg-purple-500/20 text-purple-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
    policy:    'bg-cyan-500/20 text-cyan-400',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${styles[trigger]}`}>
      {trigger}
    </span>
  );
}

// Dual-line sparkline: hit rate (top) + pressure (bottom)
function CacheChart({ data }: { data: CachePoint[] }) {
  const w = 100;
  const h = 80;
  const pad = 4;

  const hitMin = 80;
  const hitMax = 100;
  const pressMin = 0;
  const pressMax = 100;

  function toXY(i: number, val: number, min: number, max: number): [number, number] {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((val - min) / (max - min)) * (h - pad * 2);
    return [x, y];
  }

  const hitPoints = data.map((d, i) => toXY(i, d.hitRate, hitMin, hitMax).join(',')).join(' ');
  const pressPoints = data.map((d, i) => toXY(i, d.pressure, pressMin, pressMax).join(',')).join(' ');

  const hitArea = [
    `${pad},${h - pad}`,
    ...data.map((d, i) => toXY(i, d.hitRate, hitMin, hitMax).join(',')),
    `${w - pad},${h - pad}`,
  ].join(' ');

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28" preserveAspectRatio="none">
        <defs>
          <linearGradient id="hitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={hitArea} fill="url(#hitGrad)" />
        <polyline points={hitPoints} fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={pressPoints} fill="none" stroke="#f97316" strokeWidth="1" strokeDasharray="2,2" strokeLinecap="round" />
      </svg>
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        {data.filter((_, i) => i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1).map(d => (
          <span key={d.time}>{d.time}</span>
        ))}
      </div>
      <div className="flex gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-0.5 bg-green-400 inline-block rounded" /> Hit rate
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-0.5 bg-orange-400 inline-block rounded border-dashed border-t border-orange-400" /> Pressure
        </span>
      </div>
    </div>
  );
}

// ─── Retention policy state ───────────────────────────────────────────────────

interface RetentionPolicy {
  name: string;
  currentDays: number;
  minDays: number;
  maxDays: number;
  description: string;
}

const RETENTION_POLICIES: RetentionPolicy[] = [
  { name: 'Conversation Sessions',  currentDays: 90,  minDays: 30,  maxDays: 365, description: 'Archived agent threads and decision logs' },
  { name: 'Audit Trail',            currentDays: 90,  minDays: 90,  maxDays: 365, description: 'Regulatory minimum — TILA/RESPA/TRID immutable logs' },
  { name: 'Campaign Templates',     currentDays: 365, minDays: 30,  maxDays: 730, description: 'Email/SMS/voicemail template archive' },
  { name: 'Vector Cache Entries',   currentDays: 30,  minDays: 7,   maxDays: 90,  description: 'In-memory embedding cache TTL' },
  { name: 'Rate Sheet Snapshots',   currentDays: 14,  minDays: 7,   maxDays: 30,  description: 'Lender pricing state history' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MemoryAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [selectedConsumer, setSelectedConsumer] = useState<MemoryConsumer | null>(null);
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>(RETENTION_POLICIES);

  const cacheData = CACHE_DATA[timeRange];

  // ── Derived metrics ──────────────────────────────────────────────────────
  const totalMB = CONSUMERS.reduce((s, c) => s + c.sizeMB, 0);
  const vectorMB = CONSUMERS.filter(c => c.category === 'vector').reduce((s, c) => s + c.sizeMB, 0);
  const documentMB = CONSUMERS.filter(c => c.category === 'document').reduce((s, c) => s + c.sizeMB, 0);
  const conversationMB = CONSUMERS.filter(c => c.category === 'conversation').reduce((s, c) => s + c.sizeMB, 0);
  const cacheMB = 18.3; // in-memory cache (separate from persistent segments)

  const currentHitRate = cacheData[cacheData.length - 1].hitRate;
  const prevHitRate = cacheData[0].hitRate;
  const hitRateDelta = (currentHitRate - prevHitRate).toFixed(1);

  const efficiencyScore = Math.round(
    (CONSUMERS.reduce((s, c) => {
      const w = { efficient: 100, good: 80, monitor: 55, optimize: 20 }[c.efficiency];
      return s + w;
    }, 0) / CONSUMERS.length)
  );

  const optimizeCount = CONSUMERS.filter(c => c.recommendation).length;
  const totalFragmentation = Math.round(
    CONSUMERS.reduce((s, c) => s + c.fragmentationPct, 0) / CONSUMERS.length
  );

  const pct = (v: number) => ((v / totalMB) * 100).toFixed(1);

  const efficiencyLevel: EfficiencyLevel =
    efficiencyScore >= 85 ? 'efficient' :
    efficiencyScore >= 70 ? 'good' :
    efficiencyScore >= 50 ? 'monitor' : 'optimize';

  const fragLevel: EfficiencyLevel =
    totalFragmentation <= 10 ? 'efficient' :
    totalFragmentation <= 25 ? 'good' :
    totalFragmentation <= 50 ? 'monitor' : 'optimize';

  return (
    <div className="min-h-screen bg-black/95">
      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Memory Analytics
            </h1>
            <p className="text-gray-400">
              Comprehensive memory usage, cache performance, and optimization insights
            </p>
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

        {/* ── Metrics Cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Memory */}
          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Total Memory Used</p>
                <HardDrive size={16} className="text-cyan-400" />
              </div>
              <p className="text-3xl font-bold text-cyan-400">{totalMB.toFixed(0)} MB</p>
              <p className="text-xs text-gray-600 mt-1">
                {(totalMB / 1024).toFixed(2)} GB across {CONSUMERS.length} segments
              </p>
            </CardContent>
          </Card>

          {/* Cache Hit Rate */}
          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Cache Hit Rate</p>
                <Zap size={16} className="text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-purple-400">{currentHitRate.toFixed(1)}%</p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-400"
                  style={{ width: `${currentHitRate}%` }}
                />
              </div>
              <p className={`text-xs mt-1 ${parseFloat(hitRateDelta) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(hitRateDelta) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(hitRateDelta))}% vs window start
              </p>
            </CardContent>
          </Card>

          {/* Efficiency Score */}
          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Memory Efficiency Score</p>
                <TrendingUp size={16} className={efficiencyColor(efficiencyLevel)} />
              </div>
              <p className={`text-3xl font-bold ${efficiencyColor(efficiencyLevel)}`}>{efficiencyScore}</p>
              <p className="text-xs text-gray-600 mt-1">out of 100</p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                <div
                  className={`h-1.5 rounded-full bg-gradient-to-r ${efficiencyBarColor(efficiencyLevel)}`}
                  style={{ width: `${efficiencyScore}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Optimization Opportunities */}
          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Optimization Opportunities</p>
                <AlertCircle size={16} className="text-orange-400" />
              </div>
              <p className="text-3xl font-bold text-orange-400">{optimizeCount}</p>
              <p className="text-xs text-gray-600 mt-1">
                {OPT_RECS.reduce((s, r) => s + r.savingsMB, 0).toFixed(1)} MB recoverable
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Memory Usage Breakdown + Cache Performance ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Storage Breakdown */}
          <div className="lg:col-span-2 border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
              <Layers size={18} className="text-pink-400" />
              Memory Usage Breakdown
            </h2>
            <div className="space-y-5">
              {[
                { label: 'Vector DB',          mb: vectorMB,       color: 'from-purple-500 to-purple-400', textColor: 'text-purple-400', dot: 'bg-purple-400' },
                { label: 'Document Store',      mb: documentMB,     color: 'from-cyan-500 to-cyan-400',    textColor: 'text-cyan-400',   dot: 'bg-cyan-400'   },
                { label: 'Conversation Cache',  mb: conversationMB, color: 'from-pink-500 to-pink-400',    textColor: 'text-pink-400',   dot: 'bg-pink-400'   },
                { label: 'In-Memory Cache',     mb: cacheMB,        color: 'from-green-500 to-emerald-400', textColor: 'text-green-400', dot: 'bg-green-400'  },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                      <span className="text-gray-400">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">{pct(item.mb)}%</span>
                      <span className={`font-mono font-semibold ${item.textColor}`}>{item.mb.toFixed(1)} MB</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${item.color}`}
                      style={{ width: `${parseFloat(pct(item.mb))}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="border-t border-purple-500/10 pt-4 flex items-center justify-between text-sm">
                <span className="text-gray-500">Total allocated</span>
                <span className="text-white font-bold font-mono">{totalMB.toFixed(1)} MB</span>
              </div>
            </div>
          </div>

          {/* Cache Performance */}
          <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <BarChart2 size={18} className="text-green-400" />
              Cache Performance
            </h2>
            <CacheChart data={cacheData} />

            <div className="border-t border-purple-500/10 mt-4 pt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Current hit rate</span>
                <span className="text-green-400 font-mono font-bold">{currentHitRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Peak pressure</span>
                <span className="text-orange-400 font-mono">{Math.max(...cacheData.map(d => d.pressure))}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cache size</span>
                <span className="text-cyan-400 font-mono">{cacheMB} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hit / miss ratio</span>
                <span className="text-gray-300 font-mono">4,821 / 427</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Top Memory Consumers ─────────────────────────────────────────── */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-5">
            <Database size={18} className="text-cyan-400" />
            Top Memory Consumers
          </h2>
          <div className="space-y-2">
            {[...CONSUMERS].sort((a, b) => b.sizeMB - a.sizeMB).map(consumer => (
              <button
                key={consumer.id}
                onClick={() => setSelectedConsumer(consumer)}
                className="w-full text-left border border-purple-500/10 hover:border-purple-500/30 p-4 rounded transition group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {categoryIcon(consumer.category)}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white group-hover:text-cyan-400 font-mono">
                          {consumer.name}
                        </p>
                        {categoryLabel(consumer.category)}
                        <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${efficiencyBg(consumer.efficiency)}`}>
                          {consumer.efficiency}
                        </span>
                      </div>
                      {/* Usage bar */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full bg-gradient-to-r ${efficiencyBarColor(consumer.efficiency)}`}
                            style={{ width: `${pct(consumer.sizeMB)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{pct(consumer.sizeMB)}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Last accessed: <span className="text-gray-300">{consumer.lastAccessed}</span>
                        {' · '}
                        Fragmentation: <span className={efficiencyColor(
                          consumer.fragmentationPct <= 10 ? 'efficient' :
                          consumer.fragmentationPct <= 25 ? 'good' :
                          consumer.fragmentationPct <= 50 ? 'monitor' : 'optimize'
                        )}>{consumer.fragmentationPct}%</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-cyan-400">{consumer.sizeMB.toFixed(1)} MB</p>
                      <p className="text-xs text-gray-500">{consumer.accessCount.toLocaleString()} accesses</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-cyan-400" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Optimization Recommendations ─────────────────────────────────── */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-5">
            <TrendingDown size={18} className="text-orange-400" />
            Optimization Recommendations
          </h2>
          <div className="space-y-3">
            {OPT_RECS.map(rec => (
              <div
                key={rec.id}
                className="flex items-start justify-between gap-4 border border-purple-500/10 rounded p-4 hover:border-orange-500/20 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {impactBadge(rec.impact)}
                    <p className="text-sm font-semibold text-white">{rec.title}</p>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{rec.description}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  <p className="text-sm font-bold text-green-400">~{rec.savingsMB} MB</p>
                  <button className="text-xs px-3 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition whitespace-nowrap">
                    {rec.action}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-purple-500/10 flex items-center justify-between text-sm">
            <span className="text-gray-500">Total recoverable space</span>
            <span className="text-green-400 font-bold font-mono">
              ~{OPT_RECS.reduce((s, r) => s + r.savingsMB, 0).toFixed(1)} MB
            </span>
          </div>
        </div>

        {/* ── Fragmentation Status ──────────────────────────────────────────── */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
            <Shield size={18} className="text-yellow-400" />
            Memory Fragmentation Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Per-segment fragmentation */}
            <div className="space-y-3">
              {CONSUMERS.map(c => {
                const fl: EfficiencyLevel =
                  c.fragmentationPct <= 10 ? 'efficient' :
                  c.fragmentationPct <= 25 ? 'good' :
                  c.fragmentationPct <= 50 ? 'monitor' : 'optimize';
                return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400 font-mono">{c.name}</span>
                      <span className={`font-bold font-mono ${efficiencyColor(fl)}`}>{c.fragmentationPct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${efficiencyBarColor(fl)}`}
                        style={{ width: `${c.fragmentationPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Defragmentation summary */}
            <div className="space-y-4">
              <div className="border border-purple-500/10 rounded p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Average fragmentation</span>
                  <span className={`text-lg font-bold ${efficiencyColor(fragLevel)}`}>{totalFragmentation}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${efficiencyBarColor(fragLevel)}`}
                    style={{ width: `${totalFragmentation}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {fragLevel === 'optimize'
                    ? 'Critical — defragmentation required immediately.'
                    : fragLevel === 'monitor'
                    ? 'Elevated — schedule defragmentation within 7 days.'
                    : fragLevel === 'good'
                    ? 'Moderate — next scheduled maintenance window acceptable.'
                    : 'Healthy — no action required.'}
                </p>
              </div>

              <div className="border border-purple-500/10 rounded p-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Defragmentation Recommendations</p>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400">
                    <span className="text-red-400 font-semibold">Audit_Logs (68%)</span> — defragment index immediately. Latency: 28ms avg.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400">
                    <span className="text-orange-400 font-semibold">Quote_Engine_State (29%)</span> — schedule rebuild after next rate import.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400">
                    4 segments within acceptable thresholds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Cleanup History ──────────────────────────────────────────────── */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
            <Trash2 size={18} className="text-red-400" />
            Memory Cleanup History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-purple-500/10">
                  <th className="text-left pb-3 pr-4">Timestamp</th>
                  <th className="text-left pb-3 pr-4">Operation</th>
                  <th className="text-left pb-3 pr-4">Trigger</th>
                  <th className="text-right pb-3 pr-4">Reclaimed</th>
                  <th className="text-right pb-3 pr-4">Items</th>
                  <th className="text-left pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/5">
                {CLEANUP_HISTORY.map(record => (
                  <tr key={record.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 text-gray-500 font-mono text-xs whitespace-nowrap">{record.timestamp}</td>
                    <td className="py-3 pr-4 text-gray-300 text-xs">{record.operation}</td>
                    <td className="py-3 pr-4">{cleanupTriggerBadge(record.triggeredBy)}</td>
                    <td className="py-3 pr-4 text-right">
                      {record.spaceReclaimedMB > 0
                        ? <span className="text-green-400 font-mono font-semibold">{record.spaceReclaimedMB.toFixed(1)} MB</span>
                        : <span className="text-gray-600">—</span>
                      }
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {record.itemsRemoved > 0
                        ? <span className="text-cyan-400 font-mono">{record.itemsRemoved.toLocaleString()}</span>
                        : <span className="text-gray-600">—</span>
                      }
                    </td>
                    <td className="py-3">{cleanupStatusBadge(record.status)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-purple-500/10">
                  <td colSpan={3} className="pt-3 text-xs text-gray-600">Total from last 6 operations</td>
                  <td className="pt-3 text-right font-bold text-green-400 font-mono">
                    {CLEANUP_HISTORY.reduce((s, r) => s + r.spaceReclaimedMB, 0).toFixed(1)} MB
                  </td>
                  <td className="pt-3 text-right text-cyan-400 font-mono">
                    {CLEANUP_HISTORY.reduce((s, r) => s + r.itemsRemoved, 0).toLocaleString()}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Retention Policy Settings ─────────────────────────────────────── */}
        <div className="border border-purple-500/20 bg-black/40 backdrop-blur p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
            <Settings size={18} className="text-purple-400" />
            Retention Policy Settings
          </h2>
          <div className="space-y-4">
            {retentionPolicies.map((policy, i) => (
              <div key={policy.name} className="border border-purple-500/10 rounded p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{policy.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{policy.description}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-600">{policy.minDays}d</span>
                    <input
                      type="range"
                      min={policy.minDays}
                      max={policy.maxDays}
                      value={policy.currentDays}
                      onChange={e => {
                        const updated = [...retentionPolicies];
                        updated[i] = { ...policy, currentDays: parseInt(e.target.value) };
                        setRetentionPolicies(updated);
                      }}
                      className="w-32 accent-purple-500"
                      disabled={policy.minDays === 90 && policy.name === 'Audit Trail'}
                    />
                    <span className="text-xs text-gray-600">{policy.maxDays}d</span>
                    <span className="text-sm font-bold text-purple-400 w-14 text-right">
                      {policy.currentDays}d
                    </span>
                  </div>
                </div>
                {policy.minDays === 90 && policy.name === 'Audit Trail' && (
                  <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                    <Shield size={12} />
                    Locked at regulatory minimum — TILA/RESPA/TRID requirement
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition text-sm font-medium">
              <RefreshCw size={14} />
              Apply Retention Policies
            </button>
          </div>
        </div>

      </div>

      {/* ── Consumer Detail Modal ────────────────────────────────────────────── */}
      {selectedConsumer && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedConsumer(null)}
        >
          <div
            className="bg-black border border-purple-500/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-purple-500/20 bg-black/90 backdrop-blur">
              <div className="flex items-center gap-3 flex-wrap">
                {categoryIcon(selectedConsumer.category, 16)}
                <h2 className="text-lg font-bold text-white font-mono">{selectedConsumer.name}</h2>
                {categoryLabel(selectedConsumer.category)}
                <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${efficiencyBg(selectedConsumer.efficiency)}`}>
                  {selectedConsumer.efficiency}
                </span>
              </div>
              <button
                onClick={() => setSelectedConsumer(null)}
                className="p-1.5 hover:bg-red-500/20 rounded transition flex-shrink-0"
              >
                <X size={18} className="text-red-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Key stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Size', value: `${selectedConsumer.sizeMB.toFixed(1)} MB`, color: 'text-cyan-400' },
                  { label: 'Accesses', value: selectedConsumer.accessCount.toLocaleString(), color: 'text-purple-400' },
                  { label: 'Fragmentation', value: `${selectedConsumer.fragmentationPct}%`, color: efficiencyColor(
                    selectedConsumer.fragmentationPct <= 10 ? 'efficient' :
                    selectedConsumer.fragmentationPct <= 25 ? 'good' :
                    selectedConsumer.fragmentationPct <= 50 ? 'monitor' : 'optimize'
                  ) },
                  { label: 'Last Accessed', value: selectedConsumer.lastAccessed, color: 'text-gray-300' },
                ].map(stat => (
                  <div key={stat.label} className="border border-purple-500/10 rounded px-3 py-3">
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className={`text-base font-bold font-mono ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Description</p>
                <p className="text-sm text-gray-300 leading-relaxed bg-black/50 border border-purple-500/10 rounded p-4">
                  {selectedConsumer.detail.description}
                </p>
              </div>

              {/* Top queries */}
              <div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Top Query Patterns</p>
                <div className="space-y-2">
                  {selectedConsumer.detail.topQueries.map((q, i) => (
                    <div key={i} className="flex items-center gap-3 border border-purple-500/10 rounded px-3 py-2">
                      <span className="text-xs text-purple-400 font-bold w-4">{i + 1}</span>
                      <span className="text-xs text-gray-300 font-mono">{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata row */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Created', value: selectedConsumer.detail.created },
                  { label: 'Retention Policy', value: selectedConsumer.detail.retentionPolicy },
                ].map(item => (
                  <div key={item.label} className="border border-purple-500/10 rounded px-3 py-2">
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className="text-xs text-cyan-400 font-medium">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Fragmentation bar */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-500 uppercase tracking-wider">Index Fragmentation</span>
                  <span className={`font-bold font-mono ${efficiencyColor(
                    selectedConsumer.fragmentationPct <= 10 ? 'efficient' :
                    selectedConsumer.fragmentationPct <= 25 ? 'good' :
                    selectedConsumer.fragmentationPct <= 50 ? 'monitor' : 'optimize'
                  )}`}>{selectedConsumer.fragmentationPct}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${efficiencyBarColor(
                      selectedConsumer.fragmentationPct <= 10 ? 'efficient' :
                      selectedConsumer.fragmentationPct <= 25 ? 'good' :
                      selectedConsumer.fragmentationPct <= 50 ? 'monitor' : 'optimize'
                    )}`}
                    style={{ width: `${selectedConsumer.fragmentationPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-600">
                  <span>0% (optimal)</span>
                  <span>100% (critical)</span>
                </div>
              </div>

              {/* Recommendation */}
              {selectedConsumer.detail.recommendation && (
                <div className="border border-orange-500/30 bg-orange-500/10 rounded p-4 flex items-start gap-3">
                  <AlertTriangle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-orange-300 font-semibold mb-1">Recommendation</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{selectedConsumer.detail.recommendation}</p>
                  </div>
                </div>
              )}

              {/* No action needed */}
              {!selectedConsumer.detail.recommendation && (
                <div className="border border-green-500/30 bg-green-500/10 rounded p-4 flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-green-300 font-semibold mb-1">No Action Needed</p>
                    <p className="text-xs text-gray-300">This segment is operating within optimal parameters.</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-purple-500/20 pt-4">
                <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Actions</p>
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition text-sm font-medium">
                    <RefreshCw size={14} />
                    Rebuild Index
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition text-sm font-medium">
                    <Archive size={14} />
                    Archive Old Entries
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition text-sm font-medium">
                    <Trash2 size={14} />
                    Purge Stale Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
