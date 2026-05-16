---
name: config-move-impact-audit
description: Prevent runtime breakage when files move by exhaustively auditing path and mount references before merge.
---

# Config Move Impact Audit

Use this skill when relocating configs/workflows/compose assets.

## Why this exists
PR #403 triggered a Codex P1 because workflows were moved but the n8n volume mount still referenced an old path in `infra/hosts/oracle-vps/docker-compose.yml:217`.

## Impact audit protocol
1. Record old path and new path.
2. Search for all old path references.
3. Update compose mounts, scripts, workflow loaders, and docs.
4. Validate runtime mount targets in a smoke run.

## Required commands
```bash
rg -n "<OLD_PATH>|<OLD_DIR_NAME>" infra ops workflows services apps packages docs
rg -n "n8n-workflows|docker-compose|volume" infra/hosts/oracle-vps
```

## Required evidence in PR
- List of files updated due to path move.
- Before/after mount mapping table.
- Smoke validation command output (or explicit gap if environment blocks).

## Safety checks
- No orphaned relative mounts (`../../...`) to deleted paths.
- No stale docs referencing pre-move structure.
- Compose file syntax checks pass.
