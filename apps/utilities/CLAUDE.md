# Utilities - Development Tools and Helpers

## 🎯 APPLICATION CONTEXT

**Purpose**: Collection of development utilities, CLI tools, and helper scripts that enhance the Project Nyra development experience.

**Primary Tool**: shadcn-tweakcn (shadcn/ui component customization tool)
**Type**: Utility Directory
**Usage**: Development workflow enhancement

## 🚨 CRITICAL DEVELOPMENT RULES

### Tool Integration Pattern
**MANDATORY**: Utilities should integrate seamlessly with Claude Flow V3:

```bash
# ✅ CORRECT: Use utilities with hooks and memory
[Single Message]:
  // Run utility with pre-task hook
  - Bash("npx @claude-flow/cli@latest hooks pre-task --description 'Use shadcn-tweakcn to customize button component'")

  // Execute utility
  - Bash("cd apps/utilities/shadcn-tweakcn && npm run customize button")

  // Store result in memory
  - Bash("npx @claude-flow/cli@latest memory store --namespace utilities --key 'shadcn-customization' --value 'Successfully customized button component'")

  // Train on success
  - Bash("npx @claude-flow/cli@latest hooks post-task --task-id 'util-001' --success true --store-results true")

// ❌ WRONG: Run utilities in isolation without learning
[Message 1]: Run tool
[Later]: Forget what was learned
```

### Self-Improving Utilities
**CRITICAL**: Utilities should learn and improve over time:

- Store successful usage patterns in memory
- Track which utilities solve which problems
- Build neural patterns for utility recommendations
- Auto-suggest utilities when patterns match

## 📊 UTILITIES ARCHITECTURE

### Directory Structure
```
apps/utilities/
├── CLAUDE.md                      # This file - development guidelines
├── shadcn-tweakcn/                # shadcn/ui customization tool
│   ├── package.json
│   ├── src/
│   │   ├── customize.ts           # Component customization CLI
│   │   ├── themes.ts              # Theme generator
│   │   └── variants.ts            # Variant generator
│   └── README.md
├── (future utilities)
│   ├── component-generator/       # Auto-generate components
│   ├── api-client-gen/            # Generate API clients from OpenAPI
│   ├── migration-helper/          # Database migration tools
│   └── test-data-factory/        # Generate test data
```

### Current Utilities

#### shadcn-tweakcn
**Purpose**: Customize and extend shadcn/ui components for Project Nyra applications

**Features**:
- Component variant generation
- Theme customization with OKLCH colors
- Accessibility enhancements
- Tailwind utility integration

**Usage**:
```bash
cd apps/utilities/shadcn-tweakcn

# Customize a component
npm run customize button --variant mortgage-primary

# Generate theme
npm run theme generate --base oklch

# Add accessibility features
npm run a11y enhance --component button
```

## 🧠 CLAUDE FLOW INTEGRATION

### Available Agents
```yaml
agents:
  utility_developer:
    role: Create and maintain development utilities
    focus: [cli-tools, automation-scripts, code-generation]
    responsibilities:
      - Build CLI tools for common tasks
      - Create automation scripts
      - Implement code generators
      - Integrate with Claude Flow hooks

  tool_integrator:
    role: Integrate utilities with development workflow
    focus: [workflow-integration, hooks-integration, memory-coordination]
    responsibilities:
      - Connect utilities to Claude Flow hooks
      - Store utility usage patterns in memory
      - Train neural patterns on successful uses
      - Auto-recommend utilities when applicable

  documentation_specialist:
    role: Document utility usage and examples
    focus: [cli-docs, usage-examples, troubleshooting]
    responsibilities:
      - Write clear usage documentation
      - Provide code examples
      - Create troubleshooting guides
      - Maintain changelog
```

### Recommended Workflows

**1. Using Existing Utility**
```bash
# Pre-task: Check for relevant utility
npx @claude-flow/cli@latest memory search \
  --query "utility for [task description]" \
  --namespace utilities

# Execute with hooks
npx @claude-flow/cli@latest hooks pre-task \
  --description "Use [utility] to [accomplish task]"

# Run utility
cd apps/utilities/[utility-name] && [command]

# Post-task: Store success pattern
npx @claude-flow/cli@latest hooks post-task \
  --task-id "[util-task-id]" \
  --success true \
  --store-results true
```

**2. Creating New Utility**
```bash
# Initialize swarm for utility development
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 4 --strategy specialized

# Spawn agents: utility_developer, tool_integrator, documentation_specialist
# (Use Claude Code for actual development)

# After creation: Register in memory
npx @claude-flow/cli@latest memory store \
  --namespace utilities \
  --key "tool/[name]" \
  --value '{"purpose": "[description]", "created": "$(date -I)"}'
```

