# Next Agent Handoff — Project Nyra Prompt Package v3

Start from repo root.

## Execution status

The 00-07 non-UI sequence described by this handoff has already been
executed/reconciled into the active repo. Current status is tracked in
`conductor/tracks/omni_prompting_pack_v3_zdrive_20260526/`,
`conductor/tracks.md`, and `docs/CONDUCTOR_TASKS.md`. Treat this file as
preserved provenance, not as a live launch queue.

## Critical context

This is a non-UI pass. Do not touch UI/theme/components. RateHunter/ProjectNyra/Nyra Webapp design prompts exist but are intentionally separate.

The main correction is that the current intended stack is broader than earlier summaries. It now includes local Supabase, Activepieces-first workflow builder, optional constrained n8n fallback, Letta as orchestrator/memory manager, OpenClaw/NerveUI on workers, Gastown/Clawteam/Composio, memorytensor/memOS, mem0+Qdrant, Mempalace, ClaudeMem, OpenMemory MCP, Letta MCP, vLLM/LMCache/Redis on 5090/3090Ti, Ollama on 3060, Gitea/Gitea MCP/Tea CLI, Infisical sidecars, Docker contexts, Portainer, Syncthing, Kyutai Unmute mesh, bitnet.cpp, PocketTTS, and the observability stack.

## Do not miss

- Activepieces is primary; n8n is fallback.
- Tea is CLI, not MCP.
- Gitea MCP is separate.
- TwentyCRM is system-of-record and separate.
- Supabase local provides webapp backend/auth.
- Quote/rate logic must be service-backed.
- STOP/DNC blocks everything outbound.
- No local secrets on every host; Infisical sidecars + Docker contexts.
- Host compose stacks under `/infra/hosts/<host>`.
