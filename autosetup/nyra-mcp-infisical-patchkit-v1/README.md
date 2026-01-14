# Nyra Master Package (Nexus + LiteLLM + TwentyCRM + Graph Memory)

This folder is a *working* “top-to-bottom” launch kit: infra stack, service skeletons, prompt packs, and your current drip/quote assets in machine-readable form.

## What’s inside
- `nyra-stack/` — Docker stack (Nexus Router + LiteLLM + TwentyCRM + Letta + Mem0 + OpenMemory MCP + Observability)
- `services/` — API skeletons:
  - `quote-engine/` — scriptable quoting API (FastAPI)
  - `campaign-engine/` — campaign orchestration API (FastAPI) that delegates execution to n8n/Dify/Twilio etc
- `apps/` — minimal Next.js scaffolds (shadcn-ready) for:
  - `nyra-admin/` — lead/campaign control UI (separate from Twenty’s UI)
  - `ratehunter/` — standalone landing page scaffold
- `prompts/` — ready-to-run claude-flow prompt packs (SPARC + batch + stream-chaining patterns)
- `data/` — extracted campaign definitions + originals
- `assets/uploads/` — your uploaded docs/media copied in

## Quick start (local)
1. Copy `nyra-stack/.env.example` → `nyra-stack/.env` and fill the API keys.
2. Run core stack:
   ```bash
   cd nyra-stack
   docker compose up -d
   ```
3. Optional add-ons (Dify + n8n) live in `nyra-stack/docker-compose.addons.yml`.
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.addons.yml up -d
   ```

## Next: generate code with claude-flow
Open `prompts/claude-flow/00_BOOTSTRAP.md` and run the commands exactly; it will initialize repos, apply CLAUDE.md templates, and run batch plans.

> Note: this package assumes you’re using **Nexus** as MCP tool router and **LiteLLM + OpenRouter** as model routing.


---
## Whitepaper + Research + Infra Bootstrap (Added)
This unified package also includes the separate **whitepaper + research + bootstrap** bundle under:
- `docs/whitepaper/` (WHITEPAPER.md/pdf + notes)
- `bootstrap/` (prereqs, clone forks, env init, dev up)
- `infra/` (dev compose, env example, nexus yaml)
- `gitea/` + `ci/` (optional Git hosting + CI scaffolding)

If you previously downloaded the “whitepaper package”, everything from it is now merged here.
