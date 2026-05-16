import { z } from "zod";
import { EntityIdSchema, IsoDateTimeSchema } from "./common";

export const IntegrationAccountSchema = z.object({
  id: EntityIdSchema.optional(),
  provider: z.enum([
    "TWENTY",
    "TWILIO",
    "SENDGRID",
    "NEXUS",
    "OPENCLAW",
    "ACTIVEPIECES",
    "N8N",
    "MEM0",
    "LETTA",
    "QUOTE_API",
  ]),
  status: z.enum(["CONNECTED", "DEGRADED", "DISCONNECTED", "NEEDS_AUTH"]),
  tenantId: EntityIdSchema.optional(),
  lastHealthCheck: IsoDateTimeSchema.optional(),
  capabilities: z.array(z.string()).default([]),
  secretRef: z.string().min(1).optional(),
});
export type IntegrationAccount = z.infer<typeof IntegrationAccountSchema>;

export const IntegrationHealthSchema = z.object({
  serviceName: z.string().min(1),
  status: z.enum(["HEALTHY", "DEGRADED", "DOWN"]),
  latencyMs: z.number().optional(),
  lastCheckAt: z.date().default(() => new Date()),
});
export type IntegrationHealth = z.infer<typeof IntegrationHealthSchema>;
