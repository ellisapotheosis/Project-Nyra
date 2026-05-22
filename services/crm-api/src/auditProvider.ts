import type { Pool } from "pg";
import type { AuditLedgerContract } from "@nyra/crm-types";

export interface AuditLedgerSink {
  log(event: AuditLedgerContract): Promise<void>;
  listForEntity?(
    entityType: string,
    entityId: string,
    limit?: number
  ): Promise<AuditLedgerContract[]>;
}

export class PostgresAuditLedgerSink implements AuditLedgerSink {
  private initialized = false;

  constructor(private readonly pool: Pool) {}

  async log(event: AuditLedgerContract): Promise<void> {
    await this.ensureSchema();
    await this.pool.query(
      `insert into nyra_audit_events
        (entity_type, entity_id, action, performer, risk_level, details, occurred_at)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [
        event.entityType,
        event.entityId,
        event.action,
        event.performer,
        event.riskLevel,
        event.details ?? {},
        event.occurredAt,
      ]
    );
  }

  async listForEntity(
    entityType: string,
    entityId: string,
    limit = 50
  ): Promise<AuditLedgerContract[]> {
    await this.ensureSchema();
    const result = await this.pool.query(
      `select entity_type, entity_id, action, performer, risk_level, details, occurred_at
       from nyra_audit_events
       where entity_type = $1 and entity_id = $2
       order by occurred_at desc, inserted_at desc
       limit $3`,
      [entityType, entityId, limit]
    );

    return result.rows.map((row) => ({
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      performer: row.performer,
      riskLevel: row.risk_level,
      details: row.details,
      occurredAt: new Date(row.occurred_at).toISOString(),
    }));
  }

  private async ensureSchema(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.pool.query(`
      create table if not exists nyra_audit_events (
        id bigserial primary key,
        entity_type text not null,
        entity_id text not null,
        action text not null,
        performer text not null,
        risk_level text not null,
        details jsonb not null default '{}'::jsonb,
        occurred_at timestamptz not null,
        inserted_at timestamptz not null default now()
      )
    `);
    this.initialized = true;
  }
}
