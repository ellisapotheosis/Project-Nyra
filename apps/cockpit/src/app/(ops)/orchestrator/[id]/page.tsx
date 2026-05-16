'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@nyra/ui';

interface OrchestratorDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrchestratorDetailPage({ params }: OrchestratorDetailProps) {
  const { id } = React.use(params);

  const workflow = {
    id,
    name: 'Daily Lead Processing Workflow',
    status: 'running' as const,
    progress: 65,
    startTime: '2026-05-12 09:30 AM',
    estimatedEnd: '2026-05-12 11:45 AM',
    totalSteps: 12,
    completedSteps: 8,
    failedSteps: 0,
    retries: 2,
    lastRun: '2026-05-11 09:30 AM',
    nextRun: '2026-05-13 09:30 AM',
    nodes: [
      { id: '1', name: 'Fetch Leads from TwentyCRM', status: 'completed', duration: '2m 15s' },
      { id: '2', name: 'Validate Lead Data', status: 'completed', duration: '1m 30s' },
      { id: '3', name: 'Check Compliance Rules', status: 'completed', duration: '3m 45s' },
      { id: '4', name: 'Generate Quotes', status: 'running', duration: '5m 20s' },
      { id: '5', name: 'Store Results', status: 'pending', duration: '—' },
      { id: '6', name: 'Send Notifications', status: 'pending', duration: '—' },
    ],
    metrics: {
      totalEvents: 247,
      successRate: '99.2%',
      avgDuration: '14m 32s',
      costPerRun: '$0.34',
    },
  };

  const nodeStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'running':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse';
      case 'pending':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/orchestrator" className="p-2 hover:bg-white/5 rounded transition-colors">
          <ArrowLeft size={20} className="text-gray-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            {workflow.name}
          </h1>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-cyan-500/20 rounded border border-cyan-500/30 transition-colors">
            <Play size={16} className="text-cyan-400" />
          </button>
          <button className="p-2 hover:bg-yellow-500/20 rounded border border-yellow-500/30 transition-colors">
            <Pause size={16} className="text-yellow-400" />
          </button>
          <button className="p-2 hover:bg-purple-500/20 rounded border border-purple-500/30 transition-colors">
            <RotateCcw size={16} className="text-purple-400" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Overall Progress</p>
              <p className="text-2xl font-bold text-white">{workflow.completedSteps} / {workflow.totalSteps} steps</p>
            </div>
            <span className="text-3xl font-bold text-cyan-400">{workflow.progress}%</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-3 border border-cyan-500/20">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${workflow.progress}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
              <Clock size={14} /> Started
            </p>
            <p className="text-sm font-semibold text-white">{workflow.startTime}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
              <Clock size={14} /> Estimated End
            </p>
            <p className="text-sm font-semibold text-cyan-400">{workflow.estimatedEnd}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-2">Success Rate</p>
            <p className="text-sm font-semibold text-green-400">{workflow.metrics.successRate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Steps */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Workflow Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workflow.nodes.map((node, index) => (
              <div key={node.id} className="relative">
                {index < workflow.nodes.length - 1 && (
                  <div className="absolute left-5 top-10 w-0.5 h-6 bg-border/30"></div>
                )}
                <div className={`flex items-center gap-4 p-4 rounded border ${nodeStatusColor(node.status)}`}>
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-black/40 border border-inherit flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{node.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Duration: {node.duration}</p>
                  </div>
                  <span className="text-xs font-semibold capitalize">{node.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-2">Total Events</p>
            <p className="text-2xl font-bold text-cyan-400">{workflow.metrics.totalEvents}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-2">Retries</p>
            <p className="text-2xl font-bold text-yellow-400">{workflow.retries}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-2">Avg Duration</p>
            <p className="text-sm font-bold text-purple-400">{workflow.metrics.avgDuration}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-2">Cost Per Run</p>
            <p className="text-2xl font-bold text-green-400">{workflow.metrics.costPerRun}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
