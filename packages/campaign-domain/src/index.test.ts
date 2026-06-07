import { describe, expect, it } from "vitest";
import {
  advanceCampaignStep,
  canSendCampaignStep,
  transitionCampaignState,
  type CampaignEnrollment,
  type CampaignStep,
} from "./index";

const enrollment: CampaignEnrollment = {
  id: "enrollment-1",
  leadId: "lead-1",
  campaignId: "speed-to-lead",
  state: "ACTIVE",
  currentStepIndex: 0,
  enrolledAt: "2026-05-19T15:00:00.000Z",
};

const steps: CampaignStep[] = [
  {
    id: "sms-1",
    channel: "SMS",
    delayMinutes: 0,
    templateId: "intro-sms",
  },
  {
    id: "email-1",
    channel: "EMAIL",
    delayMinutes: 60,
    templateId: "quote-ready-email",
    requiresApproval: true,
  },
];

describe("campaign-domain", () => {
  it("enforces valid state transitions", () => {
    expect(transitionCampaignState("DRAFT", "ACTIVATE")).toBe("ACTIVE");
    expect(transitionCampaignState("ACTIVE", "PAUSE")).toBe("PAUSED");
    expect(() => transitionCampaignState("STOPPED", "RESUME")).toThrow();
  });

  it("blocks sends when compliance has not approved the touch", () => {
    expect(
      canSendCampaignStep({
        enrollment,
        steps,
        now: new Date("2026-05-19T16:00:00.000Z"),
        complianceAllowed: false,
      })
    ).toMatchObject({
      eligible: false,
      reason: "COMPLIANCE_BLOCK",
    });
  });

  it("blocks approval-required steps until HITL approval exists", () => {
    expect(
      canSendCampaignStep({
        enrollment: { ...enrollment, currentStepIndex: 1 },
        steps,
        now: new Date("2026-05-19T16:00:00.000Z"),
        complianceAllowed: true,
      })
    ).toMatchObject({
      eligible: false,
      reason: "APPROVAL_REQUIRED",
    });
  });

  it("advances to the next scheduled step deterministically", () => {
    expect(
      advanceCampaignStep(
        enrollment,
        steps,
        new Date("2026-05-19T16:00:00.000Z")
      )
    ).toMatchObject({
      state: "ACTIVE",
      currentStepIndex: 1,
      nextTouchAt: "2026-05-19T17:00:00.000Z",
    });
  });
});
