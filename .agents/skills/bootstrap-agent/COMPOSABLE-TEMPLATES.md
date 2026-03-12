# 🧩 Composable Template System Documentation

**Version**: 2.0.0
**Status**: Production Ready
**Created**: January 8, 2026

---

## 🎯 Overview

The **Composable Template System** allows you to build custom CLAUDE.md files by **stacking atomic template modules** like Lego blocks. Instead of choosing a single monolithic template, you can mix and match specific modules to create exactly the configuration you need for each directory.

### Key Concept: **"Stack Your Brain"**

```
base/enterprise-foundation
    ↓
stack/react-nextjs
    ↓
init/security-hardened
    ↓
init/verification-strict
    ↓
mode/production-ready
    ↓
= Custom CLAUDE.md with all modules combined!
```

---

## 🏗️ System Architecture

### Components

1. **Atomic Template Modules** (`templates/modules/`)
   - Small, focused template fragments
   - Each covers one specific aspect
   - Can be combined in any order
   - Organized into categories

2. **Composition Engine** (`build-brains.js`)
   - Stacks modules in specified order
   - Injects context variables
   - Generates final CLAUDE.md files
   - Supports batch and single-directory modes

3. **Recipe File** (`nyra-structure.json`)
   - Defines which modules to combine
   - Specifies context for each directory
   - Supports presets for common combinations

4. **Fallback System**
   - Uses local modules first
   - Falls back to Claude Flow wiki templates
   - Warns if module not found

---

## 📚 Available Module Categories

### 1. **Base/** - Foundation Modules

**Purpose**: Core enterprise standards and project basics

| Module | Description |
|--------|-------------|
| `base/enterprise-foundation` | Git protocol, code review, documentation, quality gates, memory management |

**When to Use**: Every enterprise project should start with a base module

### 2. **Stack/** - Technology Stack Modules

**Purpose**: Tech-stack-specific conventions and best practices

| Module | Description | Languages/Frameworks |
|--------|-------------|---------------------|
| `stack/react-nextjs` | React 18 + Next.js 14 conventions | TypeScript, React, Next.js, Tailwind |
| `stack/java-spring` | Spring Boot patterns | Java 21, Spring Boot 3.2, Maven |
| `stack/python-fastapi` | FastAPI patterns | Python 3.11+, FastAPI, SQLAlchemy |

**When to Use**: Choose ONE stack module per project based on primary technology

### 3. **Init/** - Initialization Modes

**Purpose**: Special initialization rules and protocols

| Module | Description | Use Cases |
|--------|-------------|-----------|
| `init/security-hardened` | Comprehensive security protocols | Payment services, auth services, PII handling |
| `init/verification-strict` | Strict code verification | Critical services, production systems |

**When to Use**: Add init modules for special requirements (can stack multiple)

### 4. **Mode/** - Operating Modes

**Purpose**: Environment-specific configurations

| Module | Description | Environments |
|--------|-------------|--------------|
| `mode/production-ready` | Production deployment standards | Staging, Production |

**When to Use**: Add for production-bound services

### 5. **Enterprise/** - Enterprise Features

**Purpose**: Enterprise-grade compliance and governance

| Module | Description | Required For |
|--------|-------------|--------------|
| `enterprise/compliance` | GDPR, CCPA, HIPAA, PCI-DSS, SOC 2 | Regulated industries, financial services |

**When to Use**: Add for compliance-critical services

---

## 🚀 Quick Start

### Installation

The system is already installed in `.claude/skills/bootstrap-agent/`

```bash
cd .claude/skills/bootstrap-agent
```

### List Available Modules

```bash
node build-brains.js --list
```

Output:
```
📚 Available Template Modules:

BASE/
  - base/enterprise-foundation

STACK/
  - stack/react-nextjs
  - stack/java-spring
  - stack/python-fastapi

INIT/
  - init/security-hardened
  - init/verification-strict

MODE/
  - mode/production-ready

ENTERPRISE/
  - enterprise/compliance
```

