'use client';

import { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  GitMerge,
  Globe,
  RefreshCw,
  TrendingUp,
  User,
  Users,
  Webhook,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = '1h' | '6h' | '24h';
type SyncStatus = 'healthy' | 'warning' | 'error';
type ContactStage = 'lead' | 'prospect' | 'qualified' | 'negotiating' | 'won' | 'lost';
type DealStage = 'discovery' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
type ActivityType = 'sync' | 'deal' | 'contact' | 'conflict';
type IntegrationStatus = 'healthy' | 'warning' | 'error' | 'inactive';

interface CrmMetrics {
  totalContacts: number;
  activeDeals: number;
  conversionRate: number;
  syncStatus: SyncStatus;
  lastSyncTime: string;
  pendingSyncs: number;
  syncErrors: number;
}

interface ContactPipelineStage {
  stage: ContactStage;
  label: string;
  count: number;
  color: string;
  dotColor: string;
  barColor: string;
}

interface DealBoard {
  stage: DealStage;
  label: string;
  cardCount: number;
  totalValue: number;
  weightedProbability: number;
  probability: number;
  color: string;
  borderColor: string;
}

interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  timestamp: string;
  icon: ActivityType;
}

interface DataQuality {
  duplicateRecords: number;
  incompleteRecords: number;
  fieldMappingStatus: 'valid' | 'warning' | 'invalid';
  totalRecords: number;
  completenessScore: number;
}

interface SyncConflict {
  id: string;
  field: string;
  contactName: string;
  localValue: string;
  remoteValue: string;
  conflictedAt: string;
}

interface Integration {
  name: string;
  status: IntegrationStatus;
  lastSync: string;
  eventsToday: number;
  description: string;
}

interface ContactDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: ContactStage;
  loanAmount: number;
  creditScore: number;
  lastActivity: string;
  assignedTo: string;
}

