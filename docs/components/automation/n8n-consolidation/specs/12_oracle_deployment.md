# 12 Oracle Deployment (Canonical Snapshot)

## Primary compose

- `infra/oracle/docker-compose.oracle.yml`

## Services observed

- `twenty` (CRM)
- `activepieces` (automation)
- `n8n` (workflow)
- `moltbot` (voice)
- `quote-api` (service API)
- state stores: postgres / redis / mongo / meilisearch / neo4j

## Placement rationale

Oracle node is intended for stable, always-on control-plane and business-facing services with durable state.

## Exposure model

- App UIs/APIs can be Access-gated through Cloudflared.
- Datastores remain private/internal only.
- Media and low-level ports should stay private unless explicitly required.

## Verification commands

```bash
docker compose -f infra/oracle/docker-compose.oracle.yml config
make health-oracle
```

## Preflight checklist

- [ ] env file prepared with non-placeholder secrets
- [ ] durable storage paths mounted and backed up
- [ ] private firewall rules enforced for datastore ports
- [ ] cloudflared hostnames mapped only for approved app/API services

## Post-deploy checklist

- [ ] `docker compose ps` healthy state
- [ ] app/API endpoints pass smoke checks
- [ ] datastore endpoints inaccessible from public internet
