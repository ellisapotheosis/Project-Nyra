# MCP Router Config

This document defines the expected Nexus MCP router behavior for Project Nyra. It is a contract for implementation and validation, not a secret-bearing runtime config.

## Entry Points

| Route | Method | Purpose | Exposure |
| --- | --- | --- | --- |
| `/mcp` | GET | SSE stream for MCP clients | Protected |
| `/mcp` | POST | JSON-RPC request handling | Protected |
| `/api/mcp/servers` | GET/POST | Operator registration and inventory | Access-gated |

## Server Groups

| Group | Examples | Allowed users |
| --- | --- | --- |
| memory | Mem0, OpenMemory, Mempalace | Broker assistant, operator, dev |
| crm-read | Twenty CRM read tools | Broker assistant, operator, dev |
| crm-write | CRM mutation tools through `services/crm-api` | Approval service only |
| communications | Draft and send orchestration through communication service | Approval service only |
| campaign | Campaign enrollment and state tools through campaign service | Broker/operator after compliance |
| infra-read | health, logs, docs, runbooks | Operator, dev |
| infra-write | deploy/restart/secret rotation | Owner-approved operator lane only |

## Tool Listing Rule

`tools/list` must return only tools allowed for the resolved role. Returning all proxy tools and relying on `tools/call` denial is insufficient because it leaks capability shape to browser-facing clients.

## Tool Call Rule

Every `tools/call` request must include or derive:

- `actorId`
- `actorRole`
- `sourceSurface`
- `correlationId`
- `idempotencyKey`
- `riskLevel`

Write-class calls must be rejected unless the request references a valid approval record and the owning service accepts the state transition.

## Audit Requirements

Audit all MCP tool calls, including denied calls. Redact secrets and provider tokens before persistence. Store enough metadata to reconstruct actor, tool, target entity, source surface, decision, and owning service response.

## Current Known Gaps

- Existing Nexus MCP primitives are present, but role-filtered `tools/list` must be verified.
- Audit coverage exists for selected MCP operations, but sends, CRM writes, quote generation, campaign state changes, opt-outs, and agent actions need consistent taxonomy coverage.
- Config examples under `configs/nexus` and `configs/litellm` are non-secret scaffolds until promoted into the runtime deployment path.