interface DealDetail {
  id: string;
  title: string;
  contact: string;
  stage: DealStage;
  value: number;
  probability: number;
  closeDate: string;
  daysInStage: number;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const metricsByRange: Record<TimeRange, CrmMetrics> = {
  '1h': {
    totalContacts: 1_847,
    activeDeals: 312,
    conversionRate: 18.4,
    syncStatus: 'healthy',
    lastSyncTime: '2m ago',
    pendingSyncs: 3,
    syncErrors: 0,
  },
  '6h': {
    totalContacts: 1_847,
    activeDeals: 312,
    conversionRate: 17.9,
    syncStatus: 'warning',
    lastSyncTime: '2m ago',
    pendingSyncs: 14,
    syncErrors: 2,
  },
  '24h': {
    totalContacts: 1_847,
    activeDeals: 312,
    conversionRate: 16.2,
    syncStatus: 'healthy',
    lastSyncTime: '2m ago',
    pendingSyncs: 7,
    syncErrors: 3,
  },
};

const contactPipeline: ContactPipelineStage[] = [
  { stage: 'lead',        label: 'Lead',        count: 621, color: 'text-slate-300',   dotColor: 'bg-slate-400',   barColor: 'from-slate-500 to-slate-400'   },
  { stage: 'prospect',    label: 'Prospect',    count: 438, color: 'text-blue-300',    dotColor: 'bg-blue-400',    barColor: 'from-blue-500 to-blue-400'     },
  { stage: 'qualified',   label: 'Qualified',   count: 312, color: 'text-cyan-300',    dotColor: 'bg-cyan-400',    barColor: 'from-cyan-500 to-cyan-400'     },
  { stage: 'negotiating', label: 'Negotiating', count: 184, color: 'text-purple-300',  dotColor: 'bg-purple-400',  barColor: 'from-purple-500 to-purple-400' },
  { stage: 'won',         label: 'Won',         count: 213, color: 'text-green-300',   dotColor: 'bg-green-400',   barColor: 'from-green-500 to-emerald-400' },
  { stage: 'lost',        label: 'Lost',        count:  79, color: 'text-red-300',     dotColor: 'bg-red-400',     barColor: 'from-red-500 to-rose-400'      },
];

const dealBoard: DealBoard[] = [
  { stage: 'discovery',   label: 'Discovery',   cardCount: 94,  totalValue: 18_420_000, weightedProbability: 20, probability: 15,  color: 'text-slate-300',   borderColor: 'border-slate-700'         },
  { stage: 'proposal',    label: 'Proposal',    cardCount: 67,  totalValue: 31_850_000, weightedProbability: 45, probability: 35,  color: 'text-blue-300',    borderColor: 'border-blue-500/30'       },
  { stage: 'negotiation', label: 'Negotiation', cardCount: 48,  totalValue: 24_100_000, weightedProbability: 70, probability: 65,  color: 'text-purple-300',  borderColor: 'border-purple-500/30'     },
  { stage: 'closed-won',  label: 'Closed Won',  cardCount: 103, totalValue: 52_600_000, weightedProbability: 100, probability: 100, color: 'text-green-300',  borderColor: 'border-green-500/30'      },
  { stage: 'closed-lost', label: 'Closed Lost', cardCount: 31,  totalValue: 9_800_000,  weightedProbability: 0,  probability: 0,   color: 'text-red-300',    borderColor: 'border-red-500/30'        },
];

const recentActivity: ActivityEvent[] = [
  { id: 'ae-001', type: 'sync',     title: 'Full sync completed',             detail: '1,847 contacts reconciled with Twenty CRM',       timestamp: '2m ago'   },
  { id: 'ae-002', type: 'deal',     title: 'Deal moved to Closed Won',        detail: 'Martinez, J. — $485,000 — 30yr fixed',            timestamp: '8m ago'   },
  { id: 'ae-003', type: 'contact',  title: 'New lead ingested',               detail: 'Thompson, R. via Zapier webhook',                  timestamp: '14m ago'  },
  { id: 'ae-004', type: 'conflict', title: 'Sync conflict detected',           detail: 'lead.creditScore mismatch on Patel, A.',          timestamp: '22m ago'  },
  { id: 'ae-005', type: 'sync',     title: 'Real-time push — 4 records',      detail: 'contact.updated events dispatched to CRM',        timestamp: '31m ago'  },
  { id: 'ae-006', type: 'deal',     title: 'Deal value updated',              detail: 'Chen, L. — revised to $620,000',                  timestamp: '45m ago'  },
  { id: 'ae-007', type: 'contact',  title: 'Contact qualified',               detail: 'Rodriguez, M. — credit score 742 · DTI 28%',      timestamp: '1h ago'   },
  { id: 'ae-008', type: 'sync',     title: 'Webhook batch delivered',         detail: '12 opportunity.updated events → n8n',             timestamp: '1h 12m ago' },
];

const dataQuality: DataQuality = {
  duplicateRecords: 14,
  incompleteRecords: 87,
  fieldMappingStatus: 'warning',
  totalRecords: 1_847,
  completenessScore: 91.4,
};

const syncConflicts: SyncConflict[] = [
  { id: 'sc-001', field: 'lead.creditScore',  contactName: 'Patel, A.',       localValue: '718',              remoteValue: '724',              conflictedAt: '22m ago' },
  { id: 'sc-002', field: 'lead.loanAmount',   contactName: 'Williams, D.',    localValue: '$385,000',         remoteValue: '$390,000',         conflictedAt: '1h ago'  },
  { id: 'sc-003', field: 'lead.closingDate',  contactName: 'Nguyen, T.',      localValue: '2026-07-14',       remoteValue: '2026-07-21',       conflictedAt: '3h ago'  },
];

const integrations: Integration[] = [
  { name: 'Twenty CRM',    status: 'healthy',  lastSync: '2m ago',    eventsToday: 1_284, description: 'Primary CRM — bidirectional sync'   },
  { name: 'Slack',         status: 'healthy',  lastSync: '4m ago',    eventsToday: 342,   description: 'Deal notifications & alerts'        },
  { name: 'n8n',           status: 'healthy',  lastSync: '8m ago',    eventsToday: 891,   description: 'Workflow automation webhooks'       },
  { name: 'Zapier',        status: 'warning',  lastSync: '18m ago',   eventsToday: 127,   description: 'Lead ingestion — elevated latency'  },
  { name: 'Activepieces',  status: 'error',    lastSync: '45m ago',   eventsToday: 0,     description: 'Campaign triggers — 503 upstream'   },
  { name: 'Webhooks',      status: 'healthy',  lastSync: '31m ago',   eventsToday: 2_108, description: 'Generic webhook delivery'           },
];

const SAMPLE_CONTACTS: ContactDetail[] = [
  { id: 'c-001', name: 'Martinez, J.',    email: 'j.martinez@email.com',  phone: '(512) 555-0182', stage: 'won',         loanAmount: 485_000, creditScore: 768, lastActivity: '8m ago',  assignedTo: 'Ellis A.' },
  { id: 'c-002', name: 'Thompson, R.',    email: 'r.thompson@email.com',  phone: '(415) 555-0294', stage: 'lead',        loanAmount: 320_000, creditScore: 0,   lastActivity: '14m ago', assignedTo: 'Auto'     },
  { id: 'c-003', name: 'Patel, A.',       email: 'a.patel@email.com',     phone: '(713) 555-0371', stage: 'qualified',   loanAmount: 550_000, creditScore: 721, lastActivity: '22m ago', assignedTo: 'Ellis A.' },
  { id: 'c-004', name: 'Chen, L.',        email: 'l.chen@email.com',      phone: '(206) 555-0448', stage: 'negotiating', loanAmount: 620_000, creditScore: 804, lastActivity: '45m ago', assignedTo: 'Ellis A.' },
  { id: 'c-005', name: 'Rodriguez, M.',   email: 'm.rodriguez@email.com', phone: '(305) 555-0512', stage: 'qualified',   loanAmount: 410_000, creditScore: 742, lastActivity: '1h ago',  assignedTo: 'Ellis A.' },
];

const SAMPLE_DEALS: DealDetail[] = [
  { id: 'd-001', title: 'Chen, L. — 30yr Fixed',      contact: 'Chen, L.',       stage: 'negotiation', value: 620_000, probability: 65, closeDate: '2026-06-15', daysInStage: 8  },
  { id: 'd-002', title: 'Kim, S. — 15yr Fixed',       contact: 'Kim, S.',        stage: 'proposal',    value: 480_000, probability: 35, closeDate: '2026-07-01', daysInStage: 12 },
  { id: 'd-003', title: 'Johnson, E. — ARM 5/1',      contact: 'Johnson, E.',    stage: 'discovery',   value: 375_000, probability: 15, closeDate: '2026-08-10', daysInStage: 3  },
  { id: 'd-004', title: 'Williams, D. — Jumbo',       contact: 'Williams, D.',   stage: 'negotiation', value: 1_200_000, probability: 65, closeDate: '2026-06-30', daysInStage: 5 },
  { id: 'd-005', title: 'Nguyen, T. — FHA Refi',      contact: 'Nguyen, T.',     stage: 'proposal',    value: 298_000, probability: 35, closeDate: '2026-07-21', daysInStage: 21 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function getSyncStatusColors(status: SyncStatus) {
  switch (status) {
    case 'healthy': return { badge: 'bg-green-500/10 text-green-400 border-green-500/30',  dot: 'bg-green-400',  text: 'text-green-400'  };
    case 'warning': return { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400', text: 'text-yellow-400' };
    case 'error':   return { badge: 'bg-red-500/10 text-red-400 border-red-500/30',          dot: 'bg-red-400',    text: 'text-red-400'    };
  }
}

function getIntegrationStatusColors(status: IntegrationStatus) {
  switch (status) {
    case 'healthy':  return { badge: 'bg-green-500/10 text-green-400 border-green-500/30',   dot: 'bg-green-400',  text: 'text-green-400'  };
    case 'warning':  return { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400', text: 'text-yellow-400' };
    case 'error':    return { badge: 'bg-red-500/10 text-red-400 border-red-500/30',           dot: 'bg-red-400',    text: 'text-red-400'    };
    case 'inactive': return { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',    dot: 'bg-slate-500',  text: 'text-slate-400'  };
  }
}

function getIntegrationStatusIcon(status: IntegrationStatus) {
  switch (status) {
    case 'healthy':  return <CheckCircle2 size={14} className="text-green-400" />;
    case 'warning':  return <AlertCircle  size={14} className="text-yellow-400" />;
    case 'error':    return <XCircle      size={14} className="text-red-400" />;
    case 'inactive': return <XCircle      size={14} className="text-slate-500" />;
  }
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'sync':     return <RefreshCw   size={14} className="text-cyan-400 flex-shrink-0" />;
    case 'deal':     return <TrendingUp  size={14} className="text-purple-400 flex-shrink-0" />;
    case 'contact':  return <User        size={14} className="text-blue-400 flex-shrink-0" />;
    case 'conflict': return <AlertTriangle size={14} className="text-orange-400 flex-shrink-0" />;
  }
}

function getContactStageBadge(stage: ContactStage) {
  const cfg: Record<ContactStage, string> = {
    lead:        'bg-slate-500/20 text-slate-300 border-slate-500/30',
    prospect:    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    qualified:   'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    negotiating: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    won:         'bg-green-500/20 text-green-300 border-green-500/30',
    lost:        'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${cfg[stage]}`}>
      {stage}
    </span>
  );
}

function getDealStageBadge(stage: DealStage) {
  const cfg: Record<DealStage, string> = {
    discovery:    'bg-slate-500/20 text-slate-300 border-slate-500/30',
    proposal:     'bg-blue-500/20 text-blue-300 border-blue-500/30',
    negotiation:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'closed-won': 'bg-green-500/20 text-green-300 border-green-500/30',
    'closed-lost':'bg-red-500/20 text-red-300 border-red-500/30',
  };
  const labels: Record<DealStage, string> = {
    discovery: 'Discovery', proposal: 'Proposal', negotiation: 'Negotiation',
    'closed-won': 'Closed Won', 'closed-lost': 'Closed Lost',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${cfg[stage]}`}>
      {labels[stage]}
    </span>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CrmPage() {
  const [timeRange, setTimeRange]             = useState<TimeRange>('24h');
  const [selectedContact, setSelectedContact] = useState<ContactDetail | null>(null);
  const [selectedDeal, setSelectedDeal]       = useState<DealDetail | null>(null);

  const metrics     = metricsByRange[timeRange];
  const statusColors = getSyncStatusColors(metrics.syncStatus);

  const maxPipelineCount = Math.max(...contactPipeline.map((s) => s.count));
  const totalPipeline    = contactPipeline.reduce((s, c) => s + c.count, 0);

  const totalDealValue    = dealBoard.reduce((s, d) => s + d.totalValue, 0);
  const weightedDealValue = dealBoard.reduce((s, d) => s + (d.totalValue * d.probability) / 100, 0);

  const fieldMappingColor =
    dataQuality.fieldMappingStatus === 'valid'   ? 'text-green-400'  :
    dataQuality.fieldMappingStatus === 'warning' ? 'text-yellow-400' :
    'text-red-400';

  return (
    <div className="space-y-8">
      <PageHeader
        title="CRM Analytics"
        subtitle="Twenty CRM — Contact Pipeline, Deal Board, Sync Health &amp; Integration Monitoring"
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

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Users size={14} /> Total Contacts
            </p>
            <p className="text-2xl font-bold text-cyan-400">{metrics.totalContacts.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">across all pipeline stages</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <TrendingUp size={14} /> Active Deals
            </p>
            <p className="text-2xl font-bold text-purple-400">{metrics.activeDeals.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">{formatCurrency(weightedDealValue)} weighted pipeline</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <BarChart3 size={14} /> Conversion Rate
            </p>
            <p className="text-2xl font-bold text-pink-400">{metrics.conversionRate}%</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-400 h-1.5 rounded-full"
                style={{ width: `${metrics.conversionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <RefreshCw size={14} /> Sync Status
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${statusColors.dot} ${metrics.syncStatus !== 'error' ? 'animate-pulse' : ''}`} />
              <span className={`text-xl font-bold capitalize ${statusColors.text}`}>{metrics.syncStatus}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Last sync: {metrics.lastSyncTime}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── CRM Health Banner ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-lg border ${statusColors.badge}`}>
                <Database size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">CRM Sync Health</p>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${statusColors.dot} ${metrics.syncStatus === 'healthy' ? 'animate-pulse' : ''}`} />
                  <span className={`text-base font-bold capitalize ${statusColors.text}`}>{metrics.syncStatus}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 flex-wrap">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Last Sync</p>
                <p className="text-lg font-bold text-white">{metrics.lastSyncTime}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Pending Syncs</p>
                <p className={`text-lg font-bold ${metrics.pendingSyncs > 10 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                  {metrics.pendingSyncs}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Sync Errors</p>
                <p className={`text-lg font-bold ${metrics.syncErrors > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {metrics.syncErrors}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Conflicts</p>
                <p className={`text-lg font-bold ${syncConflicts.length > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                  {syncConflicts.length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Contact Pipeline + Deal Board ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Contact Pipeline */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Users size={18} /> Contact Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contactPipeline.map((stage) => {
                const widthPct = maxPipelineCount > 0 ? (stage.count / maxPipelineCount) * 100 : 0;
                const pct = totalPipeline > 0 ? ((stage.count / totalPipeline) * 100).toFixed(1) : '0';
                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stage.dotColor}`} />
                        <span className={`font-medium ${stage.color}`}>{stage.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">{pct}%</span>
                        <span className={`font-bold ${stage.color} w-10 text-right`}>{stage.count.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${stage.barColor} rounded-full transition-all`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Total contacts: <span className="text-white font-bold">{totalPipeline.toLocaleString()}</span></span>
              <button
                onClick={() => setSelectedContact(SAMPLE_CONTACTS[0])}
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition"
              >
                View contacts <ChevronRight size={12} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Deal Board */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp size={18} /> Deal Board
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dealBoard.map((board) => (
                <div
                  key={board.stage}
                  className={`p-3 rounded border ${board.borderColor} hover:bg-white/[0.02] transition`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${board.color}`}>{board.label}</span>
                      <span className="text-xs text-slate-500">
                        {board.cardCount} deal{board.cardCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <p className="text-slate-500">Value</p>
                        <p className="font-bold text-white">{formatCurrency(board.totalValue)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-500">Win %</p>
                        <p className={`font-bold ${board.probability >= 65 ? 'text-green-400' : board.probability >= 30 ? 'text-yellow-400' : board.probability === 0 && board.stage === 'closed-won' ? 'text-green-400' : 'text-slate-400'}`}>
                          {board.stage === 'closed-won' ? '100%' : board.stage === 'closed-lost' ? '—' : `${board.probability}%`}
                        </p>
                      </div>
                    </div>
                  </div>
                  {board.stage !== 'closed-lost' && (
                    <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          board.stage === 'closed-won' ? 'bg-green-500' :
                          board.probability >= 65 ? 'bg-gradient-to-r from-purple-500 to-pink-400' :
                          board.probability >= 30 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                          'bg-gradient-to-r from-slate-600 to-slate-500'
                        }`}
                        style={{ width: `${board.probability === 0 && board.stage === 'closed-won' ? 100 : board.probability}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 rounded border border-slate-800 text-center">
                <p className="text-slate-500">Total Pipeline</p>
                <p className="text-base font-bold text-white mt-0.5">{formatCurrency(totalDealValue)}</p>
              </div>
              <div className="p-2 rounded border border-slate-800 text-center">
                <p className="text-slate-500">Weighted Value</p>
                <p className="text-base font-bold text-purple-400 mt-0.5">{formatCurrency(weightedDealValue)}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedDeal(SAMPLE_DEALS[0])}
              className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition"
            >
              View deals <ChevronRight size={12} />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Activity Timeline ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity size={18} /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {recentActivity.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                {/* Timeline spine */}
                <div className="flex flex-col items-center">
                  <div className="mt-1 flex-shrink-0">
                    {getActivityIcon(event.type)}
                  </div>
                  {index < recentActivity.length - 1 && (
                    <div className="w-px flex-1 bg-slate-800 my-1" style={{ minHeight: '16px' }} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-4 flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-medium text-white">{event.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{event.detail}</p>
                    </div>
                    <span className="text-xs text-slate-600 whitespace-nowrap flex-shrink-0 flex items-center gap-1">
                      <Clock size={10} /> {event.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Data Quality + Sync Conflicts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Data Quality Metrics */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Database size={18} /> Data Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Completeness score */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-500 font-medium">Record Completeness</span>
                <span className="text-green-400 font-bold">{dataQuality.completenessScore}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                  style={{ width: `${dataQuality.completenessScore}%` }}
                />
              </div>
            </div>

            {/* Quality stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded border border-slate-800 text-center">
                <p className="text-xs text-slate-500">Duplicate Records</p>
                <p className={`text-2xl font-bold mt-1 ${dataQuality.duplicateRecords > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                  {dataQuality.duplicateRecords}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">of {dataQuality.totalRecords.toLocaleString()} total</p>
              </div>
              <div className="p-3 rounded border border-slate-800 text-center">
                <p className="text-xs text-slate-500">Incomplete Records</p>
                <p className={`text-2xl font-bold mt-1 ${dataQuality.incompleteRecords > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {dataQuality.incompleteRecords}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">missing required fields</p>
              </div>
            </div>

            {/* Field mapping validation */}
            <div className="flex items-center justify-between p-3 rounded border border-slate-800">
              <div className="flex items-center gap-3">
                <ArrowRightLeft size={16} className="text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-white">Field Mapping Validation</p>
                  <p className="text-xs text-slate-500 mt-0.5">9 of 9 mappings configured</p>
                </div>
              </div>
              <span className={`text-sm font-bold capitalize ${fieldMappingColor}`}>
                {dataQuality.fieldMappingStatus === 'valid' ? 'Valid' :
                 dataQuality.fieldMappingStatus === 'warning' ? 'Warning' : 'Invalid'}
              </span>
            </div>

            {dataQuality.fieldMappingStatus !== 'valid' && (
              <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded px-3 py-2">
                <AlertCircle size={12} className="flex-shrink-0" />
                1 field mapping has pending validation — lead.isQualified → contact.qualified
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sync Conflict Resolution */}
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <GitMerge size={18} /> Sync Conflict Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {syncConflicts.length === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded border border-green-500/20 bg-green-500/5 text-green-400">
                <CheckCircle2 size={18} />
                <p className="text-sm font-medium">No sync conflicts — all records reconciled</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  {syncConflicts.length} conflict{syncConflicts.length !== 1 ? 's' : ''} awaiting resolution
                </p>
                {syncConflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className="p-3 rounded border border-orange-500/20 bg-orange-500/5 hover:border-orange-500/30 transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{conflict.contactName}</p>
                        <p className="text-xs font-mono text-orange-400 mt-0.5">{conflict.field}</p>
                      </div>
                      <span className="text-xs text-slate-600 whitespace-nowrap flex-shrink-0 flex items-center gap-1">
                        <Clock size={10} /> {conflict.conflictedAt}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <div className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 font-mono text-cyan-300">
                        Local: {conflict.localValue}
                      </div>
                      <span className="text-slate-600">vs</span>
                      <div className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 font-mono text-purple-300">
                        Remote: {conflict.remoteValue}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2.5">
                      <button className="flex-1 text-xs py-1.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition font-medium">
                        Use Local
                      </button>
                      <button className="flex-1 text-xs py-1.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition font-medium">
                        Use Remote
                      </button>
                      <button className="px-3 text-xs py-1.5 rounded bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 transition font-medium">
                        Skip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Integration Health ── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe size={18} /> Integration Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {integrations.map((integration) => {
              const sc = getIntegrationStatusColors(integration.status);
              return (
                <div
                  key={integration.name}
                  className={`flex items-center gap-4 p-4 rounded border ${sc.badge} flex-wrap`}
                >
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getIntegrationStatusIcon(integration.status)}
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${integration.status === 'healthy' ? 'animate-pulse' : ''}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{integration.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{integration.description}</p>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0 flex-wrap">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Last Sync</p>
                      <p className="text-sm font-bold text-white">{integration.lastSync}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Events Today</p>
                      <p className={`text-sm font-bold ${integration.eventsToday === 0 ? 'text-red-400' : 'text-cyan-400'}`}>
                        {integration.eventsToday.toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize flex-shrink-0 ${sc.badge}`}>
                      {integration.status}
                    </span>
                  </div>

                  {integration.status === 'error' && (
                    <div className="w-full mt-2 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                      <AlertTriangle size={12} className="flex-shrink-0" />
                      Delivery failing — upstream returned 503. Check service health.
                    </div>
                  )}
                  {integration.status === 'warning' && (
                    <div className="w-full mt-2 flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded px-3 py-2">
                      <AlertCircle size={12} className="flex-shrink-0" />
                      Elevated latency detected — last sync took &gt;15s. Monitor closely.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Contact Detail Modal ── */}
      {selectedContact && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedContact(null)}
        >
          <div
            className="bg-black border border-cyan-500/30 rounded-lg max-w-xl w-full max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-start justify-between p-6 border-b border-cyan-500/20 bg-black/90 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded border border-cyan-500/30 bg-cyan-500/10">
                  <User size={16} className="text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">{selectedContact.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedContact.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-1.5 hover:bg-red-500/20 rounded transition flex-shrink-0 ml-4"
              >
                <X size={18} className="text-red-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Stage */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Stage:</span>
                {getContactStageBadge(selectedContact.stage)}
                <span className="text-xs text-slate-500 ml-auto">Assigned: {selectedContact.assignedTo}</span>
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Phone',         value: selectedContact.phone,                                  color: 'text-white'    },
                  { label: 'Last Activity', value: selectedContact.lastActivity,                           color: 'text-slate-300' },
                  { label: 'Loan Amount',   value: formatCurrency(selectedContact.loanAmount),             color: 'text-cyan-400'  },
                  { label: 'Credit Score',  value: selectedContact.creditScore > 0 ? String(selectedContact.creditScore) : 'N/A', color: selectedContact.creditScore >= 740 ? 'text-green-400' : selectedContact.creditScore >= 680 ? 'text-yellow-400' : selectedContact.creditScore > 0 ? 'text-red-400' : 'text-slate-500' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-3 rounded border border-slate-800">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className={`text-sm font-bold ${color} mt-1`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="pt-4 border-t border-cyan-500/20 flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition text-sm font-medium">
                  <Zap size={14} /> Open in CRM
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition text-sm font-medium">
                  <RefreshCw size={14} /> Force Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Deal Detail Modal ── */}
      {selectedDeal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDeal(null)}
        >
          <div
            className="bg-black border border-purple-500/30 rounded-lg max-w-xl w-full max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-start justify-between p-6 border-b border-purple-500/20 bg-black/90 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded border border-purple-500/30 bg-purple-500/10">
                  <TrendingUp size={16} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">{selectedDeal.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Contact: {selectedDeal.contact}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDeal(null)}
                className="p-1.5 hover:bg-red-500/20 rounded transition flex-shrink-0 ml-4"
              >
                <X size={18} className="text-red-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Stage */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Stage:</span>
                {getDealStageBadge(selectedDeal.stage)}
                <span className="text-xs text-slate-500 ml-auto">{selectedDeal.daysInStage} days in stage</span>
              </div>

              {/* Deal details */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Deal Value',    value: formatCurrency(selectedDeal.value),  color: 'text-cyan-400'   },
                  { label: 'Win Probability', value: `${selectedDeal.probability}%`,    color: selectedDeal.probability >= 65 ? 'text-green-400' : selectedDeal.probability >= 30 ? 'text-yellow-400' : 'text-slate-400' },
                  { label: 'Close Date',    value: selectedDeal.closeDate,              color: 'text-white'      },
                  { label: 'Weighted Value', value: formatCurrency(selectedDeal.value * selectedDeal.probability / 100), color: 'text-purple-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-3 rounded border border-slate-800">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className={`text-sm font-bold ${color} mt-1`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Win probability bar */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500">Win Probability</span>
                  <span className={selectedDeal.probability >= 65 ? 'text-green-400 font-bold' : selectedDeal.probability >= 30 ? 'text-yellow-400 font-bold' : 'text-slate-400 font-bold'}>
                    {selectedDeal.probability}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${selectedDeal.probability >= 65 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : selectedDeal.probability >= 30 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' : 'bg-gradient-to-r from-slate-600 to-slate-500'}`}
                    style={{ width: `${selectedDeal.probability}%` }}
                  />
                </div>
              </div>

              {/* Quick actions */}
              <div className="pt-4 border-t border-purple-500/20 flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition text-sm font-medium">
                  <Zap size={14} /> Open in CRM
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition text-sm font-medium">
                  <Webhook size={14} /> Push Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
