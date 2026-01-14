# Nyra Whitepaper + Bootstrap Package

This zip is a *starter kit + strategy document* that mirrors the decisions in our conversation.

## Start here
1) Read `WHITEPAPER.md` (or `WHITEPAPER.pdf`)
2) Configure keys in `infra/.env` (copy from `.env.example`)
3) Run the bootstrap scripts

## What’s included
- Whitepaper + architecture docs
- Bootstrap scripts (Windows + macOS/Linux)
- Dev docker compose (Nexus + LiteLLM + Dify + Activepieces + n8n + Graphiti + obs)
- Prompt packs for claude-flow + agent system prompts
- Quote API FastAPI skeleton
- Campaign engine placeholder
- Your uploaded campaign/quote assets copied into `assets/uploads/`

## What’s NOT included (by design)
- Your actual TwentyCRM deployment compose (swap your Twenty stack in)
- Production secrets and domain config
- Kokoro voice pipeline implementation (reserved)
