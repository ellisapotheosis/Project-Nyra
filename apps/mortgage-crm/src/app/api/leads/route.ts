import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { CreateLeadUseCase } from "../../../../application/use-cases/create-lead.use-case";
import { RoundRobinLeadAssigner } from "../../../../infrastructure/services/lead-assigner.service";
import { Lead } from "../../../../domain/entities/lead.entity";
import { z } from "zod";

const prisma = new PrismaClient();

// Simple mock implementations for the use case dependencies
class PrismaLeadRepo {
  async save(lead: Lead): Promise<void> {
    await prisma.lead.create({
      data: {
        id: lead.id,
        source: lead.loanRequest.amount > 0 ? "website" : "manual", // simplification
        status: lead.status,
        borrower: {
          create: {
            firstName: lead.borrowerName.split(" ")[0] || "",
            lastName: lead.borrowerName.split(" ")[1] || "",
            email: "placeholder@example.com",
            phone: "555-0000",
            ssn: "ENCRYPTED_PLACEHOLDER", // Real implementation would use EncryptionService
            dateOfBirth: new Date(),
            employmentStatus: "UNKNOWN"
          }
        },
        assignedToId: lead["props"]?.assignedToId,
      }
    });
  }
}

class MockNotificationService {
  async notifyLoanOfficer(officerId: string, data: any): Promise<void> {
    console.log(`Notification sent to ${officerId}`, data);
  }
}

const createLeadSchema = z.object({
  source: z.string(),
  borrower: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone must be at least 10 digits"),
  }),
  loanRequest: z.object({
    amount: z.number().min(50000, "Minimum loan amount is $50,000"),
    propertyType: z.string(),
    zipCode: z.string(),
  })
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = createLeadSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    const data = validationResult.data;

    // Assemble dependencies
    const leadRepo = new PrismaLeadRepo();
    const notificationService = new MockNotificationService();
    const leadAssigner = new RoundRobinLeadAssigner(prisma);

    const useCase = new CreateLeadUseCase(leadRepo, notificationService, leadAssigner);

    // Execute
    const result = await useCase.execute(data);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      leadId: result.value.lead.id,
      status: result.value.lead.status
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        borrower: true,
        loanRequest: true,
        assignedTo: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json(leads);
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
