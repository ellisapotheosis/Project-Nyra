"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Braces,
  CalendarDays,
  Bot,
  CheckCircle2,
  CircleStop,
  ClipboardCheck,
  Clock3,
  Copy,
  FileClock,
  Filter,
  Gauge,
  GitBranch,
  History,
  Mail,
  MessageSquare,
  Mic,
  MicOff,
  MousePointerClick,
  Pause,
  PhoneCall,
  Play,
  Radar,
  RefreshCw,
  Route,
  Save,
  Send,
  SlidersHorizontal,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TestTube2,
  UserCheck,
  Wand2,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";

import { PageHeader } from "@nyra/ui";
import { ComplianceBadge } from "@nyra/ui";
import { StatusBadge } from "@nyra/ui";
import { Badge } from "@nyra/ui";
import { Button } from "@nyra/ui";
import { Input } from "@nyra/ui";
import { Switch } from "@nyra/ui";
import { Textarea } from "@nyra/ui";
import { campaignApi } from "@/lib/api";
import { cn } from "@/lib/utils";

type CampaignTemplate = {
  id: string;
  name: string;
  summary: string;
  durationDays: number;
  leadProfile: string;
  activeLeads: number;
  replyRate: string;
  stopRate: string;
  accent: "cyan" | "violet" | "emerald" | "amber" | "rose";
};

type WorkflowNodeType =
  | "trigger"
  | "normalize"
  | "score"
  | "sms"
  | "email"
  | "wait"
  | "condition"
  | "stop"
  | "crm_task"
  | "broker_alert"
  | "openclaw"
  | "quote_task";

type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  label: string;
  detail: string;
  day: string;
  status: "active" | "draft" | "guarded" | "paused";
  x: number;
  y: number;
  metric: string;
  icon: React.ComponentType<{ className?: string }>;
  guardrails: string[];
};

type RunLog = {
  id: string;
  time: string;
  lead: string;
  event: string;
  status: "complete" | "running" | "blocked" | "failed";
};

type BuilderMode = "wizard" | "canvas" | "timeline" | "monitor";

type AgentProvider = "openclaw" | "llxprt-code" | "llxprt-jefe" | "llxprt-gemini" | "llxprt-claude";

type AgentMessage = {
  id: string;
  role: "broker" | "agent";
  content: string;
};

type AgentProposedAction = {
  id: string;
  label: string;
  detail: string;
  risk: "low" | "approval_required";
  command: "set_mode" | "select_node" | "require_manual_approval" | "queue_save";
  value: string | boolean;
};

const templates: CampaignTemplate[] = [
  {
    id: "new-internet-lead",
    name: "New Internet Lead",
    summary: "Fast first-touch sequence for form, vendor, and API leads.",
    durationDays: 45,
    leadProfile: "Purchase/refi web intent",
    activeLeads: 286,
    replyRate: "18.4%",
    stopRate: "1.2%",
    accent: "cyan",
  },
  {
    id: "refinance-inquiry",
    name: "Refinance Inquiry",
    summary: "Payment, cash-out, and rate-term nurture with quote approval gates.",
    durationDays: 60,
    leadProfile: "Refi shoppers",
    activeLeads: 194,
    replyRate: "15.9%",
    stopRate: "1.6%",
    accent: "violet",
  },
  {
    id: "purchase-preapproval",
    name: "Purchase Pre-Approval",
    summary: "Pre-approval readiness, document nudges, and realtor handoff tasks.",
    durationDays: 52,
    leadProfile: "Homebuyers",
    activeLeads: 241,
    replyRate: "21.7%",
    stopRate: "0.8%",
    accent: "emerald",
  },
  {
    id: "realtor-partner",
    name: "Realtor Partner Lead",
    summary: "Broker introduction, co-branded cadence, and appointment push.",
    durationDays: 45,
    leadProfile: "Partner referrals",
    activeLeads: 97,
    replyRate: "26.1%",
    stopRate: "0.4%",
    accent: "amber",
  },
  {
    id: "credit-repair",
    name: "Credit Repair Follow-Up",
    summary: "Low-pressure education and task reminders for rebuild timelines.",
    durationDays: 60,
    leadProfile: "Credit constrained",
    activeLeads: 112,
    replyRate: "12.3%",
    stopRate: "1.9%",
    accent: "rose",
  },
  {
    id: "rate-watch",
    name: "Rate Watch",
    summary: "Rate-triggered check-ins with quote-task creation when intent spikes.",
    durationDays: 60,
    leadProfile: "Rate sensitive",
    activeLeads: 353,
    replyRate: "14.8%",
    stopRate: "1.1%",
    accent: "cyan",
  },
  {
    id: "dormant-reactivation",
    name: "Dormant Lead Reactivation",
    summary: "Revives old borrowers without over-contacting or bypassing consent.",
    durationDays: 45,
    leadProfile: "Aged CRM leads",
    activeLeads: 429,
    replyRate: "9.6%",
    stopRate: "2.4%",
    accent: "violet",
  },
  {
    id: "post-close-referral",
    name: "Post-Close Referral Campaign",
    summary: "Post-close care, review asks, annual check-ins, and referral nudges.",
    durationDays: 60,
    leadProfile: "Closed borrowers",
    activeLeads: 168,
    replyRate: "19.2%",
    stopRate: "0.3%",
    accent: "emerald",
  },
];

