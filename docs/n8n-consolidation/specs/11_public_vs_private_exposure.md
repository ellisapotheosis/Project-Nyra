# 11 Public vs Private Exposure Matrix

## Public (only through Cloudflared + Access)

- n8n
- activepieces
- twentycrm
- litellm
- nexus-router
- grafana
- gitea
- infisical

## Private-only (no public DNS, no cloudflared ingress)

- postgres
- redis
- mongo
- ruvector
- ruvector-postgres
- gitea-db
- infisical-db
- infisical-redis
- worker-local ollama/vllm backends

## Rules enforced in this recovery

1. Datastore services default to `Exposure=private` in ports registry.
2. Datastore services must have blank `Proposed hostname`.
3. Datastore services must have no ingress snippets.
4. Any exception requires explicit Access-gated TCP design documentation.

## Outcome

Current cloudflared config includes HTTP(S) apps only and ends with catch-all 404.

## Verification commands
```bash
python infra/scripts/check-port-collisions.py
```

```bash
rg -n "hostname:|service:" infra/cloudflared/config.yml
```

## Enforcement recommendation
- Add CI assertion that rejects ingress entries containing datastore service names.
- Add CI assertion that proposed datastore hostnames are blank in ports registry generator.
