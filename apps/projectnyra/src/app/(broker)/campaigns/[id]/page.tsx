"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { PageHeader } from "@nyra/ui";
import { ComplianceBadge } from "@nyra/ui";
import { StatusBadge } from "@nyra/ui";
import { StatusGate } from "@nyra/ui";
import { Button } from "@nyra/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nyra/ui";
import { campaignApi, useApi } from "@/lib/api";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const campaignRequest = useApi(() => campaignApi.getCampaign(id));

  React.useEffect(() => {
    campaignRequest.execute();
  }, [id]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <PageHeader
        eyebrow="Campaign Detail"
        title={`Campaign ${id}`}
        description="Template, guardrails, enrollment posture, and execution notes. Runtime state remains owned by the campaign engine."
        meta={
          <>
            <ComplianceBadge label="STOP_CHECK" state="clear" />
            <ComplianceBadge label="REPLY_PAUSE" state="clear" />
            <ComplianceBadge label="QUIET_HOURS" state="warning" />
          </>
        }
        actions={
          <Link href="/campaigns">
            <Button variant="outline">
              <ArrowLeft className="mr-2 size-4" />
              Campaigns
            </Button>
          </Link>
        }
      />

      <StatusGate
        data={campaignRequest.data ?? null}
        error={campaignRequest.error}
        isLoading={campaignRequest.isLoading}
        onRetry={campaignRequest.execute}
        loadingMessage="Loading campaign template..."
        emptyMessage="Campaign was not found."
      >
        {(campaign) => {
          const steps = Array.isArray(campaign.steps) ? campaign.steps : [];
          return (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Card className="border-border/50 bg-card/40">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <StatusBadge
                        status={campaign.active ? "ACTIVE" : "DRAFT"}
                      />
                      <CardTitle className="mt-4 text-2xl font-black uppercase tracking-tight">
                        {campaign.name}
                      </CardTitle>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {campaign.description ||
                          "No description has been provided."}
                      </p>
                    </div>
                    <ShieldCheck className="size-8 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {steps.length ? (
                    steps.map((step: any, index: number) => (
                      <StepRow
                        key={step.id || index}
                        step={step}
                        index={index}
                      />
                    ))
                  ) : (
                    <p className="rounded-lg border border-border/60 bg-background/45 p-4 text-sm text-muted-foreground">
                      No steps returned by the campaign service yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/40">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest">
                    Execution Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Metric
                    label="Loan purpose"
                    value={campaign.loanPurpose || "Any"}
                  />
                  <Metric label="Step count" value={steps.length} />
                  <Metric
                    label="Persistence"
                    value={
                      (campaign as any).source === "mock"
                        ? "Mock gated"
                        : "Service"
                    }
                  />
                </CardContent>
              </Card>
            </div>
          );
        }}
      </StatusGate>
    </div>
  );
}

function StepRow({ step, index }: { step: any; index: number }) {
  const Icon =
    step.type === "email"
      ? Mail
      : step.type === "voice_call"
        ? Phone
        : step.type === "wait"
          ? Clock
          : MessageSquare;
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border/60 bg-background/45 p-4">
      <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black uppercase tracking-tight text-foreground">
          Step {index + 1}: {step.label || step.type || "Campaign step"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {step.delayHours ?? 0} hour delay
        </p>
      </div>
      <StatusBadge status={step.type || "step"} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/45 p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
