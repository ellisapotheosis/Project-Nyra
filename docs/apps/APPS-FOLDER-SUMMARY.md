# Apps/ Folder Architecture - Executive Summary

**Version:** 1.0.0
**Date:** 2026-01-18
**Status:** Proposed
**Full Specification:** [APPS-FOLDER-ARCHITECTURE.md](./APPS-FOLDER-ARCHITECTURE.md)

---

## Visual Structure

```
apps/
├── web/                         # Frontend web applications (Port: 3000-3099)
│   ├── mortgage-assistant/      # Main loan officer dashboard (3000)
│   ├── ratehunter/             # Rate comparison tool (3009)
│   ├── nexus-dashboard/        # System monitoring (3002)
│   ├── nyra-admin/             # Admin panel (3003)
│   ├── crm/                    # CRM application
│   ├── crm-dashboard/          # CRM analytics
│   └── webapp/                 # General web app
│
├── landing/                     # Marketing pages (Port: 3100-3199)
│   ├── ratehunter-landing/     # RateHunter marketing (3001)
│   └── main-landing/           # Main Nyra landing (future)
│
├── desktop/                     # Desktop applications
│   └── installer/              # Bootstrap GUI installer
│
├── cli/                         # Command-line tools
│   ├── nyra-cli/               # Main CLI (future)
│   └── deployment-cli/         # Deployment automation (future)
│
├── mobile/                      # Mobile apps (future)
│   ├── ios/
│   └── android/
│
├── utilities/                   # Development tools
│   ├── shadcn-tweakcn/         # Component development
│   └── design-system/          # Design system docs (future)
│
├── ingestion/                   # Content processing & migration
│   ├── historical/             # Archive content migration
│   ├── external/               # User uploads & imports
│   ├── processing/             # Active processing
│   ├── scripts/                # Processing automation
│   └── outputs/                # Processed results (temp)
│
└── shared/                      # Shared resources
    ├── assets/                 # Images, icons, fonts
    ├── data/                   # Seed data, fixtures
    └── docs/                   # Guides, screenshots
```

---

## Design Principles

### 1. Category-Based Organization

Apps are organized by **type** (web, landing, cli) not domain (mortgage, admin)

- **Why:** Technical similarity, easier build optimization, clearer team boundaries

### 2. Clear Separation of Concerns

- **Production apps:** `web/`, `landing/`, `desktop/`, `mobile/`
- **Development tools:** `utilities/`
- **Temporary processing:** `ingestion/`
- **Shared resources:** `shared/`

### 3. Naming Conventions

- **Directories:** kebab-case (`mortgage-assistant`)
- **Packages:** `@nyra/app-name` (`@nyra/mortgage-assistant`)
- **Components:** PascalCase (`Button.tsx`)
- **Utilities:** camelCase (`formatCurrency.ts`)

### 4. Port Allocation

| Category       | Range     | Examples                                 |
| -------------- | --------- | ---------------------------------------- |
| Web Apps       | 3000-3099 | mortgage-assistant:3000, ratehunter:3009 |
| Landing Pages  | 3100-3199 | ratehunter-landing:3001                  |
| Desktop Apps   | 3200-3299 | Reserved                                 |
| Services       | 3300-3999 | Various backend APIs                     |
| Infrastructure | 4000-4999 | WebSocket, databases                     |

---

## Ingestion Folder Purpose

### What Goes in `apps/ingestion/`

**Temporary staging area for:**

1. **Historical Content Migration** (`historical/`)
   - Archived configs from `_archive/ingestion-historical-2026-01-18/`
   - Legacy documentation and guides
   - Old backup files
   - Content being migrated to new structure

2. **External Content Processing** (`external/`)
   - User document uploads
   - Third-party data imports
   - Bulk content ingestion
   - API data imports

3. **Processing Workflows** (`processing/`)
   - `queue/` - Files awaiting processing
   - `in-progress/` - Currently processing
   - `completed/` - Successfully processed (30d retention)
   - `failed/` - Failed attempts (90d retention)

### Processing Flow

