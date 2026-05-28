# VOICE_MESH_RUNBOOK

Last updated: 2026-05-24

## Overview

Project Nyra uses Kyutai Unmute for voice processing. Two deployment modes exist:
**standalone** (each worker runs its own full stack) and **distributed** (STT, TTS, and
LLM split across three workers for lower latency). PocketTTS on orchestrator serves as
a fallback TTS when workers are unavailable.

---

## Standalone Mode

Each worker runs `docker-compose.voice.yml` independently. All three components
(STT, TTS, LLM) run on the same GPU host.

| Host             | Compose File             | GPU         | Notes                                |
| ---------------- | ------------------------ | ----------- | ------------------------------------ |
| worker-rtx5090   | docker-compose.voice.yml | RTX 5090    | Best quality; highest VRAM           |
| worker-rtx3090ti | docker-compose.voice.yml | RTX 3090 Ti | Good quality                         |
| worker-rtx3060   | docker-compose.voice.yml | RTX 3060    | Constrained; use only if others down |

### Deploy Standalone

```bash
# On target worker host (via Docker context from orchestrator)
docker --context worker-5090 compose \
  -f docker-compose.voice.yml up -d
```

---

## Distributed Mode

Splits the pipeline across three workers to reduce per-GPU VRAM pressure and achieve
target end-to-end latency of ~300–400 ms.

| Component            | Host             | Role                                       |
| -------------------- | ---------------- | ------------------------------------------ |
| STT (speech-to-text) | worker-rtx3060   | Receives audio; returns transcript         |
| TTS (text-to-speech) | worker-rtx3090ti | Receives text; returns audio stream        |
| LLM (response gen)   | worker-rtx5090   | Receives transcript; returns response text |

### Startup Sequence (Distributed)

1. Start STT on worker-rtx3060:
   ```bash
   docker --context worker-3060 compose \
     -f docker-compose.voice.yml up -d unmute-stt
   ```
2. Start LLM backend on worker-rtx5090 (vLLM must already be running):
   ```bash
   # vLLM is part of the main docker-compose.yml — confirm it is up
   docker --context worker-5090 compose ps vllm
   ```
3. Start TTS on worker-rtx3090ti:
   ```bash
   docker --context worker-3090ti compose \
     -f docker-compose.voice.yml up -d unmute-tts
   ```
4. Configure the Unmute coordinator (on oracle-vps or orchestrator) with the three
   endpoint URLs over Tailscale:
   - STT: `http://100.64.0.5:<stt-port>`
   - TTS: `http://100.64.0.6:<tts-port>`
   - LLM: `http://100.64.0.7:8000` (vLLM)

### Expected Latency

- STT transcription: ~80–120 ms
- LLM first token: ~100–150 ms
- TTS synthesis: ~80–120 ms
- Total end-to-end: ~300–400 ms

---

## Failover to Standalone

If distributed mode degrades (any worker offline):

1. Check which worker is down: `docker --context <host> compose ps`
2. If STT or TTS worker is down, fall back to standalone on worker-rtx5090:
   ```bash
   docker --context worker-5090 compose \
     -f docker-compose.voice.yml up -d
   ```
3. Update the Unmute coordinator to point to the standalone endpoint.
4. Alert fires as `worker-offline` in Grafana; resolve the downed worker.

---

## PocketTTS Fallback (Orchestrator)

PocketTTS runs on orchestrator as a lightweight TTS fallback for non-real-time voice
output (notifications, status reads, non-borrower-facing synthesis).

| Service    | Host         | Port | Compose                  |
| ---------- | ------------ | ---- | ------------------------ |
| pocket-tts | orchestrator | 5002 | docker-compose.voice.yml |

Deploy:

```bash
docker --context orchestrator compose \
  -f docker-compose.voice.yml up -d orchestrator-pocket-tts
```

---

## Borrower-Facing Voice Rules

Any voice interaction that affects a borrower:

1. Transcript must be captured and stored.
2. Proposed action derived from voice must be logged with agent identity.
3. Operationally impactful actions (STOP, rate lock, application submit) require human
   approval before execution.
4. Audit event must be written to Letta memory and TwentyCRM.
5. STOP intents must be actioned within 60 seconds or `STOP-not-processed` alert fires.
