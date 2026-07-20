# AI Gateway secrets and Infisical layout

Recommended paths:

```text
/project-nyra/shared/ai-gateway
/project-nyra/machines/orchestrator
/project-nyra/machines/worker-rtx5090
/project-nyra/machines/worker-rtx3090ti
/project-nyra/machines/worker-rtx3060
/project-nyra/agents/hermes-product
/project-nyra/agents/llxprt-dev
/project-nyra/agents/openharness-dev
```

## Shared AI gateway

- `LITELLM_MASTER_KEY`
- `LITELLM_DB_PASSWORD`
- `NEXUS_API_KEY`
- `OMNIROUTE_API_KEY`
- `OPENROUTER_API_KEY` — optional
- `NATS_USER`
- `NATS_PASSWORD`
- `CLOUDFLARE_TUNNEL_TOKEN`
- `CLOUDFLARE_ACCESS_SERVICE_TOKEN_ID`
- `CLOUDFLARE_ACCESS_SERVICE_TOKEN_SECRET`
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_HEADERS` — when required

## OmniRoute encrypted state

- `JWT_SECRET`
- `API_KEY_SECRET`
- `DATABASE_ENCRYPTION_KEY`
- `INITIAL_PASSWORD`
- Official OAuth tokens are stored by OmniRoute after interactive login; do not
  copy raw browser cookies into Infisical.

## Generated LiteLLM virtual keys

- `LITELLM_DEV_AGENT_KEY`
- `LITELLM_HERMES_PRODUCT_KEY`
- `LITELLM_MEMORY_WORKER_KEY`
- Later: one key per production service and one per autonomous agent identity.

## Worker hosts

- unique `INFISICAL_TOKEN` or machine-identity credentials per host
- `HF_TOKEN`
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_KEY`
- optional model repository credentials
- per-worker NATS credentials when NKeys are introduced

Correct the existing worker secret paths: each worker currently references
`/machines/oracle-vps`; use its own machine path instead.

## Agent Vault intersection

Agent Vault is an agent-facing credential proxy and egress-control layer. It
should mint a short-lived session for an individual agent and inject only that
agent's scoped LiteLLM virtual key and approved external credentials.

It does **not** replace LiteLLM virtual keys, Infisical, or LiteLLM's own secret
loading. LiteLLM and OmniRoute should receive service secrets directly from
Infisical-rendered environment files or sidecars.

Recommended agent environment:

```bash
HTTPS_PROXY=http://agent-vault.internal:14322
HTTP_PROXY=http://agent-vault.internal:14322
NO_PROXY=localhost,127.0.0.1,.trex-fiordland.ts.net,.projectnyra.com,litellm,nexus-router,nats
LITELLM_API_KEY=<scoped virtual key injected by Agent Vault>
```

Never inject `LITELLM_MASTER_KEY` into an agent runtime.
