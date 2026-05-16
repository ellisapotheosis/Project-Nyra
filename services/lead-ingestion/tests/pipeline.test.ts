import { describe, expect, it } from "vitest";
import { LeadIngestionPipeline } from "../src/pipeline";
import { MockTwentyClient, MockLettaClient } from "@nyra/integration-adapters";

describe("LeadIngestionPipeline", () => {
  it("normalizes raw lead payloads before CRM persistence", async () => {
    const pipeline = new LeadIngestionPipeline(
      new MockTwentyClient(),
      new MockLettaClient()
    );

    const result = await pipeline.ingest({
      first_name: "Ada",
      last_name: "Lovelace",
      email: " ADA@example.COM ",
      phone: "(555) 123-4567",
      utm_source: "ratehunter",
    });

    expect(result.success).toBe(true);
    expect(result.lead.email).toBe("ada@example.com");
    expect(result.lead.phone).toBe("5551234567");
    expect(result.lead.source).toBe("ratehunter");
    expect(result.audit.crmBoundary).toBe("services/crm-api");
    expect(result.audit.dedupeKeys).toContain("email:ada@example.com");
  });

  it("defaults lead source and rejects invalid emails", async () => {
    const pipeline = new LeadIngestionPipeline(
      new MockTwentyClient(),
      new MockLettaClient()
    );

    await expect(
      pipeline.ingest({
        firstName: "Grace",
        lastName: "Hopper",
        email: "bad-email",
      })
    ).rejects.toThrow();

    const result = await pipeline.ingest({
      firstName: "Grace",
      lastName: "Hopper",
      email: "grace@example.com",
    });

    expect(result.lead.source).toBe("ORGANIC_SEARCH");
  });

  it("dedupes repeated submissions by stable email key", async () => {
    const pipeline = new LeadIngestionPipeline(
      new MockTwentyClient(),
      new MockLettaClient()
    );

    const first = await pipeline.ingest({
      firstName: "Mary",
      lastName: "Jackson",
      email: "mary@example.com",
      phone: "555-222-9999",
      consentEmail: true,
    });
    const second = await pipeline.ingest({
      firstName: "Mary",
      lastName: "Jackson",
      email: "MARY@example.com",
      phone: "555-222-9999",
      source: "partner",
    });

    expect(second.lead.id).toBe(first.lead.id);
    expect(second.audit.existingLeadId).toBe(first.lead.id);
  });

  it("marks campaign enrollment eligibility from consent and suppression", async () => {
    const pipeline = new LeadIngestionPipeline(
      new MockTwentyClient(),
      new MockLettaClient()
    );

    const eligible = await pipeline.ingest({
      firstName: "Katherine",
      lastName: "Johnson",
      email: "katherine@example.com",
      consentSms: true,
      campaignId: "purchase-drip",
    });
    const suppressed = await pipeline.ingest({
      firstName: "Dorothy",
      lastName: "Vaughan",
      email: "dorothy@example.com",
      consentSms: true,
      doNotContact: true,
    });

    expect(eligible.audit.campaignEligibility).toBe("ENROLL");
    expect(eligible.audit.recommendedCampaignId).toBe("purchase-drip");
    expect(suppressed.audit.campaignEligibility).toBe("SUPPRESSED");
    expect(suppressed.audit.suppressionReason).toBe("do_not_contact");
  });
});
