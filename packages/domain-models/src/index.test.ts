import { describe, it, expect } from "vitest";
import {
  HumanApprovalRequestSchema,
  LeadSchema,
  OrchestrationTaskSchema,
  QuoteSchema,
  RateQuoteResultSchema,
  VoiceJobSchema,
  WorkerNodeSchema,
  isStopRequest,
  isWithinQuietHours,
} from "./index";

describe("Domain Models", () => {
  it("should validate a correct lead", () => {
    const validLead = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      source: "TEST_SOURCE",
    };
    const result = LeadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
  });

  it("should fail on invalid email", () => {
    const invalidLead = {
      firstName: "Test",
      lastName: "User",
      email: "invalid-email",
      source: "TEST_SOURCE",
    };
    const result = LeadSchema.safeParse(invalidLead);
    expect(result.success).toBe(false);
  });

  it("should enforce default stage", () => {
    const lead = LeadSchema.parse({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      source: "TEST_SOURCE",
    });
    expect(lead.stage).toBe("NEW");
  });

  it("should model worker capabilities for the RTX3060 utility lane", () => {
    const worker = WorkerNodeSchema.parse({
      id: "worker-rtx3060",
      role: "RTX3060_LIGHTWEIGHT",
      hostname: "worker-rtx3060",
      status: "ONLINE",
      activeModels: ["nomic-embed-text", "llama3.2:3b"],
      capabilities: ["OLLAMA", "EMBEDDINGS", "EXTRACTION", "SUMMARIZATION"],
    });

    expect(worker.capabilities).toContain("EMBEDDINGS");
  });

  it("should make borrower-facing orchestration approval explicit", () => {
    const task = OrchestrationTaskSchema.parse({
      role: "BROKER_ASSISTANT",
      objective: "Draft borrower SMS",
      riskLevel: "BORROWER_COMMUNICATION",
      status: "WAITING_FOR_APPROVAL",
    });
    const approval = HumanApprovalRequestSchema.parse({
      riskLevel: task.riskLevel,
      summary: "Approve borrower SMS draft",
      proposedAction: { channel: "SMS" },
    });

    expect(approval.status).toBe("PENDING");
  });

  it("should distinguish unavailable real rate quoting from deterministic mocks", () => {
    const result = RateQuoteResultSchema.parse({
      status: "UNAVAILABLE",
      source: "MOCK",
      candidates: [],
      message: "Provider credentials missing",
    });

    expect(result.status).toBe("UNAVAILABLE");
    expect(result.source).toBe("MOCK");
  });

  it("should default generated quote approval to pending", () => {
    const quote = QuoteSchema.parse({
      leadId: "00000000-0000-4000-8000-000000000001",
      options: {
        lowestPayment: {
          label: "Lowest Payment Option",
          scenario: {
            loanAmount: 400000,
            interestRate: 6.5,
            loanTermYears: 30,
            monthlyPayment: 2528,
            closingCosts: 9000,
            apr: 6.75,
            programName: "Conventional 30 Year Fixed",
          },
        },
        balanced: {
          label: "Balanced / Recommended Structure",
          scenario: {
            loanAmount: 400000,
            interestRate: 6.375,
            loanTermYears: 30,
            monthlyPayment: 2496,
            closingCosts: 11000,
            apr: 6.68,
            programName: "Conventional 30 Year Fixed",
          },
        },
        lowestCost: {
          label: "Lowest Cost / Faster Break-Even Option",
          scenario: {
            loanAmount: 400000,
            interestRate: 6.875,
            loanTermYears: 30,
            monthlyPayment: 2627,
            closingCosts: 4500,
            apr: 7.02,
            programName: "Conventional 30 Year Fixed",
          },
        },
      },
    });

    expect(quote.approvalStatus).toBe("PENDING");
  });

  it("should model voice mesh jobs as approval-gated by default", () => {
    const job = VoiceJobSchema.parse({
      status: "TRANSCRIBING",
      sttWorkerId: "worker-rtx3060",
      ttsWorkerId: "worker-rtx3090ti",
      llmWorkerId: "worker-rtx5090",
    });

    expect(job.requiresHumanApproval).toBe(true);
  });

  it("should detect STOP and quiet hours", () => {
    expect(isStopRequest("please remove me")).toBe(true);
    expect(
      isWithinQuietHours(new Date("2026-05-24T05:00:00Z"), {
        timezone: "UTC",
        startHour: 20,
        endHour: 8,
        allowTransactional: false,
      })
    ).toBe(true);
  });
});
