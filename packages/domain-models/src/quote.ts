import { z } from "zod";
import { EntityIdSchema, IsoDateTimeSchema, MoneySchema } from "./common";
import { LoanScenarioSchema } from "./loanScenario";

export const PricingScenarioKindSchema = z.enum([
  "LOWEST_PAYMENT",
  "BALANCED",
  "LOWEST_COST",
]);

export const PricingScenarioSchema = z.object({
  id: EntityIdSchema.optional(),
  kind: PricingScenarioKindSchema,
  label: z.string().min(1),
  rate: z.number().nonnegative(),
  apr: z.number().nonnegative(),
  points: z.number().default(0),
  monthlyPayment: MoneySchema,
  cashToClose: MoneySchema,
  closingCosts: MoneySchema,
  breakEvenMonths: z.number().nonnegative().optional(),
  assumptions: z.array(z.string()).default([]),
  calculationTrace: z.record(z.string(), z.unknown()).default({}),
});
export type PricingScenario = z.infer<typeof PricingScenarioSchema>;

export const QuoteRequestSchema = z.object({
  id: EntityIdSchema.optional(),
  leadId: EntityIdSchema,
  loanScenario: LoanScenarioSchema,
  requestedBy: EntityIdSchema,
  requestedAt: IsoDateTimeSchema,
});
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

export const QuoteSchema = z.object({
  id: EntityIdSchema.optional(),
  leadId: EntityIdSchema,
  loanScenarioId: EntityIdSchema.optional(),
  status: z
    .enum(["DRAFT", "READY", "APPROVED", "SENT", "EXPIRED"])
    .default("DRAFT"),
  options: z.tuple([
    PricingScenarioSchema,
    PricingScenarioSchema,
    PricingScenarioSchema,
  ]),
  selectedOptionId: EntityIdSchema.optional(),
  expiresAt: IsoDateTimeSchema.optional(),
  createdAt: IsoDateTimeSchema.optional(),
});
export type Quote = z.infer<typeof QuoteSchema>;

export const MortgageScenarioSchema = z.object({
  loanAmount: z.number().positive(),
  interestRate: z.number().positive(),
  loanTermYears: z.number().int().positive(),
  monthlyPayment: z.number().positive(),
  closingCosts: z.number().nonnegative(),
  apr: z.number().positive(),
  programName: z.string().min(1),
});
export type MortgageScenario = z.infer<typeof MortgageScenarioSchema>;

export const QuoteOptionSchema = z.object({
  label: z.string().min(1),
  scenario: MortgageScenarioSchema,
  recommendation: z.string().optional(),
});
export type QuoteOption = z.infer<typeof QuoteOptionSchema>;
