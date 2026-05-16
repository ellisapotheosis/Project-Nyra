export const CAMPAIGN_CONTRACT_VERSION = "2026-05-13.prompt-05-06";

export const DEFAULT_RETRY_POLICY = Object.freeze({
  maxAttempts: 3,
  backoffSeconds: [60, 300, 900],
  retryOn: ["PROVIDER_TIMEOUT", "PROVIDER_5XX", "RATE_LIMITED"],
});

export const NEW_LEAD_NURTURE_FLOW = Object.freeze({
  id: "new-lead-nurture-v1",
  name: "New Lead Nurture",
  version: CAMPAIGN_CONTRACT_VERSION,
  description:
    "Reference sequence for a newly captured mortgage lead. Message copy lives in templates, not workflow graphs.",
  steps: [
    {
      id: "new-lead-sms-01",
      channel: "sms",
      offset_minutes: 5,
      templateId: "tmpl_new_lead_sms_intro",
      purpose: "confirm receipt and set broker expectation",
    },
    {
      id: "new-lead-email-01",
      channel: "email",
      offset_minutes: 30,
      templateId: "tmpl_new_lead_email_options",
      purpose: "send next-step checklist and intake link",
    },
    {
      id: "new-lead-sms-02",
      channel: "sms",
      offset_minutes: 1440,
      templateId: "tmpl_new_lead_sms_follow_up",
      purpose: "follow up if no borrower reply or broker handoff happened",
    },
  ],
});

export const CAMPAIGN_SEQUENCE_PLACEHOLDERS = Object.freeze([
  "pre-approval-follow-up",
  "application-in-progress",
  "post-close-delight",
  "rate-alert",
  "re-engagement",
  "long-nurture",
]);

const CHANNELS = new Set(["sms", "email", "voicemail"]);
const DISALLOWED_INLINE_COPY_FIELDS = ["body", "subject", "message", "copy"];

export function validateCampaignBuilderPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    return {
      valid: false,
      errors: ["payload must be an object"],
    };
  }

  requireString(payload.campaignId, "campaignId", errors);
  requireString(payload.idempotencyKey, "idempotencyKey", errors);

  if (!Array.isArray(payload.steps) || payload.steps.length === 0) {
    errors.push("steps must contain at least one step");
  } else {
    payload.steps.forEach((step, index) =>
      validateBuilderStep(step, index, errors)
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function buildWorkflowDispatchPayload({ enrollment, step, now }) {
  if (!enrollment?.id || !step?.id || !step?.templateId) {
    throw new Error("INVALID_WORKFLOW_DISPATCH_INPUT");
  }

  return {
    contractVersion: CAMPAIGN_CONTRACT_VERSION,
    enrollmentId: enrollment.id,
    leadId: enrollment.leadId ?? enrollment.contactId,
    campaignId: enrollment.campaignId,
    stepId: step.id,
    channel: step.channel,
    templateId: step.templateId,
    mergeContextRef: enrollment.mergeContextRef,
    scheduledFor: step.scheduledFor ?? now.toISOString(),
    idempotencyKey: buildCampaignStepIdempotencyKey({
      enrollmentId: enrollment.id,
      stepId: step.id,
    }),
    retryPolicy: DEFAULT_RETRY_POLICY,
  };
}

export function buildCampaignStepIdempotencyKey({ enrollmentId, stepId }) {
  return `campaign:${enrollmentId}:step:${stepId}`;
}

export function mapUnifiedInboxEventToCampaignAction(event) {
  switch (event?.campaignDirective) {
    case "STOP":
    case "UNSUBSCRIBE":
      return {
        action: "STOP_ENROLLMENT",
        terminal: true,
        reason: event.campaignDirective,
      };
    case "REPLY_PAUSE":
      return {
        action: "PAUSE_AND_NOTIFY_OWNER",
        terminal: false,
        reason: "BORROWER_REPLY",
      };
    case "BOUNCE_SUPPRESSION":
      return {
        action: "SUPPRESS_CHANNEL",
        terminal: false,
        reason: "DELIVERY_SUPPRESSION",
      };
    default:
      return {
        action: "RECORD_ONLY",
        terminal: false,
        reason: "DELIVERY_EVENT",
      };
  }
}

export function shouldRetryWorkflowError(
  error,
  attempt,
  retryPolicy = DEFAULT_RETRY_POLICY
) {
  if (attempt >= retryPolicy.maxAttempts) {
    return false;
  }

  const code =
    error?.code ??
    error?.category ??
    (error?.statusCode >= 500 ? "PROVIDER_5XX" : undefined);

  return retryPolicy.retryOn.includes(code);
}

function validateBuilderStep(step, index, errors) {
  const prefix = `steps[${index}]`;
  requireString(step?.id, `${prefix}.id`, errors);
  requireString(step?.templateId, `${prefix}.templateId`, errors);

  if (!CHANNELS.has(step?.channel)) {
    errors.push(`${prefix}.channel must be sms, email, or voicemail`);
  }

  if (!Number.isInteger(step?.offset_minutes) || step.offset_minutes < 0) {
    errors.push(`${prefix}.offset_minutes must be a non-negative integer`);
  }

  for (const field of DISALLOWED_INLINE_COPY_FIELDS) {
    if (typeof step?.[field] === "string" && step[field].trim().length > 0) {
      errors.push(`${prefix}.${field} must not contain inline message copy`);
    }
  }
}

function requireString(value, field, errors) {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${field} is required`);
  }
}
