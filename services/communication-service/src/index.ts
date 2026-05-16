import type { Channel, Lead, Message } from "@nyra/domain-models";
import {
  classifyInboundCompliance,
  preflightOutbound,
} from "@nyra/compliance-service";

export type CampaignDirective =
  | "NONE"
  | "REPLY_PAUSE"
  | "STOP"
  | "UNSUBSCRIBE"
  | "BOUNCE_SUPPRESSION"
  | "DELIVERY_EVENT";

export interface SendMessageInput {
  lead: Lead;
  channel: Channel;
  body: string;
  now: Date;
  to?: string;
  campaignEnrollmentId?: string;
  campaignStepId?: string;
  templateId?: string;
  idempotencyKey?: string;
}

export interface TemplateDefinition {
  id: string;
  channel: Channel;
  subject?: string;
  body: string;
  requiredVariables: string[];
}

export interface TemplateRenderResult {
  templateId: string;
  subject?: string;
  body: string;
  usedVariables: string[];
}

export interface UnifiedInboxEvent {
  id: string;
  provider: "twilio" | "sendgrid" | "manual" | "other";
  providerEventId: string;
  idempotencyKey: string;
  leadId?: string;
  campaignEnrollmentId?: string;
  campaignStepId?: string;
  channel: Channel;
  direction: "INBOUND" | "OUTBOUND";
  eventType:
    | "MESSAGE_RECEIVED"
    | "STOP_DETECTED"
    | "UNSUBSCRIBE_DETECTED"
    | "DELIVERED"
    | "OPENED"
    | "CLICKED"
    | "BOUNCED"
    | "DROPPED"
    | "SPAM_REPORTED";
  campaignDirective: CampaignDirective;
  occurredAt: string;
  from?: string;
  to?: string;
  body?: string;
  metadata: Record<string, unknown>;
}

export interface CommunicationLog {
  idempotencyKey: string;
  leadId: string;
  channel: Channel;
  direction: "INBOUND" | "OUTBOUND";
  provider: string;
  providerMessageId: string;
  campaignEnrollmentId?: string;
  campaignStepId?: string;
  templateId?: string;
  status: string;
  body?: string;
  occurredAt: string;
}

export interface SuppressionRecord {
  leadId: string;
  channel: Channel;
  reason: "STOP" | "UNSUBSCRIBE" | "BOUNCE" | "SPAM_REPORT";
  source: "twilio" | "sendgrid" | "manual" | "other";
  providerEventId: string;
  idempotencyKey: string;
  occurredAt: string;
}

export interface TwilioInboundWebhookInput {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  receivedAt?: string;
  leadId?: string;
  campaignEnrollmentId?: string;
  campaignStepId?: string;
}

export interface SendGridEventWebhookInput {
  event: string;
  email?: string;
  timestamp?: number;
  sg_message_id?: string;
  sg_event_id?: string;
  url?: string;
  reason?: string;
  status?: string;
  custom_args?: Record<string, string>;
  unique_args?: Record<string, string>;
}

export function createOutboundMessage(input: SendMessageInput): Message {
  const complianceDecision = preflightOutbound({
    lead: input.lead,
    channel: input.channel,
    now: input.now,
  });

  if (!complianceDecision.allowed) {
    throw new Error(`COMPLIANCE_BLOCKED:${complianceDecision.reason}`);
  }

  const destination = input.to ?? input.lead.phone ?? input.lead.email;
  if (!destination) {
    throw new Error("MISSING_DESTINATION");
  }

  return {
    leadId: input.lead.id,
    channel: input.channel,
    direction: "OUTBOUND",
    to: [destination],
    body: input.body,
    status: "QUEUED",
    complianceDecision,
    timestamp: input.now.toISOString(),
  };
}

