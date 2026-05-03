# 07 Archived Audit

Updated: 2026-04-27

## Archive policy

Root numbered docs should describe active runtime state only. Archive, recovery, and ingestion folders are not authoritative for current deployment.

Non-active scopes:

```text
docs/archive/**
infra/cleanup_archive/**
infra/ingest/**
data/app-guidance/**
data/project-requirements/**
```

## Current audit result

- Active compose ownership has moved to `infra/hosts/<host-name>/`.
- Root numbered docs now use `infra/hosts/*` and `Makefile` as the evidence base.
- Legacy root paths such as `infra/docker-compose.yml`, `infra/oracle/*`, and `infra/workers/*` should not be reintroduced into root numbered docs unless those files are restored as active Makefile targets.
- Archived files containing removed stack components were deleted during the cleanup pass.

## What is active

| Evidence class | Active source |
|---|---|
| Compose paths | `Makefile` variables ending in `_COMPOSE` |
| Host placement | `infra/hosts/*/docker-compose*.yml` |
| CI/CD placement | `infra/hosts/oracle-vps/docker-compose.gitea.yml` |
| Edge hostnames | `infra/hosts/oracle-vps/cloudflared-config.yml` and Cloudflare dashboard-managed tunnel settings |
| BitNet fallback | `infra/hosts/orchestrator/docker-compose.bitnet.yml` |

## Review rule

Before adding a service to a root numbered doc:

1. Confirm the service exists in `infra/hosts/*/docker-compose*.yml`.
2. Confirm whether a Makefile target starts or validates that compose path.
3. Confirm whether the service is public, Access-gated, private, or profile-gated.
4. Do not treat archive or reference files as active deployment evidence.

## Evidence commands

```bash
find infra/hosts -maxdepth 2 -name 'docker-compose*.yml' | sort
rg -n "^[A-Z0-9_]+_COMPOSE|docker compose -f|docker --context" Makefile
rg -n "hostname:|service:" infra/hosts/oracle-vps/cloudflared-config.yml
```
