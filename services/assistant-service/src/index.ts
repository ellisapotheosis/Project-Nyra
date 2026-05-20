export const serviceName = "assistant-service";

export type AssistantToolRisk =
  | "READ_ONLY"
  | "INTERNAL_MUTATION"
  | "CRM_MUTATION"
  | "DATABASE_MUTATION"
  | "BORROWER_COMMUNICATION";

export type AssistantToolRequest = {
  toolName: string;
  risk: AssistantToolRisk;
  requestedBy: string;
  justification?: string;
  approvedBy?: string;
  auditEventId?: string;
};

export type AssistantToolDecision = {
  allowed: boolean;
  reason:
    | "ALLOWED_READ_ONLY"
    | "ALLOWED_WITH_APPROVAL_AND_AUDIT"
    | "DIRECT_MUTATION_BLOCKED"
    | "BORROWER_COMMUNICATION_REQUIRES_APPROVAL"
    | "MISSING_AUDIT_EVENT";
};

export function decideAssistantToolAccess(
  request: AssistantToolRequest
): AssistantToolDecision {
  if (request.risk === "READ_ONLY") {
    return { allowed: true, reason: "ALLOWED_READ_ONLY" };
  }

  if (!request.auditEventId) {
    return { allowed: false, reason: "MISSING_AUDIT_EVENT" };
  }

  if (request.risk === "CRM_MUTATION" || request.risk === "DATABASE_MUTATION") {
    if (!request.approvedBy) {
      return { allowed: false, reason: "DIRECT_MUTATION_BLOCKED" };
    }

    return { allowed: true, reason: "ALLOWED_WITH_APPROVAL_AND_AUDIT" };
  }

  if (request.risk === "BORROWER_COMMUNICATION" && !request.approvedBy) {
    return {
      allowed: false,
      reason: "BORROWER_COMMUNICATION_REQUIRES_APPROVAL",
    };
  }

  return { allowed: true, reason: "ALLOWED_WITH_APPROVAL_AND_AUDIT" };
}
