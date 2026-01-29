# Nexus Router - Smart MCP Aggregator & LLM Router
**Status**: ✅ Configured & Ready  
**Date**: 2026-01-25  
**Purpose**: Unified MCP aggregation with intelligent LLM routing

---

## 🎯 Overview

<cite index="1-1">Nexus aggregates MCP servers and provides seamless LLM routing for AI agents.</cite> It serves as Project Nyra's **MetaMCP proxy aggregator** for:

1. **Smart LLM Routing**: <cite index="2-1">Unified interface for OpenAI, Anthropic, Google, and AWS Bedrock LLM providers with full tool calling support</cite>
2. **Context-Aware Tool Search**: <cite index="2-1">Intelligent fuzzy search across all connected tools using natural language queries</cite>
3. **MCP Aggregation**: <cite index="1-2">The Nexus MCP registry lets you manage trusted tools and avoid context bloat when using a large set of tools.</cite>
4. **Security**: <cite index="1-4">Nexus enforces granular access control with role-based permissions.</cite>

---

## 🚀 Quick Start

### Start Nexus Router
```powershell
# From this directory
docker-compose up -d

# Or from repo root
docker-compose -f infra/docker/services/nexus-router/docker-compose.yml up -d
```

### Verify Running
```powershell
# Check container status
docker ps | findstr nexus

# Test health endpoint
Invoke-WebRequest -Uri http://localhost:6000/health

# Check available models
Invoke-WebRequest -Uri http://localhost:6000/llm/openai/v1/models
```

### View Logs
```powershell
docker logs -f nyra-nexus-router
```

---

## 📊 MCP Servers Registered (18 Total)

### Infrastructure Tools (4)
- **filesystem-nyra**: Project Nyra repo access
- **filesystem-bootstrap**: Bootstrap package access
- **git-nyra**: Git operations (Port 8054)
- **github**: GitHub API integration

### Docker Management (2)
- **docker**: Container management (Port 8052)
- **dockerhub**: Docker Hub operations (Port 8053)

### Secrets & Security (2)
- **infisical**: Primary secrets management (Port 8055)
- **bitwarden**: Personal secrets (Port 8050)

### Memory & Knowledge (3)
- **qdrant**: Vector database for semantic memory
- **graphiti**: Temporal knowledge graph (Neo4j)
- **mem0**: Memory management system

### AI Orchestration (2)
- **claude-flow**: Multi-agent orchestration (v3 alpha)
- **archon**: Archon OS platform (Port 8051)

### Development Tools (3)
- **sequential-thinking**: Advanced reasoning (Port 8056)
- **codanna**: Symbol graph & code analysis
- **serena**: LSP-powered semantic retrieval

### Search & Research (3)
- **tavily**: AI-powered web search
- **perplexity**: Deep research
- **firecrawl**: Web scraping

### Integrations (2)
- **notion**: Notion workspace
- **twenty**: TwentyCRM

---

## 🧠 Smart LLM Routing

### Routing Strategy
<cite index="6-7">Nexus looks to fix these problems by offering automated routing of queries to different large language models (LLMs) — taking into account different models' performance at different tasks, the latency between prompt and response, context window lengths, and availability.</cite>

**Configured Rules**:

1. **Cheap/Simple Tasks** (≤4K tokens, low complexity)
   - **Route to**: Gemini Flash or Gemini Cheap
   - **Use case**: Data formatting, simple queries, batch operations

2. **Medium Tasks** (≤20K tokens, medium complexity)
   - **Route to**: Claude Haiku
   - **Use case**: Code reviews, documentation, analysis

3. **Complex Tasks** (≥20K tokens, high complexity)
   - **Route to**: Claude Sonnet 3.5 (PRIMARY)
   - **Use case**: Coding, refactoring, architecture

4. **Default Fallback**
   - **Route to**: Claude Sonnet 3.5
   - **Use case**: Everything else

### Model Aliases
- `claude-sonnet` → Claude 3.5 Sonnet (PRIMARY)
- `claude-fast` → Claude 3.5 Haiku
- `claude-opus` → Claude 3 Opus
- `gemini-flash` → Gemini 2.0 Flash
- `gemini-pro` → Gemini 1.5 Pro
- `gemini-cheap` → Gemini 1.5 Flash
- `openai-flagship` → GPT-4o
- `openai-fast` → GPT-4o Mini

