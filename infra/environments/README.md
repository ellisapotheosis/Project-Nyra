# Infra Environments

Canonical location for environment templates and migration artifacts.

## Structure

- `templates/root/`
  - Shared repo-level template files (`.env.template`, `.env.stack.example`, etc.).
- `templates/hosts/<hostname>/`
  - Host-scoped templates migrated from repo root during infra consolidation.
- `legacy-root-compose/`
  - Root-level compose files moved out of `/` so active runtime paths stay under `infra/hosts/*`.

## Policy

1. Active runtime compose files should live in `infra/hosts/<host>/`.
2. Secrets should not be committed; templates only.
3. If a host has a runtime `.env` file, keep it with that host folder.
4. Keep historical files here until they are either deleted or merged into a host stack.
