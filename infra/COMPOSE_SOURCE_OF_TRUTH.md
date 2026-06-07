# Compose Source Of Truth

All live Docker Compose stacks for Project Nyra must live under:

```text
infra/hosts/<host-name>/
```

Examples:

```text
infra/hosts/oracle-vps/docker-compose.yml
infra/hosts/orchestrator/docker-compose.yml
infra/hosts/worker-rtx5090/docker-compose.yml
```

Do not use `infra/deploy`, `infra/compose`, `infra/stacks`, `infra/workers`, `infra/homeassistant`, `infra/cleanup_archive`, or `infra/ingest` as live Compose sources. Historical files in those folders must not retain `.yml` or `.yaml` Compose filenames.

Run this check before touching infrastructure:

```bash
bash scripts/infra/assert-compose-source-of-truth.sh
```

Current Nexus/LiteLLM placement:

```text
infra/hosts/oracle-vps/docker-compose.yml
```

The orchestrator may run `docker-compose.bitnet.yml` for CPU BitNet testing, but that does not make orchestrator the canonical Nexus or LiteLLM host.