---

## 🔍 Fuzzy Tool Search

<cite index="2-9">search: A context-aware tool search that uses fuzzy matching to find relevant tools across all connected MCP servers</cite>

**Configuration**:
- **Enabled**: Yes
- **Threshold**: 0.7 (70% match)
- **Max Results**: 20 tools

**Usage**:
```bash
# Search for tools naturally
curl http://localhost:6000/mcp/search?q="upload file to storage"

# Returns namespaced tools like:
# - filesystem-nyra__write_file
# - dockerhub__push_image
# - github__create_file
```

<cite index="2-9">All tools from downstream servers are namespaced with their server name (e.g., github__search_code, filesystem__read_file).</cite>

---

## 🔒 Security Features

### RBAC (Role-Based Access Control)
<cite index="1-4">Nexus enforces granular access control with role-based permissions.</cite>

**Configured Groups**:
1. **Admin**: Full access to all MCP servers
2. **Developers**: Access to dev tools (filesystem, git, docker, codanna, serena)
3. **Agents**: Access to orchestration tools (infisical, memory systems, claude-flow, archon)

### Rate Limiting
**Multi-level protection**:
- **Global**: 10,000 requests/minute
- **Per-IP**: 1,000 requests/minute
- **Per-User**: 5,000 requests/minute
- **Per-Model**: Custom limits (e.g., Sonnet: 200K tokens/minute)

**Storage**: Redis-backed for distributed limiting across 4 PCs

### Additional Security
- <cite index="2-1">Security: Built-in CORS, CSRF protection, OAuth2, and TLS support</cite>
- CORS configured for web UIs (Open WebUI, Archon, ratehunter.net)
- CSRF protection enabled
- TLS ready for production (disabled for local dev)
- <cite index="1-6">Audit every tool call and LLM session to ensure compliance and security.</cite>

---

## 📡 API Endpoints

### Health Check
```
GET http://localhost:6000/health
```

### LLM Endpoints
```
# OpenAI-compatible (for Claude Code, Open WebUI)
POST http://localhost:6000/llm/openai/v1/chat/completions

# Native Anthropic protocol
POST http://localhost:6000/llm/anthropic/v1/messages

# List available models
GET http://localhost:6000/llm/openai/v1/models
```

### MCP Endpoints
```
# Fuzzy tool search
GET http://localhost:6000/mcp/search?q=your+query

# Execute tool
POST http://localhost:6000/mcp/execute
Body: {"server": "github", "tool": "search_code", "params": {...}}

# List all tools
GET http://localhost:6000/mcp/tools
```

---

## 🏗️ Integration with Project Nyra

### Open WebUI Integration
Update Open WebUI to point to Nexus:
```yaml
environment:
  - OPENAI_API_BASE_URL=http://nexus-router:6000/llm/openai/v1
  - OPENAI_API_KEY=dummy  # Not needed, Nexus handles auth
```

### Claude Code Integration
Update `.mcp.json` or `claude-code-config.json`:
```json
{
  "mcpServers": {
    "nexus-all-tools": {
      "url": "http://localhost:6000/mcp/sse"
    }
  }
}
```

### Archon Integration
Archon automatically connects via Nexus Router URL configured in environment:
```bash
NEXUS_ROUTER_URL=http://nexus-router:6000
```

### Claude Flow Integration
Claude Flow uses Nexus for LLM routing:
```bash
CLAUDE_FLOW_LLM_ENDPOINT=http://nexus-router:6000/llm/openai/v1
```

---

## 🌐 Multi-PC Architecture

### Orchestrator PC (Minisforum UH680)
- **Runs**: Nexus Router + Redis + All MCP Servers
- **Exposes**: Port 6000 via Cloudflare Tunnel
- **URL**: `https://nexus.ratehunter.net` (production)

### Worker PCs (3x - RTX3060, RTX3090Ti, RTX5090)
- **Connect**: To Nexus via Cloudflare Tunnel
- **Use**: Nexus as unified gateway to all tools
- **Local**: Run Ollama/vLLM for local LLMs

### Cloudflare Tunnel Setup
```bash
# On orchestrator PC
cloudflared tunnel --url http://localhost:6000 --hostname nexus.ratehunter.net
```

