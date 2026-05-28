import { Result } from "../result";

export enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  QUALIFIED = "QUALIFIED",
  PRE_APPROVED = "PRE_APPROVED",
  APPLICATION = "APPLICATION",
  PROCESSING = "PROCESSING",
  UNDERWRITING = "UNDERWRITING",
  APPROVED = "APPROVED",
  CLOSING = "CLOSING",
  FUNDED = "FUNDED",
  CLOSED = "CLOSED",
  LOST = "LOST",
}

export interface LeadProps {
  source: string;
  status: LeadStatus;
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
  assignedToId?: string;
  lastContactedAt?: Date;
  createdAt: Date;
  timeline: any[];
}

export class Lead {
  public readonly id: string;
  private props: LeadProps;

  private constructor(props: LeadProps, id?: string) {
    this.id = id || `lead_${Math.random().toString(36).substr(2, 9)}`;
    this.props = props;
  }

  public static create(
    props: Omit<LeadProps, "status" | "createdAt" | "timeline">
  ): Result<Lead> {
    if (!props.borrower?.firstName || props.borrower.firstName.trim() === "") {
      return Result.fail("Borrower first name is required");
    }
    if (!props.loanRequest?.amount || props.loanRequest.amount < 50000) {
      return Result.fail("Loan amount must be at least $50,000");
    }

    return Result.ok(
      new Lead({
        ...props,
        status: LeadStatus.NEW,
        createdAt: new Date(),
        timeline: [],
      })
    );
  }

  public assignTo(officerId: string): void {
    this.props.assignedToId = officerId;
    this.props.timeline.push({
      event: "assigned",
      officerId,
      timestamp: new Date(),
    });
  }

  public markAsContacted(notes: string): Result<void> {
    if (!this.canTransitionTo(LeadStatus.CONTACTED)) {
      return Result.fail("Cannot transition to CONTACTED from current state");
    }
    this.props.status = LeadStatus.CONTACTED;
    this.props.lastContactedAt = new Date();
    this.props.timeline.push({
      event: "contacted",
      notes,
      timestamp: new Date(),
    });
    return Result.ok();
  }

  public calculateScore(): number {
    let score = 0;
    if (this.props.loanRequest.amount > 400000) score += 10;
    else if (this.props.loanRequest.amount > 200000) score += 5;

    const sourceScores: Record<string, number> = {
      referral: 15,
      partner: 10,
      website: 5,
      cold_call: 2,
    };
    score += sourceScores[this.props.source] || 0;

    return score;
  }

  public isQualified(): boolean {
    return this.calculateScore() > 30;
  }

  public isOverdueForContact(): boolean {
    const elapsed = Date.now() - this.props.createdAt.getTime();
    const limit =
      this.props.source === "website" ? 15 * 60 * 1000 : 60 * 60 * 1000;
    return elapsed > limit && !this.props.lastContactedAt;
  }

  private canTransitionTo(newStatus: LeadStatus): boolean {
    const transitions: Record<LeadStatus, LeadStatus[]> = {
      [LeadStatus.NEW]: [LeadStatus.CONTACTED, LeadStatus.LOST],
      [LeadStatus.CONTACTED]: [LeadStatus.QUALIFIED, LeadStatus.LOST],
      [LeadStatus.QUALIFIED]: [
        LeadStatus.PRE_APPROVED,
        LeadStatus.APPLICATION,
        LeadStatus.LOST,
      ],
      [LeadStatus.PRE_APPROVED]: [LeadStatus.APPLICATION, LeadStatus.LOST],
      [LeadStatus.APPLICATION]: [LeadStatus.PROCESSING],
      [LeadStatus.PROCESSING]: [LeadStatus.UNDERWRITING, LeadStatus.LOST],
      [LeadStatus.UNDERWRITING]: [LeadStatus.APPROVED, LeadStatus.LOST],
      [LeadStatus.APPROVED]: [LeadStatus.CLOSING],
      [LeadStatus.CLOSING]: [LeadStatus.FUNDED, LeadStatus.LOST],
      [LeadStatus.FUNDED]: [LeadStatus.CLOSED],
      [LeadStatus.CLOSED]: [],
      [LeadStatus.LOST]: [],
    };
    return transitions[this.props.status]?.includes(newStatus) || false;
  }

  // Getters
  get status(): LeadStatus {
    return this.props.status;
  }
  get borrower(): LeadProps["borrower"] {
    return this.props.borrower;
  }
  get borrowerName(): string {
    return `${this.props.borrower.firstName} ${this.props.borrower.lastName}`;
  }
  get loanRequest(): { amount: number } {
    return this.props.loanRequest;
  }
}
