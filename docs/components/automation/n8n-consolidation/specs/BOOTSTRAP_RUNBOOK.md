# BOOTSTRAP RUNBOOK

## Zero-to-running

```bash
cp infra/.env.example .env
# fill placeholders only
make up
make health
```

## Optional env scan and port review

```bash
make scan-env
make ports
```

## STOP compliance check

- Ensure STOP detector workflow is imported:
  - `workflows/n8n/lead_ingest_drip_stop.json`
  - `workflows/activepieces/lead_ingest_drip_stop.json`

## Verify commands

```bash
bash scripts/verify-stack.sh infra/.env.example
```
