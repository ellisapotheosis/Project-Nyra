import { z } from "zod";
import { ActorSchema, EntityIdSchema, IsoDateTimeSchema } from "./common";

export const TimelineEventSchema = z.object({
  id: EntityIdSchema.optional(),
  leadId: EntityIdSchema,
  type: z.enum([
    "LEAD_CREATED",
    "CRM_UPDATED",
    "CAMPAIGN_ENROLLED",
    "CAMPAIGN_STATE_CHANGED",
    "MESSAGE_SENT",
    "MESSAGE_RECEIVED",
    "CALL_COMPLETED",
    "VOICEMAIL_SENT",
    "QUOTE_CREATED",
    "QUOTE_SENT",
    "DOCUMENT_REQUESTED",
    "DOCUMENT_UPLOADED",
    "TASK_CREATED",
    "COMPLIANCE_EVENT",
    "AGENT_RUN",
    "PROPOSED_ACTION",
  ]),
  title: z.string().min(1),
  occurredAt: IsoDateTimeSchema,
  actor: ActorSchema.optional(),
  sourceService: z.string().min(1),
  relatedEntityId: EntityIdSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
