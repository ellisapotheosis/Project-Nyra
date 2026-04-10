# Claude Code Quick Integration Guide

**TL;DR**: Use Claude Code to clean up your repo in 30-60 minutes. This guide is the fast track.

---

## 🚀 Quick Start (Copy-Paste Ready)

### Step 1: Open Claude in Your IDE

Use Claude Code in VS Code, Terminal, or any IDE with Claude integration.

### Step 2: Copy This Entire Prompt

```
I'm consolidating the "Project Nyra" mortgage automation platform repository. 
Here's what I need you to do:

## Current State
- Location: /path/to/ProjectNyra
- Status: Files scattered across multiple directories/zips
- Goal: Organize into clean scaffold

## Target Structure Reference
See the nyra-complete/ folder you just received. That's the target.

## Tasks (In Order)

### Task 1: File Inventory
1. Find all existing source files (src/, services/, packages/, apps/)
2. List duplicates (keep MOST RECENT version only)
3. Identify dead code/experimental branches
4. Report on what needs to move where

### Task 2: Code Migration
1. Move files into nyra-complete/ structure
2. Delete duplicates (ask before deleting)
3. Update all import paths:
   - FROM: import { X } from '../../../utils'
   - TO: import { X } from '@nyra/utils'
4. Update package.json dependencies to use @nyra/* workspaces

### Task 3: Configuration Consolidation
1. Merge all .env files into .env.example (keep most complete version)
2. Validate all docker-compose files:
   docker-compose config -f infra/docker-compose.orchestrator.yml
   docker-compose config -f infra/docker-compose.workers.yml
   docker-compose config -f infra/docker-compose.oracle.yml
3. Validate TOML/YAML:
   grep -E '^[a-zA-Z]' infra/nexus/nexus.toml  # Basic validation
4. Ensure no missing env vars

### Task 4: Documentation
Create/update:
- docs/SETUP.md (step-by-step setup)
- docs/API.md (all endpoints)
- docs/DEPLOYMENT.md (production checklist)
- docs/TROUBLESHOOTING.md (common issues)

### Task 5: Validation
```bash
# Check docker-compose syntax
for file in infra/docker-compose.*.yml; do
  echo "Validating $file..."
  docker-compose -f "$file" config > /dev/null
done

# Ensure no import errors
npm install  # Monorepo install
npm run type-check 2>&1 | grep -i error || echo "Types OK"
```

### Task 6: Git Setup
1. Initialize git (if needed): git init
2. Create .gitignore (use template provided)
3. First commit: git add . && git commit -m "feat: complete scaffold v3.0"
4. Create branches for ongoing work

### Task 7: Final Checks
- All imports resolve? ✓
- All docker-compose valid? ✓
- All env vars in .example? ✓
- Makefile works? ✓
- .gitignore complete? ✓

## Output Format
For each task, provide:
- Task name
- Files touched
- Changes made
- Any warnings/questions

## Success = All tasks complete with no errors
```

### Step 3: Let It Run

Claude will:
1. Scan your codebase
2. Move files automatically
3. Fix imports
4. Validate configs
5. Create documentation
6. Ask before deleting anything

### Step 4: Review

Review each task:
- Check `git diff` to see what changed
- Ask Claude to explain any changes
- Say "Looks good" or "Fix this part"

### Step 5: Commit

```bash
git add .
git commit -m "refactor: consolidate repo v3.0"
git push origin main
```

---

## 🎯 What Claude Code Will Fix Automatically

### Import Path Fixes
**Before**:
```typescript
import { calculateMortgage } from '../../../../utils/mortgage-math.ts'
import { QuoteRequest } from '../../types/quote.ts'
```

**After**:
```typescript
import { calculateMortgage } from '@nyra/mortgage-math'
import { QuoteRequest } from '@nyra/types'
```

### Package.json Updates
**Before**:
```json
{
  "dependencies": {
    "./local-packages/types": "^1.0.0"
  }
}
```

**After**:
```json
{
  "dependencies": {
    "@nyra/types": "workspace:*"
  }
}
```

