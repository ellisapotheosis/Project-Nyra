import { Result } from "../domain/result";
import { LeadStatus } from "@prisma/client";
import { Lead } from "../domain/entities/lead.entity";

export interface CreateLeadDTO {
  source: string;
  borrower: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  loanRequest: {
    amount: number;
    propertyType: string;
    zipCode: string;
  };
}

export interface ILeadRepository {
  save(lead: Lead): Promise<void>;
}

export interface INotificationService {
  notifyLoanOfficer(officerId: string, data: any): Promise<void>;
}

export interface ILeadAssigner {
  assign(lead: Lead): Promise<{ loanOfficerId: string; reason: string }>;
}

export class CreateLeadUseCase {
  constructor(
    private leadRepo: ILeadRepository,
    private notificationService: INotificationService,
    private leadAssigner: ILeadAssigner
  ) {}

  async execute(data: CreateLeadDTO): Promise<Result<{ lead: Lead }>> {
    // Validate input
    const validationResult = this.validate(data);
    if (validationResult.isFailure) {
      return Result.fail(validationResult.error!);
    }

    // Create lead entity
    const leadOrError = Lead.create({
      source: data.source,
      borrower: data.borrower,
      loanRequest: data.loanRequest,
    });

    if (leadOrError.isFailure) {
      return Result.fail(leadOrError.error!);
    }

    const lead = leadOrError.value;

    // Assign to loan officer
    const assignment = await this.leadAssigner.assign(lead);
    lead.assignTo(assignment.loanOfficerId);

    // Save to repository
    await this.leadRepo.save(lead);

    // Send notification
    await this.notificationService.notifyLoanOfficer(assignment.loanOfficerId, {
      leadId: lead.id,
      borrowerName: lead.borrowerName,
      loanAmount: lead.loanRequest.amount,
    });

    return Result.ok({ lead });
  }

  private validate(data: CreateLeadDTO): Result<void> {
    const errors: string[] = [];
    if (!data.borrower?.firstName || data.borrower.firstName.trim() === "") {
      errors.push("First name is required");
    }
    if (!this.isValidEmail(data.borrower?.email)) {
      errors.push("Invalid email address");
    }
    if (!this.isValidPhone(data.borrower?.phone)) {
      errors.push("Invalid phone number");
    }
    if (errors.length > 0) {
      return Result.fail(`Validation errors: ${errors.join(", ")}`);
    }
    return Result.ok();
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return phone?.length >= 10;
  }
}
