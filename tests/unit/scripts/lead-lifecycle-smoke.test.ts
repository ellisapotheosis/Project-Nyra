import { describe, expect, it, vi } from "vitest";

import {
  buildSmokeLeadPayload,
  getRequiredLiveEnv,
  redactForLog,
  runLeadLifecycleSmoke,
} from "../../../scripts/smoke-test-lead-lifecycle.ts";

describe("lead lifecycle smoke", () => {
  it("builds a consented write-plan-ready mortgage lead", () => {
    const payload = buildSmokeLeadPayload(new Date("2026-05-22T15:30:00.000Z"));

    expect(payload.externalId).toBe("nyra-smoke-20260522153000");
    expect(payload.email).toBe("smoke.lead.20260522153000@example.com");
    expect(payload.consentEmail).toBe(true);
    expect(payload.consentSms).toBe(true);
    expect(payload.campaignId).toBe("smoke-lead-lifecycle");
    expect(payload.metadata?.traceId).toBe("lead-lifecycle-20260522153000");
  });

  it("redacts borrower contact fields and credentials before logging", () => {
    expect(
      redactForLog({
        email: "borrower@example.com",
        phone: "+15551234567",
        nested: {
          apiKey: "nyra-secret-value",
          traceId: "trace-123",
        },
      })
    ).toEqual({
      email: "b***@example.com",
      phone: "+1******4567",
      nested: {
        apiKey: "[redacted:17]",
        traceId: "trace-123",
      },
    });
  });

  it("requires an API key only for live smoke runs", () => {
    expect(getRequiredLiveEnv({ crmApiKey: undefined })).toEqual([
      "CRM_API_KEY",
    ]);
    expect(getRequiredLiveEnv({ crmApiKey: "configured" })).toEqual([]);
  });

  it("does not call CRM API in dry-run mode", async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const log = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    await runLeadLifecycleSmoke({
      mode: "dry-run",
      crmApiUrl: "http://localhost:4001",
      now: new Date("2026-05-22T15:30:00.000Z"),
      fetchImpl,
      log,
    });

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(log.log).toHaveBeenCalledWith(
      expect.stringContaining("Dry run complete")
    );
  });
});
