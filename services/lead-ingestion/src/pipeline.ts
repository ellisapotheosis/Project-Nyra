import { z } from 'zod';
import { Lead, LeadSchema } from '@nyra/domain-models';
import {
  ITwentyClient,
  MockTwentyClient,
  MockLettaClient,
  ILettaClient,
} from '@nyra/integration-adapters';

export const RawLeadPayloadSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    fname: z.string().optional(),
    lname: z.string().optional(),
    email: z.preprocess(
      (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
      z.string().email()
    ),
    phone: z.string().optional(),
    source: z.string().optional(),
    utm_source: z.string().optional(),
    propertyAddress: z.string().optional(),
    property_address: z.string().optional(),
    propertyState: z.string().optional(),
    property_state: z.string().optional(),
    propertyZip: z.string().optional(),
    property_zip: z.string().optional(),
    loanPurpose: z.string().optional(),
    loan_purpose: z.string().optional(),
    loanAmount: z.coerce.number().positive().optional(),
    loan_amount: z.coerce.number().positive().optional(),
    propertyValue: z.coerce.number().positive().optional(),
    property_value: z.coerce.number().positive().optional(),
    campaignId: z.string().optional(),
    consentEmail: z.boolean().optional(),
    consentSms: z.boolean().optional(),
    consentVoice: z.boolean().optional(),
    doNotContact: z.boolean().optional(),
  })
  .passthrough();

export type RawLeadPayload = z.infer<typeof RawLeadPayloadSchema>;
export type CampaignEligibility = 'ENROLL' | 'PENDING' | 'SUPPRESSED';

export interface LeadIngestionResult {
  success: true;
  lead: Lead;
  audit: {
    action: 'LEAD_INGESTED';
    crmBoundary: 'services/crm-api';
    campaignEligibility: CampaignEligibility;
    dedupeKeys: string[];
    existingLeadId?: string;
    recommendedCampaignId?: string;
    suppressionReason?: string;
  };
}

export class LeadIngestionPipeline {
  private crm: ITwentyClient;
  private orchestrator: ILettaClient;
  private readonly dedupeIndex = new Map<string, string>();

  constructor(
    crm: ITwentyClient = new MockTwentyClient(),
    orchestrator: ILettaClient = new MockLettaClient()
  ) {
    this.crm = crm;
    this.orchestrator = orchestrator;
  }

  /**
   * Process a raw lead payload.
   */
  async ingest(rawPayload: unknown): Promise<LeadIngestionResult> {
    const payload = RawLeadPayloadSchema.parse(rawPayload);
    console.log(`[Pipeline] Starting ingestion for: ${payload.email}`);

    // 1. Normalize
    const normalizedLead = this.normalize(payload);
    const dedupeKeys = this.buildDedupeKeys(payload);
    const existingLeadId = this.findExistingLeadId(dedupeKeys);
    if (existingLeadId) {
      normalizedLead.id = existingLeadId;
    }

    // 2. Validate
    const validated = LeadSchema.parse(normalizedLead);
    const campaignDecision = this.getCampaignEligibility(payload, validated);

    // 3. Persistence
    const savedLead = await this.crm.upsertLead(validated);
    if (savedLead.id) {
      this.rememberDedupeKeys(dedupeKeys, savedLead.id);
    }

    // 4. Orchestration: Sync initial context to Letta/mem0
    if (savedLead.id) {
      await this.orchestrator.syncContext(savedLead.id, {
        source: savedLead.source,
        interest: 'MORTGAGE_LOAN',
        campaignEligibility: campaignDecision.eligibility,
        dedupeKeys,
        ingestedAt: new Date().toISOString(),
      });
    }

    // 5. Audit
    console.log(`[AUDIT] LEAD_INGESTED: ${savedLead.id} from ${savedLead.source}`);

    return {
      success: true,
      lead: savedLead,
      audit: {
        action: 'LEAD_INGESTED',
        crmBoundary: 'services/crm-api',
        campaignEligibility: campaignDecision.eligibility,
        dedupeKeys,
        existingLeadId,
        recommendedCampaignId: campaignDecision.recommendedCampaignId,
        suppressionReason: campaignDecision.suppressionReason,
      },
    };
  }

