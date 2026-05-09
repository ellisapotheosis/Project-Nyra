'use client';

import React, { useEffect } from 'react';
import { Calculator, Clock, Lock, TrendingUp, WifiOff } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { quoteApi, useApi } from '@/lib/api';
import { StatusGate } from '@/components/status-gate';

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export default function QuotesPage() {
  const loanTypesApi = useApi(quoteApi.getLoanTypes);

  useEffect(() => {
    loanTypesApi.execute();
  }, []);

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Quote Desk</h1>
          <p className="mt-2 text-muted-foreground">
            Rate quoting surface powered by the deterministic Quote API (Python/FastAPI).
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm text-muted-foreground">
          <WifiOff className="size-4 text-amber-300" />
          Real-time rate feed not active. Showing base programs.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calculator className="size-4" />
              Active Quotes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">--</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="size-4" />
              Locked Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">--</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="size-4" />
              Average Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">6.75%</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">--</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Program Availability</CardTitle>
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
                <>
                  {loanTypes.map((product: any) => (
                    <div
                      key={product.type}
                      className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/40 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold">Min Credit: {product.min_credit_score}</p>
                          <p className="text-xs text-muted-foreground">Max LTV: {product.max_ltv}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </StatusGate>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col items-center justify-center p-12 text-center opacity-50">
              <Clock className="h-8 w-8 mb-2" />
              <p className="text-sm">Recent quotes will appear here once generated.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
