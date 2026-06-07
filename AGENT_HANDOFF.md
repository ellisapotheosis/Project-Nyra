# Agent Handoff: Project Nyra AI Cluster Setup

## Context

You are picking up the orchestration and setup of the Project Nyra local AI cluster, which spans across three worker nodes (`worker-rtx3090ti`, `worker-rtx3060`, and `worker-rtx5090`) controlled via SSH and Docker contexts.

The primary goal is to stand up vLLM, OpenClaw, LiteLLM, and NerveUI across these nodes and configure Letta as the orchestrator.

## Current State

### `worker-rtx3090ti` (24GB VRAM)

- **Status:** Mostly healthy.
- **vLLM:** Running successfully with `IlyaGusev/gemma-2-9b-it-abliterated` and LMCache.
- **Model Switcher:** Implemented and functional. It uses a python script to swap models by rewriting the Docker Compose file and restarting via the Docker socket.
- **Pending/Verify:** Ensure OpenClaw and Nerve UI are fully connected and stable.

### `worker-rtx3060` (6GB VRAM)

- **Status:** Partially configured.
- **Setup:** Restricted to Ollama + PicoClaw (no vLLM due to 6GB limit).
- **Pending/Verify:** OpenClaw container restarted successfully earlier, but you need to verify if PicoClaw and LiteLLM are fully operational and responding to requests.

### `worker-rtx5090` (24GB VRAM)

- **Status:** vLLM is finally stable. Other services failing to pull/start via Makefile due to network/Docker hub EOF errors.
- **vLLM:** Running `Qwen/Qwen2.5-32B-Instruct-AWQ`. We had severe OOM issues. **Fix applied:** `gpu-memory-utilization` is set to `0.88` and `max-model-len` is reduced to `2048`. This fits precisely into the 24GB VRAM alongside the Windows Desktop Manager reservation. _Do not increase these values._
- **Other Services:** `make worker-5090-ai-up` keeps failing with an `EOF` error while pulling `alpine:3.20` or `infisical/cli:latest`.
- **Pending:**
  1. Fix the Docker pull network issue on the 5090 node (likely an MTU, DNS, or transient Docker Hub issue over Tailscale/SSH).
  2. Stand up LiteLLM, OpenClaw, and Nerve UI on this node.

### Global / Cluster

- **Letta:** The orchestrator (Letta) needs to be configured to route requests over all three workers via their respective LiteLLM endpoints. The `llxprt-bridge` has been brought up to support this.

## Next Steps for You

1. **Fix the 5090 Docker Pulls:** Investigate why `make worker-5090-ai-up` fails with `EOF` when pulling images. You may need to manually pull the images (`alpine:3.20`, `infisical/cli:latest`, etc.) with retries or check the docker daemon network settings on `5090-wsl`.
2. **Complete 5090 Setup:** Once images can pull, get OpenClaw, LiteLLM, and NerveUI running on `worker-rtx5090`.
3. **Verify 3060 and 3090ti:** Double-check that all required services (PicoClaw/Ollama on 3060, OpenClaw/LiteLLM on 3090ti) are up and reachable.
4. **Configure Letta:** Set up Letta to orchestrate across all three nodes using LiteLLM.

## Notes

- Do not change the 5090 vLLM memory parameters (`gpu-memory-utilization: 0.88`, `max-model-len: 2048`); it is at the absolute limit of the VRAM.
- Use `docker --context worker-rtx<node>` to interact with the nodes.
- The project is located in `/home/ellisapotheosis/repos/project-nyra`.
