# Kyutai Unmute GPU Mesh

## Files

- `infra/workers/worker-rtx3090ti/docker-compose.kyutai-mesh.yml`: streaming STT and LLM bridge.
- `infra/workers/worker-rtx5090/docker-compose.kyutai-mesh.yml`: session coordinator, streaming TTS, outbound RTP mux.

## LAN Contract

Set these on all three workers:

```bash
RTX3090TI_LAN_IP=192.168.1.39
RTX5090_LAN_IP=192.168.1.50
VOICE_PTP_INTERFACE=eno1
ASSISTANT_GATEWAY_URL=http://orchestrator.lan:3400
LITELLM_BASE_URL=http://orchestrator.lan:4000/v1
MEMORY_BASE_URL=http://oracle-vps.lan:5000
```

## Media Route

1. Phone/WebRTC audio lands on `:${VOICE_RTP_PORT_RANGE:-41000-41199}`.
2. `voice-ingress` normalizes audio to 24 kHz mono PCM, slices 10 ms frames, applies jitter control, and posts voiced frames to `kyutai-vad-codec`.
3. Voiced frames stream over LAN WebSocket to `worker-rtx3090ti:18200`.
4. `kyutai-stt-stream` emits partial hypotheses every 80 ms to `voice-llm-bridge`.
5. `voice-llm-bridge` sends partial and final turn context to the assistant gateway, then forwards response deltas to `worker-rtx5090:18300`.
6. `kyutai-tts-stream` performs speculative low-latency synthesis and emits RTP chunks to the egress mux.
7. `voice-egress-mux` sends the synchronized outbound audio route back through `voice-ingress` signaling on `` so the original call session owns NAT, SSRC, and teardown.

## Sync Rules

- Use PTP on the worker LAN. NTP is acceptable for control-plane logs, not for sub-50 ms audio alignment.
- RTP sequence numbers are owned by `voice-ingress`; TTS chunks carry a monotonic session clock and are remapped before egress.
- Barge-in is coordinated by `voice-session-coordinator`; VAD interruption cancels speculative TTS by session id.
- Keep these ports private to the LAN: `18080`, `18100`, `18120`, `18200`, `18250`, `18300`, `18400`, `41000-41399/udp`.

## Startup

```bash
docker compose --env-file /srv/nyra/env/voice-mesh.env -f infra/workers//docker-compose.kyutai-mesh.yml up -d

# worker-rtx3090ti
docker compose --env-file /srv/nyra/env/voice-mesh.env -f infra/workers/worker-rtx3090ti/docker-compose.kyutai-mesh.yml up -d

# worker-rtx5090
docker compose --env-file /srv/nyra/env/voice-mesh.env -f infra/workers/worker-rtx5090/docker-compose.kyutai-mesh.yml up -d
```

## Smoke Checks

```bash
curl -fsS http://${}:18100/health
curl -fsS http://${RTX3090TI_LAN_IP}:18250/health
curl -fsS http://${RTX5090_LAN_IP}:18400/health
```
