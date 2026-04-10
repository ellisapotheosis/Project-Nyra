# ⚠️ RESTART CLAUDE CODE REQUIRED

## Why?

The `.claude/settings.json` hooks have been updated to bypass the npx cache issue, but **changes to hook configuration only take effect when Claude Code starts**.

Your current session is still using the old hooks that reference the corrupted npx cache.

## What to Do

### 1. Close This Claude Code Session
Exit Claude Code completely (not just this chat).

### 2. Clear NPX Cache (Optional but Recommended)

**Option A: PowerShell**
```powershell
Remove-Item -Path "$env:LOCALAPPDATA\npm-cache\_npx" -Recurse -Force -ErrorAction SilentlyContinue
```

**Option B: Command Prompt**
```cmd
rmdir /s /q "%LOCALAPPDATA%\npm-cache\_npx"
```

**Option C: Git Bash**
```bash
rm -rf ~/AppData/Local/npm-cache/_npx
```

### 3. Restart Claude Code

Open a **new** Claude Code session:
```bash
cd C:\Dev\Projects\Repos\Project-Nyra
# Start Claude Code (your usual method)
```

### 4. Verify the Fix

You should now see **NO ZOD ERRORS** in the hook outputs:

```
SessionStart:startup hook success: [some message]
UserPromptSubmit hook success: [routing info]
```

NOT:
```
Config loading failed: Cannot find package 'zod'
```

## What Changed?

The new `.claude/settings.json` configuration:
- ✅ Uses `.claude/helpers/archon-os-hook.sh` instead of `npx`
- ✅ Bypasses npx cache completely
- ✅ Has multiple fallback options
- ✅ Fails silently if archon-os unavailable

## After Restart

Once restarted with the new hooks, run:

```bash
# Initialize archon-os
bash scripts/init-archon-os.sh

# Verify it works
bash .claude/helpers/archon-os-hook.sh --version
```

---

## Alternative: Disable Hooks Temporarily

If you want to continue working without restarting, you can temporarily disable hooks:

1. Edit `.claude/settings.json`
2. Set `"continueOnError": true` (already set)
3. Or comment out the problematic hooks

But **restarting is the cleanest solution** to load the fixed configuration.

---

**Status**: Configuration Fixed ✅ | Restart Required ⚠️
