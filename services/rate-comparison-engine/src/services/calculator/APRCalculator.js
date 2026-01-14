/**
 * APR Calculator Service
 * Calculates Annual Percentage Rate including all loan costs
 */
class APRCalculator {
  /**
   * Calculate APR including all fees and costs
   * @param {number} loanAmount - Principal loan amount
   * @param {number} interestRate - Nominal interest rate (percentage)
   * @param {number} years - Loan term in years
   * @param {Object} fees - All loan fees
   * @returns {number} APR percentage
   */
  static calculateAPR(loanAmount, interestRate, years, fees = {}) {
    const totalFees = this.calculateTotalFees(fees);
    const netLoanAmount = loanAmount - totalFees;

    // Monthly payment based on full loan amount and interest rate
    const monthlyPayment = this.calculateMonthlyPayment(loanAmount, interestRate, years);

    // Calculate APR using iteration (Newton's method)
    let apr = interestRate;
    let iterations = 0;
    const maxIterations = 100;
    const tolerance = 0.0001;

    while (iterations < maxIterations) {
      const presentValue = this.calculatePresentValue(monthlyPayment, apr, years);
      const difference = presentValue - netLoanAmount;

      if (Math.abs(difference) < tolerance) {
        break;
      }

      // Adjust APR
      const derivative = this.calculateDerivative(monthlyPayment, apr, years);
      apr = apr - (difference / derivative);
      iterations++;
    }

    return Math.round(apr * 1000) / 1000;
  }

  /**
   * Calculate monthly payment
   * @param {number} principal - Loan amount
   * @param {number} annualRate - Annual interest rate
   * @param {number} years - Loan term
   * @returns {number} Monthly payment
   */
  static calculateMonthlyPayment(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;

    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }

    return principal *
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  /**
   * Calculate present value of payments
   * @param {number} payment - Monthly payment
   * @param {number} annualRate - Annual interest rate
   * @param {number} years - Loan term
   * @returns {number} Present value
   */
  static calculatePresentValue(payment, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;

    if (monthlyRate === 0) {
      return payment * numberOfPayments;
    }

    return payment *
      (1 - Math.pow(1 + monthlyRate, -numberOfPayments)) /
      monthlyRate;
  }

  /**
   * Calculate derivative for Newton's method
   * @param {number} payment - Monthly payment
   * @param {number} annualRate - Annual interest rate
   * @param {number} years - Loan term
   * @returns {number} Derivative
   */
  static calculateDerivative(payment, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    const delta = 0.0001;

    const pv1 = this.calculatePresentValue(payment, annualRate, years);
    const pv2 = this.calculatePresentValue(payment, annualRate + delta, years);

    return (pv2 - pv1) / delta;
  }

  /**
   * Calculate total fees from fee object
   * @param {Object} fees - Fee breakdown
   * @returns {number} Total fees
   */
  static calculateTotalFees(fees) {
    const {
      origination = 0,
      processing = 0,
      underwriting = 0,
      appraisal = 0,
      creditReport = 0,
      titleSearch = 0,
      titleInsurance = 0,
      recording = 0,
      transferTax = 0,
      other = 0
    } = fees;

    return origination + processing + underwriting + appraisal +
           creditReport + titleSearch + titleInsurance +
           recording + transferTax + other;
  }

  /**
   * Calculate APR with points
   * @param {number} loanAmount - Principal amount
   * @param {number} interestRate - Nominal interest rate
   * @param {number} years - Loan term
   * @param {number} points - Discount points (percentage)
   * @param {Object} fees - Additional fees
   * @returns {Object} APR calculation with breakdown
   */
  static calculateAPRWithPoints(loanAmount, interestRate, years, points, fees = {}) {
    const pointsCost = loanAmount * (points / 100);
    const totalFees = this.calculateTotalFees(fees);
    const allCosts = pointsCost + totalFees;

    const apr = this.calculateAPR(loanAmount, interestRate, years, {
      ...fees,
      other: (fees.other || 0) + pointsCost
    });

    return {
      interestRate,
      apr,
      points,
      pointsCost,
      otherFees: totalFees,
      totalCosts: allCosts,
      difference: apr - interestRate
    };
  }

