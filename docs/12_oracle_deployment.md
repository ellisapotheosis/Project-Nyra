# 12 Oracle Deployment

## Compose artifact
- `infra/oracle/compose.oracle.yml` provides Oracle-target stack wiring.

## OCI baseline
- VM shape: CPU RAM sufficient for orchestration workloads (no heavy GPU inference).
- Open only 80/443 publicly via Cloudflare tunnel; deny DB ports in security lists.

## Migration commands (example)
```bash
# export from source
pg_dump -h <src-host> -U <user> -d nyra -Fc -f nyra.dump
# import on oracle host
pg_restore -h localhost -U <user> -d nyra --clean --if-exists nyra.dump
```

## How to verify
```bash
docker compose -f infra/oracle/compose.oracle.yml config
```
