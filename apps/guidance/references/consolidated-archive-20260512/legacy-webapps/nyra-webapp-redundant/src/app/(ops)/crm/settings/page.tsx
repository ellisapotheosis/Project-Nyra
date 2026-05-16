'use client';

import { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit2,
  Globe,
  Key,
  Lock,
  Minus,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  Webhook,
  X,
  Zap,
  Database,
  ArrowRightLeft,
  Settings2,
  FileText,
  User,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'api' | 'fields' | 'sync' | 'webhooks' | 'security';
type ConnectionStatus = 'connected' | 'disconnected' | 'testing';
type SyncStatus = 'synced' | 'pending' | 'error';
type WebhookStatus = 'active' | 'inactive' | 'error';
type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'object';
type ConflictStrategy = 'local' | 'remote' | 'manual';
type BatchSchedule = 'daily' | 'weekly' | 'monthly';

interface FieldMapping {
  id: string;
  localField: string;
  remoteField: string;
  type: FieldType;
  lastSync: string;
  status: SyncStatus;
}

interface WebhookEntry {
  id: string;
  eventType: string;
  endpoint: string;
  status: WebhookStatus;
  lastTriggered: string;
  successRate: number;
}

interface AccessLogEntry {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  status: number;
  latency: string;
}

interface ChangeLogEntry {
  id: string;
  user: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'api',      label: 'API Credentials', icon: <Key size={15} /> },
  { key: 'fields',   label: 'Field Mapping',   icon: <ArrowRightLeft size={15} /> },
  { key: 'sync',     label: 'Sync Rules',      icon: <RefreshCw size={15} /> },
  { key: 'webhooks', label: 'Webhooks',         icon: <Webhook size={15} /> },
  { key: 'security', label: 'Security',         icon: <Shield size={15} /> },
];

const INITIAL_FIELD_MAPPINGS: FieldMapping[] = [
  { id: 'fm-001', localField: 'lead.firstName',    remoteField: 'contact.firstName',      type: 'string',  lastSync: '2m ago',  status: 'synced'  },
  { id: 'fm-002', localField: 'lead.lastName',     remoteField: 'contact.lastName',       type: 'string',  lastSync: '2m ago',  status: 'synced'  },
  { id: 'fm-003', localField: 'lead.email',        remoteField: 'contact.email',          type: 'string',  lastSync: '2m ago',  status: 'synced'  },
  { id: 'fm-004', localField: 'lead.phone',        remoteField: 'contact.phone',          type: 'string',  lastSync: '5m ago',  status: 'synced'  },
  { id: 'fm-005', localField: 'lead.loanAmount',   remoteField: 'opportunity.amount',     type: 'number',  lastSync: '5m ago',  status: 'synced'  },
  { id: 'fm-006', localField: 'lead.creditScore',  remoteField: 'contact.creditRating',   type: 'number',  lastSync: '8m ago',  status: 'pending' },
  { id: 'fm-007', localField: 'lead.closingDate',  remoteField: 'opportunity.closeDate',  type: 'date',    lastSync: '8m ago',  status: 'synced'  },
  { id: 'fm-008', localField: 'lead.isQualified',  remoteField: 'contact.qualified',      type: 'boolean', lastSync: '12m ago', status: 'error'   },
  { id: 'fm-009', localField: 'lead.metadata',     remoteField: 'contact.customFields',   type: 'object',  lastSync: '15m ago', status: 'synced'  },
];

const WEBHOOKS: WebhookEntry[] = [
  { id: 'wh-001', eventType: 'contact.created',       endpoint: 'https://nyra.internal/hooks/crm/contact-created',   status: 'active',   lastTriggered: '3m ago',   successRate: 99.2 },
  { id: 'wh-002', eventType: 'opportunity.updated',   endpoint: 'https://nyra.internal/hooks/crm/opp-updated',       status: 'active',   lastTriggered: '7m ago',   successRate: 97.8 },
  { id: 'wh-003', eventType: 'contact.deleted',       endpoint: 'https://nyra.internal/hooks/crm/contact-deleted',   status: 'active',   lastTriggered: '2h ago',   successRate: 100  },
  { id: 'wh-004', eventType: 'note.created',          endpoint: 'https://n8n.internal/webhook/crm-note',             status: 'inactive', lastTriggered: '1d ago',   successRate: 94.1 },
  { id: 'wh-005', eventType: 'task.completed',        endpoint: 'https://activepieces.internal/wh/task-done',        status: 'error',    lastTriggered: '45m ago',  successRate: 71.3 },
];

