# INTEGRATION_CONTRACTS.md

## Overview

This document defines the technical contracts for Project Nyra's integrations. All adapters in `packages/integration-adapters` must adhere to these contracts.

## 1. TwentyCRM (System of Record)

- **Primary Responsibility**: Storage of all persistent domain entities.
- **Contract**: `ITwentyClient`
- **Key Methods**:
  - `upsertLead(lead: Lead)`: Atomic create/update.
  - `logCommunication(leadId, channel, content)`: Append-only log.
- **Invariant**: No business logic should reside in the CRM layer.

## 2. Activepieces (Campaign Runtime)

- **Primary Responsibility**: Execution of scheduled drip steps.
- **Contract**: `IActivepiecesClient`
- **Key Methods**:
  - `enrollInCampaign(leadId, campaignId)`: Initialize a workflow.
  - `removeFromCampaign(leadId, campaignId)`: Stop an active workflow.
- **Invariant**: Must respect the `ComplianceService` before executing any outbound step.

## 3. Twilio & SendGrid (Communication)

- **Primary Responsibility**: Transport layer for SMS, Voice, and Email.
- **Contract**: `ICommunicationProvider`
- **Key Methods**:
  - `send(to, content)`: Low-level dispatch.
- **Security**: Must verify webhook signatures for inbound replies.

## 4. Nexus Router (AI Gateway)

- **Primary Responsibility**: Tool aggregation and model routing.
- **Contract**: MCP Tools + GraphQL Schema.
- **Key Methods**:
  - `routeTask(task, riskLevel)`: Assign to worker node.
- **Invariant**: Must enforce `AgentActionRisk` boundaries.

## 5. Quote Engine (Deterministic Calc)

- **Primary Responsibility**: Calculating mortgage scenarios.
- **Contract**: `IQuoteEngine`
- **Key Methods**:
  - `generateQuote(request: QuoteRequest)`: Returns 3 options.
- **Invariant**: Results must be deterministic and auditable.
