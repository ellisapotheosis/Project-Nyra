import { z } from "zod";
import {
  ChannelSchema,
  DirectionSchema,
  EntityIdSchema,
  IsoDateTimeSchema,
  MoneySchema,
} from "./common";
import { ComplianceDecisionSchema } from "./compliance";

export const MessageSchema = z.object({
  id: EntityIdSchema.optional(),
  leadId: EntityIdSchema.optional(),
  contactId: EntityIdSchema.optional(),
  channel: ChannelSchema,
  direction: DirectionSchema,
  to: z.array(z.string()).default([]),
  from: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().min(1),
  provider: z.string().optional(),
  providerMessageId: z.string().optional(),
  status: z.enum([
    "DRAFT",
    "QUEUED",
    "SENT",
    "DELIVERED",
    "FAILED",
    "RECEIVED",
  ]),
  complianceDecision: ComplianceDecisionSchema.optional(),
  timestamp: IsoDateTimeSchema,
});
export type Message = z.infer<typeof MessageSchema>;

export const CallSchema = z.object({
  id: EntityIdSchema.optional(),
  callId: EntityIdSchema,
  leadId: EntityIdSchema.optional(),
  from: z.string(),
  to: z.string(),
  direction: DirectionSchema,
  status: z.enum([
    "QUEUED",
    "RINGING",
    "IN_PROGRESS",
    "COMPLETED",
    "FAILED",
    "MISSED",
  ]),
  recordingUrl: z.string().url().optional(),
  transcriptId: EntityIdSchema.optional(),
  durationSeconds: z.number().int().nonnegative().optional(),
  cost: MoneySchema.optional(),
  consentSnapshot: ComplianceDecisionSchema.optional(),
});
export type Call = z.infer<typeof CallSchema>;

export const VoicemailSchema = z.object({
  id: EntityIdSchema.optional(),
  leadId: EntityIdSchema,
  scriptId: EntityIdSchema.optional(),
  audioAssetId: EntityIdSchema.optional(),
  providerId: EntityIdSchema.optional(),
  transcript: z.string().optional(),
  campaignStepId: EntityIdSchema.optional(),
  consentDecision: ComplianceDecisionSchema,
  status: z.enum(["READY", "SENT", "RECEIVED", "FAILED"]),
});
export type Voicemail = z.infer<typeof VoicemailSchema>;

export const CommunicationEventSchema = z.object({
  id: EntityIdSchema.optional(),
  leadId: EntityIdSchema,
  channel: ChannelSchema,
  direction: DirectionSchema,
  body: z.string().optional(),
  content: z.string().optional(),
  provider: z.string().optional(),
  providerId: z.string().optional(),
  providerMessageId: z.string().optional(),
  status: z.string().min(1).default("RECORDED"),
  timestamp: z
    .date()
    .or(IsoDateTimeSchema)
    .default(() => new Date()),
  correlationId: EntityIdSchema.optional(),
  campaignStepId: EntityIdSchema.optional(),
  complianceDecision: ComplianceDecisionSchema.optional(),
});
export type CommunicationEvent = z.infer<typeof CommunicationEventSchema>;
