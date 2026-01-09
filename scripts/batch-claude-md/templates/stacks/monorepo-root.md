## Monorepo Management Guidelines

### Workspace Structure
- Use pnpm workspaces for package management
- Organize by apps/ and packages/
- Shared configs in root
- Cross-package dependencies managed by workspace protocol

### Package Management
```json
{
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*"
  ]
}
```

### Cross-Package Development
- Use workspace dependencies: `"@nyra/shared": "workspace:*"`
- Build packages before consuming apps
- Ensure proper build order
- Use Turborepo for task orchestration

### Common Commands
```bash
# Install all dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Build all packages
pnpm build

# Test all workspaces
pnpm test

# Lint all workspaces
pnpm lint

# Add dependency to specific workspace
pnpm --filter @nyra/admin add react
```

### Turborepo Configuration
- Define task dependencies
- Enable remote caching
- Configure task pipelines
- Optimize build parallelization

### Shared Packages
- `@nyra/ui` - Shared UI components
- `@nyra/config` - Shared configurations
- `@nyra/types` - Shared TypeScript types
- `@nyra/utils` - Shared utility functions

### Version Management
- Use Changesets for versioning
- Semantic versioning (semver)
- Automated changelog generation
- Coordinated releases

### CI/CD Integration
- Build only affected packages
- Cache dependencies properly
- Run tests in parallel
- Deploy affected apps only

### Best Practices
- Keep package boundaries clear
- Avoid circular dependencies
- Document cross-package APIs
- Use consistent tooling across packages
- Implement proper caching strategies
- Maintain clean dependency graph
