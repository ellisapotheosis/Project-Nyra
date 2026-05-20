import { describe, expect, it } from "vitest";
import type { CrmWritePlan } from "@nyra/crm-types";
import {
  executeCrmWritePlan,
  type AuditSink,
  type CrmWritePlanClient,
} from "./writePlan";

const plan: CrmWritePlan = {
  lead: {
    firstName: "Morgan",
    lastName: "Borrower",
    email: "morgan@example.com",
    phone: "+15551112222",
    source: "ratehunter",
    stage: "NEW",
    consentStatus: "OPTED_IN",
    doNotContact: false,
    customFields: {
      dedupeKey: "email:morgan@example.com",
      campaignId: "speed-to-lead",
      campaignStatus: "ACTIVE",
    },
  },
  campaignEnrollment: {
    leadId: "pending",
    campaignId: "speed-to-lead",
    status: "ACTIVE",
    currentStepIndex: 0,
  },
  communicationLogs: [],
  quotes: [],
  auditEvents: [
    {
      entityType: "LEAD",
      entityId: "pending",
      action: "LEAD_CREATED",
      performer: "lead-ingestion",
      riskLevel: "CRM_MUTATION",
      occurredAt: "2026-05-20T07:00:00.000Z",
    },
  ],
};

class FakeClient implements CrmWritePlanClient {
  public readonly calls: string[] = [];

  constructor(private readonly matches: Array<Record<string, unknown>> = []) {}

  async createContact(input: Record<string, unknown>) {
    this.calls.push("createContact");
    return { id: "lead-created", input };
  }

  async updateContact(id: string, input: Record<string, unknown>) {
    this.calls.push(`updateContact:${id}`);
    return { id, input };
  }

  async searchContacts() {
    this.calls.push("searchContacts");
    return this.matches;
  }

  async enrollCampaign(input: Record<string, unknown>) {
    this.calls.push("enrollCampaign");
    return { id: "enrollment-1", input };
  }

  async logCommunication(input: Record<string, unknown>) {
    this.calls.push("logCommunication");
    return input;
  }

  async createQuote(input: Record<string, unknown>) {
    this.calls.push("createQuote");
    return input;
  }
}

class FakeAuditSink implements AuditSink {
  public readonly events: unknown[] = [];

  async log(event: unknown) {
    this.events.push(event);
  }
}

describe("executeCrmWritePlan", () => {
  it("creates a lead, enrolls the campaign, and persists audit events", async () => {
    const client = new FakeClient();
    const audit = new FakeAuditSink();

    const result = await executeCrmWritePlan(plan, client, audit);

    expect(result.lead).toMatchObject({
      id: "lead-created",
      source: "created",
    });
    expect(client.calls).toEqual([
      "searchContacts",
      "createContact",
      "enrollCampaign",
    ]);
    expect(audit.events).toHaveLength(1);
  });

  it("updates a dedupe match instead of creating a duplicate", async () => {
    const client = new FakeClient([{ id: "lead-existing" }]);
    const audit = new FakeAuditSink();

    const result = await executeCrmWritePlan(plan, client, audit);

    expect(result.lead).toMatchObject({
      id: "lead-existing",
      source: "matched",
    });
    expect(client.calls).toContain("updateContact:lead-existing");
    expect(client.calls).not.toContain("createContact");
  });
});
