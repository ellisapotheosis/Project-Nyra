import { buildLeadIngestionPayload } from "../src/lib/lead-ingestion-payload";

describe("lead ingestion payload", () => {
  it("sends explicit channel consent for RateHunter lead capture", () => {
    const payload = buildLeadIngestionPayload(
      {
        loanPurpose: "PURCHASE",
        propertyType: "SINGLE_FAMILY",
        occupancy: "PRIMARY",
        propertyValue: 450000,
        downPayment: 90000,
        creditScore: "EXCELLENT",
        firstName: "Casey",
        lastName: "Borrower",
        email: "casey@example.com",
        phone: "555-123-4567",
      },
      "2026-06-08T01:30:00.000Z"
    );

    expect(payload).toMatchObject({
      firstName: "Casey",
      lastName: "Borrower",
      email: "casey@example.com",
      phone: "555-123-4567",
      loanAmount: 360000,
      source: "RATEHUNTER_LANDING",
      consentEmail: true,
      consentSms: true,
      consentVoice: true,
      consentTimestamp: "2026-06-08T01:30:00.000Z",
      metadata: {
        consentTimestamp: "2026-06-08T01:30:00.000Z",
        loanPurpose: "PURCHASE",
        loanAmount: 360000,
        propertyValue: 450000,
        downPayment: 90000,
        creditScore: "EXCELLENT",
        propertyType: "SINGLE_FAMILY",
        occupancy: "PRIMARY",
      },
    });
  });

  it("trims required contact fields and omits a blank optional phone", () => {
    const payload = buildLeadIngestionPayload(
      {
        loanPurpose: "REFINANCE",
        propertyType: "CONDO",
        occupancy: "PRIMARY",
        propertyValue: 525000,
        downPayment: 125000,
        creditScore: "GOOD",
        firstName: " Jordan ",
        lastName: " Lead ",
        email: " jordan@example.com ",
        phone: "   ",
      },
      "2026-06-08T02:50:00.000Z"
    );

    expect(payload).not.toHaveProperty("phone");
    expect(payload).toMatchObject({
      firstName: "Jordan",
      lastName: "Lead",
      email: "jordan@example.com",
      consentSms: false,
      consentVoice: false,
      loanAmount: 400000,
      source: "RATEHUNTER_LANDING",
    });
  });

  it("rejects blank required contact fields before ingestion", () => {
    expect(() =>
      buildLeadIngestionPayload({
        loanPurpose: "REFINANCE",
        propertyType: "CONDO",
        occupancy: "PRIMARY",
        propertyValue: 525000,
        downPayment: 125000,
        creditScore: "GOOD",
        firstName: " ",
        lastName: "Lead",
        email: "jordan@example.com",
        phone: "555-222-3333",
      })
    ).toThrow(/First name is required/);
  });

  it("rejects invalid email syntax before ingestion", () => {
    expect(() =>
      buildLeadIngestionPayload({
        loanPurpose: "REFINANCE",
        propertyType: "CONDO",
        occupancy: "PRIMARY",
        propertyValue: 525000,
        downPayment: 125000,
        creditScore: "GOOD",
        firstName: "Jordan",
        lastName: "Lead",
        email: "not-an-email",
        phone: "555-222-3333",
      })
    ).toThrow(/valid email/);
  });
});
