# Agent Vault Configuration

Project Nyra Agent Vault provides secure credential brokering for AI agents, Codex, Claude, and custom agents. All credentials are sourced from **Infisical Cloud** (never local self-hosted Infisical).

## Architecture

```
┌─────────────────┐
│ Infisical Cloud │  (source of truth)
│  (app.infisical │
│      .com)      │
└────────┬────────┘
         │
      (API)
         │
    ┌────▼─────────────────┐
    │   Agent Vault        │  (local credential broker)
    │  (port 14321/14322)  │
    └────┬─────────────────┘
         │
    ┌────┴────────────────┐
    │                     │
┌───▼────┐        ┌───────▼──┐
│ Codex  │        │  Claude  │  (vaulted agent wrappers)
└────────┘        └──────────┘
```

## Setup

### 1. Create Agent Vault Environment

Copy template to host-local file:

```bash
cp infra/agent-vault/agent-vault.env.example \
   infra/hosts/oracle-vps/.env.agent-vault
```

Edit `.env.agent-vault`:
- Generate strong `AGENT_VAULT_MASTER_PASSWORD`: `openssl rand -base64 32`
- Set `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID` and `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET` from Infisical Cloud Machine Identity

**Do NOT commit `.env.agent-vault`.**

### 2. Start Agent Vault Container

```bash
cd infra/hosts/oracle-vps
docker compose -f docker-compose.yml -f docker-compose.agent-vault.yml up -d agent-vault
```

Check health:

```bash
bash ../../agent-vault/scripts/check-agent-vault.sh
```

### 3. Register First Agent Vault User

Open browser to `http://127.0.0.1:14321/register` (or Tailscale URL if remote).

- Email: your-email@example.com
- Password: strong password
- (First user becomes instance owner)

### 4. Create Infisical-Backed Vaults

Set environment variables:

```bash
export AGENT_VAULT_ADDR="http://127.0.0.1:14321"
export INFISICAL_PROJECT_ID="<your-project-id>"
export INFISICAL_ENV="dev"
```

Create vaults:

```bash
bash infra/agent-vault/scripts/create-infisical-vaults.sh
```

Expected vaults:
- `nyra-llm` — OpenAI, Anthropic, OpenRouter credentials
- `nyra-github` — GitHub API token
- `nyra-comms` — Twilio, SendGrid, Resend credentials

### 5. Configure Services in Agent Vault UI

For each vault, add services:

**nyra-llm vault:**

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
  --api-key-header x-api-key \
  --api-key-key ANTHROPIC_API_KEY

agent-vault vault service add \
  --vault nyra-llm \
  --name openrouter \
  --host openrouter.ai \
  --auth-type bearer \
  --token-key OPENROUTER_API_KEY
```

**nyra-github vault:**

```bash
agent-vault vault service add \
  --vault nyra-github \
  --name github-api \
  --host api.github.com \
  --auth-type bearer \
  --token-key GITHUB_TOKEN
```

**nyra-comms vault:**

```bash
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

agent-vault vault service add \
  --vault nyra-comms \
  --name twilio \
  --host api.twilio.com \
  --auth-type basic \
  --username-key TWILIO_ACCOUNT_SID \
  --password-key TWILIO_AUTH_TOKEN
```

### 6. Create Agent Tokens

In Agent Vault UI, go to **Agents**:

- Create `codex-local` token (vault: nyra-llm)
- Create `claude-local` token (vault: nyra-llm)
- Create `nyra-custom-agent` token (vault: nyra-llm)

Copy tokens to host-local env file (never commit):

```bash
cat > /tmp/.env.agents << 'EOF'
AGENT_VAULT_ADDR=http://127.0.0.1:14321
AGENT_VAULT_TOKEN=<paste-token-here>
AGENT_VAULT_VAULT=nyra-llm
EOF
chmod 600 /tmp/.env.agents
source /tmp/.env.agents
```

### 7. Test Agent Vault Access

```bash
export AGENT_VAULT_ADDR="http://127.0.0.1:14321"
export AGENT_VAULT_TOKEN="<token-from-step-6>"
export AGENT_VAULT_VAULT="nyra-llm"

agent-vault vault discover --json
```

## Running Agents Through Agent Vault

### Codex

```bash
source /tmp/.env.agents  # Load AGENT_VAULT_* env vars
bash scripts/agents/run-codex-vaulted.sh
```

### Claude

```bash
source /tmp/.env.agents
bash scripts/agents/run-claude-vaulted.sh
```

### Custom Agent

```bash
source /tmp/.env.agents
bash scripts/agents/run-custom-agent-vaulted.sh my-agent-script.py
```

## Secret Scanning

### Local Development

Scan for leaked secrets before committing:

```bash
bash scripts/security/scan-secrets.sh
```

Reports:
- `.reports/security/infisical-full.sarif` (git history + working tree)
- `.reports/security/infisical-working-tree.json` (staging only)

### Pre-Commit Hook

Install hook to auto-scan on `git commit`:

```bash
bash infra/security/secret-scanning/install-git-hooks.sh
```

Bypass if needed (emergency only):

```bash
git commit --no-verify
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Agent Vault unreachable | Check Docker: `docker ps \| grep agent-vault` |
| Bad Machine Identity | Verify Infisical Cloud settings: read-only scope, correct paths |
| Service not proxying credentials | Verify service name matches Infisical key name (UPPER_SNAKE_CASE) |
| Agent token expired | Regenerate in Agent Vault UI → Agents |
| SMTP not working | Configure host, port, credentials in `.env.agent-vault` and restart |

## Security Rules

1. **Never commit `.env.agent-vault`** — contains Master Password + Machine Identity secret
2. **Never commit agent tokens** — regenerate if leaked
3. **Keep port 14321 private** — use 127.0.0.1, Tailscale, or VPN
4. **Use read-only Machine Identity** — scope to agent vault paths only
5. **Rotate Master Password every 90 days** — complex operation; start new vault if needed
6. **Audit logs stored locally** — back up regularly

## Maintenance

### Check Health

```bash
bash infra/agent-vault/scripts/check-agent-vault.sh
```

### View Logs

```bash
docker logs nyra-agent-vault
```

### Sync Credentials from Infisical

```bash
export AGENT_VAULT_VAULT="nyra-llm"
agent-vault vault credential-store sync $AGENT_VAULT_VAULT
agent-vault vault credential list --vault $AGENT_VAULT_VAULT
```

### Restart Agent Vault

```bash
cd infra/hosts/oracle-vps
docker compose -f docker-compose.yml -f docker-compose.agent-vault.yml restart agent-vault
```

## Links

- [Agent Vault Docs](https://infisical.com/docs/agent-vault/overview)
- [Infisical CLI Reference](https://infisical.com/docs/cli/commands)
- [Machine Identities](https://infisical.com/docs/machine-identities/overview)
- [Universal Auth](https://infisical.com/docs/machine-identities/universal-auth)
