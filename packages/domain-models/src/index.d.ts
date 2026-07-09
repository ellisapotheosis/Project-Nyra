import { z } from "zod";
export declare const LeadStageSchema: z.ZodEnum<{
  NEW: "NEW";
  CONTACTED: "CONTACTED";
  NURTURING: "NURTURING";
  APPLICATION_STARTED: "APPLICATION_STARTED";
  DOCS_NEEDED: "DOCS_NEEDED";
  SUBMITTED: "SUBMITTED";
  APPROVED: "APPROVED";
  CLEAR_TO_CLOSE: "CLEAR_TO_CLOSE";
  FUNDED: "FUNDED";
  LOST: "LOST";
  DO_NOT_CONTACT: "DO_NOT_CONTACT";
}>;
export type LeadStage = z.infer<typeof LeadStageSchema>;
export declare const ChannelSchema: z.ZodEnum<{
  SMS: "SMS";
  EMAIL: "EMAIL";
  CALL: "CALL";
  VOICEMAIL: "VOICEMAIL";
  GMAIL: "GMAIL";
  INTERNAL_NOTE: "INTERNAL_NOTE";
  WEBHOOK: "WEBHOOK";
}>;
export type Channel = z.infer<typeof ChannelSchema>;
export declare const ConsentStatusSchema: z.ZodEnum<{
  DO_NOT_CONTACT: "DO_NOT_CONTACT";
  UNKNOWN: "UNKNOWN";
  OPTED_IN: "OPTED_IN";
  OPTED_OUT: "OPTED_OUT";
}>;
export type ConsentStatus = z.infer<typeof ConsentStatusSchema>;
export declare const AgentActionRiskSchema: z.ZodEnum<{
  READ_ONLY: "READ_ONLY";
  INTERNAL_MUTATION: "INTERNAL_MUTATION";
  CRM_MUTATION: "CRM_MUTATION";
  BORROWER_COMMUNICATION: "BORROWER_COMMUNICATION";
  COMPLIANCE_CRITICAL: "COMPLIANCE_CRITICAL";
}>;
export type AgentActionRisk = z.infer<typeof AgentActionRiskSchema>;
export declare const CampaignStatusSchema: z.ZodEnum<{
  DRAFT: "DRAFT";
  ACTIVE: "ACTIVE";
  PAUSED: "PAUSED";
  COMPLETED: "COMPLETED";
  FAILED: "FAILED";
  STOPPED: "STOPPED";
}>;
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;
export declare const WorkerRoleSchema: z.ZodEnum<{
  ORCHESTRATOR: "ORCHESTRATOR";
  RTX5090_BURST: "RTX5090_BURST";
  RTX3090TI_STEADY: "RTX3090TI_STEADY";
  RTX3060_LIGHTWEIGHT: "RTX3060_LIGHTWEIGHT";
  ORACLE_VPS: "ORACLE_VPS";
  HOME_ASSISTANT: "HOME_ASSISTANT";
}>;
export type WorkerRole = z.infer<typeof WorkerRoleSchema>;
export declare const LeadSchema: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    externalId: z.ZodOptional<z.ZodString>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    source: z.ZodString;
    stage: z.ZodDefault<
      z.ZodEnum<{
        NEW: "NEW";
        CONTACTED: "CONTACTED";
        NURTURING: "NURTURING";
        APPLICATION_STARTED: "APPLICATION_STARTED";
        DOCS_NEEDED: "DOCS_NEEDED";
        SUBMITTED: "SUBMITTED";
        APPROVED: "APPROVED";
        CLEAR_TO_CLOSE: "CLEAR_TO_CLOSE";
        FUNDED: "FUNDED";
        LOST: "LOST";
        DO_NOT_CONTACT: "DO_NOT_CONTACT";
      }>
    >;
    consentStatus: z.ZodDefault<
      z.ZodEnum<{
        DO_NOT_CONTACT: "DO_NOT_CONTACT";
        UNKNOWN: "UNKNOWN";
        OPTED_IN: "OPTED_IN";
        OPTED_OUT: "OPTED_OUT";
      }>
    >;
    doNotContact: z.ZodDefault<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
  },
  z.core.$strip
>;
export type Lead = z.infer<typeof LeadSchema>;
export declare const BorrowerSchema: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    leadId: z.ZodOptional<z.ZodString>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    ssnLastFour: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodDate>;
    address: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type Borrower = z.infer<typeof BorrowerSchema>;
export declare const RealtorPartnerSchema: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    company: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type RealtorPartner = z.infer<typeof RealtorPartnerSchema>;
export declare const LoanOpportunitySchema: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    leadId: z.ZodString;
    realtorId: z.ZodOptional<z.ZodString>;
    loanAmount: z.ZodOptional<z.ZodNumber>;
    estimatedValue: z.ZodOptional<z.ZodNumber>;
    loanType: z.ZodOptional<
      z.ZodEnum<{
        PURCHASE: "PURCHASE";
        REFINANCE: "REFINANCE";
        HELOC: "HELOC";
      }>
    >;
    stage: z.ZodDefault<z.ZodString>;
  },
  z.core.$strip
