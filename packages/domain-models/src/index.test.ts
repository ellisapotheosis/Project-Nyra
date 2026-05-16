import { describe, expect, it } from "vitest";
import {
  CampaignEnrollmentSchema,
  LeadSchema,
  PricingScenarioSchema,
  ProposedActionSchema,
  QuoteSchema,
  applyCampaignEnrollmentEvent,
  isStopRequest,
  isUnsubscribeRequest,
  isWithinQuietHours,
  requiresHumanApproval,
} from "./index";

describe("Domain Models", () => {
  it("should validate a correct lead", () => {
    const validLead = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      source: "TEST_SOURCE",
    };
    const result = LeadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
  });

  it("should fail on invalid email", () => {
    const invalidLead = {
      firstName: "Test",
      lastName: "User",
      email: "invalid-email",
      source: "TEST_SOURCE",
    };
    const result = LeadSchema.safeParse(invalidLead);
    expect(result.success).toBe(false);
  });

  it("should enforce default stage", () => {
    const lead = LeadSchema.parse({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      source: "TEST_SOURCE",
    });
    expect(lead.stage).toBe("NEW");
  });

  it("detects STOP and unsubscribe requests as compliance-critical input", () => {
    expect(isStopRequest("Please STOP texting me")).toBe(true);
    expect(isStopRequest("I want to opt out")).toBe(true);
    expect(isStopRequest("Can you call tomorrow?")).toBe(false);
    expect(isUnsubscribeRequest("unsubscribe this email")).toBe(true);
  });

  it("blocks sends during quiet hours", () => {
    const quietTime = new Date("2026-05-11T21:15:00-07:00");
    expect(isWithinQuietHours(quietTime, { startHour: 20, endHour: 8 })).toBe(
      true
    );
  });

  it("keeps STOP as a terminal campaign enrollment state", () => {
    const stopped = applyCampaignEnrollmentEvent("ACTIVE", "STOP");
    expect(stopped).toBe("STOPPED");
    expect(applyCampaignEnrollmentEvent(stopped, "RESUME")).toBe("STOPPED");

    const enrollment = CampaignEnrollmentSchema.parse({
      leadId: "lead_123",
      campaignId: "campaign_123",
      status: stopped,
      stoppedAt: "2026-05-11T18:00:00.000Z",
      stopReason: "STOP_DETECTED",
    });
    expect(enrollment.status).toBe("STOPPED");
  });

  it("validates the canonical three-option quote response shape", () => {
    const optionBase = {
      rate: 6.75,
      apr: 6.94,
      points: 0,
      monthlyPayment: { amountCents: 261000, currency: "USD" },
      cashToClose: { amountCents: 4200000, currency: "USD" },
      closingCosts: { amountCents: 950000, currency: "USD" },
      assumptions: ["740 FICO", "Primary residence"],
      calculationTrace: { source: "quote-api" },
    };

    const result = QuoteSchema.safeParse({
      leadId: "lead_123",
      status: "READY",
      options: [
        {
          ...optionBase,
          id: "lowest-payment",
          kind: "LOWEST_PAYMENT",
          label: "Lowest payment",
        },
        { ...optionBase, id: "balanced", kind: "BALANCED", label: "Balanced" },
        {
          ...optionBase,
          id: "lowest-cost",
          kind: "LOWEST_COST",
          label: "Lowest cost",
        },
      ],
      createdAt: "2026-05-11T18:00:00.000Z",
    });

    expect(result.success).toBe(true);
    expect(
      PricingScenarioSchema.safeParse(
        result.success ? result.data.options[0] : {}
      ).success
    ).toBe(true);
  });

  it("requires human approval for risky assistant proposed actions", () => {
    expect(requiresHumanApproval("READ_ONLY")).toBe(false);
    expect(requiresHumanApproval("CRM_MUTATION")).toBe(true);
    expect(requiresHumanApproval("BORROWER_COMMUNICATION")).toBe(true);

    const proposedAction = ProposedActionSchema.parse({
      runId: "run_123",
      actionType: "send_quote_sms",
      targetService: "COMMUNICATION_SERVICE",
      riskLevel: "BORROWER_COMMUNICATION",
      payload: { leadId: "lead_123", messageId: "msg_123" },
      requestedBy: { id: "assistant", type: "ASSISTANT" },
      createdAt: "2026-05-11T18:00:00.000Z",
    });
    expect(proposedAction.approvalStatus).toBe("PENDING");
  });
});