const workflowNodes: WorkflowNode[] = [
  {
    id: "trigger",
    type: "trigger",
    label: "New lead trigger",
    detail: "Form, email parser, API vendor post, or TwentyCRM lead stage.",
    day: "D0",
    status: "active",
    x: 36,
    y: 38,
    metric: "4 sources",
    icon: Zap,
    guardrails: ["Source attribution", "Consent timestamp"],
  },
  {
    id: "normalize",
    type: "normalize",
    label: "Normalize lead",
    detail: "Phone to E.164, loan purpose, property state, source ID, owner.",
    day: "D0",
    status: "active",
    x: 326,
    y: 38,
    metric: "99.2% clean",
    icon: Filter,
    guardrails: ["Required fields", "Duplicate scan"],
  },
  {
    id: "score",
    type: "score",
    label: "Score mortgage intent",
    detail: "Intent score from source, timeline, amount, credit band, and replies.",
    day: "D0",
    status: "guarded",
    x: 616,
    y: 38,
    metric: "High >= 82",
    icon: Gauge,
    guardrails: ["No approval claims", "Broker review"],
  },
  {
    id: "sms",
    type: "sms",
    label: "Send SMS via Twilio",
    detail: "Immediate compliant first-touch text with broker identity.",
    day: "D0",
    status: "guarded",
    x: 180,
    y: 210,
    metric: "SMS 2 min",
    icon: MessageSquare,
    guardrails: ["SMS consent", "DNC", "Quiet hours", "STOP suppression"],
  },
  {
    id: "email",
    type: "email",
    label: "Send email via SendGrid",
    detail: "Mortgage scenario email with safe CTA and unsubscribe footer.",
    day: "D1",
    status: "guarded",
    x: 470,
    y: 210,
    metric: "Open/click tracked",
    icon: Mail,
    guardrails: ["Email consent", "Unsubscribe", "Content compliance"],
  },
  {
    id: "wait",
    type: "wait",
    label: "Wait cadence",
    detail: "Spaced contact windows across a 45-60 day nurture.",
    day: "D2-D45",
    status: "draft",
    x: 760,
    y: 210,
    metric: "Freq cap",
    icon: Clock3,
    guardrails: ["Frequency limit", "Reply pause"],
  },
  {
    id: "condition",
    type: "condition",
    label: "Reply / intent branch",
    detail: "Detect inbound reply, high intent, rate request, or STOP text.",
    day: "Live",
    status: "active",
    x: 326,
    y: 384,
    metric: "12 rules",
    icon: GitBranch,
    guardrails: ["Reply pause", "Audit event", "STOP check"],
  },
  {
    id: "stop",
    type: "stop",
    label: "Stop on STOP / unsubscribe",
    detail: "Immediately suppress channel and halt active enrollments.",
    day: "Live",
    status: "guarded",
    x: 36,
    y: 556,
    metric: "0 bypass",
    icon: CircleStop,
    guardrails: ["STOP detection", "Suppression record", "Audit trail"],
  },
  {
    id: "crm-task",
    type: "crm_task",
    label: "Create TwentyCRM task",
    detail: "Assign broker task for call, docs, pre-approval, or reply follow-up.",
    day: "Live",
    status: "active",
    x: 326,
    y: 556,
    metric: "Task SLA",
    icon: ClipboardCheck,
    guardrails: ["Twenty ID", "Owner required"],
  },
  {
    id: "broker-alert",
    type: "broker_alert",
    label: "Notify broker",
    detail: "Alert for replies, failed sends, rate asks, and appointment intent.",
    day: "Live",
    status: "active",
    x: 616,
    y: 556,
    metric: "P95 < 30s",
    icon: Bell,
    guardrails: ["No auto-send", "Broker approval"],
  },
  {
    id: "openclaw",
    type: "openclaw",
    label: "Launch OpenClaw session",
    detail: "Open assistant workspace when lead intent is high.",
    day: "Intent >= 82",
    status: "guarded",
    x: 180,
    y: 728,
    metric: "Assist only",
    icon: Bot,
    guardrails: ["No direct CRM mutation", "Tool audit"],
  },
  {
    id: "quote-task",
    type: "quote_task",
    label: "Generate quote task",
    detail: "Create quote request task when lead asks for rates or payment.",
    day: "Rate ask",
    status: "guarded",
    x: 470,
    y: 728,
    metric: "Pending approval",
    icon: FileClock,
    guardrails: ["Quote API only", "Manual approval", "APR disclaimer"],
  },
];

