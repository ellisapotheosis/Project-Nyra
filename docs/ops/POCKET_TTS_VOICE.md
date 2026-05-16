# POCKET_TTS_VOICE.md

## Overview
Project Nyra utilizes **Kyutai PocketTTS** for low-latency, high-fidelity local voice synthesis.

## Deployment
- **Location**: Orchestrator (Kyutai-Base) and all 3 Workers (Distributed Voice).
- **Engine**: PocketTTS OpenAI-compatible wrapper.

## Usage
Voice synthesis is primarily controlled through the **Nerve UI** cockpits on each worker.

### API Integration
- **Endpoint**: `http://<host>:8000/v1/audio/speech`
- **Client**: Use the `IVoiceClient` adapter in `@nyra/integration-adapters`.

## Distributed Voice
Project Nyra supports a "Distributed Voice Mesh" where each worker can output audio locally, allowing the broker to hear assistant feedback from specific physical nodes (e.g., "The 5090 is speaking").

## Setup
Refer to `services/pockettts/README.md` and the `voice-distributed` target in the root Makefile.
