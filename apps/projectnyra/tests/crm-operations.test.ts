import { buildCrmOperations, type WorkspaceData } from "../src/lib/crm-data";
import type { LeadRecord } from "../src/lib/mock-data";

const lead = (overrides: Partial<LeadRecord>): LeadRecord => ({
  id: "lead-1",
  firstName: "Jane",
  lastName: "Borrower",
  email: "jane@example.com",
  phone: "+15551234567",
  campaignStatus: "ACTIVE",
  loanPurpose: "Purchase",
  loanAmount: 500000,
  campaignId: "purchase-follow-up",
  lastTouch: "2026-05-26T12:00:00.000Z",
  nextTouch: "2026-05-27T12:00:00.000Z",
  location: "Boise, ID",
  creditBand: "720+",
  source: "RateHunter",
  stage: "Qualified",
  ...overrides,
});

describe("buildCrmOperations", () => {
  it("surfaces paused campaigns and quote-ready leads", () => {
    const operations = buildCrmOperations(
      [
        lead({
          id: "paused",
          campaignStatus: "PAUSED",
          nextTouch: "Broker review required",
        }),
      ],
      [],
      "crm-api"
    );

    expect(operations.campaignReviewQueue).toHaveLength(1);
    expect(operations.quoteQueue).toHaveLength(1);
    expect(operations.nextBestActions[0]?.href).toBe("/leads/paused");
  });

  it("warns when mock CRM data is active", () => {
    const operations = buildCrmOperations([], [], "mock");

    expect(operations.syncWarnings).toContain(
      "CRM workspace is using mock fallback data; enable live CRM credentials for production."
    );
  });

  it("keeps workspace source values aligned", () => {
    const source: WorkspaceData["source"] = "twenty-mcp";
    const operations = buildCrmOperations([lead({})], [], source);

    expect(operations.syncWarnings).toContain(
      "Twenty MCP returned leads only; application/file data is unavailable."
    );
  });
});
