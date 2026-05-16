'use client';

import React, { useEffect, useState } from 'react';
import {
  Bot, Calculator, CheckCircle2, ServerCog,
  XCircle, Lock, TrendingUp, Clock,
  ChevronRight, RefreshCcw, FileText, Zap
} from "lucide-react"

import { PageHeader } from "@nyra/ui"
import { ComplianceBadge } from "@nyra/ui"
import {
  Badge, Button, Card, CardContent,
  CardHeader, CardTitle, CardDescription
} from "@nyra/ui"
import { quoteApi, crmApi, useApi, type LoanType } from '@/lib/api';
import { StatusGate } from '@nyra/ui';
import { QuoteRequestForm } from '@/components/quotes/quote-request-form';
import { QuoteComparisonGrid } from '@/components/quotes/quote-comparison-grid';
import { cn } from "@/lib/utils";

export default function QuotesPage() {
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const loanTypesApi = useApi(quoteApi.getLoanTypes);
  const comparisonApi = useApi(quoteApi.compareLoanTypes);
  const approveApi = useApi(crmApi.approveQuote);

  useEffect(() => {
    loanTypesApi.execute();
  }, []);

  const handleRunComparison = (data: any) => {
    setNotice(null)
    comparisonApi.execute(data);
  };

  const handleApprove = async (loanType: LoanType) => {
    const result = comparisonApi.data?.comparison[loanType];
    if (result?.quote_id) {
      try {
        await approveApi.execute(result.quote_id, "SYSTEM_BROKER");
        setNotice({ type: "success", message: `PROTOCOL_LOG: Quote ${result.quote_id} (${loanType}) approved and synced to CRM.` })
      } catch (error) {
        console.error("Approval failed:", error);
        setNotice({ type: "error", message: "GATEWAY_ERROR: Quote approval failed. Retry later." })
      }
    }
  };

  return (
    <div className="space-y-12 p-8 max-w-[1600px] mx-auto min-h-screen">
      <PageHeader
        eyebrow="Pricing_Operations"
        title="Deterministic Quote Engine"
        description="Scenario parameters are processed via primary reasoning shards. Logic stay service-owned for total auditability."
        meta={
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-black text-[10px] uppercase tracking-widest px-4 py-1">API_CALC: SYNCED</Badge>
            <Badge className="bg-turquoise-500 text-black font-black text-[10px] uppercase tracking-widest px-4 py-1">CRM_AUDIT: ENABLED</Badge>
          </div>
        }
        actions={
          <div className="inline-flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-6 py-2.5 text-[10px] font-black text-indigo-400 backdrop-blur-md shadow-xl uppercase tracking-widest">
            <ServerCog className="size-4 text-turquoise-400 animate-pulse" />
            WORKER_FALLBACK_ACTIVE
          </div>
        }
      />

      {notice && (
        <div
          className={cn("flex items-center gap-4 rounded-[24px] border p-6 text-[10px] font-black uppercase tracking-widest backdrop-blur-xl animate-in fade-in slide-in-from-top-2 shadow-2xl",
            notice.type === "success" ? "border-turquoise-500/30 bg-turquoise-500/10 text-turquoise-400" : "border-pink-500/30 bg-pink-500/10 text-pink-400"
          )}
          role="status"
        >
          {notice.type === "success" ? <CheckCircle2 className="size-5 shadow-[0_0_10px_rgba(20,184,166,0.5)]" /> : <XCircle className="size-5 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />}
          {notice.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <StatCard title="Active_Quotes" value="12" color="indigo" icon={Calculator} detail="AWAITING_LOCK" />
        <StatCard title="Locked_Rates" value="5" color="turquoise" icon={Lock} detail="SYNCED_TO_LOS" />
        <StatCard title="Avg_Market_Rate" value="6.875%" color="indigo" icon={TrendingUp} detail="30Y_FIXED_AVG" />
        <StatCard title="Expiring_Soon" value="2" color="pink" icon={Clock} detail="WITHIN_7_DAYS" />
      </div>

      <div className="grid gap-12 lg:grid-cols-[400px_1fr]">
        {/* Left Column: Input Form */}
        <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-2xl border-t-2 border-t-indigo-500 overflow-hidden rounded-[32px] h-fit">
          <CardHeader className="bg-indigo-500/5 border-b border-border/50 p-8">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-3">
               <Calculator className="size-4" /> SCENARIO_BUFFER
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <QuoteRequestForm
              onSubmit={handleRunComparison}
              isLoading={comparisonApi.isLoading}
            />
          </CardContent>
        </Card>

        {/* Right Column: Comparison Grid */}
        <div className="space-y-12">
          <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-2xl border-t-2 border-t-turquoise-500 overflow-hidden rounded-[32px]">
            <CardHeader className="p-8 pb-3 flex flex-row items-center justify-between border-b border-border/50 bg-turquoise-500/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-turquoise-400">PROGRAM_REGISTRY_INGRESS</CardTitle>
              <Badge variant="outline" className="bg-turquoise-500/10 text-turquoise-400 border-turquoise-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">LIVE_MATCH</Badge>
            </CardHeader>
            <CardContent className="p-8">
              <StatusGate
                data={loanTypesApi.data?.loan_types ?? null}
                error={loanTypesApi.error}
                isLoading={loanTypesApi.isLoading}
                onRetry={loanTypesApi.execute}
                loadingMessage="QUERYING_WORKER_NODES..."
                emptyMessage="No loan programs found in logic-scaffold."
              >
                {(loanTypes) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {loanTypes.map((product: any) => (
                      <div
                        key={product.type}
                        className="p-5 rounded-2xl border border-indigo-500/10 bg-background/40 flex items-center justify-between group hover:border-indigo-500/30 transition-all cursor-default shadow-inner"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-black text-foreground uppercase tracking-tight group-hover:text-indigo-400 transition-colors truncate">{product.name}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">MAX_{product.max_ltv}%_LTV</p>
                        </div>
                        <div className="size-1.5 rounded-full bg-turquoise-500 shrink-0 ml-4 shadow-[0_0_8px_rgba(20,184,166,1)]" />
                      </div>
                    ))}
                  </div>
                )}
              </StatusGate>
            </CardContent>
          </Card>

          {!comparisonApi.data && !comparisonApi.isLoading && (
            <Card className="flex-1 border-dashed border-indigo-500/20 bg-indigo-500/5 min-h-[460px] flex flex-col justify-center items-center rounded-[48px] shadow-inner">
              <CardContent className="flex flex-col items-center justify-center p-20 text-center space-y-8">
                <div className="h-28 w-28 rounded-[36px] bg-background/50 border border-indigo-500/20 flex items-center justify-center shadow-2xl relative">
                   <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full" />
                  <Calculator className="h-14 w-14 text-indigo-400 relative z-10" />
                </div>
                <div className="space-y-3">
                  <p className="text-2xl font-black text-foreground uppercase tracking-tight italic">Awaiting_Scenario_Dispatch</p>
                  <p className="text-[10px] font-bold text-muted-foreground max-w-sm uppercase tracking-widest leading-relaxed opacity-60 mx-auto">Submit the parameter buffer to request service-owned comparisons from the reasoning cluster.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {comparisonApi.isLoading && (
            <Card className="flex-1 border-indigo-500/30 bg-card/60 min-h-[460px] flex flex-col justify-center items-center rounded-[48px] shadow-2xl border-t-2 border-t-indigo-500">
              <CardContent className="flex flex-col items-center justify-center p-20 space-y-12">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                  <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-12 text-turquoise-400 animate-pulse shadow-[0_0_30px_rgba(20,184,166,0.4)]" />
                </div>
                <div className="text-center space-y-3">
                  <p className="text-2xl font-black text-foreground uppercase tracking-tight italic">Orchestrating_Pricing...</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Awaiting deterministic response from RTX_5090 inference shard.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {comparisonApi.data && (
            <div className="animate-in fade-in zoom-in-95 duration-700">
              <QuoteComparisonGrid
                data={comparisonApi.data}
                onApprove={handleApprove}
                isApproving={approveApi.isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, detail }: any) {
  const colorMap: any = {
    indigo: "text-indigo-400 border-t-indigo-500",
    turquoise: "text-turquoise-400 border-t-turquoise-400",
    pink: "text-pink-400 border-t-pink-500"
  };
  return (
    <Card className={cn("bg-card/40 backdrop-blur-md border border-border/50 shadow-2xl border-t-2 overflow-hidden group hover:border-indigo-500/30 transition-all rounded-[24px]", colorMap[color])}>
      <CardHeader className="p-6 pb-2 bg-background/20 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">{title}</CardTitle>
        <div className={cn("p-2 rounded-xl border shadow-inner transition-transform group-hover:scale-110",
          color === "indigo" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
          color === "turquoise" ? "bg-turquoise-500/10 border-turquoise-500/20 text-turquoise-400" :
          "bg-pink-500/10 border-pink-500/20 text-pink-400"
        )}>
           <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <p className="text-4xl font-black text-foreground tracking-tighter group-hover:translate-x-1 transition-transform italic">{value}</p>
        <p className="mt-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">{detail}</p>
      </CardContent>
    </Card>
  );
}
