# NYRA AIO — MASTER SPARC BATCH (archon-os via Claude Code)

> IMPORTANT:
> - You are running inside **Claude Code** with the **archon-os plugin** available.
> - If archon-os is not available, you MUST make it available:
>   - verify: `npx @archon-os/cli@latest --version`
>   - if it fails, run: `npm i -g archon-os@alpha` OR use `npx` from repo root with a locked version.
> - You MUST read and treat as authoritative:
>   `C:\Dev\NYRA-AIO-Bootstrap\Nyra-Truth-and-Standards\Docs_Architecture_FINAL-ARCHITECTURE-DECISIONS.md`

## SPARC Batch Objective
Consolidate bootstraps, prompts, configs, docs, and repo structure so that:
- **NYRA-AIO-Bootstrap** becomes the “source ingestion + installer + truth” workspace
- **Project-Nyra** becomes the production monorepo with only current architecture materials
- Legacy/conflicting bootstrap folders are removed (contents re-homed, originals deleted)
- New decisions override old decisions everywhere
- Dual orchestrator (archon-os + Archon OS) is wired day-1
- Tooling stack is correct: Nexus Router + LiteLLM/OpenRouter + Dify + Activepieces + n8n + TwentyCRM + memory systems (letta/Falkor(or Neo4j), Letta, Mem0, Ruvector, Qdrant local, optional Zep)

---

@spec: SOURCE OF TRUTH AND CURRENT DECISIONS
- Read (and summarize into `C:\Dev\Projects\Repos\Project-Nyra\docs\standards\FINAL_ARCHITECTURE_DECISIONS.md`):
  - `C:\Dev\NYRA-AIO-Bootstrap\Nyra-Truth-and-Standards\Docs_Architecture_FINAL-ARCHITECTURE-DECISIONS.md`
- Create/overwrite `C:\Dev\Projects\Repos\Project-Nyra\docs\standards\STACK_LOCK.md` that explicitly states:
  - KEEP: nexus router (grafbase/nexus), litellm + openrouter, dify + activepieces + n8n, twentycrm, claude-code, archon-os@alpha, archon, serena mcp, gemini assistant mcp, github mcp, filesystem mcp (dev only), docker + dockerhub mcp, observability (prometheus/loki/grafana)
  - REMOVE: flowise, gohighlevel, plano/archgw
- Add a “deprecation gate” doc explaining where deprecated references may live (docs/_deprecated only).

@spec: INGESTION SOURCES AND DEDUPE RULES
- Ingest sources:
  - `C:\Dev\NyraDocs`
  - `C:\Dev\NyraDocs\bootstrap-input`
  - `C:\Dev\NYRA-AIO-Bootstrap` (scan for duplicates already copied in)
- Dedupe strategy:
  - Content-hash compare; if identical keep the newest under the correct target folder; archive the other to `_dupes/<date>/`
  - Never delete without backup.

---

@arch: TARGET FOLDER LAYOUT
1) **NYRA-AIO-Bootstrap** (installer + truth + source docs)
- `C:\Dev\NYRA-AIO-Bootstrap\GUI-Installer\` becomes **the single installer root**.
  - Consolidate EVERYTHING currently inside `C:\Dev\NYRA-AIO-Bootstrap\GUI-Installer` into:
    - `GUI-Installer/src` (UI code)
    - `GUI-Installer/assets`
    - `GUI-Installer/config`
    - `GUI-Installer/scripts`
    - `GUI-Installer/docs`
  - Any other bootstrap folders in NYRA-AIO-Bootstrap must be re-homed into these folders and then **the originals removed**.
- `C:\Dev\NYRA-AIO-Bootstrap\Claude-Configs\`
  - Contains all Claude Code + Claude Flow configs, hooks, prompt packs, command references, and env-var inventories.
  - This is the *only* place in AIO-Bootstrap where Claude configs live.
- `C:\Dev\NYRA-AIO-Bootstrap\Operations-Knowledge\`
  - Mortgage broker daily life, business activities, stage checklists, doc requirements, call scripts, compliance notes.

2) **Project-Nyra** (production monorepo)
- `C:\Dev\Projects\Repos\Project-Nyra\`
  - Must contain the running stack, apps, services, and only the docs needed for dev/prod.
  - Move any repo-root `*.md` into `docs/` (except README.md, CLAUDE.md).
  - Remove/replace conflicting docs under `docs/` with the new “truth.”

---

@impl: GUI INSTALLER CONSOLIDATION
- Perform a consolidation pass on:
  - `C:\Dev\NYRA-AIO-Bootstrap\GUI-Installer`
- Requirements:
  - Old folder names should disappear after consolidation; their intent must be preserved via re-homing into the standard layout above.
  - Extract shared logic into reusable modules; remove duplicate code; keep one canonical installer entrypoint.
  - Add a “one-click” run script: `GUI-Installer\scripts\Run-Installer.ps1`
  - Add a build script: `GUI-Installer\scripts\Build-Installer.ps1`

@impl: CLAUDE CONFIG CONSOLIDATION
- Consolidate all Claude-related material into:
  - `C:\Dev\NYRA-AIO-Bootstrap\Claude-Configs`
- Must include:
  - SPARC batch prompt library (Nyra-specific)
  - Master “commands & workflows” guide (Nyra-specific)
  - Master “everything commands” compendium (archon-os, archon-os, ruvector, etc.)
  - Claude Code setup + troubleshooting guide
  - ENV inventory + optimal-set docs (NO actual secrets)

@impl: PROJECT-NYRA REFACTOR AND NORMALIZATION
- In `C:\Dev\Projects\Repos\Project-Nyra`:
  - enforce: apps/, services/, infra/, docs/, prompts/, tools/, vendor/
  - clone forks into: `vendor/forks/archon-os` and `vendor/forks/archon`
  - prepare prod containerization into: `containers/production/{archon-os,archon,...}`
  - remove forbidden stack references in active configs/docs

@impl: DUAL ORCHESTRATOR WIRING (DAY-1)
- Goal: archon-os and Archon OS both running and used together.
- Implement:
  - A “bridge” prompt: Archon stores decisions + tasks; archon-os executes tasks; results feed back into Archon.
  - A local compose overlay that runs both in dev.
  - A validation script that checks both MCP endpoints reachable through Nexus Router.

@impl: WORKFLOWS AND TEMPLATES (NYRA)
- Generate:
  - Full-stack “golden path” workflows for each app:
    - RateHunter landing
    - Nyra Admin webapp (campaign control + lead control + quotes)
    - Dify borrower chat embedding
    - Activepieces automation examples
    - n8n campaign scheduling examples
    - Quote API end-to-end
    - Memory stack init (letta + Letta + Mem0 + Ruvector + Qdrant)
  - Prefilled templates for future modules (new service, new MCP tool, new n8n workflow, new activepieces flow, new Dify app)

---

@verify: STRICT ACCEPTANCE CHECKS
- No remaining references to removed stack components in active folders:
  - flowise, gohighlevel, metamcp, mcproxy, plano/archgw
- All repo-root `.md` moved into `docs/` (except README.md, CLAUDE.md)
- GUI-Installer has single canonical entrypoint and old bootstrap folders are removed
- Claude-Configs contains consolidated guides + prompts + env docs
- Project-Nyra has new normalized structure
- archon-os + Archon both running and tested
- Produce a final `STATUS_REPORT.md` in both repos:
  - `C:\Dev\NYRA-AIO-Bootstrap\STATUS_REPORT.md`
  - `C:\Dev\Projects\Repos\Project-Nyra\STATUS_REPORT.md`