  /**
   * Compare APRs between different loan offers
   * @param {Array} offers - Array of loan offers
   * @returns {Object} Comparison analysis
   */
  static compareOffers(offers) {
    const comparisons = offers.map((offer, index) => {
      const apr = this.calculateAPR(
        offer.loanAmount,
        offer.interestRate,
        offer.years,
        offer.fees
      );

      const monthlyPayment = this.calculateMonthlyPayment(
        offer.loanAmount,
        offer.interestRate,
        offer.years
      );

      const totalFees = this.calculateTotalFees(offer.fees);
      const totalCost = (monthlyPayment * offer.years * 12) + totalFees;

      return {
        offerIndex: index,
        lender: offer.lender,
        interestRate: offer.interestRate,
        apr,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalFees,
        totalCost: Math.round(totalCost * 100) / 100,
        points: offer.points || 0
      };
    });

    // Sort by APR (lowest first)
    comparisons.sort((a, b) => a.apr - b.apr);

    const bestOffer = comparisons[0];
    const savings = comparisons.map((offer, index) => {
      if (index === 0) return null;
      return {
        lender: offer.lender,
        monthlySavings: offer.monthlyPayment - bestOffer.monthlyPayment,
        totalSavings: offer.totalCost - bestOffer.totalCost
      };
    }).filter(s => s !== null);

    return {
      offers: comparisons,
      bestOffer,
      savings
    };
  }

  /**
   * Calculate effective APR for adjustable rate mortgages
   * @param {number} loanAmount - Principal amount
   * @param {number} initialRate - Initial interest rate
   * @param {number} initialPeriod - Initial fixed period in years
   * @param {Array} rateSchedule - Future rate schedule
   * @param {Object} fees - Loan fees
   * @returns {number} Effective APR
   */
  static calculateARMAR(loanAmount, initialRate, initialPeriod, rateSchedule, fees = {}) {
    // Simplified ARM APR calculation
    // Uses weighted average of rates over loan term
    const totalYears = rateSchedule.reduce((sum, period) => sum + period.years, initialPeriod);

    let weightedRate = (initialRate * initialPeriod);
    rateSchedule.forEach(period => {
      weightedRate += period.rate * period.years;
    });

    const averageRate = weightedRate / totalYears;

    return this.calculateAPR(loanAmount, averageRate, totalYears, fees);
  }

  /**
   * Calculate true cost of loan over specific period
   * @param {number} loanAmount - Principal amount
   * @param {number} interestRate - Interest rate
   * @param {number} years - Loan term
   * @param {number} holdingPeriod - Years you plan to keep the loan
   * @param {Object} fees - Loan fees
   * @returns {Object} True cost analysis
   */
  static calculateTrueCost(loanAmount, interestRate, years, holdingPeriod, fees = {}) {
    const monthlyPayment = this.calculateMonthlyPayment(loanAmount, interestRate, years);
    const totalFees = this.calculateTotalFees(fees);

    // Calculate remaining balance after holding period
    const monthlyRate = interestRate / 100 / 12;
    const paymentsInHoldingPeriod = holdingPeriod * 12;
    let balance = loanAmount;
    let totalInterestPaid = 0;

    for (let i = 0; i < paymentsInHoldingPeriod; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      totalInterestPaid += interestPayment;
      balance -= principalPayment;
    }

    const totalPaid = (monthlyPayment * paymentsInHoldingPeriod) + totalFees;
    const effectiveAPR = ((totalPaid - loanAmount + balance) / loanAmount) / holdingPeriod * 100;

    return {
      holdingPeriod,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      interestPaid: Math.round(totalInterestPaid * 100) / 100,
      feesPaid: totalFees,
      remainingBalance: Math.round(balance * 100) / 100,
      effectiveAPR: Math.round(effectiveAPR * 1000) / 1000,
      principalPaid: Math.round((loanAmount - balance) * 100) / 100
    };
  }
}

module.exports = APRCalculator;
