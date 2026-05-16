"use client";

import React from "react";
import {
  AlertTriangle,
  Bell,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  PhoneMissed,
  Plus,
  Save,
  ShieldCheck,
  Split,
  StickyNote,
  Webhook,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ComplianceBadge } from "@/components/status/compliance-badge";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { campaignApi } from "@/lib/api";

type CampaignStepType =
  | "sms"
  | "email"
  | "voice_call"
  | "voicemail_drop"
  | "missed_call_ping"
  | "broker_task"
  | "broker_alert"
  | "wait"
  | "condition"
  | "quote_reminder"
  | "document_request"
  | "crm_update"
  | "webhook";

type GuardrailNode =
  | "check_sms_consent"
  | "check_email_consent"
  | "check_voice_consent"
  | "check_dnc"
  | "check_quiet_hours"
  | "check_stop_suppression"
  | "check_reply_pause"
  | "check_content_compliance"
  | "require_broker_approval";

type BuilderStep = {
  id: string;
  type: CampaignStepType;
  label: string;
  delayHours: number;
  guardrails: GuardrailNode[];
};

const stepCatalog: Array<{ type: CampaignStepType; label: string; icon: React.ElementType }> = [
  { type: "sms", label: "SMS", icon: MessageSquare },
  { type: "email", label: "Email", icon: Mail },
  { type: "voice_call", label: "Call", icon: Phone },
  { type: "voicemail_drop", label: "Voicemail", icon: PhoneMissed },
  { type: "missed_call_ping", label: "Missed-call ping", icon: PhoneMissed },
  { type: "broker_task", label: "Broker task", icon: StickyNote },
  { type: "broker_alert", label: "Broker alert", icon: Bell },
  { type: "wait", label: "Wait", icon: Clock },
  { type: "condition", label: "Condition", icon: Split },
  { type: "quote_reminder", label: "Quote reminder", icon: FileText },
  { type: "document_request", label: "Document request", icon: FileText },
  { type: "crm_update", label: "CRM update", icon: ShieldCheck },
  { type: "webhook", label: "Webhook", icon: Webhook },
];

const channelGuardrails: Record<CampaignStepType, GuardrailNode[]> = {
  sms: ["check_sms_consent", "check_dnc", "check_quiet_hours", "check_stop_suppression", "check_reply_pause", "check_content_compliance"],
  email: ["check_email_consent", "check_dnc", "check_stop_suppression", "check_reply_pause", "check_content_compliance"],
  voice_call: ["check_voice_consent", "check_dnc", "check_quiet_hours", "check_stop_suppression", "check_reply_pause"],
  voicemail_drop: ["check_voice_consent", "check_dnc", "check_quiet_hours", "check_stop_suppression", "check_reply_pause"],
  missed_call_ping: ["check_voice_consent", "check_dnc", "check_quiet_hours", "check_stop_suppression", "check_reply_pause"],
  broker_task: ["check_reply_pause"],
  broker_alert: ["check_reply_pause"],
  wait: ["check_reply_pause", "check_stop_suppression"],
  condition: ["check_reply_pause", "check_stop_suppression"],
  quote_reminder: ["check_email_consent", "check_sms_consent", "check_dnc", "check_quiet_hours", "check_stop_suppression", "require_broker_approval"],
  document_request: ["check_email_consent", "check_sms_consent", "check_dnc", "check_quiet_hours", "check_stop_suppression", "check_content_compliance"],
  crm_update: ["check_reply_pause"],
  webhook: ["check_content_compliance"],
};

const initialSteps: BuilderStep[] = [
  {
    id: "step-1",
    type: "missed_call_ping",
    label: "Immediate missed-call ping",
    delayHours: 0,
    guardrails: channelGuardrails.missed_call_ping,
  },
  {
    id: "step-2",
    type: "sms",
    label: "First compliant SMS",
    delayHours: 2,
    guardrails: channelGuardrails.sms,
  },
  {
    id: "step-3",
    type: "email",
    label: "3-option quote prep email",
    delayHours: 24,
    guardrails: channelGuardrails.email,
  },
];

export default function CampaignBuilderPage() {
  const [steps, setSteps] = React.useState<BuilderStep[]>(initialSteps);
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");

  function addStep(type: CampaignStepType) {
    const catalogItem = stepCatalog.find((item) => item.type === type);
    setSteps((current) => [
      ...current,
      {
        id: `step-${Date.now()}`,
        type,
        label: catalogItem?.label ?? type,
        delayHours: current.length ? current[current.length - 1].delayHours + 24 : 0,
        guardrails: channelGuardrails[type],
      },
    ]);
  }

  async function saveCampaign() {
    setStatus("saving");
    try {
      await campaignApi.createCampaign({
        name: "Mortgage first-touch sequence",
        description: "Broker-owned campaign template generated from the Nyra builder.",
        active: false,
        loanPurpose: "PURCHASE",
        steps,
      });
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <PageHeader
        eyebrow="Campaign Engine"
        title="Mortgage Drip Builder"
        description="Create broker-facing drip templates while keeping guardrails, state transitions, and persistence behind Nyra service boundaries."
        meta={
          <>
            <ComplianceBadge label="STOP_SUPPRESSION" state="clear" />
            <ComplianceBadge label="QUIET_HOURS" state="clear" />
            <ComplianceBadge label="BROKER_APPROVAL" state="warning" />
          </>
        }
        actions={
          <Button onClick={saveCampaign} disabled={status === "saving"}>
            <Save className="mr-2 size-4" />
            {status === "saving" ? "Saving" : "Save template"}
          </Button>
        }
      />

      {status !== "idle" && (
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-4 text-sm">
          {status === "error" ? <AlertTriangle className="size-4 text-destructive" /> : <ShieldCheck className="size-4 text-emerald-400" />}
          <span className="text-muted-foreground">
            {status === "saved"
              ? "Template persisted through the campaign API boundary."
              : status === "error"
                ? "Campaign API save failed. Check CAMPAIGN_ENGINE_URL or enable mocks for local scaffold work."
                : "Saving template through the campaign API boundary."}
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="border-border/50 bg-card/40 shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest">Step Catalog</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {stepCatalog.map(({ type, label, icon: Icon }) => (
              <Button key={type} variant="outline" className="justify-start" onClick={() => addStep(type)}>
                <Icon className="mr-2 size-4" />
                {label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const catalogItem = stepCatalog.find((item) => item.type === step.type);
            const Icon = catalogItem?.icon ?? MessageSquare;
            return (
              <Card key={step.id} className="border-border/50 bg-card/40 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-black uppercase tracking-tight">
                        Step {index + 1}: {step.label}
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">{step.delayHours} hours after enrollment or prior step</p>
                    </div>
                  </div>
                  <StatusBadge status={step.type} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Label
                    <input
                      value={step.label}
                      onChange={(event) =>
                        setSteps((current) =>
                          current.map((candidate) =>
                            candidate.id === step.id ? { ...candidate, label: event.target.value } : candidate
                          )
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-border/60 bg-background/50 p-3 text-sm font-medium text-foreground outline-none focus:border-primary"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {step.guardrails.map((guardrail) => (
                      <ComplianceBadge key={guardrail} label={guardrail} state={guardrail === "require_broker_approval" ? "warning" : "clear"} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Button variant="outline" className="w-full border-dashed" onClick={() => addStep("wait")}>
            <Plus className="mr-2 size-4" />
            Add wait step
          </Button>
        </div>
      </div>
    </div>
  );
}