---

## 📖 Usage Patterns

### Pattern 1: Batch Processing (Recommended)

**Use When**: Setting up multiple directories at once

1. **Create Recipe File** (`my-project.json`):

```json
[
  {
    "path": "./apps/frontend",
    "modules": [
      "base/enterprise-foundation",
      "stack/react-nextjs",
      "init/security-hardened"
    ],
    "context": {
      "appName": "Customer Portal",
      "orgName": "Acme Corp",
      "port": "3000",
      "environment": "production"
    }
  },
  {
    "path": "./services/api",
    "modules": [
      "base/enterprise-foundation",
      "stack/java-spring",
      "init/security-hardened",
      "mode/production-ready"
    ],
    "context": {
      "appName": "API Service",
      "orgSlug": "acme",
      "appSlug": "api",
      "port": "8080"
    }
  }
]
```

2. **Run Batch**:

```bash
node build-brains.js --config=my-project.json
```

3. **Result**: CLAUDE.md created in each directory with combined modules

### Pattern 2: Single Directory (Quick Mode)

**Use When**: Setting up one directory quickly

```bash
node build-brains.js --single ./apps/new-feature \
  --modules=base/enterprise-foundation,stack/react-nextjs,init/verification-strict
```

### Pattern 3: Dry Run (Preview)

**Use When**: Testing before generating

```bash
node build-brains.js --config=my-project.json --dry-run
```

---

## 🎨 Common Recipes

### Recipe A: Full Enterprise React App (Maximum Security)

**Modules**:
```
base/enterprise-foundation
→ stack/react-nextjs
→ init/security-hardened
→ init/verification-strict
→ mode/production-ready
→ enterprise/compliance
```

**Best For**: Customer-facing apps, payment portals, healthcare apps

```json
{
  "path": "./apps/secure-portal",
  "modules": [
    "base/enterprise-foundation",
    "stack/react-nextjs",
    "init/security-hardened",
    "init/verification-strict",
    "mode/production-ready",
    "enterprise/compliance"
  ]
}
```

### Recipe B: Standard Backend Service

**Modules**:
```
base/enterprise-foundation
→ stack/java-spring
→ init/security-hardened
→ mode/production-ready
```

**Best For**: Standard microservices, internal APIs

```json
{
  "path": "./services/inventory-api",
  "modules": [
    "base/enterprise-foundation",
    "stack/java-spring",
    "init/security-hardened",
    "mode/production-ready"
  ]
}
```

### Recipe C: Internal Development Tool

**Modules**:
```
base/enterprise-foundation
→ stack/react-nextjs
→ init/verification-strict
```

**Best For**: Admin dashboards, internal tools, dev utilities

```json
{
  "path": "./apps/admin-panel",
  "modules": [
    "base/enterprise-foundation",
    "stack/react-nextjs",
    "init/verification-strict"
  ]
}
```

### Recipe D: High-Compliance Financial Service

**Modules**:
```
base/enterprise-foundation
→ stack/java-spring
→ init/security-hardened
→ init/verification-strict
→ mode/production-ready
→ enterprise/compliance
```

**Best For**: Payment processing, banking, financial trading

```json
{
  "path": "./services/payment-processor",
  "modules": [
    "base/enterprise-foundation",
    "stack/java-spring",
    "init/security-hardened",
    "init/verification-strict",
    "mode/production-ready",
    "enterprise/compliance"
  ]
}
```

---

## 🔧 Context Variables

Context variables are injected into all modules using `{{variableName}}` syntax.

### Standard Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `appName` | Application name | "Customer Portal" |
| `orgName` | Organization name | "Acme Corp" |
| `environment` | Environment | "production" |
| `port` | Service port | "3000" |
| `version` | Version number | "2.0.0" |
| `devCommand` | Dev command | "pnpm dev" |
| `buildCommand` | Build command | "pnpm build" |
| `testCommand` | Test command | "pnpm test" |
| `lintCommand` | Lint command | "pnpm lint" |

