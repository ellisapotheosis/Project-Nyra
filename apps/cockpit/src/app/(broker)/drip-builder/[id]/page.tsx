'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Edit2, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@nyra/ui';
import { Button } from '@nyra/ui';
import { PageHeader } from '@nyra/ui';

export default function DripBuilderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const campaign = {
    id,
    name: 'Mortgage Pre-Qual Drip',
    status: 'active',
    enrolledLeads: 847,
    conversionRate: '18.2%',
    avgEngagement: '3.4',
    steps: [
      { order: 1, type: 'Email', title: 'Welcome Email', delay: '0d', status: 'sent' },
      { order: 2, type: 'Delay', title: 'Wait 3 days', delay: '3d', status: 'sent' },
      { order: 3, type: 'SMS', title: 'Pre-qual Quiz', delay: '3d', status: 'sent' },
      { order: 4, type: 'Condition', title: 'Check Response', delay: '0d', status: 'active' },
      { order: 5, type: 'Email', title: 'Quote Follow-up', delay: '5d', status: 'pending' },
    ],
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/drip-builder" className="p-2 hover:bg-slate-800/50 rounded transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
          </Link>
          <PageHeader title={campaign.name} subtitle={`Campaign ID: ${id}`} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2">
            <Edit2 size={16} /> Edit
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Copy size={16} /> Clone
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Enrolled Leads</p>
            <p className="text-2xl font-bold text-cyan-400">{campaign.enrolledLeads}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Conversion Rate</p>
            <p className="text-2xl font-bold text-green-400">{campaign.conversionRate}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Avg Engagement</p>
            <p className="text-2xl font-bold text-purple-400">{campaign.avgEngagement}/5.0</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Status</p>
            <p className="text-sm font-bold text-green-400 capitalize">{campaign.status}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Workflow Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaign.steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded border border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                  {step.order}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-xs text-slate-500">Type: {step.type} • Delay: {step.delay}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    step.status === 'sent'
                      ? 'bg-green-500/20 text-green-400'
                      : step.status === 'active'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {step.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
