# 04 Task Category Matrix

|Task category|Purpose|Related systems|Priority|Dependencies|Best agent type|Work depth|Large prompt?|Reason|
|---|---|---|---|---|---|---|---|---|
|Foundation/repo/environment|Create stable infra layout, health map, Makefile, compose per host|Docker, WSL2, Tailscale, Cloudflare, vLLM, Oracle|P0|None|Codex/Claude Code DevOps|Deep|yes|Foundation for everything else|
|AI agents/routing/memory|Create central agent/MCP/model/memory plan|OpenClaw, Nerve, ClawTeam, LiteLLM, Nexus/Hive, Letta/Mem0|P0/P1|Foundation|Systems architect|Deep|yes|Controls tool access and inference costs|
|CRM/lead ingestion|Make TwentyCRM useful for mortgage workflows|TwentyCRM, LeadMailbox, landing API, CRM API|P1|Foundation|Backend/CRM agent|Deep|yes|Revenue-critical system of record|
|Quote engine|Replace Excel-like quoting with deterministic API|Node/TS, Zod, mortgage math, PDF/export, MCP|P1|Foundation|Backend/finance API agent|Deep|yes|Prevents LLM math hallucinations|
|Campaigns/comms|Build compliant follow-up automation|Twilio, SendGrid, n8n, Activepieces, templates|P1/P2|CRM + quote engine|Automation/backend agent|Deep|yes|Core conversion loop|
|Workflow automation|Wire n8n/AP/Composio division of labor|n8n, Activepieces, Composio, webhooks|P2|CRM/comms|Automation architect|Medium/deep|yes|Avoids duplicative automation tools|
|Backend APIs/contracts|Define service contracts and wrappers|Fastify/Express, APIs, MCP, webhooks|P1/P2|CRM + quote|Backend architect|Deep|yes|Needed for agent-safe orchestration|
|Security/secrets/compliance|Protect PII/secrets and admin surfaces|Infisical, Cloudflare Zero Trust, Tailscale, audit logs|P0/P1|Foundation|Security/platform agent|Deep|yes|Must precede public exposure|
|Admin portal behavior|Specify nonvisual webapp functionality|Next.js app, dashboards, command center, integrations|P2|Backend/service APIs|Full-stack agent|Deep|yes|UI visuals quarantined, behavior can proceed|
|Dev/operator tooling|Build developer cockpit and local repo ops|WaveTerm, Zellij, Gitea, Paperclip, SearXNG, Browserless|P2/P3|Foundation/security|DevEx/platform agent|Medium/deep|yes|Improves execution leverage|
|Testing/deploy/observability|Harden services and workflows|Sentry, health checks, logs, Langfuse/Phoenix, CI|P3|All above|QA/platform agent|Deep|yes|Stops silent failures|
|UI/design quarantine|Finalize visual system and design choices|shadcn, TweakCN, R3F, landing/webapp visuals|Blocked until design pass|Canonical context|Claude Desktop/design agent|Deep|yes, separate|Visual decisions not final|
