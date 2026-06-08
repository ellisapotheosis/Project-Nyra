import { describe, it, expect } from "vitest";
import { z } from "zod";

// Schema for raw lead data from RateHunter wizard
const RawLeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  loanPurpose: z.enum(["PURCHASE", "REFINANCE", "CASH_OUT"]),
  propertyValue: z.number().positive(),
  downPayment: z.number().min(0),
  propertyType: z.string(),
  occupancy: z.string(),
  creditScore: z.string(),
  source: z.string().default("RATEHUNTER_LANDING"),
});

type RawLead = z.infer<typeof RawLeadSchema>;

// Business Logic: Normalization for TwentyCRM MortgageLead object
function normalizeLead(raw: RawLead) {
  const loanAmount = raw.propertyValue - raw.downPayment;

  // Clean phone number (strip non-digits, ensure +1 prefix for US)
  let cleanPhone = raw.phone.replace(/\D/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = "+1" + cleanPhone;
  } else if (!cleanPhone.startsWith("+")) {
    cleanPhone = "+" + cleanPhone;
  }

  return {
    person: {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: cleanPhone,
    },
    mortgageLead: {
      loanPurpose: raw.loanPurpose,
      loanAmount,
      propertyState: "PENDING", // To be extracted from property address if added later
      source: raw.source,
      campaignStatus: "NEW_INGRESS",
      customFields: {
        propertyValue: raw.propertyValue,
        downPayment: raw.downPayment,
        propertyType: raw.propertyType,
        occupancy: raw.occupancy,
        creditScore: raw.creditScore,
      },
    },
  };
}

describe("Lead Normalization Logic", () => {
  it("should correctly calculate loan amount and clean phone numbers", () => {
    const raw: RawLead = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "(555) 123-4567",
      loanPurpose: "PURCHASE",
      propertyValue: 500000,
      downPayment: 100000,
      propertyType: "SINGLE_FAMILY",
      occupancy: "PRIMARY",
      creditScore: "EXCELLENT",
      source: "RATEHUNTER_LANDING",
    };

    const normalized = normalizeLead(raw);

    expect(normalized.mortgageLead.loanAmount).toBe(400000);
    expect(normalized.person.phone).toBe("+15551234567");
    expect(normalized.mortgageLead.campaignStatus).toBe("NEW_INGRESS");
  });

  it("should fail validation for invalid email", () => {
    const result = RawLeadSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
      email: "not-an-email",
      phone: "5551234567",
      loanPurpose: "PURCHASE",
      propertyValue: 500000,
      downPayment: 100000,
      propertyType: "SINGLE_FAMILY",
      occupancy: "PRIMARY",
      creditScore: "EXCELLENT",
    });

    expect(result.success).toBe(false);
  });
});
