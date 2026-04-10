# Shared - Claude Flow V3 Configuration

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**CLI coordinates, Task tool agents do the actual work!**

---

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster | <1ms | $0 | Simple transforms |
| **2** | Haiku | ~500ms | $0.0002 | Simple tasks |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Complex reasoning |

---

## 🛡️ ANTI-DRIFT CONFIG

```bash
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized
```

---

## 🔄 AUTO-START SWARM PROTOCOL & ⏸️ SPAWN AND WAIT PATTERN

1. Tell user concurrent tasks
2. STOP - no more tool calls
3. WAIT - let agents work
4. RESPOND - synthesize results

---

## 🧠 AUTO-LEARNING PROTOCOL

```bash
npx @archon-os/cli@latest memory search --query '[keywords]' --namespace patterns
npx @archon-os/cli@latest memory store --namespace patterns --key '[pattern]' --value '[result]'
npx @archon-os/cli@latest hooks post-task --task-id '[id]' --success true --store-results true
```

---

## 🚀 V3 CLI COMMANDS & 🚀 AVAILABLE AGENTS & 🪝 V3 HOOKS SYSTEM

```bash
npx @archon-os/cli@latest swarm init/status
npx @archon-os/cli@latest memory store/search/retrieve
npx @archon-os/cli@latest hooks pre-task/post-task/post-edit
```

Agents: `researcher`, `coder`, `reviewer`, `architect`

---

## 📝 MEMORY COMMANDS REFERENCE

```bash
npx @archon-os/cli@latest memory store --key "shared-pattern" --value "content" --namespace patterns
npx @archon-os/cli@latest memory search --query "shared resources" --namespace patterns
```

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"**

---

## 🎯 Shared - Common Assets and Resources

## 🎯 APPLICATION CONTEXT

**Purpose**: Centralized repository for shared assets, data files, and documentation used across multiple applications in the Project Nyra monorepo.