export function normalizeInboundMessage(input: {
  leadId: string;
  channel: Channel;
  body: string;
  provider: string;
  providerMessageId: string;
  receivedAt: string;
}): {
  event: {
    leadId: string;
    channel: Channel;
    direction: "INBOUND";
    body: string;
    provider: string;
    providerMessageId: string;
    status: "RECEIVED";
    timestamp: string;
  };
  complianceEvent: ReturnType<typeof classifyInboundCompliance>["event"];
  campaignDirective: CampaignDirective;
} {
  const compliance = classifyInboundCompliance({
    leadId: input.leadId,
    channel: input.channel,
    body: input.body,
    receivedAt: input.receivedAt,
  });

  return {
    event: {
      leadId: input.leadId,
      channel: input.channel,
      direction: "INBOUND" as const,
      body: input.body,
      provider: input.provider,
      providerMessageId: input.providerMessageId,
      status: "RECEIVED",
      timestamp: input.receivedAt,
    },
    complianceEvent: compliance.event,
    campaignDirective: compliance.stopDetected
      ? "STOP"
      : compliance.unsubscribeDetected
        ? "UNSUBSCRIBE"
        : "REPLY_PAUSE",
  };
}

export function renderTemplate(input: {
  template: TemplateDefinition;
  variables: Record<string, unknown>;
}): TemplateRenderResult {
  const missingVariables = input.template.requiredVariables.filter((variable) =>
    isMissingMergeValue(input.variables, variable)
  );

  if (missingVariables.length > 0) {
    throw new Error(`TEMPLATE_MISSING_VARIABLES:${missingVariables.join(",")}`);
  }

  return {
    templateId: input.template.id,
    subject: input.template.subject
      ? renderString(input.template.subject, input.variables)
      : undefined,
    body: renderString(input.template.body, input.variables),
    usedVariables: Array.from(new Set(extractMergeVariables(input.template))),
  };
}

export function normalizeTwilioInboundWebhook(
  input: TwilioInboundWebhookInput
): UnifiedInboxEvent {
  const occurredAt = input.receivedAt ?? new Date().toISOString();
  const leadId = input.leadId ?? input.From;
  const normalized = normalizeInboundMessage({
    leadId,
    channel: "SMS",
    body: input.Body,
    provider: "twilio",
    providerMessageId: input.MessageSid,
    receivedAt: occurredAt,
  });
  const eventType =
    normalized.campaignDirective === "STOP"
      ? "STOP_DETECTED"
      : normalized.campaignDirective === "UNSUBSCRIBE"
        ? "UNSUBSCRIBE_DETECTED"
        : "MESSAGE_RECEIVED";

  return {
    id: `twilio:${input.MessageSid}`,
    provider: "twilio",
    providerEventId: input.MessageSid,
    idempotencyKey: `twilio:sms:${input.MessageSid}`,
    leadId,
    campaignEnrollmentId: input.campaignEnrollmentId,
    campaignStepId: input.campaignStepId,
    channel: "SMS",
    direction: "INBOUND",
    eventType,
    campaignDirective: normalized.campaignDirective,
    occurredAt,
    from: input.From,
    to: input.To,
    body: input.Body,
    metadata: {
      status: normalized.event.status,
      complianceEvent: normalized.complianceEvent,
    },
  };
}

export function normalizeSendGridEventWebhook(
  input: SendGridEventWebhookInput
): UnifiedInboxEvent {
  const occurredAt = input.timestamp
    ? new Date(input.timestamp * 1000).toISOString()
    : new Date().toISOString();
  const args = input.custom_args ?? input.unique_args ?? {};
  const providerEventId =
    input.sg_event_id ??
    input.sg_message_id ??
    `${input.email ?? "unknown"}:${input.event}:${input.timestamp ?? occurredAt}`;
  const eventType = mapSendGridEventType(input.event);

  return {
    id: `sendgrid:${providerEventId}`,
    provider: "sendgrid",
    providerEventId,
    idempotencyKey: `sendgrid:${providerEventId}:${input.event}`,
    leadId: args.leadId,
    campaignEnrollmentId: args.campaignEnrollmentId,
    campaignStepId: args.campaignStepId,
    channel: "EMAIL",
    direction: "OUTBOUND",
    eventType,
    campaignDirective: mapSendGridCampaignDirective(eventType),
    occurredAt,
    to: input.email,
    metadata: {
      reason: input.reason,
      status: input.status,
      templateId: args.templateId,
      url: input.url,
    },
  };
}

