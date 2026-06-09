---
name: config-move-impact-audit
description: Use when moving Project Nyra files, workflows, service paths, Docker mounts, or config references. Focuses on preventing stale path contracts like the PR #403 n8n mount regression.
---

# Config Move Impact Audit

Use this skill whenever files are moved or renamed and runtime configuration may still reference the old path.

## Evidence Trigger

PR #403 had a high-signal Codex P1 review finding: n8n workflows moved, but `infra/hosts/oracle-vps/docker-compose.yml:217` still mounted the stale workflow path. That is the model failure this skill prevents.

## Workflow

1. Capture the move set.
   - List moved or renamed paths with `git diff --name-status --find-renames`.
   - Record old path, new path, and owning service.
2. Search every contract surface for old paths.
   - `rg -n "<old-path>|<old-dir>|<basename>" .`
   - Include Docker Compose, GitHub Actions, scripts, package manifests, docs, and service env examples.
3. Classify each reference.
   - Runtime contract: must be updated and validated.
   - Documentation: update or intentionally mark stale historical context.
   - Generated/cache: do not edit unless source is also updated.
   - False positive: document why it is safe.
4. Validate path contracts with the lightest executable check.
   - Compose: `docker compose -f <file> config` when available.
   - Workflows: `actionlint <workflow>` when available.
   - Scripts: run shell syntax checks or targeted dry runs.
   - Package paths: run targeted tests or typecheck when feasible.

## Audit Checklist

- Docker bind mounts and named volumes point to the new path.
- CI workflows reference the new path.
- Service startup commands and health checks still resolve.
- Scripts do not hardcode the moved directory.
- Docs and owner manual steps match the new deployment path.

## Done Criteria

- Old-path search results are exhausted or explicitly classified.
- Runtime config validation ran, or the unavailable tool is named.
- The PR description includes the move-impact audit summary.
