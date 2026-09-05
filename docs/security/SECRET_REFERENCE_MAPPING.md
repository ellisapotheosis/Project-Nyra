# Project Nyra Secret Reference Mapping

**Purpose:** Machine-readable mapping of secrets used by Project Nyra infrastructure.  
**Never contains:** Secret values, credentials, API keys, passwords.  
**Contains:** Path references, variable names, access patterns, metadata.

Generated: 2026-08-30  
Scope: Infisical Cloud → Agent Vault / Infisical Agent

---

## LLM Providers (`/llm-providers/*)

### `/llm-providers/anthropic`

| Key               | Usage              | Hosts                                                | Pattern              |
| ----------------- | ------------------ | ---------------------------------------------------- | -------------------- |
| ANTHROPIC_API_KEY | API authentication | oracle-vps, orchestrator, worker-3090ti, worker-5090 | `x-api-key: <value>` |

**Consumers:** Claude SDK, LiteLLM routing, Agent Vault

---

### `/llm-providers/openai`

| Key            | Usage              | Hosts                             | Pattern                         |
| -------------- | ------------------ | --------------------------------- | ------------------------------- |
| OPENAI_API_KEY | API authentication | oracle-vps, orchestrator, LiteLLM | `Authorization: Bearer <value>` |

**Consumers:** OpenAI SDK, LiteLLM proxy

---

### `/llm-providers/openrouter`

| Key                | Usage              | Hosts                | Pattern                         |
| ------------------ | ------------------ | -------------------- | ------------------------------- |
| OPENROUTER_API_KEY | API authentication | orchestrator, agents | `Authorization: Bearer <value>` |

**Consumers:** OpenRouter SDK, Agent Vault

---

### `/llm-providers/huggingface`

| Key      | Usage                    | Hosts                      | Pattern                                                                   |
| -------- | ------------------------ | -------------------------- | ------------------------------------------------------------------------- |
| HF_TOKEN | Model access + inference | worker-3090ti, worker-5090 | `Authorization: Bearer <value>` or `huggingface_hub.login(token=<value>)` |

**Consumers:** vLLM, Ollama, huggingface_hub SDK

---

### `/llm-providers/litellm`

| Key                   | Usage                  | Hosts                     | Pattern                               |
| --------------------- | ---------------------- | ------------------------- | ------------------------------------- |
| LITELLM_MASTER_KEY    | LiteLLM admin API key  | orchestrator, all workers | `Authorization: Bearer <value>`       |
| LITELLM_BASE_URL      | LiteLLM router address | orchestrator, all workers | `http://litellm:4010`                 |
| LITELLM_DATABASE_URL  | PostgreSQL connection  | orchestrator              | `postgresql://user:pass@host/litellm` |
| LLXPRT_BRIDGE_API_KEY | LLxPRT bridge token    | orchestrator, all workers | Bearer token                          |

**Consumers:** LiteLLM service, worker agents, routers

---

## External Services (`/external/*`)

### `/external/github`

| Key                  | Usage                    | Hosts                            | Pattern                         |
| -------------------- | ------------------------ | -------------------------------- | ------------------------------- |
| GITHUB_TOKEN         | GitHub API + repo access | agents, orchestrator, oracle-vps | `Authorization: Bearer <value>` |
| GITHUB_GRAPHQL_TOKEN | GraphQL API access       | agents                           | `Authorization: Bearer <value>` |

**Consumers:** Agent Vault, GitHub Actions, Code analysis tools

---

### `/external/cloudflare`

| Key                      | Usage                 | Hosts                    | Pattern                           |
| ------------------------ | --------------------- | ------------------------ | --------------------------------- |
| CLOUDFLARE_API_TOKEN     | API authentication    | orchestrator, oracle-vps | `Authorization: Bearer <value>`   |
| CF_TUNNEL_TOKEN          | Tunnel authentication | oracle-vps               | `CLOUDFLARE_TUNNEL_TOKEN=<value>` |
| CLOUDFLARED_TUNNEL_TOKEN | Deprecated alias      | oracle-vps               | Deprecated                        |

**Consumers:** Cloudflare Tunnel daemon, CloudFlare API clients

---

### `/external/tailscale`

| Key               | Usage               | Hosts                             | Pattern                     |
| ----------------- | ------------------- | --------------------------------- | --------------------------- |
| TAILSCALE_AUTHKEY | Tailscale node auth | worker-rtx3090ti, worker-rtx5090, | `TAILSCALE_AUTHKEY=<value>` |

**Consumers:** Tailscale daemon on worker nodes

---

### `/external/portainer`

| Key                      | Usage               | Hosts                     | Pattern                |
| ------------------------ | ------------------- | ------------------------- | ---------------------- |
| PORTAINER_EDGE_ID        | Edge agent ID       | orchestrator, all workers | Edge deployment config |
| PORTAINER_EDGE_KEY       | Edge authentication | orchestrator, all workers | TLS key                |
| PORTAINER_ADMIN_PASSWORD | UI admin password   | orchestrator              | Bcrypt-hashed          |

