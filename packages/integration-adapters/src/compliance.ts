import type { Channel, Lead } from "@nyra/domain-models";
import { isComplianceTrigger } from "@nyra/domain-models";
import { MockTwentyClient, type ITwentyClient } from "./index";

export interface ComplianceStatus {
  canContact: boolean;
  reason?: string;
}

export class ComplianceService {
  private readonly crm: ITwentyClient;

  constructor(crm: ITwentyClient = new MockTwentyClient()) {
    this.crm = crm;
  }

  static isStopRequest(message: string): boolean {
    return isComplianceTrigger(message);
  }

  async checkConsent(lead: Lead, channel: Channel): Promise<ComplianceStatus> {
    if (lead.doNotContact) {
      return { canContact: false, reason: "DO_NOT_CONTACT_FLAG" };
    }

    if (
      lead.consentStatus === "OPTED_OUT" ||
      lead.consentStatus === "DO_NOT_CONTACT"
    ) {
      return { canContact: false, reason: lead.consentStatus };
    }

    if (
      (channel === "SMS" || channel === "CALL" || channel === "VOICEMAIL") &&
      !lead.phone
    ) {
      return { canContact: false, reason: "MISSING_PHONE" };
    }

    if ((channel === "EMAIL" || channel === "GMAIL") && !lead.email) {
      return { canContact: false, reason: "MISSING_EMAIL" };
    }

    return { canContact: true };
  }

  async handleStop(lead: Lead): Promise<Lead> {
    const updatedLead: Lead = {
      ...lead,
      doNotContact: true,
      consentStatus: "OPTED_OUT",
      stage: "DO_NOT_CONTACT",
      updatedAt: new Date(),
    };

    return this.crm.upsertLead(updatedLead);
  }
}
