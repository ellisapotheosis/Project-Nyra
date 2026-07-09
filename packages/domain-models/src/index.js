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
export const ChannelSchema = z.enum([
  "SMS",
  "EMAIL",
  "CALL",
  "VOICEMAIL",
  "GMAIL",
  "INTERNAL_NOTE",
  "WEBHOOK",
]);
export const ConsentStatusSchema = z.enum([
  "UNKNOWN",
  "OPTED_IN",
  "OPTED_OUT",
  "DO_NOT_CONTACT",
]);
export const AgentActionRiskSchema = z.enum([
  "READ_ONLY",
  "INTERNAL_MUTATION",
  "CRM_MUTATION",
  "BORROWER_COMMUNICATION",
  "COMPLIANCE_CRITICAL",
]);
export const CampaignStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "FAILED",
  "STOPPED",
]);
export const WorkerRoleSchema = z.enum([
  "ORCHESTRATOR",
  "RTX5090_BURST",
  "RTX3090TI_STEADY",
  "RTX3060_LIGHTWEIGHT",
  "ORACLE_VPS",
  "HOME_ASSISTANT",
]);
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
export const RealtorPartnerSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
});
export const LoanOpportunitySchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid(),
  realtorId: z.string().uuid().optional(),
  loanAmount: z.number().positive().optional(),
  estimatedValue: z.number().positive().optional(),
  loanType: z.enum(["PURCHASE", "REFINANCE", "HELOC"]).optional(),
  stage: z.string().default("PROSPECT"),
});
export const MortgageScenarioSchema = z.object({
  loanAmount: z.number().positive(),
  interestRate: z.number().positive(),
  loanTermYears: z.number().int().positive(),
  monthlyPayment: z.number().positive(),
  closingCosts: z.number().nonnegative(),
  apr: z.number().positive(),
  programName: z.string().min(1),
});
export const QuoteRequestSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid(),
  scenarioType: z.enum(["LOWEST_PAYMENT", "BALANCED", "LOWEST_COST"]),
  requestedBy: z.string().min(1),
  timestamp: z.date().default(() => new Date()),
});
export const QuoteOptionSchema = z.object({
  label: z.string().min(1),
  scenario: MortgageScenarioSchema,
  recommendation: z.string().optional(),
});
export const QuoteSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid(),
  options: z.object({
    lowestPayment: QuoteOptionSchema,
    balanced: QuoteOptionSchema,
    lowestCost: QuoteOptionSchema,
  }),
  assumptions: z.record(z.string(), z.string()).optional(),
  createdAt: z.date().optional(),
});
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
export const CampaignEnrollmentSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid(),
  campaignId: z.string(),
  status: CampaignStatusSchema.default("ACTIVE"),
  currentStepIndex: z.number().int().nonnegative().default(0),
  enrolledAt: z.date().default(() => new Date()),
  lastActivityAt: z.date().optional(),
});
export const CommunicationEventSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid(),
  channel: ChannelSchema,
  direction: z.enum(["INBOUND", "OUTBOUND"]),
  content: z.string(),
  providerId: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
});
export const ConsentStateSchema = z.object({
  leadId: z.string().uuid(),
  status: ConsentStatusSchema,
  timestamp: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});
export const DoNotContactStateSchema = z.object({
  leadId: z.string().uuid(),
  phone: z.string().optional(),
  email: z.string().optional(),
  active: z.boolean().default(true),
  reason: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
});
export const AgentSessionSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().min(1),
  leadId: z.string().uuid().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "FAILED"]),
  startedAt: z.date().default(() => new Date()),
  endedAt: z.date().optional(),
});
export const AgentToolCallSchema = z.object({
  sessionId: z.string().uuid(),
  toolName: z.string().min(1),
  arguments: z.record(z.string(), z.unknown()),
  result: z.unknown().optional(),
  timestamp: z.date().default(() => new Date()),
});
export const MemoryRecordSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: z.string().uuid(),
  content: z.string().min(1),
  confidence: z.number().min(0).max(1),
  sourceEventId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  timestamp: z.date().default(() => new Date()),
});
export const IntegrationHealthSchema = z.object({
  serviceName: z.string().min(1),
  status: z.enum(["HEALTHY", "DEGRADED", "DOWN"]),
  latencyMs: z.number().optional(),
  lastCheckAt: z.date().default(() => new Date()),
});
export const WorkerNodeSchema = z.object({
  id: z.string().min(1),
  role: WorkerRoleSchema,
  hostname: z.string().min(1),
  status: z.enum(["ONLINE", "OFFLINE", "BUSY"]),
  activeModels: z.array(z.string()),
});
export const ModelRouteSchema = z.object({
  modelName: z.string().min(1),
  primaryWorkerId: z.string().min(1),
  fallbackWorkerId: z.string().optional(),
  priority: z.number().int().default(1),
});
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
//# sourceMappingURL=index.js.map
