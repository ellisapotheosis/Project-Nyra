import {
  advanceCampaignStep,
  canSendCampaignStep,
  transitionCampaignState,
  type CampaignEnrollment,
  type CampaignEvent,
  type CampaignState,
  type CampaignStep,
} from "@nyra/campaign-domain";
import { evaluateSendEligibility } from "@nyra/compliance-domain";

export const serviceName = "campaign-service";

export type CampaignServiceLead = {
  id: string;
  email?: string;
  phone?: string;
  consentStatus?: "UNKNOWN" | "OPTED_IN" | "OPTED_OUT" | "DO_NOT_CONTACT";
  consentEmail?: boolean;
  consentSms?: boolean;
  consentVoice?: boolean;
  doNotContact?: boolean;
  replyPaused?: boolean;
};

export class CampaignService {
  transition(state: CampaignState, event: CampaignEvent): CampaignState {
    return transitionCampaignState(state, event);
  }

  evaluateSend(input: {
    lead: CampaignServiceLead;
    enrollment: CampaignEnrollment;
    steps: CampaignStep[];
    now: Date;
    humanApproved?: boolean;
  }) {
    const step = input.steps[input.enrollment.currentStepIndex];
    const complianceDecision = step
      ? evaluateSendEligibility({
          lead: input.lead,
          channel: step.channel,
          now: input.now,
          quietHoursPolicy: {
            timezone: "America/Los_Angeles",
            startHour: 20,
            endHour: 8,
          },
        })
      : undefined;

    return {
      complianceDecision,
      sendEligibility: canSendCampaignStep({
        enrollment: input.enrollment,
        steps: input.steps,
        now: input.now,
        complianceAllowed: complianceDecision?.allowed ?? false,
        humanApproved: input.humanApproved,
      }),
    };
  }

  advance(
    enrollment: CampaignEnrollment,
    steps: CampaignStep[],
    sentAt: Date
  ): CampaignEnrollment {
    return advanceCampaignStep(enrollment, steps, sentAt);
  }
}
