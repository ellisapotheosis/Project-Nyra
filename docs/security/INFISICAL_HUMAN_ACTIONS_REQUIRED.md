# Infisical + Agent Vault — Human Actions Required

Generated: 2026-08-30  
Status: **AWAITING USER ACTION**

## Only perform actions listed below.

All infrastructure, configuration, and tooling has been automated.  
**Do not manually configure Infisical, Agent Vault, Docker, or Project Nyra files.**

---

## ACTION 1: Authenticate Infisical Cloud

**What:** Sign into your Infisical Cloud account.  
**Why:** Required to create and manage Machine Identities for credentials.  
**Where:** https://app.infisical.com  
**Details:**

- Use your existing Infisical account
- MFA or passkey approval if required
- No credentials need to be shared with Claude

**How to resume:** Once logged in, notify Claude to continue configuration.

---

## ACTION 2: Create Agent Vault Machine Identity (read-only)

**What:** Create a new Machine Identity in Infisical Cloud for Agent Vault.  
**Why:** Agent Vault needs read-only access to credential paths.  
**Where:**

1. Go to https://app.infisical.com/project/8374cea9-e5e8-4050-bda4-b91f25ab30ef/settings/machine-identities
2. Click "+ Create machine identity"

**Fill in:**

- **Name:** `nyra-agent-vault-broker`
- **Description:** "Credential broker for AI agents (read-only, Infisical-backed vaults)"
- **Scope:** `/agents/agent-vault/*` (read-only)
- **Auth Method:** Universal Auth

**Details:** The scope must be `/agents/agent-vault/*` with **READ** permission only. No create/update/delete.

**How to resume:** After creation, Claude will ask for the next credential.

---

## ACTION 3: Generate Universal Auth Credentials

**What:** Generate Client ID and Secret for the Machine Identity.  
**Why:** Agent Vault uses these to authenticate with Infisical Cloud.  
**Where:** On the Machine Identity detail page after creating it.  
**Process:**

1. Click "Create Universal Auth Credentials"
2. Set an appropriate token TTL (e.g., 30 days for automatic rotation)
3. Download or copy the credentials

**CRITICAL:** The Client Secret is shown **ONCE**. You must:

- **Do NOT paste it into chat or Claude interface**
- **Use the secure hidden-input method Claude provides**

Example interaction:

```
Claude: "Paste the Client Secret when prompted. It will not echo."

$ sudo ./bootstrap-infisical-identity.sh nyra-agent-vault-broker
Client ID: [user pastes: 01ba6b4e-49c7-4c34-b1e2-cdfd8fef7cf1]
Client Secret: [user pastes hidden: (no echo)]
✓ Credentials saved securely
```

**How to resume:** Provide credentials via the secure method Claude specifies. Claude will update the configuration automatically.

---

## ACTION 4: Create Infisical Agent Machine Identity (read-write all paths)

**What:** Create a second Machine Identity for deterministic services.  
**Why:** Infisical Agent needs broader read access to fetch secrets for databases, LiteLLM, services.  
**Where:** Same location as ACTION 2.

**Fill in:**

- **Name:** `nyra-infisical-agent`
- **Description:** "Deterministic service secret injection (read-only, all paths)"
- **Scope:** `/hosts/*`, `/llm-providers/*`, `/external/*`, `/databases/*`, `/security/infisical/local` (read-only)
- **Auth Method:** Universal Auth

**Details:** This identity has broader scope (all service secrets) but still **READ ONLY**.

**How to resume:** Claude will use the credentials via the same secure method.

---

## ACTION 5: Create Agent Vault Paths in Infisical Cloud

**What:** Create `/agents/agent-vault/*` path structure.  
**Why:** Agent Vault vaults will read credentials from these paths.  
**Where:**

1. Go to Secrets view in your Project Nyra project
2. Create folders/paths as shown below

**Structure to create:**

```
/agents/agent-vault/llm
  ├─ OPENAI_API_KEY (reference from /llm-providers/openai or value)
  ├─ ANTHROPIC_API_KEY (reference from /llm-providers/anthropic or value)
  ├─ OPENROUTER_API_KEY (reference from /llm-providers/openrouter or value)
  └─ HF_TOKEN (reference from /llm-providers/huggingface or value)

/agents/agent-vault/github
  └─ GITHUB_TOKEN (reference from /external/github or value)

/agents/agent-vault/comms
  ├─ TWILIO_ACCOUNT_SID (reference or value)
  ├─ TWILIO_AUTH_TOKEN (reference or value)
  ├─ SENDGRID_API_KEY (reference or value)
  └─ RESEND_API_KEY (reference or value)
```

**Note on values:** If the credentials don't already exist in Infisical Cloud, you'll need to add them. If they do exist in `/llm-providers/*` or `/external/*`, Infisical supports **secret references** — use those instead of duplicating values.

**How to resume:** Once paths are created, notify Claude to continue.

---

## ACTION 6: Provide Infisical Credentials (if needed)

**What:** If Agent Vault paths need actual credential values (not just references), provide them securely.  
**Why:** Infisical must have the actual API keys for Agent Vault to broker them.  
**Details:**

- Claude will ask for specific keys only if they're missing
- Examples: OPENAI_API_KEY, ANTHROPIC_API_KEY, GITHUB_TOKEN
- **Do NOT paste into chat**
- Use the secure hidden-input method Claude provides

**Pattern:**

```
Claude: "OPENROUTER_API_KEY is missing. Use secure input:"

$ infisical secrets set --path /agents/agent-vault/llm OPENROUTER_API_KEY
Value: [user enters hidden: (no echo)]
✓ Secret created in Infisical Cloud
```

**How to resume:** Provide credentials via secure method. Claude validates they're set correctly.

---

## Once All Actions Complete

Claude will:

1. Deploy Agent Vault container
2. Create vaults (nyra-llm, nyra-github, nyra-comms)
3. Register services in each vault
4. Create agent tokens
5. Deploy Infisical Agent to deterministic hosts
6. Run security validation tests
7. Report completion status

---

## Emergency Revocation

If credentials are compromised at any point:

1. **In Infisical Cloud:**
   - Go to Machine Identity settings
   - Disable or delete the compromised identity
   - Agent Vault will fail auth on next poll (~60 seconds)

2. **Claude will:**
   - Detect the failure
   - Provide next steps for re-authentication

---

## Support

If you encounter issues:

- Check `docs/security/INFISICAL_AGENT_VAULT_ARCHITECTURE.md` for architecture details
- Check `docs/security/SECRET_REFERENCE_MAPPING.md` for credential mapping
- Run `bash infra/agent-vault/scripts/validate-infisical-agent-vault.sh` to test deployment
- Review Agent Vault logs: `docker logs nyra-agent-vault`
