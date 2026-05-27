import { Lead } from "../entities/lead.entity";

// Interface normally defined in use cases
export interface ILeadAssigner {
  assign(lead: Lead): Promise<{ loanOfficerId: string; reason: string }>;
}

export class RoundRobinLeadAssigner implements ILeadAssigner {
  constructor() {}

  async assign(lead: Lead): Promise<{ loanOfficerId: string; reason: string }> {
    void lead;

    // Mocking the assignment logic since Prisma is not integrated in projectnyra
    // In a real implementation, this would query the DB for available officers
    return {
      loanOfficerId: "mock_officer_id",
      reason: "round_robin_mock_balancing",
    };
  }
}
