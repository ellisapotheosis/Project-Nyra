# Bootstrap Integration Quick Start Guide

> **Quick reference** for integrating bootstrap/installer into the pnpm workspace. For full architectural details, see [BOOTSTRAP-INTEGRATION-PLAN.md](../docs/architecture/BOOTSTRAP-INTEGRATION-PLAN.md).

---

## ⚡ Quick Steps

### Step 1: Move Installer to Apps Directory (5 minutes)

```bash
# Navigate to repository root
cd C:\Dev\Projects\Repos\Project-Nyra

# Move installer
git mv bootstrap/installer apps/installer

# Commit
git add .
git commit -m "refactor: Move bootstrap installer to apps directory"
```

### Step 2: Update package.json (2 minutes)

Edit `apps/installer/package.json`:

```json
{
  "name": "@nyra/installer",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@nyra/bootstrap-types": "workspace:*",
    "@nyra/bootstrap-ui": "workspace:*",
    "@nyra/bootstrap-config": "workspace:*",
    "@nyra/core": "workspace:*",
    "@nyra/utils": "workspace:*"
  }
}
```

### Step 3: Create Shared Packages (30 minutes)

#### 3.1 Create @nyra/bootstrap-types

```bash
mkdir -p packages/bootstrap-types/src
cd packages/bootstrap-types
```

Create `package.json`:
```json
{
  "name": "@nyra/bootstrap-types",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist"
  }
}
```

Create `tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

Copy types:
```bash
# Copy manifest types
cp ../../apps/installer/src/types/manifest.ts ./src/
# Create barrel export
echo "export * from './manifest';" > ./src/index.ts
```

#### 3.2 Create @nyra/bootstrap-ui

```bash
cd ../..
mkdir -p packages/bootstrap-ui/src/{components,hooks}
cd packages/bootstrap-ui
```

Create `package.json`:
```json
{
  "name": "@nyra/bootstrap-ui",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "vite build --mode lib",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@nyra/bootstrap-types": "workspace:*"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

Copy components:
```bash
cp -r ../../apps/installer/src/components/* ./src/components/
cp -r ../../apps/installer/src/hooks/* ./src/hooks/
```

#### 3.3 Create @nyra/bootstrap-config

```bash
cd ../..
mkdir -p packages/bootstrap-config/src/{schemas,validators}
cd packages/bootstrap-config
```

Create `package.json`:
```json
{
  "name": "@nyra/bootstrap-config",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@nyra/bootstrap-types": "workspace:*",
    "zod": "^4.3.5"
  }
}
```

Extract validation logic:
```bash
# Create validator from existing logic in apps/installer/src/services/validator.ts
# Move to packages/bootstrap-config/src/validators/
```

### Step 4: Update Imports in Installer (15 minutes)

Edit files in `apps/installer/src/` to use new packages:

```typescript
// Before
import { PCRole, InstallState } from './types/manifest';
import { PCSelector } from './components/PCSelector';

// After
import { PCRole, InstallState } from '@nyra/bootstrap-types';
import { PCSelector } from '@nyra/bootstrap-ui/components';
```

### Step 5: Install and Build (10 minutes)

```bash
# From repository root
cd C:\Dev\Projects\Repos\Project-Nyra

# Install dependencies and link workspaces
pnpm install

# Build all packages
pnpm turbo run build

# Verify installer works
cd apps/installer
pnpm run dev
```

### Step 6: Update Turbo Config (5 minutes)

Edit `turbo.json` to add Electron tasks:

```json
{
  "tasks": {
    "package": {
      "dependsOn": ["build"],
      "outputs": ["release/**"],
      "cache": true
    },
    "package:win": {
      "dependsOn": ["build"],
      "outputs": ["release/**"],
      "cache": true
    }
  }
}
```

### Step 7: Test Everything (10 minutes)

```bash
# Type-check all packages
pnpm turbo run typecheck

# Build all packages
pnpm turbo run build

# Test installer in dev mode
pnpm --filter @nyra/installer run dev

# Package installer
pnpm --filter @nyra/installer run package:win
```

---

## 🎯 Verification Checklist

- [ ] `pnpm install` completes without errors
- [ ] `pnpm turbo run build` builds all packages
- [ ] `pnpm turbo run typecheck` shows no errors
- [ ] Installer starts with `pnpm --filter @nyra/installer run dev`
- [ ] Hot-reload works when editing components
- [ ] All installer features work (PC selection, component selection, installation)
- [ ] Packaged installer runs on clean machine

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@nyra/bootstrap-types'"

**Solution**: Run `pnpm install` to link workspace packages.

### Error: "Module not found: Can't resolve '@nyra/bootstrap-ui/components'"

**Solution**: Build the package first:
```bash
pnpm --filter @nyra/bootstrap-ui run build
```

### Error: Circular dependency detected

**Solution**: Check dependency graph:
```bash
pnpm turbo run build --graph
```

Ensure packages don't import from each other circularly.

### Electron window doesn't open

**Solution**: Check Electron main process logs:
```bash
cd apps/installer
npm run dev:electron
# Check terminal for errors
```

---

## 📚 Next Steps

After successful integration:

1. **Add Storybook** to `@nyra/bootstrap-ui` for component documentation
2. **Write tests** for validators in `@nyra/bootstrap-config`
3. **Reuse components** in `apps/nyra-admin` dashboard
4. **Create shared config** package for ESLint/Prettier/TypeScript

---

## 📞 Need Help?

- **Full Architecture Plan**: [BOOTSTRAP-INTEGRATION-PLAN.md](../docs/architecture/BOOTSTRAP-INTEGRATION-PLAN.md)
- **Bootstrap System Docs**: [bootstrap/README.md](./README.md)
- **Turbo Docs**: https://turbo.build/repo/docs
- **pnpm Workspaces**: https://pnpm.io/workspaces

---

**Estimated Total Time**: 90 minutes
**Difficulty**: Intermediate
**Last Updated**: 2026-01-18
