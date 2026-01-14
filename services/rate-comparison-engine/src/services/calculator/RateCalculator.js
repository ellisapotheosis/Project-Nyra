/**
 * Rate Calculator Service
 * Provides comprehensive mortgage rate calculations
 */
class RateCalculator {
  /**
   * Calculate monthly mortgage payment
   * @param {number} principal - Loan amount
   * @param {number} annualRate - Annual interest rate (percentage)
   * @param {number} years - Loan term in years
   * @returns {number} Monthly payment
   */
  static calculateMonthlyPayment(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;

    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }

    const payment = principal *
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return Math.round(payment * 100) / 100;
  }

  /**
   * Calculate total interest paid over loan term
   * @param {number} principal - Loan amount
   * @param {number} annualRate - Annual interest rate (percentage)
   * @param {number} years - Loan term in years
   * @returns {number} Total interest
   */
  static calculateTotalInterest(principal, annualRate, years) {
    const monthlyPayment = this.calculateMonthlyPayment(principal, annualRate, years);
    const totalPaid = monthlyPayment * years * 12;
    return Math.round((totalPaid - principal) * 100) / 100;
  }

  /**
   * Calculate loan-to-value ratio
   * @param {number} loanAmount - Loan amount
   * @param {number} homeValue - Property value
   * @returns {number} LTV percentage
   */
  static calculateLTV(loanAmount, homeValue) {
    return Math.round((loanAmount / homeValue) * 10000) / 100;
  }

  /**
   * Calculate down payment percentage
   * @param {number} downPayment - Down payment amount
   * @param {number} homeValue - Property value
   * @returns {number} Down payment percentage
   */
  static calculateDownPaymentPercentage(downPayment, homeValue) {
    return Math.round((downPayment / homeValue) * 10000) / 100;
  }

  /**
   * Calculate required income for mortgage
   * @param {number} monthlyPayment - Monthly mortgage payment
   * @param {number} debtToIncomeRatio - Maximum DTI ratio (default 43%)
   * @returns {Object} Required income breakdown
   */
  static calculateRequiredIncome(monthlyPayment, debtToIncomeRatio = 0.43) {
    const monthlyIncome = Math.ceil(monthlyPayment / debtToIncomeRatio);
    const annualIncome = monthlyIncome * 12;

    return {
      monthlyIncome,
      annualIncome,
      debtToIncomeRatio,
      maxMonthlyDebt: monthlyIncome * debtToIncomeRatio
    };
  }

  /**
   * Calculate break-even point for refinancing
   * @param {number} closingCosts - Refinance closing costs
   * @param {number} monthlySavings - Monthly payment savings
   * @returns {Object} Break-even analysis
   */
  static calculateBreakEven(closingCosts, monthlySavings) {
    if (monthlySavings <= 0) {
      return {
        breakEvenMonths: null,
        breakEvenYears: null,
        worthIt: false
      };
    }

    const breakEvenMonths = Math.ceil(closingCosts / monthlySavings);
    const breakEvenYears = Math.round((breakEvenMonths / 12) * 10) / 10;

    return {
      breakEvenMonths,
      breakEvenYears,
      worthIt: breakEvenMonths <= 36, // Typically worth it if break-even is under 3 years
      monthlySavings,
      closingCosts
    };
  }

  /**
   * Calculate total cost comparison between rates
   * @param {number} loanAmount - Loan amount
   * @param {number} rate1 - First interest rate
   * @param {number} rate2 - Second interest rate
   * @param {number} years - Loan term
   * @returns {Object} Cost comparison
   */
  static compareRates(loanAmount, rate1, rate2, years) {
    const payment1 = this.calculateMonthlyPayment(loanAmount, rate1, years);
    const payment2 = this.calculateMonthlyPayment(loanAmount, rate2, years);

    const totalInterest1 = this.calculateTotalInterest(loanAmount, rate1, years);
    const totalInterest2 = this.calculateTotalInterest(loanAmount, rate2, years);

    const monthlySavings = payment1 - payment2;
    const totalSavings = totalInterest1 - totalInterest2;

    return {
      rate1: {
        rate: rate1,
        monthlyPayment: payment1,
        totalInterest: totalInterest1,
        totalCost: loanAmount + totalInterest1
      },
      rate2: {
        rate: rate2,
        monthlyPayment: payment2,
        totalInterest: totalInterest2,
        totalCost: loanAmount + totalInterest2
      },
      comparison: {
        monthlySavings,
        totalSavings,
        percentageDifference: Math.round((monthlySavings / payment1) * 10000) / 100
      }
    };
  }

  /**
   * Calculate amortization for a specific payment
   * @param {number} balance - Current loan balance
   * @param {number} monthlyRate - Monthly interest rate (decimal)
   * @param {number} monthlyPayment - Monthly payment amount
   * @returns {Object} Payment breakdown
   */
  static calculatePaymentBreakdown(balance, monthlyRate, monthlyPayment) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    const remainingBalance = balance - principalPayment;

    return {
      interestPayment: Math.round(interestPayment * 100) / 100,
      principalPayment: Math.round(principalPayment * 100) / 100,
      remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100)
    };
  }

  /**
   * Calculate extra payment impact
   * @param {number} principal - Loan amount
   * @param {number} annualRate - Annual interest rate
   * @param {number} years - Original loan term
   * @param {number} extraMonthlyPayment - Extra payment amount
   * @returns {Object} Impact analysis
   */
  static calculateExtraPaymentImpact(principal, annualRate, years, extraMonthlyPayment) {
    const standardPayment = this.calculateMonthlyPayment(principal, annualRate, years);
    const standardInterest = this.calculateTotalInterest(principal, annualRate, years);

    // Calculate with extra payment
    const monthlyRate = annualRate / 100 / 12;
    let balance = principal;
    let monthsPaid = 0;
    let totalInterestPaid = 0;
    const totalPayment = standardPayment + extraMonthlyPayment;

    while (balance > 0 && monthsPaid < years * 12) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(totalPayment - interestPayment, balance);

      totalInterestPaid += interestPayment;
      balance -= principalPayment;
      monthsPaid++;
    }

    const yearsSaved = Math.round(((years * 12 - monthsPaid) / 12) * 10) / 10;
    const interestSaved = Math.round((standardInterest - totalInterestPaid) * 100) / 100;

    return {
      originalTerm: years * 12,
      newTerm: monthsPaid,
      monthsSaved: years * 12 - monthsPaid,
      yearsSaved,
      interestSaved,
      originalInterest: standardInterest,
      newInterest: Math.round(totalInterestPaid * 100) / 100
    };
  }

  /**
   * Calculate optimal loan amount based on income
   * @param {number} annualIncome - Annual gross income
   * @param {number} annualRate - Interest rate
   * @param {number} years - Loan term
   * @param {number} dtiRatio - Debt-to-income ratio (default 0.43)
   * @returns {Object} Loan affordability
   */
  static calculateAffordability(annualIncome, annualRate, years, dtiRatio = 0.43) {
    const monthlyIncome = annualIncome / 12;
    const maxMonthlyPayment = monthlyIncome * dtiRatio;

    // Calculate maximum loan amount
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;

    const maxLoanAmount = maxMonthlyPayment *
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));

    return {
      annualIncome,
      monthlyIncome,
      maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
      maxLoanAmount: Math.round(maxLoanAmount * 100) / 100,
      dtiRatio,
      interestRate: annualRate,
      loanTerm: years
    };
  }
}

module.exports = RateCalculator;
