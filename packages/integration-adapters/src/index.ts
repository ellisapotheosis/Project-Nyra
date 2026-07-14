import type { Channel, Lead, Quote } from "@nyra/domain-models";

export interface IntegrationHealth {
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  message?: string;
}

export interface ITwentyClient {
  getLead(id: string): Promise<Lead>;
  upsertLead(lead: Lead): Promise<Lead>;
  logCommunication(
    leadId: string,
    channel: Channel,
    content: string
  ): Promise<void>;
  checkHealth(): Promise<IntegrationHealth>;
}

export interface ICommunicationProvider {
  send(
    to: string,
    content: string
  ): Promise<{ success: boolean; providerId?: string; error?: string }>;
  checkHealth(): Promise<IntegrationHealth>;
}

export interface IActivepiecesClient {
  enrollInCampaign(leadId: string, campaignId: string): Promise<void>;
  removeFromCampaign(leadId: string, campaignId: string): Promise<void>;
  checkHealth(): Promise<IntegrationHealth>;
}

export interface IQuoteEngine {
  generateQuote(lead: Lead): Promise<Quote>;
}

export interface IMemoryClient<TRecord = unknown> {
  write(record: TRecord): Promise<void>;
  read(leadId: string): Promise<TRecord[]>;
}

export class MockTwentyClient implements ITwentyClient {
  private readonly leads = new Map<string, Lead>();

  async getLead(id: string): Promise<Lead> {
    const lead = this.leads.get(id);

    if (!lead) {
      throw new Error(`Lead not found: ${id}`);
    }

    return lead;
  }

  async upsertLead(lead: Lead): Promise<Lead> {
    const key = lead.id ?? lead.externalId ?? lead.email;
    this.leads.set(key, lead);
    return lead;
  }

  async logCommunication(
    leadId: string,
    channel: Channel,
    content: string
  ): Promise<void> {
    if (!leadId || !channel || !content) {
      throw new Error(
        "Communication logs require leadId, channel, and content"
      );
    }
  }

  async checkHealth(): Promise<IntegrationHealth> {
    return { status: "HEALTHY" };
  }
}

export class MockQuoteEngine implements IQuoteEngine {
  async generateQuote(lead: Lead): Promise<Quote> {
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

export class MockTwilioClient implements ICommunicationProvider {
  async send(
    to: string,
    content: string
  ): Promise<{ success: boolean; providerId?: string }> {
    if (!to || !content) {
      return { success: false };
    }

    return { success: true, providerId: "mock-twilio-id" };
  }

  async checkHealth(): Promise<IntegrationHealth> {
    return { status: "HEALTHY" };
  }
}

export class MockSendGridClient implements ICommunicationProvider {
  async send(
    to: string,
    content: string
  ): Promise<{ success: boolean; providerId?: string }> {
    if (!to || !content) {
      return { success: false };
    }

    return { success: true, providerId: "mock-sendgrid-id" };
  }

  async checkHealth(): Promise<IntegrationHealth> {
    return { status: "HEALTHY" };
  }
}

export { ComplianceService, type ComplianceStatus } from "./compliance";
export { normalizeLeadData, validateLeadIngestion } from "./ingestion";
export {
  ActivepiecesClient,
  MockActivepiecesClient,
  type ActivepiecesConfig,
} from "./activepieces";