const ACCESS_LOG: AccessLogEntry[] = [
  { id: 'al-001', timestamp: '10:55:42',  endpoint: '/contacts',         method: 'GET',  status: 200, latency: '48ms'  },
  { id: 'al-002', timestamp: '10:55:18',  endpoint: '/opportunities/42', method: 'PUT',  status: 200, latency: '112ms' },
  { id: 'al-003', timestamp: '10:54:59',  endpoint: '/contacts',         method: 'POST', status: 201, latency: '89ms'  },
  { id: 'al-004', timestamp: '10:54:31',  endpoint: '/contacts/8821',    method: 'GET',  status: 200, latency: '34ms'  },
  { id: 'al-005', timestamp: '10:53:47',  endpoint: '/webhooks',         method: 'GET',  status: 200, latency: '22ms'  },
  { id: 'al-006', timestamp: '10:52:19',  endpoint: '/opportunities',    method: 'POST', status: 429, latency: '14ms'  },
  { id: 'al-007', timestamp: '10:51:08',  endpoint: '/contacts/9102',    method: 'DELETE', status: 204, latency: '67ms' },
];

const CHANGE_LOG: ChangeLogEntry[] = [
  { id: 'cl-001', user: 'Ellis A.',   action: 'Updated field mapping',    field: 'lead.creditScore → contact.creditRating', oldValue: 'contact.fico',        newValue: 'contact.creditRating',  timestamp: '2026-05-12 10:41' },
  { id: 'cl-002', user: 'System',     action: 'Auto-rotated API key',     field: 'apiKey',                                  oldValue: 'twcrm_••••4821',      newValue: 'twcrm_••••9104',        timestamp: '2026-05-12 03:00' },
  { id: 'cl-003', user: 'Ellis A.',   action: 'Added webhook',            field: 'task.completed endpoint',                 oldValue: '(none)',               newValue: 'activepieces.internal', timestamp: '2026-05-11 16:22' },
  { id: 'cl-004', user: 'Ellis A.',   action: 'Changed conflict strategy', field: 'conflictResolution',                     oldValue: 'remote wins',          newValue: 'local wins',            timestamp: '2026-05-11 09:14' },
  { id: 'cl-005', user: 'Ellis A.',   action: 'Added IP to whitelist',    field: 'ipWhitelist',                             oldValue: '(not set)',            newValue: '10.8.0.12',             timestamp: '2026-05-10 14:33' },
];

const OAUTH_SCOPES = [
  'contacts:read', 'contacts:write', 'contacts:delete',
  'opportunities:read', 'opportunities:write',
  'notes:read', 'notes:write',
  'tasks:read', 'webhooks:manage',
  'search:read',
];

// ─── Helper components / functions ───────────────────────────────────────────

function fieldTypeBadge(type: FieldType) {
  const cfg: Record<FieldType, string> = {
    string:  'bg-cyan-500/20 text-cyan-400',
    number:  'bg-purple-500/20 text-purple-400',
    boolean: 'bg-pink-500/20 text-pink-400',
    date:    'bg-blue-500/20 text-blue-400',
    object:  'bg-orange-500/20 text-orange-400',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium font-mono ${cfg[type]}`}>
      {type}
    </span>
  );
}

function syncStatusBadge(status: SyncStatus) {
  const cfg: Record<SyncStatus, { cls: string; dot: string; label: string }> = {
    synced:  { cls: 'text-green-400',  dot: 'bg-green-400',  label: 'Synced'  },
    pending: { cls: 'text-yellow-400', dot: 'bg-yellow-400', label: 'Pending' },
    error:   { cls: 'text-red-400',    dot: 'bg-red-400',    label: 'Error'   },
  };
  const c = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === 'pending' ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  );
}

function webhookStatusBadge(status: WebhookStatus) {
  const cfg: Record<WebhookStatus, { cls: string; border: string; label: string }> = {
    active:   { cls: 'bg-green-500/10 text-green-400',   border: 'border-green-500/30',  label: 'Active'   },
    inactive: { cls: 'bg-slate-500/10 text-slate-400',   border: 'border-slate-500/30',  label: 'Inactive' },
    error:    { cls: 'bg-red-500/10 text-red-400',       border: 'border-red-500/30',    label: 'Error'    },
  };
  const c = cfg[status];
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${c.cls} ${c.border}`}>
      {c.label}
    </span>
  );
}

