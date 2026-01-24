# Setup Documentation - Directory Structure

**Purpose**: Document the organization of the consolidated setup documentation
**Last Updated**: 2026-01-22
**Version**: 1.0

---

## Overview

This document describes how setup documentation is organized in the `docs/setup/` directory. This is a consolidated location containing 38 unique setup guides previously spread across 7 different folders.

---

## Consolidation Summary

### Folders Consolidated (Legacy)
1. `docs/guides/` - Miscellaneous guides
2. `docs/manual-tasks/` - Manual setup tasks
3. `docs/manual-tasks/setup/` - Setup-specific tasks
4. `docs/manual-tasks/user-setup/` - User configuration
5. `docs/setup-guides/` - Master setup guides
6. `docs/user/` - User documentation (empty)
7. `docs/user-setup-guidance/` - User setup guidance

### New Canonical Location
- `docs/setup/` - Single unified setup documentation location

### Archived Location
- `docs/archive/deprecated-setup-folders/` - Legacy folders backed up for reference

---

## File Organization Structure

### Core Foundational Guides
Files that serve as entry points and comprehensive references.

```
docs/setup/
├── INDEX.md                          # ⭐ This index - START HERE for navigation
├── DIRECTORY-STRUCTURE.md             # This file - Organization documentation
├── README.md                          # (See section below for current README strategy)
│
├── 00-MASTER-SETUP-GUIDE.md          # ⭐ MAIN ENTRY POINT - Complete setup orchestration
├── 00-README-OVERNIGHT-SETUP.md      # Alternative: Automated overnight setup
├── 01-PREREQUISITES-CHECKLIST.md     # ⭐ REQUIRED - System requirements verification
```

**Purpose**: Provide clear entry points for users with different needs.
**Recommendation**: Start with `00-MASTER-SETUP-GUIDE.md` unless you need a specific scenario.

### Quick Start Guides
Fast-track setup options for different scenarios.

```
docs/setup/
├── QUICK-START.md                    # 30-minute overview quickstart
├── QUICK-START-DEVELOPMENT.md        # Development environment setup
├── TONIGHT-QUICK-START.md            # Fast evening setup (2-3 hours)
├── ultra-fast-start.md               # Ultra-fast deployment (1-2 hours)
├── WINDOWS_QUICK_START.md            # Windows-specific setup
│
└── QUICK-REFERENCE.md                # Quick reference card - Essential commands
```

**Purpose**: Provide multiple entry points based on time available and user background.
**Use Cases**:
- `QUICK-START.md` - First time overview
- `QUICK-START-DEVELOPMENT.md` - For developers setting up dev environment
- `TONIGHT-QUICK-START.md` - Evening/weekend setup session
- `ultra-fast-start.md` - Minimum viable setup
- `WINDOWS_QUICK_START.md` - Windows users
- `QUICK-REFERENCE.md` - Experienced users needing command reference

### Comprehensive Setup Guides
In-depth guides for complete setup and specific topics.

```
docs/setup/
├── SETUP-GUIDE.md                    # Comprehensive infrastructure guide
├── SETUP-INDEX.md                    # Alternative index for setup
├── primary-setup-guide.md            # Primary deployment approach
│
└── ULTIMATE-BATCH-INIT-GUIDE.md      # Advanced automated batch initialization
```

**Purpose**: Provide comprehensive reference documentation for complete setup.

### Environment & Secrets Management
Configuration and secret management setup.

```
docs/setup/
├── environment-setup.md              # Environment variable configuration
├── INFISICAL_DEPLOYMENT_GUIDE.md    # Infisical CLI and setup
├── infisical-deployment-strategy.md # Infisical deployment patterns
└── PHASE-3-QUICKSTART-INFISICAL.md  # Phase 3 specific Infisical setup
```

**Purpose**: Manage environment configuration and secret storage.
**Flow**: `environment-setup.md` → `INFISICAL_DEPLOYMENT_GUIDE.md` → `infisical-deployment-strategy.md`

### Framework & Tool Setup
Installation and configuration of key frameworks and tools.

