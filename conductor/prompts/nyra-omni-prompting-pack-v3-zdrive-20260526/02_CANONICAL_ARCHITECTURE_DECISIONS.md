# Canonical Architecture Decisions v3

## Decision 1 — Activepieces first, n8n constrained fallback

Activepieces is the primary user-facing workflow/campaign builder because its UI/licensing model is more compatible with embedding or selling subscriptions around the app. n8n remains available as automation infrastructure but should not be exposed as raw n8n to ordinary broker users.

If n8n is still required after trying Activepieces, Letta, OpenClaw, Composio, OpenClaw cron jobs, and campaign-engine native scheduling, build a separate constrained mortgage-drip UI that truncates the n8n option universe down to mortgage-relevant actions.

## Decision 2 — Letta is an orchestrator + memory manager, not just another memory database

Letta manages memory-agent responsibilities and orchestrates OpenClaw agents running on worker PCs. Letta has its own Postgres. Letta MCP should be treated as a first-class tool endpoint.

## Decision 3 — NerveUI is fleet/session control, not the entire Nyra webapp

NerveUI is attached to each worker OpenClaw instance and used for local-first session/fleet/workspace control. Project Nyra webapp may link/embed safe Nerve views, but NerveUI is not the replacement for the broker command center.

## Decision 4 — TwentyCRM remains system-of-record

TwentyCRM records the canonical lead/contact/company/opportunity/task/note state. The Nyra webapp can wrap, synchronize, deep-link, summarize, and enrich Twenty records, but it should not pretend to be a second CRM source-of-truth.

## Decision 5 — Quote/rate services are service-backed

Quote generation, rate quoting, and 3-option comparisons must be produced by deterministic services/contracts. UI and agents can request quotes and explain them, but they must not hallucinate pricing or borrower terms.

## Decision 6 — Infisical sidecar + Docker Contexts is the deployment primitive

Root Makefile commands use Docker contexts to deploy per-host compose stacks under `/infra/hosts/<host>`. Infisical bootstrap secrets live on orchestrator and worker-rtx5090 terminal environments. Sidecars fetch runtime secrets for target stacks. This avoids storing local secrets on every host.

## Decision 7 — Gitea coding path

Use three layers:

1. Git over SSH/HTTPS for normal clone/branch/commit/push operations.
2. Tea CLI for deterministic issue/PR/release/repository automation from scripts or agents.
3. Gitea MCP server for natural-language repository operations inside MCP-capable clients.

Tea is not an MCP server. It is the official Gitea CLI. Gitea MCP is a separate server.

## Decision 8 — Nexus/Hive is the MCP/control ingress, but name/API are under evaluation

Continue documenting Grafbase/Nexus aka Nexus Router as the current MCP proxy aggregator. Add Hive as the probable upgrade/replacement with its own UI/console, but do not hard-code final APIs until repo configuration proves it.

## Decision 9 — Voice is a mesh service, not a single desktop toy

Kyutai Unmute runs locally per PC for OpenClaw/NerveUI voice. A mesh override stack distributes voice jobs across the GPU workers for low latency. Orchestrator may also run bitnet.cpp and PocketTTS.

## Decision 10 — UI/design is quarantined until explicitly assigned

The current prompting package is non-UI. Theme/UI/visual artifacts live in a separate folder and should not be executed by backend/infra agents.
