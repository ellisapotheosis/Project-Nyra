export class DisclosureComplianceService {
  /**
   * TRID Rule: Loan Estimate must be delivered within 3 business days of application.
   */
  public isLoanEstimateTimely(
    applicationDate: Date,
    deliveryDate: Date
  ): boolean {
    const diffTime = Math.abs(
      deliveryDate.getTime() - applicationDate.getTime()
    );
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Simple implementation: actual logic should account for business days/holidays
    return diffDays <= 3;
  }

  /**
   * TRID Rule: Closing Disclosure must be received at least 3 business days before closing.
   */
  public isClosingDisclosureTimely(
    deliveryDate: Date,
    closingDate: Date
  ): boolean {
    const diffTime = Math.abs(closingDate.getTime() - deliveryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  }
}
