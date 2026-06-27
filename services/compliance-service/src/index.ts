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

  // 1. Check Do Not Contact
  if (lead.doNotContact || lead.consentStatus === "DO_NOT_CONTACT") {
    return decision(false, "DO_NOT_CONTACT", channel, now);
  }

  // 2. Check Consent
  const channelConsent =
    channel === "EMAIL" || channel === "GMAIL"
      ? lead.consentEmail
      : channel === "SMS"
        ? lead.consentSms
        : channel === "CALL" || channel === "VOICEMAIL"
          ? lead.consentVoice
          : undefined;

  if (lead.consentStatus === "OPTED_OUT" || channelConsent === "OPTED_OUT") {
    return decision(false, "OPTED_OUT", channel, now);
  }

  // 3. Check Destination Presence
  if (
    (channel === "SMS" || channel === "CALL" || channel === "VOICEMAIL") &&
    !lead.phone
  ) {
    return decision(false, "MISSING_DESTINATION", channel, now);
  }

  if ((channel === "EMAIL" || channel === "GMAIL") && !lead.email) {
    return decision(false, "MISSING_DESTINATION", channel, now);
  }

  // 4. Check Quiet Hours
  // Fixed logic: Only allow if BOTH the input is transactional AND the policy explicitly allows transactional during quiet hours.
  if (quietHoursPolicy && isWithinQuietHours(now, quietHoursPolicy)) {
    const isAllowedTransactional =
      transactional && quietHoursPolicy.allowTransactional;
    if (!isAllowedTransactional) {
      return decision(false, "QUIET_HOURS", channel, now);
    }
  }

  // 5. Check Missing Consent
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
  const unsubscribeDetected = isUnsubscribeRequest(input.body);
  const stopDetected = isStopRequest(input.body);
  // Check unsubscribe first — it's more specific than a general STOP
  const eventType = unsubscribeDetected
    ? "UNSUBSCRIBE_DETECTED"
    : stopDetected
      ? "STOP_DETECTED"
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