### Docker Compose Merges
Consolidates multiple docker-compose files into 3 master files:
- `docker-compose.orchestrator.yml`
- `docker-compose.workers.yml`
- `docker-compose.oracle.yml`

### Config Validation
Checks all YAML/TOML syntax and env vars.

---

## ⚠️ What Claude Code Will ASK Before Doing

1. **"Delete this experimental branch?"** — You decide
2. **"Keep old version or new version?"** — You choose
3. **"This file appears unused, delete?"** — You confirm
4. **"Conflicting imports, which is correct?"** — You verify

Always say **"Ask before deleting"** to be safe.

---

## 🚨 If Something Goes Wrong

**"Rollback"**:
```bash
git reset --hard HEAD~1  # Undo last commit
# OR
git stash  # Save changes, start over
```

**"Debug"**:
```bash
# See what changed
git diff HEAD

# See which files were moved
git status

# Check import errors
npm run type-check
```

---

## 📊 Estimated Timeline

| Task | Time | Risk |
|------|------|------|
| Task 1: Inventory | 5 min | Low |
| Task 2: Migration | 15 min | Medium (ask before deletions) |
| Task 3: Config | 10 min | Low |
| Task 4: Docs | 10 min | Low |
| Task 5: Validation | 5 min | Low |
| Task 6: Git | 3 min | Low |
| Task 7: Final | 5 min | Low |
| **TOTAL** | **~60 min** | **Low (with confirmations)** |

---

## ✅ Post-Integration Checklist

After Claude Code finishes:

- [ ] `git log` shows clean commit history
- [ ] `npm install` installs without errors
- [ ] `npm run type-check` passes
- [ ] `make help` shows all commands
- [ ] `make orchestrator-up` starts services
- [ ] `make health-check` all green
- [ ] `docs/` folder has 4 files
- [ ] `.gitignore` present
- [ ] No `node_modules/` in git

---

## 🎓 Claude Code Tips

**Ask questions during execution**:
- "What's in this duplicate file?"
- "Should I keep the old or new version?"
- "Is this dead code?"
- "Where does this import go?"

**Tell it to go slow**:
- "Do Task 1 only, show results"
- "Explain before deleting anything"
- "Ask before modifying package.json"

**Save your work**:
```bash
git add .
git commit -m "checkpoint: $(date)"
# Creates a savepoint you can rollback to
```

---

## 🚀 After Integration is Complete

1. **Test Everything**
   ```bash
   cd ProjectNyra
   make orchestrator-up
   make health-check
   ```

2. **Deploy to Team**
   - Share `.env.example` template
   - Share `README.md` quick start
   - Share `ARCHITECTURE.md` overview

3. **Continue Development**
   - Implement `src/archon-os/`
   - Implement `src/openclaw/`
   - Implement `services/quote-engine/`
   - Build `apps/nyra-admin-ui/`

---

## 💬 Example Conversation with Claude Code

```
You: "Clean up my ProjectNyra repo using this prompt..."
     [paste the prompt above]

Claude Code: "I found 847 files across 12 directories. Here's the summary:
- 3 duplicate quote engines (keeping latest)
- 2 .env files (merging into template)
- 5 docker-compose files (consolidating into 3)
- Recommend moving 45 files

Ready to start Task 1: File Inventory?"

You: "Yes, show me what you found"

Claude Code: [lists inventory]

You: "Looks good, proceed with Task 2"

Claude Code: [moves files, fixes imports, asks about deletions]

You: "Delete the old_experimental_feature, keep everything else"

Claude Code: [continues, validates, creates docs]

You: "All done?"

Claude Code: "Done! 156 files moved, 23 imports fixed, 4 docs created. 
Commit with: git commit -m 'refactor: consolidate v3.0'"

You: "Perfect!"
```

---

## 📍 Final Notes

- **This is safe**: Git lets you rollback anything
- **This is fast**: 30–60 minutes total
- **This is thorough**: Validates everything
- **This is automated**: Minimal manual work

**Go for it!** 🚀

---

**Next**: Start Claude Code, copy the prompt above, and let it consolidate your repo.
