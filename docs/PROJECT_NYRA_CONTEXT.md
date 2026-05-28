# Project Nyra Context

Project Nyra is a mortgage broker operations platform: public lead capture, broker command center, CRM synchronization, compliant outreach, deterministic quoting, and local/private AI workers.

Active surfaces:

- `apps/ratehunter`: public lead capture.
- `apps/projectnyra`: authenticated broker/operator app.
- Twenty CRM: system of record for people, leads, loans, campaigns, quotes, communication, and compliance state.
- Activepieces: primary automation builder/execution surface.
- n8n: constrained fallback for mortgage campaign flows only.
- Gastown: Oracle-hosted operator workspace, replacing the legacy Gastown surface.

Current source priority is active source and compose files first, then component specs, AGENTS/GEMINI, recent infra docs, package metadata, and finally archive/history.
