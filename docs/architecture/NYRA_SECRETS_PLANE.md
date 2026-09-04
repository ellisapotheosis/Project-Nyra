# Nyra secrets plane

Infisical is the secret authority. Nothing else is.

## Three distinct things

Keep them separate; conflating them is how credentials leak.

### 1. Infisical Secrets Manager

Source of truth for:

* `LITELLM_MASTER_KEY`
* LiteLLM scoped service keys
* provider keys (`OPENROUTER_API_KEY`, `OMNIROUTE_API_KEY`)
* Cloudflare API credentials and Access service tokens
* the cloudflared tunnel token
* database credentials
* machine identity credentials
* MCP OAuth/client secrets and first-party MCP bearer tokens

### 2. Infisical Agent

Trusted **service-side** secret delivery and template rendering. Renders
`runtime-secrets/oracle.runtime.env` and `runtime-secrets/agent.runtime.env`,
which `compose.yaml` consumes via `env_file`.

Never commit generated secret-bearing files. Where file sinks are required:

* root/service-only permissions
* tmpfs where practical
* atomic rotation
* reload the process after rotation
* `.gitignore`
* secret scanning

### 3. Infisical Agent Proxy

For when an **untrusted or semi-trusted agent must invoke an external service
without ever receiving the credential.** The proxy injects it on the wire.

**Prefer the Agent Proxy over resurrecting Agent Vault as the architectural
centerpiece.** `oracle-vps-agent-vault` (`infisical/agent-vault:latest`) is
currently running on both reachable hosts and is **not deleted** — no parity
test for its replacement has been run, and a working subsystem is not removed
before its replacement passes parity. It is frozen: no new dependencies are
added to it.

Do **not** proxy:

* local vLLM calls
* LMCache Redis
* Tailscale control traffic
* localhost
* internal Docker service-to-service traffic

`NO_PROXY` must therefore include:

```
127.0.0.1, localhost, 100.64.0.0/10, .trex-fiordland.ts.net
```

plus the Docker-local service names (`litellm`, `litellm-redis`,
`lmcache-redis`, `omniroute`).

## Canonical environment contract

Exactly these names. No `AGENT_VAULT_*` variables are created.

```dotenv
INFISICAL_DOMAIN=
INFISICAL_UNIVERSAL_AUTH_CLIENT_ID=
INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET=
INFISICAL_PROJECT_ID=
INFISICAL_ENVIRONMENT=
INFISICAL_SECRET_PATH=
INFISICAL_AGENT_PROXY_ADDRESS=
```

## Identity separation

**Never use one root-equivalent machine identity everywhere.**

| Identity | Scope | Defined in |
|---|---|---|
| Oracle service | secret-read/lease for the control plane only | `infra/env/oracle.env.example` |
| Worker service | worker-scoped secrets only | `infra/env/worker-rtx5090.env.example`, `infra/env/worker-rtx3090ti.env.example` |
| Autonomous agent | **no broad secret-read permission**; may call the Agent Proxy | `infra/env/agent.env.example` |

**An agent that can call the proxy must not thereby be able to read the backing
secret.** That is the entire point of the proxy.

## LiteLLM key architecture

`LITELLM_MASTER_KEY` is **administrative**. It exists only in the Oracle runtime
environment. It is never copied into Claude Code, Codex, ClawTeam, OpenHarness
or any agent runtime, and it is never used for acceptance tests.

| Key | Access group | Holder |
|---|---|---|
| `NYRA_LITELLM_DEV_KEY` | `nyra-dev` | developer agents |
| `NYRA_LITELLM_AGENT_KEY` | `nyra-dev` | general agent lane |
| `NYRA_LITELLM_AUTOMATION_KEY` | `nyra-automation` | n8n / Activepieces |
| `NYRA_LITELLM_MORTGAGE_KEY` | `nyra-mortgage` | CRM + borrower PII |
| `NYRA_LITELLM_ADMIN_KEY` | `nyra-admin` | human-supervised administration |
| `NYRA_LITELLM_OBSERVABILITY_KEY` | `nyra-observability` | telemetry, read-only |

Each is created through `POST /key/generate` with an explicit
`object_permission` carrying model access, MCP server grants, Tool Search
permission, spend/rate limits and an expiry. Existing keys are migrated with
`POST /key/update`. Rotation uses `POST /key/{key}/regenerate`.

