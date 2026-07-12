import { Result } from "../result";
import { ApplicationStatus, LoanType } from "@prisma/client";

export interface LoanApplicationProps {
  leadId: string;
  borrowerId: string;
  loanType: LoanType;
  amount: number;
  term: number;
  rate: number;
  productId: string;
  status: ApplicationStatus;
  createdAt: Date;
  submittedAt?: Date;
  milestones: any[];
  conditions: any[];
  disclosures: any[];
}

export class LoanApplication {
  public readonly id: string;
  private props: LoanApplicationProps;

  private constructor(props: LoanApplicationProps, id?: string) {
    this.id = id || `app_${Math.random().toString(36).substr(2, 9)}`;
    this.props = props;
  }

  public static create(
    props: Omit<
      LoanApplicationProps,
      "status" | "createdAt" | "milestones" | "conditions" | "disclosures"
    >
  ): Result<LoanApplication> {
    if (props.amount <= 0) {
      return Result.fail("Loan amount must be greater than zero");
    }
    if (props.term <= 0) {
      return Result.fail("Loan term must be greater than zero");
    }

    return Result.ok(
      new LoanApplication({
        ...props,
        status: ApplicationStatus.DRAFT,
        createdAt: new Date(),
        milestones: [],
        conditions: [],
        disclosures: [],
      })
    );
  }

  public submit(): Result<void> {
    if (this.props.status !== ApplicationStatus.DRAFT) {
      return Result.fail("Only draft applications can be submitted");
    }
    this.props.status = ApplicationStatus.SUBMITTED;
    this.props.submittedAt = new Date();
    this.props.milestones.push({
      name: "Submitted",
      status: "COMPLETED",
      createdAt: new Date(),
    });
    return Result.ok();
  }

  public addCondition(description: string): void {
    this.props.conditions.push({
      id: `cond_${Math.random().toString(36).substr(2, 5)}`,
      description,
      status: "PENDING",
    });
  }

  // Getters
  get status(): ApplicationStatus {
    return this.props.status;
  }
  get amount(): number {
    return this.props.amount;
  }
  get loanType(): LoanType {
    return this.props.loanType;
  }
  get leadId(): string {
    return this.props.leadId;
  }
}
