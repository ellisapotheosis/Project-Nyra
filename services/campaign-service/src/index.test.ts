import { describe, expect, it } from "vitest";
import { CampaignService, InMemoryCampaignEnrollmentStore } from "./index";

const enrollment = {
  id: "enrollment-1",
  leadId: "lead-1",
  campaignId: "speed-to-lead",
  state: "ACTIVE" as const,
  currentStepIndex: 0,
  enrolledAt: "2026-05-19T15:00:00.000Z",
};

const steps = [
  {
    id: "sms-1",
    channel: "SMS" as const,
    delayMinutes: 0,
    templateId: "intro-sms",
  },
];

describe("CampaignService", () => {
  it("blocks campaign sends when compliance blocks the lead", () => {
    const service = new CampaignService();

    expect(
      service.evaluateSend({
        lead: {
          id: "lead-1",
          phone: "+15551234567",
          doNotContact: true,
        },
        enrollment,
        steps,
        now: new Date("2026-05-19T16:00:00.000Z"),
      }).sendEligibility
    ).toMatchObject({
      eligible: false,
      reason: "COMPLIANCE_BLOCK",
    });
  });

  it("allows ready campaign sends when the lead has channel consent", () => {
    const service = new CampaignService();

    expect(
      service.evaluateSend({
        lead: {
          id: "lead-1",
          phone: "+15551234567",
          consentSms: true,
        },
        enrollment,
        steps,
        now: new Date("2026-05-19T16:00:00.000Z"),
      }).sendEligibility
    ).toMatchObject({
      eligible: true,
      reason: "READY",
    });
  });

  it("persists enrollment state and next-touch scheduling", async () => {
    const store = new InMemoryCampaignEnrollmentStore();
    const service = new CampaignService(store);

    const persisted = await service.enroll({
      enrollment,
      steps,
      now: new Date("2026-05-19T16:00:00.000Z"),
    });
    const advanced = await service.recordStepSent(
      persisted.id,
      new Date("2026-05-19T16:05:00.000Z")
    );

    expect(persisted).toMatchObject({
      state: "ACTIVE",
      currentStepIndex: 0,
      nextTouchAt: "2026-05-19T16:00:00.000Z",
    });
    expect(advanced).toMatchObject({
      state: "COMPLETED",
      currentStepIndex: 1,
      nextTouchAt: undefined,
    });
    await expect(store.listByLead("lead-1")).resolves.toHaveLength(1);
  });
});