### Stack-Specific Variables

**Java/Spring**:
- `orgSlug` - Organization slug for packages (e.g., "acme")
- `appSlug` - App slug for packages (e.g., "payment")

**Production**:
- `expectedRPS` - Expected requests/second (e.g., "5000")
- `licenseType` - Software license (e.g., "MIT")

### Example Context

```json
{
  "context": {
    "appName": "Payment Service",
    "orgName": "Nyra Corp",
    "orgSlug": "nyra",
    "appSlug": "payment",
    "environment": "production",
    "port": "8080",
    "version": "3.1.0",
    "devCommand": "mvn spring-boot:run",
    "buildCommand": "mvn clean package",
    "testCommand": "mvn test",
    "lintCommand": "mvn checkstyle:check",
    "expectedRPS": "5000",
    "licenseType": "Proprietary"
  }
}
```

---

## 📋 Presets

The system includes pre-defined presets in `nyra-structure.json`:

```json
{
  "presets": {
    "full-enterprise-react": [
      "base/enterprise-foundation",
      "stack/react-nextjs",
      "init/security-hardened",
      "init/verification-strict",
      "mode/production-ready",
      "enterprise/compliance"
    ],
    "full-enterprise-java": [
      "base/enterprise-foundation",
      "stack/java-spring",
      "init/security-hardened",
      "init/verification-strict",
      "mode/production-ready",
      "enterprise/compliance"
    ],
    "standard-react-app": [
      "base/enterprise-foundation",
      "stack/react-nextjs",
      "init/security-hardened"
    ]
  }
}
```

**Usage**: Reference presets in your config to avoid repeating module lists

---

## 🛠️ Adding Custom Modules

### 1. Create New Module

Create a markdown file in the appropriate category:

```bash
# Create new module
touch .claude/skills/bootstrap-agent/templates/modules/stack/my-stack.md
```

### 2. Write Module Content

```markdown
# 🚀 My Custom Stack Module

## Tech Stack
- **Framework**: My Framework 1.0
- **Language**: TypeScript

## Best Practices
- Use modern patterns
- Follow conventions

## Code Examples
\`\`\`typescript
// Example code
\`\`\`
```

### 3. Use in Recipe

```json
{
  "path": "./apps/my-app",
  "modules": [
    "base/enterprise-foundation",
    "stack/my-stack"
  ]
}
```

---

## 🔍 Module Discovery

Modules are discovered from two sources:

1. **Local Modules** (Priority 1)
   - Path: `.claude/skills/bootstrap-agent/templates/modules/`
   - Custom modules you create
   - Checked first

2. **Wiki Templates** (Priority 2)
   - Path: `docs/references/claude-flow-wiki/`
   - Claude Flow official templates
   - Used as fallback
   - Must be named `CLAUDE-MD-{name}.md`

---

## 📊 Comparison: Old vs New System

### Old System (Single Profile)

```json
{
  "path": "./apps/myapp",
  "profile": "nextjs-typescript",
  "context": { ... }
}
```

**Limitations**:
- ❌ One template per directory
- ❌ Can't mix concerns (e.g., security + compliance)
- ❌ Duplicates content across templates
- ❌ Hard to maintain

### New System (Composable Modules)

```json
{
  "path": "./apps/myapp",
  "modules": [
    "base/enterprise-foundation",
    "stack/react-nextjs",
    "init/security-hardened",
    "mode/production-ready"
  ],
  "context": { ... }
}
```

**Advantages**:
- ✅ Mix and match any modules
- ✅ Separation of concerns
- ✅ Reusable atomic modules
- ✅ Easy to maintain
- ✅ Granular control

---

## 🧪 Testing Your Configuration

### Step 1: Dry Run

```bash
node build-brains.js --config=my-project.json --dry-run
```

### Step 2: Generate for Single Directory

