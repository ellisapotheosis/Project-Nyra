# Domain Model

Canonical TypeScript/Zod contracts live in `packages/domain-models`.

Primary entities:

- Lead, Borrower, RealtorPartner, LoanOpportunity
- MortgageScenario, QuoteRequest, QuoteOption, RateQuoteRequest, RateQuoteResult
- DripCampaign, CampaignEnrollment, CommunicationEvent
- ConsentState, DoNotContactState, AuditEvent
- AgentSession, AgentToolCall, HumanApprovalRequest, OrchestrationTask
- MemoryRecord, IntegrationHealth, WorkerNode, ModelRoute, VoiceJob
- HostStack, SecretMount, MCPServer

Core enums:

- LeadStage, Channel, ConsentStatus, CampaignStatus
- AgentActionRisk, AgentRole, WorkerRole, HostRole
- WorkerCapability, IntegrationStatus, VoiceJobStatus

Business rule: compliance state and audit events are first-class domain objects, not side effects hidden inside workflow JSON.
