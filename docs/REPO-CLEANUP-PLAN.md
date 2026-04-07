# Project Nyra Repository Consolidation Plan (Top-to-Bottom, Execution Ready)

## 0) Executive objective and non-negotiables

Project Nyra should operate as a single, production-oriented monorepo where:

- service ownership is explicit,
- local bootstrap is deterministic,
- CI quality gates are enforced,
- documentation reflects runtime reality,
- rollback is always possible.

This plan preserves locked architecture components and aligns to the existing stack:
React/TypeScript apps + Node/Python services + PostgreSQL + Docker Compose/Kubernetes migration path.

### Locked components (must not be re-platformed during consolidation)

- LLM Gateway (Nexus Router + LiteLLM)
- CRM (TwentyCRM)
- Memory system (Letta + Graphiti + Mem0 + RuVector)
- Workflows (n8n + Activepieces)
- Chat UI (Dify)
- Observability (Prometheus + Grafana + Loki)

---

## 1) Canonical target architecture

## 1.1 Directory ownership model

- `apps/` — user-facing web/mobile/front-end workloads
- `services/` — deployable backend microservices (API, orchestration, adapters, MCP servers)
- `packages/` — shared libraries/types/config consumed by apps/services
- `infra/` — runtime infrastructure: compose, k8s, observability, gateway configs
- `workflows/` — n8n/Activepieces source-of-truth workflow artifacts
- `scripts/` — idempotent operational scripts (bootstrap, validation, migration)
- `config/` — non-secret config templates and inventory manifests
- `tests/` — cross-service integration and platform-level tests
- `docs/` — architecture, runbooks, migration guides, compliance controls
- `src/` — only root-level orchestration/business modules not yet service-extracted

## 1.2 Placement rules

1. If it is deployable and has its own runtime contract, it belongs in `services/` or `apps/`.
2. If it is shared code with no independent deploy lifecycle, it belongs in `packages/`.
3. If it is compose/k8s/runtime wiring, it belongs in `infra/`.
4. If it is executable operational logic, it belongs in `scripts/`.
5. Archived or superseded material belongs in `docs/archive/repo-history/` with migration notes.

## 1.3 Runtime entrypoints

- **Primary local entrypoint**: `docker-compose.dev.yml` (developer profile)
- **Production-shaped compose**: `docker-compose.prod.yml`
- **Support compose sets**: service-specific compose files only if they are generated or profile-scoped and documented

## 1.4 Container inventory map (current state)

The following container services are currently defined across compose files.

| Container service | Compose file(s) (current) | Current role |
|---|---|---|
| postgres | `docker-compose.archon.yml`, `docker-compose.dev.yml`, `docker-compose.prod.yml` | Primary relational DB |
| redis | `docker-compose.archon.yml`, `docker-compose.dev.yml`, `docker-compose.prod.yml` | Cache/queue state |
| nexus-router | `docker-compose.archon.yml`, `docker-compose.dev.yml`, `docker-compose.prod.yml` | LLM/MCP gateway |
| litellm | `docker-compose.archon.yml`, `docker-compose.dev.yml`, `docker-compose.prod.yml` | Model routing proxy |
| n8n | `docker-compose.dev.yml`, `docker-compose.prod.yml` | Workflow automation |
| twentycrm | `docker-compose.dev.yml`, `docker-compose.prod.yml` | CRM system of record |
| archon-os | `docker-compose.archon.yml` | Archon orchestration worker |
| archon-server | `docker-compose.archon.yml` | Archon API/service backend |
| archon-mcp | `docker-compose.archon.yml` | Archon MCP integration surface |
| archon-agents | `docker-compose.archon.yml` | Archon multi-agent runtime |
| archon-agent-work-orders | `docker-compose.archon.yml` | Work-order execution lane |
| archon-ui | `docker-compose.archon.yml` | Archon UI |
| infisical-db | `docker-compose.infisical.bootstrap.yml`, `docker-compose.infisical.yml` | Infisical metadata DB |
| infisical-redis | `docker-compose.infisical.bootstrap.yml`, `docker-compose.infisical.yml` | Infisical cache/session store |
| infisical | `docker-compose.infisical.bootstrap.yml`, `docker-compose.infisical.yml` | Secrets manager service |
| infisical-agent | `docker-compose.archon.yml` | Secrets bootstrap helper |
| infisical-cli | `docker-compose.archon.yml` | One-shot secret sync utility |
| nyra-secrets-init | `docker-compose.gitea.bootstrap.yml`, `docker-compose.gitea.yml` | Secrets bootstrap/init job |
| infisical-agent-gitea | `docker-compose.gitea.bootstrap.yml`, `docker-compose.gitea.yml` | Gitea secrets bridge |
| gitea-db | `docker-compose.gitea.bootstrap.yml`, `docker-compose.gitea.yml` | Gitea metadata DB |
| gitea | `docker-compose.gitea.bootstrap.yml`, `docker-compose.gitea.yml` | Source control UI/API |
| gitea-ai-reviewer | `docker-compose.gitea.bootstrap.yml`, `docker-compose.gitea.yml` | Automated code review service |
| gitea-act-runner | `docker-compose.gitea.bootstrap.yml`, `docker-compose.gitea.yml` | CI runner (standard) |
| gitea-act-runner-large | `docker-compose.gitea.bootstrap.yml`, `docker-compose.gitea.yml` | CI runner (large workload) |
| postgres-admin | `docker-compose.dev.yml` | Dev pgAdmin tool |
| redis-commander | `docker-compose.dev.yml` | Dev Redis admin tool |
| mailhog | `docker-compose.dev.yml` | Dev SMTP sink |
| backup-agent | `docker-compose.prod.yml` | Backup/export automation |
| log-aggregator | `docker-compose.prod.yml` | Log shipping/aggregation |

