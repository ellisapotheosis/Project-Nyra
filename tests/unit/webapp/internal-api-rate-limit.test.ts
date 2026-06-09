import { describe, expect, it, beforeEach } from "vitest";
import {
  checkRateLimit,
  getRequestRateLimitKey,
  resetRateLimitBucketsForTests,
} from "../../../apps/projectnyra/src/lib/api/rateLimit";
import { redactSensitiveText } from "../../../apps/projectnyra/src/lib/privacy/redaction";

describe("internal API rate limiting", () => {
  beforeEach(() => {
    resetRateLimitBucketsForTests();
  });

  it("blocks requests after the configured window limit", () => {
    const options = { limit: 2, windowMs: 60_000 };

    expect(checkRateLimit("internal:test", options, 1_000)).toMatchObject({
      allowed: true,
      remaining: 1,
    });
    expect(checkRateLimit("internal:test", options, 2_000)).toMatchObject({
      allowed: true,
      remaining: 0,
    });
    expect(checkRateLimit("internal:test", options, 3_000)).toMatchObject({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 58,
    });
  });

  it("scopes rate-limit keys by forwarded client IP", () => {
    const request = new Request("https://projectnyra.com/api/internal/test", {
      headers: {
        "x-forwarded-for": "203.0.113.42, 10.0.0.2",
      },
    });

    expect(getRequestRateLimitKey(request, "internal:test")).toBe(
      "internal:test:203.0.113.42"
    );
  });

  it("redacts borrower PII and bearer secrets from internal proxy text", () => {
    const redacted = redactSensitiveText(
      "lead@example.com +1 (555) 123-4567 Bearer abc.def.ghi token=super-secret"
    );

    expect(redacted).not.toContain("lead@example.com");
    expect(redacted).not.toContain("555");
    expect(redacted).not.toContain("abc.def.ghi");
    expect(redacted).not.toContain("super-secret");
    expect(redacted).toContain("[REDACTED_EMAIL]");
    expect(redacted).toContain("[REDACTED_PHONE]");
  });
});
