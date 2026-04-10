# Development Documentation

Development guides, patterns, best practices, and setup documentation for Project Nyra developers.

## Quick Navigation

- **[Getting Started](#getting-started)** - Developer setup
- **[Development Patterns](#development-patterns)** - Best practices and patterns
- **[Claude Flow Integration](#archon-os-integration)** - Multi-agent development
- **[Tooling & Setup](#tooling--setup)** - Development tools and configuration
- **[References](#references)** - Additional resources

---

## Getting Started

### Quick Start for Developers
| Document | Purpose | Time |
|----------|---------|------|
| [TURBOREPO-QUICKSTART.md](./TURBOREPO-QUICKSTART.md) | Start with Turborepo monorepo setup | 10 min |
| [TURBOREPO-SETUP.md](./TURBOREPO-SETUP.md) | Detailed Turborepo configuration | 30 min |
| [TURBOREPO-CHEATSHEET.md](./TURBOREPO-CHEATSHEET.md) | Common Turborepo commands | Reference |
| [DEVELOPMENT-VS-PRODUCTION-SETUP.md](./DEVELOPMENT-VS-PRODUCTION-SETUP.md) | Dev vs Production environments | 15 min |

### Environment Setup
| Document | Purpose |
|----------|---------|
| [DEVELOPMENT-VS-PRODUCTION-SETUP.md](./DEVELOPMENT-VS-PRODUCTION-SETUP.md) | Development environment configuration |
| [LANGUAGE-TEMPLATE-MAPPING-GUIDE.md](./LANGUAGE-TEMPLATE-MAPPING-GUIDE.md) | Language and template selection |

---

## Development Patterns

### Implementation Patterns
| Document | Purpose | Scope |
|----------|---------|-------|
| [DEVELOPMENT-PATTERNS-IMPL.md](./DEVELOPMENT-PATTERNS-IMPL.md) | Core development patterns and antipatterns | Project-wide |
| [PATTERNS-IMPLEMENTATION-SUMMARY.md](./PATTERNS-IMPLEMENTATION-SUMMARY.md) | Summary of implemented patterns | Reference |
| [EXTRACTION-SUMMARY.md](./EXTRACTION-SUMMARY.md) | Code extraction and refactoring patterns | Implementation |

### SPARC Methodology
| Document | Purpose | Context |
|----------|---------|---------|
| [SPARC_WORKFLOW_GUIDE.md](./SPARC_WORKFLOW_GUIDE.md) | SPARC workflow for developers | Best practices |

---

## Claude Flow Integration

### Claude Flow Setup & Configuration
| Document | Purpose | Audience |
|----------|---------|----------|
| [archon-os-MASTER-BUILD-ENHANCED.md](./archon-os-MASTER-BUILD-ENHANCED.md) | Master Claude Flow build configuration | Backend Devs |
| [CLAUDE-MD-V3-TEMPLATE-GUIDE.md](./CLAUDE-MD-V3-TEMPLATE-GUIDE.md) | CLAUDE.md V3 template configuration | DevOps/Maintainers |
| [CLAUDE-MD-V2-VS-V3-ANALYSIS.md](./CLAUDE-MD-V2-VS-V3-ANALYSIS.md) | V2 to V3 migration and comparison | Architects |

### Claude Flow UI & Extraction
| Document | Purpose |
|----------|---------|
| [archon-os-UI-EXTRACTION.md](./archon-os-UI-EXTRACTION.md) | Claude Flow UI component extraction |

---

## Tooling & Setup

### Package Management & Monorepo
| Document | Purpose | Tools |
|----------|---------|-------|
| [TURBOREPO-SETUP.md](./TURBOREPO-SETUP.md) | Turborepo monorepo setup and configuration | Turborepo |
| [TURBOREPO-QUICKSTART.md](./TURBOREPO-QUICKSTART.md) | Quick start guide for Turborepo | Turborepo |
| [TURBOREPO-CHEATSHEET.md](./TURBOREPO-CHEATSHEET.md) | Common commands and workflows | Turborepo |

---

## Workflow & Process

### Development Workflow
| Document | Purpose |
|----------|---------|
| [SPARC_WORKFLOW_GUIDE.md](./SPARC_WORKFLOW_GUIDE.md) | Complete workflow using SPARC methodology |

---

## Related Documentation

### Architecture & Design
- **[/docs/architecture](../architecture/)** - System architecture and design decisions
- **[/docs/sparc](../sparc/)** - SPARC methodology and process documentation

### Deployment & Infrastructure
- **[/docs/deployment](../deployment/)** - Deployment guides and procedures
- **[/docs/api](../api/)** - API documentation and examples

### Project Management
- **[/docs/cleanup](../cleanup/)** - Documentation reorganization and cleanup

---

## Key Development Concepts

### Turborepo Monorepo
Project Nyra uses Turborepo to manage multiple packages and applications:
- **Packages** - Shared libraries and utilities
- **Services** - Backend microservices
- **Apps** - Frontend applications
- **Workspace Management** - Efficient dependency resolution

### Claude Flow Integration
Claude Flow enables multi-agent development:
- **CLAUDE.md** - Project configuration and agent directives
- **Agents** - Specialized coders, testers, reviewers, researchers
- **Memory** - Persistent context and learning
- **Hooks** - Pre/post task automation

### Development Patterns
Best practices for maintainability and performance:
- SOLID principles
- TDD (Test-Driven Development)
- Clean Code patterns
- Performance optimization
- Security by design

---

## Quick Start by Role

### Backend Developer
1. Read [TURBOREPO-QUICKSTART.md](./TURBOREPO-QUICKSTART.md)
2. Review [DEVELOPMENT-PATTERNS-IMPL.md](./DEVELOPMENT-PATTERNS-IMPL.md)
3. Set up environment from [DEVELOPMENT-VS-PRODUCTION-SETUP.md](./DEVELOPMENT-VS-PRODUCTION-SETUP.md)

### Frontend Developer
1. Start with [TURBOREPO-SETUP.md](./TURBOREPO-SETUP.md)
2. Check [LANGUAGE-TEMPLATE-MAPPING-GUIDE.md](./LANGUAGE-TEMPLATE-MAPPING-GUIDE.md)
3. Review component patterns in [DEVELOPMENT-PATTERNS-IMPL.md](./DEVELOPMENT-PATTERNS-IMPL.md)

### DevOps/Infrastructure
1. Review [CLAUDE-MD-V3-TEMPLATE-GUIDE.md](./CLAUDE-MD-V3-TEMPLATE-GUIDE.md)
2. Check [DEVELOPMENT-VS-PRODUCTION-SETUP.md](./DEVELOPMENT-VS-PRODUCTION-SETUP.md)
3. Reference deployment guides in [/docs/deployment](../deployment/)

### Architect/Tech Lead
1. Review [CLAUDE-MD-V2-VS-V3-ANALYSIS.md](./CLAUDE-MD-V2-VS-V3-ANALYSIS.md)
2. Check [archon-os-MASTER-BUILD-ENHANCED.md](./archon-os-MASTER-BUILD-ENHANCED.md)
3. Reference architecture in [/docs/architecture](../architecture/)

---

## Common Commands

### Turborepo
```bash
# Run task across monorepo
turbo run build

# Run task for specific package
turbo run build --filter=auth-service

# View dependency graph
turbo run --graph

# Development mode with watch
turbo run dev
```

### Development
```bash
# Install dependencies
pnpm install

# Build all packages
turbo run build

# Run tests
turbo run test

# Start development
turbo run dev
```

---

## Development Environment

### Recommended Setup
- **Node.js**: 20+ (see .nvmrc)
- **pnpm**: 10+ (package manager)
- **Editor**: VS Code recommended
- **Extensions**: ESLint, Prettier, TypeScript
- **Terminal**: Git Bash, PowerShell, or Zsh

### Required Tools
- Git (version control)
- Docker (containerization)
- Node.js (runtime)
- pnpm (package management)

---

## Standards & Best Practices

### Code Quality
- ESLint configuration in place
- Prettier for code formatting
- TypeScript for type safety
- 85%+ test coverage requirement

### Git Workflow
- Feature branches from main
- Conventional commit messages
- PR reviews required
- Automated tests before merge

### Documentation
- JSDoc/TSDoc comments
- README in each package
- Architecture Decision Records (ADRs)
- Usage examples provided

---

## Troubleshooting

### Common Development Issues

**Issue: Dependencies not installing**
- Clear node_modules: `rm -rf node_modules pnpm-lock.yaml`
- Reinstall: `pnpm install`
- Check Node version: `node --version`

**Issue: Port already in use**
- Find process: `lsof -i :PORT` (macOS/Linux) or `netstat -ano` (Windows)
- Kill process or use different port

**Issue: Tests failing**
- Run single test: `turbo run test -- --testNamePattern="pattern"`
- Check test environment variables
- Review recent code changes

**Issue: Build failures**
- Clean build: `turbo run clean && turbo run build`
- Check TypeScript errors: `turbo run type-check`
- Verify all dependencies installed

---

## Document Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| Turborepo Setup | Complete | 2026-01-16 |
| Development Patterns | Complete | 2026-01-14 |
| Claude Flow | Updated | 2026-01-21 |
| Environment Setup | Complete | 2026-01-14 |

---

## Contributing

When adding development documentation:
1. Update this README with new document
2. Include clear examples and code snippets
3. Reference related documentation
4. Keep commands current with latest tool versions
5. Test procedures before documenting

---

## Resources

- **Main CLAUDE.md**: [../CLAUDE.md](../CLAUDE.md)
- **Project Repository**: https://github.com/ruvnet/project-nyra
- **Claude Flow Docs**: https://github.com/ruvnet/archon-os
- **Turborepo Docs**: https://turbo.build
- **Node.js Docs**: https://nodejs.org/docs

---

**Last Updated:** January 22, 2026
**Maintained By:** Development Team
**Review Schedule:** Quarterly or after major tool updates