**Do not grant every key every MCP server.**

## Subscription credentials are never relayed

* Claude Code and Codex keep their **native** authentication.
* Do **not** copy subscription browser cookies or session tokens into Infisical.
* Do **not** scrape Claude Code / Codex session authentication into LiteLLM.
* Provider APIs routed through LiteLLM use provider-supported credentials only.
* `OPENAI_BASE_URL` / `OPENAI_API_KEY` pointing at LiteLLM are set
  **per-profile**, never globally — setting them globally breaks native
  subscription auth.

When that profile is used, `OPENAI_API_KEY` holds a **scoped LiteLLM virtual
key**: not a provider key, never the master key.

## Cloudflare credential naming

Canonical names, chosen from the dominant existing usage in this repository:

| Variable | Occurrences before migration |
|---|---|
| `CLOUDFLARE_API_TOKEN` | 218 |
| `CLOUDFLARE_ACCOUNT_ID` | 139 |
| `CF_ACCESS_CLIENT_ID` | 54 |
| `CLOUDFLARE_ZONE_ID` | 44 |
| `CF_ACCESS_CLIENT_SECRET` | 27 |

The tunnel token was fragmented across four competing names
(`CLOUDFLARE_TUNNEL_TOKEN` 21, `CLOUDFLARED_TUNNEL_TOKEN` 20, `TUNNEL_TOKEN` 14,
`CLOUDFLARED_TOKEN` 14). **`CLOUDFLARED_TUNNEL_TOKEN` is canonical**; the
cloudflared container's own `TUNNEL_TOKEN` is mapped from it at the compose
layer so the rename is atomic rather than adding a fifth name.

**Use a least-privilege scoped API token. Never a Cloudflare Global API Key.**
`CLOUDFLARE_API_KEY` (30 occurrences) and `CLOUDFLARE_EMAIL` (30) are Global Key
authentication and must not be used.

## Secret file policy

`.gitignore` covers:

```
.env
.env.*
!.env.example
*.runtime.env
runtime-secrets/
secrets/
.infisical-runtime/
```

with negations so every `*.env.example` template stays tracked. Note that the
broad `env/` pattern (aimed at Python virtualenvs) was swallowing `infra/env/`;
that is now explicitly re-admitted.

Run secret scanning before every commit (`.gitleaks.toml` is configured).

### Diagnostics never print plaintext

Use key presence, key length, a hashed fingerprint, or the HTTP auth status
code. Never the value.

## Observability and secrets

Never log:

* prompts containing sensitive mortgage/customer PII unless policy explicitly
  allows it
* provider API keys
* Cloudflare service-token secrets
* Infisical tokens
* auth headers
* raw dynamic secret material

## Auth matrix

### Developer agents on `worker-rtx5090`

| Path | Mechanism |
|---|---|
| external | Cloudflare human OAuth |
| internal | scoped LiteLLM key over the Tailnet |
| Claude Code / Codex | native subscription auth |
| tool credentials the agent must not possess | Infisical Agent Proxy |

### Unattended agents

| Path | Mechanism |
|---|---|
| portal ingress | Cloudflare Access **service token** |
| model/tool access | scoped LiteLLM service key |
| MCP | restricted server grants |
| secrets | Infisical agent identity, minimum permission |

**Never put a human admin token in an unattended bot.**

## Known secret hygiene findings

Raised by this migration, requiring action:

1. **`TAILSCALE_MCP_AUTH_TOKEN` was hard-coded** as a plaintext literal in
   `infra/hosts/oracle-vps/nexus.toml` on the Oracle host. It is now
   `os.environ/TAILSCALE_MCP_AUTH_TOKEN`. **The token must be rotated** — it
   existed in plaintext in a host config file.
2. **`.agent/memory/episodic/AGENT_LEARNINGS.jsonl` contains captured secret
   material** from historical tool output, including what appear to be a LiteLLM
   master key, an Infisical service token and an llxprt bridge API key. Project
   policy forbids deleting episodic memory, so these were not removed. **Every
   credential recorded there must be treated as compromised and rotated**, and
   the memory-capture hook should redact rather than store tool output verbatim.
