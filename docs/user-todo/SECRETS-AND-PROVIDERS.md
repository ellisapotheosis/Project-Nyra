# Secrets And Providers Owner Guide

These actions require live credentials, provider dashboards, subscriptions, or
OAuth consent.

## References

- `docs/OWNER_MANUAL_ACTIONS.md`
- `docs/deployment/INFISICAL-MCP-SETUP.md`
- `docs/deployment/DOCKER-MCP-SETUP.md`
- `docs/configuration/infisical/01-infisical-secrets-only-master.md`
- `docs/env/ENV_INVENTORY.md`

## Infisical

1. Renew or confirm the active Infisical token/session.
2. Confirm machine paths exist for orchestrator, Oracle VPS, and worker nodes.
3. Populate live values for tunnel tokens, provider keys, app secrets, and MCP
   service-token material.
4. Re-render or restart secret-consuming services only after values are present.

## Provider Accounts

Confirm account access and required credentials for:

- Twilio
- SendGrid
- Twenty CRM
- Cloudflare
- Composio hosted MCP
- OpenAI/Codex
- Anthropic/Claude
- Gemini/Google
- Any broker, lender, OAuth, or webhook provider used for live testing

## GitHub And CI/CD

If a deployment workflow still depends on GitHub repository secrets, confirm the
GitHub secret value matches the current Infisical value or deliberately document
the divergence.

## Completion Evidence

Record only:

- secret path or variable name
- provider account/workspace name
- validation command or service restarted
- pass/fail status
- date

Never record raw secret values in this repository.
