import type {
  AgentSession,
  AgentToolCall,
  AuditEvent,
  Channel,
  HumanApprovalRequest,
  Lead,
  MemoryRecord,
  OrchestrationTask,
  Quote,
  RateQuoteRequest,
  RateQuoteResult,
} from "@nyra/domain-models";

export interface IntegrationHealth {
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  message?: string;
}

export interface IHealthCheckClient {
  checkHealth(): Promise<IntegrationHealth>;
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

export interface ISupabaseAuthClient extends IHealthCheckClient {
  getUser(id: string): Promise<{ id: string; email?: string } | null>;
}

export interface ISupabaseDataClient extends IHealthCheckClient {
  upsertRecord(table: string, record: Record<string, unknown>): Promise<void>;
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

export interface IN8nConstrainedCampaignClient extends IHealthCheckClient {
  listAllowedTemplates(): Promise<string[]>;
  triggerTemplate(templateId: string, leadId: string): Promise<void>;
}

export interface ICalendarClient extends IHealthCheckClient {
  createBookingLink(leadId: string): Promise<string>;
}

export interface IRebumpClient extends ICommunicationProvider {}

export interface IGoogleWorkspaceClient extends IHealthCheckClient {
  sendInternalEmail(to: string, subject: string, body: string): Promise<void>;
}

export interface ICrmApiClient extends IHealthCheckClient {
  ingestLead(lead: Lead): Promise<Lead>;
}

export interface IQuoteEngine {
  generateQuote(lead: Lead): Promise<Quote>;
}

export interface IRateQuotingClient extends IHealthCheckClient {
  requestRateQuote(request: RateQuoteRequest): Promise<RateQuoteResult>;
}

export interface ICampaignEngineClient extends IHealthCheckClient {
  enroll(leadId: string, campaignId: string): Promise<void>;
  stopAllForLead(leadId: string, reason: string): Promise<void>;
}

export interface INexusRouterClient extends IHealthCheckClient {
  callTool<T = unknown>(toolName: string, input: unknown): Promise<T>;
}

export interface IHiveRouterClient extends INexusRouterClient {}

export interface ILiteLlmClient extends IHealthCheckClient {
  complete(
    model: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<string>;
}

export interface IOpenClawClient extends IHealthCheckClient {
  createSession(task: OrchestrationTask): Promise<AgentSession>;
}

export interface INerveClient extends IHealthCheckClient {
  listWorkerSessions(workerId: string): Promise<AgentSession[]>;
}

export interface ILettaClient extends IHealthCheckClient {
  runTask(task: OrchestrationTask): Promise<string>;
}

export interface ILettaMcpClient extends INexusRouterClient {}

export interface IMemoryClient<TRecord = unknown> {
  write(record: TRecord): Promise<void>;
  read(leadId: string): Promise<TRecord[]>;
}

export interface IMem0Client
  extends IMemoryClient<MemoryRecord>, IHealthCheckClient {}
export interface IQdrantClient extends IHealthCheckClient {
  upsertVector(collection: string, id: string, vector: number[]): Promise<void>;
}
export interface IMempalaceClient
  extends IMemoryClient<MemoryRecord>, IHealthCheckClient {}
export interface IClaudeMemClient
  extends IMemoryClient<MemoryRecord>, IHealthCheckClient {}
export interface IOpenMemoryMcpClient
  extends IMemoryClient<MemoryRecord>, IHealthCheckClient {}

export interface IComposioClient extends IHealthCheckClient {
  invoke(action: string, input: unknown): Promise<unknown>;
}

export interface IGastownClient extends IHealthCheckClient {
  createWorkspace(name: string): Promise<{ id: string; name: string }>;
}

export interface IClawteamClient extends IHealthCheckClient {
  assignTask(task: OrchestrationTask): Promise<void>;
}

export interface IDockerMcpToolkitClient extends IHealthCheckClient {
  listTools(): Promise<string[]>;
}

export interface IAuditSink {
  writeAudit(event: AuditEvent): Promise<void>;
}

export interface IAgentAuditSink {
  recordToolCall(call: AgentToolCall): Promise<void>;
  requestHumanApproval(request: HumanApprovalRequest): Promise<void>;
}

export class MockHealthClient implements IHealthCheckClient {
  constructor(
    private readonly status: IntegrationHealth["status"] = "HEALTHY",
    private readonly message?: string
  ) {}

