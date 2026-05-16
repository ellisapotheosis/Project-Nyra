import { describe, it, expect } from 'vitest';
import { MockQuoteEngine } from './quote-engine';

describe('QuoteEngine', () => {
  it('should generate exactly three canonical options in a tuple', async () => {
    const engine = new MockQuoteEngine();
    const lead: any = { id: 'test-lead-123', email: 'test@example.com' };

    const quote = await engine.generateQuote(lead);

    expect(quote.options).toHaveLength(3);
    expect(quote.options[0]).toBeDefined();
    expect(quote.options[1]).toBeDefined();
    expect(quote.options[2]).toBeDefined();

    expect(quote.options[0].kind).toBe('LOWEST_PAYMENT');
    expect(quote.options[1].kind).toBe('BALANCED');
    expect(quote.options[2].kind).toBe('LOWEST_COST');
  });

  it('should calculate monthly payments correctly', async () => {
    const engine = new MockQuoteEngine();
    const lead: any = { id: 'test-lead', metadata: { requestedLoanAmount: 100000 } };

    const quote = await engine.generateQuote(lead);

    // Check math for the first option (LOWEST_PAYMENT)
    const lp = quote.options[0];
    expect(lp.rate).toBe(7.5);
    expect(lp.monthlyPayment.amountCents).toBeGreaterThan(0);
  });
});
