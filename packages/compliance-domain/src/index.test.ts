import { describe, expect, it } from "vitest";
import {
  applyInboundComplianceState,
  classifyInboundMessage,
  evaluateSendEligibility,
} from "./index";

const now = new Date("2026-05-19T16:00:00.000Z");

describe("compliance-domain", () => {
  it("detects STOP/unsubscribe and converts the lead to do-not-contact", () => {
    const lead = applyInboundComplianceState(
      {
        id: "lead-1",
        phone: "+15551234567",
        consentStatus: "OPTED_IN" as const,
      },
      "please stop texting me"
    );

    expect(classifyInboundMessage("please stop texting me")).toMatchObject({
      stopDetected: true,
      unsubscribeDetected: true,
    });
    expect(lead).toMatchObject({
      consentStatus: "DO_NOT_CONTACT",
      doNotContact: true,
      replyPaused: true,
    });
  });

  it("pauses automation on ordinary borrower replies", () => {
    const lead = applyInboundComplianceState(
      { id: "lead-1", consentStatus: "OPTED_IN" as const },
      "Can you call me tomorrow?"
    );

    expect(lead.replyPaused).toBe(true);
    expect(lead.doNotContact).toBeUndefined();
  });

  it("blocks outbound sends during quiet hours", () => {
    expect(
      evaluateSendEligibility({
        lead: {
          id: "lead-1",
          phone: "+15551234567",
          consentSms: true,
        },
        channel: "SMS",
        now: new Date("2026-05-20T04:00:00.000Z"),
        quietHoursPolicy: {
          timezone: "America/Los_Angeles",
          startHour: 20,
          endHour: 8,
        },
      })
    ).toMatchObject({
      allowed: false,
      reason: "QUIET_HOURS",
    });
  });

  it("allows consented outbound sends outside quiet hours", () => {
    expect(
      evaluateSendEligibility({
        lead: {
          id: "lead-1",
          email: "borrower@example.com",
          consentEmail: true,
        },
        channel: "EMAIL",
        now,
      })
    ).toMatchObject({
      allowed: true,
      reason: "ALLOWED",
    });
  });
});
