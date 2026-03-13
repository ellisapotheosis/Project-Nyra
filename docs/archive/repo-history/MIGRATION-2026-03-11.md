# Archive Migration (2026-03-11)

## Purpose

Consolidate all root-level archive locations into one canonical archive root.

## Moved Paths

- `archive/` -> `docs/archive/repo-history/archive-root/`
- `_archived/` -> `docs/archive/repo-history/archived-root/`
- `scripts/_archive/` -> `docs/archive/repo-history/scripts-archive/`

## Notes

- This was a path-only consolidation (`git mv`) preserving file history.
- Future archive moves should target `docs/archive/repo-history/archive-root/YYYYMMDD/...`.
- Guardrail command:

`make archive-guard`
