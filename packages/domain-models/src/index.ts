import { z } from "zod";

export const LeadStageSchema = z.enum([
  "NEW",
  "CONTACTED",
  "NURTURING",
  "APPLICATION_STARTED",
  "DOCS_NEEDED",
  "SUBMITTED",
  "APPROVED",
  "CLEAR_TO_CLOSE",
  "FUNDED",
  "LOST",
  "DO_NOT_CONTACT",
]);
export type LeadStage = z.infer<typeof LeadStageSchema>;

export const ChannelSchema = z.enum([
  "SMS",
  "EMAIL",
  "CALL",
  "VOICEMAIL",
  "GMAIL",
  "INTERNAL_NOTE",
  "WEBHOOK",
]);
export type Channel = z.infer<typeof ChannelSchema>;

export const ConsentStatusSchema = z.enum([
  "UNKNOWN",
  "OPTED_IN",
  "OPTED_OUT",
  "DO_NOT_CONTACT",
]);
export type ConsentStatus = z.infer<typeof ConsentStatusSchema>;

export const AgentActionRiskSchema = z.enum([
  "READ_ONLY",
  "INTERNAL_MUTATION",
  "CRM_MUTATION",
  "BORROWER_COMMUNICATION",
  "COMPLIANCE_CRITICAL",
]);
export type AgentActionRisk = z.infer<typeof AgentActionRiskSchema>;

export const CampaignStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "FAILED",
  "STOPPED",
]);
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;

export const WorkerRoleSchema = z.enum([
  "ORCHESTRATOR",
  "RTX5090_BURST",
  "RTX3090TI_STEADY",
  "RTX3060_LIGHTWEIGHT",
  "RTX4060_BACKUP",
  "ORACLE_VPS",
  "HOME_ASSISTANT",
]);
export type WorkerRole = z.infer<typeof WorkerRoleSchema>;

export const HostRoleSchema = z.enum([
  "CONTROL_PLANE",
  "DURABLE_CLOUD",
  "GPU_WORKER",
  "LAN_SERVICE",
  "BACKUP_GATEWAY",
]);
export type HostRole = z.infer<typeof HostRoleSchema>;

export const WorkerCapabilitySchema = z.enum([
  "VLLM",
  "OLLAMA",
  "LITELLM",
  "LMCACHE",
  "EMBEDDINGS",
  "EXTRACTION",
  "SUMMARIZATION",
  "VOICE_STT",
  "VOICE_TTS",
  "OPENCLAW",
  "NERVEUI",
  "PICOCLAW",
]);
export type WorkerCapability = z.infer<typeof WorkerCapabilitySchema>;

export const IntegrationStatusSchema = z.enum([
  "HEALTHY",
  "DEGRADED",
  "DOWN",
  "DISABLED",
  "OWNER_GATED",
]);
export type IntegrationStatus = z.infer<typeof IntegrationStatusSchema>;

export const VoiceJobStatusSchema = z.enum([
  "QUEUED",
  "ASSIGNED",
  "TRANSCRIBING",
  "SYNTHESIZING",
  "WAITING_FOR_APPROVAL",
  "COMPLETED",
  "FAILED",
  "CANCELED",
]);
export type VoiceJobStatus = z.infer<typeof VoiceJobStatusSchema>;

export const AgentRoleSchema = z.enum([
  "BROKER_ASSISTANT",
  "MEMORY_MANAGER",
  "CAMPAIGN_OPERATOR",
  "QUOTE_ASSISTANT",
  "VOICE_OPERATOR",
  "INFRA_OPERATOR",
  "COMPLIANCE_REVIEWER",
]);
export type AgentRole = z.infer<typeof AgentRoleSchema>;

export const LeadSchema = z.object({
  id: z.string().uuid().optional(),
  externalId: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  source: z.string().min(1),
  stage: LeadStageSchema.default("NEW"),
  consentStatus: ConsentStatusSchema.default("UNKNOWN"),
  doNotContact: z.boolean().default(false),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Lead = z.infer<typeof LeadSchema>;

export const BorrowerSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  ssnLastFour: z.string().length(4).optional(),
  dateOfBirth: z.date().optional(),
  address: z.string().optional(),
});
export type Borrower = z.infer<typeof BorrowerSchema>;

