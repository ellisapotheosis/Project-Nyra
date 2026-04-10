# RuVector Quick Start Guide

**Get started with RuVector/ReasoningBank in 5 minutes**

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
# Install ruvector (RuVector backend)
npm install -g ruvector@latest

# Install archon-os@latest (if not already)
npm install -D @archon-os/cli@latest
```

### Step 2: Initialize RuVector Database

```bash
# Create ruvector database for ReasoningBank
ruvector init ./.ruvector/reasoningbank.db --dimension 1536

# Initialize memory system
bun x @archon-os/cli@latest memory init --force --verbose
```

### Step 3: Configure Claude Flow

```bash
# Enable hybrid memory backend with HNSW
bun x @archon-os/cli@latest config set memory.backend hybrid
bun x @archon-os/cli@latest config set memory.enableHNSW true

# Enable neural auto-training
bun x @archon-os/cli@latest config set neural.enabled true
bun x @archon-os/cli@latest config set neural.autoTrain true
```

### Step 4: Start the Daemon

```bash
# Start daemon with intelligence workers
bun x @archon-os/cli@latest daemon start

# Verify everything is running
bun x @archon-os/cli@latest doctor
```

---

## 🎯 Your First RuVector Pattern

### Example: Learn from a successful code edit

```bash
# 1. Store a successful pattern
bun x @archon-os/cli@latest memory store \
  --namespace "patterns" \
  --key "auth-jwt-pattern" \
  --value "Use JWT with httpOnly cookies and refresh tokens for secure stateless authentication" \
  --tags "auth,jwt,security"

# 2. Search for the pattern later
bun x @archon-os/cli@latest memory search \
  --query "authentication security best practices" \
  --namespace "patterns"

# 3. Train neural patterns from successful edits
# (This happens automatically with hooks, but you can trigger manually)
bun x @archon-os/cli@latest neural train \
  --pattern-type coordination \
  --epochs 5
```

---

## 📖 Common Workflows

### Workflow 1: Track a Task Trajectory

```bash
# Start tracking
bun x @archon-os/cli@latest hooks intelligence trajectory-start \
  --session-id "feature-auth-$(date +%s)"

# Work on your task...
# (Make edits, write code, test, etc.)

# End with verdict
bun x @archon-os/cli@latest hooks intelligence trajectory-end \
  --verdict "success" \
  --reward 0.9
```

### Workflow 2: Learn from Post-Edit

```bash
# After successfully editing a file
bun x @archon-os/cli@latest hooks post-edit \
  --file "src/services/auth-service.ts" \
  --success true \
  --train-neural true
```

### Workflow 3: Search & Apply Patterns

```bash
# Before starting a new task, search for relevant patterns
bun x @archon-os/cli@latest memory search \
  --query "implement API error handling" \
  --namespace "patterns" \
  --limit 5

# Apply the best pattern to your task
```

---

## 🚀 Enable in Claude Code

### Add to CLAUDE.md

```markdown
## 🧠 AUTO-LEARNING PROTOCOL

### Before Starting Any Task
\`\`\`bash
# Search memory for relevant patterns
bun x @archon-os/cli@latest memory search --query '[task keywords]' --namespace patterns
\`\`\`

### After Completing Any Task Successfully
\`\`\`bash
# Store successful pattern
bun x @archon-os/cli@latest memory store --namespace patterns --key '[pattern-name]' --value '[what worked]'

# Train neural patterns
bun x @archon-os/cli@latest hooks post-edit --file '[main-file]' --train-neural true
\`\`\`
```

---

## 🔍 Verify It's Working

```bash
# Check memory statistics
bun x @archon-os/cli@latest memory list --namespace patterns

# View neural pattern statistics
bun x @archon-os/cli@latest neural patterns --list

# Check daemon status
bun x @archon-os/cli@latest daemon status

# View ruvector stats
ruvector stats ./.ruvector/reasoningbank.db
```

Expected output:
- Memory entries: Growing over time
- Neural patterns: Training automatically
- Daemon: Running with ultralearn/consolidate workers
- ruvector: Vector count increasing

---

## 🎓 Learn More

- **Full Guide:** `docs/RUVECTOR-INTEGRATION-GUIDE.md`
- **Skills:** `.claude/skills/reasoningbank-*`
- **Examples:** Search codebase for `trajectory-start`

---

## 🐛 Troubleshooting

### Memory not persisting

```bash
# Re-initialize with force
bun x @archon-os/cli@latest memory init --force --verbose

# Check database permissions
ls -la ./.ruvector/reasoningbank.db
```

### Daemon not starting

```bash
# Check logs
bun x @archon-os/cli@latest daemon status

# Restart daemon
bun x @archon-os/cli@latest daemon stop
bun x @archon-os/cli@latest daemon start
```

### HNSW search slow

```bash
# Optimize database
ruvector optimize ./.ruvector/reasoningbank.db --rebuild-index

# Increase cache size
bun x @archon-os/cli@latest config set memory.cacheSize 1024
```

---

## 📊 Performance Expectations

After setup, you should see:
- ✓ Memory search: <1ms
- ✓ Pattern retrieval: <100µs
- ✓ Neural training: Background automatic
- ✓ Trajectory tracking: <5ms overhead

---

**Next:** Read the full integration guide for advanced patterns and multi-agent coordination.
