# Project Nyra - Setup Documentation

**Status**: Consolidated and Active
**Last Updated**: 2026-01-22
**Consolidation**: 7 legacy folders → 1 canonical location
**Total Guides**: 38 comprehensive setup guides

---

## Welcome to Project Nyra Setup!

This directory contains **all setup and configuration documentation** for Project Nyra. Whether you're setting up for the first time or looking for specific configuration help, you'll find comprehensive guides organized by topic and setup phase.

### 🚀 Quick Start

**New to Project Nyra?** Start here based on your situation:

- **"Give me the full picture"** → [Master Setup Guide](00-MASTER-SETUP-GUIDE.md) (comprehensive)
- **"I have 30 minutes"** → [Quick Start](QUICK-START.md) (overview)
- **"I'm in a hurry"** → [Ultra Fast Start](ultra-fast-start.md) (1-2 hours)
- **"I'm on Windows"** → [Windows Quick Start](WINDOWS_QUICK_START.md)
- **"I'm a developer"** → [Development Setup](QUICK-START-DEVELOPMENT.md)
- **"Something's broken"** → [Troubleshooting](TROUBLESHOOTING-FIXES.md)

**Experienced user?** Go straight to:
- [Quick Reference Card](QUICK-REFERENCE.md) - Essential commands
- [Master Setup Guide](00-MASTER-SETUP-GUIDE.md) - Full reference
- Specific topic guides below

---

## 📚 Documentation Structure

### Navigation Guides
- **[INDEX.md](INDEX.md)** - Complete navigation index with all guides listed
- **[DIRECTORY-STRUCTURE.md](DIRECTORY-STRUCTURE.md)** - How documentation is organized

### Core Foundations
- **[00-MASTER-SETUP-GUIDE.md](00-MASTER-SETUP-GUIDE.md)** ⭐ - The main comprehensive guide covering all setup phases
- **[01-PREREQUISITES-CHECKLIST.md](01-PREREQUISITES-CHECKLIST.md)** - System requirements before setup
- **[SETUP-GUIDE.md](SETUP-GUIDE.md)** - Detailed infrastructure setup reference

### Quick Starts (Choose Your Path)
- **[QUICK-START.md](QUICK-START.md)** - 30-minute overview
- **[QUICK-START-DEVELOPMENT.md](QUICK-START-DEVELOPMENT.md)** - Developer environment
- **[TONIGHT-QUICK-START.md](TONIGHT-QUICK-START.md)** - Evening setup (3-4 hours)
- **[ultra-fast-start.md](ultra-fast-start.md)** - Fastest path (1-2 hours)
- **[WINDOWS_QUICK_START.md](WINDOWS_QUICK_START.md)** - Windows-specific
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - Command reference

### Setup by Topic
**Environment & Secrets**
- [environment-setup.md](environment-setup.md)
- [INFISICAL_DEPLOYMENT_GUIDE.md](INFISICAL_DEPLOYMENT_GUIDE.md)
- [infisical-deployment-strategy.md](infisical-deployment-strategy.md)

**Frameworks & Tools**
- [archon-os-V3-SETUP.md](archon-os-V3-SETUP.md)
- [PNPM_INSTALLATION.md](PNPM_INSTALLATION.md)
- [CODEX-SKILLS-FOR-NYRA-INFRA.md](CODEX-SKILLS-FOR-NYRA-INFRA.md)

**Deployment**
- [CLOUDFLARE-PAGES-SETUP.md](CLOUDFLARE-PAGES-SETUP.md)
- [DOCKER-MIGRATION-GUIDE.md](DOCKER-MIGRATION-GUIDE.md)
- [VLLM-MIGRATION-GUIDE.md](VLLM-MIGRATION-GUIDE.md)

