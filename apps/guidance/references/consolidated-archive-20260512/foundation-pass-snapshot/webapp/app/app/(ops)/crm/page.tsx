'use client';

import React, { useEffect } from 'react';
import { Activity, Clock, FileText, Target, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
    <div className="space-y-8 p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">Mirror Service</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent italic">CRM Mirror</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Internal overview surface synchronized with the primary TwentyCRM system of record.
          </p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black text-[10px]">SYNC_MODE: REALTIME</Badge>
        </div>
      </div>

      <StatusGate
        data={pipelineApi.data?.pipeline ?? null}
        error={pipelineApi.error}
        isLoading={pipelineApi.isLoading}
        onRetry={pipelineApi.execute}
        loadingMessage="Retrieving Pipeline Stats..."
        emptyMessage="No pipeline data available."
      >
        {(pipeline) => {
          const totalLeads = pipeline.reduce((sum: number, p: any) => sum + p.total, 0);
          return (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
              <StatItem title="Active Pipeline" value={totalLeads} icon={<Activity className="size-4" />} color="primary" />
              <StatItem title="Total Leads" value={leadsApi.data?.leads.length || 0} icon={<Users className="size-4" />} color="success" />
              <StatItem title="Applications" value="--" icon={<FileText className="size-4" />} color="danger" />
              <StatItem title="Conversion" value="--" icon={<Target className="size-4" />} color="primary" />
              <StatItem title="Avg. Cycle" value="--" icon={<Clock className="size-4" />} color="success" />
            </div>
          );
        }}
      </StatusGate>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl border-t-2 border-t-primary overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-border/50">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Leads Journey Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <StatusGate
              data={leadsApi.data?.leads ?? null}
              error={leadsApi.error}
              isLoading={leadsApi.isLoading}
              onRetry={leadsApi.execute}
              loadingMessage="SYNCING_REGISTRY..."
              emptyMessage="No leads found."
            >
              {(leads) => (
                <div className="space-y-3">
                  {leads.map((lead: any) => (
                    <div key={lead.id} className="rounded-lg border border-primary/10 bg-primary/5 p-5 hover:bg-primary/10 transition-all group border-l-2 border-l-emerald-500 shadow-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-black text-foreground group-hover:text-primary transition-colors uppercase">
                          {lead.firstName ? `${lead.firstName} ${lead.lastName}` : (lead.name || 'Unknown')}
                        </p>
                        <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[9px] font-black">{lead.stage || 'NEW'}</Badge>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                        {lead.loanPurpose || 'GENERAL'} • {lead.source || 'DIRECT_INGRESS'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </StatusGate>
          </CardContent>
        </Card>

        <Card className="bg-card/20 backdrop-blur-sm border border-border/40 shadow-2xl border-b-2 border-b-destructive">
          <CardHeader className="bg-background/20 border-b border-border/50">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-destructive">Applications Blueprint</CardTitle>
          </CardHeader>
          <CardContent className="p-12 text-center space-y-6 opacity-40">
            <div className="h-20 w-20 rounded-lg bg-muted/20 border border-border/20 flex items-center justify-center mx-auto shadow-inner">
               <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-foreground uppercase tracking-widest">Awaiting Integration</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed max-w-[200px] mx-auto">
                Application data coming soon via Twenty CRM-Custom-Objects.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatItem({ title, value, icon, color }: any) {
  const colorMap: any = {
    primary: "text-primary bg-primary/10 border-primary/20",
    success: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    danger: "text-destructive bg-destructive/10 border-destructive/20"
  };
  return (
    <Card className="bg-card/40 border-border/50 shadow-xl overflow-hidden group hover:border-primary/30 transition-all">
      <CardHeader className="p-4 pb-2 border-b border-border/50 bg-background/20 flex flex-row items-center justify-between">
        <CardTitle className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
        <div className={`p-1.5 rounded-lg border ${colorMap[color]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="text-2xl font-black text-foreground group-hover:scale-105 transition-transform origin-left">{value}</div>
      </CardContent>
    </Card>
  );
}
