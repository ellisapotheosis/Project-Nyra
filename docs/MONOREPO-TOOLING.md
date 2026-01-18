# Monorepo Tooling Guide

> Comprehensive guide to Project Nyra's monorepo optimization tools and workflows

## 📋 Table of Contents

- [Overview](#overview)
- [Installed Tools](#installed-tools)
- [Workspace Protocol](#workspace-protocol)
- [Dependency Management](#dependency-management)
- [Version Management](#version-management)
- [Code Generation](#code-generation)
- [Build Optimization](#build-optimization)
- [Type Checking](#type-checking)
- [Daily Workflows](#daily-workflows)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

Project Nyra uses a sophisticated monorepo setup with pnpm workspaces and Turborepo, enhanced with specialized tools for dependency management, versioning, and code generation.

### Architecture

```
project-nyra/
├── apps/              # Frontend applications
├── services/          # Backend microservices
├── packages/          # Shared libraries
├── mcp-servers/       # MCP server implementations
├── tools/             # Development tools
├── turbo/
│   └── generators/    # Turbo gen templates
├── .changeset/        # Changesets configuration
├── .manypkg/          # Manypkg configuration
├── .syncpackrc.json   # Syncpack configuration
└── turbo.json         # Turborepo configuration
```

---

## Installed Tools

### 1. **@turbo/gen** (v2.7.4)

**Purpose**: Code generation for consistent workspace packages, components, hooks, and API routes.

**Key Features**:
- Template-based generation
- Interactive CLI prompts
- PascalCase/kebab-case formatting
- Multi-target generation (apps, services, packages)

**Documentation**: [Turborepo Generators](https://turbo.build/repo/docs/core-concepts/monorepos/code-generation)

### 2. **syncpack** (v13.0.4)

**Purpose**: Keep package.json files in sync across the monorepo.

**Key Features**:
- Version consistency enforcement
- Workspace protocol validation
- Semver range standardization
- Automated fixing

**Documentation**: [Syncpack Docs](https://jamiemason.github.io/syncpack/)

### 3. **@manypkg/cli** (v0.25.1)

**Purpose**: Monorepo utilities for workspace validation and management.

**Key Features**:
- Workspace protocol enforcement
- Internal dependency validation
- Package.json integrity checks
- Automated fixes

**Documentation**: [Manypkg GitHub](https://github.com/Thinkmill/manypkg)

### 4. **@changesets/cli** (v2.29.8)

**Purpose**: Versioning and changelog management for monorepo packages.

**Key Features**:
- Semantic versioning
- Automated changelogs
- Package linking
- Publishing workflows

**Documentation**: [Changesets Docs](https://github.com/changesets/changesets)

---

## Workspace Protocol

### What is Workspace Protocol?

The `workspace:*` protocol is pnpm's way of linking internal packages without publishing to npm.

### Configuration

**In `.manypkg/config.json`**:
```json
{
  "workspaceProtocol": "workspace"
}
```

**In `.syncpackrc.json`**:
```json
{
  "versionGroups": [
    {
      "label": "Use workspace protocol for internal packages",
      "dependencies": ["@nyra/**"],
      "dependencyTypes": ["prod", "dev"],
      "pinVersion": "workspace:*"
    }
  ]
}
```

### Example Usage

```json
// apps/ratehunter/package.json
{
  "dependencies": {
    "@nyra/ui-components": "workspace:*",
    "@nyra/api-client": "workspace:*"
  }
}
```

### Benefits

1. **Always up-to-date**: Changes reflect immediately
2. **No version conflicts**: Single source of truth
3. **Faster installs**: No network requests
4. **Type safety**: TypeScript references work correctly

---

## Dependency Management

### Syncpack Configuration

**File**: `.syncpackrc.json`

#### Version Groups

Ensures consistent versions across workspaces:

```json
{
  "versionGroups": [
    {
      "label": "Ensure React versions are consistent",
      "dependencies": ["react", "react-dom"],
      "packages": ["**"],
      "pinVersion": "^18.3.1"
    },
    {
      "label": "Ensure TypeScript versions are consistent",
      "dependencies": ["typescript"],
      "packages": ["**"],
      "pinVersion": "^5.7.0"
    }
  ]
}
```

#### Semver Groups

Controls how version ranges are specified:

```json
{
  "semverGroups": [
    {
      "label": "Use ~ for patch updates on build tools",
      "dependencies": ["turbo", "@turbo/**"],
      "packages": ["**"],
      "range": "~"
    },
    {
      "label": "Use ^ for minor updates on most packages",
      "dependencies": ["**"],
      "packages": ["**"],
      "range": "^"
    }
  ]
}
```

### Commands

```bash
# Check for mismatches
pnpm run monorepo:syncpack

# Fix mismatches automatically
pnpm run monorepo:syncpack:fix

# Format package.json files
pnpm run monorepo:syncpack:format

# Lint package.json files
pnpm run monorepo:syncpack:lint
```

### Manypkg Validation

```bash
# Check workspace integrity
pnpm run monorepo:manypkg

# Fix workspace issues
pnpm run monorepo:manypkg:fix

# Run all checks
pnpm run monorepo:check

# Fix all issues
pnpm run monorepo:fix
```

---

## Version Management

### Changesets Workflow

Changesets follows a two-step process:

1. **Add changeset**: Describe what changed
2. **Version & publish**: Apply versions and create changelogs

### Configuration

**File**: `.changeset/config.json`

```json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [
    ["@nyra/admin", "@nyra/crm"],
    ["@nyra/api-*"]
  ],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": [
    "@nyra/internal-*",
    "*-test-utils"
  ]
}
```

#### Key Settings

- **linked**: Packages that should always version together
- **ignore**: Packages excluded from versioning
- **updateInternalDependencies**: How to update dependents ("patch" or "minor")

### Commands

```bash
# Create a new changeset
pnpm run monorepo:changeset

# Update package versions based on changesets
pnpm run monorepo:changeset:version

# Check changeset status
pnpm run monorepo:changeset:status

# Publish to npm (production use)
pnpm run monorepo:changeset:publish
```

### Creating a Changeset

```bash
$ pnpm run monorepo:changeset

🦋  Which packages would you like to include? · @nyra/ui-components
🦋  Which packages should have a major bump? · No items were selected
🦋  Which packages should have a minor bump? · @nyra/ui-components
🦋  Please enter a summary for this change (this will be in the changelogs).
🦋  Summary · Added new Button component with variants
```

This creates a file in `.changeset/` with the change description.

### Versioning Flow

```bash
# 1. Make changes to packages
# 2. Create changesets for each logical change
pnpm run monorepo:changeset

# 3. Commit changesets
git add .changeset
git commit -m "docs: Add changesets for v1.1.0"

# 4. When ready to release, update versions
pnpm run monorepo:changeset:version

# 5. Commit version updates
git add .
git commit -m "chore: Version packages"

# 6. Publish (in CI/CD)
pnpm run monorepo:changeset:publish
```

---

## Code Generation

### Turbo Generators

**File**: `turbo/generators/config.ts`

### Available Generators

#### 1. Workspace Package

Creates a new app, service, package, mcp-server, or tool.

```bash
pnpm run monorepo:gen:workspace

# Or directly
pnpm run monorepo:gen
> workspace-package
```

**Prompts**:
- Type: app, service, package, mcp-server, tool
- Name: package-name (lowercase, kebab-case)
- Description: Brief description

**Generates**:
- `{type}s/{name}/package.json`
- `{type}s/{name}/tsconfig.json`
- `{type}s/{name}/README.md`
- Type-specific files (page.tsx, main.ts, index.ts)

#### 2. React Component

Creates a new React component with TypeScript.

```bash
pnpm run monorepo:gen:component

# Or
turbo gen component
```

**Prompts**:
- Component name: PascalCase (e.g., `Button`, `UserProfile`)
- Path: Relative to `src/components` (e.g., `ui`, `forms`)

**Generates**:
```
src/components/{path}/{ComponentName}/
├── {ComponentName}.tsx
└── index.ts
```

**Example**:
```bash
$ pnpm run monorepo:gen:component
? Component name: Button
? Component path: ui

✔ Created src/components/ui/Button/Button.tsx
✔ Created src/components/ui/Button/index.ts
```

#### 3. React Hook

Creates a new React hook.

```bash
pnpm run monorepo:gen:hook
```

**Prompts**:
- Hook name: PascalCase without "use" prefix (e.g., `Auth`, `WindowSize`)

**Generates**:
```
src/hooks/use{HookName}.ts
```

#### 4. API Route

Creates a new Next.js API route.

```bash
pnpm run monorepo:gen:api
```

**Prompts**:
- Route name: kebab-case (e.g., `user-profile`, `auth`)
- HTTP method: GET, POST, PUT, PATCH, DELETE

**Generates**:
```
src/app/api/{route-name}/route.ts
```

### Custom Generators

To add your own generator:

1. Edit `turbo/generators/config.ts`
2. Add a new `plop.setGenerator()` call
3. Create templates in `turbo/generators/templates/`

**Example**:
```typescript
plop.setGenerator("service", {
  description: "Create a new microservice",
  prompts: [
    {
      type: "input",
      name: "name",
      message: "Service name:",
    },
  ],
  actions: [
    {
      type: "add",
      path: "services/{{dashCase name}}/package.json",
      templateFile: "templates/service/package.json.hbs",
    },
  ],
});
```

---

## Build Optimization

### Turborepo Configuration

**File**: `turbo.json`

#### Task Dependencies

Turbo automatically parallelizes tasks based on dependencies:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
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

**`^build`** means "run `build` in all dependencies first"

#### Caching Strategy

Turbo caches task outputs to avoid redundant work:

```json
{
  "tasks": {
    "lint": {
      "cache": true,
      "inputs": [
        "src/**/*.ts",
        "eslint.config.*",
        "tsconfig.json"
      ]
    }
  }
}
```

**Cache Invalidation**:
- Input files change
- Environment variables change
- Task script changes

#### Build Order Optimization

**Example Dependency Graph**:
```
┌─────────────┐
│ @nyra/config│
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌────────────┐
│ @nyra/ui    │────▶│ apps/admin │
└─────────────┘     └────────────┘
```

**Turbo Build Order**:
1. `@nyra/config` (no dependencies)
2. `@nyra/ui` (depends on config)
3. `apps/admin` (depends on ui)

**Parallel Builds** when dependencies are satisfied:
```bash
$ turbo run build

• Packages in scope: @nyra/config, @nyra/ui, apps/admin, apps/ratehunter
• Running build in 4 packages
• Remote caching disabled

@nyra/config:build: cache miss, executing
@nyra/config:build: completed in 1.2s

@nyra/ui:build: cache miss, executing
@nyra/ui:build: completed in 2.5s

apps/admin:build: cache miss, executing
apps/ratehunter:build: cache miss, executing (parallel)
apps/admin:build: completed in 5.3s
apps/ratehunter:build: completed in 4.8s

Tasks:    4 successful, 4 total
Cached:    0 cached, 4 total
Time:     5.4s
```

### Performance Tips

1. **Use `turbo run` for all tasks**:
   ```bash
   turbo run build    # ✅ Fast with caching
   pnpm run build     # ❌ No caching
   ```

2. **Leverage remote caching**:
   ```bash
   turbo login
   turbo link
   ```

3. **Use `--filter` for targeted builds**:
   ```bash
   turbo run build --filter=apps/admin
   turbo run test --filter=packages/*
   ```

4. **Use `--force` to skip cache**:
   ```bash
   turbo run build --force
   ```

---

## Type Checking

### Workspace References

**Root `tsconfig.json`**:
```json
{
  "references": [
    { "path": "./apps/ratehunter" },
    { "path": "./packages/ui-components" },
    { "path": "./services/quote-api" }
  ]
}
```

### Type Checking Across Packages

```bash
# Check all packages
turbo run type-check

# Check specific package and its dependencies
turbo run type-check --filter=apps/admin...
```

### Path Aliases

**In package-specific `tsconfig.json`**:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@nyra/ui": ["../../packages/ui-components/src"]
    }
  }
}
```

---

## Daily Workflows

### Adding a New Dependency

```bash
# Add to specific workspace
pnpm add react-query --filter apps/admin

# Add to root (dev dependencies)
pnpm add -D -w typescript

# Check for version mismatches
pnpm run monorepo:check

# Fix mismatches
pnpm run monorepo:fix
```

### Creating a New Package

```bash
# Use generator
pnpm run monorepo:gen:workspace

# Follow prompts
? What type of package? · package
? Package name: · shared-utils
? Package description: · Shared utility functions

# Verify workspace protocol
pnpm run monorepo:manypkg
```

### Making Changes

```bash
# 1. Make your changes
# 2. Run type check
turbo run type-check

# 3. Run tests
turbo run test

# 4. Create changeset
pnpm run monorepo:changeset

# 5. Commit
git add .
git commit -m "feat: Add new utility function"
```

### Pre-Commit Checklist

```bash
# Run all checks
pnpm run monorepo:check        # Syncpack + Manypkg
turbo run lint                 # ESLint
turbo run type-check           # TypeScript
turbo run test                 # Jest/Vitest

# Or use doctor script
pnpm run doctor
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 10.27.0

      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      # Monorepo validation
      - name: Check dependency consistency
        run: pnpm run monorepo:check

      # Build with caching
      - name: Build
        run: turbo run build

      # Test with caching
      - name: Test
        run: turbo run test

      # Type check
      - name: Type check
        run: turbo run type-check
```

### Changesets Release

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2

      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Create Release Pull Request
        uses: changesets/action@v1
        with:
          version: pnpm run monorepo:changeset:version
          publish: pnpm run monorepo:changeset:publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Troubleshooting

### Common Issues

#### 1. Version Mismatches

**Error**:
```
✖ react has mismatched versions: ^18.2.0, ^18.3.1
```

**Fix**:
```bash
pnpm run monorepo:syncpack:fix
```

#### 2. Workspace Protocol Not Used

**Error**:
```
✖ @nyra/ui-components should use workspace:*
```

**Fix**:
```bash
# Manually update package.json
"dependencies": {
  "@nyra/ui-components": "workspace:*"
}

# Or run manypkg fix
pnpm run monorepo:manypkg:fix
```

#### 3. Build Failures

**Error**:
```
Error: Cannot find module '@nyra/config'
```

**Fix**:
```bash
# Rebuild dependencies first
turbo run build --filter=@nyra/config

# Or rebuild everything
turbo run build --force
```

#### 4. Type Errors Across Packages

**Error**:
```
Cannot find type definition for '@nyra/types'
```

**Fix**:
```bash
# Ensure TypeScript references are correct
# Check tsconfig.json references

# Rebuild types
turbo run type-check --force
```

#### 5. Cache Issues

**Symptom**: Old code is being used despite changes

**Fix**:
```bash
# Clear Turbo cache
rm -rf .turbo

# Clear pnpm cache
pnpm store prune

# Rebuild
turbo run build --force
```

### Debugging Tips

1. **Verbose Output**:
   ```bash
   turbo run build --verbosity=2
   ```

2. **Dry Run**:
   ```bash
   turbo run build --dry-run
   ```

3. **Dependency Graph**:
   ```bash
   turbo run build --graph
   ```

4. **Check Workspace Structure**:
   ```bash
   pnpm list -r --depth 0
   ```

5. **Validate Configuration**:
   ```bash
   pnpm run monorepo:check
   pnpm run doctor
   ```

---

## Best Practices

### 1. Version Pinning Strategy

- **External deps**: Use `^` for flexibility
- **Internal deps**: Use `workspace:*` always
- **Build tools**: Use `~` for stability

### 2. Changeset Guidelines

- Create changesets for **every** user-facing change
- Use semantic versioning correctly:
  - **major**: Breaking changes
  - **minor**: New features (backward compatible)
  - **patch**: Bug fixes
- Write clear, user-focused summaries

### 3. Generator Usage

- Use generators for consistency
- Customize templates for your needs
- Document custom generators

### 4. Build Optimization

- Keep task inputs minimal and accurate
- Use appropriate cache settings
- Leverage `--filter` for large repos

### 5. Workspace Organization

- Keep related packages linked in changesets config
- Use consistent naming (`@nyra/package-name`)
- Document inter-package dependencies

---

## npm Scripts Reference

### Monorepo Management

| Script | Description |
|--------|-------------|
| `pnpm run monorepo:check` | Check for dependency mismatches and workspace issues |
| `pnpm run monorepo:fix` | Fix all monorepo issues automatically |
| `pnpm run monorepo:syncpack` | Check for version mismatches with Syncpack |
| `pnpm run monorepo:syncpack:fix` | Fix version mismatches |
| `pnpm run monorepo:syncpack:format` | Format package.json files |
| `pnpm run monorepo:syncpack:lint` | Lint package.json files |
| `pnpm run monorepo:manypkg` | Check workspace integrity with Manypkg |
| `pnpm run monorepo:manypkg:fix` | Fix workspace issues |

### Changesets

| Script | Description |
|--------|-------------|
| `pnpm run monorepo:changeset` | Create a new changeset |
| `pnpm run monorepo:changeset:version` | Update package versions |
| `pnpm run monorepo:changeset:publish` | Publish packages to npm |
| `pnpm run monorepo:changeset:status` | Check changeset status |

### Code Generation

| Script | Description |
|--------|-------------|
| `pnpm run monorepo:gen` | Run Turbo generator (interactive) |
| `pnpm run monorepo:gen:workspace` | Generate new workspace package |
| `pnpm run monorepo:gen:component` | Generate React component |
| `pnpm run monorepo:gen:hook` | Generate React hook |
| `pnpm run monorepo:gen:api` | Generate API route |

---

## Resources

### Official Documentation

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo Docs](https://turbo.build/repo/docs)
- [Changesets Docs](https://github.com/changesets/changesets)
- [Syncpack Docs](https://jamiemason.github.io/syncpack/)
- [Manypkg GitHub](https://github.com/Thinkmill/manypkg)

### Internal Resources

- [SETUP-GUIDE.md](./guides/SETUP-GUIDE.md) - Project setup
- [QUICK-START.md](./guides/QUICK-START.md) - Quick start guide
- [CLAUDE.md](../CLAUDE.md) - AI assistant guidelines
- [README.md](../README.md) - Project overview

### Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Run `pnpm run doctor` for diagnostics
3. Review tool documentation
4. Create an issue in the project repository

---

**Last Updated**: 2026-01-16
**Maintained By**: Project Nyra Team
