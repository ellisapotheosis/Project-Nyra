import { NextRequest, NextResponse } from "next/server";

const mockLeads = [
  {
    id: "lead-001",
    source: "website",
    status: "NEW",
    borrower: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@email.com",
      phone: "(555) 123-4567",
    },
    loanRequest: {
      amount: 450000,
      propertyType: "Single Family",
      zipCode: "94107",
    },
    assignedTo: {
      id: "loan-officer-1",
      name: "Ellis Andersen",
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "lead-002",
    source: "referral",
    status: "QUALIFIED",
    borrower: {
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@email.com",
      phone: "(555) 987-6543",
    },
    loanRequest: {
      amount: 325000,
      propertyType: "Condo",
      zipCode: "78701",
    },
    assignedTo: {
      id: "loan-officer-1",
      name: "Ellis Andersen",
    },
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(mockLeads);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  return NextResponse.json(
    {
      success: true,
      leadId: `lead-${Date.now()}`,
      status: "NEW",
      payload: body,
    },
    { status: 201 }
  );
}
