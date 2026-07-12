import { ILeadAssigner } from "../application/use-cases/create-lead.use-case";
import { Lead } from "../domain/entities/lead.entity";
import { PrismaClient } from "@prisma/client";

export class RoundRobinLeadAssigner implements ILeadAssigner {
  constructor(private prisma: PrismaClient) {}

  async assign(lead: Lead): Promise<{ loanOfficerId: string; reason: string }> {
    // Get all loan officers
    const officers = await this.prisma.user.findMany({
      where: {
        role: { name: "loan_officer" },
      },
      orderBy: {
        leads: { _count: "asc" }, // Simple heuristic: assign to the one with fewest leads
      },
      take: 1,
    });

    if (officers.length === 0) {
      // Fallback to a default admin or queue
      return {
        loanOfficerId: "unassigned_queue",
        reason: "no_officers_available",
      };
    }

    return {
      loanOfficerId: officers[0].id,
      reason: "round_robin_load_balancing",
    };
  }
}
