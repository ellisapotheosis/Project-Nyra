import { describe, expect, it } from "vitest";
import {
  InMemoryLeadIngestionStore,
  LeadIngestionService,
  determineCampaignEligibility,
  getLeadDedupeKey,
  normalizeLeadPayload,
  persistCrmWritePlan,
  validateRawLeadPayload,
  type RawLeadPayload,
} from "./index";

const fixedDate = new Date("2026-05-17T12:00:00.000Z");
const leadId = "11111111-1111-4111-8111-111111111111";

describe("lead ingestion", () => {
  it("normalizes raw lead payloads into the shared lead contract", () => {
    const lead = normalizeLeadPayload(
      {
        name: "  Ellis Apotheosis  ",
        email: " ELLIS@Example.COM ",
        phone: "(555) 123-4567",
        source: "ratehunter",
        consentEmail: true,
        loanAmount: "$500,000",
        propertyState: "ca",
      },
      { id: leadId }
    );

    expect(lead).toMatchObject({
      id: leadId,
      firstName: "Ellis",
      lastName: "Apotheosis",
      email: "ellis@example.com",
      phone: "+15551234567",
      source: "ratehunter",
      consentStatus: "OPTED_IN",
      doNotContact: false,
      metadata: {
        loanAmount: 500000,
        propertyState: "CA",
      },
    });
  });

  it("rejects invalid raw payloads before normalization or CRM writes", async () => {
    expect(() =>
      validateRawLeadPayload({
        email: "not-an-email",
        phone: "555-123-4567",
        source: "vendor-feed",
      })
    ).toThrow(/email/i);

    expect(() =>
      normalizeLeadPayload(
        {
          firstName: "Missing",
          lastName: "Destination",
          source: "vendor-feed",
        },
        { id: leadId }
      )
    ).toThrow(/email or phone/i);

    const service = new LeadIngestionService({
      crm: {
        getLead: async () => {
          throw new Error("CRM should not be called for invalid lead payloads");
        },
        upsertLead: async () => {
          throw new Error("CRM should not be called for invalid lead payloads");
        },
        logCommunication: async () => {
          throw new Error("CRM should not be called for invalid lead payloads");
        },
        checkHealth: async () => ({ status: "HEALTHY" }),
      },
    });

    await expect(
      service.ingest({
        email: "bad-email",
        source: "vendor-feed",
      })
    ).rejects.toThrow(/email/i);
  });

  it("uses a stable dedupe key and updates matching leads through the CRM boundary", async () => {
    const store = new InMemoryLeadIngestionStore();
    const service = new LeadIngestionService({
      store,
      now: () => fixedDate,
      idFactory: () => leadId,
    });
    const payload: RawLeadPayload = {
      firstName: "Casey",
      lastName: "Borrower",
      email: "CASEY@example.com",
      phone: "555-000-1111",
      source: "vendor-feed",
      consentSms: true,
      campaignId: "new-lead-speed-to-contact",
    };

    const created = await service.ingest(payload);
    const updated = await service.ingest({
      ...payload,
      phone: "555-222-3333",
    });

    expect(created.dedupeOutcome).toBe("CREATED");
    expect(updated.dedupeOutcome).toBe("UPDATED");
    expect(updated.dedupeKey).toBe("email:casey@example.com");
    expect(updated.lead.id).toBe(created.lead.id);
    expect(updated.events.map((event) => event.type)).toEqual([
      "lead.updated",
      "campaign.eligible",
    ]);
  });

  it("preserves existing do-not-contact blocks on dedupe updates", async () => {
    const service = new LeadIngestionService({
      now: () => fixedDate,
      idFactory: () => leadId,
    });

    await service.ingest({
      firstName: "Casey",
      lastName: "Stopped",
      email: "casey-stopped@example.com",
      source: "unsubscribe",
      doNotContact: true,
      campaignId: "speed-to-lead",
    });

    const updated = await service.ingest({
      firstName: "Casey",
      lastName: "Stopped",
      email: "casey-stopped@example.com",
      source: "vendor-refresh",
      consentSms: true,
      campaignId: "speed-to-lead",
    });

    expect(updated.dedupeOutcome).toBe("UPDATED");
    expect(updated.lead).toMatchObject({
      consentStatus: "DO_NOT_CONTACT",
      doNotContact: true,
    });
    expect(updated.campaignEligibility).toEqual({
      eligible: false,
      reason: "DO_NOT_CONTACT",
    });
  });

  it("preserves existing opted-out blocks on dedupe updates", async () => {
    const store = new InMemoryLeadIngestionStore();
    const service = new LeadIngestionService({
      store,
      now: () => fixedDate,
      idFactory: () => leadId,
    });

    await service.ingest({
      firstName: "Casey",
      lastName: "Optedout",
      email: "casey-optedout@example.com",
      source: "unsubscribe",
      doNotContact: true,
      campaignId: "speed-to-lead",
    });

    const dedupeKey = "email:casey-optedout@example.com";
    const existing = await store.findByDedupeKey(dedupeKey);
    if (!existing) {
      throw new Error("Expected seeded lead for opted-out regression");
    }
    await store.saveDedupeKey(dedupeKey, {
      ...existing,
      consentStatus: "OPTED_OUT",
      doNotContact: false,
    });

    const updated = await service.ingest({
      firstName: "Casey",
      lastName: "Optedout",
      email: "casey-optedout@example.com",
      source: "vendor-refresh",
      consentSms: true,
      campaignId: "speed-to-lead",
    });

    expect(updated.dedupeOutcome).toBe("UPDATED");
    expect(updated.lead).toMatchObject({
      consentStatus: "OPTED_OUT",
      doNotContact: false,
    });
    expect(updated.campaignEligibility).toEqual({
      eligible: false,
      reason: "DO_NOT_CONTACT",
    });
    expect(updated.crmWritePlan.campaignEnrollment).toBeUndefined();
  });

  it("blocks campaign eligibility when consent is missing", () => {
    const lead = normalizeLeadPayload(
      {
        firstName: "No",
        lastName: "Consent",
        email: "no-consent@example.com",
        source: "referral",
        campaignId: "nurture",
      },
      { id: leadId }
    );

    expect(
      determineCampaignEligibility(lead, { campaignId: "nurture" })
    ).toEqual({
      eligible: false,
      reason: "MISSING_CONSENT",
    });
  });

  it("emits audit events for CRM mutation and campaign compliance outcome", async () => {
    const service = new LeadIngestionService({
      now: () => fixedDate,
      idFactory: () => leadId,
    });

    const result = await service.ingest({
      firstName: "Dana",
      lastName: "Lead",
      email: "dana@example.com",
      source: "api",
      doNotContact: true,
      campaignId: "speed-to-lead",
    });

    expect(result.campaignEligibility).toEqual({
      eligible: false,
      reason: "DO_NOT_CONTACT",
    });
    expect(result.crmWritePlan).toMatchObject({
      lead: {
        consentStatus: "DO_NOT_CONTACT",
        doNotContact: true,
        customFields: {
          campaignId: "speed-to-lead",
          campaignStatus: "STOPPED",
        },
      },
      campaignEnrollment: undefined,
    });
    expect(result.events).toEqual([
      expect.objectContaining({
        type: "lead.created",
      }),
      expect.objectContaining({
        type: "campaign.ineligible",
        reason: "DO_NOT_CONTACT",
      }),
    ]);
    expect(result.auditEvents).toMatchObject([
      {
        entityType: "LEAD",
        action: "LEAD_CREATED",
        riskLevel: "CRM_MUTATION",
        performer: "lead-ingestion",
      },
      {
        entityType: "CAMPAIGN_ENROLLMENT",
        action: "CAMPAIGN_BLOCKED",
        riskLevel: "COMPLIANCE_CRITICAL",
        performer: "lead-ingestion",
      },
    ]);
    expect(result.crmWritePlan.auditEvents).toHaveLength(2);
  });

  it("prefers email dedupe over phone dedupe", () => {
    expect(
      getLeadDedupeKey({ email: " Lead@Example.com ", phone: "5551234567" })
    ).toBe("email:lead@example.com");
  });

  it("builds a typed Twenty CRM write plan for eligible campaign enrollment", async () => {
    const service = new LeadIngestionService({
      now: () => fixedDate,
      idFactory: () => leadId,
    });

    const result = await service.ingest({
      firstName: "Morgan",
      lastName: "Borrower",
      email: "morgan@example.com",
      source: "ratehunter",
      consentSms: true,
      campaignId: "speed-to-lead",
      phone: "555-111-2222",
      loanPurpose: "PURCHASE",
      loanAmount: 500000,
      propertyState: "id",
    });

    expect(result.crmWritePlan).toMatchObject({
      lead: {
        firstName: "Morgan",
        customFields: {
          dedupeKey: "email:morgan@example.com",
          campaignId: "speed-to-lead",
          campaignStatus: "ACTIVE",
          loanPurpose: "PURCHASE",
          loanAmount: 500000,
          propertyState: "ID",
        },
      },
      campaignEnrollment: {
        leadId: "pending",
        campaignId: "speed-to-lead",
        status: "ACTIVE",
        currentStepIndex: 0,
      },
    });
    expect(result.crmWritePlan.lead.id).toBeUndefined();
    expect(
      result.crmWritePlan.auditEvents.map((event) => event.entityId)
    ).toEqual(["pending", "pending"]);
  });

  it("hands the normalized CRM write plan to the persistence boundary", async () => {
    const service = new LeadIngestionService({
      now: () => fixedDate,
      idFactory: () => leadId,
    });
    const result = await service.ingest({
      firstName: "Priya",
      lastName: "Pipeline",
      email: "priya@example.com",
      source: "projectnyra",
      consentEmail: true,
      campaignId: "speed-to-lead",
    });
    const calls: unknown[] = [];

    await persistCrmWritePlan(result, {
      execute: async (plan) => {
        calls.push(plan);
        return { accepted: true };
      },
    });

    expect(calls).toEqual([result.crmWritePlan]);
  });
});
