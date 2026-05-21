import { describe, expect, it } from "vitest";
import { PostgresAuditLedgerSink } from "./auditProvider";

class FakePool {
  public readonly queries: Array<{ sql: string; values?: unknown[] }> = [];

  async query(sql: string, values?: unknown[]) {
    this.queries.push({ sql, values });

    if (sql.includes("select entity_type")) {
      return {
        rows: [
          {
            entity_type: "LEAD",
            entity_id: "lead-1",
            action: "LEAD_CREATED",
            performer: "lead-ingestion",
            risk_level: "CRM_MUTATION",
            details: { source: "ratehunter" },
            occurred_at: "2026-05-21T00:00:00.000Z",
          },
        ],
      };
    }

    return { rows: [] };
  }
}

describe("PostgresAuditLedgerSink", () => {
  it("queries audit events for a workspace timeline", async () => {
    const pool = new FakePool();
    const sink = new PostgresAuditLedgerSink(pool as any);

    const events = await sink.listForEntity("LEAD", "lead-1", 10);

    expect(events).toEqual([
      {
        entityType: "LEAD",
        entityId: "lead-1",
        action: "LEAD_CREATED",
        performer: "lead-ingestion",
        riskLevel: "CRM_MUTATION",
        details: { source: "ratehunter" },
        occurredAt: "2026-05-21T00:00:00.000Z",
      },
    ]);
    expect(pool.queries.at(-1)?.values).toEqual(["LEAD", "lead-1", 10]);
  });
});
