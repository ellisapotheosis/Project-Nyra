export const serviceName = "communication-service";

export type ProviderChannel = "SMS" | "EMAIL" | "VOICE" | "VOICEMAIL";

export type ProviderCallbackPayload = {
  provider: "TWILIO" | "SENDGRID" | "MAILGUN" | "REBUMP" | "OTHER";
  providerMessageId: string;
  leadId: string;
  channel: ProviderChannel;
  direction: "INBOUND" | "OUTBOUND";
  status: "QUEUED" | "SENT" | "DELIVERED" | "BOUNCED" | "FAILED" | "REPLIED";
  body?: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
};

export type CommunicationLedgerEntry = {
  entityType: "COMMUNICATION_LOG";
  entityId: string;
  action: string;
  performer: "communication-service";
  riskLevel: "BORROWER_COMMUNICATION" | "COMPLIANCE_CRITICAL";
  occurredAt: string;
  details: Record<string, unknown>;
};

export function normalizeProviderCallback(
  payload: ProviderCallbackPayload
): CommunicationLedgerEntry {
  const isInboundReply =
    payload.direction === "INBOUND" || payload.status === "REPLIED";

  return {
    entityType: "COMMUNICATION_LOG",
    entityId: payload.providerMessageId,
    action: isInboundReply
      ? "INBOUND_REPLY_RECEIVED"
      : `MESSAGE_${payload.status}`,
    performer: "communication-service",
    riskLevel: isInboundReply
      ? "COMPLIANCE_CRITICAL"
      : "BORROWER_COMMUNICATION",
    occurredAt: payload.occurredAt,
    details: {
      provider: payload.provider,
      leadId: payload.leadId,
      channel: payload.channel,
      direction: payload.direction,
      status: payload.status,
      bodyPreview: payload.body?.slice(0, 160),
      metadata: payload.metadata ?? {},
    },
  };
}

export function shouldRunInboundCompliance(
  payload: ProviderCallbackPayload
): boolean {
  return payload.direction === "INBOUND" && Boolean(payload.body?.trim());
}
