# Archived Content

This directory stores files moved out of active monorepo paths during consolidation.

## Restore flow
1. Inspect `_archived/INDEX.md` to identify the original location and reason.
2. Restore with `git mv _archived/YYYYMMDD/<path> <target-path>`.
3. Re-run docs scans (`make audit-ports` and `make audit-env`) and tests.
