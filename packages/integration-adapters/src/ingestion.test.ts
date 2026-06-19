import { describe, it, expect } from "vitest";
import { normalizeLeadData, validateLeadIngestion } from "./ingestion";

describe("Lead Ingestion & Normalization", () => {
  describe("normalizeLeadData", () => {
    it("should normalize email to trimmed lowercase", () => {
      const raw = {
        firstName: "John",
        lastName: "Doe",
        email: "  John.Doe@Example.Com  ",
        phone: "1234567890",
        source: "Website",
      };
      const normalized = normalizeLeadData(raw);
      expect(normalized.email).toBe("john.doe@example.com");
    });

    it("should normalize names to trimmed capitalized format", () => {
      const raw = {
        firstName: "  jOHn  ",
        lastName: "  dOE-sMITH  ",
        email: "john@example.com",
        phone: "1234567890",
        source: "Website",
      };
      const normalized = normalizeLeadData(raw);
      expect(normalized.firstName).toBe("John");
      expect(normalized.lastName).toBe("Doe-Smith");
    });

    it("should normalize US phone numbers to standard E.164 format", () => {
      const testCases = [
        { input: "1234567890", expected: "+11234567890" },
        { input: "  (123) 456 - 7890  ", expected: "+11234567890" },
        { input: "1-123-456-7890", expected: "+11234567890" },
        { input: "+1 123 456 7890", expected: "+11234567890" },
      ];

      for (const tc of testCases) {
        const raw = {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: tc.input,
          source: "Website",
        };
        const normalized = normalizeLeadData(raw);
        expect(normalized.phone).toBe(tc.expected);
      }
    });

    it("should handle missing phone number gracefully", () => {
      const raw = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        source: "Website",
      };
      const normalized = normalizeLeadData(raw);
      expect(normalized.phone).toBeUndefined();
    });
  });

  describe("validateLeadIngestion", () => {
    it("should accept valid normalized lead data", () => {
      const validLead = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+11234567890",
        source: "Website",
        consentStatus: "OPTED_IN" as const,
      };

      const validation = validateLeadIngestion(validLead);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toBeUndefined();
    });

    it("should reject lead data missing required fields", () => {
      const invalidLead = {
        firstName: "",
        lastName: "Doe",
        email: "john@example.com",
        source: "Website",
      };

      const validation = validateLeadIngestion(invalidLead as any);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toBeDefined();
      expect(validation.errors?.length).toBeGreaterThan(0);
    });

    it("should reject invalid email format", () => {
      const invalidLead = {
        firstName: "John",
        lastName: "Doe",
        email: "not-an-email",
        source: "Website",
      };

      const validation = validateLeadIngestion(invalidLead as any);
      expect(validation.isValid).toBe(false);
      expect(validation.errors?.[0]).toContain("Invalid email");
    });

    it("should reject if consent status is explicitly OPTED_OUT or DO_NOT_CONTACT on new ingestion", () => {
      const optedOutLead = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+11234567890",
        source: "Website",
        consentStatus: "OPTED_OUT" as const,
      };

      const validation = validateLeadIngestion(optedOutLead);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "Cannot ingest lead with OPTED_OUT or DO_NOT_CONTACT consent status"
      );
    });
  });
});
