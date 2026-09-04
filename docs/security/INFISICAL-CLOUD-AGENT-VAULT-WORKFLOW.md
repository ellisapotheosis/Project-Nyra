# Infisical Cloud + Agent Vault Workflow

Project Nyra eliminated local self-hosted Infisical. Infisical Cloud is now the single source of truth for all secrets.

## Architecture Overview

### Components

1. **Infisical Cloud** (`https://app.infisical.com`)
   - Source of truth for all credentials
   - Stores API keys, tokens, passwords
   - Provides Machine Identities for automated access

2. **Agent Vault** (local Docker container)
   - Credential broker for AI agents
   - Caches credentials from Infisical Cloud
   - Provides HTTP proxy for agent credential injection
   - Supports multiple vaults (nyra-llm, nyra-github, nyra-comms)

3. **Infisical Agent** (sidecar, optional)
   - Renders secrets to files/env vars
   - Polls Infisical Cloud for refreshes
   - Used by non-agentic services

4. **Infisical CLI** (dev tool)
   - Local secret injection: `infisical run -- <cmd>`
   - Secret scanning: `infisical scan`
   - Used for developer workflows

5. **GitHub Actions** (CI/CD)
   - OIDC integration: no long-lived tokens
   - Pulls secrets via Infisical API
   - Example workflow provided

## What Was Removed

- **Local self-hosted Infisical server** — eliminated, not to be recreated
- **Infisical encryption keys** (ENCRYPTION_KEY, AUTH_SECRET) — no longer needed
- **Infisical database** — no longer managed locally
- **Infisical PKI/SSH CA** — not needed for current scope

## What Remains & How to Use It

### For AI Agents (Codex, Claude, Custom)

**Use Agent Vault:**

```bash
export AGENT_VAULT_ADDR=http://127.0.0.1:14321
export AGENT_VAULT_TOKEN=<agent-token>
export AGENT_VAULT_VAULT=nyra-llm

agent-vault run -- codex
# or
bash scripts/agents/run-codex-vaulted.sh
```

Credentials are automatically injected by Agent Vault proxy.

### For Deterministic Services (API, Workers, Jobs)

**Option A: Infisical Agent** (runtime rendering)

```yaml
services:
  my-api:
    image: my-api:latest
    environment:
      INFISICAL_TOKEN: ${INFISICAL_TOKEN}
      INFISICAL_ENV: dev
      INFISICAL_PATH: /core/api
    volumes:
      - nyra_runtime_secrets:/run/nyra-secrets
```

Service reads rendered env from `/run/nyra-secrets/runtime.env`.

**Option B: infisical run** (dev only)

```bash
infisical run --env=dev --path=/core/api -- npm run server
```

**Option C: Docker env_file**

Docker secrets rendered by pre-startup script, injected via `--env-file`.

### For Local Development

**Use Infisical CLI:**

```bash
infisical login
infisical init

# Run command with secrets injected
infisical run --env=dev --path=/core/api -- npm run dev

# Scan for leaked secrets before commit
infisical scan --source . --redact --report-format sarif
```

### For Secret Scanning

**Local (before commit):**

```bash
bash scripts/security/scan-secrets.sh
```

Generates SARIF + JSON reports to `.reports/security/`.

**GitHub Actions:**

Workflow: `.github/workflows/secret-scan.yml`

Runs on pull_request and push to main. Uploads SARIF to GitHub Security tab.

### For GitHub Actions (CI/CD)

**OIDC (recommended, no long-lived secrets):**

```yaml
jobs:
  deploy:
    permissions:
      id-token: write
      contents: read
    steps:
      - name: Fetch secrets via OIDC
        uses: Infisical/secrets-action@v1.0.9
        with:
          method: oidc
          identity-id: ${{ secrets.INFISICAL_OIDC_IDENTITY_ID }}
          project-slug: project-nyra
          env-slug: dev
          secret-path: /infra/github-actions
```

Example workflow: `.github/workflows/infisical-oidc-example.yml`

## Infisical Secret Path Organization

Current structure in Infisical Cloud:

```
project-nyra/
├── dev/
├── staging/
└── prod/
    ├── shared/
    ├── core/
    │   ├── api/
    │   └── db/
    ├── vendors/
    │   ├── openrouter/
    │   ├── openai/
    │   ├── anthropic/
    │   ├── github/
    │   ├── twilio/
    │   ├── sendgrid/
    │   └── resend/
    ├── agents/
    │   ├── agent-vault/
    │   │   ├── llm/
    │   │   ├── github/
    │   │   └── comms/
    │   ├── open-webui/
    │   ├── claude-code/
    │   ├── codex/
    │   └── openclaw/
    ├── infra/
    │   ├── cloudflare/
    │   ├── tailscale/
    │   └── github-actions/
    └── machines/
        ├── oracle/
        ├── orchestrator/
        ├── local-dev/
 ├── /
        ├── worker-rtx3090ti/
        └── worker-rtx5090/
```