export const RealtorPartnerSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
});
export type RealtorPartner = z.infer<typeof RealtorPartnerSchema>;

export const LoanOpportunitySchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid(),
  realtorId: z.string().uuid().optional(),
  loanAmount: z.number().positive().optional(),
  estimatedValue: z.number().positive().optional(),
  loanType: z.enum(["PURCHASE", "REFINANCE", "HELOC"]).optional(),
  stage: z.string().default("PROSPECT"),
});
export type LoanOpportunity = z.infer<typeof LoanOpportunitySchema>;

export const MortgageScenarioSchema = z.object({
  loanAmount: z.number().positive(),
  interestRate: z.number().positive(),
  loanTermYears: z.number().int().positive(),
  monthlyPayment: z.number().positive(),
  closingCosts: z.number().nonnegative(),
  apr: z.number().positive(),
  programName: z.string().min(1),
});
export type MortgageScenario = z.infer<typeof MortgageScenarioSchema>;

export const QuoteRequestSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid(),
  scenarioType: z.enum(["LOWEST_PAYMENT", "BALANCED", "LOWEST_COST"]),
  requestedBy: z.string().min(1),
  timestamp: z.date().default(() => new Date()),
});
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

export const RateQuoteRequestSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  propertyState: z.string().length(2),
  propertyValue: z.number().positive(),
  loanAmount: z.number().positive(),
  creditScore: z.number().int().min(300).max(850).optional(),
  loanPurpose: z.enum(["PURCHASE", "REFINANCE", "CASH_OUT", "HELOC"]),
  occupancy: z
    .enum(["PRIMARY", "SECOND_HOME", "INVESTMENT"])
    .default("PRIMARY"),
  requestedAt: z.date().default(() => new Date()),
});
export type RateQuoteRequest = z.infer<typeof RateQuoteRequestSchema>;

export const RateQuoteResultSchema = z.object({
  requestId: z.string().optional(),
  status: z.enum(["AVAILABLE", "DEGRADED", "UNAVAILABLE"]),
  source: z.enum(["REAL_PROVIDER", "MOCK", "CACHE", "MANUAL"]),
  candidates: z
    .array(
      z.object({
        programName: z.string().min(1),
        rate: z.number().positive(),
        apr: z.number().positive().optional(),
        points: z.number().default(0),
        lockDays: z.number().int().positive().optional(),
      })
    )
    .default([]),
  message: z.string().optional(),
  checkedAt: z.date().default(() => new Date()),
});
export type RateQuoteResult = z.infer<typeof RateQuoteResultSchema>;

export const QuoteOptionSchema = z.object({
  label: z.string().min(1),
  scenario: MortgageScenarioSchema,
  recommendation: z.string().optional(),
});
export type QuoteOption = z.infer<typeof QuoteOptionSchema>;

export const QuoteSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid(),
  options: z.object({
    lowestPayment: QuoteOptionSchema,
    balanced: QuoteOptionSchema,
    lowestCost: QuoteOptionSchema,
  }),
  assumptions: z.record(z.string(), z.string()).optional(),
  approvalStatus: z
    .enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"])
    .default("PENDING"),
  mockDisclosure: z.string().optional(),
  createdAt: z.date().optional(),
});
export type Quote = z.infer<typeof QuoteSchema>;

export const DripCampaignSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  steps: z.array(
    z.object({
      delay: z.string().min(1),
      channel: ChannelSchema,
      content: z.string().min(1),
    })
  ),
});
export type DripCampaign = z.infer<typeof DripCampaignSchema>;

export const CampaignEnrollmentSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid(),
  campaignId: z.string(),
  status: CampaignStatusSchema.default("ACTIVE"),
  currentStepIndex: z.number().int().nonnegative().default(0),
  enrolledAt: z.date().default(() => new Date()),
  lastActivityAt: z.date().optional(),
});
export type CampaignEnrollment = z.infer<typeof CampaignEnrollmentSchema>;

export const CommunicationEventSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid(),
  channel: ChannelSchema,
  direction: z.enum(["INBOUND", "OUTBOUND"]),
  content: z.string(),
  providerId: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
});
export type CommunicationEvent = z.infer<typeof CommunicationEventSchema>;

export const ConsentStateSchema = z.object({
  leadId: z.string().uuid(),
  status: ConsentStatusSchema,
  timestamp: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});
