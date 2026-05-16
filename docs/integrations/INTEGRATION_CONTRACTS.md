# INTEGRATION_CONTRACTS.md

## Overview

This document defines the technical contracts for Project Nyra's integrations. All adapters in `packages/integration-adapters` must adhere to these contracts.

Canonical schemas live in `@nyra/domain-models`. Service-specific boundary details live in:

- `services/crm-api/CONTRACT.md`
- `services/lead-ingestion/CONTRACT.md`
- `services/campaign-engine/CONTRACT.md`
- `services/quote-api/CONTRACT.md`
- `services/compliance-service/CONTRACT.md`
- `services/communication-service/CONTRACT.md`
- `services/assistant-service/CONTRACT.md`
- `docs/webapp/workflows/BACKEND_API_BOUNDARIES.md`

## 1. TwentyCRM (System of Record)

- **Primary Responsibility**: Storage of all persistent domain entities.
- **Canonical Boundary**: `services/crm-api`
- **Adapter Contract**: `ITwentyClient`
- **Key Methods**:
  - `upsertLead(lead: Lead)`: Atomic create/update.
  - `logCommunication(leadId, channel, content)`: Append-only log.
- **Invariant**: No business logic should reside in the CRM layer.

## 1.1 Lead Ingestion

- **Primary Responsibility**: Normalize and validate raw lead payloads before CRM persistence.
- **Canonical Boundary**: `services/lead-ingestion`
- **Contract**: `LeadIngestionPipeline`
- **Key Methods**:
  - `ingest(rawPayload)`: Returns cleaned lead plus ingestion audit metadata.
- **Invariant**: n8n, Activepieces, landing forms, and webapp surfaces may submit payloads, but they do not own source defaults, dedupe/validation policy, or campaign eligibility decisions.

## 2. Activepieces (Campaign Runtime)

- **Primary Responsibility**: Execution glue for scheduled drip steps.
- **Canonical Boundary**: `services/campaign-engine`
- **Contract**: `IActivepiecesClient`
- **Key Methods**:
  - `enrollInCampaign(leadId, campaignId)`: Initialize a workflow.
  - `removeFromCampaign(leadId, campaignId)`: Stop an active workflow.
- **Invariant**: Must respect the campaign engine state machine and `ComplianceDecision` before executing any outbound step. It must not own canonical campaign state.

## 3. Twilio & SendGrid (Communication)

- **Primary Responsibility**: Transport layer for SMS, Voice, and Email.
- **Canonical Boundary**: `services/communication-service`
- **Contract**: `ICommunicationProvider`
- **Key Methods**:
  - `send(to, content)`: Low-level dispatch.
- **Security**: Must verify webhook signatures for inbound replies.
- **Invariant**: No provider adapter dispatches borrower communication without a compliance allow decision.

## 4. Nexus Router (AI Gateway)

- **Primary Responsibility**: Tool aggregation and model routing.
- **Canonical Boundary**: `services/nexus-router`; risky product actions go through `services/assistant-service`.
- **Contract**: MCP Tools + GraphQL Schema.
- **Key Methods**:
  - `routeTask(task, riskLevel)`: Assign to worker node.
- **Invariant**: Must enforce `AgentActionRisk` boundaries and never expose worker inference endpoints publicly.

## 5. Quote Engine (Deterministic Calc)

- **Primary Responsibility**: Calculating mortgage scenarios.
- **Canonical Boundary**: `services/quote-api`
- **Contract**: `IQuoteEngine`
- **Key Methods**:
  - `generateQuote(request: QuoteRequest)`: Returns exactly 3 options.
- **Invariant**: Results must be deterministic and auditable.

## 6. Letta (Fleet Orchestrator)

- **Primary Responsibility**: Managing agent context and session lifecycle.
- **Contract**: `ILettaClient`
- **Key Methods**: `syncContext`, `triggerAgent`.

## 7. ClawTeam / Paperclip (Workflow Control)

- **Primary Responsibility**: Multi-agent coordination and goal alignment.
- **Contract**: `IWorkflowControl`
- **Key Methods**: `alignGoals`, `coordinateAgents`.
