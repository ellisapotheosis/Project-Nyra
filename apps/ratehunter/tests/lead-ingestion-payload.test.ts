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
});