export function buildCommunicationLog(
  event: UnifiedInboxEvent
): CommunicationLog | undefined {
  if (!event.leadId) {
    return undefined;
  }

  return {
    idempotencyKey: event.idempotencyKey,
    leadId: event.leadId,
    channel: event.channel,
    direction: event.direction,
    provider: event.provider,
    providerMessageId: event.providerEventId,
    campaignEnrollmentId: event.campaignEnrollmentId,
    campaignStepId: event.campaignStepId,
    templateId:
      typeof event.metadata.templateId === "string"
        ? event.metadata.templateId
        : undefined,
    status: event.eventType,
    body: event.body,
    occurredAt: event.occurredAt,
  };
}

export function buildSuppressionRecord(
  event: UnifiedInboxEvent
): SuppressionRecord | undefined {
  if (!event.leadId) {
    return undefined;
  }

  const reason = toSuppressionReason(event.eventType);
  if (!reason) {
    return undefined;
  }

  return {
    leadId: event.leadId,
    channel: event.channel,
    reason,
    source: event.provider,
    providerEventId: event.providerEventId,
    idempotencyKey: event.idempotencyKey,
    occurredAt: event.occurredAt,
  };
}

function renderString(template: string, variables: Record<string, unknown>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key) => {
    const value = getMergeValue(variables, key);
    return value == null ? "" : String(value);
  });
}

function extractMergeVariables(template: TemplateDefinition): string[] {
  const matches = `${template.subject ?? ""}\n${template.body}`.matchAll(
    /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g
  );
  return Array.from(matches, (match) => match[1]).filter(
    (variable): variable is string => Boolean(variable)
  );
}

function isMissingMergeValue(
  variables: Record<string, unknown>,
  variable: string
) {
  const value = getMergeValue(variables, variable);
  return value === undefined || value === null || value === "";
}

function getMergeValue(variables: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object" && key in value) {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, variables);
}

function mapSendGridEventType(
  event: string
): UnifiedInboxEvent["eventType"] {
  switch (event) {
    case "delivered":
      return "DELIVERED";
    case "open":
      return "OPENED";
    case "click":
      return "CLICKED";
    case "bounce":
      return "BOUNCED";
    case "dropped":
      return "DROPPED";
    case "spamreport":
      return "SPAM_REPORTED";
    case "unsubscribe":
    case "group_unsubscribe":
      return "UNSUBSCRIBE_DETECTED";
    default:
      return "DELIVERED";
  }
}

function mapSendGridCampaignDirective(
  eventType: UnifiedInboxEvent["eventType"]
): CampaignDirective {
  switch (eventType) {
    case "UNSUBSCRIBE_DETECTED":
      return "UNSUBSCRIBE";
    case "BOUNCED":
    case "DROPPED":
    case "SPAM_REPORTED":
      return "BOUNCE_SUPPRESSION";
    case "DELIVERED":
    case "OPENED":
    case "CLICKED":
      return "DELIVERY_EVENT";
    default:
      return "NONE";
  }
}

function toSuppressionReason(
  eventType: UnifiedInboxEvent["eventType"]
): SuppressionRecord["reason"] | undefined {
  switch (eventType) {
    case "STOP_DETECTED":
      return "STOP";
    case "UNSUBSCRIBE_DETECTED":
      return "UNSUBSCRIBE";
    case "BOUNCED":
    case "DROPPED":
      return "BOUNCE";
    case "SPAM_REPORTED":
      return "SPAM_REPORT";
    default:
      return undefined;
  }
}
