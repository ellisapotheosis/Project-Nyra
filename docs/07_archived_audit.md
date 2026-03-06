# 07 Archived Audit (Scope Hygiene)

## Archive policy

When content is no longer canonical, it is retained under:

- `/_archived/YYYYMMDD/...`

No destructive deletion is used for infra/doc recovery work.

## What is considered non-active

- `_archived/**`
- `infra-archived/**`
- `docs/references/**`

These paths may contain valid historic examples but are excluded from active runtime registry and edge mappings.

## Why this matters

1. Avoids accidental port conflicts when generating active registries.
2. Prevents legacy insecure exposure patterns from being reintroduced.
3. Keeps post-move documentation deterministic and auditable.

## Current audit result

- Active ports registry now uses Makefile/script referenced compose files only.
- Legacy compose discovery is preserved in `docs/02_ports_registry.appendix_legacy.md`.
- Placeholder docs have been rebuilt with source-linked evidence sections.

## Follow-up recommendation

Create a periodic CI check that fails if `docs/02_ports_registry.md` references paths under `_archived/` or `docs/references/`.

## Evidence commands
```bash
rg --files -g "docker-compose*.yml" -g "compose*.yml" | sort
```

```bash
rg -n "docker compose|COMPOSE_FILE|--env-file" Makefile infra/scripts/*.sh
```

## Audit conclusion
- Active docs now separate canonical runtime configuration from historical/reference materials.
- This prevents accidental resurrection of insecure or stale exposure patterns.