  normalize(payload: RawLeadPayload): Partial<Lead> {
    return {
      firstName: payload.first_name || payload.fname || payload.firstName,
      lastName: payload.last_name || payload.lname || payload.lastName,
      email: payload.email?.toLowerCase().trim(),
      phone: payload.phone?.replace(/\D/g, ''),
      source: payload.utm_source || payload.source || 'ORGANIC_SEARCH',
      loanPurpose: this.mapLoanPurpose(payload.loanPurpose || payload.loan_purpose),
      loanAmount: this.money(payload.loanAmount || payload.loan_amount),
      propertyValue: this.money(payload.propertyValue || payload.property_value),
      state: (payload.propertyState || payload.property_state)?.toUpperCase(),
      consentEmail: payload.consentEmail ? 'OPTED_IN' : 'UNKNOWN',
      consentSms: payload.consentSms ? 'OPTED_IN' : 'UNKNOWN',
      consentVoice: payload.consentVoice ? 'OPTED_IN' : 'UNKNOWN',
      doNotContact: payload.doNotContact || false,
      metadata: {
        ...payload,
        dedupeKey: this.primaryDedupeKey(payload),
        propertyAddress: payload.propertyAddress || payload.property_address,
        propertyZip: payload.propertyZip || payload.property_zip,
        ingestedAt: new Date().toISOString()
      }
    };
  }

  private money(amount?: number) {
    if (!amount) return undefined;
    return {
      amountCents: Math.round(amount * 100),
      currency: 'USD',
    };
  }

  private mapLoanPurpose(purpose?: string) {
    const normalized = (purpose || '').toUpperCase();
    if (!normalized) return undefined;
    if (normalized.includes('CASH')) return 'REFI_CASH';
    if (normalized.includes('REFI') || normalized.includes('RATE')) return 'REFI_RATE';
    if (normalized.includes('HELOC')) return 'HELOC';
    return 'PURCHASE';
  }

  private getCampaignEligibility(payload: RawLeadPayload, lead: Lead): {
    eligibility: CampaignEligibility;
    recommendedCampaignId?: string;
    suppressionReason?: string;
  } {
    if (lead.doNotContact) {
      return {
        eligibility: 'SUPPRESSED',
        suppressionReason: 'do_not_contact',
      };
    }

    if (
      lead.consentEmail === 'OPTED_IN' ||
      lead.consentSms === 'OPTED_IN' ||
      lead.consentVoice === 'OPTED_IN'
    ) {
      return {
        eligibility: 'ENROLL',
        recommendedCampaignId: payload.campaignId || 'new-lead-nurture',
      };
    }

    return { eligibility: 'PENDING' };
  }

  private findExistingLeadId(dedupeKeys: string[]) {
    for (const key of dedupeKeys) {
      const leadId = this.dedupeIndex.get(key);
      if (leadId) return leadId;
    }
    return undefined;
  }

  private rememberDedupeKeys(dedupeKeys: string[], leadId: string) {
    for (const key of dedupeKeys) {
      this.dedupeIndex.set(key, leadId);
    }
  }

  private buildDedupeKeys(payload: RawLeadPayload) {
    return [
      this.primaryDedupeKey(payload),
      this.propertyDedupeKey(payload),
    ].filter((value): value is string => Boolean(value));
  }

  private primaryDedupeKey(payload: RawLeadPayload) {
    if (payload.email) return `email:${payload.email.toLowerCase().trim()}`;
    const phone = payload.phone?.replace(/\D/g, '');
    if (phone) return `phone:${phone}`;
    return undefined;
  }

  private propertyDedupeKey(payload: RawLeadPayload) {
    const phone = payload.phone?.replace(/\D/g, '');
    const property = [
      payload.propertyAddress || payload.property_address,
      payload.propertyZip || payload.property_zip,
    ]
      .filter(Boolean)
      .join('|')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    if (!phone || !property) return undefined;
    return `phone-property:${phone}:${property}`;
  }
}
