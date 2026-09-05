# HISTORICAL REFERENCE SNAPSHOTS — NOT OPERATIONAL CONFIGURATION

Everything under `apps/guidance/references/` is a **frozen point-in-time
snapshot** kept for provenance and requirements archaeology:

- `consolidated-archive-20260512/`
- `consolidated-archive-20260516/`
- `webapp-merge-snapshot/`

These trees are **not** current architecture and **not** deployable.

## What is stale in here

Snapshots predate the 2026-09-04 LiteLLM-native control-plane migration and
therefore still describe:

- a **three-GPU-worker** fleet — the third worker (an RTX 3060) has been
  **retired and sold**; there are exactly two active GPU workers;
- **Nexus** as the MCP/model gateway — both the bespoke `services/nexus-router`
  and Grafbase Nexus are **retired**; LiteLLM is the canonical gateway;
- per-host `docker-compose` sprawl instead of the root `compose.yaml` host
  profiles;
- model aliases and provider routes that no longer exist.

## Rules

1. **Never copy a deploy command, hostname, IP, port or model id out of this
   tree into live configuration.**
2. Treat any conflict between these snapshots and the live system as the
   snapshot being wrong. Live state wins.
3. Do not "fix" these files to match current architecture — that destroys their
   value as a historical record. Read them as history.

## Current sources of truth

| Topic            | Document                                      |
| ---------------- | --------------------------------------------- |
| Control plane    | `docs/architecture/NYRA_CONTROL_PLANE.md`     |
| MCP architecture | `docs/architecture/NYRA_MCP_ARCHITECTURE.md`  |
| Model plane      | `docs/architecture/NYRA_MODEL_PLANE.md`       |
| Secrets          | `docs/architecture/NYRA_SECRETS_PLANE.md`     |
| Deployment       | `docs/operations/NYRA_DEPLOYMENT_RUNBOOK.md`  |
| Rollback         | `docs/operations/NYRA_ROLLBACK_RUNBOOK.md`    |
| Host inventory   | `infra/CLAUDE.md`                             |
| Migration record | `docs/refactor/NYRA_REFACTOR_FINAL_REPORT.md` |