```
docs/setup/
├── CLAUDE-FLOW-V3-SETUP.md           # Claude Flow V3 installation
├── CLAUDE-FLOW-ZOD-FIX.md            # Troubleshooting - Claude Flow Zod issues
├── PNPM_INSTALLATION.md              # pnpm package manager setup
└── repository-consolidation-quickstart.md  # Repository consolidation
```

**Purpose**: Setup specific frameworks and tools.
**Dependencies**: These should be set up after prerequisites but before applications.

### Development & Testing
Development environment and testing configuration.

```
docs/setup/
├── QUICK-START-DEVELOPMENT.md        # Development environment setup
└── TESTING-QUICKSTART.md             # Test suite configuration
```

**Purpose**: Setup development tools and testing infrastructure.

### Deployment & Cloud Integration
Deployment guides and cloud service integration.

```
docs/setup/
├── CLOUDFLARE-PAGES-SETUP.md         # Cloudflare Pages deployment
├── DOCKER-MIGRATION-GUIDE.md         # Docker containerization
└── VLLM-MIGRATION-GUIDE.md           # vLLM model server setup
```

**Purpose**: Deployment and cloud infrastructure setup.

### Service Integration Guides
Integration with external services.

```
docs/setup/
├── NEXUS-ROUTER-INTEGRATION-GUIDE.md  # Nexus Router deployment
├── google-workspace-integration.md   # Google Workspace API setup
├── EMAIL-SETUP-GUIDE.md              # Email service configuration
├── websocket-integration.md          # WebSocket server setup
└── N8N-DEPLOYMENT-COMPARISON.md      # n8n workflow engine
```

**Purpose**: Integrate with external services and APIs.

### Local AI/Model Setup
Local model deployment and configuration.

```
docs/setup/
└── local-model-setup.md              # Local LLM model deployment
```

**Purpose**: Setup and configure local AI models.

### Phase-Specific Guides
Setup guides specific to project phases.

```
docs/setup/
├── PHASE-2-3-COMPLETION-SUMMARY.md  # Phase 2-3 completion status
└── phase3-orchestration-execution-guide.md  # Phase 3 orchestration details
```

**Purpose**: Phase-specific setup and implementation details.

### Post-Setup Configuration
Setup completion and next steps.

```
docs/setup/
├── POST-CONSOLIDATION-GUIDE.md      # Post-setup configuration
└── CONSOLIDATION-SUMMARY.md         # Setup consolidation status
```

**Purpose**: Final configuration steps and validation.

### Troubleshooting & Issue Resolution
Problem resolution and bug fixes.

```
docs/setup/
├── TROUBLESHOOTING-FIXES.md         # Main troubleshooting guide
└── CLAUDE-FLOW-ZOD-FIX.md            # Claude Flow Zod error fixes
```

**Purpose**: Troubleshooting common issues during setup.

### Version & Reference Guides
Versioned guides and reference documentation.

```
docs/setup/
└── YOUR-MANUAL-SETUP-GUIDE-v1.md    # Version 1 reference guide
```

**Purpose**: Reference and legacy setup approaches.

---

## Complete File Listing

### By File Type

#### Master Guides (Entry Points)
- `00-MASTER-SETUP-GUIDE.md` - ⭐ MAIN
- `SETUP-GUIDE.md` - Comprehensive
- `primary-setup-guide.md` - Alternative

#### Quick Start Guides
- `QUICK-START.md`
- `QUICK-START-DEVELOPMENT.md`
- `TONIGHT-QUICK-START.md`
- `ultra-fast-start.md`
- `WINDOWS_QUICK_START.md`

#### Quick References
- `QUICK-REFERENCE.md`
- `SETUP-INDEX.md`

#### Setup & Configuration
- `00-README-OVERNIGHT-SETUP.md`
- `01-PREREQUISITES-CHECKLIST.md`
- `environment-setup.md`
- `repository-consolidation-quickstart.md`

#### Framework & Tools
- `CLAUDE-FLOW-V3-SETUP.md`
- `PNPM_INSTALLATION.md`
- `CLAUDE-FLOW-ZOD-FIX.md`

#### Development
- `QUICK-START-DEVELOPMENT.md`
- `TESTING-QUICKSTART.md`