>;
export type LoanOpportunity = z.infer<typeof LoanOpportunitySchema>;
export declare const MortgageScenarioSchema: z.ZodObject<
  {
    loanAmount: z.ZodNumber;
    interestRate: z.ZodNumber;
    loanTermYears: z.ZodNumber;
    monthlyPayment: z.ZodNumber;
    closingCosts: z.ZodNumber;
    apr: z.ZodNumber;
    programName: z.ZodString;
  },
  z.core.$strip
>;
export type MortgageScenario = z.infer<typeof MortgageScenarioSchema>;
export declare const QuoteRequestSchema: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    leadId: z.ZodString;
    scenarioType: z.ZodEnum<{
      LOWEST_PAYMENT: "LOWEST_PAYMENT";
      BALANCED: "BALANCED";
      LOWEST_COST: "LOWEST_COST";
    }>;
    requestedBy: z.ZodString;
    timestamp: z.ZodDefault<z.ZodDate>;
  },
  z.core.$strip
>;
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
export declare const QuoteOptionSchema: z.ZodObject<
  {
    label: z.ZodString;
    scenario: z.ZodObject<
      {
        loanAmount: z.ZodNumber;
        interestRate: z.ZodNumber;
        loanTermYears: z.ZodNumber;
        monthlyPayment: z.ZodNumber;
        closingCosts: z.ZodNumber;
        apr: z.ZodNumber;
        programName: z.ZodString;
      },
      z.core.$strip
    >;
    recommendation: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type QuoteOption = z.infer<typeof QuoteOptionSchema>;
export declare const QuoteSchema: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    leadId: z.ZodString;
    options: z.ZodObject<
      {
        lowestPayment: z.ZodObject<
          {
            label: z.ZodString;
            scenario: z.ZodObject<
              {
                loanAmount: z.ZodNumber;
                interestRate: z.ZodNumber;
                loanTermYears: z.ZodNumber;
                monthlyPayment: z.ZodNumber;
                closingCosts: z.ZodNumber;
                apr: z.ZodNumber;
                programName: z.ZodString;
              },
              z.core.$strip
            >;
            recommendation: z.ZodOptional<z.ZodString>;
          },
          z.core.$strip
        >;
        balanced: z.ZodObject<
          {
            label: z.ZodString;
            scenario: z.ZodObject<
              {
                loanAmount: z.ZodNumber;
                interestRate: z.ZodNumber;
                loanTermYears: z.ZodNumber;
                monthlyPayment: z.ZodNumber;
                closingCosts: z.ZodNumber;
                apr: z.ZodNumber;
                programName: z.ZodString;
              },
              z.core.$strip
            >;
            recommendation: z.ZodOptional<z.ZodString>;
          },
          z.core.$strip
        >;
        lowestCost: z.ZodObject<
          {
            label: z.ZodString;
            scenario: z.ZodObject<
              {
                loanAmount: z.ZodNumber;
                interestRate: z.ZodNumber;
                loanTermYears: z.ZodNumber;
                monthlyPayment: z.ZodNumber;
                closingCosts: z.ZodNumber;
                apr: z.ZodNumber;
                programName: z.ZodString;
              },
              z.core.$strip
            >;
            recommendation: z.ZodOptional<z.ZodString>;
          },
          z.core.$strip
        >;
      },
      z.core.$strip
    >;
    assumptions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodDate>;
  },
  z.core.$strip
>;
export type Quote = z.infer<typeof QuoteSchema>;
export declare const DripCampaignSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    steps: z.ZodArray<
      z.ZodObject<
        {
          delay: z.ZodString;
          channel: z.ZodEnum<{
            SMS: "SMS";
            EMAIL: "EMAIL";
            CALL: "CALL";
            VOICEMAIL: "VOICEMAIL";
            GMAIL: "GMAIL";
            INTERNAL_NOTE: "INTERNAL_NOTE";
            WEBHOOK: "WEBHOOK";
          }>;
          content: z.ZodString;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export type DripCampaign = z.infer<typeof DripCampaignSchema>;
export declare const CampaignEnrollmentSchema: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    leadId: z.ZodString;
    campaignId: z.ZodString;
    status: z.ZodDefault<
      z.ZodEnum<{
        DRAFT: "DRAFT";
        ACTIVE: "ACTIVE";
        PAUSED: "PAUSED";
        COMPLETED: "COMPLETED";
        FAILED: "FAILED";
        STOPPED: "STOPPED";
      }>
    >;
    currentStepIndex: z.ZodDefault<z.ZodNumber>;
    enrolledAt: z.ZodDefault<z.ZodDate>;
    lastActivityAt: z.ZodOptional<z.ZodDate>;
  },
  z.core.$strip
