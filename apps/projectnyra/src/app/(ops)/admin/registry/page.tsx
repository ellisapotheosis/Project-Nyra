"use client";

import React, { useEffect } from "react";
import {
  Activity,
  Clock,
  FileText,
  Target,
  Users,
  RefreshCcw,
  ChevronRight,
} from "lucide-react";

import { Badge, Button } from "@nyra/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui";
import { crmApi, useApi } from "@/lib/api";
import { StatusGate } from "@nyra/ui";
import { cn } from "@/lib/utils";

export default function CrmPage() {
  const leadsApi = useApi(crmApi.getLeads);
  const pipelineApi = useApi(crmApi.getPipeline);

  useEffect(() => {
    leadsApi.execute();
    pipelineApi.execute();
  }, []);

  return (
    <div className="space-y-12 p-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-turquoise-400 text-[10px] font-black tracking-[0.4em] uppercase mb-1">
            Service_Synchronization
          </p>
          <h1 className="text-4xl font-black tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-turquoise-400 italic uppercase">
            TwentyCRM_Mirror
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl font-medium uppercase tracking-tight text-xs opacity-60">
            Internal overview surface synchronized with the primary TwentyCRM
            system of record.
          </p>
        </div>
        <div className="flex gap-4">
          <Badge
            variant="outline"
            className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-lg shadow-inner"
          >
            SYNC_MODE: REALTIME
          </Badge>
          <Button
            variant="outline"
            className="h-10 border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-black uppercase tracking-widest text-[9px] px-6 rounded-xl hover:bg-indigo-500/10"
          >
            <RefreshCcw className="mr-2 size-3.5" /> RE_INDEX_REGISTRY
          </Button>
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
          const totalLeads = pipeline.reduce(
            (sum: number, p: any) => sum + p.total,
            0
          );
          return (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
              <StatItem
                title="Active Pipeline"
                value={totalLeads}
                icon={<Activity className="size-4" />}
                color="indigo"
              />
              <StatItem
                title="Total Leads"
                value={leadsApi.data?.leads.length || 0}
                icon={<Users className="size-4" />}
                color="turquoise"
              />
              <StatItem
                title="Applications"
                value="8"
                icon={<FileText className="size-4" />}
                color="pink"
              />
              <StatItem
                title="Conversion"
                value="3.2%"
                icon={<Target className="size-4" />}
                color="indigo"
              />
              <StatItem
                title="Avg. Cycle"
                value="18_DAYS"
                icon={<Clock className="size-4" />}
                color="turquoise"
              />
            </div>
          );
        }}
      </StatusGate>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl border-t-2 border-t-indigo-500 overflow-hidden rounded-[32px]">
          <CardHeader className="bg-indigo-500/5 border-b border-border/50 p-8">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
              Leads_Journey_Buffer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-8">
            <StatusGate
              data={leadsApi.data?.leads ?? null}
              error={leadsApi.error}
              isLoading={leadsApi.isLoading}
              onRetry={leadsApi.execute}
              loadingMessage="SYNCING_REGISTRY..."
              emptyMessage="No leads found."
            >
              {(leads) => (
                <div className="space-y-4">
                  {leads.map((lead: any) => (
                    <div
                      key={lead.id}
                      className="rounded-2xl border border-indigo-500/10 bg-background/40 p-6 hover:bg-indigo-500/5 transition-all group border-l-4 border-l-turquoise-500 shadow-xl flex items-center justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <p className="font-black text-foreground group-hover:text-indigo-400 transition-colors uppercase tracking-tight text-sm">
                            {lead.firstName
                              ? `${lead.firstName} ${lead.lastName}`
                              : lead.name || "Unknown"}
                          </p>
                          <Badge className="bg-turquoise-500 text-black text-[8px] font-black px-2 py-0">
                            {lead.stage || "NEW"}
                          </Badge>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">
                          {lead.loanPurpose || "GENERAL"} •{" "}
                          {lead.source || "DIRECT_INGRESS"}
                        </p>
                      </div>
                      <ChevronRight className="size-5 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </StatusGate>
          </CardContent>
        </Card>

        <Card className="bg-card/20 backdrop-blur-sm border border-border/40 shadow-2xl border-b-2 border-b-pink-500 rounded-[32px] overflow-hidden">
          <CardHeader className="bg-background/20 border-b border-border/50 p-8">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400">
              Applications_Protocol_Blueprint
            </CardTitle>
          </CardHeader>
          <CardContent className="p-16 text-center space-y-8 opacity-40">
            <div className="h-24 w-24 rounded-3xl bg-muted/20 border border-border/20 flex items-center justify-center mx-auto shadow-inner relative group">
              <div className="absolute inset-0 bg-pink-500/5 blur-2xl rounded-full" />
              <FileText className="h-10 w-10 text-muted-foreground relative z-10" />
            </div>
            <div className="space-y-3">
              <p className="text-xl font-black text-foreground uppercase tracking-tight italic">
                Awaiting_Custom_Objects
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed max-w-[250px] mx-auto tracking-widest">
                Real-time application status mapping coming via Twenty CRM
                metadata sync.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatItem({ title, value, icon, color }: any) {
  const colorMap: any = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    turquoise: "text-turquoise-400 bg-turquoise-500/10 border-turquoise-500/20",
    pink: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  };
  return (
    <Card className="bg-card/40 border-border/50 shadow-2xl overflow-hidden group hover:border-indigo-500/30 transition-all border-t-2 border-t-indigo-500/20 rounded-2xl">
      <CardHeader className="p-5 pb-2 border-b border-border/50 bg-background/20 flex flex-row items-center justify-between">
        <CardTitle className="text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-indigo-400 transition-colors">
          {title}
        </CardTitle>
        <div
          className={cn(
            "p-2 rounded-xl border shadow-inner transition-transform group-hover:scale-110",
            colorMap[color]
          )}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-3xl font-black text-foreground tracking-tighter group-hover:translate-x-1 transition-transform origin-left italic">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
