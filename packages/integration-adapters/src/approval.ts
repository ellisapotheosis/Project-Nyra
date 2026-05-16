import { AuditLogger } from './audit';

export class ApprovalService {
  constructor(private audit: AuditLogger) {}

  /**
   * Gates a high-risk action behind human approval
   */
  async requestApproval(action: string, performer: string): Promise<boolean> {
    console.log(`[Approval] 🚨 HIGH_RISK_ACTION detected: ${action} by ${performer}`);
    console.log(`[Approval] Waiting for broker to approve in Nerve UI...`);

    // In a real scenario, this would create a task/notification and wait.
    // For the scaffold, we simulate an approved state.
    const approved = true;

    if (approved) {
      await this.audit.log({
        entityType: 'AGENT_ACTION',
        entityId: '0',
        action: 'HUMAN_APPROVED_COMMUNICATION',
        riskLevel: 'BORROWER_COMMUNICATION',
        performer: 'SYSTEM_BROKER',
        details: { originalAction: action, originalPerformer: performer }
      });
    }

    return approved;
  }
}