>;
export type CampaignEnrollment = z.infer<typeof CampaignEnrollmentSchema>;
export declare const CommunicationEventSchema: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    leadId: z.ZodString;
    channel: z.ZodEnum<{
      SMS: "SMS";
      EMAIL: "EMAIL";
      CALL: "CALL";
      VOICEMAIL: "VOICEMAIL";
      GMAIL: "GMAIL";
      INTERNAL_NOTE: "INTERNAL_NOTE";
      WEBHOOK: "WEBHOOK";
    }>;
    direction: z.ZodEnum<{
      INBOUND: "INBOUND";
      OUTBOUND: "OUTBOUND";
    }>;
    content: z.ZodString;
    providerId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodDefault<z.ZodDate>;
  },
  z.core.$strip
>;
export type CommunicationEvent = z.infer<typeof CommunicationEventSchema>;
export declare const ConsentStateSchema: z.ZodObject<
  {
    leadId: z.ZodString;
    status: z.ZodEnum<{
      DO_NOT_CONTACT: "DO_NOT_CONTACT";
      UNKNOWN: "UNKNOWN";
      OPTED_IN: "OPTED_IN";
      OPTED_OUT: "OPTED_OUT";
    }>;
    timestamp: z.ZodDate;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type ConsentState = z.infer<typeof ConsentStateSchema>;
export declare const DoNotContactStateSchema: z.ZodObject<
  {
    leadId: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    active: z.ZodDefault<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodDefault<z.ZodDate>;
  },
  z.core.$strip
>;
export type DoNotContactState = z.infer<typeof DoNotContactStateSchema>;
export declare const AgentSessionSchema: z.ZodObject<
  {
    id: z.ZodString;
    agentId: z.ZodString;
    leadId: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
      ACTIVE: "ACTIVE";
      COMPLETED: "COMPLETED";
      FAILED: "FAILED";
    }>;
    startedAt: z.ZodDefault<z.ZodDate>;
    endedAt: z.ZodOptional<z.ZodDate>;
  },
  z.core.$strip
>;
export type AgentSession = z.infer<typeof AgentSessionSchema>;
export declare const AgentToolCallSchema: z.ZodObject<
  {
    sessionId: z.ZodString;
    toolName: z.ZodString;
    arguments: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    result: z.ZodOptional<z.ZodUnknown>;
    timestamp: z.ZodDefault<z.ZodDate>;
  },
  z.core.$strip
>;
export type AgentToolCall = z.infer<typeof AgentToolCallSchema>;
export declare const MemoryRecordSchema: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    leadId: z.ZodString;
    content: z.ZodString;
    confidence: z.ZodNumber;
    sourceEventId: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    timestamp: z.ZodDefault<z.ZodDate>;
  },
  z.core.$strip
>;
export type MemoryRecord = z.infer<typeof MemoryRecordSchema>;
export declare const IntegrationHealthSchema: z.ZodObject<
  {
    serviceName: z.ZodString;
    status: z.ZodEnum<{
      HEALTHY: "HEALTHY";
      DEGRADED: "DEGRADED";
      DOWN: "DOWN";
    }>;
    latencyMs: z.ZodOptional<z.ZodNumber>;
    lastCheckAt: z.ZodDefault<z.ZodDate>;
  },
  z.core.$strip
>;
export type IntegrationHealth = z.infer<typeof IntegrationHealthSchema>;
export declare const WorkerNodeSchema: z.ZodObject<
  {
    id: z.ZodString;
    role: z.ZodEnum<{
      ORCHESTRATOR: "ORCHESTRATOR";
      RTX5090_BURST: "RTX5090_BURST";
      RTX3090TI_STEADY: "RTX3090TI_STEADY";
      RTX3060_LIGHTWEIGHT: "RTX3060_LIGHTWEIGHT";
      ORACLE_VPS: "ORACLE_VPS";
      HOME_ASSISTANT: "HOME_ASSISTANT";
    }>;
    hostname: z.ZodString;
    status: z.ZodEnum<{
      ONLINE: "ONLINE";
      OFFLINE: "OFFLINE";
      BUSY: "BUSY";
    }>;
    activeModels: z.ZodArray<z.ZodString>;
  },
  z.core.$strip
>;
export type WorkerNode = z.infer<typeof WorkerNodeSchema>;
export declare const ModelRouteSchema: z.ZodObject<
  {
    modelName: z.ZodString;
    primaryWorkerId: z.ZodString;
    fallbackWorkerId: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodNumber>;
  },
  z.core.$strip
>;
export type ModelRoute = z.infer<typeof ModelRouteSchema>;
export declare const AuditEventSchema: z.ZodObject<
  {
    id: z.ZodOptional<z.ZodString>;
    entityType: z.ZodString;
    entityId: z.ZodString;
    action: z.ZodString;
    riskLevel: z.ZodEnum<{
      READ_ONLY: "READ_ONLY";
      INTERNAL_MUTATION: "INTERNAL_MUTATION";
      CRM_MUTATION: "CRM_MUTATION";
      BORROWER_COMMUNICATION: "BORROWER_COMMUNICATION";
      COMPLIANCE_CRITICAL: "COMPLIANCE_CRITICAL";
    }>;
    performer: z.ZodString;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    timestamp: z.ZodDefault<z.ZodDate>;
  },
  z.core.$strip
>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
//# sourceMappingURL=index.d.ts.map
