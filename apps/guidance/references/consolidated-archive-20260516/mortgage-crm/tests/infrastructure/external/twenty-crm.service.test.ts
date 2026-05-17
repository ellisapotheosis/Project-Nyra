import { TwentyCRMService } from "../../../src/infrastructure/external/twenty-crm.service";
import { Lead } from "../../../src/domain/entities/lead.entity";

// Mock global fetch
global.fetch = jest.fn();

describe("TwentyCRMService", () => {
  let service: TwentyCRMService;

  beforeEach(() => {
    service = new TwentyCRMService();
    (global.fetch as jest.Mock).mockClear();
  });

  it("should successfully sync a lead to Twenty CRM and return mock ID", async () => {
    // Setup mock response for the fetch call
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }) // Simulate no existing person found
    });

    const leadResult = Lead.create({
      source: "website",
      borrower: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        phone: "555-987-6543"
      },
      loanRequest: {
        amount: 300000,
        propertyType: "single_family",
        zipCode: "12345"
      }
    });

    expect(leadResult.isSuccess).toBe(true);
    const lead = leadResult.value;

    const syncResult = await service.syncLead(lead);

    expect(syncResult.isSuccess).toBe(true);
    expect(syncResult.value).toContain("twenty_");
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("jane.smith@example.com"),
      expect.any(Object)
    );
  });

  it("should handle API errors gracefully", async () => {
    // Setup mock failure
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));

    const leadResult = Lead.create({
      source: "referral",
      borrower: {
        firstName: "Bob",
        lastName: "Johnson",
        email: "bob.j@example.com",
        phone: "555-111-2222"
      },
      loanRequest: {
        amount: 150000,
        propertyType: "condo",
        zipCode: "54321"
      }
    });

    const syncResult = await service.syncLead(leadResult.value);

    expect(syncResult.isFailure).toBe(true);
    expect(syncResult.error).toContain("Network Error");
  });
});
