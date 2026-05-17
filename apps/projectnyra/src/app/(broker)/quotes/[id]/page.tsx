"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";

import { PageHeader } from "@nyra/ui";
import { QuoteConfidenceRibbon } from "@/components/quotes/quote-confidence-ribbon";
import { ComplianceBadge } from "@nyra/ui";
import { StatusBadge } from "@nyra/ui";
import { StatusGate } from "@nyra/ui";
import { Button } from "@nyra/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui";
import { crmApi, useApi } from "@/lib/api";

type QuotePayload = {
  quote?: {
    id: string;
    status?: string;
    leadId?: string;
    expiresAt?: string;
    options?: Array<{
      id?: string;
      label: string;
      rate?: number;
      apr?: number;
      points?: number;
    }>;
  };
};

export default function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [quotePayload, setQuotePayload] = React.useState<QuotePayload | null>(
    null
  );
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const approveApi = useApi(crmApi.approveQuote);

  const loadQuote = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/quotes/${id}`, { cache: "no-store" });
      if (!response.ok)
        throw new Error(`Quote request failed: ${response.status}`);
      setQuotePayload((await response.json()) as QuotePayload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError
          : new Error(String(requestError))
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  const quote = quotePayload?.quote;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <PageHeader
        eyebrow="Quote Detail"
        title={`Quote ${id}`}
        description="Broker approval, assumptions, expiration, and CRM sync state for a deterministic quote artifact."
        meta={
          <>
            <ComplianceBadge label="BROKER_APPROVAL_REQUIRED" state="warning" />
            <ComplianceBadge label="NO_ASSISTANT_PRICING" state="clear" />
          </>
        }
        actions={
          <Link href="/quotes">
            <Button variant="outline">
              <ArrowLeft className="mr-2 size-4" />
              Quote Desk
            </Button>
          </Link>
        }
      />

      <QuoteConfidenceRibbon source="provider" />

      <StatusGate
        data={quote ?? null}
        error={error}
        isLoading={isLoading}
        onRetry={loadQuote}
        loadingMessage="Loading quote artifact..."
        emptyMessage="Quote was not found."
      >
        {(currentQuote) => (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <Card className="border-border/50 bg-card/40">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <StatusBadge status={currentQuote.status || "PENDING"} />
                    <CardTitle className="mt-4 text-2xl font-black uppercase tracking-tight">
                      Pricing Options
                    </CardTitle>
                  </div>
                  <FileText className="size-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(currentQuote.options || []).map((option) => (
                  <div
                    key={option.id || option.label}
                    className="rounded-lg border border-border/60 bg-background/45 p-4"
                  >
                    <p className="text-sm font-black uppercase tracking-tight text-foreground">
                      {option.label}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <Metric
                        label="Rate"
                        value={
                          option.rate === undefined
                            ? "Service"
                            : `${option.rate}%`
                        }
                      />
                      <Metric
                        label="APR"
                        value={
                          option.apr === undefined
                            ? "Service"
                            : `${option.apr}%`
                        }
                      />
                      <Metric
                        label="Points"
                        value={option.points ?? "Service"}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/40">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest">
                  Approval Gate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Metric
                  label="Lead"
                  value={currentQuote.leadId || "CRM-linked"}
                />
                <Metric
                  label="Expiration"
                  value={
                    currentQuote.expiresAt
                      ? new Date(currentQuote.expiresAt).toLocaleString()
                      : "Service-defined"
                  }
                />
                <Button
                  className="w-full"
                  disabled={
                    approveApi.isLoading || currentQuote.status === "APPROVED"
                  }
                  onClick={() =>
                    approveApi.execute(id, "SYSTEM_BROKER").then(loadQuote)
                  }
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Approve Through CRM
                </Button>
                <div className="rounded-lg border border-border/60 bg-background/45 p-4 text-xs leading-relaxed text-muted-foreground">
                  Quotes stay blocked from borrower delivery until broker
                  approval routes through CRM API and audit logging.
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </StatusGate>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/45 p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