All credential keys must be **UPPER_SNAKE_CASE**.

Examples:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GITHUB_TOKEN`
- `TWILIO_ACCOUNT_SID`
- `SENDGRID_API_KEY`

## Failure Modes & Recovery

| Scenario | Symptom | Recovery |
|----------|---------|----------|
| Bad Machine Identity | Agent Vault can't auth to Infisical Cloud | Update INFISICAL_UNIVERSAL_AUTH_CLIENT_ID/SECRET in `.env.agent-vault`, restart |
| Leaked agent token | Attacker can impersonate agent | Regenerate token in Agent Vault UI → Agents |
| Expired Infisical credential store | Vaults can't fetch from Cloud | Update machine identity credentials (rotate) |
| Agent Vault master password lost | Can't recover local credentials | Restart container; re-add all services/agents from scratch |
| SMTP misconfigured | Email notifications fail | Fix AGENT_VAULT_SMTP_* env vars, restart |
| Port 14321 exposed to public | Anyone can access Agent Vault UI | Change port binding to 127.0.0.1:14321 (or use Tailscale) |
| Credentials cached too long | Leaked credential takes time to revoke | Reduce AGENT_VAULT_LOGS_MAX_AGE_HOURS; manual sync: `agent-vault vault credential-store sync <vault>` |

## Migration Path

### From Local Infisical (old) to Cloud (new)

1. Ensure Infisical Cloud project exists: `project-nyra`
2. Create secret paths matching old local structure
3. Create Machine Identity with read-only scope
4. Create `.env.agent-vault` with Cloud credentials
5. Start Agent Vault container
6. Register first user + create vaults
7. Manually copy credential keys from old Infisical (if not already in Cloud)
8. Create agent tokens
9. Test with: `bash infra/agent-vault/scripts/check-agent-vault.sh`
10. Remove old local Infisical compose file
11. Remove old Infisical encryption keys (back up offline first if paranoid)

## Manual Steps for Ellis

1. **Create Infisical Cloud Machine Identity**
   - Login to `https://app.infisical.com`
   - Project: `project-nyra`
   - Settings → Machine Identities → Create
   - Name: `nyra-agent-vault`
   - Auth method: Universal Auth
   - Permission scope: Read-only
   - Environments: dev, staging, prod (as needed)
   - Paths:
     - `/agents/agent-vault/llm`
     - `/agents/agent-vault/github`
     - `/agents/agent-vault/comms`
   - Copy Client ID + Client Secret

2. **Populate `.env.agent-vault`**
   - `AGENT_VAULT_MASTER_PASSWORD`: Generate with `openssl rand -base64 32`
   - `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID`: From step 1
   - `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET`: From step 1
   - Optional: SMTP settings (SendGrid, Resend, AWS SES)

3. **Start Agent Vault**
   ```bash
   cd infra/hosts/oracle-vps
   docker compose -f docker-compose.yml -f docker-compose.agent-vault.yml up -d agent-vault
   bash ../../agent-vault/scripts/check-agent-vault.sh
   ```

4. **Register Agent Vault User**
   - Browser: `http://127.0.0.1:14321/register`
   - Create account (first user = owner)
   - (Do NOT share credentials; this is local-only)

5. **Create Infisical-Backed Vaults**
   ```bash
   export INFISICAL_PROJECT_ID="<from Infisical Cloud>"
   bash infra/agent-vault/scripts/create-infisical-vaults.sh
   ```

6. **Configure Services**
   - Use UI or CLI to add services (openai, anthropic, github, sendgrid, etc.)
   - Match service host + auth-type to credential destination

7. **Create Agent Tokens**
   - Agent Vault UI → Agents
   - Create tokens: codex-local, claude-local, etc.
   - Store in host-local env file (never commit)

8. **Test**
   ```bash
   export AGENT_VAULT_ADDR=http://127.0.0.1:14321
   export AGENT_VAULT_TOKEN=<token-from-step-7>
   export AGENT_VAULT_VAULT=nyra-llm
   agent-vault vault discover --json
   ```

## No Rollback

Once local Infisical is removed, do NOT recreate it. If needed:
- Use Infisical Cloud UI or API directly
- Use Docker compose restore from git history (for dev/test only)
- Archive old setup docs but maintain "do not recreate" rule

## References

- [Agent Vault Docs](https://infisical.com/docs/agent-vault)
- [Infisical CLI](https://infisical.com/docs/cli/overview)
- [Machine Identities](https://infisical.com/docs/machine-identities)
- [Universal Auth](https://infisical.com/docs/machine-identities/universal-auth)
- [GitHub OIDC](https://infisical.com/docs/integrations/frameworks/github-actions)
