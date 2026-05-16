'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@nyra/ui';
import { PageHeader } from '@nyra/ui';

export default function PipelineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const pipelineStage = {
    id,
    name: 'Discovery & Qualification',
    totalLeads: 147,
    value: '$65.2M',
    avgDealSize: '$444k',
    conversion: 18,
    avgDaysInStage: 6,
    leads: [
      { name: 'John Martinez', company: 'Acme Corp', value: '$450k', daysInStage: 3 },
      { name: 'Sarah Chen', company: 'Tech Ventures', value: '$525k', daysInStage: 7 },
      { name: 'Michael Rodriguez', company: 'Realty Plus', value: '$380k', daysInStage: 5 },
    ],
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/pipeline" className="p-2 hover:bg-slate-800/50 rounded transition-colors">
          <ArrowLeft size={20} className="text-slate-400" />
        </Link>
        <PageHeader title={`Pipeline - ${pipelineStage.name}`} subtitle={`Stage ID: ${id}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Total Leads</p>
            <p className="text-2xl font-bold text-cyan-400">{pipelineStage.totalLeads}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Pipeline Value</p>
            <p className="text-2xl font-bold text-green-400">{pipelineStage.value}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Conversion Rate</p>
            <p className="text-2xl font-bold text-purple-400">{pipelineStage.conversion}%</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Avg Days in Stage</p>
            <p className="text-2xl font-bold text-pink-400">{pipelineStage.avgDaysInStage}d</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Leads in Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pipelineStage.leads.map((lead, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded border border-slate-800 hover:border-slate-700">
                <div>
                  <p className="text-sm font-semibold text-white">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-cyan-400">{lead.value}</p>
                  <p className="text-xs text-slate-500">{lead.daysInStage}d in stage</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
