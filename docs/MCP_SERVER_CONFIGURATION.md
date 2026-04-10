# MCP Server Configuration - Project Nyra

**Created**: 2026-01-26
**Status**: Configured
**Transport**: stdio (Standard Input/Output)

## Overview

This document provides the MCP (Model Context Protocol) server configuration for Project Nyra's Claude Flow V3 integration. Three MCP servers are configured for comprehensive AI orchestration, multi-agent coordination, and distributed workflow management.

## Configuration File Location

```
~/.config/claude/claude_desktop_config.json
```

## Configured MCP Servers

### 1. Claude Flow MCP Server

**Purpose**: Core swarm orchestration, memory management, and intelligent routing

**Configuration**:
```json
{
  "command": "npx",
  "args": ["-y", "@archon-os/cli@latest", "mcp", "start"],
  "transport": "stdio"
}
```

**Capabilities**:
- Agent lifecycle management (spawn, terminate, status, pool, health)
- Swarm coordination (init, status, shutdown, health)
- Memory operations (store, retrieve, search, delete, list, stats)
- Configuration management (get, set, list, reset, export, import)
- Hooks system (27 hooks + 12 background workers)
- Intelligence routing (RuVector, SONA, MoE)
- Task management (create, status, list, complete, update, cancel)
- Session management (start, end, restore)
- AIDefence security scanning
- Progress tracking

**Tool Groups**:
- **Agent Tools** (7): agent_spawn, agent_terminate, agent_status, agent_list, agent_pool, agent_health, agent_update
- **Swarm Tools** (4): swarm_init, swarm_status, swarm_shutdown, swarm_health
- **Memory Tools** (6): memory_store, memory_retrieve, memory_search, memory_delete, memory_list, memory_stats
- **Config Tools** (6): config_get, config_set, config_list, config_reset, config_export, config_import
- **Hooks Tools** (35+): Pre/post hooks, intelligence, workers, model routing
- **Task Tools** (6): task_create, task_status, task_list, task_complete, task_update, task_cancel
- **Session Tools** (7): session_start, session_end, session_restore, etc.

### 2. Ruv-Swarm MCP Server

**Purpose**: Advanced multi-agent coordination and distributed task execution

**Configuration**:
```json
{
  "command": "npx",
  "args": ["-y", "ruv-swarm", "mcp", "start"],
  "transport": "stdio"
}
```

**Capabilities**:
- Advanced swarm patterns (research, development, testing)
- Distributed consensus (Byzantine, Raft, Gossip, CRDT)
- Vector memory with RuVector integration
- Multi-topology support (mesh, hierarchical, ring, star, hybrid)
- Performance optimization and benchmarking

### 3. Flow Nexus MCP Server

**Purpose**: Cloud-based AI swarm deployment and event-driven workflows

**Configuration**:
```json
{
  "command": "npx",
  "args": ["-y", "flow-nexus@latest", "mcp", "start"],
  "transport": "stdio"
}
```

**Capabilities**:
- E2B sandbox deployment
- Cloud-based agent execution
- Event-driven workflow automation
- Neural network training in distributed environments
- Platform management (authentication, payments, challenges)

## Transport Protocol: stdio

All three MCP servers use **stdio transport**, which means:

1. **Communication Method**: Standard input/output streams
2. **Process Model**: Each MCP server runs as a child process spawned by Claude Desktop
3. **Message Format**: JSON-RPC 2.0 over stdin/stdout
4. **Lifecycle**: Servers start when Claude Desktop launches, stop when it closes
5. **No Network Ports**: Communication is process-local, no TCP/UDP ports required
6. **Security**: Process isolation, no network exposure

### Stdio Transport Benefits

- **Zero network configuration**: No firewall rules or port forwarding
- **Low latency**: Direct process communication without network stack overhead
- **Secure**: No network attack surface
- **Simple debugging**: Can inspect stdin/stdout streams
- **Automatic lifecycle**: Claude Desktop manages server processes

## Current Status

### System Health (from `npx @archon-os/cli@latest doctor`)

```
✓ Node.js Version: v24.13.0 (>= 20 required)
✓ npm Version: v11.6.2
✓ Claude Code CLI: v2.1.15
✓ Git: v2.43.0
✓ Config File: archon-os.config.json
✓ Daemon Status: Running (PID: 7692)
✓ Memory Database: .swarm/memory.db (0.15 MB)
✓ MCP Servers: 1 server (archon-os configured)
✓ TypeScript: v5.9.3
⚠ Version Freshness: v3.0.0-alpha.179 (latest: v3.0.0-alpha.184)
⚠ API Keys: No API keys found
```

### MCP Server Status

- **Claude Flow MCP**: Configured, Stopped (starts on-demand via Claude Desktop)
- **Ruv-Swarm MCP**: Configured, Not yet tested
- **Flow Nexus MCP**: Configured, Not yet tested

### Available Tools Count

