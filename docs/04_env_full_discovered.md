# 04 Full Environment Discovered

This file summarizes scan output. Full key-level source mapping is in `docs/env/ENV_INVENTORY.md`.

## Scan scope
- `apps/**`
- `services/**`
- `infra/**`
- `packages/**`

Excluded noise directories: `node_modules`, `.git`, `dist`, `build`, `.next`, `coverage`, virtualenv folders.

## Result
- Total discovered env keys: **476** (see `docs/env/ENV_INVENTORY.md`).
- Missing from `.env.example` templates: **266** (see `docs/env/MISSING_ENV.md`).

## High-value discovered categories
- Cloudflare/tunnels: `CF_*`, `CLOUDFLARE_*`
- Core data: `POSTGRES_*`, `REDIS_*`, `MONGO_*`
- Routing: `NEXUS_*`, `LITELLM_*`, `WORKER_*`
- Workflow: `N8N_*`, `ACTIVEPIECES_*`
- Voice mode: `KYUTAI_*`

## How to verify
```bash
python scripts/generate-env-docs.py
sed -n '1,25p' docs/env/ENV_INVENTORY.md
sed -n '1,25p' docs/env/MISSING_ENV.md
```