**3. Utility Recommendation**
```bash
# Get routing recommendation based on task
npx @claude-flow/cli@latest hooks route \
  --task "Customize shadcn/ui button for mortgage application"

# Output may include:
# [UTILITY_AVAILABLE] Use apps/utilities/shadcn-tweakcn
```

## 🔧 SHADCN-TWEAKCN USAGE

### Component Customization
```bash
# Customize button for mortgage primary action
cd apps/utilities/shadcn-tweakcn
npm run customize button \
  --variant mortgage-primary \
  --colors "oklch(0.65 0.25 280)" \
  --size lg \
  --output ../../web/ratehunter/components/ui/

# Generate form components with validation
npm run customize form \
  --with-validation \
  --schema zod \
  --output ../../web/webapp/components/ui/
```

### Theme Generation
```bash
# Generate OKLCH-based theme
npm run theme generate \
  --base oklch \
  --primary "0.5834 0.2305 277.0676" \
  --output ../../web/ratehunter/app/globals.css

# Generate dark mode variants
npm run theme dark-mode \
  --base-theme ../../web/ratehunter/app/globals.css
```

### Accessibility Enhancement
```bash
# Add ARIA labels and keyboard navigation
npm run a11y enhance \
  --component button \
  --features "aria,keyboard,focus-visible"

# Generate accessible form components
npm run a11y form \
  --with-errors \
  --with-hints \
  --output ../../web/webapp/components/ui/
```

## 📈 UTILITY DEVELOPMENT PATTERNS

### CLI Tool Structure
```typescript
// src/cli.ts - Utility CLI entry point
import { Command } from 'commander'
import { customizeComponent } from './customize'

const program = new Command()

program
  .name('shadcn-tweakcn')
  .description('Customize shadcn/ui components')
  .version('1.0.0')

program
  .command('customize <component>')
  .description('Customize a shadcn/ui component')
  .option('-v, --variant <name>', 'Variant name')
  .option('-o, --output <path>', 'Output directory')
  .action(async (component, options) => {
    await customizeComponent(component, options)
  })

program.parse()
```

### Integration with Memory
```typescript
// Store utility usage in Claude Flow memory
async function storeUtilityUsage(utilityName: string, task: string, success: boolean) {
  const { execSync } = require('child_process')

  const metadata = JSON.stringify({
    utility: utilityName,
    task,
    success,
    timestamp: new Date().toISOString(),
  })

  execSync(
    `npx @claude-flow/cli@latest memory store --namespace utilities --key "${utilityName}-${Date.now()}" --value '${metadata}'`
  )
}
```

## 🔄 AUTO-LEARNING PROTOCOL

### Before Using Utility
```bash
# Search for previous successful uses
npx @claude-flow/cli@latest memory search \
  --query "shadcn-tweakcn successful customization" \
  --namespace utilities

# Check learned patterns
npx @claude-flow/cli@latest neural patterns --list \
  | grep utility
```

### After Successful Use
```bash
# Store successful pattern
npx @claude-flow/cli@latest memory store \
  --namespace patterns \
  --key "utility-success-$(date +%Y%m%d)" \
  --value "shadcn-tweakcn customized [component] for [purpose]"

# Train neural pattern
npx @claude-flow/cli@latest neural train \
  --pattern-type utility-usage \
  --epochs 5

# Update utility recommendation model
npx @claude-flow/cli@latest hooks worker dispatch --trigger optimize
```

## 🎨 FUTURE UTILITIES ROADMAP

### Planned Tools

**1. Component Generator**
- Generate React components from templates
- Auto-generate tests and stories
- TypeScript + Zod validation
- Integration with shadcn/ui

**2. API Client Generator**
- Generate TypeScript clients from OpenAPI/Swagger
- Type-safe API calls
- Error handling and retries
- Integration with React Query

**3. Migration Helper**
- Database migration scripts
- Data transformation utilities
- Rollback support
- Version tracking

**4. Test Data Factory**
- Generate realistic test data
- Mortgage-specific data (loans, rates, leads)
- Privacy-safe (no real PII)
- Integration with testing frameworks

## 🔒 SECURITY GUIDELINES

### Utility Development
- **No Credentials**: Never store API keys or secrets in utilities
- **Input Validation**: Validate all CLI inputs
- **Safe Execution**: Sanitize file paths and commands
- **Audit Trail**: Log all utility executions

### Distribution
- Utilities are internal tools (private monorepo)
- No public npm publishing without security review
- Document any external dependencies
- Keep dependencies up-to-date

## 📚 RELATED DOCUMENTATION

- **Root CLAUDE.md**: V3 orchestration patterns
- **shadcn-tweakcn/README.md**: Component customization guide
- **apps/web/*/CLAUDE.md**: App-specific usage examples

---

**Utilities amplify developer productivity by automating repetitive tasks and enforcing best practices. Well-designed utilities should integrate seamlessly with Claude Flow V3's learning and memory systems to continuously improve.**
