import { z } from "zod";

export const EntityIdSchema = z.string().uuid();
export type EntityId = z.infer<typeof EntityIdSchema>;

export const IsoDateTimeSchema = z.string().datetime();
export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>;

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

export const AuditMetadataSchema = z.object({
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  source: z.string().optional(),
  ipAddress: z.string().optional(),
});
export type AuditMetadata = z.infer<typeof AuditMetadataSchema>;
