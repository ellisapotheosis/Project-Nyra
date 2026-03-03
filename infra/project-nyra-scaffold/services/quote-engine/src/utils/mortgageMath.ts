// ===== MORTGAGE MATHEMATICS CORE =====
// Implements industry-standard amortization formulas
// Used by OpenClaw to generate 3-option comparison quotes

export interface QuoteRequest {
  propertyValue: number;
  downPayment: number;
  baseInterestRate: number;
  termYears: number;
  annualTaxes?: number;
  annualInsurance?: number;
  monthlyHoa?: number;
  loanType?: 'conventional' | 'fha' | 'va' | 'usda';
}

export interface QuoteResult {
  principal: number;
  ltv: number;
  interestRate: number;
  monthlyPrincipalAndInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  estimatedPmi: number;
  totalMonthlyPayment: number;
  totalInterestOverLife: number;
  amortizationSchedule?: AmortizationLine[];
}

export interface AmortizationLine {
  month: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
}

// ===== CORE CALCULATION =====
export function calculateMortgage(
  data: QuoteRequest,
  rateAdjustment: number = 0
): QuoteResult {
  // Validate inputs
  if (data.propertyValue <= 0) throw new Error('Property value must be positive');
  if (data.downPayment < 0) throw new Error('Down payment cannot be negative');
  if (data.downPayment >= data.propertyValue) {
    throw new Error('Down payment cannot exceed property value');
  }
  if (data.baseInterestRate < 0 || data.baseInterestRate > 20) {
    throw new Error('Interest rate must be between 0 and 20%');
  }

  const principal = data.propertyValue - data.downPayment;
  const ltv = (principal / data.propertyValue) * 100;

  // Apply rate adjustment (e.g., -0.5% for buy-down)
  const finalRate = Math.max(0, data.baseInterestRate + rateAdjustment);

  const monthlyRate = finalRate / 100 / 12;
  const totalPayments = data.termYears * 12;

  // PMT Calculation (Standard Amortization Formula)
  let pmt = 0;
  if (monthlyRate > 0) {
    const mathPower = Math.pow(1 + monthlyRate, totalPayments);
    pmt = principal * ((monthlyRate * mathPower) / (mathPower - 1));
  } else {
    pmt = principal / totalPayments; // Edge case: 0% interest
  }

  // Additional Monthly Costs
  const monthlyTaxes = (data.annualTaxes || 0) / 12;
  const monthlyInsurance = (data.annualInsurance || 0) / 12;
  const monthlyHoa = data.monthlyHoa || 0;

  // PMI Estimation (varies by loan type)
  const estimatedPmi = calculatePMI(ltv, data.loanType, principal);

  const totalMonthlyPayment = pmt + monthlyTaxes + monthlyInsurance + monthlyHoa + estimatedPmi;
  const totalInterestOverLife = pmt * totalPayments - principal;

  return {
    principal: Number(principal.toFixed(2)),
    ltv: Number(ltv.toFixed(2)),
    interestRate: Number(finalRate.toFixed(3)),
    monthlyPrincipalAndInterest: Number(pmt.toFixed(2)),
    monthlyTaxes: Number(monthlyTaxes.toFixed(2)),
    monthlyInsurance: Number(monthlyInsurance.toFixed(2)),
    monthlyHoa: Number(monthlyHoa.toFixed(2)),
    estimatedPmi: Number(estimatedPmi.toFixed(2)),
    totalMonthlyPayment: Number(totalMonthlyPayment.toFixed(2)),
    totalInterestOverLife: Number(totalInterestOverLife.toFixed(2)),
  };
}

// ===== PMI CALCULATION BY LOAN TYPE =====
function calculatePMI(
  ltv: number,
  loanType: string = 'conventional',
  principal: number
): number {
  if (ltv <= 80) return 0; // No PMI with 20%+ down

  const pmiRates: Record<string, number> = {
    conventional: 0.0075, // 0.75% annually for LTV > 80%
    fha: 0.0085, // FHA mortgage insurance (higher)
    va: 0, // VA loans don't require PMI
    usda: 0, // USDA loans don't require PMI
  };

  const annualRate = pmiRates[loanType] || pmiRates.conventional;
  return (principal * annualRate) / 12;
}

// ===== AMORTIZATION SCHEDULE (Full 30-Year Breakdown) =====
export function generateAmortizationSchedule(
  data: QuoteRequest,
  rateAdjustment: number = 0
): AmortizationLine[] {
  const quote = calculateMortgage(data, rateAdjustment);
  const monthlyRate = (data.baseInterestRate + rateAdjustment) / 100 / 12;
  const totalPayments = data.termYears * 12;

  const schedule: AmortizationLine[] = [];
  let remainingBalance = quote.principal;

  for (let month = 1; month <= totalPayments; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = quote.monthlyPrincipalAndInterest - interestPayment;
    remainingBalance -= principalPayment;

    if (remainingBalance < 0) remainingBalance = 0;

    schedule.push({
      month,
      principalPayment: Number(principalPayment.toFixed(2)),
      interestPayment: Number(interestPayment.toFixed(2)),
      remainingBalance: Number(remainingBalance.toFixed(2)),
    });
  }

  return schedule;
}

// ===== 3-OPTION COMPARISON MATRIX =====
export function generate3OptionComparison(data: QuoteRequest) {
  return {
    standard: calculateMortgage(data, 0), // Par rate
    buyDown: calculateMortgage(data, -0.5), // -0.5% (requires points)
    lenderCredit: calculateMortgage(data, 0.5), // +0.5% (lender pays closing)
  };
}

// ===== AFFORDABILITY ANALYSIS =====
export function calculateAffordability(
  monthlyIncome: number,
  existingDebts: number,
  quote: QuoteResult
) {
  const totalMonthlyPayment = quote.totalMonthlyPayment;
  const totalDebts = existingDebts + totalMonthlyPayment;

  const frontEndRatio = (totalMonthlyPayment / monthlyIncome) * 100;
  const backEndRatio = (totalDebts / monthlyIncome) * 100;

  return {
    monthlyIncome,
    existingDebts,
    estimatedMonthlyPayment: totalMonthlyPayment,
    totalMonthlyDebts: totalDebts,
    frontEndRatio: Number(frontEndRatio.toFixed(2)),
    backEndRatio: Number(backEndRatio.toFixed(2)),
    canAfford: frontEndRatio <= 28 && backEndRatio <= 43, // Standard lending ratios
    reason:
      frontEndRatio > 28
        ? `Front-end ratio ${frontEndRatio}% exceeds 28% limit`
        : backEndRatio > 43
          ? `Back-end ratio ${backEndRatio}% exceeds 43% limit`
          : 'Meets lending standards',
  };
}
