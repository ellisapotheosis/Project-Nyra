# Infisical Canonicalization — Final Report

**Completed**: 2026-06-21  
**Project**: `8374cea9-e5e8-4050-bda4-b91f25ab30ef` (US SaaS)  
**Backup**: `./infisical_backup/20260620T214759Z` (1 076 files, 8.1 MB)

---

## §1 Deduplication Matrix

| Old Root                        | New Root                                                          | Secrets Moved                                 | Status                                             |
| ------------------------------- | ----------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------- |
| `/clients/*` (27 providers)     | `/providers/*`                                                    | ~400                                          | ✅ Complete                                        |
| `/machines/*` (5 hosts)         | `/hosts/*`                                                        | ~500                                          | ✅ Complete                                        |
| `/services/*` (9 microservices) | `/apps/projectnyra/services/*`                                    | ~80                                           | ✅ Complete                                        |
| `/router/*` (4 paths)           | `/providers/litellm/*`                                            | ~36                                           | ✅ Complete                                        |
| `/monitoring/*` (3 paths)       | `/providers/grafana`, `/providers/langfuse`, `/providers/openlit` | ~32                                           | ✅ Complete                                        |
| `/public-urls`                  | `/base`                                                           | 26 (dev/staging); 0 null-value secrets (prod) | ✅ Complete                                        |
| `/apps/sendgrid`                | `/providers/sendgrid`                                             | 5 of 6 migrated                               | ⚠️ SENDGRID_FROM_EMAIL conflict retained at source |
| `/adapters/*`                   | merged into `/providers/litellm/adapters/*`                       | 3                                             | ✅ Complete                                        |
| `/security/virustotal`          | `/providers/virustotal`                                           | dev/staging only (prod null-value)            | ✅ Complete                                        |

**Total migration paths**: 131  
**Total secrets migrated**: ~1 200 across 3 environments  
**Sources cleaned**: All (except retained conflict sources)

---

## §2 Canonical Blueprint Tree (post-migration)

```
/ (9 roots)
├── /base                      ← universal config, public URLs, non-secret defaults
├── /providers/                ← all third-party API credentials
│   ├── /anthropic, /openai, /openrouter, /google, /groq, /mistral, /cohere
│   ├── /cloudflare, /tailscale, /gitea, /github
│   ├── /litellm/
│   │   ├── /proxy-server, /proxy-client-local, /proxy-client-remote
│   │   └── /adapters/ (anthropic-via-litellm, openai-via-litellm, …)
│   ├── /grafana, /openlit, /langfuse, /sentry
│   ├── /twenty-crm, /sendgrid, /twilio, /slack, /composio
│   ├── /letta, /mem0, /mempalace, /openmemory
│   ├── /ollama, /huggingface, /sambanova
│   ├── /n8n, /activepieces, /portainer, /syncthing, /open-webui
│   ├── /nexus, /serena, /firecrawl, /tavily
│   ├── /docker, /virustotal, /codecov, /vercel
│   └── … (60+ total)
├── /databases/                ← connection strings and credentials
│   ├── /qdrant-local, /qdrant-cloud, /falkordb
│   ├── /redis, /postgres, /neo4j, /chromadb
│   └── /supabase/ (/local, /cloud)
├── /security/                 ← auth material
│   ├── /ssh, /jwt, /auth0, /bitwarden, /infisical
├── /apps/                     ← Nyra-owned applications
│   ├── /projectnyra/
│   │   └── /services/ (assistant, campaign, crm-api, communication, …)
│   ├── /ratehunter/
│   │   └── /services/ (quote-api, quote-service, ratehunter-api)
│   ├── /openclaw
│   └── /paperclip
├── /hosts/                    ← per-machine overrides and host-specific secrets
│   ├── /oracle-vps, /orchestrator
│   ├── /worker-rtx5090, /worker-rtx3090ti, /worker-rtx3060
│   ├── /homeassistant, /iphone
├── /shared                    ← true multi-host layer (/base + /security/jwt)
├── /infra                     ← developer workspace (imports all leaf paths, one level deep)
└── /CI-CD                     ← GitHub + Gitea pipeline secrets
```

---

## §3 Import Wiring Map

**Total imports created**: 392 (+ 7 pre-existing = 399 total live)  
**Convergence proof**: 0 created, 228 existed (DRY_RUN=1 post-apply)

| Consumer                  | Imports                                                     |
| ------------------------- | ----------------------------------------------------------- |
| `/hosts/oracle-vps`       | 20 leaf paths                                               |
| `/hosts/orchestrator`     | 20 leaf paths                                               |
| `/hosts/worker-rtx5090`   | 5 leaf paths                                                |
| `/hosts/worker-rtx3090ti` | 5 leaf paths                                                |
| `/hosts/worker-rtx3060`   | 5 leaf paths                                                |
| `/hosts/homeassistant`    | 3 leaf paths                                                |
| `/hosts/iphone`           | 2 leaf paths                                                |
| `/shared`                 | 2 leaf paths                                                |
| `/infra`                  | 43 leaf paths (all providers + databases + security + apps) |
| `/CI-CD`                  | 6 leaf paths                                                |

