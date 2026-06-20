# 03 Env Required

Updated: 2026-04-30

Canonical active-scope environment documentation now lives in:

- [`docs/infra/ENV_CANONICAL.md`](/home/ellisapotheosis/repos/project-nyra/docs/infra/ENV_CANONICAL.md)
- [`docs/env/ENV_INVENTORY.md`](/home/ellisapotheosis/repos/project-nyra/docs/env/ENV_INVENTORY.md)
- [`docs/env/MISSING_ENV.md`](/home/ellisapotheosis/repos/project-nyra/docs/env/MISSING_ENV.md)

Cloudflared-specific setup context now lives in
[`docs/cloudflared/`](/home/ellisapotheosis/repos/project-nyra/docs/cloudflared/README.md).

Required tunnel secret placeholders:

| Variable | Purpose |
|---|---|
| `ORACLE_TUNNEL_TOKEN` | Token-managed Oracle tunnel runner in `infra/hosts/oracle-vps/docker-compose.yml` |
| `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR` | Optional orchestrator tunnel runner |
| `CLOUDFLARE_API_TOKEN` | Optional CLI/API management token; do not commit |

For local-managed YAML, replace `<ORACLE_TUNNEL_UUID>` and
`<WORKER_UI_TUNNEL_UUID>` in `docs/cloudflared/*.yml` and keep credentials JSON
files outside git.
