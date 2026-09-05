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

## orchestrator is the memory-manager host, not a control plane

BitNet is no longer a side experiment. orchestrator (`100.64.0.10`) now serves
two production CPU workloads out of the **root `compose.yaml` `orchestrator`
profile**:

```text
embeddings      llama.cpp, nomic-embed-text-v1.5, 768 dims   100.64.0.10:8081
memory-manager  bitnet.cpp, BitNet b1.58 2B-4T               100.64.0.10:8087
```

`infra/hosts/orchestrator/docker-compose.bitnet.yml` has been **removed** — it
was superseded by that profile, and two deployment surfaces for one service is
the defect this file exists to prevent. The build context it used,
`infra/hosts/orchestrator/bitnet/`, is retained and is what the profile builds.

This still does **not** make orchestrator the canonical Nexus or LiteLLM host.
Both services are unauthenticated Tailnet-only origins that the canonical
oracle-vps LiteLLM consumes as ordinary `model_list` entries, exactly like the
vLLM workers. `infra/hosts/orchestrator/docker-compose.litellm.yml` and
`infra/hosts/orchestrator/litellm/config.yaml` — a second, dead LiteLLM control
plane that declared itself "PRIMARY" — have been deleted.
