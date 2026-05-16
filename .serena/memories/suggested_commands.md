## Key Development Commands

**Package Management**:
- `pnpm install` - Install dependencies
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all code

**Nexus Router** (services/nexus-router):
- `pnpm dev` - Start in development mode
- `pnpm build` - Build TypeScript
- `pnpm start` - Run production build
- `pnpm test` - Run unit tests

**Docker/Infrastructure**:
- `make health-orchestrator` - Check orchestrator health
- `docker-compose up -d` - Start services (from infra/hosts/orchestrator)
- `docker-compose down` - Stop services

**Git**:
- `git status` - Show changes
- `git diff` - Show diffs
- `git log` - Show commit history
- `git submodule update --init --recursive` - Initialize submodules

**Environment**:
- Source `.env` file before running services
- Check `.env.example` for required variables
- MCP_SERVERS env var: JSON array of MCP server configs
