"use client";

import React, { useEffect, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  WifiOff,
  XCircle,
  CreditCard,
  History,
  Lock,
  Zap,
  TrendingUp,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  Clock,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  quoteApi,
  crmApi,
  useApi,
  type LoanType,
  type QuoteRequest,
} from "@/lib/api";
import type { LoanTypeInfo } from "@/lib/api/quotes";
import { StatusGate } from "@/components/status-gate";
import { QuoteRequestForm } from "@/components/quotes/quote-request-form";
import { QuoteComparisonGrid } from "@/components/quotes/quote-comparison-grid";
import { cn } from "@/lib/utils";

export default function QuotesPage() {
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const loanTypesApi = useApi(quoteApi.getLoanTypes);
  const comparisonApi = useApi(quoteApi.compareLoanTypes);
  const approveApi = useApi(crmApi.approveQuote);

  useEffect(() => {
    loanTypesApi.execute();
  }, []);

  const handleRunComparison = (data: QuoteRequest) => {
    setNotice(null);
    comparisonApi.execute(data);
  };

  const handleApprove = async (loanType: LoanType) => {
    const result = comparisonApi.data?.comparison[loanType];
    if (result?.quote_id) {
      try {
        await approveApi.execute(result.quote_id, "SYSTEM_BROKER");
        setNotice({
          type: "success",
          message: `Quote ${result.quote_id} (${loanType}) approved and synced to CRM.`,
        });
      } catch (error) {
        console.error("Approval failed:", error);
        setNotice({
          type: "error",
          message: "Quote approval failed. Please try again.",
        });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground antialiased p-6 lg:p-10">
      {/* Page Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_-5px_rgba(var(--indigo-rgb),0.3)]">
              <Calculator className="size-5" />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quote Desk</h1>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                Deterministic Rate Comparison Engine
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/40 px-3 py-1.5 shadow-sm">
            <ShieldCheck className="size-3.5 text-turquoise-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Soft-Pull Active
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-pink-500/20 bg-pink-500/5 px-3 py-1.5 shadow-sm">
            <Lock className="size-3.5 text-pink-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
              Lock Window: 30D
            </span>
          </div>
          <Badge
            variant="outline"
            className="border-indigo-500/30 bg-indigo-500/5 text-indigo-400 gap-2 h-8 px-3"
          >
            <TrendingUp className="size-3.5" />
            Live Market Feed
          </Badge>
        </div>
      </div>

      {notice && (
        <div
          className={cn(
            "mb-8 flex items-center gap-3 rounded-xl border p-4 text-sm shadow-lg animate-in fade-in slide-in-from-top-2",
            notice.type === "success"
              ? "border-turquoise-500/30 bg-turquoise-500/5 text-turquoise-400"
              : "border-pink-500/30 bg-pink-500/5 text-pink-400"
          )}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="size-5" />
          ) : (
            <XCircle className="size-5" />
          )}
          <span className="font-semibold">{notice.message}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* Left Column: Input Form */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-card/40 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-indigo-400 to-transparent" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                Scenario Architect
              </CardTitle>
              <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                Configure lead parameters
              </p>
            </CardHeader>
            <CardContent>
              <QuoteRequestForm
                onSubmit={handleRunComparison}
                isLoading={comparisonApi.isLoading}
              />
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/20 p-5 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
              Market Sentinel
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  30Y Fixed (Avg)
                </span>
                <span className="text-xs font-bold text-foreground">
                  6.875%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  10Y Treasury
                </span>
                <span className="text-xs font-bold text-pink-400">
                  4.42% (+0.05)
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Comparison Grid */}
        <div className="space-y-6">
          {/* Program Quick-View */}
          <Card className="border-border/40 bg-card/40">
            <CardHeader className="pb-3 border-b border-border/20 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  Active Underwriting Envelopes
                </CardTitle>
                <div className="flex items-center gap-1">
                  <div className="size-1.5 rounded-full bg-turquoise-400 shadow-[0_0_8px_rgba(var(--turquoise-rgb),0.6)] animate-pulse" />
                  <span className="text-[9px] font-bold text-turquoise-400/80 uppercase">
                    Streaming
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <StatusGate
                data={loanTypesApi.data?.loan_types ?? null}
                error={loanTypesApi.error}
                isLoading={loanTypesApi.isLoading}
                onRetry={loanTypesApi.execute}
              >
                {(loanTypes) => (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {loanTypes.map((product: LoanTypeInfo) => (
                      <div
                        key={product.type}
                        className="p-3 rounded-xl border border-border/30 bg-background/40 hover:border-indigo-500/40 hover:bg-background/60 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[11px] font-bold text-foreground group-hover:text-indigo-400 transition-colors">
                            {product.name}
                          </p>
                          <Zap className="size-3 text-amber-400/50" />
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          Max {product.max_ltv}% LTV
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </StatusGate>
            </CardContent>
          </Card>

          {/* Results Surface */}
          <div className="min-h-[500px] flex flex-col">
            {!comparisonApi.data && !comparisonApi.isLoading && (
              <div className="flex-1 rounded-3xl border-2 border-dashed border-border/40 bg-card/10 flex flex-col items-center justify-center p-20 text-center space-y-6 group hover:border-indigo-500/20 transition-colors">
                <div className="relative">
                  <div className="size-20 rounded-full bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <History className="size-10 text-muted-foreground/30" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-2 bg-background border border-border/40 rounded-xl shadow-xl">
                    <Clock className="size-4 text-indigo-400" />
                  </div>
                </div>
                <div className="max-w-xs">
                  <h3 className="text-xl font-bold tracking-tight mb-2">
                    Awaiting Parameters
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Submit a scenario in the architect panel to generate
                    deterministic mortgage pricing comparisons.
                  </p>
                </div>
              </div>
            )}

            {comparisonApi.isLoading && (
              <div className="flex-1 rounded-3xl border border-border/40 bg-card/20 flex flex-col items-center justify-center p-20 space-y-8">
                <div className="relative">
                  <div className="size-20 rounded-full border-[3px] border-indigo-500/10 border-t-indigo-500 animate-spin shadow-[0_0_40px_-10px_rgba(var(--indigo-rgb),0.5)]" />
                  <Calculator className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 text-indigo-400/50" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold tracking-tight">
                    Compiling Scenarios
                  </p>
                  <p className="text-sm text-muted-foreground italic max-w-sm mx-auto font-medium">
                    Executing precision mortgage math across primary and
                    secondary market overlays...
                  </p>
                </div>
              </div>
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
    </div>
  );
}
