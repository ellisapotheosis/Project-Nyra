'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@nyra/ui';
import { PageHeader } from '@nyra/ui';

export default function AssistantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const assistant = {
    id,
    name: 'Lead Processor Alpha',
    status: 'active',
    tasksCompleted: 847,
    uptime: '99.2%',
    avgResponseTime: '340ms',
    recentTasks: [
      { task: 'Process Lead', status: 'completed', time: '2m ago', duration: '2.3s' },
      { task: 'Generate Quote', status: 'completed', time: '5m ago', duration: '3.1s' },
      { task: 'Compliance Check', status: 'completed', time: '8m ago', duration: '1.8s' },
      { task: 'Send Notification', status: 'completed', time: '12m ago', duration: '0.9s' },
    ],
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/assistant" className="p-2 hover:bg-slate-800/50 rounded transition-colors">
          <ArrowLeft size={20} className="text-slate-400" />
        </Link>
        <PageHeader title={assistant.name} description={`Agent ID: ${id}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Tasks Completed</p>
            <p className="text-2xl font-bold text-cyan-400">{assistant.tasksCompleted}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Uptime</p>
            <p className="text-2xl font-bold text-green-400">{assistant.uptime}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Avg Response Time</p>
            <p className="text-2xl font-bold text-purple-400">{assistant.avgResponseTime}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Status</p>
            <p className="text-sm font-bold text-green-400 capitalize">{assistant.status}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquare size={18} /> Recent Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assistant.recentTasks.map((task, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded border border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-white">{task.task}</p>
                  <p className="text-xs text-slate-500">{task.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-cyan-400">{task.duration}</p>
                  <p className="text-xs text-green-400">{task.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
