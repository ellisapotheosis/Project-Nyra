export const stopKeywords = [
  "STOP",
  "UNSUBSCRIBE",
  "QUIT",
  "CANCEL",
  "OPT OUT",
  "OPTOUT",
  "REMOVE",
  "DNC",
  "END",
] as const;

export type ComplianceChannel = "SMS" | "EMAIL" | "CALL" | "VOICEMAIL";

export type ComplianceLeadSnapshot = {
  id: string;
  email?: string;
  phone?: string;
  consentStatus?: "UNKNOWN" | "OPTED_IN" | "OPTED_OUT" | "DO_NOT_CONTACT";
  consentEmail?: boolean;
  consentSms?: boolean;
  consentVoice?: boolean;
  doNotContact?: boolean;
  replyPaused?: boolean;
};

export type QuietHoursPolicy = {
  timezone: string;
  startHour: number;
  endHour: number;
  allowTransactional?: boolean;
};

export type ComplianceDecisionReason =
  | "ALLOWED"
  | "MISSING_CONSENT"
  | "OPTED_OUT"
  | "DO_NOT_CONTACT"
  | "REPLY_PAUSED"
  | "QUIET_HOURS"
  | "MISSING_DESTINATION";

export type ComplianceDecision = {
  allowed: boolean;
  reason: ComplianceDecisionReason;
  channel: ComplianceChannel;
  decidedAt: string;
  policyVersion: "nyra-compliance-v1";
};

export type InboundClassification = {
  stopDetected: boolean;
  unsubscribeDetected: boolean;
  replyPausesAutomation: boolean;
  normalizedBody: string;
};

export function classifyInboundMessage(body: string): InboundClassification {
  const normalizedBody = normalizeBody(body);
  const stopDetected = hasStopKeyword(normalizedBody);
  const unsubscribeDetected =
    /\b(UNSUBSCRIBE|REMOVE ME|EMAIL STOP)\b/i.test(normalizedBody) ||
    stopDetected;

  return {
    stopDetected,
    unsubscribeDetected,
    replyPausesAutomation: normalizedBody.length > 0 && !stopDetected,
    normalizedBody,
  };
}

export function evaluateSendEligibility(input: {
  lead: ComplianceLeadSnapshot;
  channel: ComplianceChannel;
  now: Date;
  quietHoursPolicy?: QuietHoursPolicy;
  transactional?: boolean;
}): ComplianceDecision {
  const { lead, channel, now, quietHoursPolicy, transactional = false } = input;

  if (lead.doNotContact || lead.consentStatus === "DO_NOT_CONTACT") {
    return decision(false, "DO_NOT_CONTACT", channel, now);
  }

  if (lead.replyPaused) {
    return decision(false, "REPLY_PAUSED", channel, now);
  }

  if (lead.consentStatus === "OPTED_OUT") {
    return decision(false, "OPTED_OUT", channel, now);
  }

  if (requiresPhone(channel) && !lead.phone) {
    return decision(false, "MISSING_DESTINATION", channel, now);
  }

  if (channel === "EMAIL" && !lead.email) {
    return decision(false, "MISSING_DESTINATION", channel, now);
  }

  if (quietHoursPolicy && isWithinQuietHours(now, quietHoursPolicy)) {
    if (!(transactional && quietHoursPolicy.allowTransactional)) {
      return decision(false, "QUIET_HOURS", channel, now);
    }
  }

  if (!hasChannelConsent(lead, channel)) {
    return decision(false, "MISSING_CONSENT", channel, now);
  }

  return decision(true, "ALLOWED", channel, now);
}

export function applyInboundComplianceState<
  TLead extends ComplianceLeadSnapshot,
>(lead: TLead, body: string): TLead {
  const classification = classifyInboundMessage(body);

  if (classification.stopDetected || classification.unsubscribeDetected) {
    return {
      ...lead,
      consentStatus: "DO_NOT_CONTACT",
      doNotContact: true,
      replyPaused: true,
    };
  }

  if (classification.replyPausesAutomation) {
    return {
      ...lead,
      replyPaused: true,
    };
  }

  return lead;
}

export function isWithinQuietHours(
  date: Date,
  policy: QuietHoursPolicy
): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: policy.timezone,
      hour: "2-digit",
      hour12: false,
    }).format(date)
  );

  if (policy.startHour === policy.endHour) {
    return true;
  }

  if (policy.startHour < policy.endHour) {
    return hour >= policy.startHour && hour < policy.endHour;
  }

  return hour >= policy.startHour || hour < policy.endHour;
}

function hasStopKeyword(normalizedBody: string): boolean {
  return stopKeywords.some((keyword) => {
    const pattern = keyword.replace(/\s+/g, "\\s*");
    return new RegExp(`\\b${pattern}\\b`, "i").test(normalizedBody);
  });
}

function normalizeBody(body: string): string {
  return body.replace(/\s+/g, " ").trim().toUpperCase();
}

function hasChannelConsent(
  lead: ComplianceLeadSnapshot,
  channel: ComplianceChannel
): boolean {
  if (lead.consentStatus === "OPTED_IN") {
    return true;
  }

  if (channel === "EMAIL") {
    return lead.consentEmail === true;
  }

  if (channel === "SMS") {
    return lead.consentSms === true;
  }

  return lead.consentVoice === true;
}

function requiresPhone(channel: ComplianceChannel): boolean {
  return channel === "SMS" || channel === "CALL" || channel === "VOICEMAIL";
}

function decision(
  allowed: boolean,
  reason: ComplianceDecisionReason,
  channel: ComplianceChannel,
  now: Date
): ComplianceDecision {
  return {
    allowed,
    reason,
    channel,
    decidedAt: now.toISOString(),
    policyVersion: "nyra-compliance-v1",
  };
}
