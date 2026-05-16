import { AuditLogger } from "./audit";

export interface GovernanceResult {
  allowed: boolean;
  score: number;
  reasoning?: string;
  revisions?: string[];
}

/**
 * Paperclip Governor
 * Enforces goal alignment and safety guardrails across the AI cluster.
 */
export class PaperclipGovernor {
  constructor(private audit: AuditLogger) {}

  /**
   * Audit an agent's proposed action or output
   */
  async auditProposal(output: string, context: any): Promise<GovernanceResult> {
    console.log(`[Paperclip] Auditing agent output for goal alignment...`);

    // 1. Hallucination Check: Interest Rates
    // Rule: Agents must not state rates unless reading from a Quote object.
    const hasRate = /\d+\.?\d*%/.test(output);
    if (hasRate && !context.hasQuote) {
      return {
        allowed: false,
        score: 0.1,
        reasoning:
          "HAL_RATE_DETECTED: Agent proposed a specific interest rate without an active Quote scenario.",
        revisions: [
          "Remove specific rate numbers",
          "Request a quote from the pricing engine first",
        ],
      };
    }

    // 2. Compliance Check: STOP/DNC
    if (context.doNotContact) {
      return {
        allowed: false,
        score: 0.0,
        reasoning:
          "DNC_BREACH: Attempted to communicate with an opted-out lead.",
      };
    }

    // 3. Goal Alignment: Broker Value
    const score = output.length > 50 ? 0.9 : 0.5; // Simple heuristic

    await this.audit.log({
      entityType: "AGENT_PROPOSAL",
      entityId: context.leadId,
      action: "GOVERNANCE_AUDIT_COMPLETE",
      riskLevel: "READ_ONLY",
      performer: "SYSTEM_PAPERCLIP",
      details: { score, allowed: true },
    });

    return { allowed: true, score };
  }
}
