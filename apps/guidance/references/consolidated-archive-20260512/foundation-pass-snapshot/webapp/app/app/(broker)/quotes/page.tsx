'use client';

import React, { useEffect, useState } from 'react';
import { Bot, Calculator, CheckCircle2, ServerCog, XCircle } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { ComplianceBadge } from "@/components/status/compliance-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { quoteApi, crmApi, useApi, type LoanType } from '@/lib/api';
import { StatusGate } from '@/components/status-gate';
import { QuoteRequestForm } from '@/components/quotes/quote-request-form';
import { QuoteComparisonGrid } from '@/components/quotes/quote-comparison-grid';

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
    <div className="space-y-8 p-8 max-w-7xl mx-auto min-h-screen">
      <PageHeader
        eyebrow="Broker_Services"
        title="Deterministic Quote Requests"
        description="Scenario inputs are processed by the Quote Engine. Payment calculations and approval state stay service-owned for total auditability."
        meta={
          <div className="flex gap-2">
            <ComplianceBadge label="API_CALC_SYNC" state="clear" className="bg-turquoise-500/10 text-turquoise-400 border-turquoise-500/20" />
            <ComplianceBadge label="CRM_AUDIT_LOG" state="warning" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />
          </div>
        }
        actions={
          <div className="inline-flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-5 py-2.5 text-[10px] font-black text-indigo-400 backdrop-blur-md shadow-xl uppercase tracking-widest">
            <ServerCog className="size-4 text-turquoise-400 animate-pulse" />
            WORKER_FALLBACK_ACTIVE
          </div>
        }
      />

      {notice && (
        <div
          className={`flex items-center gap-4 rounded-2xl border p-5 text-[10px] font-black uppercase tracking-widest backdrop-blur-xl animate-in fade-in slide-in-from-top-2 shadow-2xl ${
            notice.type === "success"
              ? "border-turquoise-500/30 bg-turquoise-500/10 text-turquoise-400"
              : "border-pink-500/30 bg-pink-500/10 text-pink-400"
          }`}
          role="status"
        >
          {notice.type === "success" ? <CheckCircle2 className="size-5 shadow-[0_0_10px_rgba(20,184,166,0.5)]" /> : <XCircle className="size-5 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />}
          {notice.message}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Left Column: Input Form */}
        <Card className="border-border/50 bg-card/40 backdrop-blur-md lg:col-span-1 shadow-2xl border-t-2 border-t-indigo-500 overflow-hidden">
          <CardHeader className="bg-indigo-500/5 border-b border-border/50">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
               <Calculator className="size-4" /> SCENARIO_PARAMETER_BUFFER
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <QuoteRequestForm
              onSubmit={handleRunComparison}
              isLoading={comparisonApi.isLoading}
            />
          </CardContent>
        </Card>

        {/* Right Column: Comparison Grid */}
        <div className="lg:col-span-2 space-y-10">
          <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-2xl border-t-2 border-t-turquoise-500 overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 border-b border-border/50 bg-turquoise-500/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-turquoise-400">AVAILABLE_PROGRAM_REGISTRY</CardTitle>
              <Badge variant="outline" className="bg-turquoise-500/10 text-turquoise-400 border-turquoise-500/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">LIVE_INGRESS_MATCH</Badge>
            </CardHeader>
            <CardContent className="pt-6">
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
                        className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all cursor-default shadow-inner"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-black text-foreground uppercase tracking-tight group-hover:text-indigo-400 transition-colors truncate">{product.name}</p>
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">MAX_{product.max_ltv}%_LTV</p>
                        </div>
                        <div className="h-1.5 w-1.5 rounded-full bg-turquoise-500 shrink-0 ml-3 shadow-[0_0_8px_rgba(20,184,166,1)]" />
                      </div>
                    ))}
                  </div>
                )}
              </StatusGate>
            </CardContent>
          </Card>

          {!comparisonApi.data && !comparisonApi.isLoading && (
            <Card className="flex-1 border-dashed border-indigo-500/20 bg-indigo-500/5 min-h-[360px] flex flex-col justify-center items-center rounded-3xl shadow-inner">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-8">
                <div className="h-24 w-24 rounded-[32px] bg-background/50 border border-indigo-500/20 flex items-center justify-center shadow-2xl relative">
                   <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-full" />
                  <Calculator className="h-12 w-12 text-indigo-400 relative z-10" />
                </div>
                <div>
                  <p className="text-xl font-black text-foreground uppercase tracking-tight">Ready for PRICING_ENGINE</p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-3 max-w-sm uppercase tracking-widest leading-relaxed opacity-60">Submit the scenario form to request service-owned comparisons from the 5090 worker node.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {comparisonApi.isLoading && (
            <Card className="flex-1 border-indigo-500/30 bg-card/60 min-h-[360px] flex flex-col justify-center items-center rounded-3xl shadow-2xl border-t-2 border-t-indigo-500">
              <CardContent className="flex flex-col items-center justify-center p-12 space-y-10">
                <div className="relative">
                  <div className="h-28 w-28 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                  <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-10 text-turquoise-400 animate-pulse shadow-[0_0_20px_rgba(20,184,166,0.4)]" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-foreground uppercase tracking-tight">ORCHESTRATING_SCENARIO...</p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-3 uppercase tracking-widest opacity-60">Awaiting deterministic response from high-fidelity reasoning layer.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {comparisonApi.data && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
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
