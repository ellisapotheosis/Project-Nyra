# Init Commands Reference

## Overview

The Claude-Flow initialization system provides multiple specialized initialization commands to configure your project with optimal settings for different development scenarios. Each init command creates a tailored `CLAUDE.md` configuration file that guides Claude Code's behavior for specific workflows.

## Quick Reference

| Command | Purpose | Key Features |
|---------|---------|--------------|
| `init` | Standard project setup | Basic configuration, swarm support |
| `init --verify` | Truth verification mode | 95% accuracy threshold, auto-rollback |
| `init --pair` | Pair programming mode | Real-time verification, collaborative development |
| `init --verify --pair` | Combined verification & pair | Full verification with pair programming |
| `init --enhanced` | Enhanced configuration | Advanced features, optimization |
| `init --force` | Force overwrite | Replace existing CLAUDE.md |

## Standard Initialization

### Basic Init
```bash
# Initialize new project with standard configuration
npx claude-flow@alpha init

# What it creates:
# - CLAUDE.md with standard swarm orchestration patterns
# - Concurrent execution rules
# - Basic MCP tool integration
# - TodoWrite batching requirements
```

### Force Overwrite
```bash
# Force overwrite existing CLAUDE.md
npx claude-flow@alpha init --force

# Use when:
# - Updating to latest configuration format
# - Resetting corrupted configuration
# - Switching between init modes
```

## Verification Mode Initialization

### Truth Verification System
```bash
# Initialize with Truth Verification System
npx claude-flow@alpha init --verify

# Creates CLAUDE.md with:
# - Truth enforcement principle: "truth is enforced, not assumed"
# - 95% accuracy threshold requirements
# - Auto-rollback on verification failures
# - Byzantine fault tolerance
# - Cryptographic signing of results
# - Audit trail logging
# - Agent-specific verification requirements
```

### Verification Configuration Details
The `--verify` flag creates a specialized configuration that includes:

```markdown
## 🔍 VERIFICATION-FIRST DEVELOPMENT

### Truth Thresholds
- Production: 0.95 (95% accuracy required)
- Development: 0.85 (85% accuracy required)
- Testing: 0.75 (75% accuracy required)

### Verification Requirements by Agent Type
- **Coder**: compile, test, lint, typecheck
- **Reviewer**: code-analysis, security-scan, performance-check
- **Tester**: unit-tests, integration-tests, coverage-check
- **Planner**: task-decomposition, dependency-check, feasibility

### Background Monitoring
- Uses run_in_background parameter for continuous validation
- Real-time truth score tracking
- Automatic failure detection and rollback
```

## Pair Programming Mode Initialization

### Collaborative Development Setup
```bash
# Initialize with Pair Programming mode
npx claude-flow@alpha init --pair

# Creates CLAUDE.md with:
# - Real-time verification workflow
# - Collaborative intelligence patterns
# - Continuous monitoring setup
# - Auto-suggestion system
# - Performance tracking metrics
# - Interactive feedback loops
```

### Pair Programming Features
The `--pair` flag enables:

```markdown
## 👥 PAIR PROGRAMMING MODE

### Real-time Features
- File watch system activation
- Instant verification on changes
- Live truth score display
- Auto-rollback on failures

### Collaboration Patterns
- Human writes code
- AI reviews in real-time
- Verification engine validates
- System suggests improvements
- Automatic acceptance above threshold
```

## Combined Verification & Pair Mode

### Maximum Quality Enforcement
```bash
# Initialize with both verification and pair programming
npx claude-flow@alpha init --verify --pair

# Combines all features:
# - Truth Verification System (95% threshold)
# - Pair Programming real-time validation
# - Background task monitoring
# - Complete audit trail
# - Multi-agent verification
# - Collaborative development workflow
```

### Integrated Workflow
The combined mode creates the most comprehensive configuration:

