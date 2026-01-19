# Documentation Index - Project Nyra Infrastructure

> Complete guide to all infrastructure documentation

**Last Updated**: 2026-01-18
**Infrastructure Version**: 1.0.0 (Consolidated)

## Quick Navigation

| Document | Purpose | Time to Read |
|----------|---------|--------------|
| [Quick Start Guide](QUICK-START.md) | Get running in 5 minutes | 10 min |
| [Main README](../README.md) | Architecture overview & common ops | 15 min |
| [Troubleshooting Guide](TROUBLESHOOTING.md) | Problem solving | Reference |
| [Migration Guide](MIGRATION-GUIDE.md) | Old → New structure | 30 min |
| [Nexus Router Integration](NEXUS-ROUTER-INTEGRATION.md) | Service discovery & routing | 20 min |

---

## Getting Started

### New Users

1. **[Quick Start Guide](QUICK-START.md)** - Start here!
   - 5-minute setup
   - Essential commands
   - Common operations
   - Troubleshooting basics

2. **[Main README](../README.md)** - Understand the system
   - Architecture layers
   - Service groups
   - Environment configuration
   - Modular compose structure

### Existing Users Migrating

1. **[Migration Guide](MIGRATION-GUIDE.md)** - Transition to new structure
   - Zero-downtime migration
   - Standard migration with downtime
   - Configuration changes
   - Rollback procedures

2. **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Solve common issues
   - Service startup problems
   - Database connections
   - Network issues
   - Performance tuning

---

## Documentation Structure

### Core Documentation

#### Main README (`../README.md`)
Complete overview of the infrastructure:
- Architecture layers diagram
- Service groups and ports
- Common operations (start, stop, logs)
- Environment configuration
- Modular compose structure
- Nexus Router overview
- Data persistence
- Security best practices

#### Quick Start Guide (`QUICK-START.md`)
Hands-on guide for new users:
- Prerequisites checklist
- 5-minute setup walkthrough
- Service access URLs
- Essential commands
- Selective service start
- Common tasks
- Troubleshooting basics

### Operational Guides

#### Troubleshooting Guide (`TROUBLESHOOTING.md`)
Comprehensive problem-solving reference:
- Service startup issues
- Database connection problems
- Network & connectivity
- Performance & resource issues
- Nexus Router problems
- Data persistence issues
- Security & authentication
- Diagnostic commands
- Common error messages

#### Migration Guide (`MIGRATION-GUIDE.md`)
Transitioning from old to new structure:
- Zero-downtime migration
- Standard migration (with downtime)
- Configuration mapping
- Service changes
- Docker Compose structure changes
- Network changes
- Volume migration
- Rollback plan
- Post-migration tasks

### Integration Guides

#### Nexus Router Integration (`NEXUS-ROUTER-INTEGRATION.md`)
Service discovery and routing:
- Architecture overview
- Service registration (Docker labels)
- Health checks & circuit breakers
- LLM routing strategies
- MCP tool routing & fuzzy matching
- Authentication & authorization
- Monitoring & metrics
- Admin API reference

### Reference Documentation

#### Environment Variables Reference (`../ENV-VARIABLES-REFERENCE.md`)
Complete variable documentation:
- Required variables
- Optional variables
- Service-specific variables
- Default values
- Examples

#### Makefile Reference (`MAKEFILE-REFERENCE.md`)
All available make commands:
- Core commands (up, down, restart)
- Service groups (up-core, up-ai, up-apps)
- Monitoring & logs
- Database operations
- Development workflows
- Testing commands
- Security scanning

#### Scripts Reference (`../SCRIPTS-QUICK-REFERENCE.md`)
Utility scripts documentation:
- health-check.sh
- generate-secrets.sh
- backup scripts
- Deployment scripts

### Architecture Documentation

#### Docker Canonical Design (`../../docs/architecture/docker-canonical-design.md`)
Architectural decisions and design principles:
- Canonical directory structure
- Design principles (DRY, 12-Factor)
- Service classification
- Base image strategy
- Environment configuration
- Docker Compose profiles
- Networking architecture
- Migration strategy

#### Nexus Router Architecture (`../../docs/architecture/nexus-router-integration-design.md`)
Detailed architecture specification:
- Three-tier architecture
- Service registration mechanism
- Routing configuration
- Port allocation strategy
- Security architecture
- Monitoring & observability
- Deployment procedures

---

## Common Use Cases

### "I want to start developing"

1. Read: [Quick Start Guide](QUICK-START.md)
2. Run: `make init` → edit `.env` → `make up`
3. Access: `make urls`
4. Reference: [Main README](../README.md) for operations

### "Services won't start"

1. Check: [Troubleshooting Guide](TROUBLESHOOTING.md) → Service Startup Issues
2. Debug: `make logs-<service>`
3. Fix: Follow diagnostic steps
4. Verify: `make health`

### "I'm migrating from old structure"

1. Read: [Migration Guide](MIGRATION-GUIDE.md)
2. Backup: Follow pre-migration checklist
3. Migrate: Choose zero-downtime or standard approach
4. Verify: Post-migration checklist

### "How do I add a new service?"

1. Read: [Nexus Router Integration](NEXUS-ROUTER-INTEGRATION.md) → Service Registration
2. Add: Docker labels for service discovery
3. Define: Health check endpoint
4. Configure: Set resource limits
5. Update: Documentation

