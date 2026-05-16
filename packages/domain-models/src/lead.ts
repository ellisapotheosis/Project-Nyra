import { z } from "zod";
import {
  EntityIdSchema,
  IsoDateTimeSchema,
  MoneySchema,
  PhoneSchema,
} from "./common";
import { ConsentStatusSchema } from "./compliance";
import { BorrowerSchema, CoBorrowerSchema } from "./contact";
import {
  LoanPurposeSchema,
  OccupancySchema,
  PropertyTypeSchema,
  CreditScoreRangeSchema,
  LoanTimeframeSchema,
} from "./loanScenario";

export const LeadStageSchema = z.enum([
  "NEW",
  "CONTACTED",
  "NURTURING",
  "APPLICATION_STARTED",
  "DOCS_NEEDED",
  "SUBMITTED",
  "APPROVED",
  "CLEAR_TO_CLOSE",
  "FUNDED",
  "LOST",
  "DO_NOT_CONTACT",
]);
export type LeadStage = z.infer<typeof LeadStageSchema>;

export const LeadSchema = z.object({
  id: EntityIdSchema.optional(),
  crmRecordId: EntityIdSchema.optional(),
  externalId: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: PhoneSchema.optional(),
  source: z.string().min(1),
  stage: LeadStageSchema.default("NEW"),
  ownerId: EntityIdSchema.optional(),
  leadScore: z.number().int().min(0).max(100).optional(),
  creditRange: CreditScoreRangeSchema.optional(),
  timeframe: LoanTimeframeSchema.optional(),
  loanPurpose: LoanPurposeSchema.optional(),
  loanAmount: MoneySchema.optional(),
  propertyValue: MoneySchema.optional(),
  propertyType: PropertyTypeSchema.optional(),
  occupancy: OccupancySchema.optional(),
  state: z.string().min(2).max(2).optional(),
  primaryBorrower: BorrowerSchema.optional(),
  coBorrowers: z.array(CoBorrowerSchema).default([]),
  consentStatus: ConsentStatusSchema.default("UNKNOWN"),
  consentSms: ConsentStatusSchema.default("UNKNOWN"),
  consentEmail: ConsentStatusSchema.default("UNKNOWN"),
  consentVoice: ConsentStatusSchema.default("UNKNOWN"),
  consentTimestamp: IsoDateTimeSchema.optional(),
  doNotContact: z.boolean().default(false),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date().or(IsoDateTimeSchema).optional(),
  updatedAt: z.date().or(IsoDateTimeSchema).optional(),
});
export type Lead = z.input<typeof LeadSchema>;