**Service Integration**
- [NEXUS-ROUTER-INTEGRATION-GUIDE.md](NEXUS-ROUTER-INTEGRATION-GUIDE.md)
- [google-workspace-integration.md](google-workspace-integration.md)
- [EMAIL-SETUP-GUIDE.md](EMAIL-SETUP-GUIDE.md)
- [websocket-integration.md](websocket-integration.md)
- [N8N-DEPLOYMENT-COMPARISON.md](N8N-DEPLOYMENT-COMPARISON.md)

**AI & Models**
- [local-model-setup.md](local-model-setup.md)

**Testing & Development**
- [TESTING-QUICKSTART.md](TESTING-QUICKSTART.md)

**Phase-Specific**
- [PHASE-2-3-COMPLETION-SUMMARY.md](PHASE-2-3-COMPLETION-SUMMARY.md)
- [phase3-orchestration-execution-guide.md](phase3-orchestration-execution-guide.md)

### Troubleshooting & Issues
- **[TROUBLESHOOTING-FIXES.md](TROUBLESHOOTING-FIXES.md)** - Main troubleshooting guide
- **[archon-os-ZOD-FIX.md](archon-os-ZOD-FIX.md)** - Claude Flow specific issues
- **[POST-CONSOLIDATION-GUIDE.md](POST-CONSOLIDATION-GUIDE.md)** - Post-setup verification

### Advanced & Reference
- **[ULTIMATE-BATCH-INIT-GUIDE.md](ULTIMATE-BATCH-INIT-GUIDE.md)** - Automated setup
- **[00-README-OVERNIGHT-SETUP.md](00-README-OVERNIGHT-SETUP.md)** - Unattended overnight setup
- **[repository-consolidation-quickstart.md](repository-consolidation-quickstart.md)** - Repository setup
- **[CONSOLIDATION-SUMMARY.md](CONSOLIDATION-SUMMARY.md)** - Setup status
- **[YOUR-MANUAL-SETUP-GUIDE-v1.md](YOUR-MANUAL-SETUP-GUIDE-v1.md)** - Version 1 reference

---

## What Is Project Nyra?

Project Nyra is an **AI-powered mortgage automation platform** that combines:

- **Multi-PC GPU cluster** for distributed AI inference
- **Claude Flow** for agent orchestration and automation
- **Multiple memory systems** (Letta, ruvector, letta, Mem0)
- **Rich backend databases** (PostgreSQL, Redis, FalkorDB, Qdrant)
- **Web interfaces** (Open WebUI, LobeChat, Nexus Router)
- **MCP servers** for tool integration and automation
- **Cloud deployment** with Cloudflare tunnels for external access

This documentation guides you through setting up all these components.

---

## Setup Phases Overview

### Phase 1: Foundation (Day 1) - CRITICAL
**Time**: 2-4 hours

Essential infrastructure that must be set up first:
1. Prerequisites verification
2. Docker environment
3. Secrets management (Infisical)
4. PostgreSQL database
5. Redis cache

