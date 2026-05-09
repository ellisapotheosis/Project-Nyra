# AGENTS.md

Universal configuration for AI agents working on Project Nyra.

This file is the global contract for Claude Code, Codex CLI, Gemini CLI, Cursor, Copilot, Aider, Serena-aware agents, and any repo automation.

## Nyra Dev system prompt

Use this as the baseline system prompt for any coding/build agent:

```text
You are Nyra Dev, an expert DevEx Engineer and Principal AI Architect for Project Nyra.

Mission:
- Build and maintain an AI-powered mortgage automation platform.
- Treat compliance as first-class domain logic.
- Keep the control plane stable and workers replaceable.
- Prefer small, verifiable, production-quality changes.

Hard rules:
- Never commit secrets.
- Never expose worker inference endpoints publicly.
- Never make n8n the system-of-record or the business brain.
- Never let the assistant directly mutate CRM or databases.
- Never reintroduce RuVector or Graphiti into the current architecture.
- If a step requires owner login/MFA/dashboard action, document it in docs/OWNER_MANUAL_ACTIONS.md and continue.

If uncertain:
- Use conservative defaults.
- Mark assumptions explicitly.
- Add validation commands, tests, and smoke checks.
```

## Current target architecture

### Control plane

The control plane is split between the local **orchestrator** (MinisForum) and the **oracle-vps** (Cloud).

#### Orchestrator (LAN)

- Nexus Router
- LiteLLM
- Prometheus / Loki / Grafana (LAN)
- Portainer Server
- n8n (Internal)
- OpenClaw Gateway
- OpenClaw Studio
- Pocket TTS
- Syncthing (Cluster Sync)
- Open WebUI
- Quote API (FastAPI)
- Campaign Engine
- Mem0
- Cloudflared Tunnel (Public Ingress)

#### Oracle-VPS (Cloud)

- Twenty CRM (System of Record)
- Gitea
- Activepieces
- Qdrant / FalkorDB
- Mem0

### Data Synchronization

- **Syncthing** is used across all 4 local nodes (orchestrator, rtx5090, rtx3090ti, rtx3060) to sync the `~/` folder.
- All Syncthing containers mount `/home/ellisapotheosis` to `/var/syncthing/data/home`.

### Memory & Orchestration Endpoint

- **Nexus Router** (on orchestrator:6000) is the **singular endpoint** for all agents.
- It aggregates LLM routing and all MCP tools, including the memory stack on oracle-vps.
- All agent memory interactions should go through Nexus.

### Compute plane

Workers are GPU appliances:

- `worker-rtx5090` → primary vLLM
- `worker-rtx3090ti` → secondary vLLM
- `worker-rtx3060` → Embeddings, Extraction, Background Tasks, Summarization

## Product invariants

- Twenty CRM is the system of record.
- Compliance is explicit code with tests.
- STOP / unsubscribe / reply pauses must be enforced immediately across channels.
- The quote engine owns quote generation. The assistant must not hallucinate rates or costs.

## Directory routing

Agents must place work in the correct location.

### Repo roots

- `apps/webapp` → canonical broker/customer webapp control surface
- `apps/landing` → public landing/lead capture, remains separate
- `apps/admin` → internal operator/admin UI, being merged into webapp where useful
- `services/*` → backend business services
- `packages/*` → shared libraries, types, domain modules
- `workflows/n8n/*` → n8n workflow JSONs
- `infra/hosts/<host-name>/*` → the only valid per-host Docker Compose and deployment files
- `ops/*` → scripts, tmux, profiles, operational helpers
- `docs/*` → architecture, execution plans, manual steps

### Services responsibility map

- `services/crm-api` → Twenty integration boundary, lead ingestion, campaigns, quotes
- `services/campaign-engine` → campaign definitions and execution control
- `services/n8n-workflows` → workflow JSON and automation execution
- `services/openclaw` → assistant persona and runtime boundary
- `services/quote-api` → deterministic mortgage math (Python/FastAPI)

## Security rules

- Never expose Postgres, Redis, FalkorDB, worker vLLM, or worker Ollama publicly.
- All public ingress is through Cloudflared on the orchestrator only.
- Admin surfaces should be Cloudflare Access-gated.
- Secrets live in gitignored `.env` files or secret managers, never in source.

## Definition of done

Work is only done when:

- implementation is complete
- tests or validation checks exist
- docs are updated
- smoke checks pass
- no deprecated architecture is reintroduced


<claude-mem-context>
# Memory Context

# [project-nyra] recent context, 2026-05-08 8:57pm PDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (16,175t read) | 252,004t work | 94% savings

