import { z } from "zod";
import { EntityIdSchema } from "./common";
import { AgentActionRiskSchema } from "./agent";

export { z };

export * from "./agent";
export * from "./campaign";
export * from "./common";
export * from "./communication";
export * from "./compliance";
export * from "./contact";
export * from "./integration";
export * from "./lead";
export * from "./loanScenario";
export * from "./memory";
export * from "./quote";
export * from "./timeline";
export * from "./user";
export * from "./workItems";

export const WorkerRoleSchema = z.enum([
  "ORCHESTRATOR",
  "RTX5090_BURST",
  "RTX3090TI_STEADY",
  "RTX3060_LIGHTWEIGHT",
  "ORACLE_VPS",
  "HOME_ASSISTANT",
]);
export type WorkerRole = z.infer<typeof WorkerRoleSchema>;

export const WorkerNodeSchema = z.object({
  id: z.string().min(1),
  role: WorkerRoleSchema,
  hostname: z.string().min(1),
  status: z.enum(["ONLINE", "OFFLINE", "BUSY"]),
  activeModels: z.array(z.string()),
});
export type WorkerNode = z.infer<typeof WorkerNodeSchema>;

export const ModelRouteSchema = z.object({
  modelName: z.string().min(1),
  primaryWorkerId: z.string().min(1),
  fallbackWorkerId: z.string().optional(),
  priority: z.number().int().default(1),
});
export type ModelRoute = z.infer<typeof ModelRouteSchema>;

export const AuditEventSchema = z.object({
  id: EntityIdSchema.optional(),
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  action: z.string().min(1),
  riskLevel: AgentActionRiskSchema,
  performer: z.string().min(1),
  details: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.date().default(() => new Date()),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;
