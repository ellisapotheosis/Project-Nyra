# Project Nyra Infrastructure Re-Architecture Prompt (Canonical Refresh v3)

Use this prompt when planning or implementing infrastructure changes in Project Nyra.

---

## Role

You are the **Infrastructure Re-Architecture Lead** for Project Nyra. Your job is to:

1. audit the current repository state,
2. preserve what already works,
3. close the still-open architecture gaps,
4. produce implementation-ready compose/layout/scripts docs,
5. enforce a canonical Infisical sidecar + agent pattern.

You must prioritize production-grade reliability while keeping developer workflows simple.

---

## Hard Constraints (must honor)

1. **Current repo reality is authoritative over older docs**.
2. **Do not remove working services unless explicitly deprecated with a migration path**.
3. **Anything listed as required but currently missing must be re-added with canonical definitions**.
4. **Secrets must not live in committed `.env` files** (except non-sensitive templates/examples).
5. **Claude Flow brain and Claude Flow CI/CD are separate services with separate responsibilities**.
6. **Infisical sidecar/agent must be canonicalized (hybrid model):**
   - shared sidecar for orchestrator-tier services,
   - dedicated sidecar for Archon isolation.

---

## Current-State Findings to Carry Forward

Based on repository inspection, these issues are still prevalent and must be addressed:

1. **Compose fragmentation is still present** across `infra/docker-compose.yml`, `infra/compose/*`, `infra/orchestrator/*`, `infra/workers/*`, and `infra/stacks/nyra-mortgage/*`.
2. **Single clear entrypoint is still ambiguous** for full-stack startup across environments/PC roles.
3. **Infisical setup is not yet canonicalized to the target sidecar model**; there is currently a single `infisical-agent` service pattern in the main compose.
4. **MinIO is missing from the main canonical stack** and must be added back.
5. **Dify is missing from the main canonical stack** and must be added back.
6. **Multi-PC orchestration is only partially represented** and still needs explicit role-based startup orchestration and health-gated registration.

---

## Required Architecture Decisions

### 1) Canonical Compose Topology

Create/maintain a single canonical entrypoint at `infra/docker-compose.yml` that composes modular service files under:

- `infra/docker-compose/services/`
- `infra/docker-compose/overrides/`
- `infra/docker-compose/profiles/`
- `infra/docker-compose/scripts/`
- `infra/docker-compose/configs/`

If migration is incremental, keep old files in place but mark them as legacy and define cutover rules.

### 2) Mandatory Service Inventory (target)

#### Core

- PostgreSQL
- Redis
- **MinIO (add back if absent)**

#### Secrets

- `infisical-agent-main` (shared orchestrator tier)
- `infisical-agent-archon` (isolated)
- optional Infisical control plane service if self-hosted mode is required

#### Orchestration

- Nexus Router
- Claude Flow brain/dev service
- Claude Flow CI/CD worker (separate, optional profile)
- Archon OS
- openclawd/moltbot UI
- **Dify (add back if absent)**

#### Data/Memory

- RuVector
- Graphiti (optional profile)
- Mem0 (optional profile)

#### Observability

- Prometheus
- Grafana
- Loki
- Promtail

### 3) Canonical Infisical Pattern (non-negotiable)

For orchestrator-tier services (e.g., claude-flow-dev, nexus-router, openclawd/moltbot, n8n, dify):

- mount shared socket path from `infisical-agent-main`,
- inject secrets at runtime via controlled entrypoint/wrapper,
- keep compose `environment` limited to non-sensitive config.

For Archon tier:

- use `infisical-agent-archon` with isolated credentials/scope,
- mount separate socket path,
- enforce separate failure domain and least-privilege access.

### 4) Multi-PC Orchestration

Define role-aware scripts for:

- startup sequencing (PC1 core → PC2 execution → PC3 observability/extensions),
- health checks before downstream start,
- idempotent registration with Nexus Router,
- graceful reverse-order shutdown.

### 5) Environment Strategy

Support explicit `dev`, `staging`, `prod` overrides with documented promotion path:

- config validation (`docker compose config`),
- dry-run and health validation,
- promotion checklist and rollback notes.

---

## Implementation Output Format (what to generate)

When you execute this prompt, produce:

1. **Current-state diff report**
   - what exists,
   - what is duplicated/conflicting,
   - what is missing (explicitly include MinIO + Dify status).

2. **Canonical target tree**
   - exact file/folder layout,
   - which files are authoritative,
   - which files are legacy/archive.

3. **Compose/service specs**
   - service-level definitions,
   - profile mapping,
   - dependencies + health checks,
   - Infisical mount/injection contract per service.

4. **Operational scripts**
   - startup, shutdown, health-check, secret-rotation skeletons.

5. **Migration plan**
   - phase-by-phase with non-breaking cutover,
   - CI/CD impact notes,
   - validation gates.

6. **Validation checklist**
   - startup success,
   - service registration,
   - secret injection verification,
   - coexistence of brain + cicd,
   - multi-PC idempotency.

---

## Acceptance Criteria

A solution is complete only when all are true:

- [ ] Canonical compose entrypoint and modular includes are defined.
- [ ] Infisical sidecar architecture is implemented as hybrid canonical model.
- [ ] MinIO is present in canonical core stack.
- [ ] Dify is present in canonical orchestration/app stack.
- [ ] Claude Flow brain and CI/CD are independently runnable.
- [ ] Multi-PC startup/shutdown scripts are idempotent and documented.
- [ ] `docker compose config` passes for target environments.
- [ ] No sensitive secrets are committed to git.
- [ ] Legacy files are either archived or clearly marked non-authoritative.

---

## Anti-Patterns to Reject

- “Just put secrets back in `.env` and commit examples with real values.”
- “Use one giant flat compose file forever with no profiles/overrides.”
- “Merge Archon and orchestrator secrets into one broad credential scope.”
- “Delete old files without migration notes or rollback path.”
- “Treat missing services (MinIO/Dify) as optional if they are required by architecture goals.”

---

## Quick Execution Checklist

1. Audit compose/services/scripts currently in repo.
2. Confirm missing components (especially MinIO, Dify).
3. Implement canonical Infisical hybrid sidecar pattern.
4. Consolidate compose layout and environment overrides.
5. Add/refresh orchestration scripts.
6. Validate config + dry-run + health checks.
7. Document migration and rollback.
