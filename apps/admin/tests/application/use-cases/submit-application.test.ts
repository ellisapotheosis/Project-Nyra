import { SubmitApplicationUseCase } from "../../../src/application/use-cases/submit-application.use-case";
import { DocumentRequirementsGenerator } from "../../../src/domain/services/document-requirements.generator";
import { ApplicationStatus } from "@prisma/client";

describe("SubmitApplicationUseCase", () => {
  let useCase: SubmitApplicationUseCase;
  let mockLeadRepo: any;
  let mockAppRepo: any;
  let mockAUSService: any;
  let docGenerator: DocumentRequirementsGenerator;

  beforeEach(() => {
    mockLeadRepo = { findById: jest.fn() };
    mockAppRepo = { save: jest.fn().mockResolvedValue(undefined) };
    mockAUSService = {
      run: jest
        .fn()
        .mockResolvedValue({ result: "Approve", recommendation: "Eligible" }),
    };
    docGenerator = new DocumentRequirementsGenerator();
    useCase = new SubmitApplicationUseCase(
      mockLeadRepo,
      mockAppRepo,
      mockAUSService,
      docGenerator
    );
  });

  it("should submit a valid application and generate requirements", async () => {
    const data = {
      leadId: "lead-123",
      loanType: "CONVENTIONAL",
      amount: 400000,
      term: 360,
      rate: 6.5,
      productId: "prod-123",
    };

    const result = await useCase.execute(data);

    expect(result.isSuccess).toBe(true);
    expect(result.value.application.status).toBe(ApplicationStatus.SUBMITTED);
    expect(mockAppRepo.save).toHaveBeenCalled();
    expect(mockAUSService.run).toHaveBeenCalled();
  });
});