```markdown
## 🔍👥 VERIFICATION + PAIR PROGRAMMING

### Workflow Integration
1. Developer writes code (pair mode)
2. AI reviews in real-time (pair mode)
3. Truth verification runs (verify mode)
4. Score must exceed 95% (verify mode)
5. Auto-rollback if failed (verify mode)
6. Suggestions provided (pair mode)
7. Audit trail recorded (verify mode)

### Background Execution
All verification commands use run_in_background:
- Continuous compilation checking
- Real-time test execution
- Live linting and formatting
- Performance monitoring
- Security scanning
```

## Enhanced Mode Initialization

### Advanced Configuration
```bash
# Initialize with enhanced features
npx claude-flow@alpha init --enhanced

# Includes:
# - Advanced swarm orchestration
# - Neural network integration
# - Performance optimization
# - Extended agent types
# - Custom workflow patterns
# - GitHub integration
```

### Enhanced Features
The enhanced mode includes experimental and advanced features:

```markdown
## ⚡ ENHANCED CONFIGURATION

### Advanced Features
- 27+ neural models
- WASM SIMD acceleration
- Distributed consensus
- Meta-learning capabilities
- Adaptive topology switching
- Cross-session memory persistence
```

## Configuration File Structure

### Standard CLAUDE.md Sections

All init commands create a CLAUDE.md with these core sections:

1. **Critical Rules Section**
   - Concurrent execution requirements
   - Batch operation mandates
   - Parallel processing rules

2. **Tool Separation**
   - Claude Code responsibilities
   - MCP tool boundaries
   - Execution vs coordination

3. **Swarm Orchestration**
   - Agent spawning patterns
   - Task distribution
   - Memory coordination

4. **Mode-Specific Configuration**
   - Verification settings (if --verify)
   - Pair programming setup (if --pair)
   - Enhanced features (if --enhanced)

## Background Commands Integration

### How Init Modes Use Background Commands

All verification and pair modes automatically configure background execution:

```javascript
// Verification mode background tasks
Bash("npm test", { run_in_background: true })
Bash("npm run lint", { run_in_background: true })
Bash("npm run typecheck", { run_in_background: true })

// Monitoring with BashOutput
BashOutput({ bash_id: "test_runner", filter: "FAIL" })
BashOutput({ bash_id: "linter", filter: "error" })
```

### Background Task Patterns

```markdown
## Background Execution Patterns

### Continuous Verification
- Tests run in background during development
- Linting happens parallel to coding
- Type checking runs continuously
- Security scans execute periodically

### Monitoring Active Tasks
- Use BashOutput to check test results
- Filter for errors and failures
- Track long-running processes
- Kill stuck processes with KillBash
```

## Comparison Table

| Feature | Standard | Verify | Pair | Verify+Pair | Enhanced |
|---------|----------|--------|------|-------------|----------|
| Swarm Orchestration | ✅ | ✅ | ✅ | ✅ | ✅ |
| Concurrent Execution | ✅ | ✅ | ✅ | ✅ | ✅ |
| Truth Verification | ❌ | ✅ | ⚠️ | ✅ | ⚠️ |
| Real-time Validation | ❌ | ⚠️ | ✅ | ✅ | ✅ |
| Auto-rollback | ❌ | ✅ | ⚠️ | ✅ | ⚠️ |
| Background Tasks | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| Neural Features | ❌ | ❌ | ❌ | ❌ | ✅ |
| GitHub Integration | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |

Legend: ✅ Full support | ⚠️ Partial support | ❌ Not included

## Best Practices

### Choosing the Right Init Mode

1. **Use Standard Init** when:
   - Starting a new project
   - Basic swarm coordination needed
   - No strict quality requirements

2. **Use Verify Mode** when:
   - Building production systems
   - Quality enforcement is critical
   - Multi-agent verification required
   - Audit trails needed

3. **Use Pair Mode** when:
   - Collaborative development
   - Learning new patterns
   - Real-time feedback desired
   - Interactive coding sessions

4. **Use Verify+Pair** when:
   - Maximum quality enforcement
   - Production-critical code
   - Training scenarios
   - Compliance requirements

5. **Use Enhanced Mode** when:
   - Experimental features needed
   - Advanced AI capabilities
   - Complex orchestration
   - Research projects

### Migration Between Modes

