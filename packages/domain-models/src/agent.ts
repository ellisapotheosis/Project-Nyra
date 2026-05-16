import { z } from "zod";
import { ActorSchema, EntityIdSchema, IsoDateTimeSchema } from "./common";

export const AgentActionRiskSchema = z.enum([
  "READ_ONLY",
  "INTERNAL_MUTATION",
  "CRM_MUTATION",
  "BORROWER_COMMUNICATION",
  "COMPLIANCE_CRITICAL",
]);
export type AgentActionRisk = z.infer<typeof AgentActionRiskSchema>;

export const ProposedActionSchema = z.object({
  id: EntityIdSchema.optional(),
  runId: EntityIdSchema,
  actionType: z.string().min(1),
  targetService: z.enum([
    "CRM_API",
    "CAMPAIGN_ENGINE",
    "QUOTE_API",
    "COMMUNICATION_SERVICE",
    "COMPLIANCE_SERVICE",
    "ASSISTANT_SERVICE",
  ]),
  riskLevel: AgentActionRiskSchema,
  payload: z.record(z.string(), z.unknown()),
  diffPreview: z.record(z.string(), z.unknown()).optional(),
  approvalStatus: z
    .enum(["PENDING", "APPROVED", "REJECTED", "EXECUTED", "FAILED"])
    .default("PENDING"),
  requestedBy: ActorSchema,
  createdAt: IsoDateTimeSchema,
});
export type ProposedAction = z.infer<typeof ProposedActionSchema>;

export const AgentRunSchema = z.object({
  runId: EntityIdSchema,
  actor: ActorSchema,
  model: z.string().min(1),
  tools: z.array(z.string()).default([]),
  riskLevel: AgentActionRiskSchema,
  inputContext: z.record(z.string(), z.unknown()).default({}),
  output: z.string().optional(),
  proposedActions: z.array(ProposedActionSchema).default([]),
  approvalStatus: z
    .enum(["NONE_REQUIRED", "PENDING", "APPROVED", "REJECTED"])
    .default("NONE_REQUIRED"),
  startedAt: IsoDateTimeSchema,
  endedAt: IsoDateTimeSchema.optional(),
});
export type AgentRun = z.infer<typeof AgentRunSchema>;

export function requiresHumanApproval(riskLevel: AgentActionRisk): boolean {
  return [
    "CRM_MUTATION",
    "BORROWER_COMMUNICATION",
    "COMPLIANCE_CRITICAL",
  ].includes(riskLevel);
}

export const AgentSessionSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().min(1),
  leadId: EntityIdSchema.optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "FAILED"]),
  startedAt: z.date().default(() => new Date()),
  endedAt: z.date().optional(),
});
export type AgentSession = z.infer<typeof AgentSessionSchema>;

export const AgentToolCallSchema = z.object({
  sessionId: z.string().uuid(),
  toolName: z.string().min(1),
  arguments: z.record(z.string(), z.unknown()),
  result: z.unknown().optional(),
  timestamp: z.date().default(() => new Date()),
});
export type AgentToolCall = z.infer<typeof AgentToolCallSchema>;
