import type { AuditEvent } from "@nyra/domain-models";

export interface IAuditProvider {
  log(event: AuditEvent): Promise<void>;
}

export class AuditLogger {
  private readonly provider: IAuditProvider;
  private readonly service: string;
  private readonly environment: string;

  constructor(options: {
    service: string;
    environment?: string;
    provider?: IAuditProvider;
  }) {
    this.service = options.service;
    this.environment = options.environment || "development";
    this.provider = options.provider || new ConsoleAuditProvider();
  }

  async log(
    event: Partial<AuditEvent> & {
      action: string;
      entityId: string;
      entityType: string;
    }
  ) {
    const fullEvent: AuditEvent = {
      action: event.action,
      entityId: event.entityId,
      entityType: event.entityType,
      riskLevel: event.riskLevel || "READ_ONLY",
      performer: event.performer || `SYSTEM_${this.service.toUpperCase()}`,
      details: {
        ...event.details,
        service: this.service,
        environment: this.environment,
      },
      timestamp: new Date(),
    };

    try {
      await this.provider.log(fullEvent);
    } catch (error) {
      console.error(
        `[AUDIT_FAILURE] Failed to log event: ${fullEvent.action}`,
        error
      );
      // In production, we might want to queue this or send to a fallback buffer
    }
  }
}

class ConsoleAuditProvider implements IAuditProvider {
  async log(event: AuditEvent): Promise<void> {
    const timestamp = event.timestamp.toISOString();
    const riskBadge = `[${event.riskLevel}]`;
    console.log(
      `📡 ${timestamp} ${riskBadge} ${event.action} | ${event.entityType}:${event.entityId} by ${event.performer}`
    );
    if (event.details) {
      console.debug("   Details:", JSON.stringify(event.details));
    }
  }
}
