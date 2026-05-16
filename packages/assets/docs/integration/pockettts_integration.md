# 🎙️ Kyutai PocketTTS Integration (Open WebUI)

This guide explains how to wire your local **PocketTTS** (running on the Minisforum Orchestrator) into your **Open WebUI** instance as the default TTS engine.

---

## 1. Configure Open WebUI Settings

Log into Open WebUI and navigate to:
**Settings > Audio**

1.  **Text-to-Speech Engine**: Select `OpenAI`.
2.  **API Base URL**: 
    *   If Open WebUI is in the same Docker network: `http://nyra-pockettts:8000/v1`
    *   If Open WebUI is external: `http://10.0.0.1:8881/v1` (replace `10.0.0.1` with your orchestrator's static IP).
3.  **API Key**: Leave this **blank** (or enter any string; it's ignored).
4.  **TTS Voice**: Choose your preferred voice.
    *   **Standard voices**: `alba`, `marius`, `javert`.
    *   **Cloned voices**: If you dropped `my-voice.wav` into the `/voices` folder, type `my-voice` here.

---

## 2. Managing Voice Clones

The stack is configured to look for voices in your local data directory:
`infra/data/pockettts/voices/`

To add a custom voice:
1. Drop a short (10-30s), clean `.wav` file into that folder.
2. Ensure it is mono, 16kHz or 24kHz for best results.
3. Reference the filename (without extension) in the "TTS Voice" field in Open WebUI.

---

## 3. Performance & Latency (Ryzen 6800H)

*   **Model**: Kyutai 100M parameter model (OpenAI-compatible wrapper).
*   **Latency**: You should see sub-200ms TTFA (Time to First Audio) with streaming enabled.
*   **CPU Impact**: The Ryzen 6800H should handle concurrent requests at ~4x real-time speed.

---

## 🚀 Deployment Command

From your orchestrator's `infra/compose` directory:

```bash
docker compose -f docker-compose.pockettts.yml up -d
```

Check logs to ensure models are downloading correctly:
```bash
docker logs -f nyra-pockettts
```