## 1.5 Container destination map (proposed state)

This is the target placement and ownership model for each currently defined container.

| Container service | Proposed canonical compose ownership | Proposed code/config home | Proposed tier |
|---|---|---|---|
| postgres | `infra/compose/core.yml` (included by dev/prod) | `infra/` | core data |
| redis | `infra/compose/core.yml` | `infra/` | core data |
| nexus-router | `infra/compose/gateway.yml` | `services/nexus-router` + `infra/config` | locked gateway |
| litellm | `infra/compose/gateway.yml` | `infra/config/litellm` | locked gateway |
| n8n | `infra/compose/workflows.yml` | `workflows/` + `infra/` | locked workflows |
| twentycrm | `infra/compose/crm.yml` | `apps/web/crm-dashboard` + `infra/` | locked crm |
| archon-os | `infra/compose/archon.yml` | `services/archon-os` | orchestration |
| archon-server | `infra/compose/archon.yml` | `services/archon-os` | orchestration |
| archon-mcp | `infra/compose/archon.yml` | `services/archon-os` | orchestration/mcp |
| archon-agents | `infra/compose/archon.yml` | `services/archon-os` | orchestration |
| archon-agent-work-orders | `infra/compose/archon.yml` | `services/archon-os` | orchestration |
| archon-ui | `infra/compose/archon.yml` | `apps/archon-ui` (or `tools/archon` until migrated) | operations ui |
| infisical-db | `infra/compose/secrets.yml` | `infra/` | platform-secrets |
| infisical-redis | `infra/compose/secrets.yml` | `infra/` | platform-secrets |
| infisical | `infra/compose/secrets.yml` | `infra/` | platform-secrets |
| infisical-agent | `infra/compose/bootstrap.yml` (one-shot profile) | `scripts/` + `infra/` | bootstrap |
| infisical-cli | `infra/compose/bootstrap.yml` (one-shot profile) | `scripts/` + `infra/` | bootstrap |
| nyra-secrets-init | `infra/compose/bootstrap.yml` | `infisical-secrets-init/` | bootstrap |
| infisical-agent-gitea | `infra/compose/gitea.yml` | `infisical-secrets-init/` | integration |
| gitea-db | `infra/compose/gitea.yml` | `infra/` | scm platform |
| gitea | `infra/compose/gitea.yml` | `infra/` | scm platform |
| gitea-ai-reviewer | `infra/compose/gitea.yml` | `ai-reviewer/` | scm automation |
| gitea-act-runner | `infra/compose/gitea.yml` | `infra/` + runner image pipeline | ci execution |
| gitea-act-runner-large | `infra/compose/gitea.yml` | `infra/` + runner image pipeline | ci execution |
| postgres-admin | `infra/compose/dev-tools.yml` (dev-only profile) | `infra/` | dev tool |
| redis-commander | `infra/compose/dev-tools.yml` (dev-only profile) | `infra/` | dev tool |
| mailhog | `infra/compose/dev-tools.yml` (dev-only profile) | `infra/` | dev tool |
| backup-agent | `infra/compose/ops.yml` (prod profile) | `scripts/` + `infra/` | operations |
| log-aggregator | `infra/compose/observability.yml` | `infra/` | locked observability |

