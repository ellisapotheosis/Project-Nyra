import { z } from "zod";

export const leadFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[\d\s()-]{10,}$/, "Invalid phone number"),
  loanAmount: z
    .number()
    .min(50000, "Minimum loan amount is $50,000")
    .max(10000000),
  propertyValue: z
    .number()
    .min(50000, "Minimum property value is $50,000")
    .max(10000000),
  creditScore: z.enum(["excellent", "good", "fair", "poor"]),
  propertyType: z.enum(["primary", "investment", "vacation"]),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;

export interface MortgageRate {
  lender: string;
  rate: number;
  apr: number;
  monthlyPayment: number;
  closingCosts: number;
  type: "30-year-fixed" | "15-year-fixed" | "5/1-arm" | "7/1-arm";
}

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;

  if (monthlyRate === 0) return principal / numPayments;

  const monthlyPayment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  return Math.round(monthlyPayment * 100) / 100;
}

export function getMockRates(
  loanAmount: number,
  creditScore: string
): MortgageRate[] {
  const baseRates = {
    excellent: 6.5,
    good: 7.0,
    fair: 7.5,
    poor: 8.5,
  };

  const baseRate = baseRates[creditScore as keyof typeof baseRates] || 7.5;

  return [
    {
      lender: "Indicative Option A",
      rate: baseRate,
      apr: baseRate + 0.2,
      monthlyPayment: calculateMonthlyPayment(loanAmount, baseRate, 30),
      closingCosts: 3500,
      type: "30-year-fixed",
    },
    {
      lender: "Indicative Option B",
      rate: baseRate + 0.125,
      apr: baseRate + 0.325,
      monthlyPayment: calculateMonthlyPayment(loanAmount, baseRate + 0.125, 30),
      closingCosts: 3200,
      type: "30-year-fixed",
    },
    {
      lender: "Indicative Option C",
      rate: baseRate - 0.125,
      apr: baseRate + 0.075,
      monthlyPayment: calculateMonthlyPayment(loanAmount, baseRate - 0.125, 30),
      closingCosts: 3800,
      type: "30-year-fixed",
    },
    {
      lender: "Indicative Option D",
      rate: baseRate + 0.25,
      apr: baseRate + 0.45,
      monthlyPayment: calculateMonthlyPayment(loanAmount, baseRate + 0.25, 30),
      closingCosts: 2900,
      type: "30-year-fixed",
    },
  ];
}