#### Deployment
- `CLOUDFLARE-PAGES-SETUP.md`
- `DOCKER-MIGRATION-GUIDE.md`
- `VLLM-MIGRATION-GUIDE.md`

#### Services & Integration
- `NEXUS-ROUTER-INTEGRATION-GUIDE.md`
- `google-workspace-integration.md`
- `EMAIL-SETUP-GUIDE.md`
- `websocket-integration.md`
- `N8N-DEPLOYMENT-COMPARISON.md`

#### Infisical
- `INFISICAL_DEPLOYMENT_GUIDE.md`
- `infisical-deployment-strategy.md`
- `PHASE-3-QUICKSTART-INFISICAL.md`

#### AI/Models
- `local-model-setup.md`

#### Phases
- `PHASE-2-3-COMPLETION-SUMMARY.md`
- `phase3-orchestration-execution-guide.md`

#### Post-Setup
- `POST-CONSOLIDATION-GUIDE.md`
- `CONSOLIDATION-SUMMARY.md`

#### Advanced
- `ULTIMATE-BATCH-INIT-GUIDE.md`

#### Troubleshooting
- `TROUBLESHOOTING-FIXES.md`

#### Reference
- `YOUR-MANUAL-SETUP-GUIDE-v1.md`

---

## Naming Conventions

### Prefix Standards
- `00-` - Foundational core guides (master setup, prerequisites)
- `01-` - Primary requirements and checklists
- `QUICK-` - Quick start and quick reference guides
- `PHASE-X-` - Phase-specific guides
- `[TOPIC]-SETUP` - Topic-specific setup guides
- `[TOPIC]-GUIDE` - Comprehensive topic guides
- `[TOPIC]-INTEGRATION-GUIDE` - Service integration guides
- `[TOPIC]-DEPLOYMENT-GUIDE` - Deployment-specific guides
- `[TOPIC]-FIX` - Issue-specific fixes and workarounds
- None - Alternative implementation guides

### Capitalization Standards
- All Words Capitalized: `MASTER-SETUP-GUIDE.md`
- lowercase-with-dashes: `environment-setup.md`, `google-workspace-integration.md`
- Mixed: `phase3-orchestration-execution-guide.md`

**Consistency Note**: Naming conventions evolved over time. Files are kept with their original names for reference consistency.

---

## Navigation Pathways

### By User Experience Level

#### Beginner (First-Time Setup)
1. Read: `INDEX.md` (this overview)
2. Verify: `01-PREREQUISITES-CHECKLIST.md`
3. Start: `00-MASTER-SETUP-GUIDE.md`
4. Reference: `QUICK-REFERENCE.md`
5. Troubleshoot: `TROUBLESHOOTING-FIXES.md`

#### Intermediate (Some Experience)
1. Review: `QUICK-REFERENCE.md`
2. Reference: `00-MASTER-SETUP-GUIDE.md` (specific sections)
3. Implement: Topic-specific guides as needed
4. Troubleshoot: `TROUBLESHOOTING-FIXES.md`

#### Advanced (Experienced Users)
1. Check: `QUICK-REFERENCE.md`
2. Implement: Specific topic guides
3. Automate: `ULTIMATE-BATCH-INIT-GUIDE.md`
4. Debug: Specific fix guides as needed

### By Time Available

#### 30 Minutes
- `QUICK-START.md`
- `QUICK-REFERENCE.md`

#### 1-2 Hours
- `ultra-fast-start.md`
- `QUICK-START-DEVELOPMENT.md`

#### Evening Session (3-4 Hours)
- `TONIGHT-QUICK-START.md`
- Specific phase guides

#### Full Day Setup
- `00-MASTER-SETUP-GUIDE.md`
- `SETUP-GUIDE.md`

#### Automated/Overnight
- `00-README-OVERNIGHT-SETUP.md`
- `ULTIMATE-BATCH-INIT-GUIDE.md`

### By Platform

#### Windows
- `WINDOWS_QUICK_START.md`
- `01-PREREQUISITES-CHECKLIST.md`
- Platform-specific sections in master guides

#### Linux
- `00-MASTER-SETUP-GUIDE.md`
- `primary-setup-guide.md`

#### macOS
- `00-MASTER-SETUP-GUIDE.md`
- Check prerequisites for macOS-specific requirements

