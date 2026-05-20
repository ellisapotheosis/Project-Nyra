# NEXUS_OPENCLAW_NERVE.md

## Role

AI Orchestration and model routing.

## Nexus Router (Grafbase)

- **URL**: `NEXUS_ROUTER_URL`
- **API Key**: `NEXUS_API_KEY`
- **Function**: Aggregates MCP tools and provides the unified agent/tool endpoint.

## OpenClaw / Nerve

- **Role**: Assistant chat surface and local agent workspace management.
- **Worker Target**: Typically routes to 5090 or 3090 Ti workers via LiteLLM.

## Safety Boundary

- OpenClaw is a supervised assistant surface, not the CRM and not the business brain.
- Read-only tools may run without broker approval when they do not expose prohibited data.
- CRM mutations, database mutations, quote creation, and borrower communications must route through Nyra services.
- Mutating or outbound tools require approval plus an audit event before execution.
- Quote terms must come from quote-service only.
- STOP/unsubscribe/reply pause handling must route through compliance and communication services immediately.
