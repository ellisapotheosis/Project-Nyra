#!/bin/bash
set -e

# Define the new monorepo root
MONOREPO_ROOT="nyra"
ORCHESTRATION_DIR="$MONOREPO_ROOT/nyra-orchestration"
CORE_DIR="$MONOREPO_ROOT/nyra-core"
INFRA_DIR="$MONOREPO_ROOT/nyra-infra"
MCP_SERVERS_DIR="$MONOREPO_ROOT/mcp-servers"
AGENTS_MANIFESTS_DIR="$MONOREPO_ROOT/agents-manifests"
PACKAGES_DIR="$MONOREPO_ROOT/packages"
UI_DIR="$MONOREPO_ROOT/nyra-ui"
WEBAPP_DIR="$MONOREPO_ROOT/nyra-webapp"
SCHEMAS_DIR="$MONOREPO_ROOT/schemas"
SCRIPTS_DIR="$MONOREPO_ROOT/scripts"

# Create the monorepo structure
echo "Creating monorepo structure at ./$MONOREPO_ROOT"
mkdir -p "$ORCHESTRATION_DIR"
mkdir -p "$CORE_DIR/nyra-a2a" "$CORE_DIR/nyra-memory"
mkdir -p "$INFRA_DIR/compose" "$INFRA_DIR/ops/caddy" "$INFRA_DIR/policies"
mkdir -p "$MCP_SERVERS_DIR"
mkdir -p "$AGENTS_MANIFESTS_DIR/stable" "$AGENTS_MANIFESTS_DIR/beta" "$AGENTS_MANIFESTS_DIR/experimental"
mkdir -p "$PACKAGES_DIR/@nyra/agents"
mkdir -p "$UI_DIR"
mkdir -p "$WEBAPP_DIR"
mkdir -p "$SCHEMAS_DIR"
mkdir -p "$SCRIPTS_DIR"
mkdir -p "$MONOREPO_ROOT/env/dev" "$MONOREPO_ROOT/env/prod"

# --- Populate Core Files ---

# package.json for workspace
cat > "$MONOREPO_ROOT/package.json" << EOL
{
  "name": "nyra",
  "private": true,
  "scripts": {
    "bootstrap": "pnpm install",
    "dev": "docker compose -f ./nyra-infra/compose/compose.dev.yml up",
    "stop": "docker compose -f ./nyra-infra/compose/compose.dev.yml down",
    "prod": "docker compose -f ./nyra-infra/compose/compose.prod.yml up -d"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  },
  "packageManager": "pnpm@9.1.0"
}
EOL

# pnpm-workspace.yaml
cat > "$MONOREPO_ROOT/pnpm-workspace.yaml" << EOL
packages:
  - 'nyra-orchestration/*'
  - 'nyra-core/*'
  - 'mcp-servers/*'
  - 'packages/*'
  - 'nyra-ui'
  - 'nyra-webapp'
EOL

# Makefile
cat > "$MONOREPO_ROOT/Makefile" << EOL
.PHONY: help dev-up dev-down prod-up prod-down install

help:
	@echo "Commands:"
	@echo "  install      - Install all pnpm workspace dependencies"
	@echo "  dev-up       - Start the development environment with Docker Compose"
	@echo "  dev-down     - Stop the development environment"
	@echo "  prod-up      - Start the production environment in detached mode"
	@echo "  prod-down    - Stop the production environment"

install:
	@pnpm install

dev-up:
	@docker compose -f nyra-infra/compose/compose.dev.yml --env-file ./env/dev/.env up -d --build

dev-down:
	@docker compose -f nyra-infra/compose/compose.dev.yml down

prod-up:
	@docker compose -f nyra-infra/compose/compose.prod.yml --env-file ./env/prod/.env up -d --build

prod-down:
	@docker compose -f nyra-infra/compose/compose.prod.yml down

EOL

# .gitignore
cat > "$MONOREPO_ROOT/.gitignore" << EOL
# Node
node_modules
.npm
pnpm-lock.yaml
*.log
.env
.env.*
!.env.example

# Docker
docker-compose.override.yml

# Build
dist
build
.next
.nuxt

# IDE
.vscode
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
EOL

echo "Monorepo structure and core files created."
