/**
 * Calculate monthly mortgage payment using standard mortgage formula
 * P = L[c(1 + c)^n]/[(1 + c)^n - 1]
 *
 * @param principal - Loan amount (home price - down payment)
 * @param monthlyRate - Annual interest rate / 12
 * @param numberOfPayments - Loan term in months
 * @returns Monthly payment amount
 */
export function calculateMonthlyPayment(
  principal: number,
  monthlyRate: number,
  numberOfPayments: number
): number {
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }

  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return Math.round(payment);
}

/**
 * Calculate how much home you can afford based on income and debts
 * Uses the 28/36 rule:
 * - Front-end ratio: Housing costs should not exceed 28% of gross monthly income
 * - Back-end ratio: Total debt should not exceed 36% of gross monthly income
 *
 * @param annualIncome - Gross annual income
 * @param monthlyDebts - Monthly debt obligations
 * @param downPayment - Available down payment
 * @param monthlyRate - Monthly interest rate
 * @returns Maximum home price you can afford
 */
export function calculateAffordability(
  annualIncome: number,
  monthlyDebts: number,
  downPayment: number,
  monthlyRate: number
): number {
  const monthlyIncome = annualIncome / 12;

  // Front-end ratio: 28% of monthly income for housing
  const maxHousingPayment = monthlyIncome * 0.28;

  // Back-end ratio: 36% of monthly income for all debts
  const maxTotalDebt = monthlyIncome * 0.36;
  const maxMortgagePayment = maxTotalDebt - monthlyDebts;

  // Use the lower of the two
  const maxPayment = Math.min(maxHousingPayment, maxMortgagePayment);

  // Calculate maximum loan amount based on payment
  // Assuming 30-year term (360 months)
  const numberOfPayments = 360;

  let maxLoanAmount: number;
  if (monthlyRate === 0) {
    maxLoanAmount = maxPayment * numberOfPayments;
  } else {
    maxLoanAmount =
      (maxPayment * (Math.pow(1 + monthlyRate, numberOfPayments) - 1)) /
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
  }

  // Add down payment to get total home price
  const maxHomePrice = maxLoanAmount + downPayment;

  return Math.round(maxHomePrice);
}

/**
 * Calculate total interest paid over the life of the loan
 */
export function calculateTotalInterest(
  principal: number,
  monthlyRate: number,
  numberOfPayments: number
): number {
  const monthlyPayment = calculateMonthlyPayment(
    principal,
    monthlyRate,
    numberOfPayments
  );
  const totalPaid = monthlyPayment * numberOfPayments;
  return Math.round(totalPaid - principal);
}

/**
 * Generate an amortization schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  monthlyRate: number,
  numberOfPayments: number
): Array<{
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}> {
  const monthlyPayment = calculateMonthlyPayment(
    principal,
    monthlyRate,
    numberOfPayments
  );
  const schedule = [];
  let balance = principal;

  for (let month = 1; month <= numberOfPayments; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;

    schedule.push({
      month,
      payment: Math.round(monthlyPayment),
      principal: Math.round(principalPayment),
      interest: Math.round(interestPayment),
      balance: Math.round(Math.max(0, balance)),
    });
  }

  return schedule;
}