See: [Master Setup Guide - Phase 1](00-MASTER-SETUP-GUIDE.md#phase-1-foundation-day-1---critical)

### Phase 2: Memory & Services (Day 2)
**Time**: 3-5 hours

Memory systems and core services:
1. Letta memory system
2. ruvector vector database
3. Claude Flow MCP
4. Additional MCP servers
5. Service verification

See: [Master Setup Guide - Phase 2](00-MASTER-SETUP-GUIDE.md#phase-2-memory-mcp-servers-day-2)

### Phase 3: Applications (Day 3)
**Time**: 2-4 hours

User-facing applications:
1. Nexus Router deployment
2. Open WebUI setup
3. Cloudflare tunnel configuration
4. Optional: LobeChat

See: [Master Setup Guide - Phase 3](00-MASTER-SETUP-GUIDE.md#phase-3-applications-day-3)

### Phase 4: Advanced Features (Week 2+)
**Time**: 1-2 weeks

Advanced and optional features:
1. 4-PC distributed architecture
2. letta knowledge graphs
3. Mem0 advanced memory
4. n8n workflow automation
5. Performance optimization

See: [Master Setup Guide - Phase 4](00-MASTER-SETUP-GUIDE.md#phase-4-advanced-features-week-2)

---

## System Requirements

### Minimum
- **OS**: Windows 10+, macOS 11+, or Linux
- **CPU**: 4 cores
- **RAM**: 8GB (16GB recommended)
- **Storage**: 50GB free
- **Docker**: 4.x or higher
- **Node.js**: 18.x or higher

### Recommended
- **OS**: Windows 11, Ubuntu 20.04+, or macOS 12+
- **CPU**: 8+ cores
- **RAM**: 32GB+
- **Storage**: 100GB+ SSD
- **GPU**: NVIDIA RTX 3090 Ti or better (optional but recommended)

See: [Prerequisites Checklist](01-PREREQUISITES-CHECKLIST.md) for detailed requirements

---

## Choose Your Setup Path

### Path 1: Comprehensive (Recommended for First-Time Users)
1. Read: [Master Setup Guide](00-MASTER-SETUP-GUIDE.md)
2. Check: [Prerequisites Checklist](01-PREREQUISITES-CHECKLIST.md)
3. Follow: Phase 1, 2, 3 step by step
4. Reference: Topic-specific guides as needed
5. Troubleshoot: [Troubleshooting Guide](TROUBLESHOOTING-FIXES.md)

**Time**: 3-7 days total (can be done across multiple sessions)
**Best For**: Complete setup from scratch, learning the system

### Path 2: Quick Deployment (For Experienced Users)
1. Verify: [Prerequisites Checklist](01-PREREQUISITES-CHECKLIST.md)
2. Reference: [Quick Reference Card](QUICK-REFERENCE.md)
3. Execute: [Ultra Fast Start](ultra-fast-start.md)
4. Configure: Topic-specific guides as needed

**Time**: 1-2 hours
**Best For**: Experienced deployments, familiar with infrastructure

### Path 3: Automated (For Hands-Off Setup)
1. Review: [Automated Setup Options](00-README-OVERNIGHT-SETUP.md)
2. Configure: [ULTIMATE-BATCH-INIT-GUIDE.md](ULTIMATE-BATCH-INIT-GUIDE.md)
3. Monitor: Check logs and verify deployment
4. Finalize: [POST-CONSOLIDATION-GUIDE.md](POST-CONSOLIDATION-GUIDE.md)

**Time**: Varies (can run overnight)
**Best For**: Large-scale deployments, CI/CD integration

### Path 4: Platform-Specific (For Your Operating System)
- **Windows**: [WINDOWS_QUICK_START.md](WINDOWS_QUICK_START.md)
- **Linux**: [QUICK-START.md](QUICK-START.md)
- **macOS**: [QUICK-START.md](QUICK-START.md) (with macOS-specific adjustments)

---

## Recommended Reading Order

### First-Time Users
1. This README (you are here!)
2. [Prerequisites Checklist](01-PREREQUISITES-CHECKLIST.md)
3. [Master Setup Guide](00-MASTER-SETUP-GUIDE.md)
4. Phase-specific guides as you progress
5. [Troubleshooting Guide](TROUBLESHOOTING-FIXES.md) when needed

### Experienced Users
1. [Quick Reference Card](QUICK-REFERENCE.md)
2. [Master Setup Guide](00-MASTER-SETUP-GUIDE.md) - specific sections
3. Topic-specific guides
4. [Troubleshooting Guide](TROUBLESHOOTING-FIXES.md) if issues arise

### Developers
1. [QUICK-START-DEVELOPMENT.md](QUICK-START-DEVELOPMENT.md)
2. [TESTING-QUICKSTART.md](TESTING-QUICKSTART.md)
3. [archon-os-V3-SETUP.md](archon-os-V3-SETUP.md)
4. Component-specific guides

### DevOps/Infrastructure
1. [Master Setup Guide](00-MASTER-SETUP-GUIDE.md)
2. [ULTIMATE-BATCH-INIT-GUIDE.md](ULTIMATE-BATCH-INIT-GUIDE.md)
3. [DOCKER-MIGRATION-GUIDE.md](DOCKER-MIGRATION-GUIDE.md)
4. Deployment-specific guides

---

## Common Setup Scenarios

### "I want to deploy Open WebUI on my domain"
→ [NEXUS-ROUTER-INTEGRATION-GUIDE.md](NEXUS-ROUTER-INTEGRATION-GUIDE.md)

### "I need to set up databases"
→ [SETUP-GUIDE.md](SETUP-GUIDE.md) - Backend Database Setup section

### "I want to configure Claude Flow MCP"
→ [archon-os-V3-SETUP.md](archon-os-V3-SETUP.md)

### "I need memory system setup"
→ [SETUP-GUIDE.md](SETUP-GUIDE.md) - Memory Systems section

### "I want quick setup tonight"
→ [TONIGHT-QUICK-START.md](TONIGHT-QUICK-START.md)

### "I need unattended overnight setup"
→ [00-README-OVERNIGHT-SETUP.md](00-README-OVERNIGHT-SETUP.md)

### "I'm having issues"
→ [TROUBLESHOOTING-FIXES.md](TROUBLESHOOTING-FIXES.md)

### "I'm on Windows"
→ [WINDOWS_QUICK_START.md](WINDOWS_QUICK_START.md)

### "I'm a developer"
→ [QUICK-START-DEVELOPMENT.md](QUICK-START-DEVELOPMENT.md)

---

## Key Concepts

### Docker Network
All services communicate through the `nyra-network` Docker network. See: [SETUP-GUIDE.md](SETUP-GUIDE.md)

### Secrets Management with Infisical
All sensitive data is managed through Infisical. See: [INFISICAL_DEPLOYMENT_GUIDE.md](INFISICAL_DEPLOYMENT_GUIDE.md)

### MCP (Model Context Protocol)
MCP servers provide tools to Claude for automated tasks. See: [archon-os-V3-SETUP.md](archon-os-V3-SETUP.md)

### Multi-Phase Deployment
Setup progresses through 4 phases to ensure dependencies are met. See: [Master Setup Guide](00-MASTER-SETUP-GUIDE.md)

### GPU Cluster Architecture
Optional distributed GPU setup across 4 PCs. Covered in Phase 4 advanced features.

---

## Getting Help

### Troubleshooting
1. Check [TROUBLESHOOTING-FIXES.md](TROUBLESHOOTING-FIXES.md) for common issues
2. Search topic-specific guides for relevant sections
3. Check Docker logs: `docker logs [container-name]`
4. Check MCP health endpoints

### Error: "Cannot connect to database"
→ [TROUBLESHOOTING-FIXES.md](TROUBLESHOOTING-FIXES.md#database-connection-issues)

### Error: "MCP server not responding"
→ [TROUBLESHOOTING-FIXES.md](TROUBLESHOOTING-FIXES.md#mcp-server-issues)

### Error: "Claude Flow Zod validation failed"
→ [archon-os-ZOD-FIX.md](archon-os-ZOD-FIX.md)

### General Questions
→ Search [INDEX.md](INDEX.md) for relevant topic, then refer to appropriate guide

---

## Documentation Consolidation

### What Changed
Previously, setup documentation was scattered across 7 different folders:
- `docs/guides/`
- `docs/manual-tasks/`
- `docs/manual-tasks/setup/`
- `docs/manual-tasks/user-setup/`
- `docs/setup-guides/`
- `docs/user/`
- `docs/user-setup-guidance/`

**Now**: Everything is consolidated in `docs/setup/` for easier discovery and maintenance.

### How to Navigate
- **All guides** are in this single `docs/setup/` directory
- **Complete index** is available in [INDEX.md](INDEX.md)
- **Organization** is documented in [DIRECTORY-STRUCTURE.md](DIRECTORY-STRUCTURE.md)
- **Legacy folders** are archived in `docs/archive/deprecated-setup-folders/`

### Benefits of Consolidation
✅ Single canonical location for all setup documentation
✅ Reduced duplication and confusion
✅ Improved cross-referencing and navigation
✅ Easier maintenance and updates
✅ Better organization by topic and phase

---

## Key Files Reference

| File | Purpose | Best For |
|------|---------|----------|
| [00-MASTER-SETUP-GUIDE.md](00-MASTER-SETUP-GUIDE.md) | Complete setup orchestration | Full understanding of the setup process |
| [INDEX.md](INDEX.md) | Complete navigation index | Finding specific guides |
| [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | Essential commands | Quick command lookup |
| [01-PREREQUISITES-CHECKLIST.md](01-PREREQUISITES-CHECKLIST.md) | System requirements | Verifying your system |
| [QUICK-START.md](QUICK-START.md) | 30-minute overview | Quick overview |
| [ultra-fast-start.md](ultra-fast-start.md) | Fastest deployment | Quick deployments |
| [TROUBLESHOOTING-FIXES.md](TROUBLESHOOTING-FIXES.md) | Problem resolution | Fixing issues |
| [DIRECTORY-STRUCTURE.md](DIRECTORY-STRUCTURE.md) | Organization guide | Understanding documentation layout |

---

## External Resources

### Official Documentation
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [Cloudflare Docs](https://developers.cloudflare.com/)
- [Open WebUI Docs](https://docs.openwebui.com/)

### Project Resources
- [Project Nyra - Main Documentation](../../CLAUDE.md)
- [Claude Flow GitHub](https://github.com/ruvnet/archon-os)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

## Tips for Success

1. **Read Prerequisites First** - Always start with [01-PREREQUISITES-CHECKLIST.md](01-PREREQUISITES-CHECKLIST.md)
2. **Follow Phases in Order** - Each phase depends on previous phases
3. **Use Quick Reference** - Keep [QUICK-REFERENCE.md](QUICK-REFERENCE.md) bookmarked
4. **Check Docker Logs** - When something fails, check `docker logs`
5. **Verify Each Phase** - Don't skip verification steps
6. **Keep Infisical Secrets Safe** - Backup your `.env` file!
7. **Use the Index** - [INDEX.md](INDEX.md) is your friend for finding things
8. **Report Issues** - Document what fails so you can troubleshoot

---

## Deployment Readiness Checklist

Before deploying to production:

### Core Infrastructure
- ☐ Docker installed and running
- ☐ Docker Compose configured
- ☐ `nyra-network` created
- ☐ Infisical configured
- ☐ Environment variables set

### Databases
- ☐ PostgreSQL running
- ☐ Redis running
- ☐ Qdrant running
- ☐ FalkorDB running (optional)

### Memory Systems
- ☐ Letta installed
- ☐ ruvector integrated
- ☐ Memory persistence verified

### Applications
- ☐ Nexus Router running
- ☐ Open WebUI configured
- ☐ Cloudflare tunnel operational

### Security
- ☐ All secrets in Infisical
- ☐ TLS certificates valid
- ☐ Firewall rules configured
- ☐ Access policies set

See: [POST-CONSOLIDATION-GUIDE.md](POST-CONSOLIDATION-GUIDE.md) for complete checklist

---

## Support

For help:
1. Check the relevant guide
2. Check [TROUBLESHOOTING-FIXES.md](TROUBLESHOOTING-FIXES.md)
3. Search [INDEX.md](INDEX.md)
4. Review Docker and service logs

---

**Ready to get started?** Begin with [00-MASTER-SETUP-GUIDE.md](00-MASTER-SETUP-GUIDE.md) or choose your path above!

---

**Status**: Active and Maintained
**Last Updated**: 2026-01-22
**Version**: 1.0 (Consolidated)
**Total Guides**: 38
**Consolidation**: Complete
