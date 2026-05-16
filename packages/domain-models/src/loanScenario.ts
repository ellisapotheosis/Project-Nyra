import { z } from "zod";
import { AddressSchema, EntityIdSchema, MoneySchema } from "./common";

export const CreditScoreRangeSchema = z.enum([
  "300-579",
  "580-669",
  "670-739",
  "740-799",
  "800+",
  "UNKNOWN"
]);
export type CreditScoreRange = z.infer<typeof CreditScoreRangeSchema>;

export const LoanTimeframeSchema = z.enum([
  "IMMEDIATE",
  "1-3_MONTHS",
  "3-6_MONTHS",
  "EXPLORATORY",
  "UNKNOWN"
]);
export type LoanTimeframe = z.infer<typeof LoanTimeframeSchema>;

export const LoanPurposeSchema = z.enum([
  "PURCHASE",
  "REFI_RATE",
  "REFI_CASH",
  "HELOC",
]);
export const LoanTypeSchema = z.enum([
  "CONVENTIONAL",
  "FHA",
  "VA",
  "USDA",
  "JUMBO",
  "HELOC",
]);
export const OccupancySchema = z.enum(["PRIMARY", "SECOND_HOME", "INVESTMENT"]);
export const PropertyTypeSchema = z.enum([
  "SINGLE_FAMILY",
  "CONDO",
  "TOWNHOME",
  "MULTI_FAMILY",
  "MANUFACTURED",
]);

export const LoanScenarioSchema = z.object({
  id: EntityIdSchema.optional(),
  leadId: EntityIdSchema.optional(),
  borrowerId: EntityIdSchema.optional(),
  purpose: LoanPurposeSchema,
  loanType: LoanTypeSchema.optional(),
  loanAmount: MoneySchema,
  propertyValue: MoneySchema.optional(),
  downPayment: MoneySchema.optional(),
  ltv: z.number().min(0).max(100).optional(),
  creditScore: z.number().int().min(300).max(850).optional(),
  annualIncomeCents: z.number().int().nonnegative().optional(),
  dti: z.number().min(0).max(100).optional(),
  state: z.string().min(2).max(2),
  occupancy: OccupancySchema,
  propertyType: PropertyTypeSchema.optional(),
  propertyAddress: AddressSchema.optional(),
});
export type LoanScenario = z.infer<typeof LoanScenarioSchema>;

export const LoanOpportunitySchema = z.object({
  id: EntityIdSchema.optional(),
  leadId: EntityIdSchema,
  realtorId: EntityIdSchema.optional(),
  loanAmount: z.number().positive().optional(),
  estimatedValue: z.number().positive().optional(),
  loanType: z.enum(["PURCHASE", "REFINANCE", "HELOC"]).optional(),
  stage: z.string().default("PROSPECT"),
});
export type LoanOpportunity = z.infer<typeof LoanOpportunitySchema>;
