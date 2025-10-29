# Nyra Infrastructure

This directory contains the infrastructure setup for Project Nyra. It orchestrates the various services, agents, and UIs that make up the Nyra ecosystem.

## Directory Structure

- `compose/` - Docker Compose files for each component group
  - `compose.orchestration.yml` - Claude Flow and Archon services
  - `compose.ui.yml` - UI components (Archon UI, Open WebUI)
  - `compose.memory.yml` - Memory systems (Qdrant, Neo4j, Postgres)
  - `compose.metamcp.yml` - MetaMCP and other MCP servers
  - `compose.all.yml` - Base file for running all components
- `tasks/` - PowerShell scripts for common operations
  - `up.ps1` - Start services
  - `down.ps1` - Stop services
  - `logs.ps1` - View logs
  - `nuke.ps1` - Remove all containers and data

## Getting Started

1. Copy environment configuration files:
   ```powershell
   Copy-Item .env.example .env
   Copy-Item .env.local.example .env.local
   ```

2. Edit `.env` to add your API keys and credentials.

3. Start all services:
   ```powershell
   ./tasks/up.ps1 -All
   ```

4. Or start just what you need:
   ```powershell
   ./tasks/up.ps1 -MetaMCP -Orchestration
   ```

5. View logs:
   ```powershell
   ./tasks/logs.ps1 -Service claude-flow -Follow
   ```

6. Stop services when done:
   ```powershell
   ./tasks/down.ps1 -All
   ```

## Service Layout

- **Orchestration**
  - Claude Flow: http://localhost:3001
  - Archon Server: http://localhost:8181
  - Archon MCP: http://localhost:8051

- **MetaMCP**
  - MetaMCP: http://localhost:8080
  - Infisical MCP: http://localhost:8081
  - Bitwarden MCP: http://localhost:8082

- **Memory**
  - Qdrant: http://localhost:6333
  - Neo4j: http://localhost:7474
  - PostgreSQL: localhost:5432

- **UI**
  - Archon UI: http://localhost:3737
  - Open WebUI: http://localhost:3000