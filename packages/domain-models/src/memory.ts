import { z } from "zod";
import { EntityIdSchema, IsoDateTimeSchema } from "./common";

export const PlatonicSolidSchema = z.enum([
  "TETRAHEDRON", // High-intent / Quote
  "CUBE",        // Stable CRM Object
  "OCTAHEDRON",  // Bidirectional Comm
  "DODECAHEDRON",// Campaign Sequence
  "ICOSAHEDRON", // Complex Cluster
]);
export type PlatonicSolid = z.infer<typeof PlatonicSolidSchema>;

export const MemoryNodeSchema = z.object({
  id: EntityIdSchema,
  type: z.enum(["LEAD", "CAMPAIGN", "EVENT", "AGENT", "SYSTEM"]),
  label: z.string(),
  geometry: PlatonicSolidSchema,
  color: z.string(), // Hex or Tailind class
  status: z.enum(["ACTIVE", "LOCKED", "STALE", "SUCCESS"]).default("ACTIVE"),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type MemoryNode = z.infer<typeof MemoryNodeSchema>;

export const MemoryRelationshipSchema = z.object({
  id: EntityIdSchema,
  source: EntityIdSchema,
  target: EntityIdSchema,
  type: z.enum(["ORBIT", "CONNECTOR", "PARTICLE_FLOW"]),
  intensity: z.number().min(0).max(1).default(0.5),
});
export type MemoryRelationship = z.infer<typeof MemoryRelationshipSchema>;

export const MemoryOverviewSchema = z.object({
  totalMemories: z.number().int(),
  leadMemories: z.number().int(),
  campaignMemories: z.number().int(),
  agentMemories: z.number().int(),
  systemMemories: z.number().int(),
  recentWrites: z.number().int(),
  failedWrites: z.number().int(),
  averageConfidence: z.number().min(0).max(1),
});
export type MemoryOverview = z.infer<typeof MemoryOverviewSchema>;

export const MemoryObjectSchema = z.object({
  id: EntityIdSchema.optional(),
  scope: z.enum(["LEAD", "CONTACT", "TEAM", "TENANT", "GLOBAL"]),
  subjectId: EntityIdSchema.optional(),
  content: z.string().min(1),
  confidence: z.number().min(0).max(1),
  sourceEventId: EntityIdSchema,
  createdAt: IsoDateTimeSchema,
  expiresAt: IsoDateTimeSchema.optional(),
  tags: z.array(z.string()).default([]),
});
export type MemoryObject = z.infer<typeof MemoryObjectSchema>;

export const MemoryRecordSchema = z.object({
  id: z.string().uuid().optional(),
  leadId: EntityIdSchema,
  content: z.string().min(1),
  confidence: z.number().min(0).max(1),
  sourceEventId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  timestamp: z.date().default(() => new Date()),
});
export type MemoryRecord = z.infer<typeof MemoryRecordSchema>;
