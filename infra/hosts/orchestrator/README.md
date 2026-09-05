# Orchestrator Host

Tailnet `100.64.0.10`, Windows hostname `MiniApotheosis`. **Measured
2026-09-04:** AMD Ryzen 7 6800H, 8 cores / 16 logical processors, 15.2 GB RAM,
Docker 29.7.2 / Compose v5.5.1 under Docker Desktop on a WSL2 backend
(`Ubuntu-24.04`) whose VM reports 7 GB usable. **No discrete GPU.**

> Earlier revisions of this file said `100.64.0.1` and "12 threads". Both were
> wrong; the numbers above are measured.

Inbound SSH lands in a Windows shell. Anything needing Docker must be re-entered
into WSL: `ssh orchestrator 'wsl -d Ubuntu-24.04 -e bash -lc "<command>"'`.

## Role: memory manager

orchestrator owns the two CPU-bound model workloads that should not compete with
GPU inference on `worker-rtx5090` / `worker-rtx3090ti`:

| Service          | Runtime    | Model                                 | Bind               | LiteLLM alias    |
| ---------------- | ---------- | ------------------------------------- | ------------------ | ---------------- |
| `embeddings`     | llama.cpp  | `nomic-embed-text-v1.5` f16, 768 dims | `100.64.0.10:8081` | `nyra-embedding` |
| `memory-manager` | bitnet.cpp | BitNet b1.58 2B-4T, `i2_s`            | `100.64.0.10:8087` | `nyra-memory`    |

It is **not** a gateway. It runs no LiteLLM and no Nexus; both services are
unauthenticated Tailnet-only origins consumed by the canonical oracle-vps
LiteLLM as ordinary `model_list` entries, exactly like the vLLM workers.

Deploy from the **root** `compose.yaml`, not from a file in this directory:

```bash
./scripts/deploy/deploy-orchestrator.sh
# or, equivalently
make memory-up
make memory-health
```

First start compiles bitnet.cpp from a pinned microsoft/BitNet commit and
downloads ~1.1 GB of weights; allow up to 30 minutes.

Tuning defaults live in `infra/env/orchestrator.env.example` and are sized to the
measured host: `BITNET_THREADS=6`, `BITNET_CPUS=6`, `BITNET_MEM_LIMIT=3g`,
`BITNET_CTX_SIZE=4096`, `EMBEDDINGS_THREADS=4`, `EMBEDDINGS_MEM_LIMIT=2g`. The
retired `docker-compose.bitnet.yml` asked for `mem_limit: 10g` on a 7 GB VM,
which could never be satisfied — do not restore those numbers.

Do not use `memory-manager` for high-throughput or interactive inference. It is
a background consolidation lane and is deliberately absent from every LiteLLM
fallback chain.

## Also here

- Baseline stack profiles and coordination services.

## Portainer stack inputs

- `infra/docker-compose.yml`
- `infra/compose/overrides/docker-compose.orchestrator.override.yml`
- `infra/env/.env.orchestrator`

## Guardrails

- All compose defaults should remain profile-driven.
- Host bootstrap logic should stay compatible with `make stack-up` and `make bootstrap-ultimate`.