---

## 📊 Monitoring & Observability

<cite index="1-5">Nexus provides real-time monitoring and analytics to help you identify and address issues before they become problems.</cite>

### Metrics Export (OpenTelemetry)
- **Endpoint**: http://tempo:4317
- **Protocol**: gRPC
- **Includes**: Request rates, latency, token usage, error rates

### Trace Export
- **Endpoint**: http://tempo:4317
- **Protocol**: gRPC
- **W3C Trace Context**: Standard traceparent/tracestate headers

### Logs
- **Format**: JSON
- **Level**: info (configurable)
- **Output**: stdout (Docker logs)

---

## 🛠️ Configuration

### Main Config
**Location**: `infra/configs/nexus/nexus.toml`

**Key Sections**:
1. Server settings (listen address, rate limits)
2. LLM providers (Anthropic, Google, OpenAI, Bedrock)
3. MCP servers (18 servers registered)
4. Fuzzy tool search
5. Security (CORS, CSRF, RBAC)
6. Telemetry (metrics, traces, logs)
7. Smart routing rules

### Environment Variables
All sensitive values use `{{ env.VARIABLE_NAME }}` substitution.

**Required**:
- `ANTHROPIC_API_KEY` - Primary LLM provider
- `GOOGLE_API_KEY` - Secondary (cheap tasks)
- `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID` - Secrets management
- `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET` - Secrets management

**Optional**:
- `OPENAI_API_KEY` - OpenAI models
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - Bedrock
- `GITHUB_TOKEN` - GitHub MCP
- `TAVILY_API_KEY`, `PERPLEXITY_API_KEY`, `FIRECRAWL_API_KEY` - Research
- `NOTION_TOKEN` - Notion integration
- `BWS_ACCESS_TOKEN` - Bitwarden
- `QDRANT_API_KEY`, `NEO4J_PASSWORD` - Memory systems

---

## 🚨 Troubleshooting

### Nexus Won't Start
```powershell
# Check Docker logs
docker logs nyra-nexus-router

# Verify nexus.toml syntax
docker run --rm -v ./nexus.toml:/etc/nexus/nexus.toml ghcr.io/grafbase/nexus:latest validate

# Check environment variables
docker exec nyra-nexus-router env | findstr API_KEY
```

### MCP Server Not Found
```powershell
# List registered servers
Invoke-WebRequest -Uri http://localhost:6000/mcp/tools

# Check specific server logs
docker logs nyra-infisical-mcp

# Restart Nexus to reload config
docker restart nyra-nexus-router
```

### Rate Limit Errors
```powershell
# Check Redis connection
docker logs nyra-nexus-redis

# View current rate limit status
Invoke-WebRequest -Uri http://localhost:6000/health
```

### Tool Search Not Working
Check fuzzy search is enabled in `nexus.toml`:
```toml
[mcp.tool_search]
enabled = true
fuzzy_match_threshold = 0.7
max_results = 20
```

---

## 📚 Additional Resources

- **Nexus Website**: https://nexusrouter.com
- **GitHub**: https://github.com/grafbase/nexus
- **Documentation**: https://github.com/grafbase/nexus/docs
- **Project Nyra MCP Guide**: `docs/infrastructure/MCP-SERVERS-GUIDE.md`
- **Configuration**: `infra/configs/nexus/nexus.toml`

---

## ✅ Setup Checklist

- [x] Created `nexus.toml` with all 18 MCP servers
- [x] Created `docker-compose.yml` with Nexus + Redis
- [x] Configured smart routing rules (cheap→Gemini, complex→Sonnet)
- [x] Enabled fuzzy tool search
- [x] Configured RBAC for 3 user groups
- [x] Set up rate limiting with Redis backend
- [x] Configured CORS for web UIs
- [x] Added telemetry export to Tempo
- [ ] Test with `docker-compose up -d` (USER ACTION)
- [ ] Verify health endpoint accessible
- [ ] Test fuzzy tool search
- [ ] Integrate with Open WebUI
- [ ] Integrate with Claude Code
- [ ] Configure Cloudflare Tunnel for production

---

**Status**: ✅ **Configuration Complete - Ready to Deploy**  
**Next Step**: Start with `docker-compose up -d` and test endpoints
