# Integration Contracts

Canonical adapter interfaces and mocks live in `packages/integration-adapters`.

Covered adapter surfaces:

- Supabase auth/data
- Twenty CRM and CRM API
- Activepieces and constrained n8n fallback
- Twilio, SendGrid, Calendly, Rebump, Google Workspace
- Quote engine, rate quoting, campaign engine
- Nexus Router, Hive/Grafbase, LiteLLM
- OpenClaw, Nerve, Letta, Letta MCP
- mem0, Qdrant, Mempalace, ClaudeMem, OpenMemory MCP
- Composio, Gastown, Clawteam, Docker MCP Toolkit

Mocks must be explicit about degraded behavior. Mock quotes and mock rate data must never be presented as real borrower pricing.
