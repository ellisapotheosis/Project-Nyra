import { describe, expect, it } from "vitest";
import {
  SoftPullCreditService,
  createSoftPullRestHandler,
  creditTierForFico,
  redactSoftPullPayload,
  toQuoteCreditInput,
  type SoftPullRequest,
} from "./index";

const fixedDate = new Date("2026-05-17T18:00:00.000Z");
const leadId = "11111111-1111-4111-8111-111111111111";
const requestId = "22222222-2222-4222-8222-222222222222";

const validRequest: SoftPullRequest = {
  leadId,
  consentEventId: "consent-evt-123",
  requestedBy: "broker-operator",
  provider: "MOCK",
  purpose: "QUOTE_INPUT",
  correlationId: "trace-123",
  identity: {
    firstName: "Casey",
    lastName: "Borrower",
    dateOfBirth: "1980-01-01",
    addressLine1: "100 Main St",
    city: "Sacramento",
    state: "CA",
    postalCode: "95814",
    ssn: "123-45-6789",
    ssnLastFour: "6789",
  },
};

describe("soft-pull-credit service", () => {
  it("requires consent event id before requesting provider data", async () => {
    const service = new SoftPullCreditService({
      now: () => fixedDate,
      idFactory: () => requestId,
    });

    await expect(
      service.requestSoftPull({ ...validRequest, consentEventId: "" })
    ).rejects.toThrow();
  });

  it("stores only credit summary and emits approved quote input", async () => {
    const service = new SoftPullCreditService({
      now: () => fixedDate,
      idFactory: () => requestId,
    });

    const result = await service.requestSoftPull(validRequest);
    const status = await service.getStatus(requestId);
    const summary = await service.getSummary(requestId);

    expect(result.record.status).toBe("COMPLETED");
    expect(summary).toMatchObject({
      softPullId: requestId,
      leadId,
      consentEventId: "consent-evt-123",
      provider: "MOCK",
      scoreModel: "MOCK_MORTGAGE_FICO_V1",
    });
    expect(JSON.stringify(status)).not.toContain("123-45-6789");
    expect(status?.summary).toBeUndefined();
    expect(result.quoteInputEvent?.quoteCreditInput).toEqual(
      toQuoteCreditInput(result.record.summary!)
    );
  });

  it("redacts SSN values from audit-safe payloads", () => {
    const redacted = redactSoftPullPayload(validRequest);

    expect(JSON.stringify(redacted)).not.toContain("123-45-6789");
    expect(redacted.identity).toMatchObject({
      ssn: "[REDACTED]",
      ssnLastFour: "***6789",
    });
  });

  it("returns REST-compatible status and summary responses", async () => {
    const service = new SoftPullCreditService({
      now: () => fixedDate,
      idFactory: () => requestId,
    });
    const handler = createSoftPullRestHandler(service);

    const createResponse = await handler({
      method: "POST",
      path: "/soft-pull/request",
      body: validRequest,
    });
    const statusResponse = await handler({
      method: "GET",
      path: `/soft-pull/${requestId}/status`,
    });
    const summaryResponse = await handler({
      method: "GET",
      path: `/soft-pull/${requestId}/summary`,
    });

    expect(createResponse.status).toBe(201);
    expect(statusResponse.status).toBe(200);
    expect(summaryResponse.status).toBe(200);
  });

  it("maps FICO to deterministic quote tiers", () => {
    expect(creditTierForFico(780)).toBe("EXCELLENT");
    expect(creditTierForFico(730)).toBe("GOOD");
    expect(creditTierForFico(680)).toBe("FAIR");
    expect(creditTierForFico(640)).toBe("POOR");
    expect(creditTierForFico(580)).toBe("INELIGIBLE");
  });
});
