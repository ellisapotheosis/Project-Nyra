'use client';

import { useState } from 'react';
import { Activity, AlertCircle, CheckCircle, TrendingUp, Zap, Clock, BarChart3, GitBranch, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@nyra/ui';
import { PageHeader } from '@nyra/ui';

interface ProviderMetric {
  name: string;
  status: 'healthy' | 'degraded' | 'error' | 'standby';
  latency: string;
  usage: number;
  uptime: string;
  successRate: number;
  requestCount: number;
}

export default function NexusRouterPage() {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('24h');

  const providers: ProviderMetric[] = [
    { name: 'GPT-4 Turbo', status: 'healthy', latency: '185ms', usage: 34, uptime: '99.97%', successRate: 99.8, requestCount: 8451 },
    { name: 'Claude 3 Opus', status: 'healthy', latency: '240ms', usage: 28, uptime: '99.95%', successRate: 99.9, requestCount: 6238 },
    { name: 'DeepSeek-R1', status: 'healthy', latency: '156ms', usage: 22, uptime: '99.92%', successRate: 99.7, requestCount: 4923 },
    { name: 'OpenRouter Fallback', status: 'standby', latency: '—', usage: 0, uptime: '99.88%', successRate: 98.5, requestCount: 287 },
  ];

  const routingPolicies = [
    { priority: 1, model: 'GPT-4 Turbo', rules: 'Complex reasoning tasks', cost: '$0.03/1K tokens', activeRequests: 1240 },
    { priority: 2, model: 'Claude 3 Opus', rules: 'Compliance & security reviews', cost: '$0.015/1K tokens', activeRequests: 856 },
    { priority: 3, model: 'DeepSeek-R1', rules: 'Document processing', cost: '$0.0003/1K tokens', activeRequests: 623 },
    { priority: 4, model: 'OpenRouter Fallback', rules: 'Failover', cost: 'Variable', activeRequests: 34 },
  ];

  const requestHistogram = {
    '1h': [120, 145, 132, 158, 142, 165],
    '6h': [980, 1120, 1050, 1280, 1100, 1350],
    '24h': [8450, 9200, 8800, 9850, 8950, 10200],
  };

  const fallbackChain = [
    { step: 1, model: 'GPT-4 Turbo', triggered: 12, successRate: '99.8%', avgTime: '185ms' },
    { step: 2, model: 'Claude 3 Opus', triggered: 8, successRate: '99.9%', avgTime: '240ms' },
    { step: 3, model: 'DeepSeek-R1', triggered: 5, successRate: '99.7%', avgTime: '156ms' },
    { step: 4, model: 'OpenRouter', triggered: 2, successRate: '98.5%', avgTime: '312ms' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'degraded':
        return <AlertCircle size={16} className="text-yellow-400" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-400" />;
      default:
        return <Activity size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'degraded':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const totalRequests = {
    '1h': requestHistogram['1h'].reduce((a, b) => a + b, 0),
    '6h': requestHistogram['6h'].reduce((a, b) => a + b, 0),
    '24h': requestHistogram['24h'].reduce((a, b) => a + b, 0),
  };

  const avgLatency = {
    '1h': '189ms',
    '6h': '201ms',
    '24h': '237ms',
  };

  const successRate = {
    '1h': '99.4%',
    '6h': '99.3%',
    '24h': '99.2%',
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nexus Router"
        subtitle="LLM Gateway - Multi-Provider Load Balancing & Analytics"
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
              <Zap size={14} /> Total Requests
            </p>
            <p className="text-2xl font-bold text-cyan-400">{totalRequests[timeRange].toLocaleString()}</p>
            <p className="text-xs text-green-400 mt-1">+{Math.floor(totalRequests[timeRange] * 0.12).toLocaleString()} this period</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Clock size={14} /> Avg Latency
            </p>
            <p className="text-2xl font-bold text-purple-400">{avgLatency[timeRange]}</p>
            <p className="text-xs text-slate-400 mt-1">p95: 485ms</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <CheckCircle size={14} /> Success Rate
            </p>
            <p className="text-2xl font-bold text-green-400">{successRate[timeRange]}</p>
            <p className="text-xs text-slate-400 mt-1">{Math.floor(totalRequests[timeRange] * 0.008)} failures</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <TrendingUp size={14} /> Uptime
            </p>
            <p className="text-2xl font-bold text-blue-400">99.97%</p>
            <p className="text-xs text-slate-400 mt-1">All providers healthy</p>
          </CardContent>
        </Card>
      </div>

      {/* Request Volume Chart */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 size={18} /> Request Volume Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-2 h-40">
              {requestHistogram[timeRange].map((count, i) => {
                const maxCount = Math.max(...requestHistogram[timeRange]);
                const height = (count / maxCount) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-pink-400 rounded-t opacity-80 hover:opacity-100 transition"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-slate-500">{Math.floor(count / 1000)}k</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">Distribution across {timeRange === '1h' ? '6 periods' : timeRange === '6h' ? '6 hours' : '24 hours'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Provider Health */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Provider Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {providers.map((provider) => (
              <div key={provider.name} className={`flex items-center justify-between p-4 rounded border ${getStatusColor(provider.status)}`}>
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(provider.status)}
                  <div>
                    <p className="text-sm font-semibold text-white">{provider.name}</p>
                    <p className="text-xs text-slate-500">Latency: {provider.latency} • Success: {provider.successRate}%</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: `${provider.usage}%` }}
                      />
                    </div>
                    <p className="text-sm font-bold text-cyan-400 w-8 text-right">{provider.usage}%</p>
                  </div>
                  <p className="text-xs text-slate-500">Requests: {provider.requestCount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Routing Policies */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <GitBranch size={18} /> Routing Policies & Load Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {routingPolicies.map((policy) => (
              <div key={policy.priority} className="flex items-center gap-4 p-4 rounded border border-slate-800 hover:border-slate-700">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 flex-shrink-0">
                  {policy.priority}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{policy.model}</p>
                  <p className="text-xs text-slate-500">{policy.rules}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs font-bold text-cyan-400">{policy.cost}</p>
                  <p className="text-xs text-slate-500">{policy.activeRequests.toLocaleString()} active</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fallback Chain History */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Flame size={18} /> Fallback Chain Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fallbackChain.map((step) => (
              <div key={step.step} className="flex items-center gap-4 p-4 rounded border border-slate-800">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center font-bold text-orange-400 flex-shrink-0">
                  {step.step}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{step.model}</p>
                  <p className="text-xs text-slate-500">Triggered {step.triggered} times • Success: {step.successRate}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs font-bold text-cyan-400">{step.avgTime}</p>
                  <p className="text-xs text-slate-500">avg latency</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
