# Claude Flow @alpha + LiteLLM + OpenRouter + Gemini

We follow the Claude Flow docs for **Open Models** and **LiteLLM integration**:

1. **Start LiteLLM + Open WebUI**

   ```powershell
   cd C:\dev\nyra-orchestration
   Copy-Item env\.env.example env\.env
   # Fill env\.env with real keys

   docker compose --env-file env\.env -f docker-compose.core.yml --profile core up -d
   ```

2. **Point Claude Code / Claude Flow at LiteLLM**

   On the machine where you run Claude Code (PowerShell 7):

   ```powershell
   $env:ANTHROPIC_BASE_URL  = "http://<minisforum-ip>:4000"
   $env:ANTHROPIC_AUTH_TOKEN = $env:LITELLM_MASTER_KEY
   ```

   Now Claude Code believes it’s talking to an Anthropic endpoint, but LiteLLM routes:

   - `nyra-gemini-flash` / `nyra-gemini-flash-lite` → Gemini 2.x
   - `nyra-deepseek-coder` / `nyra-qwen-coder` → OpenRouter
   - `nyra-local-codellama` → your LAN GPU host

3. **Add Claude Flow + Flow Nexus MCPs**

   ```powershell
   claude mcp add claude-flow "npx claude-flow@alpha mcp start"
   claude mcp add flow-nexus  "npx flow-nexus@latest mcp start"
   ```

4. **Repo-cleanup job prompt** (template)

   > You are Nyra's Repo-Orchestration Architect. Using your MCP filesystem + git tools, read the existing Project-Nyra repository and all archives under `legacy-packages/`. Map every docker-compose file, MCP server, infra script, and bootstrapping fragment into the new `nyra-orchestration` layout. Build and show a migration plan first (with phases), then execute it step-by-step, committing each logical change with a clear git message.

Save that as a Claude Flow workflow / SPARC script you can call repeatedly.
