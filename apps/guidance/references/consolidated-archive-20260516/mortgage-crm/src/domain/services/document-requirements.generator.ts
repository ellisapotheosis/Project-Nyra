import { LoanType } from "@prisma/client";

export interface DocumentRequirement {
  type: string;
  description: string;
  isMandatory: boolean;
}

export class DocumentRequirementsGenerator {
  public generate(loanType: LoanType, employmentStatus: string): DocumentRequirement[] {
    const requirements: DocumentRequirement[] = [
      { type: "ID", description: "Government issued photo ID", isMandatory: true },
      { type: "BANK_STATEMENTS", description: "Last 2 months of bank statements", isMandatory: true },
    ];

    if (employmentStatus === "EMPLOYED") {
      requirements.push(
        { type: "PAYSTUBS", description: "Last 30 days of paystubs", isMandatory: true },
        { type: "W2", description: "Last 2 years of W-2s", isMandatory: true }
      );
    } else {
      requirements.push(
        { type: "TAX_RETURNS", description: "Last 2 years of personal and business tax returns", isMandatory: true }
      );
    }

    if (loanType === "VA") {
      requirements.push(
        { type: "COE", description: "Certificate of Eligibility", isMandatory: true }
      );
    }

    return requirements;
  }
}
