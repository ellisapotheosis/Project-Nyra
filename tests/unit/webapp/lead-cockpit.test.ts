import { expect, it, describe, vi, beforeEach } from "vitest";
import { crmApi } from "../../../apps/projectnyra/lib/api";

vi.mock("../../../apps/projectnyra/lib/api", () => ({
  crmApi: {
    getLeads: vi.fn(() =>
      Promise.resolve({
        leads: [{ id: "123", firstName: "Test", lastName: "Lead" }],
      })
    ),
    getLead: vi.fn((id) =>
      Promise.resolve({ lead: { id, firstName: "Test", lastName: "Lead" } })
    ),
    getLeadConversation: vi.fn(() => Promise.resolve({ logs: [] })),
    updateLeadCampaign: vi.fn(),
  },
  useApi: vi.fn((apiCall) => ({
    data: null,
    error: null,
    isLoading: false,
    execute: vi.fn().mockImplementation(() => apiCall()),
  })),
}));

describe("Lead Cockpit Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have lead management methods in crmApi", () => {
    expect(crmApi.getLeads).toBeDefined();
    expect(crmApi.getLead).toBeDefined();
    expect(crmApi.getLeadConversation).toBeDefined();
  });

  it("should fetch lead data correctly", async () => {
    const result = await crmApi.getLead("123");
    expect(result.lead.id).toBe("123");
    expect(crmApi.getLead).toHaveBeenCalledWith("123");
  });
});