```
[Input] → [Validate] → [Queue] → [Process] → [Complete] → [Distribute]
                           ↓                      ↓
                        [Failed] ←────────────────┘
```

**Key Features:**

- Automated validation against schemas
- Processing scripts for migration/transformation
- Metadata tracking (what's been processed)
- Retention policies (temp files auto-cleanup)
- Gitignored (except structure and metadata)

---

## Integration Approach

### How Apps Communicate

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Web App    │─────▶│ API Gateway │─────▶│  Service    │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                     │
       │              ┌─────▼─────┐              │
       └──────────────│Event Bus  │◀─────────────┘
                      └───────────┘
```

**Patterns:**

1. **API Gateway + Event Bus**
   - Apps call backend via REST/GraphQL
   - Services publish events
   - Apps subscribe to events
   - No direct app-to-app calls

2. **Shared Configuration** (`configs/`)

   ```
   configs/
   ├── shared/
   │   ├── api-endpoints.json
   │   ├── feature-flags.json
   │   └── environments.json
   └── app-specific/
       └── {app-name}.json
   ```

3. **Shared Packages** (`packages/`)

   ```typescript
   import { Button } from "@nyra/ui";
   import { formatCurrency } from "@nyra/utils";
   import { User } from "@nyra/types";
   ```

4. **Service Mapping**
   - `mortgage-assistant` → `mortgage-assistant-api`
   - `ratehunter` → `ratehunter-api`
   - `nexus-dashboard` → `nexus-router`
   - `nyra-admin` → `auth-service`

5. **Docker Integration**
   - Each app has Dockerfile
   - Docker Compose orchestration
   - Environment-specific configs

---

## Build System

### Turborepo + pnpm Workspaces

**Workspace Configuration:**

```yaml
packages:
  - "apps/web/*"
  - "apps/ratehunter/*"
  - "apps/desktop/*"
  - "apps/cli/*"
  - "apps/mobile/*"
  - "apps/utilities/*"
  - "apps/ingestion"
  - "packages/*"
  - "services/*"
```

**Common Commands:**

```bash
# Development
pnpm dev                          # Start all apps
pnpm dev:web                      # Start web apps only
pnpm --filter @nyra/mortgage-assistant dev  # Start specific app

# Build
pnpm build                        # Build all
pnpm build:web                    # Build web apps only
pnpm --filter @nyra/mortgage-assistant build

# Test
pnpm test                         # Test all
pnpm test:web                     # Test web apps only
pnpm --filter @nyra/mortgage-assistant test
```

**Turborepo Pipeline:**

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
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

---

## Migration Plan

### 6-Phase Approach (4 Weeks)

**Phase 1: Assessment** (Week 1)

- Inventory current apps
- Map dependencies
- Create migration plan
- **Status:** ✅ Complete

**Phase 2: Structure Creation** (Week 1-2)

- Create new folder structure (empty)
- Write documentation
- Create app templates
- **Status:** 🔄 Ready to start

**Phase 3: App Migration** (Week 2-4)

- Migrate utilities first (lowest risk)
- Then landing pages
- Then web apps (one by one)
- Test each migration
- **Status:** ⏳ Pending

**Phase 4: Ingestion Setup** (Week 3)

- Create ingestion structure
- Write processing scripts
- Move archive content
- Test workflows
- **Status:** ⏳ Pending

**Phase 5: Integration Updates** (Week 4)

- Update Docker Compose
- Update CI/CD pipelines
- Update deployment scripts
- Update documentation
- **Status:** ⏳ Pending

**Phase 6: Validation & Cleanup** (Week 4)

- Full system test
- Performance testing
- Security audit
- Remove old structure
- **Status:** ⏳ Pending

---

## App Migration Priority

```
1. utilities/shadcn-tweakcn          [Lowest Risk]
2. landing/ratehunter-landing
3. web/mortgage-assistant
4. web/ratehunter
5. web/nexus-dashboard
6. web/nyra-admin
7. web/crm
8. web/crm-dashboard
9. web/webapp
10. desktop/installer
11. shared/assets
12. shared/data
13. shared/docs                      [Highest Impact]
```

**Migration Checklist per App:**

- [ ] Move to new location
- [ ] Update package.json name
- [ ] Update imports and configs
- [ ] Test build and runtime
- [ ] Update Docker files
- [ ] Update CI/CD
- [ ] Update documentation
- [ ] Remove old location

---

## Key Decisions

### Why Category-Based vs Domain-Based?

**Chosen:** Category-based (web, landing, cli)
**Rejected:** Domain-based (mortgage, admin, marketing)

**Rationale:**

- Apps in same category share tech stack
- Easier build optimization (Turborepo caching)
- Clearer team boundaries
- More scalable (easy to add new apps)

### Why Separate Ingestion Folder?

**Rationale:**

- Content is temporary (shouldn't pollute other folders)
- Needs special workflow (queue → process → complete)
- Most content shouldn't be version controlled
- Clear isolation from production apps
- Easy to track processing status

### Why Shared Folder vs Packages?

**apps/shared/**

- Static resources (images, fonts, data files)
- Not executable code
- Large binary files OK

**packages/**

- Reusable code (components, utilities)
- Versioned and published
- TypeScript/JavaScript only

---

## Success Metrics

**Migration Success:**

- [ ] All apps migrated without breaking changes
- [ ] All tests pass
- [ ] All builds succeed
- [ ] No production downtime
- [ ] Documentation complete

**Structural Quality:**

- [ ] Every app has README.md and CLAUDE.md
- [ ] Consistent package.json structure
- [ ] No duplicate code across apps
- [ ] Clear dependency graph

**Developer Productivity:**

- [ ] <15 min to add new app
- [ ] <5 min to start development
- [ ] <1 day onboarding time
- [ ] Zero "where does this go?" questions

---

## Quick Reference

### Adding a New Web App

```bash
# 1. Copy template
cp -r apps/.templates/nextjs-app apps/web/my-app

# 2. Update package.json
cd apps/web/my-app
# Edit: name to "@nyra/my-app"

# 3. Install dependencies
pnpm install

# 4. Start development
pnpm dev

# 5. Assign port (3000-3099 range)
# Edit: package.json dev script with "-p 3010"

# 6. Add to workspace
# (Already included via pnpm-workspace.yaml wildcard)

# 7. Create README.md and CLAUDE.md
```

### Processing Ingested Content

```bash
# 1. Place content in ingestion/external/uploads/
cp /path/to/content apps/ingestion/external/uploads/

# 2. Run processing
cd apps/ingestion
node scripts/index.js --validate --process

# 3. Check results
ls processing/completed/
ls processing/failed/

# 4. Distribute processed content
node scripts/distribute.js
```

### Common Integration Patterns

```typescript
// Import from shared packages
import { Button } from "@nyra/ui";
import { formatCurrency } from "@nyra/utils";
import { User } from "@nyra/types";

// Import shared config
import sharedConfig from "@/configs/shared/api-endpoints.json";

// Import shared assets
import logo from "@/apps/shared/assets/images/logo.png";

// Call backend service
const response = await fetch(`${API_URL}/applications`);
```

---

## Next Steps

### Immediate (This Week)

1. Review and approve this architecture
2. Create empty folder structure
3. Write READMEs for each category
4. Create app templates

### Short-Term (Weeks 2-3)

1. Begin app migration (utilities first)
2. Set up ingestion system
3. Test migration process
4. Update build system

### Medium-Term (Week 4)

1. Complete all app migrations
2. Update integrations
3. Validate entire system
4. Clean up old structure
5. Update all documentation

---

## Resources

- **Full Architecture:** [APPS-FOLDER-ARCHITECTURE.md](./APPS-FOLDER-ARCHITECTURE.md)
- **System Architecture:** [system-architecture.md](./system-architecture.md)
- **Turborepo Guide:** [turborepo-architecture.md](./turborepo-architecture.md)
- **Migration Scripts:** `scripts/consolidation/` (to be created)

---

**Document Owner:** System Architecture Team
**Status:** Proposed - Awaiting Approval
**Review Date:** 2026-01-25
**Contact:** architecture@nyra.com (placeholder)
