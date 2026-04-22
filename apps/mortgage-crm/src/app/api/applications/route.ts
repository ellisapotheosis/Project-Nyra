import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { SubmitApplicationUseCase, IApplicationRepository, IAUSService } from "../../../../application/use-cases/submit-application.use-case";
import { DocumentRequirementsGenerator } from "../../../../domain/services/document-requirements.generator";
import { LoanApplication } from "../../../../domain/entities/loan-application.entity";
import { z } from "zod";

const prisma = new PrismaClient();

// Mocks for infrastructure layer dependencies
class PrismaApplicationRepo implements IApplicationRepository {
  async save(application: LoanApplication): Promise<void> {
    await prisma.loanApplication.create({
      data: {
        id: application.id,
        leadId: application.leadId,
        borrowerId: application["props"].borrowerId,
        loanType: application.loanType,
        amount: application.amount,
        term: application["props"].term,
        rate: application["props"].rate,
        productId: application["props"].productId,
        status: application.status,
        submittedAt: application["props"].submittedAt,
        conditions: {
          create: application["props"].conditions.map((c: any) => ({
            id: c.id,
            description: c.description,
            status: c.status
          }))
        },
        milestones: {
          create: application["props"].milestones.map((m: any) => ({
            name: m.name,
            status: m.status,
            createdAt: m.createdAt
          }))
        }
      }
    });
  }
}

class MockAUSService implements IAUSService {
  async run(application: LoanApplication): Promise<{ result: string; recommendation: string }> {
    return {
      result: "Approve",
      recommendation: "Eligible"
    };
  }
}

const submitApplicationSchema = z.object({
  leadId: z.string(),
  loanType: z.enum(["CONVENTIONAL", "FHA", "VA", "USDA", "JUMBO"]),
  amount: z.number().min(50000),
  term: z.number(),
  rate: z.number(),
  productId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = submitApplicationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    const data = validationResult.data;

    // Assemble dependencies
    const leadRepo = { findById: async () => ({}) }; // Mocking for brevity
    const appRepo = new PrismaApplicationRepo();
    const ausService = new MockAUSService();
    const docGenerator = new DocumentRequirementsGenerator();

    const useCase = new SubmitApplicationUseCase(
      leadRepo as any,
      appRepo,
      ausService,
      docGenerator
    );

    // Execute
    const result = await useCase.execute(data);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      applicationId: result.value.application.id,
      status: result.value.application.status
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error submitting application:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const applications = await prisma.loanApplication.findMany({
      include: {
        lead: true,
        borrower: true,
        conditions: true,
        milestones: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json(applications);
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