export type ConsentState = z.infer<typeof ConsentStateSchema>;

export const DoNotContactStateSchema = z.object({
  leadId: z.string().uuid(),
  phone: z.string().optional(),
  email: z.string().optional(),
  active: z.boolean().default(true),
  reason: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
});
export type DoNotContactState = z.infer<typeof DoNotContactStateSchema>;

export const AgentSessionSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().min(1),
  role: AgentRoleSchema.optional(),
  runtime: z
    .enum(["OPENCLAW", "LETTA", "CODEX", "CLAUDE", "GEMINI"])
    .optional(),
  leadId: z.string().uuid().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "FAILED"]),
  startedAt: z.date().default(() => new Date()),
  endedAt: z.date().optional(),
});
export type AgentSession = z.infer<typeof AgentSessionSchema>;

export const AgentRuntimeSchema = z.object({
  id: z.string().min(1),
  runtime: z.enum([
    "OPENCLAW",
    "LETTA",
    "NERVEUI",
    "CODEX",
    "CLAUDE",
    "GEMINI",
  ]),
  workerId: z.string().optional(),
  modelRoute: z.string().optional(),
  status: IntegrationStatusSchema.default("OWNER_GATED"),
});
export type AgentRuntime = z.infer<typeof AgentRuntimeSchema>;

export const AgentToolCallSchema = z.object({
  sessionId: z.string().uuid(),
  toolName: z.string().min(1),
  arguments: z.record(z.string(), z.unknown()),
  result: z.unknown().optional(),
  riskLevel: AgentActionRiskSchema.default("READ_ONLY"),
  approvalRequired: z.boolean().default(false),
  timestamp: z.date().default(() => new Date()),
});
export type AgentToolCall = z.infer<typeof AgentToolCallSchema>;

export const HumanApprovalRequestSchema = z.object({
  id: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  riskLevel: AgentActionRiskSchema,
  summary: z.string().min(1),
  proposedAction: z.record(z.string(), z.unknown()),
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"])
    .default("PENDING"),
  createdAt: z.date().default(() => new Date()),
});
export type HumanApprovalRequest = z.infer<typeof HumanApprovalRequestSchema>;

export const MemoryRecordSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid(),
  content: z.string().min(1),
  confidence: z.number().min(0).max(1),
  sourceEventId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  timestamp: z.date().default(() => new Date()),
});
export type MemoryRecord = z.infer<typeof MemoryRecordSchema>;

export const IntegrationHealthSchema = z.object({
  serviceName: z.string().min(1),
  status: z.enum(["HEALTHY", "DEGRADED", "DOWN"]),
  latencyMs: z.number().optional(),
  lastCheckAt: z.date().default(() => new Date()),
});
export type IntegrationHealth = z.infer<typeof IntegrationHealthSchema>;

export const WorkerNodeSchema = z.object({
  id: z.string().min(1),
  role: WorkerRoleSchema,
  hostname: z.string().min(1),
  status: z.enum(["ONLINE", "OFFLINE", "BUSY"]),
  activeModels: z.array(z.string()),
  capabilities: z.array(WorkerCapabilitySchema).default([]),
});
export type WorkerNode = z.infer<typeof WorkerNodeSchema>;

export const WorkerAssignmentSchema = z.object({
  taskId: z.string().min(1),
  workerId: z.string().min(1),
  reason: z.string().min(1),
  capabilities: z.array(WorkerCapabilitySchema),
  assignedAt: z.date().default(() => new Date()),
});
export type WorkerAssignment = z.infer<typeof WorkerAssignmentSchema>;

export const OrchestrationTaskSchema = z.object({
  id: z.string().uuid().optional(),
  role: AgentRoleSchema,
  leadId: z.string().uuid().optional(),
  objective: z.string().min(1),
  riskLevel: AgentActionRiskSchema.default("READ_ONLY"),
  status: z
    .enum(["QUEUED", "RUNNING", "WAITING_FOR_APPROVAL", "COMPLETED", "FAILED"])
    .default("QUEUED"),
  createdAt: z.date().default(() => new Date()),
});
export type OrchestrationTask = z.infer<typeof OrchestrationTaskSchema>;

