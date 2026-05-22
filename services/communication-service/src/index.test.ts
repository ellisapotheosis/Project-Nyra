import { describe, expect, it } from "vitest";
import { normalizeProviderCallback, shouldRunInboundCompliance } from "./index";

describe("communication-service", () => {
  it("normalizes provider callbacks into audit ledger entries", () => {
    expect(
      normalizeProviderCallback({
        provider: "TWILIO",
        providerMessageId: "SM123",
        leadId: "lead-1",
        channel: "SMS",
        direction: "OUTBOUND",
        status: "DELIVERED",
        occurredAt: "2026-05-19T16:00:00.000Z",
      })
    ).toMatchObject({
      entityType: "COMMUNICATION_LOG",
      entityId: "SM123",
      action: "MESSAGE_DELIVERED",
      riskLevel: "BORROWER_COMMUNICATION",
    });
  });

  it("marks inbound replies as compliance-critical", () => {
    const payload = {
      provider: "TWILIO" as const,
      providerMessageId: "SM124",
      leadId: "lead-1",
      channel: "SMS" as const,
      direction: "INBOUND" as const,
      status: "REPLIED" as const,
      body: "stop",
      occurredAt: "2026-05-19T16:00:00.000Z",
    };

    expect(normalizeProviderCallback(payload)).toMatchObject({
      action: "INBOUND_REPLY_RECEIVED",
      riskLevel: "COMPLIANCE_CRITICAL",
    });
    expect(shouldRunInboundCompliance(payload)).toBe(true);
  });
});
