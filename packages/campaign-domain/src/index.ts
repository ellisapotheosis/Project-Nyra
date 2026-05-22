export const campaignStates = [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "STOPPED",
  "COMPLETED",
  "FAILED",
] as const;
export type CampaignState = (typeof campaignStates)[number];

export type CampaignEvent =
  | "ACTIVATE"
  | "PAUSE"
  | "RESUME"
  | "STOP"
  | "COMPLETE"
  | "FAIL"
  | "REOPEN";

export type CampaignStep = {
  id: string;
  channel: "SMS" | "EMAIL" | "CALL" | "VOICEMAIL";
  delayMinutes: number;
  templateId: string;
  requiresApproval?: boolean;
};

export type CampaignEnrollment = {
  id: string;
  leadId: string;
  campaignId: string;
  state: CampaignState;
  currentStepIndex: number;
  enrolledAt: string;
  nextTouchAt?: string;
  stoppedReason?: string;
};

export type CampaignSendEligibility = {
  eligible: boolean;
  reason:
    | "READY"
    | "NOT_ACTIVE"
    | "NO_STEP"
    | "FUTURE_TOUCH"
    | "COMPLIANCE_BLOCK"
    | "APPROVAL_REQUIRED";
  step?: CampaignStep;
};

const transitions: Record<
  CampaignState,
  Partial<Record<CampaignEvent, CampaignState>>
> = {
  DRAFT: { ACTIVATE: "ACTIVE", STOP: "STOPPED" },
  ACTIVE: {
    PAUSE: "PAUSED",
    STOP: "STOPPED",
    COMPLETE: "COMPLETED",
    FAIL: "FAILED",
  },
  PAUSED: { RESUME: "ACTIVE", STOP: "STOPPED", FAIL: "FAILED" },
  STOPPED: { REOPEN: "PAUSED" },
  COMPLETED: { REOPEN: "PAUSED" },
  FAILED: { REOPEN: "PAUSED" },
};

export function transitionCampaignState(
  state: CampaignState,
  event: CampaignEvent
): CampaignState {
  const nextState = transitions[state]?.[event];

  if (!nextState) {
    throw new Error(`Invalid campaign transition: ${state} -> ${event}`);
  }

  return nextState;
}

export function canSendCampaignStep(input: {
  enrollment: CampaignEnrollment;
  steps: CampaignStep[];
  now: Date;
  complianceAllowed: boolean;
  humanApproved?: boolean;
}): CampaignSendEligibility {
  const step = input.steps[input.enrollment.currentStepIndex];

  if (input.enrollment.state !== "ACTIVE") {
    return { eligible: false, reason: "NOT_ACTIVE", step };
  }

  if (!step) {
    return { eligible: false, reason: "NO_STEP" };
  }

  if (
    input.enrollment.nextTouchAt &&
    new Date(input.enrollment.nextTouchAt).getTime() > input.now.getTime()
  ) {
    return { eligible: false, reason: "FUTURE_TOUCH", step };
  }

  if (!input.complianceAllowed) {
    return { eligible: false, reason: "COMPLIANCE_BLOCK", step };
  }

  if (step.requiresApproval && !input.humanApproved) {
    return { eligible: false, reason: "APPROVAL_REQUIRED", step };
  }

  return { eligible: true, reason: "READY", step };
}

export function advanceCampaignStep(
  enrollment: CampaignEnrollment,
  steps: CampaignStep[],
  sentAt: Date
): CampaignEnrollment {
  const nextStepIndex = enrollment.currentStepIndex + 1;
  const nextStep = steps[nextStepIndex];

  if (!nextStep) {
    return {
      ...enrollment,
      state: "COMPLETED",
      currentStepIndex: nextStepIndex,
      nextTouchAt: undefined,
    };
  }

  return {
    ...enrollment,
    currentStepIndex: nextStepIndex,
    nextTouchAt: new Date(
      sentAt.getTime() + nextStep.delayMinutes * 60_000
    ).toISOString(),
  };
}
