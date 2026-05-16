import { describe, expect, it } from "vitest";
import { assertExecutable, createProposedAction } from "./index";

const baseAction = {
  runId: "run_123",
  actionType: "send_sms",
  targetService: "COMMUNICATION_SERVICE" as const,
  payload: { leadId: "lead_123" },
  requestedBy: { id: "assistant", type: "ASSISTANT" as const },
  createdAt: "2026-05-11T18:00:00.000Z",
};

describe("assistant service core", () => {
  it("classifies borrower communication as approval-gated", () => {
    const action = createProposedAction(baseAction);
    expect(action.riskLevel).toBe("BORROWER_COMMUNICATION");
    expect(action.approvalStatus).toBe("PENDING");
  });

  it("blocks execution until approval is present", () => {
    const action = createProposedAction(baseAction);
    expect(() => assertExecutable(action)).toThrow(
      "APPROVAL_REQUIRED:BORROWER_COMMUNICATION"
    );
    expect(() =>
      assertExecutable({ ...action, approvalStatus: "APPROVED" })
    ).not.toThrow();
  });
});