## 1.6 Non-container consolidation map (proposed)

| Asset type | Current spread | Proposed canonical location | Notes |
|---|---|---|---|
| Docker Compose files | Root-level multiple compose files | `infra/compose/*.yml` + thin root wrappers only | Keep root wrappers for compatibility during migration window |
| Dockerfiles | Mixed root/services/tools | `infra/docker/` (shared) + service-local only when app-specific | Remove duplicate build contexts |
| Bootstrap scripts | `Scripts/`, `scripts/`, service folders | `scripts/bootstrap/` | Unify shell + PowerShell parity |
| Health/diagnostics | Mixed `scripts/` and docs snippets | `scripts/health/` | Make idempotent and CI callable |
| Env templates | Mixed root and subfolders | `config/env/` + service-local `.env.example` | No secrets in repo |
| CI pipelines | `ci/` + Gitea runner config spread | `ci/` + `infra/ci/` references | Runner config versioned and templated |
| Workflow exports | Mixed docs/tools locations | `workflows/` | Source-of-truth only; generated artifacts separated |
| Archived legacy | Multiple archive roots | `docs/archive/repo-history/` | Include migration index for traceability |

---

## 2) Consolidation program phases

## Phase 1 — Baseline inventory and freeze (Day 0–1)

### Actions

1. Create a tagged safety snapshot before movement/refactors.
2. Generate current inventory of:
   - compose files,
   - Dockerfiles,
   - package manifests,
   - env files/templates,
   - CI workflows,
   - active services/apps.
3. Freeze non-critical feature merges while consolidation branch is in progress.

### Deliverables

- `docs/configuration/docker-compose-inventory.json` refreshed.
- `docs/service-catalog.md` refreshed and reconciled with running compose services.
- `docs/runbook.md` updated with exact baseline commit hash/tag.

### Exit criteria

- Inventory artifacts match repository HEAD and are reviewable.

## Phase 2 — Structure normalization (Day 1–3)

### Actions

1. Move mislocated runtime assets into canonical folders.
2. Eliminate duplicated root-level script/config variants where a canonical version already exists.
3. Enforce naming conventions:
   - services: `services/<name>`
   - apps: `apps/<name>`
   - package scope consistency in `package.json` names.

### Deliverables

- Single canonical location per active runtime unit.
- Archive map documenting source → destination moves.

### Exit criteria

- No active deployable service is split across multiple ambiguous folders.

## Phase 3 — Dependency and install-path hardening (Day 2–4)

### Objective

Resolve “file/package is not auto-installing” behavior by standardizing install hooks and workspace detection.

### Actions

1. Audit root and workspace-level install scripts (`preinstall`, `install`, `postinstall`, `prepare`).
2. Confirm package manager consistency (`pnpm-workspace.yaml`, lockfile policy, corepack usage).
3. Validate that all workspace packages are discoverable from root.
4. Add/repair bootstrap script that performs deterministic install + verification.
5. Add explicit failure output when expected post-install artifact is missing.

### Debug checklist (fast discriminators)

1. Workspace not included in `pnpm-workspace.yaml`.
2. Lifecycle script exists but fails silently.
3. Conditional script skipped due to shell/platform mismatch.
4. Path assumptions broken between Windows host and WSL2.
5. Optional dependency marked incorrectly and skipped.

### Deliverables

- Deterministic install command path documented and tested.
- Install diagnostics script output captured in CI artifact/log.

### Exit criteria

- Fresh clone + one documented install command produces expected artifacts without manual patching.

## Phase 4 — Compose and infra consolidation (Day 3–6)

### Actions

1. Rationalize compose file roles:
   - dev compose,
   - prod compose,
   - optional overlays/profiles.
2. Remove duplicate service definitions across compose files unless profile-specific by design.
3. Normalize healthchecks, restart policy, and service dependency blocks.
4. Verify locked components keep their existing contracts and ports.

### Deliverables