function httpStatusColor(code: number) {
  if (code >= 500) return 'text-red-400';
  if (code >= 400) return 'text-orange-400';
  if (code >= 300) return 'text-yellow-400';
  return 'text-green-400';
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CrmSettingsPage() {
  const [activeTab, setActiveTab]                   = useState<TabKey>('api');
  const [connectionStatus, setConnectionStatus]     = useState<ConnectionStatus>('connected');
  const [fieldMappings, setFieldMappings]           = useState<FieldMapping[]>(INITIAL_FIELD_MAPPINGS);
  const [realtime, setRealtime]                     = useState(true);
  const [batchSchedule, setBatchSchedule]           = useState<BatchSchedule>('daily');
  const [conflictStrategy, setConflictStrategy]     = useState<ConflictStrategy>('local');
  const [ipWhitelist, setIpWhitelist]               = useState(['10.0.0.0/8', '192.168.1.0/24', '10.8.0.12']);
  const [newIp, setNewIp]                           = useState('');
  const [rateLimit, setRateLimit]                   = useState('120');
  const [webhookModal, setWebhookModal]             = useState(false);
  const [newWebhookEvent, setNewWebhookEvent]       = useState('');
  const [newWebhookUrl, setNewWebhookUrl]           = useState('');
  const [editMappingId, setEditMappingId]           = useState<string | null>(null);

  // ── API credential test ──────────────────────────────────────────────────
  function testConnection() {
    setConnectionStatus('testing');
    setTimeout(() => setConnectionStatus('connected'), 1800);
  }

  // ── Field mapping helpers ─────────────────────────────────────────────────
  function deleteMapping(id: string) {
    setFieldMappings((prev) => prev.filter((m) => m.id !== id));
  }

  // ── IP whitelist helpers ───────────────────────────────────────────────────
  function addIp() {
    const trimmed = newIp.trim();
    if (trimmed && !ipWhitelist.includes(trimmed)) {
      setIpWhitelist((prev) => [...prev, trimmed]);
      setNewIp('');
    }
  }

  function removeIp(ip: string) {
    setIpWhitelist((prev) => prev.filter((x) => x !== ip));
  }

  // ── Webhook modal ──────────────────────────────────────────────────────────
  function addWebhook() {
    if (newWebhookEvent && newWebhookUrl) {
      setWebhookModal(false);
      setNewWebhookEvent('');
      setNewWebhookUrl('');
    }
  }

  // ─── Metric summary cards ────────────────────────────────────────────────
  const syncedCount  = fieldMappings.filter((m) => m.status === 'synced').length;
  const pendingCount = fieldMappings.filter((m) => m.status === 'pending').length;
  const errorCount   = fieldMappings.filter((m) => m.status === 'error').length;
  const activeWebhooks = WEBHOOKS.filter((w) => w.status === 'active').length;

  return (
    <div className="space-y-8">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            CRM Settings
          </h1>
          <p className="text-slate-400">Twenty CRM — configuration, field mapping, sync rules &amp; security</p>
        </div>
        <button
          onClick={testConnection}
          disabled={connectionStatus === 'testing'}
          className="flex items-center gap-2 px-4 py-2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition text-sm font-medium disabled:opacity-50"
        >
          {connectionStatus === 'testing' ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : connectionStatus === 'connected' ? (
            <CheckCircle2 size={14} />
          ) : (
            <AlertCircle size={14} />
          )}
          {connectionStatus === 'testing' ? 'Testing…' : 'Test Connection'}
        </button>
      </div>

      {/* ── Summary metric cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Database size={14} /> Connection
            </p>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : connectionStatus === 'testing' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`} />
              <p className={`text-lg font-bold capitalize ${connectionStatus === 'connected' ? 'text-green-400' : connectionStatus === 'testing' ? 'text-yellow-400' : 'text-red-400'}`}>
                {connectionStatus}
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-1">Last auth: 2m ago</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <ArrowRightLeft size={14} /> Field Mappings
            </p>
            <p className="text-2xl font-bold text-cyan-400">{fieldMappings.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-green-400">{syncedCount} synced</span>
              {pendingCount > 0 && <span className="text-yellow-400"> · {pendingCount} pending</span>}
              {errorCount > 0 && <span className="text-red-400"> · {errorCount} error</span>}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Webhook size={14} /> Webhooks
            </p>
            <p className="text-2xl font-bold text-purple-400">{activeWebhooks}</p>
            <p className="text-xs text-slate-500 mt-1">of {WEBHOOKS.length} active</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <RefreshCw size={14} /> Last Full Sync
            </p>
            <p className="text-lg font-bold text-pink-400">06:00 AM</p>
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-yellow-400">14 pending</span> changes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-black/30 border border-purple-500/15 rounded-lg w-fit flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: API CREDENTIALS                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          {/* Connection status card */}
          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Key size={18} /> Twenty CRM API Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Key row */}
              <div className="flex items-center justify-between gap-4 p-4 rounded border border-slate-800 flex-wrap gap-y-3">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded border ${connectionStatus === 'connected' ? 'border-green-500/30 bg-green-500/10' : connectionStatus === 'testing' ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                    <Key size={16} className={connectionStatus === 'connected' ? 'text-green-400' : connectionStatus === 'testing' ? 'text-yellow-400' : 'text-red-400'} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">API Key</p>
                    <p className="text-sm font-mono text-slate-400 mt-0.5">twcrm_••••••••••••••••9104</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded border font-medium ${
                    connectionStatus === 'connected'
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : connectionStatus === 'testing'
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}>
                    {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'testing' ? 'Verifying…' : 'Disconnected'}
                  </span>
                  <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-slate-700/50 text-slate-300 border border-slate-700 hover:bg-slate-700 transition">
                    <RefreshCw size={12} /> Rotate
                  </button>
                </div>
              </div>

              {/* Auth info grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded border border-slate-800 space-y-1">
                  <p className="text-xs text-slate-500">Last Authenticated</p>
                  <p className="text-sm font-semibold text-white">2026-05-12 10:53:41</p>
                  <p className="text-xs text-green-400">2 minutes ago</p>
                </div>
                <div className="p-4 rounded border border-slate-800 space-y-1">
                  <p className="text-xs text-slate-500">Token Expires</p>
                  <p className="text-sm font-semibold text-white">2026-06-12 10:53:41</p>
                  <p className="text-xs text-slate-400">30 days remaining</p>
                </div>
                <div className="p-4 rounded border border-slate-800 space-y-1">
                  <p className="text-xs text-slate-500">Base URL</p>
                  <p className="text-sm font-semibold text-white font-mono truncate">oracle-vps:3000</p>
                  <p className="text-xs text-cyan-400">TwentyCRM v2.1</p>
                </div>
              </div>

              {/* OAuth scopes */}
              <div>
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Authorized OAuth Scopes</p>
                <div className="flex flex-wrap gap-2">
                  {OAUTH_SCOPES.map((scope) => (
                    <span
                      key={scope}
                      className="text-xs px-2.5 py-1 rounded font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 border-t border-slate-800 pt-5">
                <button
                  onClick={testConnection}
                  disabled={connectionStatus === 'testing'}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition text-sm font-medium disabled:opacity-50"
                >
                  {connectionStatus === 'testing' ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                  {connectionStatus === 'testing' ? 'Testing…' : 'Test Credentials'}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded bg-slate-700/50 text-slate-300 border border-slate-700 hover:bg-slate-700 transition text-sm font-medium">
                  <FileText size={14} /> View API Docs
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: FIELD MAPPING                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'fields' && (
        <div className="space-y-6">
          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <ArrowRightLeft size={18} /> Field Mappings
                </CardTitle>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition text-sm font-medium">
                  <Plus size={14} /> Add Mapping
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Sync status summary bar */}
              <div className="flex items-center gap-4 mb-5 p-3 rounded border border-slate-800 text-xs">
                <span className="text-slate-500">Sync status:</span>
                <span className="flex items-center gap-1.5 text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  {syncedCount} synced
                </span>
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  {pendingCount} pending
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {errorCount} error
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 border-b border-slate-800">
                      <th className="text-left pb-3 pr-4">Local Field</th>
                      <th className="text-left pb-3 pr-4 text-slate-600">→</th>
                      <th className="text-left pb-3 pr-4">Remote Field</th>
                      <th className="text-left pb-3 pr-4">Type</th>
                      <th className="text-left pb-3 pr-4">Last Sync</th>
                      <th className="text-left pb-3 pr-4">Status</th>
                      <th className="text-left pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {fieldMappings.map((mapping) => (
                      <tr key={mapping.id} className="hover:bg-white/[0.02] group">
                        <td className="py-3 pr-4">
                          <span className="font-mono text-xs text-cyan-300">{mapping.localField}</span>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">→</td>
                        <td className="py-3 pr-4">
                          <span className="font-mono text-xs text-purple-300">{mapping.remoteField}</span>
                        </td>
                        <td className="py-3 pr-4">{fieldTypeBadge(mapping.type)}</td>
                        <td className="py-3 pr-4 text-xs text-slate-500">{mapping.lastSync}</td>
                        <td className="py-3 pr-4">{syncStatusBadge(mapping.status)}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => setEditMappingId(mapping.id)}
                              className="p-1.5 rounded hover:bg-cyan-500/20 text-slate-500 hover:text-cyan-400 transition"
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => deleteMapping(mapping.id)}
                              className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: SYNC RULES                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings2 size={18} /> Sync Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">

              {/* Real-time toggle */}
              <div className="flex items-center justify-between gap-4 p-4 rounded border border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-white">Real-time Sync</p>
                  <p className="text-xs text-slate-500 mt-1">Push changes to Twenty CRM immediately on every write operation</p>
                </div>
                <button
                  onClick={() => setRealtime((v) => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${realtime ? 'bg-purple-500' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${realtime ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Batch schedule */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white">Batch Sync Schedule</p>
                <p className="text-xs text-slate-500">Full reconciliation sweep — runs even when real-time is on</p>
                <div className="flex gap-3 flex-wrap">
                  {(['daily', 'weekly', 'monthly'] as BatchSchedule[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setBatchSchedule(s)}
                      className={`px-5 py-2 rounded border text-sm font-medium capitalize transition ${
                        batchSchedule === s
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {batchSchedule === 'daily' && (
                  <p className="text-xs text-cyan-400">Next run: tonight at 06:00 AM</p>
                )}
                {batchSchedule === 'weekly' && (
                  <p className="text-xs text-cyan-400">Next run: Sunday at 06:00 AM</p>
                )}
                {batchSchedule === 'monthly' && (
                  <p className="text-xs text-cyan-400">Next run: June 1 at 06:00 AM</p>
                )}
              </div>

              {/* Conflict resolution */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white">Conflict Resolution Strategy</p>
                <p className="text-xs text-slate-500">Determines which record wins when both local and remote have changed</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {([
                    { key: 'local' as ConflictStrategy,  label: 'Local Wins',  desc: 'Nyra record always takes precedence',          color: 'purple' },
                    { key: 'remote' as ConflictStrategy, label: 'Remote Wins', desc: 'Twenty CRM record always takes precedence',    color: 'cyan' },
                    { key: 'manual' as ConflictStrategy, label: 'Manual',      desc: 'Flag conflicts for human review in queue',     color: 'pink' },
                  ]).map(({ key, label, desc, color }) => (
                    <button
                      key={key}
                      onClick={() => setConflictStrategy(key)}
                      className={`text-left p-4 rounded border transition ${
                        conflictStrategy === key
                          ? color === 'purple'
                            ? 'border-purple-500/50 bg-purple-500/10'
                            : color === 'cyan'
                            ? 'border-cyan-500/50 bg-cyan-500/10'
                            : 'border-pink-500/50 bg-pink-500/10'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className={`text-sm font-semibold ${
                          conflictStrategy === key
                            ? color === 'purple' ? 'text-purple-300' : color === 'cyan' ? 'text-cyan-300' : 'text-pink-300'
                            : 'text-white'
                        }`}>{label}</p>
                        {conflictStrategy === key && (
                          <CheckCircle2 size={14} className={color === 'purple' ? 'text-purple-400' : color === 'cyan' ? 'text-cyan-400' : 'text-pink-400'} />
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sync status summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800 pt-6">
                <div className="p-4 rounded border border-slate-800 space-y-1">
                  <p className="text-xs text-slate-500">Last Full Sync</p>
                  <p className="text-sm font-semibold text-white">2026-05-12 06:00:04</p>
                  <p className="text-xs text-green-400">Completed successfully</p>
                </div>
                <div className="p-4 rounded border border-slate-800 space-y-1">
                  <p className="text-xs text-slate-500">Pending Changes</p>
                  <p className="text-2xl font-bold text-yellow-400">14</p>
                  <p className="text-xs text-slate-500">queued for next batch</p>
                </div>
                <div className="p-4 rounded border border-slate-800 space-y-1">
                  <p className="text-xs text-slate-500">Sync Errors (24h)</p>
                  <p className="text-2xl font-bold text-red-400">3</p>
                  <button className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition">View errors</button>
                </div>
              </div>

              {/* Run now */}
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition text-sm font-medium">
                  <RefreshCw size={14} /> Run Full Sync Now
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded bg-slate-700/50 text-slate-300 border border-slate-700 hover:bg-slate-700 transition text-sm font-medium">
                  <Clock size={14} /> View Sync History
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: WEBHOOKS                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <Webhook size={18} /> Active Webhooks
                </CardTitle>
                <button
                  onClick={() => setWebhookModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition text-sm font-medium"
                >
                  <Plus size={14} /> Add Webhook
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {WEBHOOKS.map((wh) => (
                  <div
                    key={wh.id}
                    className="p-4 rounded border border-slate-800 hover:border-slate-700 transition group"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap gap-y-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <Webhook size={16} className={
                          wh.status === 'active' ? 'text-green-400 flex-shrink-0' :
                          wh.status === 'error' ? 'text-red-400 flex-shrink-0' :
                          'text-slate-500 flex-shrink-0'
                        } />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded font-mono bg-cyan-500/20 text-cyan-300">
                              {wh.eventType}
                            </span>
                            {webhookStatusBadge(wh.status)}
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-1.5 truncate">{wh.endpoint}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 text-right">
                        <div>
                          <p className="text-xs text-slate-500">Last triggered</p>
                          <p className="text-xs text-slate-300">{wh.lastTriggered}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Success rate</p>
                          <p className={`text-xs font-bold ${wh.successRate >= 95 ? 'text-green-400' : wh.successRate >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {wh.successRate}%
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button className="p-1.5 rounded hover:bg-cyan-500/20 text-slate-500 hover:text-cyan-400 transition" title="Edit">
                            <Edit2 size={13} />
                          </button>
                          <button className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {wh.status === 'error' && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                        <AlertTriangle size={12} className="flex-shrink-0" />
                        Last delivery failed — endpoint returned 503. Check service health.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: SECURITY                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div className="space-y-6">

          {/* IP Whitelist */}
          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe size={18} /> IP Whitelist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-500">Only requests from these IPs/CIDRs are allowed to authenticate with the CRM API.</p>

              <div className="space-y-2">
                {ipWhitelist.map((ip) => (
                  <div key={ip} className="flex items-center justify-between gap-3 px-4 py-2.5 rounded border border-slate-800 group">
                    <span className="font-mono text-sm text-slate-300">{ip}</span>
                    <button
                      onClick={() => removeIp(ip)}
                      className="p-1 rounded hover:bg-red-500/20 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Minus size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addIp()}
                  placeholder="e.g. 203.0.113.0/24"
                  className="flex-1 px-3 py-2 rounded border border-slate-700 bg-black/40 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 font-mono"
                />
                <button
                  onClick={addIp}
                  disabled={!newIp.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition text-sm font-medium disabled:opacity-40"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limiting */}
          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Lock size={18} /> Rate Limiting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs text-slate-500 mb-2 block">Max requests per minute</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={rateLimit}
                      onChange={(e) => setRateLimit(e.target.value)}
                      min="10"
                      max="1000"
                      className="w-32 px-3 py-2 rounded border border-slate-700 bg-black/40 text-sm text-white font-mono focus:outline-none focus:border-purple-500/50"
                    />
                    <span className="text-xs text-slate-500">req/min</span>
                  </div>
                </div>
                <div className="p-4 rounded border border-slate-800 min-w-[160px]">
                  <p className="text-xs text-slate-500">Current usage</p>
                  <p className="text-lg font-bold text-cyan-400 mt-1">47 <span className="text-sm text-slate-500">/ {rateLimit}</span></p>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min((47 / parseInt(rateLimit || '120')) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition text-sm font-medium">
                <CheckCircle2 size={14} /> Save Rate Limit
              </button>
            </CardContent>
          </Card>

          {/* Access log */}
          <Card className="bg-card/40 backdrop-blur-md border border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity size={18} /> Recent API Access Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 border-b border-slate-800">
                      <th className="text-left pb-3 pr-4">Time</th>
                      <th className="text-left pb-3 pr-4">Method</th>
                      <th className="text-left pb-3 pr-4">Endpoint</th>
                      <th className="text-left pb-3 pr-4">Status</th>
                      <th className="text-left pb-3">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {ACCESS_LOG.map((entry) => (
                      <tr key={entry.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 pr-4 text-xs font-mono text-slate-500">{entry.timestamp}</td>
                        <td className="py-2.5 pr-4">
                          <span className={`text-xs font-mono font-bold ${
                            entry.method === 'GET' ? 'text-cyan-400' :
                            entry.method === 'POST' ? 'text-green-400' :
                            entry.method === 'PUT' ? 'text-yellow-400' :
                            entry.method === 'DELETE' ? 'text-red-400' :
                            'text-slate-400'
                          }`}>{entry.method}</span>
                        </td>
                        <td className="py-2.5 pr-4 text-xs font-mono text-slate-300">{entry.endpoint}</td>
                        <td className="py-2.5 pr-4">
                          <span className={`text-xs font-bold font-mono ${httpStatusColor(entry.status)}`}>{entry.status}</span>
                        </td>
                        <td className="py-2.5 text-xs font-mono text-slate-500">{entry.latency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SETTINGS CHANGE LOG (always visible at bottom)                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText size={18} /> Settings Change Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {CHANGE_LOG.map((entry, index) => (
              <div key={entry.id} className="flex gap-3">
                {/* Timeline spine */}
                <div className="flex flex-col items-center">
                  <span className="h-3 w-3 rounded-full flex-shrink-0 mt-1 bg-purple-400" />
                  {index < CHANGE_LOG.length - 1 && (
                    <div className="w-px flex-1 bg-slate-800 my-1" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-4 flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <User size={11} /> {entry.user}
                        </span>
                        <span className="text-xs text-purple-300 font-medium">{entry.action}</span>
                      </div>
                      <p className="text-xs font-mono text-slate-500 mt-1">
                        <span className="text-slate-600">{entry.field}</span>
                        {' '}
                        <span className="text-red-400/70">{entry.oldValue}</span>
                        {' → '}
                        <span className="text-green-400/70">{entry.newValue}</span>
                      </p>
                    </div>
                    <span className="text-xs text-slate-600 whitespace-nowrap flex-shrink-0">
                      <Clock size={10} className="inline mr-1" />
                      {entry.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: Add Webhook                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {webhookModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setWebhookModal(false)}
        >
          <Card
            className="bg-black/90 border border-purple-500/30 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Webhook size={16} /> Add Webhook
                </CardTitle>
                <button
                  onClick={() => setWebhookModal(false)}
                  className="p-1.5 hover:bg-red-500/20 rounded transition"
                >
                  <X size={16} className="text-red-400" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">Event Type</label>
                <select
                  value={newWebhookEvent}
                  onChange={(e) => setNewWebhookEvent(e.target.value)}
                  className="w-full px-3 py-2.5 rounded border border-slate-700 bg-black/60 text-sm text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="">Select an event…</option>
                  <option value="contact.created">contact.created</option>
                  <option value="contact.updated">contact.updated</option>
                  <option value="contact.deleted">contact.deleted</option>
                  <option value="opportunity.created">opportunity.created</option>
                  <option value="opportunity.updated">opportunity.updated</option>
                  <option value="opportunity.closed">opportunity.closed</option>
                  <option value="note.created">note.created</option>
                  <option value="task.created">task.created</option>
                  <option value="task.completed">task.completed</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">Endpoint URL</label>
                <input
                  type="url"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://your-service/webhook"
                  className="w-full px-3 py-2.5 rounded border border-slate-700 bg-black/60 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 font-mono"
                />
              </div>

              {newWebhookUrl && !newWebhookUrl.startsWith('https://') && (
                <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded px-3 py-2">
                  <AlertCircle size={12} className="flex-shrink-0" />
                  HTTPS is strongly recommended for webhook endpoints.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={addWebhook}
                  disabled={!newWebhookEvent || !newWebhookUrl}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition text-sm font-medium disabled:opacity-40"
                >
                  <Plus size={14} /> Create Webhook
                </button>
                <button
                  onClick={() => setWebhookModal(false)}
                  className="px-5 py-2.5 rounded bg-slate-800/70 text-slate-400 border border-slate-700 hover:bg-slate-800 transition text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: Edit Field Mapping (stub — shows selected id)               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {editMappingId && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setEditMappingId(null)}
        >
          {(() => {
            const mapping = fieldMappings.find((m) => m.id === editMappingId);
            if (!mapping) return null;
            return (
              <Card
                className="bg-black/90 border border-cyan-500/30 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader className="border-b border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2 text-base">
                      <Edit2 size={16} /> Edit Field Mapping
                    </CardTitle>
                    <button
                      onClick={() => setEditMappingId(null)}
                      className="p-1.5 hover:bg-red-500/20 rounded transition"
                    >
                      <X size={16} className="text-red-400" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">Local Field</label>
                      <input
                        defaultValue={mapping.localField}
                        className="w-full px-3 py-2.5 rounded border border-slate-700 bg-black/60 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">Remote Field</label>
                      <input
                        defaultValue={mapping.remoteField}
                        className="w-full px-3 py-2.5 rounded border border-slate-700 bg-black/60 text-sm text-purple-300 font-mono focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">Field Type</label>
                    <select
                      defaultValue={mapping.type}
                      className="w-full px-3 py-2.5 rounded border border-slate-700 bg-black/60 text-sm text-white focus:outline-none focus:border-purple-500/50"
                    >
                      {(['string', 'number', 'boolean', 'date', 'object'] as FieldType[]).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setEditMappingId(null)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition text-sm font-medium"
                    >
                      <CheckCircle2 size={14} /> Save Changes
                    </button>
                    <button
                      onClick={() => setEditMappingId(null)}
                      className="px-5 py-2.5 rounded bg-slate-800/70 text-slate-400 border border-slate-700 hover:bg-slate-800 transition text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      )}
    </div>
  );
}
