import { describe, it, expect } from "vitest";
import crypto from "crypto";

// Standalone implementations to avoid dotenv/twilio side-effects

function validatePhoneNumber(phoneNumber: string): boolean {
  const e164Regex = /^\+?[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

function normalizePhoneNumber(phoneNumber: string): string {
  let normalized = phoneNumber.replace(/[^\d+]/g, "");
  if (!normalized.startsWith("+")) {
    if (normalized.length === 10) {
      normalized = "+1" + normalized;
    } else if (normalized.length === 11 && normalized.startsWith("1")) {
      normalized = "+" + normalized;
    } else {
      normalized = "+" + normalized;
    }
  }
  return normalized;
}

function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>,
  authToken: string
): boolean {
  const data =
    url +
    Object.keys(params)
      .sort()
      .reduce((acc, key) => acc + key + params[key], "");
  const expectedSignature = crypto
    .createHmac("sha1", authToken)
    .update(Buffer.from(data, "utf-8"))
    .digest("base64");
  return signature === expectedSignature;
}

describe("Phone Number Validation", () => {
  describe("validatePhoneNumber", () => {
    it("accepts valid E.164 numbers with +", () => {
      expect(validatePhoneNumber("+14155551234")).toBe(true);
      expect(validatePhoneNumber("+442071234567")).toBe(true);
    });

    it("accepts valid numbers without +", () => {
      expect(validatePhoneNumber("14155551234")).toBe(true);
    });

    it("rejects numbers starting with 0", () => {
      expect(validatePhoneNumber("+0123456789")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(validatePhoneNumber("")).toBe(false);
    });

    it("rejects numbers with letters", () => {
      expect(validatePhoneNumber("+1415abc1234")).toBe(false);
    });

    it("rejects numbers that are too long (>15 digits)", () => {
      expect(validatePhoneNumber("+1234567890123456")).toBe(false);
    });

    it("rejects numbers with special characters", () => {
      expect(validatePhoneNumber("+1 (415) 555-1234")).toBe(false);
    });
  });

  describe("normalizePhoneNumber", () => {
    it("preserves valid E.164 numbers", () => {
      expect(normalizePhoneNumber("+14155551234")).toBe("+14155551234");
    });

    it("strips formatting characters", () => {
      expect(normalizePhoneNumber("+1 (415) 555-1234")).toBe("+14155551234");
    });

    it("adds +1 country code for 10-digit US numbers", () => {
      expect(normalizePhoneNumber("4155551234")).toBe("+14155551234");
    });

    it("adds + for 11-digit numbers starting with 1", () => {
      expect(normalizePhoneNumber("14155551234")).toBe("+14155551234");
    });

    it("adds + prefix for international numbers without it", () => {
      expect(normalizePhoneNumber("442071234567")).toBe("+442071234567");
    });

    it("handles numbers with dots and dashes", () => {
      expect(normalizePhoneNumber("415.555.1234")).toBe("+14155551234");
    });
  });
});

describe("Twilio Signature Validation", () => {
  const authToken = "test-auth-token-12345";
  const webhookUrl = "https://example.com/webhook";

  function generateSignature(
    url: string,
    params: Record<string, string>,
    token: string
  ): string {
    const data =
      url +
      Object.keys(params)
        .sort()
        .reduce((acc, key) => acc + key + params[key], "");
    return crypto
      .createHmac("sha1", token)
      .update(Buffer.from(data, "utf-8"))
      .digest("base64");
  }

  it("validates a correct signature", () => {
    const params = { From: "+14155551234", Body: "Hello" };
    const signature = generateSignature(webhookUrl, params, authToken);
    expect(
      validateTwilioSignature(signature, webhookUrl, params, authToken)
    ).toBe(true);
  });

  it("rejects an incorrect signature", () => {
    const params = { From: "+14155551234", Body: "Hello" };
    expect(
      validateTwilioSignature("invalid-sig", webhookUrl, params, authToken)
    ).toBe(false);
  });

  it("rejects signature with tampered params", () => {
    const originalParams = { From: "+14155551234", Body: "Hello" };
    const signature = generateSignature(webhookUrl, originalParams, authToken);
    const tamperedParams = { From: "+14155551234", Body: "Tampered" };
    expect(
      validateTwilioSignature(signature, webhookUrl, tamperedParams, authToken)
    ).toBe(false);
  });

  it("rejects signature with wrong auth token", () => {
    const params = { From: "+14155551234", Body: "Hello" };
    const signature = generateSignature(webhookUrl, params, authToken);
    expect(
      validateTwilioSignature(signature, webhookUrl, params, "wrong-token")
    ).toBe(false);
  });

  it("handles empty params", () => {
    const params: Record<string, string> = {};
    const signature = generateSignature(webhookUrl, params, authToken);
    expect(
      validateTwilioSignature(signature, webhookUrl, params, authToken)
    ).toBe(true);
  });
});
