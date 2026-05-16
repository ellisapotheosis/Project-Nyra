import {
  buildCampaignStepIdempotencyKey,
  buildWorkflowDispatchPayload,
  mapUnifiedInboxEventToCampaignAction,
  shouldRetryWorkflowError,
  validateCampaignBuilderPayload,
} from "../../src/contracts/campaign-contracts.js";

describe("campaign engine prompt 05/06 contracts", () => {
  it("accepts dynamic campaign-builder steps that reference templates", () => {
    const result = validateCampaignBuilderPayload({
      campaignId: "campaign_new_lead",
      idempotencyKey: "builder:campaign_new_lead:v1",
      steps: [
        {
          id: "step_sms_1",
          channel: "sms",
          offset_minutes: 5,
          templateId: "tmpl_new_lead_sms_intro",
        },
      ],
    });

    expect(result).toEqual({ valid: true, errors: [] });
  });

  it("rejects hardcoded message copy in campaign-builder steps", () => {
    const result = validateCampaignBuilderPayload({
      campaignId: "campaign_new_lead",
      idempotencyKey: "builder:campaign_new_lead:v1",
      steps: [
        {
          id: "step_sms_1",
          channel: "sms",
          offset_minutes: 5,
          templateId: "tmpl_new_lead_sms_intro",
          body: "Inline campaign copy belongs in templates.",
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "steps[0].body must not contain inline message copy"
    );
  });

  it("builds idempotent n8n dispatch payloads for campaign steps", () => {
    const payload = buildWorkflowDispatchPayload({
      enrollment: {
        id: "enroll_123",
        leadId: "lead_123",
        campaignId: "campaign_new_lead",
        mergeContextRef: "crm:lead_123",
      },
      step: {
        id: "step_sms_1",
        channel: "sms",
        templateId: "tmpl_new_lead_sms_intro",
      },
      now: new Date("2026-05-11T18:00:00.000Z"),
    });

    expect(payload.idempotencyKey).toBe(
      buildCampaignStepIdempotencyKey({
        enrollmentId: "enroll_123",
        stepId: "step_sms_1",
      })
    );
    expect(payload.retryPolicy.maxAttempts).toBe(3);
  });

  it("maps unified inbox directives to terminal stop or reply pause actions", () => {
    expect(
      mapUnifiedInboxEventToCampaignAction({ campaignDirective: "STOP" })
    ).toMatchObject({ action: "STOP_ENROLLMENT", terminal: true });
    expect(
      mapUnifiedInboxEventToCampaignAction({ campaignDirective: "REPLY_PAUSE" })
    ).toMatchObject({ action: "PAUSE_AND_NOTIFY_OWNER", terminal: false });
  });

  it("retries transient provider failures only within the retry budget", () => {
    expect(
      shouldRetryWorkflowError({ code: "PROVIDER_TIMEOUT" }, 1)
    ).toBe(true);
    expect(shouldRetryWorkflowError({ statusCode: 502 }, 3)).toBe(false);
    expect(shouldRetryWorkflowError({ code: "BAD_REQUEST" }, 1)).toBe(false);
  });
});
