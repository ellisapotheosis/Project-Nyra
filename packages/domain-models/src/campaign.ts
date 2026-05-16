import { z } from "zod";
import { ChannelSchema, EntityIdSchema, IsoDateTimeSchema } from "./common";
import { ComplianceDecisionSchema, QuietHoursPolicySchema } from "./compliance";

export const CampaignStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "FAILED",
  "STOPPED",
]);
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;

export const CampaignEnrollmentStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "REPLIED",
  "STOPPED",
  "COMPLETED",
  "FAILED",
]);
export type CampaignEnrollmentStatus = z.infer<
  typeof CampaignEnrollmentStatusSchema
>;

export const CampaignStepSchema = z.object({
  id: EntityIdSchema.optional(),
  day: z.number().int().nonnegative().optional(),
  offsetMinutes: z.number().int().nonnegative(),
  channel: ChannelSchema,
  templateId: EntityIdSchema.optional(),
  body: z.string().min(1),
  guardrails: z.array(z.string()).default([]),
  quietHoursPolicy: QuietHoursPolicySchema.optional(),
  requiresApproval: z.boolean().default(false),
  stopOnReply: z.boolean().default(true),
});
export type CampaignStep = z.infer<typeof CampaignStepSchema>;

export const CampaignSchema = z.object({
  id: EntityIdSchema.optional(),
  name: z.string().min(1),
  version: z.number().int().positive().default(1),
  status: CampaignStatusSchema.default("DRAFT"),
  loanPurpose: z.string().optional(),
  audience: z.array(z.string()).default([]),
  steps: z.array(CampaignStepSchema).min(1),
  createdBy: EntityIdSchema,
  publishedAt: IsoDateTimeSchema.optional(),
});
export type Campaign = z.infer<typeof CampaignSchema>;

export const CampaignEnrollmentSchema = z.object({
  id: EntityIdSchema.optional(),
  leadId: EntityIdSchema,
  campaignId: EntityIdSchema,
  status: CampaignEnrollmentStatusSchema.default("ACTIVE"),
  currentStepIndex: z.number().int().nonnegative().default(0),
  enrolledAt: z
    .date()
    .or(IsoDateTimeSchema)
    .default(() => new Date()),
  lastActivityAt: z.date().or(IsoDateTimeSchema).optional(),
  stoppedAt: IsoDateTimeSchema.optional(),
  stopReason: z.string().optional(),
  lastComplianceDecision: ComplianceDecisionSchema.optional(),
});
export type CampaignEnrollment = z.infer<typeof CampaignEnrollmentSchema>;

export function applyCampaignEnrollmentEvent(
  current: CampaignEnrollmentStatus,
  event: "START" | "PAUSE" | "RESUME" | "REPLY" | "STOP" | "COMPLETE" | "FAIL"
): CampaignEnrollmentStatus {
  if (current === "STOPPED" || current === "COMPLETED") {
    return current;
  }
  if (event === "STOP") return "STOPPED";
  if (event === "REPLY") return "REPLIED";
  if (event === "PAUSE") return "PAUSED";
  if (event === "RESUME" || event === "START") return "ACTIVE";
  if (event === "COMPLETE") return "COMPLETED";
  return "FAILED";
}

export const DripCampaignSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  steps: z.array(
    z.object({
      delay: z.string().min(1),
      channel: ChannelSchema,
      content: z.string().min(1),
    })
  ),
});
export type DripCampaign = z.infer<typeof DripCampaignSchema>;
