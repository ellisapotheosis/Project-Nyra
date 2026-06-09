# KYUTAI_UNMUTE_MESH.md

Last updated: 2026-05-24

## Overview

Kyutai Unmute provides voice capability for Project Nyra. Two deployment configurations are
supported: standalone (self-contained per worker) and distributed (split across all three workers
via Tailscale mesh). PocketTTS on the orchestrator is available as a local TTS fallback.

---

## Configuration 1: Standalone

Each worker runs a complete Unmute instance via `docker-compose.voice.yml`. STT, LLM, and TTS
all run on the same worker — fully self-contained.

| Worker    | Compose file             | Notes                             |
| --------- | ------------------------ | --------------------------------- |
| rtx5090   | docker-compose.voice.yml | Full standalone instance          |
| rtx3090ti | docker-compose.voice.yml | Full standalone instance          |
| rtx3060   | docker-compose.voice.yml | Full standalone; VRAM-constrained |

Use standalone when low latency on a single worker is acceptable and VRAM is sufficient to run
all three pipeline components simultaneously. On rtx3060, OpenClaw/NerveUI tasks take priority
over voice if VRAM is constrained — voice is deferred or rerouted.

---

## Configuration 2: Distributed Mesh

The distributed configuration splits the pipeline across all three workers using
`docker-compose.distributed-voice.yml`, deployed on each worker simultaneously. Workers
communicate over the Tailscale mesh.

| Component | Worker    | Tailscale IP | Role                         |
| --------- | --------- | ------------ | ---------------------------- |
| STT       | rtx3060   | 100.64.0.5   | Speech-to-text transcription |
| TTS       | rtx3090ti | 100.64.0.6   | Text-to-speech synthesis     |
| LLM       | rtx5090   | 100.64.0.7   | Language model response gen  |

Expected end-to-end latency: 300–400 ms under normal Tailscale mesh conditions.

### Distributed Deployment

```bash
# Deploy on all three workers simultaneously from orchestrator
for host in 100.64.0.5 100.64.0.6 100.64.0.7; do
  ssh $host "cd ~/nyra && docker compose -f docker-compose.distributed-voice.yml up -d" &
done
wait
```

All three workers must be online before starting a distributed voice deployment. A partial
deployment (only one or two workers up) does not produce a functional pipeline — fall back to
standalone instead.

### Mesh Requirements

- Tailscale must be active on all three workers.
- STT node (rtx3060) must be reachable from TTS (rtx3090ti) and LLM (rtx5090) nodes.
- Do not run both `docker-compose.voice.yml` and `docker-compose.distributed-voice.yml` on the
  same worker simultaneously.

---

## PocketTTS Fallback

| Property | Value                                             |
| -------- | ------------------------------------------------- |
| Host     | orchestrator                                      |
| Role     | Local TTS fallback when Unmute TTS unavailable    |
| Trigger  | Automatic when rtx3090ti TTS component is offline |

PocketTTS handles TTS-only fallback scenarios such as short broker notifications and alert
readouts. It does not replace Unmute for full voice sessions.

---

## Voice Session Lifecycle

```
1. capture
     └─ audio captured via worker mic input or OpenClaw session API

2. STT
     ├─ standalone: local Unmute STT on same worker
     └─ distributed: forward audio to rtx3060 (100.64.0.5) STT component

3. LLM response
     ├─ standalone: local Unmute LLM on same worker
     └─ distributed: forward transcription to rtx5090 (100.64.0.7) LLM component

4. human approval gate  (borrower-facing actions only)
     └─ LLM proposes action → operator approves/rejects via NerveUI before TTS output

5. TTS
     ├─ standalone: local Unmute TTS on same worker
     ├─ distributed: forward response to rtx3090ti (100.64.0.6) TTS component
     └─ fallback: PocketTTS on orchestrator if TTS component unavailable

6. output
     └─ audio returned to session and played via worker audio output

7. audit + memory write
     └─ voice session event written with source_event_id, worker assignment, latency_ms,
        and configuration (standalone | distributed)
```

---

## Failover Logic

1. Distributed mesh is preferred when all three workers are online.
2. If any distributed node is offline: fall back to standalone on the nearest available worker.
3. If the standalone worker is also offline: PocketTTS handles TTS only; STT and LLM are
   unavailable until a worker comes online.
4. VRAM contention on rtx3060: OpenClaw/NerveUI tasks take priority; voice STT is deferred or
   rerouted to another available worker.

---

## OpenClaw/NerveUI Voice Control

Each worker's NerveUI exposes a voice control panel:

- Start/stop voice session for this worker
- Active voice session status and latency metrics
- STT/TTS/LLM component health indicators
- Manual failover trigger to standalone or PocketTTS mode

OpenClaw session APIs for programmatic voice control per worker:

- `POST /sessions/{session_id}/voice/start`
- `POST /sessions/{session_id}/voice/stop`

All voice session events must include `latency_ms` and `configuration` in the audit payload.
