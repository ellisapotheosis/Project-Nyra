# OpenClaw — worker-rtx3090ti

OpenClaw gateway with `@falkordb/openclaw-mem0` plugin (open-source mode).
FalkorDB graph memory lives on Oracle VPS; LiteLLM on the orchestrator handles all model calls.

## Prerequisites

- Node.js 20+
- Tailscale connected (needs Tailscale access to Oracle VPS and Orchestrator)
- LITELLM_API_KEY (same key used across the cluster)

## Install

```bash
npm install -g openclaw@latest
openclaw plugins install @falkordb/openclaw-mem0
```

## Deploy config

Replace the placeholder values, then copy the config:

```bash
# Fill in real values first:
#   REPLACE_WITH_LITELLM_API_KEY     → your LiteLLM API key
#   REPLACE_WITH_ORCHESTRATOR_TAILSCALE_IP  → orchestrator node Tailscale IP (port 4000)
#   REPLACE_WITH_ORACLE_TAILSCALE_IP        → Oracle VPS Tailscale IP (port 6380)

cp openclaw.json ~/.openclaw/openclaw.json
```

## Network topology

| Dependency | Where it runs | Port |
|------------|--------------|------|
| FalkorDB   | Oracle VPS   | 6380 (external) → 6379 (internal Docker) |
| LiteLLM    | Orchestrator | 4000 |
| openclaw   | This worker  | 18789 |

FalkorDB is exposed on Oracle at port **6380** to avoid collision with Redis (6379).
All model calls (embeddings + LLM) route through LiteLLM on the orchestrator over Tailscale.

## Run

```bash
openclaw gateway --port 18789
```

The gateway starts and serves the MCP/OpenAI-compatible endpoint on port 18789.

## Notes

- `userId: "nyra"` — shared namespace across both GPU workers so memory is shared
- `vectorStore: memory` — in-process vector store (no external vector DB needed)
- `graphStore: falkordb` — persistent graph memory on Oracle, survives restarts
- `enableGraph: true` — enables entity/relationship extraction into the graph
