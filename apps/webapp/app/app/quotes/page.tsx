'use client';

import React, { useEffect } from 'react';
import { Calculator, Clock, Lock, TrendingUp, WifiOff, CheckCircle2, AlertCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { quoteApi, useApi } from '@/lib/api';
import { StatusGate } from '@/components/status-gate';
import { QuoteRequestForm } from '@/components/quotes/quote-request-form';

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export default function QuotesPage() {
  const loanTypesApi = useApi(quoteApi.getLoanTypes);
  const comparisonApi = useApi(quoteApi.compareLoanTypes);

  useEffect(() => {
    loanTypesApi.execute();
  }, []);

  const handleRunComparison = (data: any) => {
    comparisonApi.execute(data);
  };

  return (
    <div className="space-y-6 p-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quote Desk</h1>
          <p className="mt-2 text-muted-foreground">
            Deterministic Rate Comparison Engine
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 font-medium">
          <WifiOff className="size-4" />
          Offline Mode: Using base program parameters
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Input Form */}
        <Card className="border-l-4 border-l-blue-600 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Scenario Input</CardTitle>
          </CardHeader>
          <CardContent>
            <QuoteRequestForm 
              onSubmit={handleRunComparison} 
              isLoading={comparisonApi.isLoading} 
            />
          </CardContent>
        </Card>

        {/* Right Column: Program Status & Recent Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Available Programs</CardTitle>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {loanTypes.map((product: any) => (
                      <div
                        key={product.type}
                        className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">{product.name}</p>
                          <p className="text-[10px] text-slate-500">Max {product.max_ltv}% LTV</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 text-[10px]">
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </StatusGate>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Engine Output</CardTitle>
            </CardHeader>
            <CardContent>
              {!comparisonApi.data && !comparisonApi.isLoading && (
                <div className="flex flex-col items-center justify-center p-12 text-center opacity-50 space-y-4">
                  <Calculator className="h-12 w-12 text-slate-300" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Ready for Calculation</p>
                    <p className="text-xs text-slate-500">Submit the scenario form to see comparisons</p>
                  </div>
                </div>
              )}

              {comparisonApi.isLoading && (
                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                  <div className="h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-600">Analyzing loan programs...</p>
                </div>
              )}

              {comparisonApi.data && (
                <div className="space-y-4">
                  {Object.entries(comparisonApi.data.comparison).map(([type, result]: [any, any]) => (
                    <div 
                      key={type} 
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        result.available ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          result.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {result.available ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 uppercase">{type}</p>
                          <p className="text-xs text-slate-500">
                            {result.available ? 'Qualification Met' : result.error || 'Does not meet guidelines'}
                          </p>
                        </div>
                      </div>
                      {result.available && (
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">{currency(result.monthly_payment)}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Monthly PITI</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
