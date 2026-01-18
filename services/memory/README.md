# NYRA Memory Service

**Location**: `services/memory/`
**Type**: Standalone Infrastructure Service
**Size**: ~661KB

Memory management and persistence infrastructure for Project Nyra.

## Overview

This service provides a comprehensive memory infrastructure stack including:
- **Qdrant** - Vector database for embeddings
- **Neo4j** - Graph database for knowledge graphs
- **Graphiti-MCP** - Graph memory MCP server
- **Qdrant-MCP** - Vector memory MCP server
- **OpenMemory** - Mem0 AI integration
- **MetaMCP** - MCP gateway for unified memory access

## Structure
- `clients/` - MCP client configurations (Claude Desktop, Cursor)
- `deployment/` - Docker Compose files for memory services
- `docs/` - Architecture, implementation, and integration documentation
- `infra/` - Infrastructure configuration (master compose file)
- `scripts/` - PowerShell scripts for service management

## Quick Start

```powershell
# Start all memory services
.\RUN_ME.bat

# Or use PowerShell scripts
.\scripts\Start-NYRAMemory.ps1

# Stop services
.\scripts\Stop-NYRAMemory.ps1
```

## Docker Compose

Main memory stack:
```bash
docker-compose -f deployment/docker-compose.memory.yml up -d
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Qdrant | 6333 | Vector database |
| Neo4j | 7474, 7687 | Graph database |
| Graphiti-MCP | 7459 | Graph memory MCP |
| Qdrant-MCP | 8066 | Vector memory MCP |
| OpenMemory | 8765, 3000 | Mem0 AI |
| MetaMCP | 12008, 12005 | MCP gateway |

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `OPENAI_API_KEY` - For OpenMemory and Graphiti
- `NEO4J_PASSWORD` - Neo4j authentication
- `QDRANT_COLLECTION` - Qdrant collection name

## Integration

Other services can connect to memory infrastructure via:
- MCP protocol (Graphiti-MCP, Qdrant-MCP)
- HTTP APIs (OpenMemory REST API)
- Native clients (Neo4j Bolt, Qdrant gRPC)

## Documentation

See `docs/` for detailed documentation:
- `IMPLEMENTATION.md` - Implementation details
- `MCP-INTEGRATION.md` - MCP integration guide
- `WHITEPAPER.md` - Architecture whitepaper

## Consolidation

**Consolidated from**: `nyra-memory/` → `services/memory/`
**Date**: 2026-01-17
**Removed**: Nested duplicate `nyra-repo-cleanup-memory-v3/`
