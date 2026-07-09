export class MockTwentyClient {
  leads = new Map();
  async getLead(id) {
    const lead = this.leads.get(id);
    if (!lead) {
      throw new Error(`Lead not found: ${id}`);
    }
    return lead;
  }
  async upsertLead(lead) {
    const key = lead.id ?? lead.externalId ?? lead.email;
    this.leads.set(key, lead);
    return lead;
  }
  async logCommunication(leadId, channel, content) {
    if (!leadId || !channel || !content) {
      throw new Error(
        "Communication logs require leadId, channel, and content"
      );
    }
  }
  async checkHealth() {
    return { status: "HEALTHY" };
  }
}
export class MockQuoteEngine {
  async generateQuote(lead) {
    const baseScenario = {
      loanAmount: 400_000,
      interestRate: 6.5,
      loanTermYears: 30,
      monthlyPayment: 2528,
      closingCosts: 8_000,
      apr: 6.72,
      programName: "Conventional 30 Year Fixed",
    };
    return {
      leadId: lead.id ?? "00000000-0000-4000-8000-000000000000",
      options: {
        lowestPayment: {
          label: "Lowest Payment",
          scenario: {
            ...baseScenario,
            monthlyPayment: 2395,
            closingCosts: 11_000,
          },
        },
        balanced: {
          label: "Balanced",
          scenario: baseScenario,
        },
        lowestCost: {
          label: "Lowest Cost",
          scenario: {
            ...baseScenario,
            monthlyPayment: 2675,
            closingCosts: 4_500,
          },
        },
      },
      assumptions: {
        source: "mock",
      },
      createdAt: new Date(),
    };
  }
}
export class MockTwilioClient {
  async send(to, content) {
    if (!to || !content) {
      return { success: false };
    }
    return { success: true, providerId: "mock-twilio-id" };
  }
  async checkHealth() {
    return { status: "HEALTHY" };
  }
}
export class MockSendGridClient {
  async send(to, content) {
    if (!to || !content) {
      return { success: false };
    }
    return { success: true, providerId: "mock-sendgrid-id" };
  }
  async checkHealth() {
    return { status: "HEALTHY" };
  }
}
export { ComplianceService } from "./compliance";
export { normalizeLeadData, validateLeadIngestion } from "./ingestion";
//# sourceMappingURL=index.js.map
