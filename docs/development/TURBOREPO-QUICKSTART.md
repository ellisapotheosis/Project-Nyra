# Turborepo Quick Start - Project Nyra

**5-Minute Setup Guide** | [Full Documentation](./TURBOREPO-SETUP.md) | [Architecture](../architecture/turborepo-architecture.md)

---

## 🚀 Getting Started

### Prerequisites
```bash
# Verify prerequisites
node --version  # Should be >= 20.0.0
pnpm --version  # Should be >= 10.0.0
turbo --version # Should be >= 2.4.0
```

### Start Daemon (Optional but Recommended)
```bash
# Start Turborepo daemon for faster builds
turbo daemon start

# Check daemon status
turbo daemon status
```

---

## 📦 Common Commands

### Build Commands
```bash
# Build all packages
pnpm build

# Build specific package
pnpm build --filter=@nyra/ratehunter

# Build only changed packages (CI/CD)
pnpm build:affected

# Build only apps
pnpm build:apps

# Build only services
pnpm build:services
```

### Development Commands
```bash
# Start all dev servers
pnpm dev

# Start only apps
pnpm dev:apps

# Start only services
pnpm dev:services

# Start specific package
pnpm dev --filter=@nyra/ratehunter
```

### Testing Commands
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Test specific package
pnpm test --filter=@nyra/ratehunter
```

### Linting & Type Checking
```bash
# Lint all packages
pnpm lint

# Lint with auto-fix
pnpm lint:fix

# Type check all packages
pnpm type-check

# Format code
pnpm format
```

### Cache Management
```bash
# Clear Turborepo cache
pnpm clean:cache

# Clean build artifacts
pnpm clean

# Force rebuild (ignore cache)
turbo run build --force
```

---

## 🎯 Advanced Usage

### Filtering Packages

#### By Name
```bash
# Single package
turbo run build --filter=@nyra/ratehunter

# Multiple packages
turbo run build --filter=@nyra/ratehunter --filter=@nyra/admin
```

#### By Path Pattern
```bash
# All apps
turbo run build --filter='./apps/*'

# All services
turbo run build --filter='./services/*'

# All MCP servers
turbo run build --filter='./mcp-servers/*'
```

#### By Dependencies
```bash
# Package AND its dependencies
turbo run build --filter=@nyra/ratehunter...

# Package AND its dependents
turbo run build --filter=...@project-nyra/database

# Package, dependencies, AND dependents
turbo run build --filter=...@project-nyra/database...
```

### Parallel Execution Control
```bash
# Limit concurrent tasks (useful for low memory)
turbo run build --concurrency=4

# Continue on errors
turbo run test --continue
```

### Debugging & Analysis
```bash
# Dry run (preview without executing)
turbo run build --dry-run

# Verbose output
turbo run build --verbose

# Generate dependency graph
turbo run build --graph=dependency-graph.html

# Generate execution trace
turbo run build --graph=trace.json

# Build summary
turbo run build --summarize
```

---

## 📊 Performance Tips

### 1. Use Cache Effectively
```bash
# First build (slow)
pnpm build  # ~90s

# Second build (cached - fast!)
pnpm build  # ~4s

# Clear cache to force rebuild
pnpm clean:cache && pnpm build
```

### 2. Build Only What Changed
```bash
# In CI/CD, only build affected packages
pnpm build:affected  # 18x fewer builds
```

### 3. Use Daemon for Speed
```bash
# Start daemon once per session
turbo daemon start

# Daemon provides:
# - Faster task scheduling
# - Better cache management
# - Reduced startup time
```

### 4. Parallelize Development
```bash
# Terminal 1: Infrastructure
pnpm docker:up

# Terminal 2: Apps
pnpm dev:apps

# Terminal 3: Services
pnpm dev:services
```

---

## 🔍 Troubleshooting

### Issue: Tasks Always Execute (Cache Not Working)
```bash
# Debug cache
turbo run build --dry-run --verbose

# Clear cache and rebuild
pnpm clean:cache && pnpm build
```

### Issue: Out of Memory
```bash
# Reduce concurrency
turbo run build --concurrency=2

# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

### Issue: Daemon Issues
```bash
# Restart daemon
turbo daemon stop
turbo daemon clean
turbo daemon start
```

### Issue: Port Conflicts in Dev
```bash
# Kill process on port
lsof -ti:3100 | xargs kill -9

# Or use different port
PORT=3200 pnpm dev --filter=@nyra/ratehunter
```

---

## 📈 Expected Performance

| Task | First Run | Cached Run | Speedup |
|------|-----------|------------|---------|
| **build** | 90s | 4s | 22x |
| **test** | 60s | 3s | 20x |
| **lint** | 30s | 2s | 15x |
| **type-check** | 20s | 1s | 20x |

**Target Cache Hit Rate**: > 80%

---

## 🎓 Learning More

### Essential Concepts

1. **Task Dependencies**: `^build` means "build dependencies first"
2. **Caching**: Based on content hashing (source + deps + env)
3. **Parallel Execution**: Runs tasks concurrently within dependency levels
4. **Affected Detection**: Only rebuild changed packages

### Key Files
- `turbo.json` - Task pipeline configuration
- `.turborc` - Daemon and UI settings
- `pnpm-workspace.yaml` - Workspace packages

### Resources
- [Full Setup Guide](./TURBOREPO-SETUP.md)
- [Architecture Overview](../architecture/turborepo-architecture.md)
- [Turborepo Docs](https://turbo.build/repo/docs)
- [Project Nyra README](../../README.md)

---

## 🔗 Integration with Other Tools

### With Claude Flow
```bash
# Pre-task: Check affected packages
npx @claude-flow/cli@latest hooks pre-task \
  --description "Update auth service" \
  --context "$(turbo run build --dry-run --affected)"
```

### With Git Hooks
```bash
# .husky/pre-commit
turbo run lint type-check --affected
```

### With Docker
```bash
# Build services for Docker
pnpm build:services
docker-compose up
```

---

## 🎯 Quick Recipes

### Recipe 1: Fresh Start
```bash
pnpm clean
pnpm clean:cache
pnpm install
pnpm build
```

### Recipe 2: Fast Development
```bash
turbo daemon start
pnpm docker:up
pnpm dev:apps
```

### Recipe 3: Pre-Deploy Check
```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

### Recipe 4: CI/CD Optimization
```bash
# In CI pipeline
turbo run build test --affected --force
```

---

## 📝 Workspace Packages

### Applications (5)
- `@nyra/ratehunter` - Next.js (port 3100)
- `ratehunter-landing` - Next.js landing page
- `@nyra/admin` - Vite + React (port 3101)
- `@nyra/nexus-dashboard` - Monitoring dashboard
- `mortgage-assistant` - AI assistant app

### Services (15)
- `ratehunter-api` - Express + TypeScript
- `@nyra/campaign-engine` - Python FastAPI
- `@nyra/auth-service` - Authentication service
- `@project-nyra/nexus-router` - API Gateway
- ...and 11 more services

### Shared Packages (2)
- `@project-nyra/database` - Prisma schema
- `@project-nyra/websocket-client` - WebSocket client

---

**Need More Help?**
- See [Full Documentation](./TURBOREPO-SETUP.md) for detailed guides
- Check [Architecture](../architecture/turborepo-architecture.md) for system design
- Run `turbo --help` for CLI reference

---

**Last Updated**: 2026-01-16
**Status**: ✅ Ready to Use