- Compose matrix document: service → compose file/profile ownership.
- Healthcheck pass report for core stack.

### Exit criteria

- `docker compose config` passes cleanly for all canonical entrypoints.

## Phase 5 — Test/lint gate unification (Day 4–7)

### Actions

1. Define required quality gates for every PR:
   - lint,
   - type-check,
   - unit test,
   - integration smoke test.
2. Ensure each workspace has runnable scripts and root orchestrates them.
3. Add/repair CI job matrix for changed paths to avoid over-running unrelated suites.
4. Add failing-fast behavior for missing scripts.

### Deliverables

- Root-level quality command contract:
  - `pnpm lint`
  - `pnpm test`
  - `pnpm -r typecheck` (or equivalent)
- CI status checks required before merge.

### Exit criteria

- Consolidation branch cannot merge while any gate is red.

## Phase 6 — Compliance, security, and secrets hygiene (Day 6–8)

### Actions

1. Verify mortgage compliance guardrails remain discoverable and linked in docs.
2. Confirm sensitive borrower data paths are encrypted and never committed as plaintext fixtures.
3. Validate `.env` templates contain placeholders only; no secrets.
4. Run security scanning against dependencies and container configs.

### Deliverables

- Updated compliance cross-reference in runbook.
- Security scan summary with remediation list.

### Exit criteria

- No critical secrets/compliance regressions introduced by consolidation.

## Phase 7 — Documentation and operator readiness (Day 7–9)

### Actions

1. Update root onboarding docs with one-path setup flow.
2. Update service-level contracts (build, run, health endpoints, dependencies).
3. Publish rollback steps and known limitations.

### Deliverables

- Updated `README.md` quick-start path.
- Consolidation completion checklist with sign-off owners.

### Exit criteria

- New engineer can clone, install, start, and health-check without tribal knowledge.

---

## 3) Test and validation strategy (required at every change)

For each consolidation change set, run:

1. `pnpm lint` (or language-appropriate lint command for changed subtree)
2. `pnpm test` (or targeted workspace tests + root smoke tests)
3. `docker compose -f docker-compose.dev.yml config` (compose validation)
4. `docker compose -f docker-compose.dev.yml up -d` + health script for core services (when infra is touched)
5. `pnpm -r typecheck` where TypeScript packages are affected

If a check is intentionally skipped due to environment limitations, the PR must state:

- what was skipped,
- why,
- exact command to run later.

---

## 4) Branching, rollout, and rollback

## 4.1 Branching model

- Work on `consolidation/<scope>` branches.
- Merge in small batches:
  - structure,
  - install/path fixes,
  - infra compose cleanup,
  - docs updates.

## 4.2 Rollout controls

- Use feature toggles or compose profiles for risky service additions.
- Keep old compose references in archive during one release window.

## 4.3 Rollback

1. Keep pre-consolidation git tag.
2. Keep migration map for reverse moves.
3. Keep a compose fallback file for one release cycle.

---

## 5) Ownership matrix

- **Platform/Infra owner**: compose normalization, healthchecks, observability wiring
- **Application owners**: app/service relocation and runtime contract validation
- **QA owner**: quality-gate enforcement and regression sign-off
- **Security/Compliance owner**: secrets/compliance verification
- **Release owner**: merge sequencing and rollback readiness

---

## 6) Final definition of done

Consolidation is complete only when all are true:

1. Every active app/service has one canonical home and one runtime contract.
2. Install path is deterministic from clean clone in WSL2 and documented.
3. Compose entrypoints are reduced to canonical set and pass validation.
4. Lint, type-check, and tests are mandatory and green for consolidation PRs.
5. Locked architecture components remain intact and reachable on expected contracts.
6. Onboarding docs are accurate and reproducible.
7. Rollback path is tested and documented.

---

## 7) Suggested immediate next 10 actions (practical kickoff)

1. Tag current state (`pre-consolidation-<date>`).
2. Refresh compose/service/env inventory artifacts.
3. Run workspace detection audit and install hook audit.
4. Fix missing workspace entries and lifecycle script failures.
5. Validate clean install from fresh clone path.
6. Normalize compose files and remove duplicate active definitions.
7. Enforce root quality gate scripts and CI requirements.
8. Run compliance + secrets scan and remediate findings.
9. Update onboarding and operator runbooks.
10. Merge in phased PRs with rollback checkpoints.
