import type { Channel, Lead } from "@nyra/domain-models";
import { MockTwentyClient, type ITwentyClient } from "./index";

export interface ComplianceStatus {
  canContact: boolean;
  reason?: string;
}

export type ReplyClassification =
  | "STOP_DNC"
  | "WRONG_NUMBER"
  | "POSITIVE_INTENT"
  | "QUOTE_REQUEST"
  | "DOCS_REQUEST"
  | "ANGRY_ESCALATION"
  | "APPOINTMENT_INTENT"
  | "OTHER";

export class ComplianceService {
  private readonly crm: ITwentyClient;

  constructor(crm: ITwentyClient = new MockTwentyClient()) {
    this.crm = crm;
  }

  static isStopRequest(message: string): boolean {
    const normalized = message.toUpperCase();
    const stopKeywords = [
      "STOP",
      "UNSUBSCRIBE",
      "REMOVE",
      "CANCEL",
      "OPT OUT",
      "DNC",
    ];

    return stopKeywords.some((keyword) => normalized.includes(keyword));
  }

  static classifyReply(message: string): ReplyClassification {
    const normalized = message.toUpperCase();

    if (ComplianceService.isStopRequest(message)) return "STOP_DNC";
    if (/\bWRONG\s+NUMBER\b/.test(normalized)) return "WRONG_NUMBER";
    if (/\b(QUOTE|RATE|PAYMENT|APR)\b/.test(normalized)) return "QUOTE_REQUEST";
    if (/\b(DOC|DOCUMENT|UPLOAD|PAYSTUB|W2|BANK)\b/.test(normalized)) {
      return "DOCS_REQUEST";
    }
    if (/\b(MEET|CALL|APPOINTMENT|CALENDLY|SCHEDULE)\b/.test(normalized)) {
      return "APPOINTMENT_INTENT";
    }
    if (/\b(ANGRY|MAD|COMPLAINT|LAWSUIT|ATTORNEY)\b/.test(normalized)) {
      return "ANGRY_ESCALATION";
    }
    if (/\b(YES|INTERESTED|GO AHEAD|TELL ME MORE)\b/.test(normalized)) {
      return "POSITIVE_INTENT";
    }

    return "OTHER";
  }

  async checkConsent(lead: Lead, channel: Channel): Promise<ComplianceStatus> {
    if (lead.doNotContact) {
      return { canContact: false, reason: "DO_NOT_CONTACT_FLAG" };
    }

    if (lead.consentStatus === "UNKNOWN") {
      return { canContact: false, reason: "MISSING_CONSENT" };
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

  async assertCanSend(lead: Lead, channel: Channel): Promise<void> {
    const status = await this.checkConsent(lead, channel);

    if (!status.canContact) {
      throw new Error(`Outbound blocked by compliance: ${status.reason}`);
    }
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
