import type { AgentActionRisk, ProposedAction } from "@nyra/domain-models";
import { requiresHumanApproval } from "@nyra/domain-models";

export function classifyProposedActionRisk(input: {
  targetService: ProposedAction["targetService"];
  actionType: string;
}): AgentActionRisk {
  if (input.targetService === "COMMUNICATION_SERVICE") {
    return "BORROWER_COMMUNICATION";
  }
  if (
    input.targetService === "CRM_API" ||
    input.targetService === "CAMPAIGN_ENGINE"
  ) {
    return "CRM_MUTATION";
  }
  if (input.targetService === "COMPLIANCE_SERVICE") {
    return "COMPLIANCE_CRITICAL";
  }
  if (
    input.actionType.startsWith("read_") ||
    input.actionType.startsWith("summarize_")
  ) {
    return "READ_ONLY";
  }
  return "INTERNAL_MUTATION";
}

export function createProposedAction(
  input: Omit<ProposedAction, "riskLevel" | "approvalStatus">
): ProposedAction {
  const riskLevel = classifyProposedActionRisk({
    targetService: input.targetService,
    actionType: input.actionType,
  });

  return {
    ...input,
    riskLevel,
    approvalStatus: requiresHumanApproval(riskLevel) ? "PENDING" : "APPROVED",
  };
}

export function assertExecutable(action: ProposedAction): void {
  if (
    requiresHumanApproval(action.riskLevel) &&
    action.approvalStatus !== "APPROVED"
  ) {
    throw new Error(`APPROVAL_REQUIRED:${action.riskLevel}`);
  }
}
