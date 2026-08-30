# Infisical Cloud + Agent Vault Architecture

**Last updated:** 2026-08-30  
**Status:** Implementation in progress

## Authority & Flows

```
┌──────────────────┐
│ Infisical Cloud  │  (source of truth)
│ app.infisical    │
│  .com            │
└────────┬─────────┘
         │
    ┌────┴─────────────────────┐
    │                          │
    ▼                          ▼
Pattern A               Pattern B
Deterministic       Agent/Ephemeral
Workloads          Environments
    │                          │
    ▼                          ▼
Infisical Agent         Agent Vault
    │                   (read-only)
    │                          │
    ▼                          ▼
/run/nyra-secrets      proxy broker
    │                   (MITM injection)
    │                          │
    ▼                          ▼
Databases              Agents/APIs
LiteLLM           (no real creds)
Services
```

## Pattern A: Infisical Agent (Deterministic Workloads)

Trusted services use runtime secret files:

- **Deployment:** Infisical Agent container or systemd service
- **Authorization:** Machine Identity (read-only, scoped paths)
- **Output:** `/run/nyra-secrets/` (tmpfs, 0600)
- **Consumers:** Database, LiteLLM, internal services
- **Refresh:** Polling or file-watch

### Infisical Agent Config Example

```yaml
infisical:
  address: "https://app.infisical.com"

auth:
  type: "universal-auth"
  config:
    client-id: "${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID}"
    client-secret: "${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET}"

templates:
  - env: "prod"
    project-id: "8374cea9-e5e8-4050-bda4-b91f25ab30ef"
    path: "/hosts/oracle-vps"
    destination: "/run/nyra-secrets/.env"
    polling-interval: "60s"
    file-mode: "0600"
```

### Hosts Using Infisical Agent

- **oracle-vps** — LiteLLM, PostgreSQL, Supabase, internal services
- **orchestrator** — Nexus router, observability
- **worker-rtx5090** — vLLM, GPU inference
- **worker-rtx3090ti** — vLLM, GPU inference
- **worker-rtx3060** — Ollama, inference

## Pattern B: Agent Vault (Ephemeral Agents)

Agents receive placeholder credentials, not real values:

```
App code / agent:
  OPENROUTER_API_KEY = "agent-vault-session-token"
  HTTP_PROXY = "http://127.0.0.1:14322"

Request to api.openrouter.ai:
  → HTTP_PROXY intercepts
  → Agent Vault looks up service config
  → Infisical provides real OPENROUTER_API_KEY
  → Real credential injected inside proxy
  → Request proceeds with real auth
  → Agent sees only HTTP response

Result:
  ✓ Agent never sees real credential
  ✓ Infisical remains source of truth
  ✓ Credential injection happens at network boundary
```

### Deployment

**Location:** Oracle VPS (separate from agent execution)

**Ports:**

- **14321** — Admin UI (private/127.0.0.1 only)
- **14322** — Proxy (internal Tailscale/private network)

**Credentials (Infisical-backed):**

- Machine Identity: nyra-agent-vault-broker
- Scope: `/agents/agent-vault/*` (read-only)
- Auth: Universal Auth (Client ID + Secret)

### Vaults in Agent Vault

1. **nyra-llm** → `/agents/agent-vault/llm`
   - OpenAI API Key
   - Anthropic API Key
   - OpenRouter API Key
   - Hugging Face Token

2. **nyra-github** → `/agents/agent-vault/github`
   - GitHub PAT (read/repo permissions)
   - GitHub GraphQL token

3. **nyra-comms** → `/agents/agent-vault/comms`
   - Twilio Account SID + Auth Token
   - SendGrid API Key
   - Resend API Key

### Services in Each Vault

**nyra-llm services:**

```bash
agent-vault vault service add \
  --vault nyra-llm \
  --name openai \
  --host api.openai.com \
  --auth-type bearer \
  --token-key OPENAI_API_KEY

agent-vault vault service add \
  --vault nyra-llm \
  --name anthropic \
  --host api.anthropic.com \
  --auth-type api-key \
  --api-key-header "x-api-key" \
  --api-key-key ANTHROPIC_API_KEY

agent-vault vault service add \
  --vault nyra-llm \
  --name openrouter \
  --host openrouter.ai \
  --auth-type bearer \
  --token-key OPENROUTER_API_KEY
```

**nyra-github services:**

```bash
agent-vault vault service add \
  --vault nyra-github \
  --name github-api \
  --host api.github.com \
  --auth-type bearer \
  --token-key GITHUB_TOKEN
```

**nyra-comms services:**

```bash
agent-vault vault service add \
  --vault nyra-comms \
  --name twilio \
  --host api.twilio.com \
  --auth-type basic \
  --username-key TWILIO_ACCOUNT_SID \
  --password-key TWILIO_AUTH_TOKEN

agent-vault vault service add \
  --vault nyra-comms \
  --name sendgrid \
  --host api.sendgrid.com \
  --auth-type bearer \
  --token-key SENDGRID_API_KEY

agent-vault vault service add \
  --vault nyra-comms \
  --name resend \
  --host api.resend.com \
  --auth-type bearer \
  --token-key RESEND_API_KEY
```

## Infisical Cloud Structure

### Secret Paths

**LLM Providers** (`/llm-providers/*`)

- `/llm-providers/anthropic` → ANTHROPIC_API_KEY
- `/llm-providers/openai` → OPENAI_API_KEY (from LiteLLM)
- `/llm-providers/openrouter` → OPENROUTER_API_KEY
- `/llm-providers/huggingface` → HF_TOKEN

