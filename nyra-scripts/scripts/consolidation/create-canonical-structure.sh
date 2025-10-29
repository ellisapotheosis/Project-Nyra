#!/bin/bash
echo "=== CREATING CANONICAL NYRA STRUCTURE ==="

# Create canonical directories
mkdir -p nyra-core/{src,tests,docs,config}
mkdir -p nyra-infra/{docker,kubernetes,terraform,ansible}
mkdir -p nyra-orchestration/{claude-flow,archon,agents,workflows}
mkdir -p nyra-mcp/{metamcp,infisical,servers,configs}
mkdir -p nyra-webapp/{frontend,backend,api,shared}
mkdir -p nyra-memory/{databases,cache,vector-stores}
mkdir -p nyra-tools/{scripts,utilities,dev-tools}
mkdir -p nyra-docs/{architecture,guides,api,tutorials}

echo "✓ Created canonical directory structure"

# Create README files for each directory
cat > nyra-core/README.md << 'CORE'
# NYRA Core

Core business logic and domain models for the NYRA platform.

## Structure
- `src/` - Source code
- `tests/` - Test suites
- `docs/` - Core documentation
- `config/` - Core configurations
CORE

cat > nyra-infra/README.md << 'INFRA'
# NYRA Infrastructure

Infrastructure as Code and deployment configurations.

## Structure
- `docker/` - Docker configurations
- `kubernetes/` - K8s manifests
- `terraform/` - Infrastructure provisioning
- `ansible/` - Configuration management
INFRA

cat > nyra-orchestration/README.md << 'ORCH'
# NYRA Orchestration

AI agent orchestration and workflow management.

## Structure
- `claude-flow/` - Claude Flow integration
- `archon/` - Archon MCP server
- `agents/` - Agent definitions
- `workflows/` - Workflow definitions
ORCH

cat > nyra-mcp/README.md << 'MCP'
# NYRA MCP Servers

Model Context Protocol server implementations.

## Structure
- `metamcp/` - MetaMCP gateway
- `infisical/` - Infisical secrets management
- `servers/` - Custom MCP servers
- `configs/` - MCP configurations
MCP

cat > nyra-webapp/README.md << 'WEBAPP'
# NYRA Web Application

Web application frontend and backend.

## Structure
- `frontend/` - Frontend application
- `backend/` - Backend services
- `api/` - API definitions
- `shared/` - Shared components
WEBAPP

cat > nyra-memory/README.md << 'MEM'
# NYRA Memory Systems

Memory management and persistence layers.

## Structure
- `databases/` - Database configurations
- `cache/` - Caching layers
- `vector-stores/` - Vector database configs
MEM

cat > nyra-tools/README.md << 'TOOLS'
# NYRA Tools

Development tools and utilities.

## Structure
- `scripts/` - Utility scripts
- `utilities/` - Helper tools
- `dev-tools/` - Development tooling
TOOLS

cat > nyra-docs/README.md << 'DOCS'
# NYRA Documentation

Comprehensive project documentation.

## Structure
- `architecture/` - Architecture diagrams and docs
- `guides/` - User and developer guides
- `api/` - API documentation
- `tutorials/` - Step-by-step tutorials
DOCS

echo "✓ Created README files for all canonical directories"
echo "=== CANONICAL STRUCTURE COMPLETE ==="
