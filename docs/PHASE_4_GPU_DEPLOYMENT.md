# Phase 4: GPU Worker Deployment (Manual SSH Required)

**Status:** Ready for deployment  
**Date:** 2026-08-30  
**Prerequisites:** SSH access to all 3 workers + .env files configured

## Quick Start

Each worker already has docker-compose.yml with liteLLM defined. SSH to each worker and run:

```bash
ssh
cd /home/ellisapotheosis/repos/project-nyra/infra/hosts/
docker-compose -f docker-compose.yml -f docker-compose.litellm.yml up -d
docker-compose logs -f litellm

# worker-rtx3090ti (vLLM + LiteLLM)
ssh worker-rtx3090ti
cd /home/ellisapotheosis/repos/project-nyra/infra/hosts/worker-rtx3090ti
docker-compose -f docker-compose.yml -f docker-compose.litellm.yml up -d
docker-compose logs -f litellm

# worker-rtx5090 (Primary vLLM + LiteLLM)
ssh worker-rtx5090
cd /home/ellisapotheosis/repos/project-nyra/infra/hosts/worker-rtx5090
docker-compose -f docker-compose.yml -f docker-compose.litellm.yml up -d
docker-compose logs -f litellm
```

## Deployment Details

### Worker Configuration

| Worker           | GPU                | Role             | Port | Model                    |
| ---------------- | ------------------ | ---------------- | ---- | ------------------------ |
| worker-rtx3090ti | RTX 3090 Ti (24GB) | vLLM inference   | 4010 | Medium-large models      |
| worker-rtx5090   | RTX 5090 (32GB)    | Primary vLLM     | 4010 | Large models (canonical) |

### Prerequisites Checklist

- [ ] SSH keys configured for worker access
- [ ] `.env` files present in `infra/hosts/worker-*/`
- [ ] Docker + docker-compose installed on each worker
- [ ] Network connectivity between workers and orchestrator (Tailscale)
- [ ] Sufficient disk space for model caches (`/models` volumes)

### Verification After Deployment

```bash
# From orchestrator or any Tailscale peer:
curl -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  http://litellm.projectnyra.com/v1/models

# Should return models from all 3 workers aggregated by orchestrator liteLLM
```

### Architecture

```
┌─────────────────────────────────────────┐
│  Orchestrator: LiteLLM (Primary Router) │
│  - Port 4010 (Tailscale)                 │
│  - Aggregates model availability        │
│  - Routes to worker instances           │
└─────────────────┬───────────────────────┘
                  │ Tailscale Mesh
        ┌─────────┼─────────┬──────────────┐
        │         │         │              │
    ┌───▼────┐ ┌─▼────┐ ┌──▼──────┐ ┌────▼─────┐
    │worker- │ │worker│ │worker-  │ │Supabase/ │
    │3060    │ │3090ti│ │5090     │ │Memory    │
    │Ollama  │ │vLLM  │ │vLLM     │ │Stack     │
    │Port410 │ │Port41│ │Port4010 │ │(Oracle)  │
    └────────┘ └──────┘ └─────────┘ └──────────┘

    Each worker's liteLLM routes requests to local
    inference engine (Ollama or vLLM) running on same host
```

### Troubleshooting

**LiteLLM fails to start:**

```bash
docker-compose logs litellm | grep -i error
# Check LITELLM_MASTER_KEY is set in .env
# Check local inference engine (ollama or vllm) is healthy first
```

**Models not aggregating on orchestrator:**

```bash
# SSH to worker, verify local liteLLM is healthy:
curl http://localhost:4000/health

# Check Tailscale connectivity:
tailscale status | grep worker-

# Verify firewall allows port 4010:
sudo ufw status | grep 4010
```

## Phase 5: Optional — After Workers Ready

Once all 3 workers are running liteLLM:

1. Deploy n8n (workflow automation)
2. Deploy Prometheus + Grafana (observability)
3. Deploy OpenLIT (AI observability)

Run Phase 5 on oracle-vps from `/infra/hosts/oracle-vps/docker-compose.automation.yml`
