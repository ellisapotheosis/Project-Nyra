# Claude‑Flow Post‑Init Setup (Dev)

Assumptions:
- You already ran `npx claude-flow@alpha init ...` in the repo you want to work in.
- Orchestrator is Windows 11 (Docker Desktop + WSL available).

## 0) Install style (recommended = Volta global tools)
You can avoid repo `node_modules` for tools by installing them as global CLIs via Volta.

### Option A: Volta‑managed global tools
```powershell
volta install node@20
volta install pnpm@9
volta install claude-flow@alpha
volta install agentdb@1.3.9
volta install agentic-flow

npm install -g @anthropic-ai/claude-code
claude --dangerously-skip-permissions
```

### Option B: Ephemeral (always latest alpha)
```powershell
pnpm dlx claude-flow@alpha --help
pnpm dlx agentic-flow --help
pnpm dlx agentdb@1.3.9 --help
```

> `npx` installs into the npm cache (your log path is normal).

## 1) Verify installs
```powershell
claude --version
claude-flow --version
claude-flow --help
```

Add Claude‑Flow MCP to Claude Code:
```powershell
claude mcp add claude-flow npx claude-flow@alpha mcp start
```

## 2) Memory: ReasoningBank
```powershell
claude-flow memory init --reasoningbank
claude-flow memory store pattern "Use env vars for local dev" --reasoningbank
claude-flow memory query "API config" --reasoningbank
```

## 3) AgentDB v1.3.9 (hybrid backend)
Install:
```powershell
volta install agentdb@1.3.9
# OR per-repo:
pnpm add -D agentdb@1.3.9
```

Verify integration status:
```powershell
npx claude-flow@alpha memory agentdb-info
```

Optional: start AgentDB MCP:
```powershell
agentdb mcp
```

## 4) Model routing: Claude‑Flow Proxy OR LiteLLM

### A) Claude‑Flow Proxy (fastest)
```powershell
claude-flow agent config set OPENROUTER_API_KEY "sk-or-..."
claude-flow proxy start --daemon
$env:ANTHROPIC_BASE_URL = "http://localhost:8080"
```

### B) LiteLLM (best for policy routing + workers)
This kit provides a minimal config + compose.

```powershell
docker compose -f infra/compose/docker-compose.prod.yml up -d litellm
$env:ANTHROPIC_BASE_URL="http://localhost:4000"
$env:ANTHROPIC_AUTH_TOKEN=$env:LITELLM_MASTER_KEY
```

## 5) “Code Booster”
```powershell
claude-flow agent booster benchmark
claude-flow agent booster edit src/myfile.js
```

## 6) GitHub automation (examples)
```powershell
npx claude-flow@alpha github repo-architect "Restructure monorepo with optimal organization"
npx claude-flow@alpha github ci-orchestrator "Setup parallel test execution with smart caching"
```

## 7) Agentic‑Flow (optional)
```powershell
npx agentic-flow --help
```

If you use OpenRouter directly and don’t specify models each run:
```powershell
$env:COMPLETION_MODEL="deepseek/deepseek-chat-v3.1:free"
```

## 8) Production containerization
Bring up the orchestrator stack:
```powershell
docker compose -f infra/compose/docker-compose.prod.yml up -d
```
