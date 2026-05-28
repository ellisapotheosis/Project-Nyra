# Nyra Omni Prompting Pack v3

This package consolidates Project Nyra prompting into non-UI, Codex-ready snippets and stack maps.

## What changed in v3

- Corrected the current intended stack to include Supabase local backend/auth, Activepieces-first campaign builder, n8n constrained fallback, Letta orchestration, OpenClaw/NerveUI per worker, Gastown, Clawteam, Composio, memorytensor/memOS, ClaudeMem, Letta MCP, extra memory MCP placeholder, worker vLLM/LMCache/Redis, Ollama worker, Gitea/Gitea MCP/Tea CLI, Infisical sidecars, Docker contexts, Kyutai Unmute mesh, bitnet.cpp, PocketTTS, Portainer, Syncthing, Vaultwarden, Linkwarden, and observability.
- Preserved UI/theme/design as a separate quarantine.
- Added least-snippet Codex prompt set for agents.

## Execution status

The 00-07 non-UI prompting sequence has been executed/reconciled into the
active repo and is tracked in `conductor/tracks/omni_prompting_pack_v3_zdrive_20260526/`.
Do not rerun this raw pack as a fresh queue unless a new Conductor track
explicitly reopens it. Broader UI/theme work remains quarantined for a
dedicated UI pass.

## Folder overview

```txt
nyra_omni_prompting_pack_v3/
├─ README.md
├─ 00_ENV_VARS_AND_SECRETS.md
├─ 01_MASTER_PROJECT_CONTEXT_AND_STACK_TRUTH.md
├─ 02_CANONICAL_ARCHITECTURE_DECISIONS.md
├─ 03_AGENT_PROMPTS/
├─ 04_STACK_MAPS/
├─ 05_TODOS/
├─ 06_HANDOFF/
└─ 07_UI_SEPARATE_HOLD/
```
