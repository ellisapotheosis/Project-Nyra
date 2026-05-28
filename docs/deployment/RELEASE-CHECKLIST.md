# Project Nyra Release Checklist

## 1. Pre-Release

- [ ] All code merged to `main`.
- [ ] `pnpm build` passes for all apps/services.
- [ ] `pnpm test` passes for all packages.
- [ ] Secrets updated in Infisical (Machine Identity).
- [ ] `.env.example` files up to date.

## 2. Infrastructure

- [ ] Tailscale mesh active on all nodes.
- [ ] Cloudflare Tunnel running on `orchestrator`.
- [ ] Postgres/Supabase migrations applied.
- [ ] Docker images built and pushed to registry.

## 3. Validation

- [ ] Run `scripts/smoke-full.sh`.
- [ ] Verify `https://api.ratehunter.net/health`.
- [ ] Verify `https://crm.ratehunter.net/api/health`.
- [ ] Manually test Lead Ingestion from RateHunter form.

## 4. Rollback Plan

- [ ] Stop new containers: `docker compose down`.
- [ ] Revert to previous image tag.
- [ ] Restore DB backup if migrations failed.
- [ ] Flush Redis cache.

## 5. Post-Release

- [ ] Verify Grafana dashboard metrics.
- [ ] Monitor `audit_events` for errors.
- [ ] Notify team of successful deployment.
