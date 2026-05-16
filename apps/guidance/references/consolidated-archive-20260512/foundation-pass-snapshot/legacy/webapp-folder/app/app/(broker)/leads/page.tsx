'use client';

import React, { useEffect } from 'react';
import { Mail, MapPin, Phone, Star } from "lucide-react"
import Link from "next/link"

import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { crmApi, useApi } from '@/lib/api';
import { StatusGate } from '@/components/status-gate';
import { StatusBadge } from "@/components/status/status-badge"
import { ComplianceBadge } from "@/components/status/compliance-badge"
import { cn } from "@/lib/utils"

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export default function LeadsPage() {
  const leadsApi = useApi(crmApi.getLeads);

  useEffect(() => {
    leadsApi.execute();
  }, []);

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto min-h-screen">
      <PageHeader
        eyebrow="Registry_Ingress"
        title="Lead Work Queue"
        description="Twenty-backed lead registry with campaign state, quote readiness, and compliance sentinel active."
        meta={
          <div className="flex gap-2">
             <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black text-[10px]">SOURCE: TWENTY_CRM</Badge>
             <Badge className="bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest">REALTIME_SYNC</Badge>
          </div>
        }
        actions={
          <Button className="bg-primary hover:bg-primary/80 text-white font-black uppercase tracking-widest text-[10px] rounded-lg h-10 px-6 shadow-lg shadow-primary/20">
            <Star className="mr-2 h-3.5 w-3.5" />
            CREATE_NEW_ENTRY
          </Button>
        }
      />

      <StatusGate
        data={leadsApi.data?.leads ?? null}
        error={leadsApi.error}
        isLoading={leadsApi.isLoading}
        onRetry={leadsApi.execute}
        loadingMessage="SYNCING_CRM_STATE..."
        emptyMessage="No records found in foundation registry."
      >
        {(leads) => {
          const qualifiedCount = leads.filter((lead: any) => lead.stage === "Qualified").length;
          const totalLoanAmount = leads.reduce((sum: number, lead: any) => sum + (lead.loanAmount || 0), 0);
          const averageLoan = leads.length > 0 ? Math.round(totalLoanAmount / leads.length) : 0;

          return (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <StatCard title="Active Records" value={leads.length} color="primary" />
                <StatCard title="Qualified Index" value={qualifiedCount} color="success" />
                <StatCard title="Avg. Pipeline" value={currency(averageLoan / 10000)} color="primary" />
              </div>

              <div className="grid gap-4 mt-10">
                {leads.map((lead: any) => (
                  <Link key={lead.id} href={`/leads/${lead.id}`}>
                    <Card className="bg-card/40 backdrop-blur-md border border-border/50 shadow-xl hover:border-primary/30 transition-all group overflow-hidden border-l-4 border-l-primary">
                      <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-8">
                          <div className="flex size-16 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-xl font-black text-primary shadow-inner group-hover:scale-105 transition-transform">
                            {(lead.firstName?.[0] || lead.name?.[0] || '?')}
                            {lead.lastName?.[0] || ''}
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xl font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                                {lead.firstName ? `${lead.firstName} ${lead.lastName}` : (lead.name || 'Unknown Lead')}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black">{lead.loanPurpose || "GENERAL"}</Badge>
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{currency((lead.loanAmount || 0) / 10000)}</span>
                                <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[9px] font-black uppercase">{lead.stage || "NEW"}</Badge>
                                <ComplianceBadge
                                  label={lead.onDncList ? "DNC_ACTIVE" : lead.hasConsent === false ? "NO_CONSENT" : "GATE_CLEAR"}
                                  state={lead.onDncList || lead.hasConsent === false ? "blocked" : "clear"}
                                />
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-5 text-[10px] font-bold text-muted-foreground pt-1 uppercase tracking-wider">
                              {lead.email && (
                                <span className="inline-flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                                  <Mail className="size-3 text-primary" />
                                  {lead.email}
                                </span>
                              )}
                              {lead.phone && (
                                <span className="inline-flex items-center gap-2 hover:text-emerald-300 transition-colors cursor-pointer">
                                  <Phone className="size-3 text-emerald-300" />
                                  {lead.phone}
                                </span>
                              )}
                              {lead.location && (
                                <span className="inline-flex items-center gap-2">
                                  <MapPin className="size-3 text-destructive" />
                                  {lead.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-3 text-[10px] lg:text-right">
                          {lead.creditBand && (
                            <div className="inline-flex items-center gap-2 lg:justify-end text-emerald-300 font-black tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <Star className="size-3 fill-emerald-300" />
                              <span>{lead.creditBand.toUpperCase()} CREDIT</span>
                            </div>
                          )}
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Active_Campaign</p>
                            <p className="text-foreground font-black text-xs">{lead.campaignId || 'MANUAL_ORCHESTRATION'}</p>
                          </div>
                          <div className="flex items-center gap-2 lg:justify-end font-black text-muted-foreground uppercase tracking-widest">
                             SOURCE_ID: <span className="text-primary">{lead.source || 'ROOT_INGRESS'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          );
        }}
      </StatusGate>
    </div>
  )
}

function StatCard({ title, value, color }: any) {
  const colorMap: any = {
    primary: "text-primary border-t-primary",
    success: "text-emerald-300 border-t-emerald-500",
  };
  return (
    <Card className={cn("bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl border-t-2 overflow-hidden group hover:border-primary/30 transition-all", colorMap[color])}>
      <CardHeader className="pb-2 bg-background/20 border-b border-border/50">
        <CardTitle className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-4xl font-black text-foreground tracking-tighter group-hover:scale-105 transition-transform origin-left">{value}</p>
      </CardContent>
    </Card>
  );
}
