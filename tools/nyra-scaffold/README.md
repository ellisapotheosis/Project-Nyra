# Nyra Scaffold - Development Environment Setup

**Consolidated from**: `nyra-tools/nyra-vscode-and-scaffold` (Jan 2026)

## Overview

Nyra Scaffold provides a complete VSCode development environment setup for Project Nyra, including:
- **VSCode Profiles**: Pre-configured profiles for different development scenarios
- **Claude Flows**: Automated workflows for research, development, and PR creation
- **MCP Configurations**: Central MCP proxy and server configurations
- **Agent Definitions**: Cross-system agent behaviors and definitions
- **Orchestration Frameworks**: Integration configs for multiple AI orchestration tools
- **Memory Services**: Database and memory service configurations

## Directory Structure

```
nyra-scaffold/
├── .vscode-profiles/       # VSCode profile configurations
│   ├── AI-Stack.code-profile
│   ├── Default-AllAround.code-profile
│   ├── Default-Light.code-profile
│   └── install-profiles.ps1
├── claude/                 # Claude Code workflows
│   └── flows/
│       └── research-to-pr.yaml
├── config/                 # Environment-specific configs
│   └── environments/
│       ├── development/
│       ├── staging/
│       └── production/
├── nyra-agents/           # Agent definitions
│   └── definitions/
│       └── claude-agents/
├── nyra-core/             # Shared TypeScript types/schemas
├── nyra-mcp/              # General MCP servers
├── nyra-memory/           # Memory service configs
│   ├── neo4j/
│   └── qdrant/
├── nyra-metamcp/          # Central MCP proxy
├── nyra-orchestration/    # Orchestration frameworks
│   ├── anthropic-agents-sdk/
│   ├── autogen2/
│   ├── claude-code-development-kit/
│   ├── gemini-assistant/
│   ├── langgraph/
│   └── praisonai/
├── scripts/               # Setup and deployment scripts
│   └── setup/
└── docs/                  # Documentation
    ├── guide.md
    └── overview.md
```

## Getting Started

### 1. Install VSCode Profile

```powershell
# Install the All-Around profile (recommended)
powershell -ExecutionPolicy Bypass -File .\tools\nyra-scaffold\.vscode-profiles\install-profiles.ps1 -ProfileName 'Default-AllAround'
```

Or manually import in VSCode:
1. Open VSCode
2. Click **Profiles** → **Import from file**
3. Select `.vscode-profiles/Default-AllAround.code-profile`

### 2. Configure Environment

Copy the environment template:
```bash
cp config/environments/development/.env.example .env
```

Edit `.env` with your API keys and service URLs.

### 3. Verify MCP Setup

In Claude Code, run:
```
/mcp
```

Verify these MCPs are active:
- ✓ Tavily
- ✓ GitHub
- ✓ Knowledge Graph (KG)
- ✓ Qdrant

### 4. Test End-to-End Workflow

Run the research-to-PR flow:
```bash
# In Claude Code or compatible editor
# Execute: claude/flows/research-to-pr.yaml
```

This will test: research → notes → commit → PR

## Available Profiles

| Profile | Description | Use Case |
|---------|-------------|----------|
| **AI-Stack** | AI/ML development focus | Training models, agent development |
| **Default-AllAround** | Balanced for all development | General development (recommended) |
| **Default-Light** | Lightweight, minimal extensions | Quick edits, low-resource environments |

## Orchestration Frameworks

The scaffold includes integration configs for:
- **Anthropic Agents SDK**: Official Claude agent framework
- **AutoGen2**: Microsoft multi-agent framework
- **Claude Code Development Kit**: Enhanced Claude Code tools
- **Gemini Assistant**: Google Gemini integration
- **LangGraph**: LangChain's graph-based workflows
- **PraisonAI**: AI agent orchestration platform

## Memory Services

Configurations for:
- **Neo4j**: Graph database for knowledge graphs
- **Qdrant**: Vector database for semantic search

## Next Steps

1. **Install dependencies** in framework-specific directories:
   ```bash
   cd nyra-orchestration/anthropic-agents-sdk && pnpm install
   ```

2. **Start memory services**:
   ```bash
   docker-compose -f infra/docker-compose.yml up -d neo4j qdrant
   ```

3. **Configure MCP servers** in `.mcp.json` (see `config/environments/development/metamcp.json`)

4. **Explore agent definitions** in `nyra-agents/definitions/claude-agents/`

## Documentation

- [Overview](docs/overview.md) - Repository structure and philosophy
- [Setup Guide](docs/guide.md) - Detailed setup instructions
- [Legacy README](README-LEGACY.md) - Original nyra-tools README

## Integration with Project Nyra

This scaffold is designed to work seamlessly with:
- **Bootstrap Agent**: `bootstrap/` - Project initialization
- **Claude Flow V3**: `.claude/` - Multi-agent orchestration
- **Infrastructure**: `infra/` - Docker and service configs
- **Monorepo**: `pnpm workspaces` + `turbo` - Build system

## Troubleshooting

### VSCode Profile Won't Import
- Ensure VSCode version is 1.80+
- Try manual import via **Profiles** menu
- Check PowerShell execution policy

### MCP Servers Not Detected
- Verify `.mcp.json` in project root
- Restart VSCode/Claude Code
- Check MCP server logs: `npx @claude-flow/cli@latest mcp status`

### Memory Services Connection Failed
- Ensure Docker containers are running: `docker ps`
- Check connection strings in `.env`
- Verify network: `docker network ls`

## Contributing

When adding new configurations:
1. Add to appropriate directory (agent, orchestration, etc.)
2. Update this README
3. Add environment variables to `.env.example`
4. Document in `docs/guide.md`

## License

Part of Project Nyra. See root LICENSE file.