- **Claude Flow**: 60+ tools across 8 categories
- **Ruv-Swarm**: TBD (requires server start)
- **Flow Nexus**: TBD (requires server start)

## Verification Steps

### 1. Verify Configuration File

```bash
cat ~/.config/claude/claude_desktop_config.json
```

### 2. Test Claude Flow MCP

```bash
# Check MCP status
npx @archon-os/cli@latest mcp status

# List available tools
npx @archon-os/cli@latest mcp tools

# Check health
npx @archon-os/cli@latest mcp health
```

### 3. Test Ruv-Swarm MCP

```bash
# Check if ruv-swarm is available
npx ruv-swarm --version

# Test MCP start (manual test)
npx ruv-swarm mcp start
```

### 4. Test Flow Nexus MCP

```bash
# Check if flow-nexus is available
npx flow-nexus@latest --version

# Test MCP start (manual test)
npx flow-nexus@latest mcp start
```

### 5. Restart Claude Desktop

After configuration changes, restart Claude Desktop to:
- Load new MCP server configurations
- Establish stdio connections
- Register all tools

## Claude Flow Configuration

The project's `archon-os.config.json` includes MCP settings:

```json
{
  "mcp": {
    "enabled": true,
    "transport": "stdio",
    "port": 3000,
    "host": "localhost",
    "toolGroups": [
      "create",
      "implement",
      "test",
      "fix",
      "optimize",
      "memory",
      "security",
      "monitor"
    ],
    "toolMode": "develop"
  }
}
```

## Tool Categories

### Agent Management
- Spawn, terminate, monitor agents
- Agent pool management
- Health checks

### Swarm Orchestration
- Initialize swarms with topology selection
- Monitor swarm status
- Coordinate parallel execution

### Memory Operations
- Store/retrieve patterns and learnings
- Vector search with HNSW indexing
- Memory statistics and management

### Intelligence & Routing
- Task routing to optimal agents
- Neural pattern learning
- Model selection (Haiku/Sonnet/Opus)

### Hooks & Workers
- 27 lifecycle hooks
- 12 background workers
- Session management

### Security
- AIDefence scanning
- Input validation
- PII detection

## Integration with Project Nyra

### Mortgage Workflow Integration

```bash
# Initialize mesh swarm for parallel TDD workflow
npx @archon-os/cli@latest swarm init --topology mesh --max-agents 8 --strategy balanced

# Store mortgage patterns
npx @archon-os/cli@latest memory store \
  --key "pattern-dti-calculation" \
  --value "DTI = (Monthly Debt / Monthly Income) * 100" \
  --namespace mortgage-patterns

# Search for compliance patterns
npx @archon-os/cli@latest memory search \
  --query "TILA disclosure requirements" \
  --namespace compliance
```

### Multi-Agent Coordination

Claude Code's Task tool spawns agents that coordinate via:
1. **Claude Flow MCP**: Core orchestration and memory
2. **Ruv-Swarm MCP**: Advanced distributed patterns
3. **Flow Nexus MCP**: Cloud deployment when needed

## Troubleshooting

### Issue: MCP Server Not Starting

**Solution**:
1. Check Node.js version (requires 20+)
2. Clear npx cache: `npx clear-npx-cache`
3. Test manual start: `npx @archon-os/cli@latest mcp start`
4. Check logs: `tail -f ./logs/archon-os.log`

### Issue: Tools Not Available

**Solution**:
1. Verify config file syntax
2. Restart Claude Desktop
3. Check MCP transport is "stdio"
4. Run `npx @archon-os/cli@latest doctor --fix`

### Issue: stdio Communication Failure

**Solution**:
1. Ensure no stdin/stdout interference
2. Disable debug logging during MCP sessions
3. Check for process termination in task manager
4. Verify JSON-RPC message format

## Next Steps

1. **Restart Claude Desktop** to activate all 3 MCP servers
2. **Verify connectivity** by invoking MCP tools from Claude Desktop
3. **Test agent spawning** with `agent_spawn` tool
4. **Initialize memory systems** with `memory_store` tool
5. **Run swarm coordination test** with `swarm_init` tool
6. **Document tool usage patterns** for mortgage workflows

## References

- **Claude Flow V3 Docs**: https://github.com/ruvnet/archon-os
- **MCP Specification**: https://modelcontextprotocol.io/
- **Project Nyra CLAUDE.md**: `/home/ellisapotheosis/projects/project-nyra/CLAUDE.md`
- **Capabilities Reference**: `.archon-os/CAPABILITIES.md`

## Configuration Summary

| MCP Server | Package | Transport | Status | Tools |
|------------|---------|-----------|--------|-------|
| Claude Flow | @archon-os/cli@latest | stdio | Configured | 60+ |
| Ruv-Swarm | ruv-swarm | stdio | Configured | TBD |
| Flow Nexus | flow-nexus@latest | stdio | Configured | TBD |

**Total MCP Integration**: 3 servers configured with stdio transport, ready for Claude Desktop restart and activation.