**Consumers:** Portainer Edge agents, Portainer central management

---

### `/external/nexus`

| Key               | Usage              | Hosts                                    | Pattern                    |
| ----------------- | ------------------ | ---------------------------------------- | -------------------------- |
| NEXUS_ROUTER_URL  | Service endpoint   | orchestrator, all workers                | `http://nexus-router:8080` |
| NEXUS_ADMIN_TOKEN | API authentication | orchestrator, worker-5090, worker-3090ti | Bearer token               |
| NEXUS_JWT_SECRET  | Token signing      | nexus service                            | Raw secret                 |

**Consumers:** Nexus router service, MCP gateways, agent routers

---

### `/external/mem0`

| Key          | Usage              | Hosts       | Pattern               |
| ------------ | ------------------ | ----------- | --------------------- |
| MEM0_API_KEY | Mem0 Cloud API key | all workers | Bearer token          |
| MEM0_API_URL | Mem0 endpoint      | all workers | `https://api.mem0.ai` |

**Consumers:** Memory plane (agent context)

---

### `/external/openclaw`

| Key                    | Usage              | Hosts                     | Pattern      |
| ---------------------- | ------------------ | ------------------------- | ------------ |
| OPENCLAW_GATEWAY_TOKEN | API authentication | orchestrator, worker-5090 | Bearer token |

**Consumers:** OpenClaw agent framework

---

### `/external/hermes` (MCP Gateway)

| Key               | Usage          | Hosts                    | Pattern      |
| ----------------- | -------------- | ------------------------ | ------------ |
| MCP_GATEWAY_TOKEN | Authentication | orchestrator, oracle-vps | Bearer token |

**Consumers:** MCP gateway service, MCP clients

---

### `/external/composio`

| Key              | Usage              | Hosts      | Pattern      |
| ---------------- | ------------------ | ---------- | ------------ |
| COMPOSIO_API_KEY | API authentication | oracle-vps | Bearer token |

**Consumers:** Composio integration toolkit

---

### `/external/tavily`

| Key            | Usage          | Hosts                    | Pattern      |
| -------------- | -------------- | ------------------------ | ------------ |
| TAVILY_API_KEY | Search API key | orchestrator, oracle-vps | Bearer token |

**Consumers:** Tavily search integration

---

### `/external/firecrawl`

| Key               | Usage            | Hosts                    | Pattern      |
| ----------------- | ---------------- | ------------------------ | ------------ |
| FIRECRAWL_API_KEY | Web scraping API | orchestrator, oracle-vps | Bearer token |

**Consumers:** Firecrawl integration

---

## Agent Vault Broker Paths (`/agents/agent-vault/*`)

### `/agents/agent-vault/llm`

**Imported from:** `/llm-providers/openai`, `/llm-providers/anthropic`, `/llm-providers/openrouter`, `/llm-providers/huggingface`

| Vault    | Service     | Host                         | Auth Type                  |
| -------- | ----------- | ---------------------------- | -------------------------- |
| nyra-llm | openai      | api.openai.com               | Bearer                     |
| nyra-llm | anthropic   | api.anthropic.com            | API Key (x-api-key header) |
| nyra-llm | openrouter  | openrouter.ai                | Bearer                     |
| nyra-llm | huggingface | api-inference.huggingface.co | Bearer                     |

---

### `/agents/agent-vault/github`

**Imported from:** `/external/github`

| Vault       | Service    | Host           | Auth Type |
| ----------- | ---------- | -------------- | --------- |
| nyra-github | github-api | api.github.com | Bearer    |

---

### `/agents/agent-vault/comms`

**Sources:** `/external/twilio`, `/external/sendgrid`, `/external/resend`

| Vault      | Service  | Host             | Auth Type                   |
| ---------- | -------- | ---------------- | --------------------------- |
| nyra-comms | twilio   | api.twilio.com   | Basic (Account SID + Token) |
| nyra-comms | sendgrid | api.sendgrid.com | Bearer                      |
| nyra-comms | resend   | api.resend.com   | Bearer                      |

---

## Databases (`/databases/*`)

### `/databases/postgres`

| Key               | Usage         | Hosts                                   | Pattern           |
| ----------------- | ------------- | --------------------------------------- | ----------------- |
| POSTGRES_USER     | DB user       | oracle-vps, orchestrator, homeassistant | Connection string |
| POSTGRES_PASSWORD | DB password   | oracle-vps, orchestrator, homeassistant | Bcrypt/argon2     |
| POSTGRES_DB       | Database name | oracle-vps, orchestrator                | Connection string |

**Consumers:** PostgreSQL clients, LiteLLM, Twenty CRM, OpenLit

---

### `/databases/redis`