const analytics = [
  { label: "Active leads", value: "1,880", delta: "+12%", icon: Activity },
  { label: "Reply rate", value: "18.7%", delta: "+2.4", icon: MessageSquare },
  { label: "Appointment rate", value: "7.8%", delta: "+1.1", icon: UserCheck },
  { label: "STOP rate", value: "1.2%", delta: "-0.3", icon: CircleStop },
  { label: "Email open/click", value: "42% / 9%", delta: "placeholder", icon: MousePointerClick },
  { label: "SMS response", value: "16.2%", delta: "placeholder", icon: PhoneCall },
  { label: "Application conversion", value: "4.6%", delta: "+0.8", icon: Target },
];

const builderModes: Array<{
  id: BuilderMode;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "wizard",
    label: "AI Wizard",
    detail: "Five broker answers generate a compliant mortgage nurture skeleton.",
    icon: Wand2,
  },
  {
    id: "canvas",
    label: "Canvas",
    detail: "Drag-ready node map for Activepieces execution handoff.",
    icon: Workflow,
  },
  {
    id: "timeline",
    label: "Timeline",
    detail: "45-60 day cadence chain with frequency and reply gates.",
    icon: CalendarDays,
  },
  {
    id: "monitor",
    label: "Monitor",
    detail: "Live runs, failure surfaces, and CRM sync readiness.",
    icon: Radar,
  },
];

const agentProviders: Array<{
  id: AgentProvider;
  label: string;
  detail: string;
}> = [
  { id: "openclaw", label: "OpenClaw", detail: "Ops assistant and mortgage workflow copilot" },
  { id: "llxprt-code", label: "LLXPRT Code", detail: "Codex-backed builder/control lane" },
  { id: "llxprt-jefe", label: "LLXPRT Jefe", detail: "Lead agent coordinator for build requests" },
  { id: "llxprt-gemini", label: "Gemini", detail: "Gemini via LLXPRT bridge" },
  { id: "llxprt-claude", label: "Claude", detail: "Claude via LLXPRT bridge" },
];

const wizardQuestions = [
  {
    label: "Lead source mix",
    answer: "Form, vendor API, email parser, and TwentyCRM stage triggers",
    signal: "Maps to trigger + normalize nodes",
  },
  {
    label: "Primary borrower intent",
    answer: "Purchase, refi, cash-out, rate watch, credit repair, or referral",
    signal: "Selects branch copy and quote-task rules",
  },
  {
    label: "Approved channels",
    answer: "SMS, email, voicemail drop, broker task, and manual call",
    signal: "Filtered by consent and DNC eligibility",
  },
  {
    label: "Broker brand voice",
    answer: "Direct, local, low-pressure, fast response, no approval promises",
    signal: "Feeds content guardrail prompts",
  },
  {
    label: "Conversion target",
    answer: "Reply, booked appointment, quote task, application started, referral",
    signal: "Controls stop conditions and monitoring KPIs",
  },
];

const timelineStages = [
  {
    window: "Day 0",
    title: "Speed-to-lead launch",
    detail: "Normalize lead, score intent, send compliant SMS/email, and alert broker for hot sources.",
    gates: ["Consent", "DNC", "Quiet hours"],
  },
  {
    window: "Days 1-7",
    title: "Conversation capture",
    detail: "Mix SMS, email, broker task, voicemail drop, and reply detection while throttling frequency.",
    gates: ["Reply pause", "STOP", "Frequency cap"],
  },
  {
    window: "Days 8-21",
    title: "Mortgage education",
    detail: "Rotate purchase/refi/credit/document content and create quote tasks only on rate/payment asks.",
    gates: ["Content scan", "Quote approval", "Unsubscribe"],
  },
  {
    window: "Days 22-45",
    title: "Reactivation branch",
    detail: "Lower cadence, route high intent into OpenClaw, and create TwentyCRM tasks for broker touches.",
    gates: ["Manual approval", "Owner SLA", "Audit trail"],
  },
  {
    window: "Days 46-60",
    title: "Long-tail follow-up",
    detail: "Post-sequence chain for rate watch, dormant reactivation, annual review, or referral campaign.",
    gates: ["Re-consent check", "Cadence limit", "CRM sync"],
  },
];

const complianceScenarios = [
  {
    label: "Lead replies yes",
    result: "Pause automation, log inbound reply, notify broker, require resume.",
    state: "clear" as const,
  },
  {
    label: "Text contains STOP",
    result: "Suppress SMS channel and halt active enrollments before next step.",
    state: "clear" as const,
  },
  {
    label: "Rate/payment copy",
    result: "Block delivery until Quote API scenario exists and broker approval is true.",
    state: "warning" as const,
  },
  {
    label: "Quiet hours hit",
    result: "Defer send and keep task timeline/audit reason visible to broker.",
    state: "clear" as const,
  },
];