```bash
node build-brains.js --single ./test-dir \
  --modules=base/enterprise-foundation,stack/react-nextjs \
  --dry-run
```

### Step 3: Review Generated File

```bash
cat ./test-dir/CLAUDE.md
```

### Step 4: Full Batch Run

```bash
node build-brains.js --config=my-project.json
```

---

## 🎓 Best Practices

### 1. Module Ordering

**Recommended Order**:
```
1. base/*           (Foundation)
2. stack/*          (Tech stack)
3. init/*           (Initialization modes)
4. mode/*           (Operating modes)
5. enterprise/*     (Enterprise features)
```

Later modules can override earlier ones if there are conflicts.

### 2. Context Completeness

Always provide complete context:
```json
{
  "appName": "Required",
  "orgName": "Required",
  "environment": "Required",
  "port": "Required",
  "version": "Recommended",
  "devCommand": "Recommended"
}
```

### 3. Module Selection

- **Start Simple**: Begin with `base + stack`
- **Add As Needed**: Add init/mode/enterprise modules when requirements dictate
- **Don't Overload**: More modules isn't always better
- **Test Combinations**: Use --dry-run to preview

### 4. Version Control

- **Commit Recipe**: Check `nyra-structure.json` into git
- **Commit Generated**: Commit generated CLAUDE.md files
- **Track Changes**: Git diff shows what changed

---

## 🔗 Integration with Claude Flow

The composable template system integrates with Claude Flow wiki:

- Falls back to wiki templates if local module not found
- Uses `CLAUDE-MD-{name}.md` format from wiki
- Combines best of both: custom modules + community templates

**Example**:
```bash
# If "stack/react-nextjs" not found locally,
# system tries: docs/references/claude-flow-wiki/CLAUDE-MD-react-nextjs.md
```

---

## 📚 External Resources Integrated

### From Research (January 8, 2026)

1. **[claude-code-templates (NPM)](https://www.npmjs.com/package/claude-code-templates)** - 400+ community components
2. **[Claude Flow Wiki](https://github.com/ruvnet/claude-flow/wiki/CLAUDE-MD-Templates)** - Official templates
3. **[Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)** - Official guidelines
4. **[Enterprise Templates](https://github.com/ruvnet/claude-flow/wiki/CLAUDE-MD-Enterprise)** - Enterprise patterns

---

## 🚨 Troubleshooting

### Issue: Module Not Found

```
⚠️  Module not found: stack/my-stack
```

**Solution**:
1. Check module path: `templates/modules/stack/my-stack.md`
2. Check wiki fallback: `docs/references/claude-flow-wiki/CLAUDE-MD-my-stack.md`
3. Run `node build-brains.js --list` to see available modules

### Issue: Context Variable Not Replaced

```
{{appName}} appears in generated file
```

**Solution**:
- Ensure variable is in context object
- Check spelling matches exactly
- Variables are case-sensitive

### Issue: Modules Override Each Other

**Solution**:
- Review module order
- Later modules override earlier ones
- Separate concerns into different modules

---

## 🎉 Summary

The Composable Template System provides:

- ✅ **Flexibility**: Mix and match any modules
- ✅ **Reusability**: Atomic modules used across projects
- ✅ **Maintainability**: Update once, apply everywhere
- ✅ **Scalability**: Easy to add new modules
- ✅ **Enterprise-Ready**: Compliance, security, production standards
- ✅ **Community Integration**: Falls back to Claude Flow wiki

**Next Steps**:
1. Review available modules: `node build-brains.js --list`
2. Create your recipe file
3. Test with --dry-run
4. Generate your custom CLAUDE.md files!

---

**Documentation Version**: 2.0.0
**Last Updated**: January 8, 2026
**Maintainer**: Project Nyra Team

**Sources**:
- [claude-code-templates NPM](https://www.npmjs.com/package/claude-code-templates)
- [Claude Flow GitHub](https://github.com/ruvnet/claude-flow)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Anthropic Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
