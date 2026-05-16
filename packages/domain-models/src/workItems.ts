import { z } from "zod";
import { ActorSchema, EntityIdSchema, IsoDateTimeSchema } from "./common";

export const DocumentSchema = z.object({
  id: EntityIdSchema.optional(),
  leadId: EntityIdSchema.optional(),
  documentType: z.string().min(1),
  status: z.enum([
    "REQUESTED",
    "UPLOADED",
    "REVIEWING",
    "ACCEPTED",
    "REJECTED",
    "EXPIRED",
  ]),
  storageKey: z.string().min(1).optional(),
  uploadedBy: ActorSchema.optional(),
  requestedBy: ActorSchema.optional(),
  expiresAt: IsoDateTimeSchema.optional(),
  auditTrail: z.array(z.string()).default([]),
});
export type Document = z.infer<typeof DocumentSchema>;

export const TaskSchema = z.object({
  id: EntityIdSchema.optional(),
  assigneeId: EntityIdSchema.optional(),
  leadId: EntityIdSchema.optional(),
  type: z.string().min(1),
  dueAt: IsoDateTimeSchema.optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z
    .enum(["OPEN", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"])
    .default("OPEN"),
  sourceEventId: EntityIdSchema.optional(),
});
export type Task = z.infer<typeof TaskSchema>;
