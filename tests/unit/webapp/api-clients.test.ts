import {
  crmApi,
  campaignApi,
  quoteApi,
  useApi,
} from "../../../apps/webapp/app/lib/api";

describe("API Client Layer Smoke Test", () => {
  it("should export all API clients", () => {
    expect(crmApi).toBeDefined();
    expect(campaignApi).toBeDefined();
    expect(quoteApi).toBeDefined();
    expect(useApi).toBeDefined();
  });

  it("should have lead management methods in crmApi", () => {
    expect(crmApi.getLeads).toBeInstanceOf(Function);
    expect(crmApi.getLeadConversation).toBeInstanceOf(Function);
    expect(crmApi.updateLeadStatus).toBeInstanceOf(Function);
  });

  it("should have campaign execution methods in campaignApi", () => {
    expect(campaignApi.getCampaigns).toBeInstanceOf(Function);
    expect(campaignApi.executeCampaign).toBeInstanceOf(Function);
    expect(campaignApi.stopExecution).toBeInstanceOf(Function);
  });

  it("should have quote calculation methods in quoteApi", () => {
    expect(quoteApi.getLoanTypes).toBeInstanceOf(Function);
    expect(quoteApi.getConventionalQuote).toBeInstanceOf(Function);
    expect(quoteApi.compareLoanTypes).toBeInstanceOf(Function);
  });
});
