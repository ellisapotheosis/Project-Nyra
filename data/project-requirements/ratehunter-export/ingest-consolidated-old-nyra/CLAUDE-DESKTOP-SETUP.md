# Claude Desktop Setup Guide for Project Nyra

This guide provides comprehensive instructions for setting up Claude Desktop with Project Nyra's orchestration system, including MCP server configuration, multi-agent coordination, and development workflows.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Setup](#detailed-setup)
5. [Configuration Reference](#configuration-reference)
6. [MCP Server Details](#mcp-server-details)
7. [Validation and Testing](#validation-and-testing)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Configuration](#advanced-configuration)
10. [Best Practices](#best-practices)

---

## Overview

Claude Desktop provides a native application for interacting with Claude AI, featuring:
- **Model Context Protocol (MCP)** server integration
- **Multi-agent orchestration** via Claude Flow V3
- **Persistent memory** with HNSW indexing
- **Background workers** for automated tasks
- **File system operations** within the project directory
- **Git and GitHub integration** for version control
- **Custom instructions** for project-specific context

### What This Setup Provides

- ✅ Pre-configured MCP servers for Project Nyra
- ✅ Auto-learning and pattern recognition
- ✅ Multi-agent swarm coordination
- ✅ Hierarchical orchestration (anti-drift)
- ✅ Background task execution
- ✅ Cross-session memory persistence
- ✅ Security scanning and validation
- ✅ Performance optimization

---

## Prerequisites

### Required Software

| Software | Minimum Version | Purpose |
|----------|----------------|---------|
| **Node.js** | 20.0.0+ | MCP server runtime |
| **npm** | 9.0.0+ | Package management |
| **Git** | 2.30.0+ | Version control |
| **Claude Desktop** | Latest | AI interaction platform |

### Optional Software

| Software | Purpose |
|----------|---------|
| **pnpm** | Faster package management |
| **Docker** | Container orchestration |
| **PostgreSQL** | Database operations |
| **WSL2** (Windows) | Linux development environment |

### Environment Variables

Create a `.env` file in the project root with:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional - GitHub integration
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=your-org
GITHUB_REPO=Project-Nyra

# Optional - Database
POSTGRES_CONNECTION_STRING=postgresql://user:pass@localhost:5432/nyra

# Optional - Search
BRAVE_API_KEY=...

# Claude Flow Configuration
CLAUDE_FLOW_CONFIG=./claude-flow.config.json
CLAUDE_FLOW_LOG_LEVEL=info
CLAUDE_FLOW_MEMORY_BACKEND=hybrid
CLAUDE_FLOW_MEMORY_PATH=./data/memory
```

---

## Quick Start

### Automated Setup (Recommended)

```bash
# Navigate to project root
cd /path/to/Project-Nyra

# Run setup script
bash bootstrap/orchestrator-mini/scripts/setup-claude-desktop.sh

# Follow prompts for installation
```

The script will:
1. Detect your operating system
2. Guide Claude Desktop installation
3. Copy configuration templates
4. Replace variables with project paths
5. Validate MCP server connections
6. Initialize Claude Flow
7. Test integration

### Manual Setup (3 Steps)

If you prefer manual setup:

```bash
# 1. Install Claude Desktop
# Download from: https://claude.ai/download

# 2. Copy configurations
cp -r bootstrap/orchestrator-mini/configs/claude-desktop/* ~/.config/claude/
# or on Windows: %APPDATA%/Claude/

# 3. Edit claude_desktop_config.json
# Replace ${PROJECT_ROOT} with your actual project path
```

---

## Detailed Setup

### Step 1: Install Claude Desktop

#### Windows

1. Download installer from https://claude.ai/download
2. Run the `.exe` installer
3. Follow installation wizard
4. Launch Claude Desktop
5. Sign in with your Anthropic account

**Installation Location**:
- Application: `C:\Program Files\Claude\`
- Configuration: `%APPDATA%\Claude\`

#### macOS

1. Download `.dmg` from https://claude.ai/download
2. Open the `.dmg` file
3. Drag Claude to Applications folder
4. Launch Claude from Applications
5. Sign in with your Anthropic account

**Installation Location**:
- Application: `/Applications/Claude.app`
- Configuration: `~/Library/Application Support/Claude/`

#### Linux / WSL2

1. Download AppImage or package from https://claude.ai/download
2. For AppImage:
   ```bash
   chmod +x Claude-*.AppImage
   ./Claude-*.AppImage
   ```
3. For package (Ubuntu/Debian):
   ```bash
   sudo dpkg -i claude_*.deb
   sudo apt-get install -f
   ```
4. Launch Claude
5. Sign in with your Anthropic account

**Installation Location**:
- Application: `/usr/bin/claude` or `/opt/claude`
- Configuration: `~/.config/claude/`

#### WSL2 Special Considerations

Claude Desktop typically runs on the Windows host, not inside WSL2. You have two options:

**Option A: Install on Windows (Recommended)**
- Install Claude Desktop on Windows
- Configure MCP servers to work across WSL boundary
- Use Windows paths in configuration (accessible via `/mnt/c/...`)

**Option B: Run in WSL2 with X Server**
- Install X server on Windows (VcXsrv, X410)
- Set `DISPLAY` variable in WSL2
- Install Claude Desktop in WSL2
- May have GUI performance issues

### Step 2: Configure MCP Servers

#### Automatic Configuration

The setup script handles this automatically, but here's what it does:

1. **Create config directory**:
   ```bash
   mkdir -p ~/.config/claude  # Linux/macOS
   mkdir -p %APPDATA%/Claude  # Windows
   ```

2. **Copy configuration**:
   ```bash
   cp bootstrap/orchestrator-mini/configs/claude-desktop/claude_desktop_config.json \
      ~/.config/claude/claude_desktop_config.json
   ```

3. **Replace variables**:
   - `${PROJECT_ROOT}` → Your project path
   - `${GITHUB_TOKEN}` → From environment
   - `${POSTGRES_CONNECTION_STRING}` → From environment

4. **Set permissions** (Linux/macOS):
   ```bash
   chmod 600 ~/.config/claude/claude_desktop_config.json
   ```

#### Manual Configuration

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "claude-flow": {
      "command": "npx",
      "args": ["-y", "@claude-flow/cli@latest"],
      "env": {
        "CLAUDE_FLOW_CONFIG": "/absolute/path/to/claude-flow.config.json",
        "CLAUDE_FLOW_MEMORY_PATH": "/absolute/path/to/data/memory"
      },
      "autoStart": true
    }
  }
}
```

**Important**: Use absolute paths, not relative paths or `~`.

### Step 3: Install Node Dependencies

```bash
# Navigate to project root
cd /path/to/Project-Nyra

# Install all dependencies
pnpm install

# Install global MCP servers (optional, npx handles this)
npm install -g @claude-flow/cli@latest
```

### Step 4: Initialize Claude Flow

```bash
# Initialize Claude Flow if not already done
npx @claude-flow/cli@latest init --wizard

# Or use preset
npx @claude-flow/cli@latest init --preset production

# Start daemon
npx @claude-flow/cli@latest daemon start

# Verify installation
npx @claude-flow/cli@latest doctor
```

### Step 5: Restart Claude Desktop

After configuration:

1. **Quit Claude Desktop completely**
   - Windows: Right-click tray icon → Quit
   - macOS: Cmd+Q or Claude menu → Quit
   - Linux: Close window and kill process if needed

2. **Restart Claude Desktop**

3. **Verify MCP servers are connected**
   - Look for MCP indicator in the UI
   - Check for connection status
   - May see a permission prompt (accept it)

---

## Configuration Reference

### claude_desktop_config.json

This is the main configuration file for MCP servers.

#### Structure

```json
{
  "$schema": "https://modelcontextprotocol.io/schemas/mcp-config-schema.json",
  "mcpServers": {
    "server-name": {
      "command": "executable",
      "args": ["arg1", "arg2"],
      "env": {},
      "description": "Server description",
      "autoStart": true,
      "retryOnFailure": true,
      "retryAttempts": 3,
      "retryDelay": 2000,
      "optional": false
    }
  },
  "globalSettings": {},
  "projectSettings": {}
}
```

#### Server Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `command` | string | Yes | Executable command |
| `args` | string[] | No | Command arguments |
| `env` | object | No | Environment variables |
| `description` | string | No | Human-readable description |
| `autoStart` | boolean | No | Start automatically (default: true) |
| `retryOnFailure` | boolean | No | Retry on connection failure |
| `retryAttempts` | number | No | Max retry attempts |
| `retryDelay` | number | No | Delay between retries (ms) |
| `optional` | boolean | No | Server is optional |

### custom_instructions.txt

Project-specific context for Claude Desktop, including:

- Project overview and architecture
- Technology stack
- Development guidelines
- File organization rules
- Multi-agent orchestration patterns
- Performance targets
- Common workflows

**Location**:
- Same directory as `claude_desktop_config.json`
- Loaded automatically by Claude Desktop
- Applied to all conversations in this workspace

### workspace_settings.json

IDE-like settings for the workspace:

```json
{
  "workspace": {
    "name": "Project-Nyra",
    "type": "monorepo"
  },
  "editor": {
    "tabSize": 2,
    "formatOnSave": true
  },
  "files": {
    "exclude": { "node_modules": true }
  },
  "claudeFlow": {
    "autoStartDaemon": true,
    "swarmDefaults": {
      "topology": "hierarchical"
    }
  }
}
```

---

## MCP Server Details

### Primary Servers

#### 1. claude-flow (Required)

**Purpose**: Multi-agent orchestration, memory, and coordination

**Command**:
```bash
npx -y @claude-flow/cli@latest
```

**Features**:
- Agent spawning and lifecycle management
- Swarm coordination (hierarchical, mesh, ring, star)
- Memory operations with HNSW indexing (150x-12,500x faster)
- Background workers (12 types)
- Hooks system (27 hooks)
- Session persistence
- Neural pattern training
- Performance optimization

**Configuration**:
```json
{
  "command": "npx",
  "args": ["-y", "@claude-flow/cli@latest"],
  "env": {
    "CLAUDE_FLOW_CONFIG": "${PROJECT_ROOT}/claude-flow.config.json",
    "CLAUDE_FLOW_MEMORY_BACKEND": "hybrid",
    "CLAUDE_FLOW_MEMORY_PATH": "${PROJECT_ROOT}/data/memory"
  }
}
```

**CLI Commands**: See [V3 CLI Commands](#v3-cli-commands) section

#### 2. filesystem (Required)

**Purpose**: File system operations within project directory

**Command**:
```bash
npx -y @modelcontextprotocol/server-filesystem ${PROJECT_ROOT}
```

**Features**:
- Read/write files
- Directory listing
- File search
- Path validation
- Access control

**Security**:
- Restricted to project directory
- No access to parent directories
- Path traversal prevention

#### 3. git (Required)

**Purpose**: Git operations and repository management

**Command**:
```bash
npx -y @modelcontextprotocol/server-git
```

**Features**:
- Status and diff
- Commit and push
- Branch management
- Log and history
- Merge and rebase

**Environment**:
```json
{
  "GIT_WORK_TREE": "${PROJECT_ROOT}",
  "GIT_DIR": "${PROJECT_ROOT}/.git"
}
```

#### 4. memory (Required)

**Purpose**: Simple key-value memory storage

**Command**:
```bash
npx -y @modelcontextprotocol/server-memory
```

**Features**:
- Store key-value pairs
- Retrieve by key
- List all entries
- Delete entries
- No vector search (use claude-flow for that)

### Optional Servers

#### 5. github (Optional)

**Purpose**: GitHub API integration

**Command**:
```bash
npx -y @modelcontextprotocol/server-github
```

**Features**:
- Issue management
- Pull request operations
- Workflow triggers
- Repository analytics
- Code review

**Requirements**:
- `GITHUB_TOKEN` environment variable
- Repository permissions

#### 6. ruv-swarm (Optional)

**Purpose**: Advanced swarm coordination

**Command**:
```bash
npx -y ruv-swarm mcp start
```

**Features**:
- Distributed agent communication
- Byzantine fault tolerance
- Consensus protocols
- Cross-cluster coordination

#### 7. flow-nexus (Optional)

**Purpose**: Platform management and deployment

**Command**:
```bash
npx -y flow-nexus@latest mcp start
```

**Features**:
- E2B sandbox management
- Neural network training
- Workflow automation
- Deployment orchestration

#### 8. postgres (Optional)

**Purpose**: PostgreSQL database operations

**Command**:
```bash
npx -y @modelcontextprotocol/server-postgres
```

**Requirements**:
- `POSTGRES_CONNECTION_STRING` environment variable
- Database access

#### 9. brave-search (Optional)

**Purpose**: Web search capabilities

**Command**:
```bash
npx -y @modelcontextprotocol/server-brave-search
```

**Requirements**:
- `BRAVE_API_KEY` environment variable

---

## Validation and Testing

### Automated Validation

Run the setup script in validate-only mode:

```bash
bash bootstrap/orchestrator-mini/scripts/setup-claude-desktop.sh --validate-only
```

This checks:
- Node.js version (20+)
- npm version (9+)
- MCP server accessibility
- Claude Flow CLI functionality
- Configuration file validity

### Manual Validation

#### 1. Check Node.js Environment

```bash
node --version    # Should be v20.0.0+
npm --version     # Should be 9.0.0+
npx --version     # Should be installed
```

#### 2. Test MCP Servers Individually

```bash
# Claude Flow
npx -y @claude-flow/cli@latest --version
npx -y @claude-flow/cli@latest doctor

# Filesystem
npx -y @modelcontextprotocol/server-filesystem --help

# Git
npx -y @modelcontextprotocol/server-git --help

# Memory
npx -y @modelcontextprotocol/server-memory --help
```

#### 3. Verify Configuration Files

```bash
# Check configuration file exists
ls -la ~/.config/claude/claude_desktop_config.json

# Validate JSON syntax
cat ~/.config/claude/claude_desktop_config.json | jq .

# Check for placeholder variables (should be none)
grep -r '\${' ~/.config/claude/claude_desktop_config.json
```

#### 4. Test Claude Flow

```bash
# Navigate to project
cd /path/to/Project-Nyra

# Initialize (if not done)
npx @claude-flow/cli@latest init --skip-wizard

# Start daemon
npx @claude-flow/cli@latest daemon start

# Run diagnostics
npx @claude-flow/cli@latest doctor --fix

# Test swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical

# Test memory
npx @claude-flow/cli@latest memory store --key "test" --value "Hello World"
npx @claude-flow/cli@latest memory retrieve --key "test"
npx @claude-flow/cli@latest memory delete --key "test"
```

#### 5. Test in Claude Desktop

1. Open Claude Desktop
2. Create a new conversation
3. Try MCP commands:
   ```
   List files in the project root
   ```
   ```
   What is the git status?
   ```
   ```
   Initialize a swarm with 4 agents
   ```
4. Check for MCP server indicators in UI
5. Verify responses use MCP tools

### Integration Tests

#### Test 1: File Operations

```
Read the CLAUDE.md file in the project root
```

**Expected**: File contents displayed

#### Test 2: Git Operations

```
Show me the git status and recent commits
```

**Expected**: Git status and commit history

#### Test 3: Memory Operations

```
Store this pattern in memory: "authentication uses JWT tokens"
Search memory for authentication patterns
```

**Expected**: Pattern stored and retrieved

#### Test 4: Swarm Orchestration

```
Initialize a hierarchical swarm with 6 agents to analyze the codebase architecture
```

**Expected**: Swarm initialized, agents spawned, analysis completed

#### Test 5: Background Workers

```
Dispatch a security audit worker to scan the codebase
```

**Expected**: Worker dispatched, audit running in background

---

## Troubleshooting

### Common Issues

#### Issue 1: MCP Servers Not Connecting

**Symptoms**:
- No MCP indicator in Claude Desktop
- Commands don't use MCP tools
- Error messages about server connections

**Solutions**:

1. **Check configuration file location**:
   ```bash
   # Linux/macOS
   ls -la ~/.config/claude/claude_desktop_config.json

   # Windows (Git Bash)
   ls -la "$APPDATA/Claude/claude_desktop_config.json"
   ```

2. **Validate JSON syntax**:
   ```bash
   cat ~/.config/claude/claude_desktop_config.json | jq .
   ```

   If error: Fix JSON syntax errors

3. **Check for placeholder variables**:
   ```bash
   grep '\${' ~/.config/claude/claude_desktop_config.json
   ```

   If found: Replace with actual paths

4. **Verify Node.js version**:
   ```bash
   node --version  # Must be 20+
   ```

   If old: Update Node.js

5. **Test MCP server manually**:
   ```bash
   npx -y @claude-flow/cli@latest --version
   ```

   If fails: Check npm installation

6. **Restart Claude Desktop**:
   - Quit completely (not just close window)
   - Restart
   - Check for connection

#### Issue 2: Permission Errors

**Symptoms**:
- "Permission denied" errors
- Cannot read/write files
- MCP servers won't start

**Solutions**:

1. **Check file permissions**:
   ```bash
   chmod 600 ~/.config/claude/claude_desktop_config.json
   chmod 755 ~/.config/claude
   ```

2. **Check project directory permissions**:
   ```bash
   ls -la /path/to/Project-Nyra
   ```

   Ensure you have read/write access

3. **Run as correct user**:
   - Don't run Claude Desktop as admin/root
   - Use your normal user account

4. **WSL permissions** (if applicable):
   ```bash
   # In WSL, check Windows path permissions
   ls -la /mnt/c/path/to/project
   ```

#### Issue 3: Claude Flow CLI Not Found

**Symptoms**:
- "command not found" errors
- npx hangs or fails
- MCP server won't start

**Solutions**:

1. **Clear npx cache**:
   ```bash
   npm cache clean --force
   rm -rf ~/.npm/_npx
   ```

2. **Install explicitly**:
   ```bash
   npm install -g @claude-flow/cli@latest
   ```

3. **Check npm configuration**:
   ```bash
   npm config list
   npm config get prefix
   ```

4. **Use absolute path**:
   ```json
   {
     "command": "/usr/local/bin/npx",
     "args": ["-y", "@claude-flow/cli@latest"]
   }
   ```

#### Issue 4: Memory/Data Directory Errors

**Symptoms**:
- "Cannot create directory" errors
- Memory operations fail
- Data not persisting

**Solutions**:

1. **Create data directory**:
   ```bash
   mkdir -p /path/to/Project-Nyra/data/memory
   chmod 755 /path/to/Project-Nyra/data
   ```

2. **Check disk space**:
   ```bash
   df -h /path/to/Project-Nyra
   ```

3. **Verify path in config**:
   ```bash
   grep MEMORY_PATH ~/.config/claude/claude_desktop_config.json
   ```

4. **Use absolute path** (not relative):
   ```json
   {
     "env": {
       "CLAUDE_FLOW_MEMORY_PATH": "/absolute/path/to/data/memory"
     }
   }
   ```

#### Issue 5: Windows Path Issues

**Symptoms**:
- Paths with backslashes fail
- "Cannot find directory" errors
- MCP servers can't access files

**Solutions**:

1. **Use forward slashes**:
   ```json
   {
     "env": {
       "PROJECT_ROOT": "C:/Dev/Projects/Project-Nyra"
     }
   }
   ```

2. **Escape backslashes**:
   ```json
   {
     "env": {
       "PROJECT_ROOT": "C:\\Dev\\Projects\\Project-Nyra"
     }
   }
   ```

3. **Use cygpath** (Git Bash):
   ```bash
   cygpath -w /c/Dev/Projects/Project-Nyra
   # Output: C:\Dev\Projects\Project-Nyra
   ```

4. **Use WSL paths** (if in WSL):
   ```json
   {
     "env": {
       "PROJECT_ROOT": "/mnt/c/Dev/Projects/Project-Nyra"
     }
   }
   ```

### Debugging Tips

#### Enable Verbose Logging

1. **Claude Flow logs**:
   ```bash
   export CLAUDE_FLOW_LOG_LEVEL=debug
   npx @claude-flow/cli@latest daemon start
   ```

2. **Check log files**:
   ```bash
   tail -f ~/Project-Nyra/logs/claude-desktop.log
   tail -f ~/Project-Nyra/logs/claude-flow.log
   ```

3. **MCP server logs**:
   - Check Claude Desktop developer console
   - Look for MCP-related messages

#### Check Process Status

```bash
# Check if daemon is running
npx @claude-flow/cli@latest daemon status

# Check system processes
ps aux | grep claude
ps aux | grep node

# Kill stuck processes
pkill -f @claude-flow/cli
```

#### Verify Network Connectivity

```bash
# Check if ports are available
netstat -an | grep 3000  # Claude Flow MCP port
netstat -an | grep 3001  # RUV Swarm port

# Test npm registry
npm ping
```

#### Re-run Setup Script

```bash
# Run with skip-install if Claude Desktop already installed
bash bootstrap/orchestrator-mini/scripts/setup-claude-desktop.sh --skip-install

# Or full setup
bash bootstrap/orchestrator-mini/scripts/setup-claude-desktop.sh
```

### Getting Help

If issues persist:

1. **Check documentation**:
   - This guide: `bootstrap/docs/CLAUDE-DESKTOP-SETUP.md`
   - Main CLAUDE.md: `CLAUDE.md`
   - Claude Flow docs: https://github.com/ruvnet/claude-flow

2. **Run diagnostics**:
   ```bash
   npx @claude-flow/cli@latest doctor --verbose
   ```

3. **Check GitHub issues**:
   - Claude Flow: https://github.com/ruvnet/claude-flow/issues
   - MCP: https://github.com/modelcontextprotocol/servers/issues

4. **Create issue** with:
   - Operating system and version
   - Node.js and npm versions
   - Error messages (full output)
   - Configuration files (redact secrets)
   - Steps to reproduce

---

## Advanced Configuration

### Custom MCP Servers

You can add your own MCP servers:

```json
{
  "mcpServers": {
    "my-custom-server": {
      "command": "node",
      "args": ["./path/to/my-server.js"],
      "env": {
        "CUSTOM_VAR": "value"
      },
      "autoStart": true
    }
  }
}
```

### Environment-Specific Configurations

Create multiple configuration files:

```bash
~/.config/claude/
  ├── claude_desktop_config.json          # Production
  ├── claude_desktop_config.dev.json     # Development
  └── claude_desktop_config.staging.json # Staging
```

Switch between them:

```bash
# Use development config
cp ~/.config/claude/claude_desktop_config.dev.json \
   ~/.config/claude/claude_desktop_config.json

# Restart Claude Desktop
```

### Performance Tuning

#### Optimize Memory Usage

```json
{
  "globalSettings": {
    "maxConcurrentRequests": 5,  // Reduce from 10
    "timeout": 15000              // Reduce from 30000
  }
}
```

#### Enable Caching

```json
{
  "mcpServers": {
    "claude-flow": {
      "env": {
        "CLAUDE_FLOW_CACHE_ENABLED": "true",
        "CLAUDE_FLOW_CACHE_TTL": "3600"
      }
    }
  }
}
```

#### Disable Optional Servers

Set `autoStart: false` for servers you don't use:

```json
{
  "mcpServers": {
    "github": {
      "autoStart": false,
      "optional": true
    }
  }
}
```

### Security Hardening

#### Restrict File System Access

```json
{
  "mcpServers": {
    "filesystem": {
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "${PROJECT_ROOT}"],
      "allowedPaths": [
        "${PROJECT_ROOT}/src",
        "${PROJECT_ROOT}/tests",
        "${PROJECT_ROOT}/docs"
      ]
    }
  }
}
```

#### Use API Key Rotation

```bash
# Use a secrets manager
export ANTHROPIC_API_KEY=$(cat /path/to/secrets/anthropic-key)

# Or use Infisical
export ANTHROPIC_API_KEY=$(infisical secrets get ANTHROPIC_API_KEY --plain)
```

#### Enable Audit Logging

```json
{
  "globalSettings": {
    "logLevel": "info",
    "logPath": "${PROJECT_ROOT}/logs/claude-desktop-audit.log",
    "auditEnabled": true
  }
}
```

### Multi-Project Setup

If you work on multiple projects:

#### Option 1: Separate Configs

```bash
# Create project-specific configs
mkdir -p ~/.config/claude/projects/
cp claude_desktop_config.json ~/.config/claude/projects/project-nyra.json
```

#### Option 2: Dynamic Configuration

Use environment variables:

```json
{
  "env": {
    "PROJECT_ROOT": "${PROJECT_ROOT:-/default/path}"
  }
}
```

Set before launching:

```bash
export PROJECT_ROOT=/path/to/Project-Nyra
claude-desktop
```

---

## Best Practices

### 1. Configuration Management

- ✅ Use absolute paths, not relative
- ✅ Keep configs in version control (without secrets)
- ✅ Use environment variables for secrets
- ✅ Document custom configurations
- ✅ Validate JSON syntax before restarting

### 2. MCP Server Management

- ✅ Start with minimal servers (claude-flow, filesystem, git)
- ✅ Add optional servers as needed
- ✅ Set `autoStart: false` for rarely used servers
- ✅ Monitor server status regularly
- ✅ Update servers periodically: `npx -y @claude-flow/cli@latest`

### 3. Memory and Performance

- ✅ Use hybrid memory backend for best performance
- ✅ Enable HNSW indexing (150x-12,500x faster)
- ✅ Clear old sessions periodically
- ✅ Monitor disk space in data directory
- ✅ Use background workers for heavy tasks

### 4. Multi-Agent Orchestration

- ✅ Use hierarchical topology to prevent drift
- ✅ Limit swarm size to 6-8 agents
- ✅ Use specialized agents with clear roles
- ✅ Coordinate via hooks and memory
- ✅ Store successful patterns for reuse

### 5. Security

- ✅ Never commit API keys to version control
- ✅ Use environment variables or secrets manager
- ✅ Restrict file system access to project directory
- ✅ Enable audit logging
- ✅ Review MCP server permissions regularly
- ✅ Keep dependencies updated

### 6. Workflow Integration

- ✅ Use pre-task hooks to search memory
- ✅ Store successful patterns after completion
- ✅ Enable background workers for automated tasks
- ✅ Use session persistence for cross-conversation learning
- ✅ Run diagnostics after major changes

### 7. Troubleshooting

- ✅ Always run `npx @claude-flow/cli@latest doctor` first
- ✅ Check logs before asking for help
- ✅ Restart Claude Desktop after config changes
- ✅ Clear caches if behavior is unexpected
- ✅ Document issues and solutions for the team

---

## Appendix

### A. Configuration File Locations

| OS | Configuration Directory |
|----|------------------------|
| **Linux** | `~/.config/claude/` |
| **macOS** | `~/Library/Application Support/Claude/` |
| **Windows** | `%APPDATA%\Claude\` |
| **WSL** | `~/.config/claude/` (but run Claude on Windows host) |

### B. Required Files

| File | Purpose | Location |
|------|---------|----------|
| `claude_desktop_config.json` | MCP server configuration | Config directory |
| `custom_instructions.txt` | Project context | Config directory |
| `workspace_settings.json` | Workspace preferences | Config directory |
| `claude-flow.config.json` | Claude Flow configuration | Project root |
| `.env` | Environment variables | Project root |

### C. Environment Variables Reference

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `ANTHROPIC_API_KEY` | Yes | Claude API access | `sk-ant-...` |
| `CLAUDE_FLOW_CONFIG` | No | Config file path | `./claude-flow.config.json` |
| `CLAUDE_FLOW_MEMORY_PATH` | No | Memory directory | `./data/memory` |
| `CLAUDE_FLOW_LOG_LEVEL` | No | Logging verbosity | `info`, `debug` |
| `GITHUB_TOKEN` | No | GitHub API access | `ghp_...` |
| `POSTGRES_CONNECTION_STRING` | No | Database connection | `postgresql://...` |
| `BRAVE_API_KEY` | No | Search API access | `...` |
| `PROJECT_ROOT` | No | Project directory | `/path/to/project` |

### D. CLI Commands Quick Reference

See main CLAUDE.md for full command reference. Essential commands:

```bash
# Initialization
npx @claude-flow/cli@latest init --wizard
npx @claude-flow/cli@latest daemon start

# Diagnostics
npx @claude-flow/cli@latest doctor --fix

# Swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical

# Memory
npx @claude-flow/cli@latest memory store --key "k" --value "v"
npx @claude-flow/cli@latest memory search --query "search terms"

# Hooks
npx @claude-flow/cli@latest hooks pre-task --description "task"
npx @claude-flow/cli@latest hooks post-task --task-id "id" --success true

# Workers
npx @claude-flow/cli@latest hooks worker list
npx @claude-flow/cli@latest hooks worker dispatch --trigger audit

# Session
npx @claude-flow/cli@latest hooks session-start --session-id "id"
npx @claude-flow/cli@latest hooks session-end --export-metrics true
```

### E. Support Resources

- **Setup Script**: `bootstrap/orchestrator-mini/scripts/setup-claude-desktop.sh`
- **Config Templates**: `bootstrap/orchestrator-mini/configs/claude-desktop/`
- **Main Documentation**: `CLAUDE.md`
- **Component Guides**: `apps/*/CLAUDE.md`, `services/*/CLAUDE.md`
- **Claude Flow Docs**: https://github.com/ruvnet/claude-flow
- **MCP Documentation**: https://modelcontextprotocol.io/
- **Claude Download**: https://claude.ai/download

### F. Version Compatibility

| Component | Minimum Version | Recommended Version |
|-----------|----------------|---------------------|
| Claude Desktop | Latest stable | Latest stable |
| Node.js | 20.0.0 | 20.11.0+ (LTS) |
| npm | 9.0.0 | 10.0.0+ |
| @claude-flow/cli | 3.0.0 | Latest (3.0.0-alpha.12+) |
| pnpm | 8.0.0 | 8.14.0+ |
| Git | 2.30.0 | 2.40.0+ |

---

## Conclusion

You now have a complete Claude Desktop setup for Project Nyra with:

✅ MCP servers configured and tested
✅ Multi-agent orchestration ready
✅ Memory and learning systems enabled
✅ Background workers automated
✅ Security hardened
✅ Performance optimized

**Next Steps**:

1. ✅ Restart Claude Desktop
2. ✅ Open Project Nyra
3. ✅ Run initial diagnostics
4. ✅ Test swarm orchestration
5. ✅ Start building!

For questions or issues, consult the troubleshooting section or create an issue in the project repository.

Happy coding with Claude Desktop! 🚀
