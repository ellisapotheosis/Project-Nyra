# N8N_FALLBACK_POLICY

Last updated: 2026-05-24

## Primary Rule

**Activepieces is the primary automation and workflow builder for Project Nyra.**

n8n is a constrained fallback used exclusively for mortgage lead drip campaign templates.
It must not become a general-purpose automation platform, broker-facing product surface,
or source of business truth.

---

## Decision Table

| Need                                       | Use               | Do NOT Use                  |
| ------------------------------------------ | ----------------- | --------------------------- |
| General business workflow automation       | Activepieces      | n8n                         |
| Webhook integrations for CRM, quote, docs  | Activepieces      | n8n                         |
| MCP-triggered automations                  | Activepieces      | n8n                         |
| Mortgage lead drip campaigns (see below)   | n8n (constrained) | Activepieces for these only |
| Business state ownership / source of truth | TwentyCRM         | n8n                         |
| Broker-facing UI/product                   | Broker web app    | n8n                         |

---

## Allowed n8n Campaign Templates

n8n may be used only for the following mortgage-specific drip campaign types:

| Campaign                  | Allowed Actions                                |
| ------------------------- | ---------------------------------------------- |
| New internet lead         | Call, text, voicemail, email, missed-call ping |
| Purchase pre-approval     | Call, text, email, Calendly booking link       |
| Refinance inquiry         | Call, text, email, rate watch trigger          |
| Realtor partner lead      | Call, text, email, voicemail                   |
| Credit repair follow-up   | Text, email, Rebump sequence                   |
| Rate watch                | Email, text alert                              |
| Dormant lead reactivation | Email, text, voicemail, Rebump                 |
| Post-close referral       | Email, text                                    |
| Missed-call ping          | Automated text/voicemail reply                 |

---

## Allowed n8n Actions (Whitelist)

Within approved campaign templates, n8n nodes may only use:

- **Voice / calling**: Twilio voice calls, voicemail drops
- **SMS / text**: Twilio SMS
- **Email**: SendGrid
- **Scheduling**: Calendly invite links (no direct Calendly API mutations)
- **Re-engagement**: Rebump email sequences
- **TTS**: Voice/TTS synthesis for voicemail scripts
- **Missed-call response**: Automated ping to missed inbound calls

---

## Forbidden n8n Actions

- Raw database writes to TwentyCRM or nyra-postgres (use CRM API or Activepieces)
- Ownership of borrower application state
- Triggering quote engine directly (use quote-api)
- Managing Infisical secrets or Docker operations
- Any workflow not listed in the approved campaign templates above
- Duplicating logic that already exists in Activepieces

---

## Infrastructure

n8n runs as a container on oracle-vps:

| Service | Host       | Port | Compose            |
| ------- | ---------- | ---- | ------------------ |
| n8n     | oracle-vps | 5678 | docker-compose.yml |

Credentials for n8n (Twilio, SendGrid, etc.) are stored in Infisical and injected
via the secrets-init sidecar. Never configure credentials directly in the n8n UI
without also recording them in Infisical.

---

## Audit Requirement

All n8n workflow executions that trigger outbound communication (call, text, email)
must produce an audit log entry in TwentyCRM against the relevant lead/contact record.
This is enforced via the n8n → crm-api webhook on completion of each campaign node.

---

## When to Consider Migrating n8n Workflows to Activepieces

- If the campaign logic requires CRM state reads beyond simple ID lookups
- If the workflow is triggered by events from Letta or OpenClaw agents
- If the workflow needs to branch on quote engine output
- If Activepieces already has an equivalent template

Migration process: clone the n8n workflow logic into Activepieces, run in parallel for
one week to verify parity, then deprecate the n8n version.
