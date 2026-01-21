# pnpm Installation Guide

## Current Status
❌ pnpm is **NOT** installed globally on this system

## Package Manager Requirement
This project requires **pnpm@10.27.0** as specified in `package.json`

## Installation Commands

### Option 1: Install via npm (Recommended)
```bash
npm install -g pnpm@10.27.0
```

### Option 2: Install via standalone script
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Option 3: Install via Corepack (Node.js 16.13+)
```bash
corepack enable
corepack prepare pnpm@10.27.0 --activate
```

### Option 4: Install specific version via npm
```bash
npm install -g pnpm@latest
```

## Verification
After installation, verify pnpm is installed:
```bash
pnpm --version
# Should output: 10.27.0 or later
```

## Why pnpm?
This project uses pnpm for:
- **Faster installs**: Up to 2x faster than npm
- **Disk efficiency**: Hard links save disk space
- **Strict mode**: Better dependency management
- **Monorepo support**: Native workspace support
- **Performance**: Better caching and parallel processing

## Fallback to npm
If you cannot install pnpm, you can use npm with the provided `.npmrc.npm` configuration:
```bash
cp .npmrc.npm .npmrc
npm install
```

**Note**: Some features and performance optimizations will not be available with npm.

## Configuration Files
- `.npmrc.pnpm` - Original pnpm-specific configuration (backup)
- `.npmrc.npm` - npm-compatible configuration
- `.npmrc` - Current active configuration (npm-compatible)

## Next Steps
1. Install pnpm using one of the methods above
2. Run `pnpm install` to install dependencies
3. Run `pnpm run setup:dev` to set up the development environment
