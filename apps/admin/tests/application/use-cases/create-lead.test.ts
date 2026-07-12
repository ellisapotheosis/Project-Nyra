import {
  CreateLeadUseCase,
  CreateLeadDTO,
} from "../../../src/application/use-cases/create-lead.use-case";
import { LeadStatus } from "@prisma/client";

describe("CreateLeadUseCase", () => {
  let useCase: CreateLeadUseCase;
  let mockLeadRepo: any;
  let mockNotificationService: any;
  let mockLeadAssigner: any;

  beforeEach(() => {
    mockLeadRepo = {
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockNotificationService = {
      notifyLoanOfficer: jest.fn().mockResolvedValue(undefined),
    };
    mockLeadAssigner = {
      assign: jest
        .fn()
        .mockResolvedValue({
          loanOfficerId: "officer-123",
          reason: "round_robin",
        }),
    };
    useCase = new CreateLeadUseCase(
      mockLeadRepo,
      mockNotificationService,
      mockLeadAssigner
    );
  });

  it("should create a new lead from web form submission", async () => {
    // Arrange
    const leadData: CreateLeadDTO = {
      source: "website",
      borrower: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "5551234567",
      },
      loanRequest: {
        amount: 350000,
        propertyType: "single_family",
        zipCode: "90210",
      },
    };

    // Act
    const result = await useCase.execute(leadData);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.value.lead.status).toBe(LeadStatus.NEW);
    expect(mockLeadRepo.save).toHaveBeenCalled();
    expect(mockLeadAssigner.assign).toHaveBeenCalled();
    expect(mockNotificationService.notifyLoanOfficer).toHaveBeenCalledWith(
      "officer-123",
      expect.any(Object)
    );
  });

  it("should return failure for invalid lead data", async () => {
    const invalidData: any = {
      source: "website",
      borrower: {
        firstName: "", // Invalid: empty name
        lastName: "Doe",
        email: "invalid-email",
        phone: "555",
      },
    };

    const result = await useCase.execute(invalidData);

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain("validation");
    expect(mockLeadRepo.save).not.toHaveBeenCalled();
  });
});
