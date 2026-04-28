# Orchestrator Host

## BitNet CPU LLM

The orchestrator Linux node (`100.64.0.1`, Ryzen 7 6800H, 12 threads, AVX2) runs the CPU-native BitNet service. Use the official Microsoft `BitNet-b1.58-2B-4T-gguf` model with the x86 `i2_s` kernel.

```bash
cd /home/ellisapotheosis/repos/project-nyra/infra/hosts/orchestrator
docker compose -f docker-compose.bitnet.yml up -d --build
curl -fsS http://127.0.0.1:8087/health
```

Default tuning leaves two CPU threads for the rest of the orchestrator:

- `BITNET_THREADS=10`
- `BITNET_CPUS=10`
- `BITNET_CTX_SIZE=2048`

Do not use this container for high-throughput production inference. It is the always-available CPU fallback for lightweight local reasoning, routing, and worker wake/sleep decisions.

## Role

- Primary control-plane and service orchestration host.
- Hosts baseline stack profiles and coordination services.

## Portainer stack inputs

- `infra/docker-compose.yml`
- `infra/compose/overrides/docker-compose.orchestrator.override.yml`
- `infra/env/.env.orchestrator`

## Guardrails

- All compose defaults should remain profile-driven.
- Host bootstrap logic should stay compatible with `make stack-up` and `make bootstrap-ultimate`.
