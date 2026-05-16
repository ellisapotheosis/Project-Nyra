'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@nyra/ui';
import { PageHeader } from '@nyra/ui';

export default function CRMDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const syncLog = {
    id,
    type: 'Full Sync',
    status: 'completed',
    startTime: '2026-05-12 10:00 AM',
    endTime: '2026-05-12 10:15 AM',
    recordsProcessed: 4562,
    recordsCreated: 245,
    recordsUpdated: 1203,
    recordsSkipped: 87,
    errors: 0,
    details: [
      { entity: 'Contact', processed: 2847, created: 120, updated: 650, status: 'completed' },
      { entity: 'Deal', processed: 1203, created: 45, updated: 310, status: 'completed' },
      { entity: 'Company', processed: 412, created: 8, updated: 80, status: 'completed' },
      { entity: 'Activity', processed: 8934, created: 72, updated: 163, status: 'completed' },
    ],
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/crm" className="p-2 hover:bg-slate-800/50 rounded transition-colors">
          <ArrowLeft size={20} className="text-slate-400" />
        </Link>
        <PageHeader title={`CRM Sync - ${syncLog.type}`} subtitle={`Sync ID: ${id}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Records Processed</p>
            <p className="text-2xl font-bold text-cyan-400">{syncLog.recordsProcessed.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Records Created</p>
            <p className="text-2xl font-bold text-green-400">{syncLog.recordsCreated.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Records Updated</p>
            <p className="text-2xl font-bold text-purple-400">{syncLog.recordsUpdated.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2">Errors</p>
            <p className="text-2xl font-bold text-red-400">{syncLog.errors}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Entity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {syncLog.details.map((detail, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded border border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-white">{detail.entity}</p>
                  <p className="text-xs text-slate-500">Processed: {detail.processed.toLocaleString()}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex gap-4 text-xs">
                    <span className="text-green-400">Created: {detail.created}</span>
                    <span className="text-cyan-400">Updated: {detail.updated}</span>
                  </div>
                  <p className="text-xs text-green-400 font-semibold">{detail.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
