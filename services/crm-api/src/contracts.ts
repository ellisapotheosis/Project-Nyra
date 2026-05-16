import {
  CommunicationEventSchema,
  LeadSchema,
  QuoteSchema,
  TaskSchema,
  TimelineEventSchema,
  z,
} from "@nyra/domain-models";

export const CreateLeadRequestSchema = LeadSchema.omit({
  id: true,
  crmRecordId: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  stage: true,
  consentStatus: true,
  consentSms: true,
  consentEmail: true,
  consentVoice: true,
  doNotContact: true,
});

export const UpdateLeadRequestSchema = LeadSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Lead update must include at least one field"
);

export const LeadTimelineResponseSchema = z.object({
  leadId: z.string().min(1),
  events: z.array(TimelineEventSchema),
});

export const CreateTaskRequestSchema = TaskSchema.omit({ id: true });
export const CreateCommunicationLogRequestSchema =
  CommunicationEventSchema.omit({
    id: true,
  });
export const CreateQuoteMirrorRequestSchema = QuoteSchema;

export type CreateLeadRequest = z.infer<typeof CreateLeadRequestSchema>;
export type UpdateLeadRequest = z.infer<typeof UpdateLeadRequestSchema>;
