# Agent Routing

Project Nyra routes agent traffic through Nexus on the orchestrator. Agents do not call worker inference endpoints, provider APIs, CRM databases, or workflow engines directly.

## Routing Principles

- Nexus is the agent entrypoint for tools, model routing, and memory.
- LiteLLM routes model calls to cloud providers and private workers.
- Workers are private GPU appliances reachable over Tailscale only.
- Twenty CRM remains the system of record.
- The assistant proposes actions; Nyra services execute only after compliance and approval gates pass.

## Agent Classes

| Agent class | Surface | Allowed scope | Blocked scope |
| --- | --- | --- | --- |
| Borrower assistant | OpenClaw via cockpit/portal BFF | Intake help, document questions, status summaries, quote explanation from quote records | CRM mutation, provider send, worker URL access, raw MCP tools |
| Broker assistant | Cockpit BFF via Nexus | Lead summaries, draft responses, quote explanation, action proposals | Direct send, direct CRM write, raw database access |
| Operator agent | Access-gated operator routes | Health review, runbook lookup, deployment recommendations | Public worker exposure, secret readback, destructive infra actions without owner approval |
| Dev agent | Local/repo session | Code/docs/tests, local validation | Production mutation unless explicitly routed through owner-approved runbook |

## Model Routing

| Workload | Primary route | Fallback route | Notes |
| --- | --- | --- | --- |
| Broker-facing reasoning | Nexus -> LiteLLM -> cloud model | RTX 5090 vLLM | Must redact borrower PII before non-approved model calls. |
| Private document summarization | Nexus -> worker-rtx3060 Ollama | worker-rtx3090ti vLLM | Keep local/private when feasible. |
| Heavy local analysis | Nexus -> worker-rtx5090 vLLM | worker-rtx3090ti vLLM | Tailscale-only endpoints. |
| Tool orchestration | Nexus MCP router | None | Tool exposure must be role-filtered. |

## Required Gate Sequence

1. Identify actor, role, tenant, and source surface.
2. Resolve allowed tools for that role.
3. Run compliance preflight for any outbound communication or campaign mutation.
4. Require approval for sends, quote delivery, CRM writes, campaign pause/resume, and provider actions.
5. Execute through the owning service, not directly through n8n or the assistant.
6. Write an audit event with correlation ID and idempotency key.

## Runtime Defaults

- Use MagicDNS hostnames for private services.
- Use `projectnyra.com` for protected product/admin surfaces.
- Use `ratehunter.net` for public marketing and lead capture.
- Never expose vLLM, Ollama, Postgres, Redis, Qdrant, FalkorDB, raw MCP internals, or Portainer publicly.
