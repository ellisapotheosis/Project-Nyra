import { describe, expect, it } from "vitest";
import {
  InMemoryLeadIngestionStore,
  LeadIngestionService,
  determineCampaignEligibility,
  getLeadDedupeKey,
  normalizeLeadPayload,
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
  });

  it("prefers email dedupe over phone dedupe", () => {
    expect(
      getLeadDedupeKey({ email: " Lead@Example.com ", phone: "5551234567" })
    ).toBe("email:lead@example.com");
  });
});