const copyRiskScan = [
  { phrase: "guaranteed approval", disposition: "blocked", reason: "Approval claim" },
  { phrase: "lowest rate available", disposition: "blocked", reason: "Unverified rate superlative" },
  { phrase: "estimated payment range", disposition: "review", reason: "Requires Quote API backing" },
  { phrase: "reply STOP to opt out", disposition: "required", reason: "SMS compliance footer" },
];

const activepiecesExportPreview = [
  "trigger.new_lead",
  "nyra.normalize_lead",
  "nyra.score_intent",
  "nyra.compliance_gate",
  "twilio.send_sms",
  "sendgrid.send_email",
  "nyra.reply_or_stop_branch",
  "twenty.create_task",
  "openclaw.launch_session",
  "quote.create_broker_task",
];

const runLog: RunLog[] = [
  { id: "run-1", time: "11:48:09", lead: "J. Alvarez", event: "High intent reply detected; OpenClaw session queued.", status: "running" },
  { id: "run-2", time: "11:44:31", lead: "M. Patel", event: "STOP detected; SMS channel suppressed and campaign halted.", status: "blocked" },
  { id: "run-3", time: "11:39:15", lead: "K. Morgan", event: "SendGrid email delivered; click placeholder awaiting webhook.", status: "complete" },
  { id: "run-4", time: "11:35:02", lead: "A. Nguyen", event: "Quote task created after payment request.", status: "complete" },
  { id: "run-5", time: "11:28:48", lead: "S. Williams", event: "Twilio SMS failed; retry blocked by frequency cap.", status: "failed" },
];

const nodeConnections = [
  ["trigger", "normalize"],
  ["normalize", "score"],
  ["score", "sms"],
  ["sms", "email"],
  ["email", "wait"],
  ["wait", "condition"],
  ["condition", "stop"],
  ["condition", "crm-task"],
  ["condition", "broker-alert"],
  ["broker-alert", "openclaw"],
  ["broker-alert", "quote-task"],
] as const;

const accentStyles: Record<CampaignTemplate["accent"], string> = {
  cyan: "border-cyan-400/35 bg-cyan-400/10 text-cyan-200",
  violet: "border-violet-400/35 bg-violet-400/10 text-violet-200",
  emerald: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-400/35 bg-amber-400/10 text-amber-200",
  rose: "border-rose-400/35 bg-rose-400/10 text-rose-200",
};

const complianceControls = [
  { label: "STOP detection", state: "clear" as const, detail: "Inbound STOP halts all future SMS immediately." },
  { label: "DNC flag", state: "clear" as const, detail: "DNC and global suppression checked before every touch." },
  { label: "Consent status", state: "warning" as const, detail: "One imported source missing voice consent metadata." },
  { label: "Frequency limits", state: "clear" as const, detail: "Max 2 SMS and 3 email touches per 7 days." },
  { label: "Audit trail", state: "clear" as const, detail: "Every branch, send, pause, and task is logged." },
  { label: "Manual approval", state: "warning" as const, detail: "Required for quote/rate/payment copy." },
];

function getNode(id: string) {
  const node = workflowNodes.find((candidate) => candidate.id === id);
  if (!node) throw new Error(`Missing workflow node ${id}`);
  return node;
}

function connectionPath(from: WorkflowNode, to: WorkflowNode) {
  const startX = from.x + 128;
  const startY = from.y + 64;
  const endX = to.x + 128;
  const endY = to.y + 64;
  const midX = (startX + endX) / 2;
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
}

