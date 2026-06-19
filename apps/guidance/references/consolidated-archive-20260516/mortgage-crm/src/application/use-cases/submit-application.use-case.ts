import { Result } from "@/domain/result";
import { LoanApplication } from "@/domain/entities/loan-application.entity";
import { DocumentRequirementsGenerator } from "@/domain/services/document-requirements.generator";

import { ILeadRepository } from "./create-lead.use-case";

export interface SubmitApplicationDTO {
  leadId: string;
  loanType: string;
  amount: number;
  term: number;
  rate: number;
  productId: string;
}

export interface IApplicationRepository {
  save(application: LoanApplication): Promise<void>;
}

export interface IAUSService {
  run(
    application: LoanApplication
  ): Promise<{ result: string; recommendation: string }>;
}

export class SubmitApplicationUseCase {
  constructor(
    leadRepo: ILeadRepository,
    private appRepo: IApplicationRepository,
    private ausService: IAUSService,
    private docGenerator: DocumentRequirementsGenerator
  ) {
    void leadRepo;
  }

  async execute(
    data: SubmitApplicationDTO
  ): Promise<Result<{ application: LoanApplication }>> {
    // 1. Verify lead exists and is in correct state (QUALIFIED or PRE_APPROVED)
    // For brevity, we assume lead lookup here.

    // 2. Create Application Entity
    const appOrError = LoanApplication.create({
      leadId: data.leadId,
      borrowerId: "borrower-123", // Fetched from lead
      loanType: data.loanType as any,
      amount: data.amount,
      term: data.term,
      rate: data.rate,
      productId: data.productId,
    });

    if (appOrError.isFailure) return Result.fail(appOrError.error!);
    const application = appOrError.value;

    // 3. Generate Document Requirements
    const requirements = this.docGenerator.generate(
      application.loanType,
      "EMPLOYED"
    );
    requirements.forEach((req) =>
      application.addCondition(`Required Document: ${req.type}`)
    );

    // 4. Submit Application
    application.submit();

    // 5. Run AUS (Mocked)
    const ausResult = await this.ausService.run(application);
    application.addCondition(`AUS Result: ${ausResult.recommendation}`);

    // 6. Save
    await this.appRepo.save(application);

    return Result.ok({ application });
  }
}
