import { describe, expect, it } from "vitest";
import { classifyInboundCompliance, preflightOutbound } from "./index";

const baseLead = {
  id: "lead_123",
  firstName: "Ada",
  lastName: "Borrower",
  email: "ada@example.com",
  phone: "15550001111",
  source: "ratehunter",
  consentStatus: "OPTED_IN" as const,
  consentSms: "OPTED_IN" as const,
  consentEmail: "OPTED_IN" as const,
  consentVoice: "OPTED_IN" as const,
};

describe("compliance service core", () => {
  it("blocks STOP/suppressed leads", () => {
    const result = preflightOutbound({
      lead: { ...baseLead, doNotContact: true },
      channel: "SMS",
      now: new Date("2026-05-11T18:00:00.000Z"),
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("DO_NOT_CONTACT");
  });

  it("blocks quiet-hours outreach", () => {
    const result = preflightOutbound({
      lead: baseLead,
      channel: "SMS",
      now: new Date("2026-05-11T21:00:00-07:00"),
      quietHoursPolicy: {
        timezone: "America/Los_Angeles",
        startHour: 20,
        endHour: 8,
        allowTransactional: false,
      },
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("QUIET_HOURS");
  });

  it("detects inbound STOP and unsubscribe events", () => {
    const stop = classifyInboundCompliance({
      leadId: "lead_123",
      channel: "SMS",
      body: "STOP",
      receivedAt: "2026-05-11T18:00:00.000Z",
    });

    expect(stop.stopDetected).toBe(true);
    expect(stop.event?.eventType).toBe("STOP_DETECTED");
  });
});
