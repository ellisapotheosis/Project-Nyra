import type { Channel, Lead, Quote } from "@nyra/domain-models";

export interface IntegrationHealth {
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  message?: string;
}

/**
 * TwentyCRM Client Interface
 */
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

/**
 * Communication Provider Interface (Twilio, SendGrid)
 */
export interface ICommunicationProvider {
  send(
    to: string,
    content: string
  ): Promise<{ success: boolean; providerId?: string; error?: string }>;
  checkHealth(): Promise<IntegrationHealth>;
}

/**
 * Activepieces Client Interface
 */
export interface IActivepiecesClient {
  enrollInCampaign(leadId: string, campaignId: string): Promise<void>;
  removeFromCampaign(leadId: string, campaignId: string): Promise<void>;
  checkHealth(): Promise<IntegrationHealth>;
}

/**
 * Quote Engine Interface
 */
export interface IQuoteEngine {
  generateQuote(lead: Lead): Promise<Quote>;
}

/**
 * Memory Client Interface
 */
export interface IMemoryClient<TRecord = unknown> {
  write(record: TRecord): Promise<void>;
  read(leadId: string): Promise<TRecord[]>;
}

/**
 * Nexus Router Client Interface
 */
export interface INexusRouterClient {
  routeTask(
    task: string,
    risk: string
  ): Promise<{ workerId: string; model: string }>;
  checkHealth(): Promise<IntegrationHealth>;
}

/**
 * OpenClaw Client Interface
 */
export interface IOpenClawClient {
  launchSession(leadId: string): Promise<{ sessionId: string }>;
  requestApproval(message: string): Promise<{ approved: boolean }>;
}

/**
 * Nerve UI Client Interface
 */
export interface INerveClient {
  getDashboardUrl(workerId: string): string;
  updateVoiceSettings(workerId: string, settings: any): Promise<void>;
  checkHealth(): Promise<IntegrationHealth>;
}

/**
 * Letta Orchestrator Client Interface
 */
export interface ILettaClient {
  syncContext(leadId: string, context: any): Promise<void>;
  triggerAgent(agentId: string, task: string): Promise<void>;
  checkHealth(): Promise<IntegrationHealth>;
}

/**
 * Workflow Control Interface (ClawTeam / Paperclip)
 */
export interface IWorkflowControl {
  alignGoals(leadId: string, goals: string[]): Promise<void>;
  coordinateAgents(task: string, agents: string[]): Promise<void>;
}

/**
 * LLXPRT Bridge Client Interface
 */
export interface ILLXPRTBridgeClient {
  complete(model: string, messages: any[]): Promise<string>;
  checkHealth(): Promise<IntegrationHealth>;
}

/**
 * Voice Client Interface (PocketTTS)
 */
export interface IVoiceClient {
  synthesize(text: string, voice: string): Promise<Buffer>;
  checkHealth(): Promise<IntegrationHealth>;
}

/**
 * Fleet health client interface.
 */
export interface IFleetClient {
  getClusterStatus(): Promise<{ overallHealth: string; workers: any[] }>;
  pingWorker(workerId: string): Promise<boolean>;
}

/**
 * Mock Twenty Client
 */
export class MockTwentyClient implements ITwentyClient {
  private readonly leads = new Map<string, Lead>();

  async getLead(id: string): Promise<Lead> {
    const lead = this.leads.get(id);
    if (!lead) {
      return {
        firstName: "Mock",
        lastName: "User",
        email: "mock@example.com",
        source: "TEST",
      } as Lead;
    }
    return lead;
  }

  async upsertLead(lead: Lead): Promise<Lead> {
    console.log(`[MockTwenty] Upserting lead: ${lead.email}`);
    // AUDIT HOOK: CRM Mutation
    console.log(`[AUDIT] LEAD_MUTATED: ${lead.email} by SYSTEM`);
    const id =
      lead.id || "mock-uuid-" + Math.random().toString(36).substring(7);
    const saved = { ...lead, id };
    this.leads.set(id, saved);
    return saved;
  }

  async logCommunication(
    leadId: string,
    channel: Channel,
    content: string
  ): Promise<void> {
    console.log(
      `[MockTwenty] Logging ${channel} communication for ${leadId}: ${content.substring(0, 10)}`
    );
    // AUDIT HOOK: Communication Event
    console.log(`[AUDIT] COMMUNICATION_LOGGED: ${channel} for ${leadId}`);
  }

  async checkHealth(): Promise<IntegrationHealth> {
    return { status: "HEALTHY" };
  }
}

/**
 * Mock Twilio Client
 */
export class MockTwilioClient implements ICommunicationProvider {
  async send(
    to: string,
    content: string
  ): Promise<{ success: boolean; providerId?: string }> {
    console.log(`[MockTwilio] Sending SMS to ${to}: ${content}`);
    return { success: true, providerId: "mock-twilio-id" };
  }

  async checkHealth(): Promise<IntegrationHealth> {
    return { status: "HEALTHY" };
  }
}

/**
 * Mock SendGrid Client
 */
export class MockSendGridClient implements ICommunicationProvider {
  async send(
    to: string,
    content: string
  ): Promise<{ success: boolean; providerId?: string }> {
    console.log(`[MockSendGrid] Sending Email to ${to}: ${content}`);
    return { success: true, providerId: "mock-sendgrid-id" };
  }

  async checkHealth(): Promise<IntegrationHealth> {
    return { status: "HEALTHY" };
  }
}

/**
 * Mock Voicemod Client
 */
export class MockVoicemodClient {
  async setVoice(voiceId: string): Promise<void> {
    console.log(`[MockVoicemod] Switched to voice: ${voiceId}`);
  }
  async getAvailableVoices(): Promise<string[]> {
    return ["ellis_standard", "broker_pro"];
  }
}

export { ComplianceService, type ComplianceStatus } from "./compliance";
export { TwentyIntegrationAdapter } from "./twenty";
export { TwilioIntegrationAdapter } from "./twilio";
export { ActivepiecesIntegrationAdapter } from "./activepieces";
export { MockActivepiecesClient } from "./activepieces-mock";
export { SendGridIntegrationAdapter } from "./sendgrid";
export { NexusRouterIntegrationAdapter } from "./nexus";
export { MemoryIntegrationAdapter } from "./memory";
export { MockLettaClient } from "./letta";
export { MockWorkflowControl } from "./workflow-control";
export { MockLLXPRTBridgeClient } from "./llxprt";
export { MockVoiceClient } from "./voice";
export { DistributedVoiceService } from "./voice-distributed";
export {
  MockGoogleWorkspaceClient,
  type IGoogleWorkspaceClient,
  type WorkspaceCalendarEvent,
  type WorkspaceEmailDraft,
} from "./google-workspace";
export { MockOpenClawClient, type OpenClawProposedAction } from "./openclaw";
export { MockNerveClient, type NerveVoiceSettings } from "./nerve";
export {
  ClassificationService,
  type ClassificationResult,
  type ClassificationType,
} from "./classification";
export { AuditLogger } from "./audit";
export { CampaignManager } from "./campaigns";
export { MockQuoteEngine } from "./quote-engine";
export { RoutingService } from "./routing";
export { ApprovalService } from "./approval";
export { PaperclipGovernor, type GovernanceResult } from "./paperclip";
export { FleetMonitoringService, MockFleetClient } from "./fleet";