| Key            | Usage       | Hosts                    | Pattern           |
| -------------- | ----------- | ------------------------ | ----------------- |
| REDIS_PASSWORD | DB password | orchestrator, oracle-vps | Connection string |

**Consumers:** Redis clients, cache layer

---

### `/databases/supabase/cloud`

| Key                       | Usage          | Hosts            | Pattern |
| ------------------------- | -------------- | ---------------- | ------- |
| SUPABASE_ANON_KEY         | Public API key | agents, frontend | Bearer  |
| SUPABASE_SERVICE_ROLE_KEY | Admin API key  | backend services | Bearer  |

**Consumers:** Supabase SDK, edge functions

---

### `/databases/supabase/local`

| Key                  | Usage             | Hosts      | Pattern           |
| -------------------- | ----------------- | ---------- | ----------------- |
| SUPABASE_DB_PASSWORD | Local DB password | oracle-vps | Connection string |

**Consumers:** Local Supabase stack

---

## Security/Infisical (`/security/infisical/*`)

### `/security/infisical/local`

| Key                  | Usage             | Hosts     | Pattern                  |
| -------------------- | ----------------- | --------- | ------------------------ |
| INFISICAL_PROJECT_ID | Project reference | all hosts | UUID                     |
| INFISICAL_TOKEN      | Service token     | all hosts | Bearer token (read-only) |

**Consumers:** Infisical Agent, `infisical run` CLI

---

### `/security/infisical/agent-vault`

| Key                                    | Usage                   | Hosts       | Pattern                |
| -------------------------------------- | ----------------------- | ----------- | ---------------------- |
| INFISICAL_UNIVERSAL_AUTH_CLIENT_ID     | Machine Identity ID     | Agent Vault | UUID                   |
| INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET | Machine Identity secret | Agent Vault | Hex string (64+ chars) |

**Consumers:** Agent Vault container only (read-only vault mode)

---

## Observability (`/observability/*`)

### `/observability/grafana`

| Key | Usage | Hosts | Pattern |
| --- | ----- | ----- | ------- |

**Consumers:** Grafana service, observability dashboard

---

## Hosts Shared (`/hosts/shared`)

| Key                | Usage                | Hosts                      | Pattern                       |
| ------------------ | -------------------- | -------------------------- | ----------------------------- |
| INFISICAL_ENV      | Environment selector | all                        | `dev` or `prod`               |
| PROJECTNYRA_DOMAIN | Domain base          | all                        | `projectnyra.com`             |
| TWENTY_CRM_API_KEY | CRM integration      | worker-3090ti, worker-5090 | Bearer                        |
| TWENTY_CRM_URL     | CRM endpoint         | worker-3090ti, worker-5090 | `https://crm.projectnyra.com` |

---

## Access Control Summary

### Machine Identity: `nyra-infisical-agent`

Scope: Read-only access to all `/hosts/*`, `/llm-providers/*`, `/external/*`, `/databases/*`, `/security/infisical/local`

**Permissi ons:**

- Read: ✓
- Create/Update/Delete: ✗

---

### Machine Identity: `nyra-agent-vault-broker`

Scope: Read-only access to `/agents/agent-vault/*` ONLY

**Permissions:**

- Read: ✓
- Create/Update/Delete: ✗
- Vault mode: Read-only (no local mutation)

---

## Rotation Schedule

| Credential                   | Frequency     | Procedure                                                                   | Impact                       |
| ---------------------------- | ------------- | --------------------------------------------------------------------------- | ---------------------------- |
| Anthropic API Key            | Quarterly     | Rotate in Infisical Cloud; next agent request gets new key                  | None (automatic via polling) |
| GitHub Token                 | Quarterly     | Rotate in Infisical Cloud; next agent request gets new key                  | None                         |
| Machine Identity (Infisical) | Semi-annually | Create new identity → new UA creds → update Agent Vault → restart container | Brief Agent Vault restart    |
| Database Passwords           | Annually      | Rotate in Infisical Cloud; services refresh on next poll (60s)              | None (zero-downtime refresh) |
| Redis Password               | Annually      | Same as database passwords                                                  | None                         |

---

## Audit Trail

All credential access is logged via:

- **Infisical Cloud:** Secret access audit (read-only confirmed)
- **Agent Vault:** Local audit database (`/data/audit.db`)
- **Infisical Agent:** Syslog/container logs (timestamps + success/fail)

---

## Compliance Notes

- **Zero secrets in Git:** ✓ (all validated via pre-commit hooks)
- **Least privilege:** ✓ (Machine Identities scoped to minimum paths)
- **Encryption in transit:** ✓ (HTTPS only to Infisical Cloud)
- **Encryption at rest:** ✓ (Infisical Cloud + Agent Vault encrypted storage)
- **Audit logging:** ✓ (Infisical audit trail + Agent Vault local logs)
- **Revocation:** ✓ (Machine Identity revocation stops credential delivery in <60s)
