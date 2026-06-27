import { z } from "zod";
import {
  AuditMetadataSchema,
  ChannelSchema,
  EntityIdSchema,
  IsoDateTimeSchema,
} from "./common";

export const ConsentStatusSchema = z.enum([
  "UNKNOWN",
  "OPTED_IN",
  "OPTED_OUT",
  "DO_NOT_CONTACT",
]);
export type ConsentStatus = z.infer<typeof ConsentStatusSchema>;

export const ComplianceDecisionSchema = z.object({
  allowed: z.boolean(),
  reason: z.enum([
    "ALLOWED",
    "MISSING_CONSENT",
    "OPTED_OUT",
    "DO_NOT_CONTACT",
    "QUIET_HOURS",
    "MISSING_DESTINATION",
    "REQUIRES_APPROVAL",
    "PROVIDER_POLICY_BLOCK",
  ]),
  channel: ChannelSchema,
  decidedAt: IsoDateTimeSchema,
  policyVersion: z.string().min(1).default("v1"),
});
export type ComplianceDecision = z.infer<typeof ComplianceDecisionSchema>;

export const ComplianceEventSchema = z.object({
  id: EntityIdSchema.optional(),
  subjectId: EntityIdSchema,
  subjectType: z.enum(["LEAD", "CONTACT", "CAMPAIGN_ENROLLMENT", "MESSAGE"]),
  eventType: z.enum([
    "CONSENT_GRANTED",
    "CONSENT_REVOKED",
    "STOP_DETECTED",
    "UNSUBSCRIBE_DETECTED",
    "QUIET_HOURS_BLOCKED",
    "SEND_APPROVED",
    "SEND_BLOCKED",
  ]),
  channel: ChannelSchema.optional(),
  decision: ComplianceDecisionSchema.optional(),
  metadata: AuditMetadataSchema,
});
export type ComplianceEvent = z.infer<typeof ComplianceEventSchema>;

export const QuietHoursPolicySchema = z.object({
  timezone: z.string().min(1),
  startHour: z.number().int().min(0).max(23).default(20),
  endHour: z.number().int().min(0).max(23).default(8),
  allowTransactional: z.boolean().default(false),
});
export type QuietHoursPolicy = z.infer<typeof QuietHoursPolicySchema>;

export function isStopRequest(message: string): boolean {
  return /\b(STOP|REMOVE|CANCEL|DNC)\b/i.test(message);
}

export function isUnsubscribeRequest(message: string): boolean {
  return /\b(UNSUBSCRIBE|OPT\s*OUT|REMOVE\s+ME|EMAIL\s+STOP)\b/i.test(message);
}

/**
 * Detects any compliance-triggering keyword (either STOP or UNSUBSCRIBE class).
 * Use this when you need a single "should we halt outreach" check.
 */
export function isComplianceTrigger(message: string): boolean {
  return isStopRequest(message) || isUnsubscribeRequest(message);
}

/**
 * Checks if the current time is within quiet hours for a given policy.
 * Fixed to honor the policy timezone instead of server local time.
 */
export function isWithinQuietHours(
  date: Date,
  policy: QuietHoursPolicy
): boolean {
  // Use Intl.DateTimeFormat to get the hour in the policy's timezone
  const hourString = new Intl.DateTimeFormat("en-US", {
    timeZone: policy.timezone,
    hour: "numeric",
    hour12: false,
  }).format(date);

  const hour = parseInt(hourString, 10);

  if (policy.startHour === policy.endHour) {
    return true;
  }

  if (policy.startHour < policy.endHour) {
    return hour >= policy.startHour && hour < policy.endHour;
  }

  return hour >= policy.startHour || hour < policy.endHour;
}

export const ConsentStateSchema = z.object({
  leadId: EntityIdSchema,
  status: ConsentStatusSchema,
  timestamp: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});
export type ConsentState = z.infer<typeof ConsentStateSchema>;

export const DoNotContactStateSchema = z.object({
  leadId: EntityIdSchema,
  phone: z.string().optional(),
  email: z.string().optional(),
  active: z.boolean().default(true),
  reason: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
});
export type DoNotContactState = z.infer<typeof DoNotContactStateSchema>;
