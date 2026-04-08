# TwentyCRM (Temporary In-Repo Placement)

This folder documents the temporary in-repo placement policy for TwentyCRM during bootstrap.

## Why this is temporary

Project Nyra is keeping TwentyCRM code in-repo only during initial infrastructure convergence and until a dedicated external repository (for example, Gitea) is ready.

Current working source lives at:

- `apps/twenty-crm`

## Planned externalization flow

1. Provision dedicated VCS repository for TwentyCRM.
2. Use `scripts/twenty/clone.sh` to clone/sync external TwentyCRM source.
3. Update compose/build references to point at the external checkout path.
4. Retain this directory as a compatibility marker until all environments are migrated.

## Runtime helper scripts

- `scripts/twenty/clone.sh`
- `scripts/twenty/run.sh`
- `scripts/twenty/custom-objects.md`

Do not remove this marker until all Oracle and dev stack compose references are migrated and validated.
