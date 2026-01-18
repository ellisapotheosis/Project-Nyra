# Turborepo Setup Guide - Project Nyra

**Last Updated**: 2026-01-16
**Turborepo Version**: 2.4.0
**Author**: System Architecture Designer

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Pipeline Tasks](#pipeline-tasks)
5. [Caching Strategy](#caching-strategy)
6. [Usage Examples](#usage-examples)
7. [Advanced Features](#advanced-features)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting](#troubleshooting)
10. [Remote Caching (Optional)](#remote-caching-optional)

---

## Overview

Turborepo is configured for the Project Nyra monorepo to enable:

- **Parallel execution** of tasks across apps and services
- **Intelligent caching** to avoid redundant work
- **Task dependency management** with topological sorting
- **Incremental builds** and affected package detection
- **Performance monitoring** with built-in tracing

### Repository Structure

```
project-nyra/
├── apps/                    # 5 applications
│   ├── ratehunter/         # Next.js (port 3100)
│   ├── ratehunter-landing/ # Next.js landing page
│   ├── nyra-admin/         # Vite + React (port 3101)
│   ├── nexus-dashboard/    # Monitoring dashboard
│   └── mortgage-assistant/ # AI assistant app
├── services/               # 15 microservices
│   ├── ratehunter-api/    # Express + TypeScript
│   ├── campaign-engine/   # Python FastAPI
│   ├── auth-service/      # Authentication
│   └── ...
├── packages/              # 2 shared packages
│   ├── database/         # Prisma schema
│   └── websocket-client/ # Shared WebSocket client
└── turbo.json            # Turborepo configuration
```

---

## Installation

Turborepo is already installed as a dev dependency.

```bash
# Already installed
pnpm add -D turbo

# Verify installation
turbo --version  # Should show 2.4.0 or later
```

### Prerequisites

- **Node.js**: >= 20.0.0
- **pnpm**: >= 10.0.0
- **Git**: For affected package detection

---

## Configuration

### turbo.json

The main configuration file defines task pipelines, caching rules, and dependencies.

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    "**/.env",
    ".env",
    "tsconfig.json",
    "package.json"
  ],
  "globalEnv": [
    "NODE_ENV",
    "DATABASE_URL",
    "REDIS_URL",
    "ANTHROPIC_API_KEY"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**", ".next/**", "build/**", "out/**"],
      "env": ["NEXT_PUBLIC_*", "NODE_ENV"]
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

### Key Configuration Concepts

#### 1. **globalDependencies**
Files that invalidate all caches when changed:
- Environment files (`.env`, `.env.*`)
- TypeScript configuration (`tsconfig.json`)
- Package manifests (`package.json`)

#### 2. **globalEnv**
Environment variables that affect all tasks:
- `NODE_ENV` - Runtime environment
- `DATABASE_URL` - Database connection
- `REDIS_URL` - Redis connection
- `ANTHROPIC_API_KEY` - AI service key

#### 3. **Task Dependencies**
- `dependsOn: ["^build"]` - Wait for dependencies to build first
- `dependsOn: ["build"]` - Wait for current package to build first

#### 4. **Inputs**
Files that affect task cache invalidation:
- `$TURBO_DEFAULT$` - Source files (default: `src/**`)
- Custom patterns like `.env*`, `jest.config.*`

#### 5. **Outputs**
Artifacts produced by tasks (cached and restored):
- Build outputs: `dist/**`, `.next/**`, `build/**`
- Test outputs: `coverage/**`, `test-results/**`
- Generated code: `.prisma/**`, `node_modules/.prisma/**`

---

## Pipeline Tasks

### Build Tasks

#### `build`
Builds all packages in topological order.

```bash
pnpm build
```

**Configuration:**
```json
{
  "dependsOn": ["^build"],
  "inputs": ["$TURBO_DEFAULT$", ".env*"],
  "outputs": ["dist/**", ".next/**", "build/**"],
  "env": ["NEXT_PUBLIC_*", "NODE_ENV"]
}
```

**Behavior:**
- Builds dependencies first (`^build`)
- Caches build artifacts
- Invalidates on source or env changes
- Parallel execution within each dependency level

#### `build:affected`
Builds only packages affected by git changes.

```bash
pnpm build:affected
```

**Use Case:** CI/CD optimization - only build what changed

#### `build:apps`
Builds only applications (not services).

```bash
pnpm build:apps
```

#### `build:services`
Builds only services (not apps).

```bash
pnpm build:services
```

---

### Development Tasks

#### `dev`
Starts all development servers in parallel.

```bash
pnpm dev
```

**Configuration:**
```json
{
  "dependsOn": ["^build"],
  "cache": false,
  "persistent": true,
  "env": ["NEXT_PUBLIC_*", "DATABASE_URL", "REDIS_URL", "PORT"]
}
```

**Behavior:**
- No caching (files change frequently in dev)
- Persistent processes (keeps servers running)
- Watches for file changes
- Builds dependencies first

#### `dev:apps`
Starts only application development servers.

```bash
pnpm dev:apps
```

#### `dev:services`
Starts only service development servers.

```bash
pnpm dev:services
```

---

### Testing Tasks

#### `test`
Runs all tests across packages.

```bash
pnpm test
```

**Configuration:**
```json
{
  "dependsOn": ["^build"],
  "inputs": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "tests/**",
    "__tests__/**",
    "jest.config.*",
    "tsconfig.json"
  ],
  "outputs": ["coverage/**"]
}
```

**Features:**
- Caches test results
- Invalidates on source or config changes
- Generates coverage reports

#### `test:watch`
Runs tests in watch mode (no caching).

```bash
pnpm test:watch
```

#### `test:e2e`
Runs end-to-end tests.

```bash
pnpm test:e2e
```

#### `test:coverage`
Runs tests with coverage reporting.

```bash
pnpm test:coverage
```

---

### Linting & Type Checking

#### `lint`
Runs ESLint across all packages.

```bash
pnpm lint
```

**Configuration:**
```json
{
  "dependsOn": ["^build"],
  "inputs": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "eslint.config.*",
    ".eslintrc*",
    "tsconfig.json"
  ]
}
```

#### `lint:fix`
Runs ESLint with auto-fix.

```bash
pnpm lint:fix
```

#### `type-check`
Runs TypeScript type checking.

```bash
pnpm type-check
```

**Configuration:**
```json
{
  "dependsOn": ["^build"],
  "inputs": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "tsconfig.json"
  ]
}
```

---

### Database Tasks

#### `prisma:generate`
Generates Prisma Client from schema.

```bash
pnpm db:generate
```

**Configuration:**
```json
{
  "cache": true,
  "outputs": [
    "node_modules/.prisma/**",
    ".prisma/**"
  ]
}
```

#### `prisma:migrate`
Runs database migrations (no caching).

```bash
pnpm db:migrate
```

---

### Utility Tasks

#### `clean`
Removes build artifacts from all packages.

```bash
pnpm clean
```

#### `clean:cache`
Clears Turborepo cache.

```bash
pnpm clean:cache
```

#### `format`
Formats code with Prettier.

```bash
pnpm format
```

---

## Caching Strategy

### Cache Behavior

Turborepo uses **content-based hashing** to determine cache hits:

1. **Hash Inputs**: Source files + dependencies + env vars
2. **Check Cache**: Look for matching hash in local cache
3. **Execute or Restore**:
   - **Cache Hit**: Restore outputs from cache (instant)
   - **Cache Miss**: Execute task and cache outputs

### Cache Location

**Local Cache:**
```
./node_modules/.cache/turbo/
```

### What Gets Cached

- Build artifacts (`dist/`, `.next/`, `build/`)
- Test coverage reports (`coverage/`)
- Generated code (`.prisma/`)
- Lint results

### What Doesn't Get Cached

- Development servers (`dev`)
- Database migrations (`migrate`)
- Watch mode tasks (`test:watch`)
- Cleanup tasks (`clean`)

### Cache Invalidation

Cache is invalidated when:
- Source files change (tracked by `inputs`)
- Dependencies change (`package.json`, `pnpm-lock.yaml`)
- Global dependencies change (`.env`, `tsconfig.json`)
- Environment variables change (`globalEnv`, task `env`)

### Manual Cache Control

```bash
# Clear all cache
pnpm clean:cache

# Force execution (ignore cache)
turbo run build --force

# Verify cache without execution
turbo run build --dry-run
```

---

## Usage Examples

### Basic Workflows

#### Full Build from Scratch
```bash
# Clean everything and rebuild
pnpm clean
pnpm clean:cache
pnpm build
```

#### Development Workflow
```bash
# Start all services in parallel
pnpm dev

# Or start apps and services separately
pnpm dev:apps      # Terminal 1
pnpm dev:services  # Terminal 2
```

#### Pre-Commit Workflow
```bash
# Run all checks before committing
pnpm type-check
pnpm lint
pnpm test
pnpm build
```

### Advanced Workflows

#### Affected Builds (CI/CD)
```bash
# Only build packages affected by git changes
pnpm build:affected

# Test only affected packages
turbo run test --affected
```

#### Scoped Execution
```bash
# Run task in specific package
turbo run build --filter=@nyra/ratehunter

# Run task in multiple packages
turbo run build --filter=@nyra/ratehunter --filter=@nyra/admin

# Run task in all apps
turbo run build --filter='./apps/*'

# Run task in all services
turbo run build --filter='./services/*'
```

#### Dependency Filtering
```bash
# Build package AND its dependencies
turbo run build --filter=@nyra/ratehunter...

# Build package AND its dependents
turbo run build --filter=...@nyra/database

# Build package, dependencies, AND dependents
turbo run build --filter=...@nyra/database...
```

---

## Advanced Features

### Task Visualization

#### Dependency Graph
```bash
# Generate HTML visualization
pnpm turbo:graph

# Opens: dependency-graph.html
```

#### Execution Trace
```bash
# Generate JSON trace
pnpm turbo:trace

# View in Chrome DevTools Performance panel
# chrome://tracing -> Load trace.json
```

### Dry Run Mode

```bash
# Preview what will execute without running
pnpm turbo:dry

# Output shows:
# - Tasks to execute
# - Cache hits/misses
# - Execution order
```

### Summary Reports

```bash
# Generate execution summary
pnpm turbo:summary

# Creates: .turbo/runs/<hash>.json
# Shows:
# - Total execution time
# - Cache performance
# - Task durations
# - Cache hit rate
```

### Parallel Execution Control

```bash
# Limit parallel tasks
turbo run build --concurrency=4

# Disable parallelism
turbo run build --concurrency=1

# Continue on error
turbo run test --continue
```

---

## Performance Optimization

### Best Practices

#### 1. **Proper Task Dependencies**
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]  // Build dependencies first
    },
    "test": {
      "dependsOn": ["build"]   // Test after build
    }
  }
}
```

#### 2. **Minimal Inputs**
Only track files that actually affect the task:
```json
{
  "inputs": [
    "src/**/*.ts",        // Source files
    "tsconfig.json",      // Config only
    "jest.config.js"      // Test config only
  ]
}
```

#### 3. **Explicit Outputs**
List all generated artifacts:
```json
{
  "outputs": [
    "dist/**",
    ".next/**",
    "coverage/**"
  ]
}
```

#### 4. **Environment Variable Scoping**
Only include vars that affect the task:
```json
{
  "env": ["NEXT_PUBLIC_*"]  // Only public env vars
}
```

### Performance Monitoring

```bash
# Run with performance profiling
turbo run build --profile=profile.json

# Analyze with Chrome DevTools:
# chrome://tracing -> Load profile.json
```

### Cache Hit Rate

```bash
# View cache statistics
turbo run build --summarize

# Look for "Cache Hit" percentage
# Target: > 80% for optimal performance
```

---

## Troubleshooting

### Common Issues

#### Cache Not Working

**Symptom**: Tasks always execute, never hit cache

**Causes:**
1. **Unstable inputs**: Files changing unexpectedly
   ```bash
   # Check git status for tracked files
   git status

   # Ensure build doesn't modify source
   ```

2. **Environment variables**: Changing between runs
   ```bash
   # Use consistent env vars
   # Add to globalEnv if needed
   ```

3. **Non-deterministic outputs**: Files with timestamps/randomness
   ```bash
   # Ensure builds are reproducible
   # Use consistent timestamps
   ```

**Solution:**
```bash
# Debug cache misses
turbo run build --dry-run --verbose

# Clear cache and rebuild
pnpm clean:cache
pnpm build
```

#### Out of Memory

**Symptom**: `FATAL ERROR: Reached heap limit`

**Solution:**
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# Reduce concurrency
turbo run build --concurrency=2
```

#### Stuck Tasks

**Symptom**: Tasks hang or don't complete

**Solution:**
```bash
# Kill daemon and restart
turbo daemon stop
turbo daemon clean
pnpm build
```

#### Port Conflicts in Dev Mode

**Symptom**: `Error: Port 3100 already in use`

**Solution:**
```bash
# Check running processes
lsof -ti:3100 | xargs kill -9

# Or start with different ports
PORT=3200 pnpm dev
```

### Debug Commands

```bash
# Verbose output
turbo run build --verbose

# Debug mode
DEBUG=turbo* turbo run build

# Daemon status
turbo daemon status

# Restart daemon
turbo daemon restart
```

---

## Remote Caching (Optional)

Remote caching shares build cache across team members and CI/CD.

### Setup with Vercel

1. **Link Project:**
   ```bash
   npx turbo login
   npx turbo link
   ```

2. **Verify:**
   ```bash
   turbo run build
   # Look for "Remote Cache: HIT" or "Remote Cache: MISS"
   ```

### Setup with Custom Server

1. **Install turbo-cache-server:**
   ```bash
   pnpm add -D turbo-cache-server
   ```

2. **Configure turbo.json:**
   ```json
   {
     "remoteCache": {
       "enabled": true,
       "url": "https://cache.example.com"
     }
   }
   ```

3. **Start cache server:**
   ```bash
   npx turbo-cache-server --port 9080
   ```

### Environment Variables

```bash
# Enable remote caching
TURBO_TOKEN=your-token-here
TURBO_TEAM=your-team-name

# Custom cache URL
TURBO_API=https://cache.example.com

# Disable remote caching (use local only)
TURBO_REMOTE_CACHE_ENABLED=false
```

---

## Comparison: Turborepo vs Alternatives

| Feature | Turborepo | Nx | Lerna |
|---------|-----------|----|----|
| **Cache Strategy** | Content-based | Content-based | None |
| **Parallel Execution** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Remote Caching** | ✅ Yes (Vercel) | ✅ Yes (Nx Cloud) | ❌ No |
| **Task Pipelines** | ✅ Yes | ✅ Yes | ⚠️ Limited |
| **Affected Detection** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Configuration** | Simple JSON | Complex | Limited |
| **Performance** | Excellent | Excellent | Good |
| **Learning Curve** | Low | Medium | Low |

**Why Turborepo for Project Nyra:**
- Simple configuration (`turbo.json`)
- Excellent performance with minimal setup
- Natural fit for pnpm workspaces
- Growing community and ecosystem

---

## Performance Metrics

### Expected Performance

| Task | First Run | Cached Run | Speedup |
|------|-----------|------------|---------|
| **build** | 2-3 min | < 5 sec | 30-40x |
| **test** | 1-2 min | < 3 sec | 25-35x |
| **lint** | 30-45 sec | < 2 sec | 20-25x |
| **type-check** | 20-30 sec | < 2 sec | 15-20x |

### Parallel Execution Gains

| Packages | Sequential | Parallel | Speedup |
|----------|-----------|----------|---------|
| 5 apps | 10 min | 3 min | 3.3x |
| 15 services | 30 min | 7 min | 4.3x |
| 22 total | 40 min | 8 min | 5.0x |

---

## Integration with Claude Flow

Turborepo integrates seamlessly with Claude Flow for multi-agent development:

### Pre-Task Analysis
```bash
# Before starting work, check affected packages
npx @claude-flow/cli@latest hooks pre-task \
  --description "Update authentication service" \
  --context "$(turbo run build --dry-run --affected)"
```

### Post-Task Learning
```bash
# After completing work, store performance metrics
npx @claude-flow/cli@latest hooks post-task \
  --task-id "auth-update" \
  --success true \
  --metrics "$(turbo run build --summarize)"
```

### Swarm Coordination
```bash
# Initialize swarm with Turborepo awareness
npx @claude-flow/cli@latest swarm init \
  --topology hierarchical \
  --max-agents 8 \
  --metadata "$(cat turbo.json)"
```

---

## Next Steps

1. **Explore Cache Performance:**
   ```bash
   pnpm build
   pnpm clean
   pnpm build  # Should be much faster
   ```

2. **Generate Dependency Graph:**
   ```bash
   pnpm turbo:graph
   # Open dependency-graph.html in browser
   ```

3. **Setup Remote Caching:**
   ```bash
   npx turbo login
   npx turbo link
   ```

4. **Optimize CI/CD:**
   - Use `--affected` for faster builds
   - Enable remote caching
   - Monitor cache hit rates

---

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Project Nyra README](../../README.md)
- [Claude Flow V3 Setup](../guides/CLAUDE-FLOW-V3-SETUP.md)

---

## Architecture Decision Record

**Decision**: Use Turborepo for monorepo task orchestration

**Rationale:**
1. **Performance**: Content-based caching eliminates redundant work
2. **Simplicity**: Single `turbo.json` configuration file
3. **Compatibility**: Natural fit with pnpm workspaces
4. **Scalability**: Handles 20+ packages efficiently
5. **Ecosystem**: Strong Vercel support and community

**Alternatives Considered:**
- **Nx**: More complex configuration, similar performance
- **Lerna**: Legacy tool, no caching, slower builds
- **Rush**: Microsoft-focused, complex setup

**Trade-offs:**
- **Pros**: Fast builds, simple config, excellent DX
- **Cons**: Relatively new (vs Lerna), Vercel-centric remote caching

---

**Last Updated**: 2026-01-16
**Maintainer**: System Architecture Designer
**Status**: ✅ Production Ready
