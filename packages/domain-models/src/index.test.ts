import { describe, it, expect } from "vitest";
import { LeadSchema, LeadStageSchema } from "./index";

describe("Domain Models", () => {
  it("should validate a correct lead", () => {
    const validLead = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      source: "TEST_SOURCE",
    };
    const result = LeadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
  });

  it("should fail on invalid email", () => {
    const invalidLead = {
      firstName: "Test",
      lastName: "User",
      email: "invalid-email",
      source: "TEST_SOURCE",
    };
    const result = LeadSchema.safeParse(invalidLead);
    expect(result.success).toBe(false);
  });

  it("should enforce default stage", () => {
    const lead = LeadSchema.parse({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      source: "TEST_SOURCE",
    });
    expect(lead.stage).toBe("NEW");
  });
});
