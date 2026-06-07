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
  constructor(private readonly store?: CampaignEnrollmentStore) {}

  async enroll(input: {
    enrollment: CampaignEnrollment;
    steps: CampaignStep[];
    now?: Date;
  }): Promise<CampaignEnrollment> {
    const firstStep = input.steps[0];
    const enrolledAt = input.now ?? new Date(input.enrollment.enrolledAt);
    const enrollment = {
      ...input.enrollment,
      nextTouchAt: firstStep
        ? new Date(
            enrolledAt.getTime() + firstStep.delayMinutes * 60_000
          ).toISOString()
        : undefined,
    };

    await this.store?.save(enrollment, input.steps);
    return enrollment;
  }

  transition(state: CampaignState, event: CampaignEvent): CampaignState {
    return transitionCampaignState(state, event);
  }

  async transitionEnrollment(
    enrollmentId: string,
    event: CampaignEvent
  ): Promise<CampaignEnrollment> {
    const record = await this.requireRecord(enrollmentId);
    const next = {
      ...record.enrollment,
      state: transitionCampaignState(record.enrollment.state, event),
    };
    await this.store?.save(next, record.steps);
    return next;
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

  async recordStepSent(
    enrollmentId: string,
    sentAt: Date
  ): Promise<CampaignEnrollment> {
    const record = await this.requireRecord(enrollmentId);
    const next = advanceCampaignStep(record.enrollment, record.steps, sentAt);
    await this.store?.save(next, record.steps);
    return next;
  }

  async getEnrollment(enrollmentId: string) {
    return this.store?.get(enrollmentId);
  }

  private async requireRecord(enrollmentId: string) {
    const record = await this.store?.get(enrollmentId);
    if (!record) {
      throw new Error(`Campaign enrollment ${enrollmentId} was not found`);
    }

    return record;
  }
}

export type CampaignEnrollmentRecord = {
  enrollment: CampaignEnrollment;
  steps: CampaignStep[];
};

export interface CampaignEnrollmentStore {
  get(enrollmentId: string): Promise<CampaignEnrollmentRecord | undefined>;
  save(
    enrollment: CampaignEnrollment,
    steps: CampaignStep[]
  ): Promise<CampaignEnrollmentRecord>;
  listByLead(leadId: string): Promise<CampaignEnrollmentRecord[]>;
}

export class InMemoryCampaignEnrollmentStore implements CampaignEnrollmentStore {
  private readonly records = new Map<string, CampaignEnrollmentRecord>();

  async get(enrollmentId: string) {
    return this.records.get(enrollmentId);
  }

  async save(enrollment: CampaignEnrollment, steps: CampaignStep[]) {
    const record = { enrollment, steps };
    this.records.set(enrollment.id, record);
    return record;
  }

  async listByLead(leadId: string) {
    return Array.from(this.records.values()).filter(
      (record) => record.enrollment.leadId === leadId
    );
  }
}