### "Performance is slow"

1. Check: [Troubleshooting Guide](TROUBLESHOOTING.md) → Performance & Resource Issues
2. Monitor: `make stats`
3. Identify: Resource hogs
4. Optimize: Increase Docker resources or scale down services

---

## Documentation by Role

### Developers

**Essential Reading:**
1. [Quick Start Guide](QUICK-START.md)
2. [Main README](../README.md)
3. [Troubleshooting Guide](TROUBLESHOOTING.md) (bookmark)

**As Needed:**
- [Nexus Router Integration](NEXUS-ROUTER-INTEGRATION.md) (when adding services)
- [Makefile Reference](MAKEFILE-REFERENCE.md) (command lookup)

### DevOps / SRE

**Essential Reading:**
1. [Migration Guide](MIGRATION-GUIDE.md)
2. [Nexus Router Integration](NEXUS-ROUTER-INTEGRATION.md)
3. [Docker Canonical Design](../../docs/architecture/docker-canonical-design.md)

**As Needed:**
- [Troubleshooting Guide](TROUBLESHOOTING.md) (reference)
- [Environment Variables Reference](../ENV-VARIABLES-REFERENCE.md)

### System Architects

**Essential Reading:**
1. [Docker Canonical Design](../../docs/architecture/docker-canonical-design.md)
2. [Nexus Router Architecture](../../docs/architecture/nexus-router-integration-design.md)
3. [Main README](../README.md)

**As Needed:**
- All other documentation for comprehensive understanding

---

## Documentation Maintenance

### Updating Documentation

When making infrastructure changes:

1. **Update relevant docs**:
   - Service changes → Update main README
   - New commands → Update Makefile Reference
   - Configuration changes → Update ENV-VARIABLES-REFERENCE.md
   - Troubleshooting discoveries → Update TROUBLESHOOTING.md

2. **Update version and date**:
   ```markdown
   **Last Updated**: YYYY-MM-DD
   **Version**: X.Y.Z
   ```

3. **Test procedures**:
   - Verify all commands work
   - Test on clean environment
   - Update examples

### Documentation Standards

- **Markdown**: Use proper formatting
- **Code blocks**: Include language specifiers
- **Commands**: Show full commands with context
- **Examples**: Use realistic, runnable examples
- **Links**: Keep cross-references up to date
- **TOC**: Update table of contents

---

## External Resources

### Official Documentation

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Specification](https://docs.docker.com/compose/compose-file/)
- [12-Factor App](https://12factor.net/)

### Project Repositories

- [Claude Flow](https://github.com/ruvnet/claude-flow)
- [Nexus Router](https://github.com/grafbase/nexus)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [Letta](https://github.com/letta-ai/letta)

### Community

- GitHub Issues: [Project Issues](https://github.com/your-org/Project-Nyra/issues)
- Discussions: [Project Discussions](https://github.com/your-org/Project-Nyra/discussions)

---

## Quick Command Reference

```bash
# Getting Started
make help              # Show all commands
make init              # First-time setup
make up                # Start all services
make urls              # View service URLs

# Monitoring
make health            # Check service health
make logs              # View all logs
make logs-<service>    # View specific service
make stats             # Resource usage

# Development
make dev               # Start dev environment
make shell-<service>   # Open service shell
make db-shell          # PostgreSQL shell
make redis-cli         # Redis CLI

# Maintenance
make restart           # Restart all
make down              # Stop all
make clean             # Cleanup
make db-backup         # Backup database

# Help
make info              # Infrastructure info
make quick-health      # Quick health check
```

---

## Feedback & Contributions

### Reporting Issues

When reporting documentation issues:

1. **Specify document**: Which file needs updating?
2. **Describe issue**: What's unclear or incorrect?
3. **Suggest fix**: How should it be improved?
4. **Provide context**: Your use case

### Contributing Documentation

Guidelines for documentation contributions:

1. **Follow structure**: Match existing doc patterns
2. **Be clear**: Write for your audience
3. **Include examples**: Show, don't just tell
4. **Test commands**: Verify all examples work
5. **Update index**: Add new docs to INDEX.md

---

## Document Status

| Document | Status | Last Reviewed |
|----------|--------|---------------|
| [Main README](../README.md) | ✅ Complete | 2026-01-18 |
| [Quick Start Guide](QUICK-START.md) | ✅ Complete | 2026-01-18 |
| [Troubleshooting Guide](TROUBLESHOOTING.md) | ✅ Complete | 2026-01-18 |
| [Migration Guide](MIGRATION-GUIDE.md) | ✅ Complete | 2026-01-18 |
| [Nexus Router Integration](NEXUS-ROUTER-INTEGRATION.md) | ✅ Complete | 2026-01-18 |
| [Makefile Reference](MAKEFILE-REFERENCE.md) | 📝 Planned | - |
| [Architecture Overview](ARCHITECTURE.md) | 📝 Planned | - |
| [Service Management](SERVICE-MANAGEMENT.md) | 📝 Planned | - |

---

**Questions?** Start with the [Quick Start Guide](QUICK-START.md) or consult the [Troubleshooting Guide](TROUBLESHOOTING.md).

**Last Updated**: 2026-01-18
**Documentation Version**: 1.0.0
**Infrastructure Version**: 1.0.0 (Consolidated)
