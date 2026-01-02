# Claude Flow @alpha Integration

We follow the `Using Claude Code with Open Models` + `litellm integration` docs from the Claude Flow wiki.

## 1. Start LiteLLM + Open WebUI

From `nyra-orchestration` root on the orchestrator:

```powershell
Copy-Item env\.env.example env\.env
# Fill env\.env with real keys

docker compose --env-file env\.env -f docker-compose.core.yml up -d
```

Check LiteLLM:

```powershell
curl -s http://localhost:4000/health `
  -H "Authorization: Bearer $env:LITELLM_MASTER_KEY"
```

## 2. Point Claude Code at LiteLLM

In PowerShell 7 on the orchestrator (or wherever Claude Code runs):

```powershell
$env:ANTHROPIC_BASE_URL  = "http://localhost:4000"
$env:ANTHROPIC_AUTH_TOKEN = $env:LITELLM_MASTER_KEY
```

Claude Code now thinks LiteLLM is an Anthropic endpoint, but LiteLLM routes to Gemini/OpenRouter/local models per `litellm/config.basic.yaml`.

Examples:

```powershell
claude --model nyra-gemini-flash "Quickly summarise this repo."
claude --model nyra-qwen-coder "Refactor this file for readability."
```

## 3. Add Claude Flow + Flow Nexus MCPs

```powershell
claude mcp add claude-flow "npx claude-flow@alpha mcp start"
claude mcp add flow-nexus  "npx flow-nexus@latest mcp start"
```

Then use Claude Flow SPARC / swarm commands, e.g.:

```powershell
npx claude-flow@alpha sparc run architect "Design the Nyra v2 repo cleanup plan."
```

## 4. Prompt template for repo cleanup

Once everything works, feed Claude Flow this kind of job prompt:

> You are Nyra's Repo-Orchestration Architect. Using your MCP filesystem + git tools, read the current Project-Nyra repo and all archives under `legacy-packages/`. Build a migration plan into the new `nyra-orchestration` structure, then implement it step by step, committing with clear messages and keeping compose/profile files minimal and DRY.

Save that as a workflow inside Claude Flow so you can re-run it.
