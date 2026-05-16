# API_REFERENCE.md

## Overview
This document serves as the technical reference for the Project Nyra non-UI foundation interfaces.

## 1. CRM Integration (`ITwentyClient`)
`packages/integration-adapters/src/index.ts`

| Method | Description |
| :--- | :--- |
| `getLead(id: string)` | Retrieves a Lead entity from TwentyCRM. |
| `upsertLead(lead: Lead)` | Creates or updates a Lead in TwentyCRM. |
| `logCommunication(leadId, channel, content)` | Logs a communication event to the lead's timeline. |

## 2. Orchestration (`ILettaClient`)
`packages/integration-adapters/src/index.ts`

| Method | Description |
| :--- | :--- |
| `syncContext(leadId, context)` | Synchronizes person-centric memory to Letta/mem0. |
| `triggerAgent(agentId, task)` | Dispatches a specific task to a worker-based agent. |

## 3. Safety & Compliance (`ComplianceService`)
`packages/integration-adapters/src/compliance.ts`

| Method | Description |
| :--- | :--- |
| `isStopRequest(message)` | Static helper to detect DNC intent keywords. |
| `checkConsent(lead, channel)` | Verifies if a lead can be contacted via the given channel. |

## 4. Classification (`ClassificationService`)
`packages/integration-adapters/src/classification.ts`

| Method | Description |
| :--- | :--- |
| `classify(message)` | Heuristic classification of inbound message intent. |

## 5. Communication (`ICommunicationProvider`)
`packages/integration-adapters/src/index.ts`

| Method | Description |
| :--- | :--- |
| `send(to, content)` | Dispatches a message via Twilio or SendGrid. |
