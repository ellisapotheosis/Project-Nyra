import type { IOpenClawClient } from "./index";

export interface OpenClawProposedAction {
  id: string;
  sessionId: string;
  leadId: string;
  summary: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requiresApproval: boolean;
}

export class MockOpenClawClient implements IOpenClawClient {
  readonly sessions = new Map<string, string>();
  readonly approvals: Array<{ message: string; approved: boolean }> = [];

  async launchSession(leadId: string): Promise<{ sessionId: string }> {
    const sessionId = `mock-openclaw-${leadId}`;
    this.sessions.set(leadId, sessionId);
    return { sessionId };
  }

  async requestApproval(message: string): Promise<{ approved: boolean }> {
    const approved = !/\b(send|delete|approve|quote|rate|payment|ssn)\b/i.test(message);
    this.approvals.push({ message, approved });
    return { approved };
  }

  async proposeAction(input: {
    sessionId: string;
    leadId: string;
    summary: string;
    risk: OpenClawProposedAction["risk"];
  }): Promise<OpenClawProposedAction> {
    return {
      id: `mock-action-${this.approvals.length + 1}`,
      sessionId: input.sessionId,
      leadId: input.leadId,
      summary: input.summary,
      risk: input.risk,
      requiresApproval: input.risk !== "LOW",
    };
  }
}