### By Feature Area

#### Environment Configuration
1. `environment-setup.md`
2. `INFISICAL_DEPLOYMENT_GUIDE.md`
3. `infisical-deployment-strategy.md`

#### Claude Flow
1. `CLAUDE-FLOW-V3-SETUP.md`
2. `00-MASTER-SETUP-GUIDE.md` (MCP Servers section)
3. `CLAUDE-FLOW-ZOD-FIX.md` (if issues)

#### Development
1. `QUICK-START-DEVELOPMENT.md`
2. `TESTING-QUICKSTART.md`

#### Deployment
1. `NEXUS-ROUTER-INTEGRATION-GUIDE.md`
2. `CLOUDFLARE-PAGES-SETUP.md`
3. `VLLM-MIGRATION-GUIDE.md`

#### Troubleshooting
1. Specific fix guide (e.g., `CLAUDE-FLOW-ZOD-FIX.md`)
2. `TROUBLESHOOTING-FIXES.md`

---

## Related Documentation

### Other Directories
- `docs/deployment/` - Deployment-specific documentation
- `docs/operations/` - Operations and runbooks
- `docs/manual-tasks/` - Manual task procedures
- `docs/architecture/` - Architecture documentation
- `docs/api/` - API documentation

### Main Project Documentation
- `CLAUDE.md` - Project configuration (root)
- `README.md` - Main project README

---

## Maintenance Guidelines

### Adding New Setup Guides
1. Place in `docs/setup/` directory
2. Use naming convention: `[topic]-[type].md`
3. Add entry to `INDEX.md`
4. Update this `DIRECTORY-STRUCTURE.md` if needed
5. Link from relevant guides

### Updating Existing Guides
1. Update the guide directly
2. Update `Last Updated` date
3. Update `INDEX.md` if description changes
4. Update related guides' cross-references

### Removing Outdated Guides
1. Move to `docs/archive/deprecated-setup-folders/old-guides/`
2. Update `INDEX.md` to note deprecation
3. Add note in replaced guide about where to find new documentation

### Version Control
- Each major revision warrants a version suffix (e.g., `-v1`, `-v2`)
- Keep all versions for reference
- Update `INDEX.md` to point to latest version

---

## Consolidation Statistics

### Files Consolidated
- **Total Files**: 38 unique setup guides
- **Legacy Locations**: 7 folders
- **Files Merged**: Multiple duplicates identified and consolidated
- **New Guides Created**: INDEX.md, DIRECTORY-STRUCTURE.md, consolidated TROUBLESHOOTING.md

### Consolidation Benefits
✅ Single canonical location for all setup documentation
✅ Improved navigation and discoverability
✅ Reduced duplication
✅ Clearer organization by topic and phase
✅ Enhanced cross-referencing

### Future Improvements
- Automated index generation from file metadata
- Enhanced search and filtering
- Setup wizard based on documentation
- Video tutorials complementing written guides

---

## Quick Links

| Need | File |
|------|------|
| Where do I start? | [INDEX.md](INDEX.md) or [00-MASTER-SETUP-GUIDE.md](00-MASTER-SETUP-GUIDE.md) |
| Quick commands? | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) |
| Pre-setup checklist? | [01-PREREQUISITES-CHECKLIST.md](01-PREREQUISITES-CHECKLIST.md) |
| Quick 30-min overview? | [QUICK-START.md](QUICK-START.md) |
| Windows user? | [WINDOWS_QUICK_START.md](WINDOWS_QUICK_START.md) |
| Short on time? | [ultra-fast-start.md](ultra-fast-start.md) |
| Dev environment? | [QUICK-START-DEVELOPMENT.md](QUICK-START-DEVELOPMENT.md) |
| Something broken? | [TROUBLESHOOTING-FIXES.md](TROUBLESHOOTING-FIXES.md) |
| Claude Flow issue? | [CLAUDE-FLOW-ZOD-FIX.md](CLAUDE-FLOW-ZOD-FIX.md) |
| Setup-specific topics? | Browse files starting with topic name |

---

**Document Version**: 1.0
**Last Updated**: 2026-01-22
**Status**: Active
**Maintenance**: Regularly updated as documentation evolves