  async checkHealth(): Promise<IntegrationHealth> {
    return { status: this.status, message: this.message };
  }
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
      approvalStatus: "PENDING",
      mockDisclosure:
        "Mock quote output is deterministic test data and is not borrower-facing pricing.",
      createdAt: new Date(),
    };
  }
}

export class MockRateQuotingClient
  extends MockHealthClient
  implements IRateQuotingClient
{
  async requestRateQuote(request: RateQuoteRequest): Promise<RateQuoteResult> {
    return {
      requestId: request.id,
      status: "UNAVAILABLE",
      source: "MOCK",
      candidates: [],
      message: "Real rate provider credentials are not configured.",
      checkedAt: new Date(),
    };
  }
}

export class MockActivepiecesClient
  extends MockHealthClient
  implements IActivepiecesClient
{
  readonly enrollments: Array<{ leadId: string; campaignId: string }> = [];

  async enrollInCampaign(leadId: string, campaignId: string): Promise<void> {
    this.enrollments.push({ leadId, campaignId });
  }

  async removeFromCampaign(leadId: string, campaignId: string): Promise<void> {
    const index = this.enrollments.findIndex(
      (item) => item.leadId === leadId && item.campaignId === campaignId
    );
    if (index >= 0) this.enrollments.splice(index, 1);
  }
}

export class MockN8nConstrainedCampaignClient
  extends MockHealthClient
  implements IN8nConstrainedCampaignClient
{
  private readonly allowedTemplates = [
    "new-internet-lead",
    "purchase-pre-approval",
    "refinance-inquiry",
    "realtor-partner-lead",
    "credit-repair-follow-up",
    "rate-watch",
    "dormant-lead-reactivation",
    "post-close-referral",
    "missed-call-ping",
  ];

  async listAllowedTemplates(): Promise<string[]> {
    return [...this.allowedTemplates];
  }

  async triggerTemplate(templateId: string, _leadId: string): Promise<void> {
    if (!this.allowedTemplates.includes(templateId)) {
      throw new Error(
        `n8n template is not in the mortgage fallback allowlist: ${templateId}`
      );
    }
  }
}

export class MockCampaignEngineClient
  extends MockHealthClient
  implements ICampaignEngineClient
{
  readonly stoppedLeads = new Map<string, string>();

  async enroll(_leadId: string, _campaignId: string): Promise<void> {}

  async stopAllForLead(leadId: string, reason: string): Promise<void> {
    this.stoppedLeads.set(leadId, reason);
  }
}

export class MockMemoryClient
  extends MockHealthClient
  implements
    IMem0Client,
    IMempalaceClient,
    IClaudeMemClient,
    IOpenMemoryMcpClient
{
  private readonly records: MemoryRecord[] = [];

  async write(record: MemoryRecord): Promise<void> {
    if (!record.sourceEventId || typeof record.confidence !== "number") {
      throw new Error("Memory writes require sourceEventId and confidence");
    }
    this.records.push(record);
  }

  async read(leadId: string): Promise<MemoryRecord[]> {
    return this.records.filter((record) => record.leadId === leadId);
  }
}

export class MockDockerMcpToolkitClient
  extends MockHealthClient
  implements IDockerMcpToolkitClient
{
  async listTools(): Promise<string[]> {
    return ["docker_ps", "docker_logs", "docker_compose_config"];
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

export class MockGenericAdapter
  extends MockHealthClient
  implements
    ISupabaseAuthClient,
    ISupabaseDataClient,
    ICalendarClient,
    IGoogleWorkspaceClient,
    ICrmApiClient,
    INexusRouterClient,
    IHiveRouterClient,
    ILiteLlmClient,
    IOpenClawClient,
    INerveClient,
    ILettaClient,
    ILettaMcpClient,
    IComposioClient,
    IGastownClient,
    IClawteamClient
{
  async getUser(id: string): Promise<{ id: string; email?: string } | null> {
    return { id, email: "mock@example.test" };
  }

  async upsertRecord(
    _table: string,
    _record: Record<string, unknown>
  ): Promise<void> {}

  async createBookingLink(leadId: string): Promise<string> {
    return `https://calendly.example.test/nyra/${leadId}`;
  }

  async sendInternalEmail(
    _to: string,
    _subject: string,
    _body: string
  ): Promise<void> {}

  async ingestLead(lead: Lead): Promise<Lead> {
    return lead;
  }

  async callTool<T = unknown>(_toolName: string, input: unknown): Promise<T> {
    return input as T;
  }

  async complete(
    _model: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    return messages.at(-1)?.content ?? "";
  }

  async createSession(task: OrchestrationTask): Promise<AgentSession> {
    return {
      id: "00000000-0000-4000-8000-000000000010",
      agentId: task.role,
      role: task.role,
      runtime: "OPENCLAW",
      leadId: task.leadId,
      status: "ACTIVE",
      startedAt: new Date(),
    };
  }

  async listWorkerSessions(_workerId: string): Promise<AgentSession[]> {
    return [];
  }

  async runTask(task: OrchestrationTask): Promise<string> {
    return `mock-complete:${task.id ?? task.role}`;
  }

  async invoke(_action: string, input: unknown): Promise<unknown> {
    return input;
  }

  async createWorkspace(name: string): Promise<{ id: string; name: string }> {
    return { id: "mock-gastown-workspace", name };
  }

  async assignTask(_task: OrchestrationTask): Promise<void> {}
}

export { ComplianceService, type ComplianceStatus } from "./compliance";
export { AuditLogger, type IAuditProvider } from "./audit";
