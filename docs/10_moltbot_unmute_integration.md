# 10 Moltbot + Kyutai Unmute Integration

## Moltbot/OpenClaw
- Service in canonical compose: `moltbot-web` (port `3030`).
- Connected to Nexus (`OPENAI_BASE_URL=http://nexus-router:7000/v1`).

## Kyutai Unmute optional profile plan
- Keep optional and toggle with profile (proposed: `voice`).
- Required env:
  - `KYUTAI_LLM_URL`
  - `KYUTAI_LLM_MODEL`
  - `KYUTAI_LLM_API_KEY`
  - `HUGGING_FACE_HUB_TOKEN` (optional for gated model pulls)

## Security notes
- Voice and mic UX requires HTTPS in browser.
- Use Cloudflare TLS + Access if voice UI is externally reachable.

## UI integration plan
1. Add voice toggle in Nyra webapp chat UI.
2. Route text to Moltbot and optional voice synthesis to Kyutai service.
3. Persist chat metadata in Mem0 where enabled.

## How to verify
```bash
curl -fsS http://localhost:3030/
rg -n 'MOLTBOT_WEB|KYUTAI_' infra/.env.example infra/docker-compose.yml
```
