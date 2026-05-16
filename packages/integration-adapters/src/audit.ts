import type { AuditEvent } from "@nyra/domain-models";
import { ITwentyClient, MockTwentyClient } from "./index";

export class AuditLogger {
  private crm: ITwentyClient;

  constructor(crm: ITwentyClient = new MockTwentyClient()) {
    this.crm = crm;
  }

  /**
   * Log a system or agent action
   */
  async log(event: Partial<AuditEvent>): Promise<void> {
    const fullEvent: AuditEvent = {
      entityType: event.entityType || "SYSTEM",
      entityId: event.entityId || "0",
      action: event.action || "UNKNOWN_ACTION",
      riskLevel: event.riskLevel || "READ_ONLY",
      performer: event.performer || "SYSTEM",
      details: event.details || {},
      timestamp: new Date(),
    };

    console.log(
      `[AUDIT] [${fullEvent.riskLevel}] ${fullEvent.action} on ${fullEvent.entityType}:${fullEvent.entityId} by ${fullEvent.performer}`
    );

    // Mission Invariant: All mutations must be logged to CRM if possible
    if (fullEvent.riskLevel !== "READ_ONLY") {
      await this.crm.logCommunication(
        fullEvent.entityId,
        "INTERNAL_NOTE",
        `Audit: ${fullEvent.action} by ${fullEvent.performer}`
      );
    }
  }
}
