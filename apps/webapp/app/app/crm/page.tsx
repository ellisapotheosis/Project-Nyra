'use client';

import React, { useEffect } from 'react';
import { Activity, FileText, Target, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { crmApi, useApi } from '@/lib/api';
import { StatusGate } from '@/components/status-gate';

export default function CrmPage() {
  const leadsApi = useApi(crmApi.getLeads);
  const pipelineApi = useApi(crmApi.getPipeline);

  useEffect(() => {
    leadsApi.execute();
    pipelineApi.execute();
  }, []);

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">CRM Mirror</h1>
        <p className="mt-2 text-muted-foreground">
          This page replaces the separate mortgage CRM prototype with an internal overview route inside the main webapp.
        </p>
      </div>

      <StatusGate
        data={pipelineApi.data?.pipeline ?? null}
        error={pipelineApi.error}
        isLoading={pipelineApi.isLoading}
        onRetry={pipelineApi.execute}
        loadingMessage="Fetching pipeline stats..."
        emptyMessage="No pipeline data available."
      >
        {(pipeline) => {
          const totalLeads = pipeline.reduce((sum: number, p: any) => sum + p.total, 0);
          return (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="size-4" />
                    Active Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">{totalLeads}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4" />
                    Leads
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">{leadsApi.data?.leads.length || 0}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="size-4" />
                    Applications
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">--</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="size-4" />
                    Conversion
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">--</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Average Cycle</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">--</CardContent>
              </Card>
            </div>
          );
        }}
      </StatusGate>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Leads Feeding the Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusGate
              data={leadsApi.data?.leads ?? null}
              error={leadsApi.error}
              isLoading={leadsApi.isLoading}
              onRetry={leadsApi.execute}
              loadingMessage="Loading leads..."
              emptyMessage="No leads found."
            >
              {(leads) => (
                <>
                  {leads.map((lead: any) => (
                    <div key={lead.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
                      <p className="font-medium">
                        {lead.firstName ? `${lead.firstName} ${lead.lastName}` : (lead.name || 'Unknown')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lead.loanPurpose || 'General'} • {lead.stage || 'New'} • {lead.source || 'Direct'}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </StatusGate>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col items-center justify-center p-12 text-center opacity-50">
              <FileText className="h-8 w-8 mb-2" />
              <p className="text-sm">Application data coming soon via Twenty integration.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
