import { DisclosureComplianceService } from "../../../src/domain/services/disclosure-compliance.service";

describe("DisclosureComplianceService", () => {
  let service: DisclosureComplianceService;

  beforeEach(() => {
    service = new DisclosureComplianceService();
  });

  it("should validate that LE is timely within 3 days", () => {
    const appDate = new Date("2026-04-20");
    const deliveryDate = new Date("2026-04-22");
    expect(service.isLoanEstimateTimely(appDate, deliveryDate)).toBe(true);
  });

  it("should fail LE validation if after 3 days", () => {
    const appDate = new Date("2026-04-20");
    const deliveryDate = new Date("2026-04-25");
    expect(service.isLoanEstimateTimely(appDate, deliveryDate)).toBe(false);
  });

  it("should validate that CD is timely 3 days before closing", () => {
    const deliveryDate = new Date("2026-05-01");
    const closingDate = new Date("2026-05-05");
    expect(service.isClosingDisclosureTimely(deliveryDate, closingDate)).toBe(
      true
    );
  });
});
