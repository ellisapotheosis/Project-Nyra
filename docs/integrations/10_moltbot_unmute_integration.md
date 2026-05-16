# 10 Voice and OpenClaw Integration

Updated: 2026-04-30

## Current state

Voice and assistant/runtime services are optional overlays. They should stay private unless a specific UI/API hostname is Cloudflare Access-gated.

## Known services

| Host | Service | Compose | Port(s) | Target |
|---|---|---|---:|---|
| `orchestrator` | `openclaw-gateway` | `docker-compose.yml` | `8001` | assistant gateway profile |
| `orchestrator` | `pocket-tts` | `docker-compose.voice.yml` | `8080` | local TTS |
| `oracle-vps` | `clawteam` | `docker-compose.clawteam.yml` | `8090 -> 8080` | optional assistant team UI/runtime |
| `worker-rtx3060` | `unmute-standalone` | `docker-compose.voice.yml` | `8098 -> 8080` | standalone voice |
| `worker-rtx3060` | `unmute-stt` | `docker-compose.distributed-voice.yml` | `8081 -> 8080` | distributed STT role |
| `worker-rtx3090ti` | `unmute-standalone` | `docker-compose.voice.yml` | `8098 -> 8080` | standalone voice |
| `worker-rtx3090ti` | `unmute-tts` | `docker-compose.distributed-voice.yml` | `8081 -> 8080` | distributed TTS role |
| `worker-rtx5090` | `unmute-standalone` | `docker-compose.voice.yml` | `8098 -> 8080` | standalone voice |
| `worker-rtx5090` | `unmute-llm` | `docker-compose.distributed-voice.yml` | `8081 -> 8080` | distributed LLM role |
| `worker-rtx3090ti` | `openclaw`, `nerve-ui` | `docker-compose.nerve.yml` | `8001`, `18789` | optional runtime/dashboard |
| `worker-rtx5090` | `openclaw`, `nerve-ui` | `docker-compose.nerve.yml` | `8001`, `18789` | optional runtime/dashboard |

## Cloudflared hostnames

Optional assistant/runtime web surfaces should use the Access-gated hostnames
documented in `docs/cloudflared/hostname-matrix.md`.

Recommended worker UI hostnames:

| Hostname | Origin |
|---|---|
| `openclaw-5090.ratehunter.net` | `worker-rtx5090.trex-fiordland.ts.net:8001` |
| `nerve-5090.ratehunter.net` | `worker-rtx5090.trex-fiordland.ts.net:18789` |
| `openclaw-3090.ratehunter.net` | `worker-rtx3090ti.trex-fiordland.ts.net:8001` |
| `nerve-3090.ratehunter.net` | `worker-rtx3090ti.trex-fiordland.ts.net:18789` |

Keep raw voice/media ports private. Do not publish Unmute transport ports unless
there is a dedicated Access policy and a documented product reason.

## Makefile targets

| Target | Purpose |
|---|---|
| `make voice-3060` | Start standalone voice on RTX 3060 |
| `make voice-3090ti` | Start standalone voice on RTX 3090 Ti |
| `make voice-5090` | Start standalone voice on RTX 5090 |
| `make voice-orch` | Start orchestrator Pocket TTS |
| `make voice-distributed` | Start distributed voice roles across all workers |
| `make nerve-3090ti` / `make nerve-5090` | Start worker runtime/dashboard overlay |
| `make oracle-clawteam` | Start Oracle clawteam overlay |

## Integration stance

- Keep raw voice/media ports private.
- Prefer private mesh routing from app services to voice workers.
- Expose only explicit web UIs or APIs through Cloudflare Access.
- Keep core CRM, quote, and compliance workflows independent from optional voice overlays.

## Validation plan

```bash
docker --context worker-rtx3060 compose -f infra/hosts/worker-rtx3060/docker-compose.voice.yml config
docker --context worker-rtx3090ti compose -f infra/hosts/worker-rtx3090ti/docker-compose.distributed-voice.yml config
docker --context worker-rtx5090 compose -f infra/hosts/worker-rtx5090/docker-compose.nerve.yml config
```

## Rollback plan

Stop optional voice and runtime overlays first. Do not stop Oracle CRM, Gitea CI/CD, quote services, or orchestrator LiteLLM/Nexus to roll back voice experiments.
