'use client';

import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  HardDrive,
  Key,
  Lock,
  Server,
  Shield,
  Users,
  X,
  XCircle,
  Zap,
  FileText,
  RefreshCw,
  Cpu,
  Globe,
  User,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

// ─── Types ───────────────────────────────────────────────────────────────────

type TimeRange = '1h' | '6h' | '24h';
type ServiceStatus = 'healthy' | 'warning' | 'degraded' | 'critical';
type AlertSeverity = 'critical' | 'warning' | 'info';
type AlertResolution = 'open' | 'resolved' | 'acknowledged';
type UserRole = 'admin' | 'analyst' | 'broker' | 'viewer';

interface ServiceHealth {
  id: string;
  name: string;
  category: string;
  status: ServiceStatus;
  uptimePct: number;
  responseTimeMs: number;
  incidentCount: number;
  lastChecked: string;
  endpoint: string;
  description: string;
  p95Ms: number;
  errorRate: number;
  incidents: { time: string; summary: string; duration: string }[];
  troubleshootingSteps: string[];
}

interface SystemAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  service: string;
  timestamp: string;
  resolution: AlertResolution;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastActivity: string;
  activeSessions: number;
  status: 'active' | 'inactive';
}

interface DbPool {
  name: string;
  total: number;
  active: number;
  idle: number;
  waiting: number;
}

interface SlowQuery {
  query: string;
  avgMs: number;
  calls: number;
  lastSeen: string;
}

interface BackupRecord {
  label: string;
  timestamp: string;
  sizeMb: number;
  status: 'success' | 'failed' | 'running';
  retentionDays: number;
}

