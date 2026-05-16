import { Lead, Quote, MortgageScenario } from '@nyra/domain-models';
import { IQuoteEngine } from './index';

export class MockQuoteEngine implements IQuoteEngine {
  /**
   * Deterministic Mortgage Calculator
   * Note: This is a foundation mock. Future agents will wire this to real pricing APIs.
   */
  async generateQuote(lead: Lead): Promise<Quote> {
    console.log(`[MockQuote] Generating 3-option quote for ${lead.email}`);
    // AUDIT HOOK: Quote Generation
    console.log(`[AUDIT] QUOTE_GENERATED: For ${lead.email} by SYSTEM`);

    const loanAmount: number = (lead.metadata?.requestedLoanAmount as number) || 400000;

    // 1. Lowest Payment Option
    const lpS = this.calculateScenario(loanAmount, 7.5, 30, 'Low Cash-to-Close');

    // 2. Balanced Option
    const bS = this.calculateScenario(loanAmount, 6.875, 30, 'Nyra Recommended');

    // 3. Lowest Cost Option
    const lcS = this.calculateScenario(loanAmount, 6.25, 30, 'Long-term Savings');

    return {
      leadId: lead.id || 'mock-id',
      status: 'DRAFT',
      options: [
        {
          kind: 'LOWEST_PAYMENT',
          label: 'Lowest Payment',
          rate: 7.5,
          apr: 7.65,
          points: 0,
          monthlyPayment: { amountCents: Math.round(lpS.monthlyPayment * 100), currency: 'USD' },
          cashToClose: { amountCents: Math.round(lpS.closingCosts * 100), currency: 'USD' },
          closingCosts: { amountCents: Math.round(lpS.closingCosts * 100), currency: 'USD' },
          assumptions: ['740+ Credit', 'Primary Residence'],
          calculationTrace: { program: lpS.programName }
        },
        {
          kind: 'BALANCED',
          label: 'Balanced',
          rate: 6.875,
          apr: 7.025,
          points: 1,
          monthlyPayment: { amountCents: Math.round(bS.monthlyPayment * 100), currency: 'USD' },
          cashToClose: { amountCents: Math.round(bS.closingCosts * 100), currency: 'USD' },
          closingCosts: { amountCents: Math.round(bS.closingCosts * 100), currency: 'USD' },
          assumptions: ['Nyra Preferred'],
          calculationTrace: { program: bS.programName }
        },
        {
          kind: 'LOWEST_COST',
          label: 'Lowest Cost',
          rate: 6.25,
          apr: 6.4,
          points: 2.5,
          monthlyPayment: { amountCents: Math.round(lcS.monthlyPayment * 100), currency: 'USD' },
          cashToClose: { amountCents: Math.round(lcS.closingCosts * 100), currency: 'USD' },
          closingCosts: { amountCents: Math.round(lcS.closingCosts * 100), currency: 'USD' },
          assumptions: ['Buy-down Points'],
          calculationTrace: { program: lcS.programName }
        }
      ],
      createdAt: new Date().toISOString()
    };
  }

  private calculateScenario(principal: number, rate: number, years: number, label: string): MortgageScenario {
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = years * 12;

    const monthlyPayment = principal *
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return {
      loanAmount: principal,
      interestRate: rate,
      loanTermYears: years,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      closingCosts: principal * 0.02, // 2% placeholder
      apr: rate + 0.15, // Simple placeholder
      programName: `30-Year Fixed (${label})`
    };
  }
}
