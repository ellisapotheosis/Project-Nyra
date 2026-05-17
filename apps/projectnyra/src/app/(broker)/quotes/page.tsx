"use client";

import React, { useEffect, useState } from "react";
import { Calculator, CheckCircle2, WifiOff, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { quoteApi, crmApi, useApi, type LoanType } from "@/lib/api";
import { StatusGate } from "@/components/status-gate";
import { QuoteRequestForm } from "@/components/quotes/quote-request-form";
import { QuoteComparisonGrid } from "@/components/quotes/quote-comparison-grid";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

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

  const handleRunComparison = (data: any) => {
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
    <div className="space-y-6 p-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Quote Desk
          </h1>
          <p className="mt-2 text-slate-500">
            Deterministic Rate Comparison Engine
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 font-medium">
          <WifiOff className="size-4" />
          Offline Mode: Using base program parameters
        </div>
      </div>
      {notice && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-primary/30 bg-primary/10 text-foreground"
              : "border-destructive/30 bg-destructive/10 text-foreground"
          }`}
          role="status"
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="size-4 text-primary" />
          ) : (
            <XCircle className="size-4 text-destructive" />
          )}
          {notice.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Input Form */}
        <Card className="border-l-4 border-l-blue-600 shadow-md lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">
              Scenario Input
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuoteRequestForm
              onSubmit={handleRunComparison}
              isLoading={comparisonApi.isLoading}
            />
          </CardContent>
        </Card>

        {/* Right Column: Comparison Grid */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Available Programs
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-500 border-slate-200 text-[10px]"
              >
                REAL-TIME
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatusGate
                data={loanTypesApi.data?.loan_types ?? null}
                error={loanTypesApi.error}
                isLoading={loanTypesApi.isLoading}
                onRetry={loanTypesApi.execute}
                loadingMessage="Fetching loan types..."
                emptyMessage="No loan programs found."
              >
                {(loanTypes) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {loanTypes.map((product: any) => (
                      <div
                        key={product.type}
                        className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Max {product.max_ltv}% LTV
                          </p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      </div>
                    ))}
                  </div>
                )}
              </StatusGate>
            </CardContent>
          </Card>

          {!comparisonApi.data && !comparisonApi.isLoading && (
            <Card className="flex-1 bg-slate-50/50 border-dashed border-2">
              <CardContent>
                <div className="flex flex-col items-center justify-center p-24 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <Calculator className="h-8 w-8 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      Ready for Calculation
                    </p>
                    <p className="text-sm text-slate-500">
                      Submit the scenario form to generate comparisons
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {comparisonApi.isLoading && (
            <Card className="flex-1">
              <CardContent>
                <div className="flex flex-col items-center justify-center p-24 space-y-6">
                  <div className="h-16 w-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin shadow-inner" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">
                      Analyzing loan programs...
                    </p>
                    <p className="text-sm text-slate-500 mt-1 italic">
                      Executing deterministic mortgage math in Python backend
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {comparisonApi.data && (
            <QuoteComparisonGrid
              data={comparisonApi.data}
              onApprove={handleApprove}
              isApproving={approveApi.isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
