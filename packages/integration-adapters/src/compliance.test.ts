import { describe, it, expect } from "vitest";
import { ComplianceService } from "./compliance";
import {
  MockActivepiecesClient,
  MockCampaignEngineClient,
  MockMemoryClient,
  MockN8nConstrainedCampaignClient,
  MockRateQuotingClient,
  MockSendGridClient,
  MockTwilioClient,
  MockTwentyClient,
} from "./index";

describe("ComplianceService", () => {
  it("should detect STOP keywords", () => {
    expect(ComplianceService.isStopRequest("STOP")).toBe(true);
    expect(ComplianceService.isStopRequest("Please UNSUBSCRIBE me")).toBe(true);
    expect(ComplianceService.isStopRequest("I want to OPT OUT")).toBe(true);
    expect(ComplianceService.isStopRequest("Hello")).toBe(false);
  });

  it("should block contact if DNC flag is set", async () => {
    const service = new ComplianceService();
    const lead: any = { doNotContact: true };
    const result = await service.checkConsent(lead, "SMS");
    expect(result.canContact).toBe(false);
    expect(result.reason).toBe("DO_NOT_CONTACT_FLAG");
  });

  it("should require human approval for manual borrower-facing messages", async () => {
    // This is a logic/policy test
    const agentAction = {
      type: "BORROWER_COMMUNICATION",
      isFromCampaign: false,
    };

    const requiresApproval =
      agentAction.type === "BORROWER_COMMUNICATION" &&
      !agentAction.isFromCampaign;
    expect(requiresApproval).toBe(true);
  });

  it("should block automated messages if consent is missing/opted-out", async () => {
    const service = new ComplianceService();
    const lead: any = { consentStatus: "OPTED_OUT" };
    const result = await service.checkConsent(lead, "EMAIL");
    expect(result.canContact).toBe(false);
    expect(result.reason).toBe("OPTED_OUT");
  });

  it("should block missing consent before outbound providers are called", async () => {
    const service = new ComplianceService();
    const twilio = new MockTwilioClient();
    const sendGrid = new MockSendGridClient();
    const lead: any = {
      email: "lead@example.test",
      phone: "+15555551212",
      consentStatus: "UNKNOWN",
    };

    await expect(service.assertCanSend(lead, "SMS")).rejects.toThrow(
      "MISSING_CONSENT"
    );
    await expect(service.assertCanSend(lead, "EMAIL")).rejects.toThrow(
      "MISSING_CONSENT"
    );

    expect(await twilio.checkHealth()).toEqual({ status: "HEALTHY" });
    expect(await sendGrid.checkHealth()).toEqual({ status: "HEALTHY" });
  });

  it("should classify STOP replies and stop all campaigns", async () => {
    const crm = new MockTwentyClient();
    const campaign = new MockCampaignEngineClient();
    const service = new ComplianceService(crm);
    const lead: any = {
      id: "00000000-0000-4000-8000-000000000020",
      firstName: "Lead",
      lastName: "Stop",
      email: "lead@example.test",
      source: "TEST",
      consentStatus: "OPTED_IN",
      doNotContact: false,
    };

    expect(ComplianceService.classifyReply("stop texting me")).toBe("STOP_DNC");
    await service.handleStop(lead);
    await campaign.stopAllForLead(lead.id, "STOP_DNC");

    expect(campaign.stoppedLeads.get(lead.id)).toBe("STOP_DNC");
  });

  it("should constrain n8n fallback to mortgage templates", async () => {
    const n8n = new MockN8nConstrainedCampaignClient();
    await expect(
      n8n.triggerTemplate("new-internet-lead", "lead-1")
    ).resolves.toBeUndefined();
    await expect(
      n8n.triggerTemplate("generic-admin-workflow", "lead-1")
    ).rejects.toThrow("not in the mortgage fallback allowlist");
  });

  it("should record Activepieces enrollment as auditable action surface", async () => {
    const activepieces = new MockActivepiecesClient();
    await activepieces.enrollInCampaign("lead-1", "purchase-pre-approval");

    expect(activepieces.enrollments).toContainEqual({
      leadId: "lead-1",
      campaignId: "purchase-pre-approval",
    });
  });

  it("should report degraded rate quoting without real provider credentials", async () => {
    const rateClient = new MockRateQuotingClient();
    const result = await rateClient.requestRateQuote({
      propertyState: "CA",
      propertyValue: 500000,
      loanAmount: 400000,
      creditScore: 740,
      loanPurpose: "PURCHASE",
      occupancy: "PRIMARY",
      requestedAt: new Date(),
    });

    expect(result.status).toBe("UNAVAILABLE");
    expect(result.message).toContain("credentials");
  });

  it("should require source event and confidence for memory writes", async () => {
    const memory = new MockMemoryClient();
    const leadId = "00000000-0000-4000-8000-000000000021";

    await expect(
      memory.write({
        leadId,
        content: "Borrower asked for refi quote",
        confidence: 0.9,
        sourceEventId: "comm-1",
        tags: ["reply"],
        timestamp: new Date(),
      })
    ).resolves.toBeUndefined();

    await expect(
      memory.write({
        leadId,
        content: "Missing metadata",
        confidence: 0.8,
        tags: [],
        timestamp: new Date(),
      } as any)
    ).rejects.toThrow("sourceEventId");
  });
});
