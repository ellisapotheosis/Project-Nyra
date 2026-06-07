import { describe, expect, it } from "vitest";
import { decideAssistantToolAccess } from "./index";

describe("assistant-service", () => {
  it("allows read-only tool access", () => {
    expect(
      decideAssistantToolAccess({
        toolName: "crm.lead.read",
        risk: "READ_ONLY",
        requestedBy: "openclaw",
      })
    ).toEqual({ allowed: true, reason: "ALLOWED_READ_ONLY" });
  });

  it("blocks direct CRM mutation without approval", () => {
    expect(
      decideAssistantToolAccess({
        toolName: "crm.lead.update",
        risk: "CRM_MUTATION",
        requestedBy: "openclaw",
        auditEventId: "audit-1",
      })
    ).toEqual({ allowed: false, reason: "DIRECT_MUTATION_BLOCKED" });
  });

  it("requires audit events for every mutating or communication tool", () => {
    expect(
      decideAssistantToolAccess({
        toolName: "sms.send",
        risk: "BORROWER_COMMUNICATION",
        requestedBy: "openclaw",
        approvedBy: "broker-1",
      })
    ).toEqual({ allowed: false, reason: "MISSING_AUDIT_EVENT" });
  });
});