export default function CampaignBuilderPage() {
  const [selectedTemplate, setSelectedTemplate] = React.useState(templates[0]);
  const [selectedNodeId, setSelectedNodeId] = React.useState("condition");
  const [builderMode, setBuilderMode] = React.useState<BuilderMode>("canvas");
  const [manualApproval, setManualApproval] = React.useState(true);
  const [notice, setNotice] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [agentProvider, setAgentProvider] = React.useState<AgentProvider>("openclaw");
  const [agentPrompt, setAgentPrompt] = React.useState("Build a 60 day refinance campaign with SMS, email, voice task, STOP handling, and quote approval gates.");
  const [agentMessages, setAgentMessages] = React.useState<AgentMessage[]>([
    {
      id: "agent-ready",
      role: "agent",
      content:
        "Tell me what campaign you want. I can propose builder edits, focus nodes, switch modes, and queue a draft save. I cannot send borrower messages or bypass approval gates.",
    },
  ]);
  const [agentActions, setAgentActions] = React.useState<AgentProposedAction[]>([]);
  const [agentLoading, setAgentLoading] = React.useState(false);
  const [voiceListening, setVoiceListening] = React.useState(false);

  const selectedNode = getNode(selectedNodeId);
  const SelectedNodeIcon = selectedNode.icon;
  const approvalCoverage = manualApproval ? "Manual quote/rate approvals enforced" : "Manual approval disabled for draft review only";

  async function createCampaign() {
    setSaving(true);
    setNotice(null);

    try {
      await campaignApi.createCampaign({
        name: selectedTemplate.name,
        description: `${selectedTemplate.summary} Builder mode: ${builderMode}. ${approvalCoverage}.`,
        active: false,
        loanPurpose: selectedTemplate.id.includes("refinance") ? "REFINANCE" : "PURCHASE",
        steps: workflowNodes.map((node) => ({
          id: node.id,
          type: node.type,
          label: node.label,
          detail: node.detail,
          day: node.day,
          guardrails: node.guardrails,
        })),
      });
      setNotice({ type: "success", message: "Campaign draft created through the Nyra campaign API boundary." });
    } catch {
      setNotice({ type: "error", message: "Campaign API save failed. The local builder state remains intact." });
    } finally {
      setSaving(false);
    }
  }

  function surfaceAction(action: string) {
    setNotice({ type: "success", message: `${action} queued for broker review. No borrower communication was sent.` });
  }

  async function askCampaignAgent() {
    const command = agentPrompt.trim();
    if (!command) return;

    const brokerMessage: AgentMessage = {
      id: `broker-${Date.now()}`,
      role: "broker",
      content: command,
    };
    setAgentMessages((messages) => [...messages, brokerMessage]);
    setAgentLoading(true);
    setNotice(null);

    try {
      const response = await fetch("/api/internal/campaign-builder/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: agentProvider,
          command,
          context: {
            templateName: selectedTemplate.name,
            builderMode,
            selectedNode: selectedNode.label,
            manualApproval,
            durationDays: selectedTemplate.durationDays,
          },
        }),
      });

      const payload = (await response.json()) as {
        assistant?: string;
        proposedActions?: AgentProposedAction[];
        error?: string;
      };

      if (!response.ok) throw new Error(payload.error || "Campaign builder agent failed");

      setAgentMessages((messages) => [
        ...messages,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          content: payload.assistant || "I prepared proposed builder actions for review.",
        },
      ]);
      setAgentActions(payload.proposedActions || []);
      setAgentPrompt("");
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Campaign builder agent failed.",
      });
    } finally {
      setAgentLoading(false);
    }
  }

  function applyAgentAction(action: AgentProposedAction) {
    if (action.command === "set_mode" && typeof action.value === "string") {
      setBuilderMode(action.value as BuilderMode);
    }

    if (action.command === "select_node" && typeof action.value === "string") {
      setSelectedNodeId(action.value);
    }

    if (action.command === "require_manual_approval") {
      setManualApproval(Boolean(action.value));
    }

    if (action.command === "queue_save") {
      surfaceAction("Agent draft save");
      return;
    }

    setNotice({ type: "success", message: `${action.label} applied locally. Save is still broker-controlled.` });
  }

  function startVoiceCommand() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setNotice({
        type: "error",
        message: "Browser speech recognition is unavailable. Type the same instruction into the agent command box.",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setVoiceListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) setAgentPrompt(transcript);
    };
    recognition.onerror = () => {
      setNotice({ type: "error", message: "Voice command capture failed. Type the campaign instruction instead." });
    };
    recognition.onend = () => setVoiceListening(false);
    recognition.start();
  }

  return (
    <div className="mx-auto flex max-w-[1800px] flex-col gap-6 p-4 sm:p-6 xl:p-8">
      <PageHeader
        eyebrow="Activepieces Workflow Control"
        title="Mortgage Lead Drip Campaign Builder"
        description="Build and monitor 45-60 day mortgage nurture workflows while Nyra keeps campaign state, compliance gates, and CRM writes behind service boundaries."
        meta={
          <>
            <ComplianceBadge label="STOP_LOCK" state="clear" />
            <ComplianceBadge label="DNC_GATE" state="clear" />
            <ComplianceBadge label="QUOTE_APPROVAL" state="warning" />
          </>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => surfaceAction("Workflow test")}>
              <TestTube2 className="mr-2 size-4" />
              Test workflow
            </Button>
            <Button onClick={createCampaign} disabled={saving}>
              <Save className="mr-2 size-4" />
              {saving ? "Creating" : "Create campaign"}
            </Button>
          </div>
        }
      />

      {notice && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border p-3 text-sm font-semibold",
            notice.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
          role="status"
        >
          {notice.type === "success" ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
          {notice.message}
        </div>
      )}

      <section className="grid gap-3 lg:grid-cols-4">
        {builderModes.map((mode) => {
          const ModeIcon = mode.icon;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setBuilderMode(mode.id)}
              className={cn(
                "rounded-lg border p-4 text-left shadow-lg backdrop-blur-xl transition hover:border-primary/50 hover:bg-primary/5",
                builderMode === mode.id
                  ? "border-primary/60 bg-primary/10 shadow-primary/15"
                  : "border-border/60 bg-card/35",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <ModeIcon className="size-5 text-primary" />
                <Badge variant="outline" className="rounded-lg border-border/50 bg-background/40 text-[10px] uppercase text-muted-foreground">
                  {builderMode === mode.id ? "Open" : "Mode"}
                </Badge>
              </div>
              <p className="mt-4 text-sm font-black">{mode.label}</p>
              <p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground">{mode.detail}</p>
            </button>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(820px,1fr)_360px]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-card/40 p-4 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Campaign Templates</p>
                <h2 className="mt-1 text-base font-black">Mortgage nurture library</h2>
              </div>
              <Badge variant="outline" className="rounded-lg border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                8
              </Badge>
            </div>
            <div className="grid gap-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition hover:border-primary/50 hover:bg-primary/5",
                    selectedTemplate.id === template.id
                      ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/10"
                      : "border-border/50 bg-background/35",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black leading-tight">{template.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{template.summary}</p>
                    </div>
                    <Workflow className="size-4 shrink-0 text-primary" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className={cn("rounded-lg text-[10px] font-bold", accentStyles[template.accent])}>
                      {template.durationDays} days
                    </Badge>
                    <Badge variant="outline" className="rounded-lg border-border/50 bg-background/40 text-[10px] text-muted-foreground">
                      {template.leadProfile}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-card/40 p-4 shadow-xl backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Selected Template</p>
            <Input value={selectedTemplate.name} readOnly className="mt-3 h-10 bg-background/45 font-bold" />
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <MetricChip label="Leads" value={selectedTemplate.activeLeads.toLocaleString()} />
              <MetricChip label="Reply" value={selectedTemplate.replyRate} />
              <MetricChip label="STOP" value={selectedTemplate.stopRate} />
            </div>
            <div className="mt-4 grid gap-2">
              <Button variant="outline" onClick={() => surfaceAction("Template duplicate")}>
                <Copy className="mr-2 size-4" />
                Duplicate template
              </Button>
              <Button variant="outline" onClick={() => surfaceAction("Campaign pause")}>
                <Pause className="mr-2 size-4" />
                Pause campaign
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          {builderMode === "wizard" && (
            <div className="rounded-lg border border-border/60 bg-card/40 p-4 shadow-xl backdrop-blur-xl">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">AI Campaign Wizard</p>
                  <h2 className="mt-1 text-base font-black">Mortgage-specific workflow generator</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ComplianceBadge label="BRAND_VOICE_IMPORT" state="clear" />
                  <ComplianceBadge label="OPT_IN_CHANNELS" state="clear" />
                  <ComplianceBadge label="COPY_RISK_SCAN" state="warning" />
                </div>
              </div>
              <div className="grid gap-3 lg:grid-cols-5">
                {wizardQuestions.map((question) => (
                  <div key={question.label} className="rounded-lg border border-border/50 bg-background/35 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">{question.label}</p>
                    <p className="mt-3 text-sm font-bold leading-5">{question.answer}</p>
                    <p className="mt-3 text-xs leading-5 text-primary">{question.signal}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border/60 bg-card/35 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                  <Workflow className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.14em]">Activepieces mortgage flow</h2>
                  <p className="text-xs text-muted-foreground">Embedded workflow builder surface for broker-safe lead nurture logic.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="draft" />
                <Badge variant="outline" className="rounded-lg border-violet-400/30 bg-violet-400/10 text-violet-100">
                  {builderMode.toUpperCase()}
                </Badge>
                <ComplianceBadge label="45-60_DAY_DRIP" state="clear" />
                <ComplianceBadge label="ACTIVEPIECES_SYNC_READY" state="warning" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="relative h-[910px] min-w-[1080px] overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,0.14),transparent_30%),linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:auto,auto,40px_40px,40px_40px] p-8">
                <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1080 910" aria-hidden="true">
                  <defs>
                    <linearGradient id="nyra-flow-line" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgb(34 211 238)" stopOpacity="0.86" />
                      <stop offset="100%" stopColor="rgb(167 139 250)" stopOpacity="0.86" />
                    </linearGradient>
                    <filter id="nyra-flow-glow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {nodeConnections.map(([fromId, toId]) => (
                    <path
                      key={`${fromId}-${toId}`}
                      d={connectionPath(getNode(fromId), getNode(toId))}
                      fill="none"
                      stroke="url(#nyra-flow-line)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={toId === "stop" ? "7 7" : undefined}
                      filter="url(#nyra-flow-glow)"
                    />
                  ))}
                </svg>

                {workflowNodes.map((node) => (
                  <WorkflowNodeCard
                    key={node.id}
                    node={node}
                    selected={node.id === selectedNodeId}
                    onSelect={() => setSelectedNodeId(node.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {builderMode === "timeline" && (
            <div className="rounded-lg border border-border/60 bg-card/40 p-4 shadow-xl backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Cadence Timeline</p>
                  <h2 className="mt-1 text-base font-black">45-60 day mortgage chain</h2>
                </div>
                <Route className="size-5 text-primary" />
              </div>
              <div className="grid gap-3">
                {timelineStages.map((stage) => (
                  <div key={stage.window} className="grid gap-3 rounded-lg border border-border/50 bg-background/35 p-3 md:grid-cols-[120px_1fr]">
                    <div>
                      <Badge variant="outline" className="rounded-lg border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
                        {stage.window}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-black">{stage.title}</p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{stage.detail}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {stage.gates.map((gate) => (
                          <ComplianceBadge key={gate} label={gate} state={gate.includes("approval") || gate.includes("Quote") ? "warning" : "clear"} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {builderMode === "monitor" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-card/40 p-4 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Compliance Simulator</p>
                    <h2 className="mt-1 text-base font-black">Preflight branch outcomes</h2>
                  </div>
                  <SlidersHorizontal className="size-5 text-primary" />
                </div>
                <div className="space-y-2">
                  {complianceScenarios.map((scenario) => (
                    <div key={scenario.label} className="rounded-lg border border-border/50 bg-background/35 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-black">{scenario.label}</p>
                        <ComplianceBadge label={scenario.state === "warning" ? "REVIEW" : "PASS"} state={scenario.state} />
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{scenario.result}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-card/40 p-4 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Activepieces Export</p>
                    <h2 className="mt-1 text-base font-black">Nyra-owned logic, execution-ready steps</h2>
                  </div>
                  <Braces className="size-5 text-primary" />
                </div>
                <div className="grid gap-2">
                  {activepiecesExportPreview.map((step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/35 p-3">
                      <span className="flex size-7 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-400/10 text-[10px] font-black text-violet-100">
                        {index + 1}
                      </span>
                      <code className="text-xs font-bold text-muted-foreground">{step}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {analytics.map((item) => (
              <div key={item.label} className="rounded-lg border border-border/60 bg-card/40 p-4 shadow-lg backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <item.icon className="size-4 text-primary" />
                  <Badge variant="outline" className="rounded-lg border-border/50 bg-background/40 text-[10px] text-muted-foreground">
                    {item.delta}
                  </Badge>
                </div>
                <p className="mt-4 text-2xl font-black tracking-tight">{item.value}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </section>
        </main>

        <aside className="space-y-4">
          <div className="rounded-lg border border-cyan-400/25 bg-card/45 p-4 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Agent Builder Control</p>
                <h2 className="mt-1 text-base font-black">Chat + voice commands</h2>
              </div>
              <Bot className="size-5 text-cyan-200" />
            </div>

            <div className="mt-4 grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                {agentProviders.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setAgentProvider(provider.id)}
                    title={provider.detail}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-[10px] font-black uppercase tracking-[0.12em] transition",
                      agentProvider === provider.id
                        ? "border-cyan-300/60 bg-cyan-300/10 text-cyan-100"
                        : "border-border/50 bg-background/35 text-muted-foreground hover:border-primary/50",
                    )}
                  >
                    {provider.label}
                  </button>
                ))}
              </div>

              <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-border/50 bg-background/35 p-2">
                {agentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "rounded-lg border p-2 text-xs leading-5",
                      message.role === "broker"
                        ? "border-violet-400/25 bg-violet-400/10 text-violet-100"
                        : "border-cyan-400/25 bg-cyan-400/10 text-cyan-100",
                    )}
                  >
                    <p className="mb-1 text-[9px] font-black uppercase tracking-[0.14em] opacity-70">
                      {message.role === "broker" ? "Broker" : agentProvider}
                    </p>
                    {message.content}
                  </div>
                ))}
              </div>

              <Textarea
                value={agentPrompt}
                onChange={(event) => setAgentPrompt(event.target.value)}
                placeholder="Tell the agent what campaign to build..."
                className="min-h-28 bg-background/45 text-xs leading-5"
              />

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Button onClick={askCampaignAgent} disabled={agentLoading || !agentPrompt.trim()}>
                  <Sparkles className="mr-2 size-4" />
                  {agentLoading ? "Thinking" : "Ask agent"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={startVoiceCommand}
                  aria-label="Capture voice command"
                  title="Capture voice command"
                >
                  {voiceListening ? <MicOff className="size-4 text-rose-300" /> : <Mic className="size-4" />}
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Proposed Actions</p>
                <ComplianceBadge label="APPROVAL_GATE" state="warning" />
              </div>
              {agentActions.length === 0 ? (
                <div className="rounded-lg border border-border/50 bg-background/35 p-3 text-xs leading-5 text-muted-foreground">
                  Agent proposals appear here. Applying a proposal only changes this builder locally; save still uses the campaign API.
                </div>
              ) : (
                agentActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => applyAgentAction(action)}
                    className="w-full rounded-lg border border-border/50 bg-background/35 p-3 text-left transition hover:border-cyan-300/50 hover:bg-cyan-300/5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black">{action.label}</p>
                      <ComplianceBadge
                        label={action.risk === "approval_required" ? "REVIEW" : "LOW_RISK"}
                        state={action.risk === "approval_required" ? "warning" : "clear"}
                      />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{action.detail}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-card/40 p-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Selected Node</p>
                <h2 className="mt-1 text-base font-black">{selectedNode.label}</h2>
              </div>
              <SelectedNodeIcon className="size-5 text-primary" />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{selectedNode.detail}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <MetricChip label="Window" value={selectedNode.day} />
              <MetricChip label="Signal" value={selectedNode.metric} />
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Guardrails</p>
              <div className="flex flex-wrap gap-2">
                {selectedNode.guardrails.map((guardrail) => (
                  <ComplianceBadge
                    key={guardrail}
                    label={guardrail}
                    state={guardrail.includes("approval") || guardrail.includes("Quote") ? "warning" : "clear"}
                  />
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Mortgage Copy Risk Scanner</p>
              {copyRiskScan.map((risk) => (
                <div key={risk.phrase} className="rounded-lg border border-border/50 bg-background/35 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-[11px] font-bold text-muted-foreground">{risk.phrase}</code>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-lg text-[10px] uppercase",
                        risk.disposition === "blocked"
                          ? "border-rose-400/30 bg-rose-400/10 text-rose-100"
                          : risk.disposition === "review"
                            ? "border-amber-400/30 bg-amber-400/10 text-amber-100"
                            : "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
                      )}
                    >
                      {risk.disposition}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{risk.reason}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              <Button variant="outline" onClick={() => surfaceAction("Test SMS/email")}>
                <Send className="mr-2 size-4" />
                Send test SMS/email
              </Button>
              <Button variant="outline" onClick={() => surfaceAction("Failed runs view")}>
                <AlertTriangle className="mr-2 size-4" />
                View failed runs
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-card/40 p-4 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Compliance Controls</p>
                <h2 className="mt-1 text-base font-black">Outbound safety gates</h2>
              </div>
              <ShieldCheck className="size-5 text-emerald-300" />
            </div>
            <div className="space-y-3">
              {complianceControls.map((control) => (
                <div key={control.label} className="rounded-lg border border-border/50 bg-background/35 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <ComplianceBadge label={control.label} state={control.state} />
                    {control.state === "clear" ? (
                      <CheckCircle2 className="size-4 text-emerald-300" />
                    ) : (
                      <ShieldAlert className="size-4 text-primary" />
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{control.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
              <div>
                <p className="text-xs font-black">Manual approval toggle</p>
                <p className="mt-1 text-xs text-muted-foreground">Required before rate/payment language is sent.</p>
              </div>
              <Switch checked={manualApproval} onCheckedChange={setManualApproval} aria-label="Manual approval required" />
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-card/40 p-4 shadow-xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Live Run Log</p>
                <h2 className="mt-1 text-base font-black">Recent executions</h2>
              </div>
              <History className="size-5 text-primary" />
            </div>
            <div className="space-y-2">
              {runLog.map((run) => (
                <div key={run.id} className="rounded-lg border border-border/50 bg-background/35 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{run.time}</span>
                    <StatusBadge status={run.status} />
                  </div>
                  <p className="mt-2 text-xs font-bold">{run.lead}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{run.event}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => surfaceAction("TwentyCRM sync")}>
              <RefreshCw className="mr-2 size-4" />
              Sync
            </Button>
            <Button variant="outline" onClick={() => surfaceAction("Activepieces test run")}>
              <Play className="mr-2 size-4" />
              Run
            </Button>
            <Button variant="outline" onClick={() => surfaceAction("Frequency audit")}>
              <Radar className="mr-2 size-4" />
              Audit
            </Button>
            <Button variant="outline" onClick={() => surfaceAction("Tool config")}>
              <Wrench className="mr-2 size-4" />
              Tools
            </Button>
          </div>
        </aside>
      </section>
    </div>
  );
}

function WorkflowNodeCard({
  node,
  selected,
  onSelect,
}: {
  node: WorkflowNode;
  selected: boolean;
  onSelect: () => void;
}) {
  const NodeIcon = node.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "absolute w-64 rounded-lg border p-4 text-left shadow-2xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/60",
        "bg-[linear-gradient(145deg,rgba(10,15,24,0.92),rgba(24,24,36,0.78))]",
        selected ? "border-cyan-300/70 shadow-cyan-500/20" : "border-slate-500/30 shadow-black/35",
      )}
      style={{ left: node.x, top: node.y }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
            <NodeIcon className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">{node.day}</p>
            <h3 className="mt-1 text-sm font-black leading-tight text-white">{node.label}</h3>
          </div>
        </div>
        <Sparkles className="size-4 text-violet-200" />
      </div>
      <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-slate-300">{node.detail}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <StatusBadge status={node.status} />
        <span className="rounded-lg border border-violet-300/25 bg-violet-300/10 px-2 py-1 text-[10px] font-bold text-violet-100">
          {node.metric}
        </span>
      </div>
    </button>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/40 p-2">
      <p className="text-sm font-black">{value}</p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
    </div>
  );
}
