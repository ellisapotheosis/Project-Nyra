# Oracle One-VM Context (Nyra)

## Mission snapshot
- Oracle VM is the always-on production plane.
- Baseline free-tier target: A1 Flex 4 OCPU / 24 GB RAM, 24/7.
- Keep storage (boot + block) under 200 GB total to remain in Always Free guardrails.

## Runtime responsibilities on Oracle VM
- TwentyCRM (system of record)
- Activepieces + n8n workflow engines
- FalkorDB + letta MCP
- OpenClaw/Moltbot gateway
- Quote API
- Optional cloudflared tunnel

## Non-negotiables
- STOP / DNC compliance is absolute.
- Any quote/rate recommendation is draft-only until human-approved.
- No public DB ports.
- All secrets via `.env` or secret manager; never commit secrets.
