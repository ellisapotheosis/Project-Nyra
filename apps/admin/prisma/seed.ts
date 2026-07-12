import {
  PrismaClient,
  LeadStatus,
  ApplicationStatus,
  LoanType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      permissions: ["*"],
    },
  });

  const officerRole = await prisma.role.upsert({
    where: { name: "loan_officer" },
    update: {},
    create: {
      name: "loan_officer",
      permissions: [
        "leads:read",
        "leads:write",
        "applications:read",
        "applications:write",
      ],
    },
  });

  // Users
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@nyra.com" },
    update: {},
    create: {
      email: "admin@nyra.com",
      name: "Admin User",
      roleId: adminRole.id,
    },
  });

  const officerUser = await prisma.user.upsert({
    where: { email: "officer@nyra.com" },
    update: {},
    create: {
      email: "officer@nyra.com",
      name: "Loan Officer 1",
      roleId: officerRole.id,
    },
  });

  // Loan Product
  const conventionalProduct = await prisma.loanProduct.upsert({
    where: { id: "conv-30-fixed" },
    update: {},
    create: {
      id: "conv-30-fixed",
      name: "30-Year Fixed Conventional",
      type: LoanType.CONVENTIONAL,
      description: "Standard conventional mortgage with 30-year fixed rate.",
    },
  });

  // Borrower
  const borrower = await prisma.borrower.create({
    data: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "555-0101",
      ssn: "ENCRYPTED_SSN", // Placeholder for encrypted value
      dateOfBirth: new Date("1985-05-15"),
      employmentStatus: "EMPLOYED",
      employer: "Tech Corp",
      jobTitle: "Software Engineer",
      yearsEmployed: 5,
      annualIncome: 120000,
    },
  });

  // Lead
  const lead = await prisma.lead.create({
    data: {
      source: "website",
      status: LeadStatus.NEW,
      borrowerId: borrower.id,
      assignedToId: officerUser.id,
      loanRequest: {
        create: {
          amount: 450000,
          propertyType: "SINGLE_FAMILY",
          zipCode: "90210",
        },
      },
    },
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