interface AuditEntry {
  id: string;
  actor: string;
  role: UserRole;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  outcome: 'success' | 'denied';
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const metricsByRange: Record<TimeRange, { activeUsers: number; uptimePct: number; criticalAlerts: number; newSignups: number }> = {
  '1h':  { activeUsers: 24,  uptimePct: 99.97, criticalAlerts: 1, newSignups: 3  },
  '6h':  { activeUsers: 61,  uptimePct: 99.93, criticalAlerts: 2, newSignups: 11 },
  '24h': { activeUsers: 148, uptimePct: 99.81, criticalAlerts: 3, newSignups: 29 },
};

const SERVICES: ServiceHealth[] = [
  {
    id: 'twenty-crm',
    name: 'TwentyCRM',
    category: 'CRM',
    status: 'healthy',
    uptimePct: 99.98,
    responseTimeMs: 142,
    incidentCount: 0,
    lastChecked: '8s ago',
    endpoint: 'http://oracle-vps:3000/health',
    description: 'Primary system of record for leads, pipeline, and customer data.',
    p95Ms: 310,
    errorRate: 0.1,
    incidents: [],
    troubleshootingSteps: [
      'Check Twenty CRM container: docker ps | grep twenty',
      'View logs: docker logs twenty-crm --tail 100',
      'Verify PostgreSQL connection on oracle-vps:5432',
      'Check Redis cache status: redis-cli ping',
    ],
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'Database',
    status: 'healthy',
    uptimePct: 99.95,
    responseTimeMs: 88,
    incidentCount: 0,
    lastChecked: '12s ago',
    endpoint: 'http://oracle-vps:8000/rest/v1/',
    description: 'PostgreSQL-backed auth, storage, and real-time subscriptions.',
    p95Ms: 190,
    errorRate: 0.2,
    incidents: [],
    troubleshootingSteps: [
      'Health check: curl http://oracle-vps:8000/health',
      'Inspect GoTrue auth service logs',
      'Check storage bucket permissions in Supabase dashboard',
      'Verify ANON_KEY and SERVICE_ROLE_KEY in environment',
    ],
  },
  {
    id: 'redis',
    name: 'Redis',
    category: 'Cache',
    status: 'healthy',
    uptimePct: 100.0,
    responseTimeMs: 2,
    incidentCount: 0,
    lastChecked: '5s ago',
    endpoint: 'redis://orchestrator:6379',
    description: 'In-memory cache and pub/sub broker for session state and queues.',
    p95Ms: 4,
    errorRate: 0.0,
    incidents: [],
    troubleshootingSteps: [
      'Ping: redis-cli -h orchestrator ping',
      'Check memory: redis-cli INFO memory',
      'List slow commands: redis-cli SLOWLOG GET 10',
      'Inspect keyspace: redis-cli INFO keyspace',
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    category: 'AI Gateway',
    status: 'warning',
    uptimePct: 98.71,
    responseTimeMs: 1840,
    incidentCount: 3,
    lastChecked: '6s ago',
    endpoint: 'https://openrouter.ai/api/v1/health',
    description: 'External AI model routing via OpenRouter for cloud model fallback.',
    p95Ms: 4200,
    errorRate: 2.4,
    incidents: [
      { time: '2h ago',  summary: 'Rate limit spike — 429 burst on claude-sonnet', duration: '8m' },
      { time: '9h ago',  summary: 'Elevated latency on anthropic provider',        duration: '22m' },
      { time: '1d ago',  summary: 'Partial API degradation — 503 responses',       duration: '45m' },
    ],
    troubleshootingSteps: [
      'Check OpenRouter status: https://status.openrouter.ai',
      'Inspect rate limit headers in Nexus Router logs',
      'Rotate to fallback via Nexus: set provider weight openrouter=0',
      'Review API credit balance in OpenRouter dashboard',
    ],
  },
  {
    id: 'n8n',
    name: 'n8n',
    category: 'Workflow',
    status: 'healthy',
    uptimePct: 99.84,
    responseTimeMs: 210,
    incidentCount: 1,
    lastChecked: '14s ago',
    endpoint: 'http://oracle-vps:5678/healthz',
    description: 'Workflow automation — campaign triggers, lead routing, and notifications.',
    p95Ms: 480,
    errorRate: 0.3,
    incidents: [
      { time: '3d ago', summary: 'Workflow executor OOM — restart required', duration: '4m' },
    ],
    troubleshootingSteps: [
      'Check n8n container: docker ps | grep n8n',
      'View execution logs in n8n UI → Executions',
      'Restart n8n: docker restart n8n',
      'Check webhook endpoints are reachable from oracle-vps',
    ],
  },
  {
    id: 'activepieces',
    name: 'Activepieces',
    category: 'Workflow',
    status: 'degraded',
    uptimePct: 97.30,
    responseTimeMs: 3100,
    incidentCount: 4,
    lastChecked: '10s ago',
    endpoint: 'http://oracle-vps:8080/api/v1/health',
    description: 'Low-code automation platform for lead enrichment and outreach flows.',
    p95Ms: 7800,
    errorRate: 5.1,
    incidents: [
      { time: '45m ago', summary: 'Flow engine queue backlog — 240+ pending',       duration: 'ongoing' },
      { time: '6h ago',  summary: 'PostgreSQL connection pool exhausted',           duration: '12m' },
      { time: '1d ago',  summary: 'Webhook delivery failure — 502 from upstream',  duration: '18m' },
      { time: '2d ago',  summary: 'Memory pressure — container restart triggered', duration: '2m' },
    ],
    troubleshootingSteps: [
      'Check queue depth: docker exec activepieces ap-cli queue status',
      'Restart flow engine: docker restart activepieces-engine',
      'Increase DB pool size in activepieces config (AP_DB_POOL_SIZE)',
      'Clear stale jobs: ap-cli queue purge --status=failed',
    ],
  },
  {
    id: 's3',
    name: 'S3 / Object Storage',
    category: 'Storage',
    status: 'healthy',
    uptimePct: 99.99,
    responseTimeMs: 64,
    incidentCount: 0,
    lastChecked: '20s ago',
    endpoint: 'https://s3.amazonaws.com/health',
    description: 'Document storage — loan files, rate sheets, compliance artifacts.',
    p95Ms: 140,
    errorRate: 0.0,
    incidents: [],
    troubleshootingSteps: [
      'Verify bucket policy and CORS settings in AWS console',
      'Check IAM role permissions for service account',
      'Test presigned URL generation in quote-engine',
      'Review CloudTrail logs for unexpected access patterns',
    ],
  },
  {
    id: 'auth0',
    name: 'Auth0',
    category: 'Auth',
    status: 'healthy',
    uptimePct: 99.97,
    responseTimeMs: 198,
    incidentCount: 0,
    lastChecked: '9s ago',
    endpoint: 'https://nyra.auth0.com/.well-known/jwks.json',
    description: 'Identity provider — SSO, MFA, and RBAC for all Nyra applications.',
    p95Ms: 420,
    errorRate: 0.1,
    incidents: [],
    troubleshootingSteps: [
      'Check Auth0 status: https://status.auth0.com',
      'Verify tenant domain and client IDs in .env',
      'Test token validation: jwt.io with tenant JWKS',
      'Review Auth0 logs → Real-time Webtask logs for errors',
    ],
  },
];

const ALERTS: SystemAlert[] = [
  {
    id: 'a-001',
    severity: 'critical',
    title: 'Activepieces queue backlog exceeds threshold',
    detail: 'Flow engine queue has 243 pending jobs. Processing rate has dropped below 12 jobs/min (threshold: 50 jobs/min). Lead enrichment flows are delayed.',
    service: 'Activepieces',
    timestamp: '45m ago',
    resolution: 'open',
  },
  {
    id: 'a-002',
    severity: 'warning',
    title: 'OpenRouter p95 latency > 4000ms',
    detail: 'P95 response time from OpenRouter claude-sonnet endpoint has been above 4000ms for the past 35 minutes. Fallback to local GPU workers has been auto-triggered.',
    service: 'OpenRouter',
    timestamp: '35m ago',
    resolution: 'acknowledged',
  },
  {
    id: 'a-003',
    severity: 'warning',
    title: 'Supabase connection pool at 78%',
    detail: 'Connection pool utilization is trending toward saturation. Current: 78/100 connections active. Consider increasing max_connections or enabling PgBouncer pooling.',
    service: 'Supabase',
    timestamp: '2h ago',
    resolution: 'open',
  },
  {
    id: 'a-004',
    severity: 'info',
    title: 'Scheduled backup completed with warnings',
    detail: 'Daily backup completed but 2 tables produced checksum mismatches during verification. Data integrity confirmed via secondary checksum pass.',
    service: 'PostgreSQL',
    timestamp: '4h ago',
    resolution: 'resolved',
  },
  {
    id: 'a-005',
    severity: 'info',
    title: 'TwentyCRM schema migration applied',
    detail: 'Migration v0.24.1 applied successfully to production database. Added composite index on leads(status, created_at). No downtime required.',
    service: 'TwentyCRM',
    timestamp: '6h ago',
    resolution: 'resolved',
  },
  {
    id: 'a-006',
    severity: 'critical',
    title: 'Activepieces error rate exceeds 5%',
    detail: 'HTTP 502 and 503 errors from Activepieces flow engine have exceeded 5% over a 10-minute window. Outreach campaign flows are partially failing.',
    service: 'Activepieces',
    timestamp: '1h ago',
    resolution: 'open',
  },
];

const USERS: UserRecord[] = [
  { id: 'u-001', name: 'Ellis Andersen',  email: 'edaneandersen@gmail.com', role: 'admin',   lastActivity: '2m ago',  activeSessions: 2, status: 'active'   },
  { id: 'u-002', name: 'Mia Torres',      email: 'mia.torres@nyra.io',      role: 'broker',  lastActivity: '14m ago', activeSessions: 1, status: 'active'   },
  { id: 'u-003', name: 'James Okafor',    email: 'j.okafor@nyra.io',        role: 'analyst', lastActivity: '1h ago',  activeSessions: 1, status: 'active'   },
  { id: 'u-004', name: 'Priya Menon',     email: 'p.menon@nyra.io',         role: 'broker',  lastActivity: '3h ago',  activeSessions: 0, status: 'active'   },
  { id: 'u-005', name: 'Carlos Reyes',    email: 'c.reyes@nyra.io',         role: 'viewer',  lastActivity: '1d ago',  activeSessions: 0, status: 'inactive' },
  { id: 'u-006', name: 'Sarah Kim',       email: 's.kim@nyra.io',           role: 'broker',  lastActivity: '5h ago',  activeSessions: 1, status: 'active'   },
];

const DB_POOLS: DbPool[] = [
  { name: 'supabase-main',    total: 100, active: 78, idle: 18, waiting: 4 },
  { name: 'twenty-crm',       total: 50,  active: 22, idle: 27, waiting: 1 },
  { name: 'activepieces',     total: 30,  active: 29, idle: 0,  waiting: 8 },
  { name: 'quote-engine',     total: 20,  active: 11, idle: 9,  waiting: 0 },
];

const SLOW_QUERIES: SlowQuery[] = [
  { query: 'SELECT * FROM leads WHERE status IN (...) ORDER BY created_at DESC',  avgMs: 2840, calls: 142, lastSeen: '4m ago'  },
  { query: 'UPDATE pipeline_stages SET position = $1 WHERE id = $2',              avgMs: 1210, calls: 88,  lastSeen: '12m ago' },
  { query: 'SELECT l.*, c.* FROM leads l JOIN contacts c ON c.lead_id = l.id',   avgMs: 980,  calls: 310, lastSeen: '1m ago'  },
  { query: 'INSERT INTO audit_log (actor, action, resource, metadata) VALUES...',  avgMs: 640,  calls: 521, lastSeen: '30s ago' },
];

const BACKUPS: BackupRecord[] = [
  { label: 'Daily — full DB',       timestamp: '2026-05-12 02:00 UTC', sizeMb: 4840,  status: 'success', retentionDays: 30 },
  { label: 'Daily — full DB',       timestamp: '2026-05-11 02:00 UTC', sizeMb: 4791,  status: 'success', retentionDays: 30 },
  { label: 'Weekly — snapshot',     timestamp: '2026-05-10 00:00 UTC', sizeMb: 14220, status: 'success', retentionDays: 90 },
  { label: 'Daily — full DB',       timestamp: '2026-05-10 02:00 UTC', sizeMb: 4762,  status: 'failed',  retentionDays: 30 },
  { label: 'Incremental — WAL',     timestamp: '2026-05-12 10:00 UTC', sizeMb: 124,   status: 'running', retentionDays: 7  },
];

const AUDIT_LOG: AuditEntry[] = [
  { id: 'al-001', actor: 'Ellis Andersen',  role: 'admin',   action: 'VIEW',   resource: '/admin',                    timestamp: '2m ago',  ipAddress: '192.168.1.4',   outcome: 'success' },
  { id: 'al-002', actor: 'Mia Torres',      role: 'broker',  action: 'UPDATE', resource: '/leads/lead-3841',          timestamp: '14m ago', ipAddress: '192.168.1.12',  outcome: 'success' },
  { id: 'al-003', actor: 'James Okafor',    role: 'analyst', action: 'EXPORT', resource: '/reports/pipeline-summary', timestamp: '1h ago',  ipAddress: '10.0.0.22',     outcome: 'success' },
  { id: 'al-004', actor: 'Carlos Reyes',    role: 'viewer',  action: 'ACCESS', resource: '/admin/users',              timestamp: '1h ago',  ipAddress: '192.168.1.19',  outcome: 'denied'  },
  { id: 'al-005', actor: 'Sarah Kim',       role: 'broker',  action: 'CREATE', resource: '/quotes/quote-1192',        timestamp: '5h ago',  ipAddress: '192.168.1.31',  outcome: 'success' },
  { id: 'al-006', actor: 'Ellis Andersen',  role: 'admin',   action: 'DELETE', resource: '/leads/lead-3789',          timestamp: '6h ago',  ipAddress: '192.168.1.4',   outcome: 'success' },
  { id: 'al-007', actor: 'Priya Menon',     role: 'broker',  action: 'VIEW',   resource: '/quotes/quote-1188',        timestamp: '3h ago',  ipAddress: '10.0.0.45',     outcome: 'success' },
];

// Capacity data (static, representative)
const CAPACITY = {
  storage:  { usedGb: 184, totalGb: 500,   label: 'Object Storage (S3)' },
  apiQuota: { used: 28447, total: 50000,    label: 'Daily API Calls (Nexus Router)' },
  compute:  { usedPct: 66, label: 'Cluster Compute Utilization' },
  dbSize:   { usedGb: 9.4, totalGb: 20,    label: 'PostgreSQL Storage' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusColors(status: ServiceStatus) {
  switch (status) {
    case 'healthy':  return { badge: 'bg-green-500/10 text-green-400 border-green-500/30',   dot: 'bg-green-400',  text: 'text-green-400'  };
    case 'warning':  return { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-400' };
    case 'degraded': return { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', dot: 'bg-orange-400 animate-pulse', text: 'text-orange-400' };
    case 'critical': return { badge: 'bg-red-500/10 text-red-400 border-red-500/30',          dot: 'bg-red-400 animate-pulse',    text: 'text-red-400'    };
  }
}

function getStatusIcon(status: ServiceStatus) {
  switch (status) {
    case 'healthy':  return <CheckCircle2 size={14} className="text-green-400" />;
    case 'warning':  return <AlertCircle  size={14} className="text-yellow-400" />;
    case 'degraded': return <AlertTriangle size={14} className="text-orange-400" />;
    case 'critical': return <XCircle      size={14} className="text-red-400" />;
  }
}

function getAlertSeverityColors(severity: AlertSeverity) {
  switch (severity) {
    case 'critical': return { border: 'border-red-500/40',    bg: 'bg-red-500/5',     badge: 'bg-red-500/10 text-red-400 border-red-500/30',          icon: <XCircle size={14} className="text-red-400" /> };
    case 'warning':  return { border: 'border-yellow-500/40', bg: 'bg-yellow-500/5',  badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',  icon: <AlertTriangle size={14} className="text-yellow-400" /> };
    case 'info':     return { border: 'border-blue-500/30',   bg: 'bg-blue-500/5',    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',         icon: <AlertCircle size={14} className="text-blue-400" /> };
  }
}

function getResolutionBadge(resolution: AlertResolution) {
  switch (resolution) {
    case 'open':         return 'bg-red-500/10 text-red-400 border-red-500/30';
    case 'acknowledged': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    case 'resolved':     return 'bg-green-500/10 text-green-400 border-green-500/30';
  }
}

function getRoleColors(role: UserRole) {
  switch (role) {
    case 'admin':   return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'analyst': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    case 'broker':  return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'viewer':  return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}

function getOverallStatus(services: ServiceHealth[]): ServiceStatus {
  if (services.some((s) => s.status === 'critical')) return 'critical';
  if (services.some((s) => s.status === 'degraded')) return 'degraded';
  if (services.some((s) => s.status === 'warning'))  return 'warning';
  return 'healthy';
}

function formatMb(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

function getPoolBarColor(pct: number) {
  if (pct >= 90) return 'from-red-500 to-rose-400';
  if (pct >= 70) return 'from-yellow-500 to-amber-400';
  return 'from-cyan-500 to-blue-400';
}

function getCapacityBarColor(pct: number) {
  if (pct >= 90) return 'from-red-500 to-rose-400';
  if (pct >= 70) return 'from-orange-500 to-amber-400';
  return 'from-purple-500 to-pink-400';
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null);

  const metrics       = metricsByRange[timeRange];
  const overallStatus = getOverallStatus(SERVICES);
  const overallColors = getStatusColors(overallStatus);

  const openAlerts    = ALERTS.filter((a) => a.resolution === 'open').length;
  const criticalCount = ALERTS.filter((a) => a.severity === 'critical' && a.resolution === 'open').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="System Administration"
        subtitle="Health Monitoring, User Management, Alerts & Audit Log"
      />

      {/* ── Time Range Selector ── */}
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

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Health */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Shield size={14} /> Overall Health
            </p>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${overallColors.dot}`} />
              <p className={`text-2xl font-bold capitalize ${overallColors.text}`}>{overallStatus}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {SERVICES.filter((s) => s.status === 'healthy').length}/{SERVICES.length} services nominal
            </p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Users size={14} /> Active Users
            </p>
            <p className="text-2xl font-bold text-cyan-400">{metrics.activeUsers}</p>
            <p className="text-xs text-slate-400 mt-1">+{metrics.newSignups} new in last {timeRange}</p>
          </CardContent>
        </Card>

        {/* System Uptime */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Activity size={14} /> System Uptime
            </p>
            <p className="text-2xl font-bold text-green-400">{metrics.uptimePct}%</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div
                className="bg-gradient-to-r from-green-500 to-cyan-500 h-1.5 rounded-full"
                style={{ width: `${metrics.uptimePct}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <AlertCircle size={14} /> Critical Alerts
            </p>
            <p className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {criticalCount}
            </p>
            <p className="text-xs text-slate-400 mt-1">{openAlerts} open · {ALERTS.filter((a) => a.resolution === 'resolved').length} resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Service Health Grid ── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
          <Server size={14} /> Service Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {SERVICES.map((svc) => {
            const sc = getStatusColors(svc.status);
            return (
              <button
                key={svc.id}
                onClick={() => setSelectedService(svc)}
                className="text-left p-4 rounded border border-slate-800 hover:border-purple-500/40 hover:bg-purple-500/5 transition group bg-card/30 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-white">{svc.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{svc.category}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${sc.dot}`} />
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize ${sc.badge}`}>
                      {svc.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Uptime</p>
                    <p className={`text-sm font-bold ${svc.uptimePct >= 99.9 ? 'text-green-400' : svc.uptimePct >= 99 ? 'text-yellow-400' : 'text-orange-400'}`}>
                      {svc.uptimePct}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Response</p>
                    <p className={`text-sm font-bold ${
                      svc.responseTimeMs < 200  ? 'text-green-400' :
                      svc.responseTimeMs < 800  ? 'text-yellow-400' :
                      svc.responseTimeMs < 2000 ? 'text-orange-400' : 'text-red-400'
                    }`}>{svc.responseTimeMs}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Incidents</p>
                    <p className={`text-sm font-bold ${svc.incidentCount === 0 ? 'text-slate-400' : svc.incidentCount <= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {svc.incidentCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-600">checked {svc.lastChecked}</span>
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-purple-400 transition" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── System Alerts ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertCircle size={18} /> System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ALERTS.map((alert) => {
              const ac = getAlertSeverityColors(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 p-4 rounded border ${ac.border} ${ac.bg}`}
                >
                  <div className="flex-shrink-0 mt-0.5">{ac.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-white">{alert.title}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize ${ac.badge}`}>
                        {alert.severity}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize ${getResolutionBadge(alert.resolution)}`}>
                        {alert.resolution}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">{alert.detail}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Server size={10} /> {alert.service}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {alert.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── User Management ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Users size={18} /> User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 pb-5 border-b border-slate-800">
            <div className="text-center p-3 rounded border border-slate-800">
              <p className="text-xs text-slate-500">Total Users</p>
              <p className="text-xl font-bold text-white mt-1">{USERS.length}</p>
            </div>
            <div className="text-center p-3 rounded border border-slate-800">
              <p className="text-xs text-slate-500">Active Sessions</p>
              <p className="text-xl font-bold text-cyan-400 mt-1">{USERS.reduce((s, u) => s + u.activeSessions, 0)}</p>
            </div>
            <div className="text-center p-3 rounded border border-slate-800">
              <p className="text-xs text-slate-500">New Sign-ups ({timeRange})</p>
              <p className="text-xl font-bold text-purple-400 mt-1">{metrics.newSignups}</p>
            </div>
            <div className="text-center p-3 rounded border border-slate-800">
              <p className="text-xs text-slate-500">Inactive Users</p>
              <p className="text-xl font-bold text-slate-400 mt-1">{USERS.filter((u) => u.status === 'inactive').length}</p>
            </div>
          </div>

          {/* User list */}
          <div className="space-y-2">
            {USERS.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-4 rounded border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <User size={14} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${getRoleColors(user.role)}`}>
                    {user.role}
                  </span>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-500">Last active</p>
                    <p className="text-xs text-slate-300">{user.lastActivity}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-500">Sessions</p>
                    <p className={`text-xs font-bold ${user.activeSessions > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                      {user.activeSessions}
                    </p>
                  </div>
                  <span className={`h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-slate-600'}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Database Health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Connection Pools */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Database size={18} /> Connection Pools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DB_POOLS.map((pool) => {
                const usedPct = Math.round((pool.active / pool.total) * 100);
                return (
                  <div key={pool.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-mono text-slate-300">{pool.name}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="text-green-400">{pool.active} active</span>
                        <span className="text-slate-500">{pool.idle} idle</span>
                        {pool.waiting > 0 && <span className="text-red-400">{pool.waiting} waiting</span>}
                        <span className="text-white font-bold">{pool.active}/{pool.total}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getPoolBarColor(usedPct)} rounded-full transition-all`}
                        style={{ width: `${usedPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Slow Query Log */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap size={18} /> Slow Query Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SLOW_QUERIES.map((sq, i) => (
                <div key={i} className="p-3 rounded border border-slate-800 hover:border-slate-700 transition">
                  <p className="text-xs font-mono text-slate-400 truncate mb-2">{sq.query}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={`font-bold ${sq.avgMs > 2000 ? 'text-red-400' : sq.avgMs > 1000 ? 'text-orange-400' : 'text-yellow-400'}`}>
                      {sq.avgMs}ms avg
                    </span>
                    <span className="text-slate-500">{sq.calls} calls</span>
                    <span className="text-slate-600">last: {sq.lastSeen}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Backup Status ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Archive size={18} /> Backup Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {BACKUPS.map((bk, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex-shrink-0">
                  {bk.status === 'success' && <CheckCircle2 size={16} className="text-green-400" />}
                  {bk.status === 'failed'  && <XCircle size={16} className="text-red-400" />}
                  {bk.status === 'running' && <RefreshCw size={16} className="text-cyan-400 animate-spin" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{bk.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> {bk.timestamp}
                  </p>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0 flex-wrap">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Size</p>
                    <p className="text-sm font-bold text-white">{formatMb(bk.sizeMb)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Retention</p>
                    <p className="text-sm font-bold text-slate-300">{bk.retentionDays}d</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${
                    bk.status === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                    bk.status === 'failed'  ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                    'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  }`}>
                    {bk.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── System Capacity ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 size={18} /> System Capacity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Storage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5"><HardDrive size={12} /> {CAPACITY.storage.label}</span>
                <span className="text-white font-bold">{CAPACITY.storage.usedGb} / {CAPACITY.storage.totalGb} GB</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getCapacityBarColor(Math.round((CAPACITY.storage.usedGb / CAPACITY.storage.totalGb) * 100))} rounded-full`}
                  style={{ width: `${(CAPACITY.storage.usedGb / CAPACITY.storage.totalGb) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">{Math.round((CAPACITY.storage.usedGb / CAPACITY.storage.totalGb) * 100)}% used · {CAPACITY.storage.totalGb - CAPACITY.storage.usedGb} GB free</p>
            </div>

            {/* API Quota */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5"><Globe size={12} /> {CAPACITY.apiQuota.label}</span>
                <span className="text-white font-bold">{CAPACITY.apiQuota.used.toLocaleString()} / {CAPACITY.apiQuota.total.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getCapacityBarColor(Math.round((CAPACITY.apiQuota.used / CAPACITY.apiQuota.total) * 100))} rounded-full`}
                  style={{ width: `${(CAPACITY.apiQuota.used / CAPACITY.apiQuota.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">{Math.round((CAPACITY.apiQuota.used / CAPACITY.apiQuota.total) * 100)}% of daily quota · {(CAPACITY.apiQuota.total - CAPACITY.apiQuota.used).toLocaleString()} remaining</p>
            </div>

            {/* Compute */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5"><Cpu size={12} /> {CAPACITY.compute.label}</span>
                <span className="text-white font-bold">{CAPACITY.compute.usedPct}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getCapacityBarColor(CAPACITY.compute.usedPct)} rounded-full`}
                  style={{ width: `${CAPACITY.compute.usedPct}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">{CAPACITY.compute.usedPct}% average across all GPU nodes · {100 - CAPACITY.compute.usedPct}% headroom</p>
            </div>

            {/* DB Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5"><Database size={12} /> {CAPACITY.dbSize.label}</span>
                <span className="text-white font-bold">{CAPACITY.dbSize.usedGb} / {CAPACITY.dbSize.totalGb} GB</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getCapacityBarColor(Math.round((CAPACITY.dbSize.usedGb / CAPACITY.dbSize.totalGb) * 100))} rounded-full`}
                  style={{ width: `${(CAPACITY.dbSize.usedGb / CAPACITY.dbSize.totalGb) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">{Math.round((CAPACITY.dbSize.usedGb / CAPACITY.dbSize.totalGb) * 100)}% used · {(CAPACITY.dbSize.totalGb - CAPACITY.dbSize.usedGb).toFixed(1)} GB free</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Admin Audit Log ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen size={18} /> Admin Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {AUDIT_LOG.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-3 rounded border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex-shrink-0">
                  {entry.outcome === 'success'
                    ? <CheckCircle2 size={14} className="text-green-400" />
                    : <Lock size={14} className="text-red-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{entry.actor}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${getRoleColors(entry.role)}`}>
                      {entry.role}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-400">{entry.action}</span>
                    <span className="text-xs font-mono text-slate-400 truncate max-w-xs">{entry.resource}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Key size={10} /> {entry.ipAddress}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {entry.timestamp}</span>
                  </div>
                </div>
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded border font-medium capitalize ${
                  entry.outcome === 'success'
                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {entry.outcome}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Service Detail Modal ── */}
      {selectedService && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="bg-black border border-purple-500/30 rounded-lg max-w-2xl w-full max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-start justify-between p-6 border-b border-purple-500/20 bg-black/90 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded border ${getStatusColors(selectedService.status).badge}`}>
                  {getStatusIcon(selectedService.status)}
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">{selectedService.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedService.category} · {selectedService.endpoint}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
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
                  {selectedService.description}
                </p>
              </div>

              {/* Key metrics */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Performance Metrics</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Uptime',      value: `${selectedService.uptimePct}%`,       color: selectedService.uptimePct >= 99.9 ? 'text-green-400' : 'text-yellow-400' },
                    { label: 'Avg Response', value: `${selectedService.responseTimeMs}ms`, color: selectedService.responseTimeMs < 500 ? 'text-green-400' : selectedService.responseTimeMs < 2000 ? 'text-yellow-400' : 'text-red-400' },
                    { label: 'p95',         value: `${selectedService.p95Ms}ms`,           color: 'text-orange-400' },
                    { label: 'Error Rate',  value: `${selectedService.errorRate}%`,         color: selectedService.errorRate < 1 ? 'text-green-400' : selectedService.errorRate < 3 ? 'text-yellow-400' : 'text-red-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="p-3 rounded border border-slate-800 text-center">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className={`text-xl font-bold ${color} mt-1`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incidents */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">
                  Incident History ({selectedService.incidentCount} incidents)
                </p>
                {selectedService.incidents.length === 0 ? (
                  <div className="p-4 rounded border border-green-500/20 bg-green-500/5 text-sm text-green-400 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    No incidents recorded — service running nominally
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedService.incidents.map((inc, i) => (
                      <div key={i} className="p-3 rounded border border-orange-500/20 bg-orange-500/5">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <p className="text-sm text-orange-300">{inc.summary}</p>
                          <div className="flex items-center gap-2 flex-shrink-0 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Clock size={10} /> {inc.time}</span>
                            <span className="flex items-center gap-1"><RefreshCw size={10} /> {inc.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Troubleshooting */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Troubleshooting Steps</p>
                <div className="space-y-2">
                  {selectedService.troubleshootingSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded border border-slate-800 bg-slate-900/30">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-purple-500/20 border border-purple-500/30 text-xs font-bold text-purple-400 flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-xs font-mono text-slate-300">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className={`h-2 w-2 rounded-full ${getStatusColors(selectedService.status).dot}`} />
                  Last checked {selectedService.lastChecked}
                </div>
                <span className={`text-xs px-3 py-1 rounded border font-semibold capitalize ${getStatusColors(selectedService.status).badge}`}>
                  {selectedService.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
