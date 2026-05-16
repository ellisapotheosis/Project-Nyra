import { z } from "zod";

export const IsoDateTimeSchema = z.string().datetime({ offset: true });
export const EntityIdSchema = z.string().min(1);
export const UuidSchema = z.string().uuid();

export const MoneySchema = z.object({
  amountCents: z.number().int(),
  currency: z.string().length(3).default("USD"),
});
export type Money = z.infer<typeof MoneySchema>;

export const ChannelSchema = z.enum([
  "SMS",
  "EMAIL",
  "CALL",
  "VOICEMAIL",
  "CHAT",
  "GMAIL",
  "INTERNAL_NOTE",
  "WEBHOOK",
]);
export type Channel = z.infer<typeof ChannelSchema>;

export const DirectionSchema = z.enum(["INBOUND", "OUTBOUND", "INTERNAL"]);
export type Direction = z.infer<typeof DirectionSchema>;

export const ActorSchema = z.object({
  id: EntityIdSchema,
  type: z.enum(["USER", "TEAM", "SYSTEM", "ASSISTANT", "PROVIDER"]),
  displayName: z.string().min(1).optional(),
});
export type Actor = z.infer<typeof ActorSchema>;

export const AuditMetadataSchema = z.object({
  correlationId: EntityIdSchema.optional(),
  idempotencyKey: EntityIdSchema.optional(),
  requestedBy: ActorSchema.optional(),
  source: z.string().min(1).optional(),
  createdAt: IsoDateTimeSchema,
});
export type AuditMetadata = z.infer<typeof AuditMetadataSchema>;

export const AddressSchema = z.object({
  line1: z.string().min(1).optional(),
  line2: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(2).max(2).optional(),
  postalCode: z.string().min(3).optional(),
  country: z.string().length(2).default("US"),
});
export type Address = z.infer<typeof AddressSchema>;

export const PhoneSchema = z.string().regex(/^\+?[1-9]\d{6,14}$/);
