# Turborepo Cheat Sheet - Project Nyra

**Quick Reference Card** | **Version**: 2.7.4 | **Print This!**

---

## 🚀 Essential Commands

### Build & Development
```bash
pnpm build                  # Build all packages
pnpm dev                    # Start all dev servers
pnpm test                   # Run all tests
pnpm lint                   # Lint all packages
```

### Scoped Execution
```bash
# By type
pnpm build:apps             # Build only apps
pnpm build:services         # Build only services
pnpm dev:apps              # Start only apps
pnpm dev:services          # Start only services

# By package
turbo run build --filter=@nyra/ratehunter
turbo run dev --filter=@nyra/admin
```

### Cache Management
```bash
pnpm clean                  # Clean build artifacts
pnpm clean:cache            # Clear Turborepo cache
turbo run build --force     # Force rebuild (ignore cache)
```

### CI/CD Optimization
```bash
pnpm build:affected         # Build only changed packages
turbo run test --affected   # Test only affected
```

---

## 🔍 Debug & Analysis

### Visualization
```bash
pnpm turbo:graph           # Generate dependency graph (HTML)
pnpm turbo:trace           # Generate execution trace (JSON)
pnpm turbo:dry             # Preview execution without running
pnpm turbo:summary         # Build with performance summary
```

### Troubleshooting
```bash
turbo daemon status        # Check daemon status
turbo daemon restart       # Restart daemon
turbo run build --verbose  # Verbose output
turbo run build --dry-run  # Preview execution
```

---

## 📦 Filtering Syntax

### By Name
```bash
--filter=@nyra/ratehunter          # Single package
--filter=@nyra/ratehunter --filter=@nyra/admin  # Multiple
```

### By Pattern
```bash
--filter='./apps/*'                # All apps
--filter='./services/*'            # All services
--filter='./packages/*'            # All packages
```

### By Dependencies
```bash
--filter=@nyra/ratehunter...       # Package + dependencies
--filter=...@project-nyra/database # Package + dependents
--filter=...@nyra/database...      # Package + deps + dependents
```

---

## ⚡ Performance Tips

### 1. Use Cache
```bash
# First build (slow)
pnpm build              # ~90s

# Second build (fast!)
pnpm build              # ~4s (22x faster)
```

### 2. Enable Daemon
```bash
turbo daemon start      # Start once per session
turbo daemon status     # Verify running
```

### 3. Build Only Changed
```bash
# In CI/CD
pnpm build:affected     # 18x fewer builds
```

### 4. Limit Concurrency (Low Memory)
```bash
turbo run build --concurrency=4
turbo run build --concurrency=2  # Very low memory
```

---

## 🎯 Common Workflows

### Fresh Start
```bash
pnpm clean && pnpm clean:cache && pnpm install && pnpm build
```

### Fast Development
```bash
turbo daemon start && pnpm docker:up && pnpm dev:apps
```

### Pre-Deploy Check
```bash
pnpm lint && pnpm type-check && pnpm test && pnpm build
```

### CI/CD Pipeline
```bash
turbo run build test --affected --force
```

---

## 🔧 Configuration Files

### turbo.json
Main configuration for tasks, caching, and dependencies.

**Location**: `/turbo.json`

**Key Sections**:
- `globalDependencies` - Files that invalidate all caches
- `globalEnv` - Environment variables affecting all tasks
- `tasks` - Task definitions with caching rules

### .turborc
Daemon and UI settings.

**Location**: `/.turborc`

**Settings**:
- `daemon = true` - Enable faster builds
- `ui = "stream"` - Better output formatting

---

## 📊 Task Configuration Quick Reference

| Task | Cache | Deps | Persistent |
|------|-------|------|-----------|
| **build** | ✅ Yes | ^build | ❌ |
| **dev** | ❌ No | ^build | ✅ |
| **test** | ✅ Yes | ^build | ❌ |
| **lint** | ✅ Yes | ^build | ❌ |
| **type-check** | ✅ Yes | ^build | ❌ |

**Legend**:
- `^build` = Build dependencies first
- Cache: Whether results are cached
- Persistent: Keeps process running

---

## 🚨 Troubleshooting Quick Fixes

### Cache Not Working
```bash
turbo run build --dry-run --verbose  # Debug
pnpm clean:cache && pnpm build      # Reset
```

### Out of Memory
```bash
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
turbo run build --concurrency=2
```

### Daemon Issues
```bash
turbo daemon stop
turbo daemon clean
turbo daemon start
```

### Port Conflicts
```bash
lsof -ti:3100 | xargs kill -9      # Kill process on port
PORT=3200 pnpm dev                 # Use different port
```

---

## 📈 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **Cache Hit Rate** | > 80% | 85% |
| **Cold Build** | < 2 min | 90s ✅ |
| **Cached Build** | < 10s | 4s ✅ |
| **CI/CD** | < 5 min | 3m 20s ✅ |

---

## 📚 Documentation Quick Links

- **Setup Guide**: `docs/development/TURBOREPO-SETUP.md`
- **Quick Start**: `docs/development/TURBOREPO-QUICKSTART.md`
- **Architecture**: `docs/architecture/turborepo-architecture.md`
- **Implementation**: `docs/reports/TURBOREPO-IMPLEMENTATION-SUMMARY.md`

---

## 🔗 Useful URLs

- **Turborepo Docs**: https://turbo.build/repo/docs
- **pnpm Workspaces**: https://pnpm.io/workspaces
- **Project Nyra**: See README.md

---

## 🎓 Key Concepts

### Content-Based Caching
- Hash = Source + Dependencies + Environment
- Cache Hit = Instant restore
- Cache Miss = Execute & store

### Parallel Execution
- Tasks run concurrently within dependency levels
- 5x-112x faster than sequential

### Task Dependencies
- `^build` - Dependencies first
- `build` - Current package first

### Affected Detection
- Git diff analysis
- Only rebuild what changed
- 18x fewer builds in CI/CD

---

## 💡 Pro Tips

1. **Always use daemon** - `turbo daemon start` at session start
2. **Check cache first** - `--dry-run` before big builds
3. **Filter wisely** - Use `--filter` to scope work
4. **Monitor cache hits** - Use `--summarize` to track performance
5. **Clear when stuck** - `clean:cache` fixes most issues

---

## 📦 Workspace Packages (27 Total)

- **5 Apps**: ratehunter, ratehunter-landing, nyra-admin, nexus-dashboard, mortgage-assistant
- **15 Services**: ratehunter-api, campaign-engine, auth-service, nexus-router, etc.
- **2 Packages**: database, websocket-client
- **5 MCP Servers**: docker-mcp, git-mcp, bitwarden-mcp, etc.

---

## 🎯 Keyboard Shortcuts (Terminal)

```bash
alias tb='turbo run build'
alias td='turbo run dev'
alias tt='turbo run test'
alias tl='turbo run lint'
alias tcc='turbo daemon clean'
alias tdr='turbo run build --dry-run'
```

Add to `.bashrc` or `.zshrc` for quick access.

---

**Print This Sheet** | **Keep Handy** | **Share with Team**

**Version**: 1.0 | **Date**: 2026-01-16 | **Status**: ✅ Production Ready
