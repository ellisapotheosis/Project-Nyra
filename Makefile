# Project Nyra - Common Operations Makefile
# Build automation tool for simplified command execution
#
# Usage: make <target>
# Example: make install, make dev, make mcp-start
#
# Note: This Makefile uses PowerShell for Windows compatibility

.PHONY: help install dev build test clean lint format \
        docker-up docker-down docker-restart docker-logs \
        mcp-start mcp-stop mcp-status mcp-health mcp-logs \
        nexus-start nexus-stop nexus-status nexus-logs \
        infra-up infra-down infra-status \
        env-setup env-verify bootstrap-orchestrator bootstrap-worker \
        archon-up archon-down

# Default target
.DEFAULT_GOAL := help

## help: Show this help message
help:
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════╗"
	@echo "║         Project Nyra - Development Commands                 ║"
	@echo "╚══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "📦 Package Management:"
	@echo "  make install            - Install all dependencies (pnpm)"
	@echo "  make clean              - Clean node_modules and build outputs"
	@echo ""
	@echo "🔨 Development:"
	@echo "  make dev                - Start development servers (turbo)"
	@echo "  make build              - Build all packages (turbo)"
	@echo "  make test               - Run all tests (turbo)"
	@echo "  make lint               - Lint all packages"
	@echo "  make format             - Format code with prettier"
	@echo ""
	@echo "🐳 Docker Services:"
	@echo "  make docker-up          - Start all Docker services"
	@echo "  make docker-down        - Stop all Docker services"
	@echo "  make docker-restart     - Restart Docker services"
	@echo "  make docker-logs        - View Docker logs"
	@echo ""
	@echo "🤖 MCP Servers:"
	@echo "  make mcp-start          - Start all MCP servers"
	@echo "  make mcp-stop           - Stop all MCP servers"
	@echo "  make mcp-status         - Check MCP server status"
	@echo "  make mcp-health         - Run health checks on MCP servers"
	@echo "  make mcp-logs           - View MCP server logs"
	@echo ""
	@echo "🌐 Nexus Router:"
	@echo "  make nexus-start        - Start Nexus Router + Redis"
	@echo "  make nexus-stop         - Stop Nexus Router"
	@echo "  make nexus-status       - Check Nexus Router status"
	@echo "  make nexus-logs         - View Nexus Router logs"
	@echo ""
	@echo "🏗️ Infrastructure:"
	@echo "  make infra-up           - Start all infrastructure (Docker + MCP + Nexus)"
	@echo "  make infra-down         - Stop all infrastructure"
	@echo "  make infra-status       - Check infrastructure status"
	@echo ""
	@echo "⚙️ Setup & Configuration:"
	@echo "  make env-setup          - Create .env symlink"
	@echo "  make env-verify         - Verify environment configuration"
	@echo "  make bootstrap-orchestrator - Bootstrap orchestrator PC"
	@echo "  make bootstrap-worker   - Bootstrap worker PC"
	@echo "  make archon-up          - Start Archon OS stack (using docker-compose.archon.yml)"
	@echo "  make archon-down        - Stop Archon OS stack"
	@echo ""

## install: Install all dependencies
install:
	@echo "📦 Installing dependencies..."
	pnpm install

## dev: Start development servers
dev:
	@echo "🔨 Starting development servers..."
	pnpm turbo dev

## build: Build all packages
build:
	@echo "🔨 Building all packages..."
	pnpm turbo build

## test: Run all tests
test:
	@echo "🧪 Running tests..."
	pnpm turbo test

## clean: Clean build outputs and node_modules
clean:
	@echo "🧹 Cleaning build outputs..."
	pnpm turbo clean
	@echo "🧹 Cleaning node_modules..."
	pwsh -Command "Get-ChildItem -Path . -Include node_modules -Recurse -Directory | Remove-Item -Recurse -Force"

## lint: Lint all packages
lint:
	@echo "🔍 Linting code..."
	pnpm turbo lint

## format: Format code with prettier
format:
	@echo "✨ Formatting code..."
	pnpm prettier --write "**/*.{ts,tsx,js,jsx,json,md}"

## docker-up: Start all Docker services
docker-up:
	@echo "🐳 Starting Docker services..."
	docker-compose -f infra/docker/docker-compose.yml up -d

## docker-down: Stop all Docker services
docker-down:
	@echo "🐳 Stopping Docker services..."
	docker-compose -f infra/docker/docker-compose.yml down

## docker-restart: Restart Docker services
docker-restart: docker-down docker-up
	@echo "🐳 Docker services restarted"

## docker-logs: View Docker logs
docker-logs:
	@echo "🐳 Viewing Docker logs..."
	docker-compose -f infra/docker/docker-compose.yml logs -f