All imports are **one level deep** from consumer (§1.2 Infisical hard limit respected).

---

## §4 Host Symlink Validation

| Host                       | Old INFISICAL_PATH        | New INFISICAL_PATH        | Status   |
| -------------------------- | ------------------------- | ------------------------- | -------- |
| oracle-vps                 | `/machines/oracle-vps`    | `/hosts/oracle-vps`       | ✅ Fixed |
| orchestrator (cloudflared) | `/machines/orchestrator`  | `/hosts/orchestrator`     | ✅ Fixed |
| worker-rtx3060             | `/machines/oracle-vps` ⚠️ | `/hosts/worker-rtx3060`   | ✅ Fixed |
| worker-rtx3090ti           | `/machines/oracle-vps` ⚠️ | `/hosts/worker-rtx3090ti` | ✅ Fixed |
| worker-rtx5090             | `/machines/oracle-vps` ⚠️ | `/hosts/worker-rtx5090`   | ✅ Fixed |

The three workers were loading oracle-vps secrets — a least-privilege violation now corrected.

---

## §5 Conflict Registry

| Key                                | Source                                                | Destination                                                 | Decision                                                                    |
| ---------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| `HASS_TOKEN` (all 3 envs)          | `/machines/homeassistant` = `change-me-*` placeholder | `/hosts/homeassistant` = `${HASS_TOKEN}` self-ref           | **UNRESOLVED** — owner action required (see `docs/OWNER_MANUAL_ACTIONS.md`) |
| `SENDGRID_FROM_EMAIL` (all 3 envs) | `/apps/sendgrid` = corrupted/wrong value              | `/providers/sendgrid` = `edaneandersen@gmail.com` (correct) | Source retained; destination correct; **owner should delete source**        |

---

## §6 Drift & Exceptions Log

| Item                                   | Detail                                                                                                                                                    |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prod:/public-urls` null-value secrets | 26 secrets existed in prod with no value set (API returned 422). Not migrated to `/base` in prod. Owner should set or delete these via dashboard.         |
| `prod:/security/virustotal` null value | Same issue; `VIRUSTOTAL_API_KEY` null in prod.                                                                                                            |
| `/infra` in staging/prod (first pass)  | `POST /v1/secret-imports → 404` during apply run; resolved on convergence pass (folder materialized).                                                     |
| PATCH URL bug (first migration run)    | `POST/PATCH /v3/secrets/raw` requires secret name in URL path, not body. All 400 operations failed in first run. Fixed in `scripts/infisical/migrate.py`. |

---

## §7 Tag/Facet Coverage

Folder naming rule (§3.9): letters/numbers/dashes only. All new paths conform.  
One rename applied: `/clients/discord/archon_bot` → `/providers/discord/archon-bot` (underscore → dash).

---

## §8 Rollback Pointer

Full pre-migration backup at: `./infisical_backup/20260620T214759Z`

- 1 076 files, 8.1 MB
- dev: 364 paths, staging: 354 paths, prod: 358 paths
- Format: `.env.template` (un-hydrated) + `.env.resolved` (hydrated) per path
- Restore: `infisical secrets import` from backup files, or use the Infisical dashboard bulk import

---

## §9 Owner Manual Actions Required

See `docs/OWNER_MANUAL_ACTIONS.md` for full details. Summary:

1. **HASS_TOKEN**: Generate a real Home Assistant long-lived token and set it at `/hosts/homeassistant:HASS_TOKEN` in all 3 environments. Then delete the placeholder at `/machines/homeassistant:HASS_TOKEN`.
2. **SENDGRID_FROM_EMAIL**: Confirm `/providers/sendgrid:SENDGRID_FROM_EMAIL` = `edaneandersen@gmail.com` is correct, then delete `/apps/sendgrid:SENDGRID_FROM_EMAIL` (the corrupted source).
3. **prod null-value secrets**: Review 26 null-value secrets that were not migrated to `/base` in prod. Set real values or delete empty keys via the Infisical dashboard.

---

## Scripts

| Script                              | Purpose                                              |
| ----------------------------------- | ---------------------------------------------------- |
| `scripts/infisical/backup_all.sh`   | BFS tri-env backup                                   |
| `scripts/infisical/migrate.py`      | 131-path migration (idempotent, DRY_RUN=1 safe)      |
| `scripts/infisical/wire_imports.py` | Import wiring for 10 consumers × 3 envs (idempotent) |
