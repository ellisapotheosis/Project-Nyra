# ClawTeam Build & Deployment Guide

**Status:** Alpha (Private Registry)  
**Date:** 2026-08-29

---

## Current Challenge

ClawTeam image `ghcr.io/claw-ai/clawteam:latest` is in a private registry that requires authentication.

**Error:** `error from registry: denied`

---

## Solution Options

### Option A: Build from Source (Recommended if repo public)

```bash
# Clone ClawTeam repo
git clone https://github.com/claw-ai/clawteam.git
cd clawteam

# Build Docker image locally
docker build -t projectnyra/clawteam:latest .

# Tag for local registry
docker tag projectnyra/clawteam:latest projectnyra-clawteam:latest
```

### Option B: Private Registry Authentication

If source unavailable, configure Docker credentials for private registry:

```bash
# 1. Create/update docker config
mkdir -p ~/.docker
cat > ~/.docker/config.json <<EOF
{
  "auths": {
    "ghcr.io": {
      "auth": "$(echo -n 'USERNAME:GITHUB_PAT' | base64)"
    }
  }
}
EOF

# 2. Retry pull
docker pull ghcr.io/claw-ai/clawteam:latest

# 3. Tag for local use
docker tag ghcr.io/claw-ai/clawteam:latest projectnyra/clawteam:latest
```

### Option C: Use Open-Source Alternatives

If ClawTeam unavailable, substitute with open-source multi-agent frameworks:

- **Ollama** (local, multi-model)
- **Letta** (agent framework, already deployed)
- **OpenClaw** (already deployed)
- **Swarm** (OpenAI, simple choreography)

---

## ClawTeam Functionality

ClawTeam provides:

- **Multi-agent coordination** (spawn N agents per task)
- **Deadlock detection** (timeout-based resolution)
- **Handoff protocol** (agent-to-agent task passing)
- **Structured output** (JSON schemas)
- **Error recovery** (configurable retries)

---

## Deployment Path

### 1. Get ClawTeam Image

**Action Required:**

- Contact claw-ai team for registry access OR
- Build from public source repo OR
- Use open-source alternative (Letta + OpenClaw combo)

### 2. Configure Compose

```yaml
# infra/hosts/orchestrator/docker-compose.clawteam.yml

services:
  clawteam:
    image: projectnyra/clawteam:latest
    container_name: nyra-clawteam-primary
    environment:
      CLAWTEAM_ROLE: primary
      WORKER_NODES: ["worker-rtx5090", "worker-rtx3090ti", "worker-rtx3060"]
      LITELLM_URL: http://nyra-litellm:4000/v1
    ports:
      - "8085:8085"
    networks:
      - nyra-network
```

### 3. Test Deployment

```bash
# Check health
curl http://clawteam.projectnyra.com/health

# List active teams
curl http://clawteam.projectnyra.com/v1/teams

# Spawn test agent team
curl -X POST http://clawteam.projectnyra.com/team \
  -d '{"task_id": "test-1", "agents": 3}'
```

---

## Current State

| Component          | Status            | Location                                               |
| ------------------ | ----------------- | ------------------------------------------------------ |
| Compose file       | ✓ Ready           | `infra/hosts/orchestrator/docker-compose.clawteam.yml` |
| Cloudflare routing | ✓ Configured      | `clawteam.projectnyra.com`                             |
| Image              | ✗ Registry denied | Private (needs auth)                                   |
| Testing            | ⏳ Blocked        | Cannot deploy without image                            |

---

## Action Items

- [ ] Obtain ClawTeam image (build or registry auth)
- [ ] Test multi-agent spawning
- [ ] Configure deadlock detection timeouts
- [ ] Validate handoff protocol
- [ ] Document team task API

---

## Fallback: Letta + OpenClaw

If ClawTeam unavailable long-term, use existing Letta + OpenClaw:

```python
# Multi-agent orchestration without ClawTeam
import asyncio
from letta import LocalClient

async def spawn_agent_team(task, num_agents=3):
    agents = []
    for i in range(num_agents):
        agent = LocalClient.create_agent()
        agents.append(agent)

    # Distribute task across agents
    results = await asyncio.gather(*[
        agent.chat(task) for agent in agents
    ])
    return results
```

**Status:** Deployable now without ClawTeam dependency.

---

**Next Step:** Request ClawTeam image access or confirm fallback to Letta-based orchestration.