**Type**: Utility Directory
**Pattern**: DRY (Don't Repeat Yourself) principle
**Usage**: Referenced by apps/web/* applications

## 🚨 CRITICAL DEVELOPMENT RULES

### Single Source of Truth
**MANDATORY**: All shared resources must have ONE canonical location here:

```javascript
// ✅ CORRECT: Import from shared
import { Logo } from '@nyra/shared/assets/logo.svg'
import { mortgageTypes } from '@nyra/shared/data/loan-types'
import { API_DOCS } from '@nyra/shared/docs/api-reference'

// ❌ WRONG: Duplicate assets in individual apps
// Don't copy logo.svg to each app - reference from shared
```

### Parallel Update Pattern
**MANDATORY**: When updating shared resources, update all dependent files concurrently:

```javascript
// ✅ CORRECT: Batch shared resource updates
[Single Message]:
  // Update shared resource
  - Edit("apps/shared/data/loan-types.ts", addNewLoanType)

  // Update all consuming apps simultaneously
  - Edit("apps/web/ratehunter/components/loan-selector.tsx", useNewLoanType)
  - Edit("apps/web/nyra-admin/pages/loans.tsx", useNewLoanType)
  - Edit("apps/web/webapp/features/loan-application.tsx", useNewLoanType)

  // Update documentation
  - Edit("apps/shared/docs/data-schema.md", documentNewType)

// ❌ WRONG: Update shared resource without checking dependents
[Message 1]: Update loan-types.ts
[Later]: Hope nothing breaks...
```

### Version Control
**CRITICAL**: Shared resources are versioned and breaking changes require migration plan:

- Major changes: Update all dependents in same commit
- Deprecation: Add warnings before removal
- Breaking changes: Coordinate across teams
- Documentation: Update immediately with changes

## 📊 SHARED ARCHITECTURE

### Directory Structure
```
apps/shared/
├── CLAUDE.md              # This file - development guidelines
├── assets/                # Images, icons, fonts, media
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero-bg.jpg
│   │   └── icons/
│   ├── fonts/
│   │   ├── inter/
│   │   └── roboto/
│   └── videos/
│       └── demo.mp4
├── data/                  # Static data files and schemas
│   ├── loan-types.ts      # Mortgage loan type definitions
│   ├── states.ts          # US state data with regulations
│   ├── compliance.ts      # Compliance requirement data
│   ├── rate-tiers.ts      # Credit score to rate mapping
│   └── schemas/
│       ├── lead-schema.json
│       └── quote-schema.json
└── docs/                  # Shared documentation
    ├── api-reference.md   # API endpoint documentation
    ├── data-schema.md     # Data model documentation
    ├── compliance-guide.md # Regulatory compliance reference
    └── style-guide.md     # UI/UX style guidelines
```

### Asset Categories

**Images & Media**:
- Brand assets (logos, wordmarks)
- Hero images and backgrounds
- Icons and illustrations
- Product screenshots
- Video content

**Data Files**:
- Loan type definitions
- State-specific regulations
- Credit score tiers
- Compliance templates
- Rate calculation formulas

**Documentation**:
- API references
- Data schemas
- Compliance guides
- Style guidelines
- Integration docs

## 🧠 CLAUDE FLOW INTEGRATION

### Available Agents
```yaml
agents:
  asset_manager:
    role: Shared asset organization and optimization
    focus: [image-optimization, asset-versioning, cdn-preparation]
    responsibilities:
      - Optimize images (compression, format conversion)
      - Version control for assets
      - Prepare for CDN deployment
      - Track asset usage across apps

  data_architect:
    role: Shared data schema design and validation
    focus: [schema-design, type-safety, validation-rules]
    responsibilities:
      - Design TypeScript data schemas
      - Create Zod validation schemas
      - Ensure type safety across apps
      - Document data structures

  documentation_specialist:
    role: Maintain shared documentation
    focus: [api-docs, schema-docs, compliance-guides]
    responsibilities:
      - Keep documentation up-to-date
      - Document breaking changes
      - Create migration guides
      - Maintain style guides
```

### Recommended Workflows

**1. Add New Shared Asset**
```bash
# Pre-task: Check for duplicates
npx @archon-os/cli@latest memory search \
  --query "asset similar to [description]" \
  --namespace shared

# Add asset with metadata
npx @archon-os/cli@latest memory store \
  --namespace shared \
  --key "asset/[name]" \
  --value '{"type": "image", "used_by": ["ratehunter", "webapp"]}'

# Post-task: Update usage tracking
npx @archon-os/cli@latest hooks post-task \
  --task-id "add-asset-001" \
  --success true \
  --store-results true
```

**2. Update Shared Data Schema**
```bash
# Check dependents before updating
npx @archon-os/cli@latest memory retrieve \
  --namespace shared \
  --key "schema/[name]/dependents"

# Update with migration plan
# (Coordinate updates to all dependent apps)

# Document changes
npx @archon-os/cli@latest memory store \
  --namespace shared \
  --key "schema/[name]/changelog" \
  --value "$(date -I): Updated [field] - migration required"
```

**3. Optimize Shared Assets**
```bash
# Run optimization worker
npx @archon-os/cli@latest hooks worker dispatch --trigger optimize

# Benchmark before/after
npx @archon-os/cli@latest performance benchmark --suite assets
```

## 🔧 USAGE EXAMPLES

### Import Shared Assets
```typescript
// In any app (ratehunter, webapp, nyra-admin)
import { Logo, HeroImage } from '@nyra/shared/assets'
import { loanTypes, states, creditTiers } from '@nyra/shared/data'
import { API_ENDPOINTS } from '@nyra/shared/docs'

// Use in components
export function Header() {
  return (
    <header>
      <img src={Logo} alt="RateHunter" />
    </header>
  )
}

export function LoanSelector() {
  return (
    <select>
      {loanTypes.map(type => (
        <option key={type.id} value={type.id}>
          {type.name}
        </option>
      ))}
    </select>
  )
}
```

### TypeScript Module Resolution
```json
// tsconfig.json in each app
{
  "compilerOptions": {
    "paths": {
      "@nyra/shared/*": ["../shared/*"]
    }
  }
}
```

## 📈 ASSET MANAGEMENT

### Image Optimization
- **Format**: WebP with PNG/JPG fallbacks
- **Compression**: 80-85% quality for photos, lossless for logos
- **Sizes**: Multiple sizes for responsive images
- **Lazy Loading**: Load below-the-fold images lazily

### Data Validation
```typescript
// apps/shared/data/loan-types.ts
import { z } from 'zod'

export const LoanTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  minCreditScore: z.number().min(300).max(850),
  maxLTV: z.number().min(0).max(100),
  requiresPMI: z.boolean(),
})

export type LoanType = z.infer<typeof LoanTypeSchema>

export const loanTypes: LoanType[] = [
  {
    id: 'conventional',
    name: 'Conventional',
    description: '30-year fixed rate mortgage',
    minCreditScore: 620,
    maxLTV: 97,
    requiresPMI: true,
  },
  // ... more loan types
]
```

## 🔒 SECURITY & COMPLIANCE

### Asset Security
- **No Secrets**: Never commit API keys or credentials
- **License Compliance**: Verify all assets are properly licensed
- **Copyright**: Document attribution for third-party assets
- **Access Control**: Public assets only (no PII)

### Data Privacy
- **No PII**: Shared data must not contain personal information
- **Anonymized Examples**: Use fake data for documentation
- **Compliance**: All data structures must support regulatory requirements

## 🔄 AUTO-LEARNING PROTOCOL

### Before Adding New Shared Resource
```bash
# Search for similar existing resources
npx @archon-os/cli@latest memory search \
  --query "shared asset [type] [description]" \
  --namespace shared

# Check usage patterns
npx @archon-os/cli@latest memory search \
  --query "asset usage patterns" \
  --namespace patterns
```

### After Successful Update
```bash
# Store successful pattern
npx @archon-os/cli@latest memory store \
  --namespace patterns \
  --key "shared-update-$(date +%Y%m%d)" \
  --value "Updated [resource] used by [apps] successfully"

# Track usage
npx @archon-os/cli@latest memory store \
  --namespace shared \
  --key "usage/[resource]" \
  --value '{"apps": ["ratehunter", "webapp"], "updated": "$(date -I)"}'
```

## 📚 RELATED DOCUMENTATION

- **Root CLAUDE.md**: V3 orchestration patterns
- **apps/web/*/CLAUDE.md**: Individual app documentation
- **docs/data-schema.md**: Data structure reference
- **docs/style-guide.md**: UI/UX guidelines

## 🎨 MAINTENANCE PRIORITIES

### Regular Tasks
1. **Optimize Images**: Quarterly review and re-optimize
2. **Update Data**: Monthly data freshness checks
3. **Documentation**: Update with any changes
4. **Dependency Check**: Scan for unused shared resources
5. **Version Control**: Track breaking changes

### Quality Checks
- [ ] All images optimized (< 500KB)
- [ ] All data validated with schemas
- [ ] Documentation up-to-date
- [ ] No duplicate assets across apps
- [ ] Usage tracking current

---

**Shared resources reduce duplication, ensure consistency, and simplify maintenance across all Nyra applications. Treat this directory as a critical dependency that requires careful change management.**