### May 4, 2026
S2 Configure OMC HUD display preset to "full" mode for comprehensive orchestration visibility in Claude Code status line (May 4, 11:01 PM)
S1 Status check and configuration of oh-my-claudecode HUD (statusLine display) (May 4, 11:01 PM)
### May 5, 2026
S3 Setup pre-commit hooks infrastructure (husky + lint-staged + prettier) for project-nyra monorepo (May 5, 12:39 AM)
S4 Create PR, review, merge pre-commit hooks feature; sync local repo with GitHub; audit and review stashes from previous syncs to decide what to keep/merge/discard (May 5, 3:05 AM)
### May 7, 2026
30 5:52a 🔴 Fixed Nexus MCP router URL pointing to wrong Tailscale host
26 " 🔵 Single remote commit not yet merged to local main
27 " 🔵 Stashed pre-sync changes: configuration cleanup and infrastructure updates
28 5:53a 🔵 Stash@{4}: Hardcoded environment variable change from pr-297-rebase
29 " 🔵 Stashes @{0-3} are near-identical duplicates from same sync operation
37 " 🔵 MCP server connectivity failures after configuration changes
35 5:54a 🔵 Stash@{2} differs from stash@{1} in workflow and project memory files
36 " 🔵 Confirmed: Stash@{2} and stash@{3} are bit-for-bit identical
39 " 🔵 Docker fix documentation files still exist on GitHub main
40 " 🔵 Infisical secrets file from stash@{4} does not exist on GitHub main
41 5:55a ✅ Feature branch created for pre-commit hooks work
42 " 🚨 GitHub reports 679 vulnerabilities in Project-Nyra default branch
43 " ✅ Feature branch feat/pre-commit-hooks pushed to GitHub
44 " ✅ Pull request #389 created for pre-commit hooks feature
45 " 🔵 PR #389 diff shows pre-commit hook implementation with side-effect modifications
46 5:56a ⚖️ PR #389 reviewed and approved for merge
47 5:57a ✅ pnpm-lock.yaml conflict resolved, upstream version accepted
49 6:01a 🔵 Repository in active interactive rebase; changes staged and pending
50 " ⚖️ Interactive rebase aborted; working state restored from stash
51 6:02a ✅ New feature branch created from origin/main; working state preserved
52 " 🟣 Pre-commit hooks successfully integrated and tested on feat/pre-commit-hooks-v2
53 6:07a ✅ Feature branch feat/pre-commit-hooks-v2 pushed to GitHub
54 " ⚖️ PR #389 closed in favor of clean rebased branch
55 " ✅ PR #390 created from clean feat/pre-commit-hooks-v2 branch
56 " ✅ PR #390 squash merged to main; feature branch deleted
57 6:08a ✅ Local main branch synced with origin/main; pre-commit hooks now in HEAD
58 " ✅ Working state restored from stash; local main fully synced
59 " 🔵 Repository verified synced; pre-commit hooks merged; stash review list ready
60 " ✅ Temporary PR resolution stash discarded
### May 8, 2026
62 4:09p ✅ Stash applied restoring infrastructure configs and documentation
63 " 🔵 Infrastructure hosts topology and service architecture mapped
64 " 🔵 Makefile is 976-line orchestration hub with recent consolidation work
65 4:10p 🔵 oracle-vps docker-compose defines complete 1158-line backend platform stack
66 " 🔵 Nexus (Grafbase) aggregates 25+ MCP servers and 4-tier LLM routing
67 4:11p 🔵 Orchestrator host runs lightweight edge node with local observability and BitNet inference
68 " 🔵 Host layout defines infrastructure bootstrap order and service placement policies
69 " 🔵 Vercel deployment failure with CircleCI checks passing
S5 Complete top-to-bottom audit of the Makefile (976 lines) and all container/host stacks across the 4-PC GPU cluster infrastructure, reviewing all docker-compose files and overlay configurations for each host (oracle-vps, orchestrator, worker-rtx3060, worker-rtx3090ti, worker-rtx5090), identifying all infrastructure issues, misconfigurations, and misalignments. (May 8, 4:12 PM)
70 4:12p 🔵 Vercel CLI installation initiated for deployment log inspection
71 " 🔐 Deprecated tar dependency with security vulnerabilities in Vercel CLI install
72 4:13p 🔵 Vercel CLI authentication required for deployment log inspection
73 " 🔵 Vercel inspect command stdin unavailable; process cannot be interrupted
74 " ✅ Vercel inspect process terminated
75 " 🔴 Root cause of Vercel deployment failure identified
76 " 🔵 PR #391 merge failed due to diverged branches
77 " 🟣 PR #391 successfully merged to main
78 4:14p 🔵 Repository branch state and stale remote tracking branches
79 " 🔵 Local main branch has uncommitted changes and diverges from remote
80 " ✅ Conductor track status updated to in-progress
81 " ✅ Repository state synchronized with remote main after PR #391 merge
82 4:15p 🔵 Local repository successfully synchronized with remote main

Access 252k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>