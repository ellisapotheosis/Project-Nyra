-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'LOAN_OFFICER', 'PROCESSOR', 'UNDERWRITER', 'USER');

-- CreateEnum
CREATE TYPE "BorrowerStatus" AS ENUM ('LEAD', 'QUALIFIED', 'PRE_APPROVED', 'APPROVED', 'CLOSED', 'LOST');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('CONVENTIONAL', 'FHA', 'VA', 'USDA', 'JUMBO', 'HELOC', 'REFINANCE');

-- CreateEnum
CREATE TYPE "LoanPurpose" AS ENUM ('PURCHASE', 'REFINANCE', 'CASH_OUT', 'DEBT_CONSOLIDATION', 'HOME_IMPROVEMENT');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('APPLICATION', 'PROCESSING', 'UNDERWRITING', 'CONDITIONAL_APPROVAL', 'CLEAR_TO_CLOSE', 'CLOSED', 'FUNDED', 'DENIED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PAYSTUB', 'W2', 'TAX_RETURN', 'BANK_STATEMENT', 'CREDIT_REPORT', 'APPRAISAL', 'TITLE', 'INSURANCE', 'PURCHASE_AGREEMENT', 'DRIVERS_LICENSE', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('LOGIN', 'LOGOUT', 'LOAN_CREATED', 'LOAN_UPDATED', 'LOAN_APPROVED', 'LOAN_DENIED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'EMAIL_SENT', 'CALL_MADE', 'NOTE_ADDED', 'STATUS_CHANGED');

-- CreateEnum
CREATE TYPE "MemorySystem" AS ENUM ('RUVECTOR', 'LETTA', 'GRAPHITI', 'MEM0', 'OPENMEMORY');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "passwordHash" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "borrowers" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "ssn" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "employer" TEXT,
    "occupation" TEXT,
    "monthlyIncome" DECIMAL(12,2),
    "yearsEmployed" INTEGER,
    "creditScore" INTEGER,
    "source" TEXT,
    "status" "BorrowerStatus" NOT NULL DEFAULT 'LEAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "borrowers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "loanNumber" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "loanOfficerId" TEXT NOT NULL,
    "loanType" "LoanType" NOT NULL,
    "loanPurpose" "LoanPurpose" NOT NULL,
    "loanAmount" DECIMAL(12,2) NOT NULL,
    "downPayment" DECIMAL(12,2),
    "interestRate" DECIMAL(5,3),
    "loanTerm" INTEGER,
    "propertyAddress" TEXT,
    "propertyCity" TEXT,
    "propertyState" TEXT,
    "propertyZip" TEXT,
    "propertyValue" DECIMAL(12,2),
    "status" "LoanStatus" NOT NULL DEFAULT 'APPLICATION',
    "stage" TEXT,
    "dti" DECIMAL(5,2),
    "ltv" DECIMAL(5,2),
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvalDate" TIMESTAMP(3),
    "closingDate" TIMESTAMP(3),
    "fundingDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "loanId" TEXT,
    "loanAmount" DECIMAL(12,2) NOT NULL,
    "downPayment" DECIMAL(12,2) NOT NULL,
    "creditScore" INTEGER NOT NULL,
    "loanType" "LoanType" NOT NULL,
    "loanTerm" INTEGER NOT NULL,
    "interestRate" DECIMAL(5,3) NOT NULL,
    "apr" DECIMAL(5,3) NOT NULL,
    "monthlyPayment" DECIMAL(10,2) NOT NULL,
    "closingCosts" DECIMAL(10,2),
    "points" DECIMAL(5,3),
    "lender" TEXT,
    "program" TEXT,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "category" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "extractedText" TEXT,
    "aiSummary" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "borrowerId" TEXT,
    "loanId" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "userId" TEXT,
    "borrowerId" TEXT,
    "loanId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_store" (
    "id" TEXT NOT NULL,
    "system" "MemorySystem" NOT NULL,
    "key" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "embedding" DECIMAL(65,30)[],
    "entityType" TEXT,
    "entityId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memory_store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_executions" (
    "id" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "agentId" TEXT,
    "task" TEXT NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'RUNNING',
    "result" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "tokensUsed" INTEGER,
    "loanId" TEXT,
    "borrowerId" TEXT,

    CONSTRAINT "agent_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "borrowers_email_key" ON "borrowers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "loans_loanNumber_key" ON "loans"("loanNumber");

-- CreateIndex
CREATE UNIQUE INDEX "memory_store_system_key_key" ON "memory_store"("system", "key");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borrowers" ADD CONSTRAINT "borrowers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "borrowers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_loanOfficerId_fkey" FOREIGN KEY ("loanOfficerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "borrowers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "borrowers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