```bash
# Backup current configuration
cp CLAUDE.md CLAUDE.md.backup

# Switch to verification mode
npx claude-flow@alpha init --verify --force

# Switch to pair programming
npx claude-flow@alpha init --pair --force

# Upgrade to combined mode
npx claude-flow@alpha init --verify --pair --force

# Revert if needed
cp CLAUDE.md.backup CLAUDE.md
```

## Configuration Customization

### Post-Init Modifications

After initialization, you can customize CLAUDE.md:

```markdown
## Custom Verification Thresholds
Change default thresholds in CLAUDE.md:
- Production: 0.98 (increase from 0.95)
- Development: 0.90 (increase from 0.85)

## Custom Agent Requirements
Add specific checks for your agents:
- Custom linting rules
- Project-specific tests
- Performance benchmarks
- Security requirements
```

### Environment-Specific Configuration

```bash
# Development environment
npx claude-flow@alpha init --verify --pair
# Then modify CLAUDE.md: set threshold to 0.85

# Staging environment
npx claude-flow@alpha init --verify
# Then modify CLAUDE.md: set threshold to 0.90

# Production environment
npx claude-flow@alpha init --verify --pair
# Keep default 0.95 threshold
```

## Troubleshooting

### Common Issues

#### 1. Existing CLAUDE.md Conflict
```bash
# Error: CLAUDE.md already exists
# Solution: Use --force flag
npx claude-flow@alpha init --verify --force
```

#### 2. Mode Not Applying
```bash
# Ensure clean initialization
rm CLAUDE.md
npx claude-flow@alpha init --verify --pair
```

#### 3. Background Tasks Not Running
```bash
# Check if run_in_background is configured
grep "run_in_background" CLAUDE.md

# Verify background task support
npx claude-flow@alpha init --verify --force
```

## Advanced Usage

### Programmatic Initialization

```javascript
// Using Claude-Flow API
const { init } = require('claude-flow');

// Initialize with options
await init({
  verify: true,
  pair: true,
  force: false,
  threshold: 0.95,
  autoRollback: true
});
```

### Custom Templates

```javascript
// Create custom init template
const customTemplate = {
  baseTemplate: 'verification',
  modifications: {
    threshold: 0.98,
    additionalChecks: ['custom-lint', 'security-scan'],
    customPatterns: ['tdd', 'ddd']
  }
};

// Apply custom template
npx claude-flow@alpha init --template custom
```

## Related Documentation

- [Truth Verification System](./Truth-Verification-System.md) - Detailed verification documentation
- [Pair Programming System](./Pair-Programming-System.md) - Collaborative development guide
- [Background Commands](./background-commands.md) - Background execution reference
- [CLAUDE.md Configuration](./CLAUDE.md) - Configuration file reference
- [Agent System Overview](./Agent-System-Overview.md) - Understanding agent types

## Command Reference

### Full Command Syntax

```bash
npx claude-flow@alpha init [options]

Options:
  --verify       Enable Truth Verification System
  --pair         Enable Pair Programming mode
  --enhanced     Enable enhanced features
  --force        Force overwrite existing CLAUDE.md
  --threshold    Set verification threshold (0.0-1.0)
  --help         Show help information

Examples:
  npx claude-flow@alpha init
  npx claude-flow@alpha init --verify
  npx claude-flow@alpha init --pair
  npx claude-flow@alpha init --verify --pair
  npx claude-flow@alpha init --verify --pair --force
  npx claude-flow@alpha init --enhanced --force
```

## Summary

The Claude-Flow init command system provides specialized configurations for different development workflows:

- **Standard**: Basic swarm orchestration and concurrent execution
- **Verification**: Truth enforcement with 95% accuracy threshold
- **Pair**: Real-time collaborative development with AI
- **Combined**: Maximum quality with verification and pair programming
- **Enhanced**: Advanced features and experimental capabilities

Choose the appropriate init mode based on your project requirements, quality standards, and collaboration needs. All modes integrate with background commands for efficient asynchronous execution and monitoring.

---

*The init command system ensures your project starts with the optimal configuration for your specific development workflow, whether you prioritize verification, collaboration, or advanced AI capabilities.*