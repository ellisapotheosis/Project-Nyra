import { describe, expect, it } from "vitest";
import {
  applyInboundLeadState,
  classifyInboundCompliance,
  preflightOutbound,
} from "./index";

const lead = {
  id: "11111111-1111-4111-8111-111111111111",
  firstName: "Test",
  lastName: "Lead",
  email: "lead@example.com",
  phone: "+15551234567",
  source: "test",
  consentStatus: "OPTED_IN" as const,
  doNotContact: false,
};

describe("compliance-service", () => {
  it("blocks opted-out outbound communication", () => {
    expect(
      preflightOutbound({
        lead: { ...lead, consentStatus: "OPTED_OUT" },
        channel: "SMS",
        now: new Date("2026-05-19T16:00:00.000Z"),
      })
    ).toMatchObject({
      allowed: false,
      reason: "OPTED_OUT",
    });
  });

  it("emits STOP compliance events for inbound replies", () => {
    expect(
      classifyInboundCompliance({
        leadId: lead.id,
        channel: "SMS",
        body: "STOP",
        receivedAt: "2026-05-19T16:00:00.000Z",
      }).event
    ).toMatchObject({
      eventType: "STOP_DETECTED",
      subjectType: "LEAD",
    });
  });

  it("applies STOP replies to the lead state immediately", () => {
    expect(applyInboundLeadState(lead, "stop")).toMatchObject({
      consentStatus: "DO_NOT_CONTACT",
      doNotContact: true,
      metadata: {
        replyPaused: true,
      },
    });
  });
});