## mcp-start: Start all MCP servers
mcp-start:
	@echo "🤖 Starting MCP servers..."
	pwsh -File scripts/mcp/manage-mcp-servers.ps1 -Action start

## mcp-stop: Stop all MCP servers
mcp-stop:
	@echo "🤖 Stopping MCP servers..."
	pwsh -File scripts/mcp/manage-mcp-servers.ps1 -Action stop

## mcp-status: Check MCP server status
mcp-status:
	@echo "🤖 Checking MCP server status..."
	pwsh -File scripts/mcp/manage-mcp-servers.ps1 -Action status

## mcp-health: Run health checks on MCP servers
mcp-health:
	@echo "🤖 Running MCP health checks..."
	pwsh -File scripts/mcp/manage-mcp-servers.ps1 -Action health

## mcp-logs: View MCP server logs
mcp-logs:
	@echo "🤖 Viewing MCP logs..."
	pwsh -File scripts/mcp/manage-mcp-servers.ps1 -Action logs

## nexus-start: Start Nexus Router
nexus-start:
	@echo "🌐 Starting Nexus Router..."
	docker-compose -f infra/docker/services/nexus-router/docker-compose.yml up -d
	@echo "✅ Nexus Router started on http://localhost:6000"
	@echo "📝 View logs with: make nexus-logs"

## nexus-stop: Stop Nexus Router
nexus-stop:
	@echo "🌐 Stopping Nexus Router..."
	docker-compose -f infra/docker/services/nexus-router/docker-compose.yml down

## nexus-status: Check Nexus Router status
nexus-status:
	@echo "🌐 Checking Nexus Router status..."
	@pwsh -Command "try { Invoke-WebRequest -Uri http://localhost:6000/health -UseBasicParsing | Select-Object StatusCode, Content } catch { Write-Host 'Nexus Router not running' }"

## nexus-logs: View Nexus Router logs
nexus-logs:
	@echo "🌐 Viewing Nexus Router logs..."
	docker logs -f nyra-nexus-router

## infra-up: Start all infrastructure
infra-up: docker-up mcp-start nexus-start
	@echo "🏗️ All infrastructure started!"
	@echo "✅ Docker services: Running"
	@echo "✅ MCP servers: Running"
	@echo "✅ Nexus Router: Running on http://localhost:6000"

## infra-down: Stop all infrastructure
infra-down: nexus-stop mcp-stop docker-down
	@echo "🏗️ All infrastructure stopped!"

## infra-status: Check infrastructure status
infra-status:
	@echo "🏗️ Infrastructure Status:"
	@echo ""
	@echo "🐳 Docker Services:"
	@docker ps --filter "name=nyra-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "🤖 MCP Servers:"
	@pwsh -File scripts/mcp/manage-mcp-servers.ps1 -Action status
	@echo ""
	@echo "🌐 Nexus Router:"
	@$(MAKE) -s nexus-status

## env-setup: Create .env symlink
env-setup:
	@echo "⚙️ Setting up .env symlink..."
	@pwsh -Command "if (Test-Path .env) { Remove-Item .env }; New-Item -ItemType SymbolicLink -Path .env -Target infra\configs\environments\.env.development -Force"
	@echo "✅ .env symlink created -> infra/configs/environments/.env.development"

## env-verify: Verify environment configuration
env-verify:
	@echo "⚙️ Verifying environment configuration..."
	@pwsh -Command "if (Test-Path .env) { Write-Host '✅ .env exists'; Get-Item .env | Select-Object LinkType, Target } else { Write-Host '❌ .env not found - run make env-setup' }"
	@echo ""
	@echo "Testing dotenv loading:"
	@node -e "require('dotenv').config(); console.log('✅ NODE_ENV:', process.env.NODE_ENV || 'not set')"

## bootstrap-orchestrator: Bootstrap orchestrator PC
bootstrap-orchestrator:
	@echo "🚀 Bootstrapping orchestrator PC (Minisforum UH680)..."
	@pwsh -Command "if (Test-Path scripts/operations/bootup.ps1) { & scripts/operations/bootup.ps1 } else { Write-Host '❌ Bootstrap script not found' }"

## bootstrap-worker: Bootstrap worker PC
bootstrap-worker:
	@echo "🚀 Bootstrapping worker PC..."
	@pwsh -Command "if (Test-Path scripts/operations/bootup.ps1) { & scripts/operations/bootup.ps1 } else { Write-Host '❌ Bootstrap script not found' }"

## archon-up: Start Archon OS stack via docker-compose.archon.yml
archon-up:
	@echo "🧠 Starting Archon OS stack (docker-compose.archon.yml)..."
	docker-compose -f infra/docker/docker-compose.archon.yml up -d

## archon-down: Stop Archon OS stack
archon-down:
	@echo "🧠 Stopping Archon OS stack..."
	docker-compose -f infra/docker/docker-compose.archon.yml down
