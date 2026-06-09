import type {
  Channel,
  ComplianceDecision,
  Lead,
  QuietHoursPolicy,
} from "@nyra/domain-models";
import {
  isStopRequest,
  isUnsubscribeRequest,
  isWithinQuietHours,
} from "@nyra/domain-models";
import { applyInboundComplianceState } from "@nyra/compliance-domain";

export interface CompliancePreflightInput {
  lead: Lead;
  channel: Channel;
  now: Date;
  quietHoursPolicy?: QuietHoursPolicy;
  transactional?: boolean;
}

export interface InboundComplianceInput {
  leadId: string;
  channel: Channel;
  body: string;
  receivedAt: string;
}

function decision(
  allowed: boolean,
  reason: ComplianceDecision["reason"],
  channel: Channel,
  decidedAt: Date
): ComplianceDecision {
  return {
    allowed,
    reason,
    channel,
    decidedAt: decidedAt.toISOString(),
    policyVersion: "v1",
  };
}

export function preflightOutbound(
  input: CompliancePreflightInput
): ComplianceDecision {
  const { lead, channel, now, quietHoursPolicy, transactional = false } = input;

  if (lead.doNotContact || (lead as any).consentStatus === "DO_NOT_CONTACT") {
    return decision(false, "DO_NOT_CONTACT", channel, now);
  }

  const channelConsent =
    channel === "EMAIL" || channel === "GMAIL"
      ? (lead as any).consentEmail
      : channel === "SMS"
        ? (lead as any).consentSms
        : channel === "CALL" || channel === "VOICEMAIL"
          ? (lead as any).consentVoice
          : (lead as any).consentStatus;

  if (
    (lead as any).consentStatus === "OPTED_OUT" ||
    channelConsent === "OPTED_OUT"
  ) {
    return decision(false, "OPTED_OUT", channel, now);
  }

  if (
    (channel === "SMS" || channel === "CALL" || channel === "VOICEMAIL") &&
    !lead.phone
  ) {
    return decision(false, "MISSING_DESTINATION", channel, now);
  }

  if ((channel === "EMAIL" || channel === "GMAIL") && !lead.email) {
    return decision(false, "MISSING_DESTINATION", channel, now);
  }

  if (quietHoursPolicy && isWithinQuietHours(now, quietHoursPolicy)) {
    const isAllowedTransactional =
      transactional && quietHoursPolicy.allowTransactional;
    if (!isAllowedTransactional) {
      return decision(false, "QUIET_HOURS", channel, now);
    }
  }

  if (
    channelConsent === "UNKNOWN" &&
    (channel === "SMS" ||
      channel === "EMAIL" ||
      channel === "CALL" ||
      channel === "VOICEMAIL")
  ) {
    return decision(false, "MISSING_CONSENT", channel, now);
  }

  return decision(true, "ALLOWED", channel, now);
}

export function classifyInboundCompliance(input: InboundComplianceInput) {
  const stopDetected = isStopRequest(input.body);
  const unsubscribeDetected = isUnsubscribeRequest(input.body);
  const eventType = stopDetected
    ? "STOP_DETECTED"
    : unsubscribeDetected
      ? "UNSUBSCRIBE_DETECTED"
      : undefined;

  return {
    stopDetected,
    unsubscribeDetected,
    event: eventType
      ? {
          subjectId: input.leadId,
          subjectType: "LEAD" as const,
          eventType,
          channel: input.channel,
          metadata: {
            createdAt: input.receivedAt,
            source: "communication-service",
          },
        }
      : undefined,
  };
}

export function applyInboundLeadState<TLead extends Lead>(
  lead: TLead,
  body: string
): TLead {
  const updated = applyInboundComplianceState(
    {
      id: lead.id ?? lead.email,
      email: lead.email,
      phone: lead.phone,
      consentStatus: lead.consentStatus,
      doNotContact: lead.doNotContact,
    },
    body
  );

  return {
    ...lead,
    consentStatus:
      updated.consentStatus === "DO_NOT_CONTACT"
        ? "DO_NOT_CONTACT"
        : lead.consentStatus,
    doNotContact: updated.doNotContact ?? lead.doNotContact,
    metadata: {
      ...(lead.metadata ?? {}),
      replyPaused: updated.replyPaused === true,
    },
  };
}
