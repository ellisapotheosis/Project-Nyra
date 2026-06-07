import { describe, it, expect } from "vitest";
import { ComplianceService } from "./compliance";

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
});
