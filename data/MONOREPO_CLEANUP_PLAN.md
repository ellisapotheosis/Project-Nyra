# Nyra Monorepo Cleanup & Consolidation Plan

> Author: ChatGPT for Ellis (aka Apotheosis) — 2025-10-22

This plan unifies orchestration, core libs, infra, and UI under a consistent 
`nyra-*` naming scheme, cleans up Docker Compose sprawl, and preps the repo for agents SDK + A2A.

---

## 0) Target Top-Level Layout

```text
.
├─ nyra/                               # single monorepo root (pnpm + docker)
│  ├─ nyra-orchestration/              # archon, claude-flow, metamcp glue
│  │  ├─ archon/                       # python (server, mcp, agents)
│  │  └─ claude-flow/                  # node service
│  ├─ nyra-core/                       # shared core libraries
│  │  ├─ nyra-a2a/                     # agent-to-agent protocol impl
│  │  └─ nyra-memory/                  # memory subsystem
│  ├─ nyra-infra/                      # ALL docker compose, envs, ops
│  │  ├─ compose/                      # compose.*.yml (dev, prod, orchestration, ui, memory, all)
│  │  └─ ops/                          # task runners, backups, cron
│  ├─ nyra-ui/                         # UI shell
│  ├─ nyra-webapp/                     # optional web app
│  ├─ packages/                        # ts packages (agents, sdks, shared)
│  │  └─ nyra-agents/                  # ts agents collection
│  ├─ env/                             # env files per env (dev/prod/.env.example)
│  ├─ schemas/                         # shared json/yaml schemas
│  └─ scripts/                         # repo migration + dev helpers
└─ Project-Nyra/ (leave as-is; not in workspace)
```

**Why this shape?**
- One workspace (`nyra/`) keeps Node/Python tooling and Docker in one place.
- Everything runtime-related lives in `nyra-infra`. Root `infra/` will be migrated then removed.
- All orchestrators sit under `nyra-orchestration` so Compose can reference them with stable relative paths.

---

## 1) Immediate Fixes (no risk)
- [x] Verify `archon` and `claude-flow` present under `nyra-orchestration` (✅ done).
- [x] Inventory Compose files (found in `infra/compose` and `nyra/nyra-infra/compose`).
- [x] Keep current `nyra/package.json` scripts (they already point at `nyra-infra`).

---

## 2) Consolidate Infra (low risk, scripted)
**Goal:** move `infra/` → `nyra/nyra-infra/` and deprecate root `infra/`.

Steps (automated):
1. Copy any missing compose files from `infra/compose` into `nyra/nyra-infra/compose`.
2. Copy `infra/mcp-servers` → `nyra/nyra-infra/mcp-servers`.
3. Copy `infra/tasks` → `nyra/nyra-infra/ops/tasks`.
4. Remove root `infra/` once green.

Scripts provided in `nyra/scripts/` (bash + PowerShell).

---

## 3) Compose Unification (profiles)
Introduce **profiles** in a single `compose.all.yml` under `nyra/nyra-infra/compose/`:
- `orchestration` → archon-server, archon-mcp, archon-agents, claude-flow
- `ui` → nyra-ui, nyra-webapp
- `memory` → vector stores, caches
- `metamcp` → meta-MCP servers

Examples:
```sh
# dev orchestration only
docker compose -f nyra/nyra-infra/compose/compose.all.yml --profile orchestration up
# dev ui only
docker compose -f nyra/nyra-infra/compose/compose.all.yml --profile ui up
# everything
docker compose -f nyra/nyra-infra/compose/compose.all.yml --profile orchestration --profile ui --profile memory --profile metamcp up
```

---

## 4) Workspaces & Naming
Update `nyra/pnpm-workspace.yaml` after infra migration:
```yaml
packages:
  - 'nyra-orchestration/*'
  - 'nyra-core/*'
  - 'nyra-infra/*'            # NEW (for any ts tooling in infra ops)
  - 'packages/*'
  - 'nyra-ui'
  - 'nyra-webapp'
```
> Temporary: the current entry `mcp-servers/*` does nothing; those live under infra and will move under `nyra-infra/mcp-servers` (non-node).

---

## 5) Agents SDK + A2A integration
- Ensure `nyra-core/nyra-a2a` is published/linked as a local package for Node and importable in Python via generated client (if needed).
- Add `packages/nyra-agents` to export reusable agents with clear manifest schema placed in `nyra/agents-manifests/`.
- Wire Archon agents container to mount `packages/nyra-agents` read-only.

---

## 6) Env Hygiene
- Standardize to `nyra/env/<env>/.env` with `.env.example` committed.
- Compose reads `--env-file nyra/env/dev/.env` etc.
- Keep secrets in Bitwarden/Infisical MCP servers; avoid plaintext.

---

## 7) Done Criteria
- `docker compose -f nyra/nyra-infra/compose/compose.all.yml --profile orchestration up` is healthy.
- `pnpm -w install` at `nyra/` completes with no missing workspace warnings.
- No references to root `infra/`.

---

## 8) Follow-ups (nice-to-have)
- Git submodule pin for `archon` and `claude-flow` (or vendored snapshots).
- CI: matrix build for python (archon) + node (claude-flow) + compose smoke test.
- Pre-commit hooks to validate `agents-manifests` against `schemas/`.

— end —
