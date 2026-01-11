# Testing Quick Start Guide

Quick reference for running tests in Project Nyra.

## 🚀 Quick Commands

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test:all

# Run specific test types
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests only
pnpm test:e2e              # E2E tests only
pnpm test:performance      # Performance tests

# Development
pnpm test:watch            # Watch mode for unit tests
pnpm test:coverage         # Generate coverage report
```

## 📋 Prerequisites

### For Unit Tests
- Node.js 20+
- pnpm 10+

```bash
pnpm install
```

### For Integration Tests
- Docker Desktop (running)
- PostgreSQL and Redis containers

```bash
# Start test services
pnpm docker:test:up

# Run tests
pnpm test:integration

# Stop services
pnpm docker:test:down
```

### For E2E Tests
- Playwright browsers

```bash
# Install browsers (one time)
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e

# Debug mode
pnpm exec playwright test --debug
```

## 🎯 Common Workflows

### Development Workflow

```bash
# 1. Start watch mode
pnpm test:watch

# 2. Make changes to code
# 3. Tests auto-run on save

# 4. Check coverage
pnpm test:coverage
```

### Pre-Commit Workflow

```bash
# Run all tests
pnpm test:all

# If all pass, commit
git add .
git commit -m "your message"
```

### CI/CD Workflow

Tests run automatically on:
- Push to main/develop
- Pull requests
- Tag creation

View results in GitHub Actions.

## 🐛 Debugging

### Debug Unit Test
```bash
# Enable debug output
DEBUG_TESTS=true pnpm test tests/unit/your-test.test.ts
```

### Debug Integration Test
```bash
# Check if services are running
docker ps

# View service logs
docker logs nyra-test-postgres
docker logs nyra-test-redis
```

### Debug E2E Test
```bash
# Run in headed mode (see browser)
HEADED=true pnpm test:e2e

# Debug mode (step through)
pnpm exec playwright test --debug

# Specific test
pnpm exec playwright test dashboard --debug
```

## 📊 Coverage

```bash
# Generate coverage
pnpm test:coverage

# View in browser
pnpm test:coverage:view

# Files at: coverage/lcov-report/index.html
```

## 🔧 Troubleshooting

### Tests Won't Run

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear Jest cache
pnpm exec jest --clearCache
```

### Docker Services Won't Start

```bash
# Stop all containers
docker stop $(docker ps -aq)

# Remove volumes
docker volume prune

# Start fresh
pnpm docker:test:up
```

### Playwright Issues

```bash
# Reinstall browsers
pnpm exec playwright install --with-deps

# Clear cache
rm -rf ~/.cache/ms-playwright
pnpm exec playwright install
```

## 📚 More Information

- Full docs: `tests/README.md`
- Complete guide: `TESTING-SETUP-COMPLETE.md`
- Jest config: `jest.config.js`
- Playwright config: `playwright.config.ts`

## 🎉 Ready to Test!

Start with:
```bash
pnpm test:unit
```

All test infrastructure is ready to use!
