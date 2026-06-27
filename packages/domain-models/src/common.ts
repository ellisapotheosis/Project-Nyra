import { z } from "zod";

export const EntityIdSchema = z.string().uuid();
export type EntityId = z.infer<typeof EntityIdSchema>;

export const IsoDateTimeSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime());
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

export const ConsentStatusSchema = z.enum([
  "UNKNOWN",
  "OPTED_IN",
  "OPTED_OUT",
  "DO_NOT_CONTACT",
]);
export type ConsentStatus = z.infer<typeof ConsentStatusSchema>;

export const AuditMetadataSchema = z.object({
  createdAt: z.string(),
  source: z.string().optional(),
  performer: z.string().optional(),
  reason: z.string().optional(),
});
export type AuditMetadata = z.infer<typeof AuditMetadataSchema>;
