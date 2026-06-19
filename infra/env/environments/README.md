# Environment Profiles (Compatibility Layer)

This folder contains top-level deployment-mode profiles (`development`, `staging`, `production`, `oracle-vps`).

## Canonical host/service env templates

- `infra/env/*` is the canonical location for infra service and host-level `.env` templates.

## Intended use

- Keep this folder only for mode-based environment profiles that are consumed by app/service tooling.
- Keep host-specific infra env templates in `infra/env/*`.

## Drift prevention

When adding or changing shared variables:

1. Update `infra/env/.env.template` first.
2. Propagate to mode-specific files in `environments/*` only where needed.
