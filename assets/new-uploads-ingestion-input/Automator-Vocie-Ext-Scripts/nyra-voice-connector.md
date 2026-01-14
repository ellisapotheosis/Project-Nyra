# NYRA Voice Connector (v1.0)
Tags: #NYRA #Voice #SuperAGI #AgentZero #Connector #Audio #Speech #TTS #STT #LettaAI #NotionSync #DownloadHistory

## Overview
Bridges voice input/output between SuperAGI's voice agents and Agent-Zero orchestration system.

## Voice System Options
| Stack | Native Voice | Notes |
|-------|--------------|-------|
| SuperAGI | ✅ | Built-in STT/TTS |
| Agent-Zero | ❌ | Extendable |
| LettaAI | ❌ | Can route only |

## Agent-Zero YAML
```yaml
id: nyra-voice
name: Nyra Voice Conduit
type: external_agent
description: Voice I/O via SuperAGI voice agents
routes:
  - type: http
    path: /voice
    method: POST
    accepts: ["audio_url", "text"]
    returns: ["transcript", "tts_url"]
integration:
  provider: superagi
  input: microphone
  output: elevenlabs | whisper | gTTS
memory_link: nyra-mem
```

## File Download + Voice Log Format
```json
{
  "file": "chatgpt_file_2025-09-03_14-22.zip",
  "time": "2025-09-03 14:22",
  "voice": "Yes, download that ZIP from earlier",
  "agent": "nyra-voice",
  "source": "chat.openai.com"
}
```

## Chrome Tagger
- Tampermonkey + Extension version
- Logs tags, right-click support
- Optional Notion sync

## Future
- Electron/React migration
- Voicemod/Home Assistant bridge
- Screenshot & audio log support
