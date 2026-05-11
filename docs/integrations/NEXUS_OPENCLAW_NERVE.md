# NEXUS_OPENCLAW_NERVE.md

## Role

AI Orchestration and model routing.

## Nexus Router (Grafbase)

- **URL**: `NEXUS_ROUTER_URL`
- **API Key**: `NEXUS_API_KEY`
- **Function**: Aggregates MCP tools and provides a unified GraphQL endpoint.

## OpenClaw / Nerve

- **Role**: Assistant chat surface and local agent workspace management.
- **Worker Target**: Typically routes to 5090 or 3090 Ti workers via LiteLLM.
