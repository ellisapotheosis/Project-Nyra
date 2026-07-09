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
  ): Promise<{
    success: boolean;
    providerId?: string;
    error?: string;
  }>;
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
export declare class MockTwentyClient implements ITwentyClient {
  private readonly leads;
  getLead(id: string): Promise<Lead>;
  upsertLead(lead: Lead): Promise<Lead>;
  logCommunication(
    leadId: string,
    channel: Channel,
    content: string
  ): Promise<void>;
  checkHealth(): Promise<IntegrationHealth>;
}
export declare class MockQuoteEngine implements IQuoteEngine {
  generateQuote(lead: Lead): Promise<Quote>;
}
export declare class MockTwilioClient implements ICommunicationProvider {
  send(
    to: string,
    content: string
  ): Promise<{
    success: boolean;
    providerId?: string;
  }>;
  checkHealth(): Promise<IntegrationHealth>;
}
export declare class MockSendGridClient implements ICommunicationProvider {
  send(
    to: string,
    content: string
  ): Promise<{
    success: boolean;
    providerId?: string;
  }>;
  checkHealth(): Promise<IntegrationHealth>;
}
export { ComplianceService, type ComplianceStatus } from "./compliance";
export { normalizeLeadData, validateLeadIngestion } from "./ingestion";
//# sourceMappingURL=index.d.ts.map