**Agent Vault Broker Paths** (`/agents/agent-vault/*`)

- `/agents/agent-vault/llm` ← import from `/llm-providers/*`
- `/agents/agent-vault/github` ← GITHUB_TOKEN
- `/agents/agent-vault/comms` ← Twilio, SendGrid, Resend keys

**External Services** (`/external/*`)

- `/external/github` → GITHUB_TOKEN
- `/external/anthropic` (alias)

### Machine Identities

**nyra-infisical-agent** (deterministic services)

- Scope: `/hosts/*`, `/llm-providers/*`, `/external/*`, `/databases/*`, `/security/infisical/local`
- Permissions: Read
- Auth: Universal Auth

**nyra-agent-vault-broker** (credential proxy)

- Scope: `/agents/agent-vault/*` (read-only)
- Permissions: Read only
- Auth: Universal Auth
- Vault mode: read-only (no create/update/delete)

## Security Guarantees

1. **One-way flow:** Infisical → Agent Vault → Proxy; NO reverse sync
2. **Read-only vault:** Agent Vault cannot mutate Infisical-backed credentials
3. **No agent credentials:** Real API keys never reach agent processes
4. **Encrypted proxy:** HTTPS + optional mutual TLS between agent and proxy
5. **Audit trail:** Agent Vault logs all credential access (local storage)
6. **Revocation:** Revoking Machine Identity access stops credential delivery
7. **Rotation:** Changing Infisical secret immediately reflected (next poll)

## Validation Tests

### Test 1: Credential Never Reaches Agent

```bash
# Agent should NOT be able to print OPENROUTER_API_KEY
agent-vault run --vault nyra-llm -- \
  sh -c 'echo $OPENROUTER_API_KEY'

# Expected: empty or placeholder token
# NOT: real API key
```

### Test 2: Proxy Injection Works

```bash
# Agent can use a real external API through proxy
HTTP_PROXY=http://127.0.0.1:14322 \
OPENROUTER_API_KEY=placeholder \
agent-vault run --vault nyra-llm -- \
  curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
    https://openrouter.ai/api/v1/models

# Expected: 200 OK (proxy injected real key)
# NOT: 401 Unauthorized
```

### Test 3: Revocation Works

```bash
# Revoke Agent Vault identity in Infisical Cloud
# Agent should fail to get credentials

# Within 60 seconds (poll interval):
agent-vault run --vault nyra-llm -- \
  sh -c 'echo Working' 2>&1

# Expected: Auth failure or cached credentials depleted
# NOT: Fresh credentials
```

### Test 4: Read-Only Enforcement

```bash
# Agent Vault should NOT be able to create secrets in Infisical

agent-vault vault credential set nyra-llm \
  FAKE_KEY=fake-value \
  --sync-infisical

# Expected: Permission denied from Infisical
# NOT: Secret created
```

## Deployment Checklist

- [ ] Infisical Cloud Machine Identities configured
- [ ] `/agents/agent-vault/*` paths created in Infisical
- [ ] Agent Vault `.env.agent-vault` populated with UA credentials
- [ ] Agent Vault container started
- [ ] Vaults created (nyra-llm, nyra-github, nyra-comms)
- [ ] Services registered in each vault
- [ ] Agent tokens created for Claude, Codex, custom agents
- [ ] Validation Test 1 (agent credential isolation) passes
- [ ] Validation Test 2 (proxy injection) passes
- [ ] Validation Test 3 (revocation) passes
- [ ] Validation Test 4 (read-only enforcement) passes
- [ ] Infisical Agent deployed to deterministic workloads
- [ ] `/run/nyra-secrets/` volume mounted in consumers
- [ ] Operator runbook written
- [ ] Secret scanning enabled
- [ ] Audit logging configured

## Operator Runbook

### Check Agent Vault Health

```bash
curl -s http://127.0.0.1:14321/health | jq .
```

### View Vault Status

```bash
agent-vault vault list
agent-vault vault credential-store show nyra-llm
```

### Sync Credentials from Infisical

```bash
agent-vault vault credential-store sync nyra-llm
agent-vault vault credential list --vault nyra-llm
```

### Rotate Machine Identity

1. Create new Machine Identity in Infisical (same scope, read-only)
2. Generate new Universal Auth credentials
3. Update `.env.agent-vault` with new credentials
4. Restart Agent Vault container
5. Delete old Machine Identity

### Emergency Revoke

```bash
# In Infisical Cloud:
# 1. Disable or delete nyra-agent-vault-broker identity
# 2. Agent Vault will fail auth on next poll (60s)
# 3. Existing agent sessions continue with cached credentials
# 4. New agent sessions fail immediately

# Verify revocation:
docker logs nyra-agent-vault | tail -20
```

### View Audit Logs

```bash
# Agent Vault stores logs locally
docker exec nyra-agent-vault \
  sqlite3 /data/audit.db \
  "SELECT timestamp, action, vault, status FROM audit LIMIT 50;"
```

## Links & References

- [Infisical Cloud](https://app.infisical.com)
- [Infisical Docs — Machine Identities](https://infisical.com/docs/machine-identities/overview)
- [Infisical Docs — Universal Auth](https://infisical.com/docs/machine-identities/universal-auth)
- [Agent Vault Docs](https://infisical.com/docs/agent-vault/overview)
- [Agent Vault CLI Reference](https://infisical.com/docs/agent-vault/cli)
- [Project Nyra Repo](https://github.com/project-nyra)
