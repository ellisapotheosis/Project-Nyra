# Nyra Memory Stack Architecture 🐱✨

## Overview
This monorepo contains the complete memory infrastructure for Project Nyra, featuring multiple integrated memory systems orchestrated by LettaAI.

## Memory Systems

### 1. **Qdrant** (Vector Store)
- Stores embeddings for semantic search
- Replaces ChromaDB with better performance
- Location: `nyra-memory-systems/vector-stores/qdrant/`

### 2. **Zep** (Conversational Memory)
- Manages chat history and context
- Provides conversation summaries
- Location: `nyra-memory-systems/conversational/zep/`

### 3. **Graphiti + FalkorDB** (Knowledge Graph)
- Temporal knowledge graph for relationships
- Complex reasoning and context understanding
- Location: `nyra-memory-systems/graph-stores/`

### 4. **Mem0** (Experimental Layer)
- Advanced memory features
- Personal memory management
- Location: `nyra-mcp-servers/local/mem0-mcp/`

## Directory Structure

```
Project-Nyra/
├── nyra-apps/              # Applications
├── nyra-packages/          # Shared packages
├── nyra-services/          # Backend services
├── nyra-agents/            # AI agents
├── nyra-mcp-servers/       # MCP server implementations
├── nyra-memory-systems/    # Memory system configs
└── nyra-infrastructure/    # Docker and deployment
```

## MCP Server Organization

### Global MCP Servers (install with npm -g)
- @modelcontextprotocol/server-filesystem
- @modelcontextprotocol/server-git
- Basic utility servers

### Local MCP Servers (in nyra-mcp-servers/local/)
- qdrant-mcp
- zep-mcp
- mem0-mcp (Python)
- archon-mcp (Python)

## Setup Instructions

1. **Install Docker Desktop** (required for all memory systems)

2. **Start Memory Services**:
   ```bash
   cd nyra-infrastructure/docker
   docker-compose up -d
   ```

3. **Install Python MCP Servers**:
   ```bash
   # For each Python MCP server
   cd nyra-mcp-servers/local/mem0-mcp
   python -m venv venv
   venv\Scripts\activate
   pip install mem0-mcp
   ```

4. **Configure MCP in Claude Desktop**:
   Update `.claude/config.json` with all MCP server paths

## Memory Orchestration

LettaAI serves as the central orchestrator, managing:
- Memory synchronization across systems
- Query routing to appropriate stores
- Context aggregation from multiple sources
- Memory lifecycle management

## Best Practices

1. **Python MCP Servers**: Always use virtual environments
2. **Docker Volumes**: Persist data in named volumes
3. **MCP Config**: Keep separate configs for dev/prod
4. **Memory Sync**: Use event-driven updates via LettaAI