export const ModelRouteSchema = z.object({
  modelName: z.string().min(1),
  primaryWorkerId: z.string().min(1),
  fallbackWorkerId: z.string().optional(),
  priority: z.number().int().default(1),
});
export type ModelRoute = z.infer<typeof ModelRouteSchema>;

export const AuditEventSchema = z.object({
  id: z.string().uuid().optional(),
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  action: z.string().min(1),
  riskLevel: AgentActionRiskSchema,
  performer: z.string().min(1),
  details: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.date().default(() => new Date()),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

export const HostStackSchema = z.object({
  host: z.string().min(1),
  role: HostRoleSchema,
  composeFiles: z.array(z.string()).default([]),
  tailscaleOnly: z.boolean().default(true),
  publicIngress: z
    .enum(["NONE", "CLOUDFLARE_TUNNEL", "CLOUDFLARE_ACCESS"])
    .default("NONE"),
});
export type HostStack = z.infer<typeof HostStackSchema>;

export const SecretMountSchema = z.object({
  name: z.string().min(1),
  provider: z.enum(["INFISICAL", "ENV_FILE", "DOCKER_SECRET"]),
  mountPath: z.string().optional(),
  required: z.boolean().default(true),
  placeholderOnly: z.boolean().default(true),
});
export type SecretMount = z.infer<typeof SecretMountSchema>;

export const MCPServerSchema = z.object({
  id: z.string().min(1),
  transport: z.enum(["stdio", "streamable_http", "sse"]),
  url: z.string().url().optional(),
  command: z.string().optional(),
  ownerHost: z.string().optional(),
  status: IntegrationStatusSchema.default("OWNER_GATED"),
});
export type MCPServer = z.infer<typeof MCPServerSchema>;

export const VoiceJobSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  status: VoiceJobStatusSchema.default("QUEUED"),
  sttWorkerId: z.string().optional(),
  ttsWorkerId: z.string().optional(),
  llmWorkerId: z.string().optional(),
  transcript: z.string().optional(),
  proposedAction: z.string().optional(),
  requiresHumanApproval: z.boolean().default(true),
  latencyMs: z.number().nonnegative().optional(),
  createdAt: z.date().default(() => new Date()),
});
export type VoiceJob = z.infer<typeof VoiceJobSchema>;

export const ComplianceDecisionSchema = z.object({
  allowed: z.boolean(),
  reason: z.enum([
    "ALLOWED",
    "MISSING_CONSENT",
    "OPTED_OUT",
    "DO_NOT_CONTACT",
    "QUIET_HOURS",
    "MISSING_DESTINATION",
    "REQUIRES_APPROVAL",
    "PROVIDER_POLICY_BLOCK",
  ]),
  channel: ChannelSchema,
  decidedAt: z.string().datetime(),
  policyVersion: z.string().min(1).default("v1"),
});
export type ComplianceDecision = z.infer<typeof ComplianceDecisionSchema>;

export const QuietHoursPolicySchema = z.object({
  timezone: z.string().min(1),
  startHour: z.number().int().min(0).max(23).default(20),
  endHour: z.number().int().min(0).max(23).default(8),
  allowTransactional: z.boolean().default(false),
});
export type QuietHoursPolicy = z.infer<typeof QuietHoursPolicySchema>;

export function isStopRequest(message: string): boolean {
  return /\b(STOP|UNSUBSCRIBE|REMOVE|CANCEL|OPT\s*OUT|DNC|QUIT|END)\b/i.test(
    message
  );
}

export function isUnsubscribeRequest(message: string): boolean {
  return /\b(UNSUBSCRIBE|OPT\s*OUT|REMOVE\s+ME|EMAIL\s+STOP)\b/i.test(message);
}

export function isWithinQuietHours(
  date: Date,
  policy: QuietHoursPolicy
): boolean {
  const hour =
    policy.timezone === "UTC"
      ? date.getUTCHours()
      : Number(
          new Intl.DateTimeFormat("en-US", {
            timeZone: policy.timezone,
            hour: "2-digit",
            hour12: false,
          }).format(date)
        );

  if (policy.startHour === policy.endHour) {
    return true;
  }

  if (policy.startHour < policy.endHour) {
    return hour >= policy.startHour && hour < policy.endHour;
  }

  return hour >= policy.startHour || hour < policy.endHour;
}
