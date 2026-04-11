# Nyra Bootstrap Kit (All-in-One, v2)

This kit is designed to be **dropped into your `project-nyra/bootstrap/` folder**, then executed to:
- clone your **forks** (claude-flow, archon)
- clone **dev tooling** (Claude Code Development Kit) and **Gemini Assistant MCP**
- start your **local dev stack** (Nexus Router + LiteLLM/OpenRouter + Dify + Activepieces + n8n + TwentyCRM)
- wire **Claude Code ↔ Nexus ↔ MCP tools**
- give you a **single master swarm plan** you can feed to claude-flow

> We intentionally removed **Flowise**, **GoHighLevel**, **MetaMCP**, **mcproxy**, and **Plano/ArchGW** from the stack in this kit.

---

## Quick Start (Windows)

### 0) Prereqs
- Git for Windows
- Docker Desktop
- Node 18+
- Python 3.11+
- (Recommended) UV (`pipx install uv`)

### 1) Copy kit into repo
Put this folder at:
`project-nyra/bootstrap/nyra-bootstrap-kit/`

### 2) Run bootstrap (PowerShell)
From repo root:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
./bootstrap/nyra-bootstrap-kit/10_apply_to_repo.ps1
./bootstrap/nyra-bootstrap-kit/20_clone_forks.ps1
./bootstrap/nyra-bootstrap-kit/40_dev_up.ps1
./bootstrap/nyra-bootstrap-kit/60_configure_claude_code_mcp.ps1
```

### 3) (Optional but recommended) Install Claude Code Development Kit
```powershell
./bootstrap/nyra-bootstrap-kit/55_install_ccdk_via_docker.ps1
```

### 4) (Optional) Add Gemini Assistant MCP to Claude Code
```powershell
./bootstrap/nyra-bootstrap-kit/65_add_gemini_mcp.ps1
```

---

## “Dual orchestrator” (Claude-Flow + Archon)
- Claude-Flow drives swarms + batch refactors.
- Archon OS holds long-lived memory + tasks and exposes an MCP server.

After cloning forks, start Archon using its own compose (inside the cloned repo):

```powershell
./bootstrap/nyra-bootstrap-kit/41_up_archon.ps1
```

Then open the doc:
`docs/DUAL_ORCHESTRATOR_CLAUDEFLOW_ARCHON.md`

---

## Master prompt / swarm plan
See:
- `prompts/claude-flow/NYRA_MASTER_SWARM.md`
- `prompts/claude-flow/00_INIT.md` (how to run it correctly)

---

## What this kit DOES NOT do (by design)
- It does not try to integrate LendingPad / LeadMailbox / Rocket / LenderPrice automatically yet (those need API checks and agreements).
- It does not ship proprietary vendor code.
- It does not promise compliance — you must validate your policies and scripts with counsel.
