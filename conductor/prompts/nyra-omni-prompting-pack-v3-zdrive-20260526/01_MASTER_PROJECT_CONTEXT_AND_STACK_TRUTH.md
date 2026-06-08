# Project Nyra — Master Context and Stack Truth v3

Use this document as the canonical non-UI prompt context for Project Nyra agents.

## Absolute mission

Project Nyra is a broker-facing AI mortgage operations platform and future SaaS. It is not a generic CRM, not a borrower-only site, and not a one-off dashboard. It is a distributed mortgage operations engine for lead ingestion, CRM sync, compliant drip campaigns, mortgage quote generation, AI-assisted communication, local/private model inference, memory orchestration, voice/agent control, and auditable broker workflows.

## Product surfaces

1. **RateHunter.net landing page** — public borrower-facing personal mortgage broker landing page for lead capture, Calendly/contact, and trust. Keep UI/theme work separate unless explicitly assigned.
2. **ProjectNyra.com product landing** — public broker/operator product marketing for Project Nyra. Keep UI/theme work separate unless explicitly assigned.
3. **Project Nyra webapp** — authenticated broker command center using local Supabase backend/auth, CRM/API services, memory services, agent orchestration, campaign/quote workflows, and integration dashboards.
4. **TwentyCRM** — system-of-record CRM. It is separate/access-gated and should not be absorbed into the webapp as a cloned UI.
5. **Activepieces UI page** — preferred embedded workflow builder for mortgage drip campaigns because licensing is more compatible with selling subscriptions to the app.
6. **n8n fallback/specialized UI** — optional. Do not treat n8n as primary unless Activepieces/Letta/OpenClaw/Composio/cron jobs fail to cover a required workflow. If n8n remains needed, build a constrained mortgage-drip-only UI that exposes only call, text, voicemail, email, missed-call pings, voice/convo/TTS, SendGrid, Twilio, Calendly, Rebump, and campaign-relevant actions.

## Current intended stack

### Business / mortgage services

- RateHunter.net landing page.
- Project Nyra webapp.
- TwentyCRM.
- CRM API.
- Quote engine.
- Rate quoting API/service, integrated as a service rather than generic UI-first dependency.
- Campaign engine.
- Activepieces first for workflow builder and campaign automation.
- n8n only as fallback/specialized constrained drip-campaign surface.

### Communications

- Twilio for SMS, calls, voicemail/missed-call flows.
- SendGrid for email.
- Calendly for appointments.
- Rebump for follow-up where appropriate.
- Google Workspace/Gmail for broker email context where applicable.
- Kyutai Unmute on each PC for voice through each OpenClaw/NerveUI instance.
- Kyutai Unmute mesh override stack splitting voice jobs across all GPU workers for target ~300–400 ms latency.
- PocketTTS on orchestrator as optional/local voice component.

### Agent / orchestration

- Letta as memory-manager agent and orchestrator for OpenClaw agents.
- OpenClaw instances on each worker PC.
- Each worker OpenClaw instance gets a NerveUI instance.
- OpenClaw Gateway on orchestrator.
- Backup OpenClaw Gateway on RTX4060 if that host exists; do not assume it is the same as RTX3060.
- Gastown and Clawteam for OpenClaw orchestration.
- Composio where useful for agent tool integrations.
- OpenClaw cron jobs where useful before falling back to n8n.
- llxprt-jefe and llxprt-code to coordinate subscription usage of gemini-cli, claude-code CLI, and codex-cli.
- WaveTerm/Wave AI terminal plus zellij for three subscription agents + Letta orchestrator + OpenClaw sessions.
- RTX5090 may swap between OpenClaw and Claude Code for coding depending on task load.

### Memory

- Letta with its own Postgres instance.
- memorytensor / memOS.
- mem0 with Qdrant backend.
- Qdrant vector backend to mem0.
- Qdrant graph backend/plugin for mem0 if present in repo/tooling.
- Mempalace.
- ClaudeMem.
- OpenMemory MCP.
- Additional memory MCP integration not yet set up.
- Letta MCP server.
- Redis and Postgres as required service state.

### Model routing / MCP / LLM gateway

- LiteLLM containers on each PC/worker where useful.
- OpenRouter optional/provider fallback.
- Grafbase/Nexus aka Nexus Router as MCP proxy aggregator.
- Hive replacement/upgrade with UI/console if that is the current Nexus/Grafbase successor in the repo. Treat Hive as under evaluation until repository docs prove the final name/API.
- Docker MCP Toolkit.
- Git MCP, GitHub MCP, Twenty MCP, Infisical MCP, Gitea MCP where appropriate.

### Worker model stacks

- RTX5090: vLLM + LMCache + dedicated Redis container; burst reasoning, coding, quote generation, heavy inference.
- RTX3090 Ti: vLLM + LMCache + dedicated Redis container; steady-state webhook/reply/campaign classification and operational inference.
- RTX3060: Ollama; optional Redis if useful for KV/cache; lightweight/local fallback tasks.
- Orchestrator: bitnet.cpp CPU-powered LLM for low-cost local tasks; optional PocketTTS.
- Model switcher container on each worker.

### Infrastructure / hosts

- Repository host compose stacks live under `/infra/hosts/<host-name>` such as `/infra/hosts/orchestrator`.
- Orchestrator: Cloudflare Tunnel, core control plane, OpenClaw Gateway, service routing, makefile/docker-context operations.
- Oracle VPS: Cloudflare Tunnel, Gitea, Gitea DB, Infisical MCP, Twenty MCP, Git MCP, GitHub MCP, Gitea MCP as appropriate.
- Home Assistant Green: Vaultwarden and Linkwarden on LAN/Tailnet.
- Portainer CE + Portainer Agent on orchestrator.
- Portainer Agent only on all other hosts.
- Syncthing on all PCs/hosts.
- Local Supabase for webapp backend and auth.
- TwentyCRM has its own Postgres.
- Letta has its own Postgres.
- Gitea has its own DB on Oracle.

### Observability

- Prometheus.
- Loki.
- Grafana if present/intended for observability.
- cAdvisor.
- node-exporter.
- gpu-exporter.
- promtail.
- health-monitor.

### Secrets / deployment flow

- Infisical sidecars for each compose stack.
- Root Makefile orchestrates docker contexts and compose stacks.
- Required Infisical bootstrap env vars exist only on orchestrator and worker-rtx5090 terminal environments (`.zshrc`/shell env) because those are the two machines used to run make/docker context commands.
- Docker context + sidecar + compose standing up pulls secrets from the PC where commands are run.
- No local secrets are required on all PCs.
- Do not commit secrets.

## Non-negotiable boundaries

- Keep all UI/theme/design work separate for now unless explicitly requested.
- Do not delete docs. Archive before replacing.
- Do not reintroduce deprecated/abandoned stack items unless only documenting/migrating from existing references.
- Treat STOP/DNC/consent/compliance as hard gates.
- Treat AI outputs as drafts until approved when borrower-facing, unless inside a pre-approved campaign workflow.
- Treat internal endpoints, MCP tools, databases, model workers, Portainer, raw n8n, raw Activepieces, Nexus/Hive console, and memory services as private/Tailscale-only unless explicitly hardened.
