# Claude Flow V3 Statusline - Bun Compatibility Fix

## Issue

After integrating the Claude Flow statusline into the NYRA Bootstrap system, users running Bun instead of Node.js encountered an error:

```
Get-ClaudeFlowStatus: Failed to get Claude Flow status: The term 'node' is not recognized as a name of a cmdlet, function, script file, or executable program.
```

## Root Cause

The statusline script (`powershell-profile-statusline.ps1`) was hardcoded to use the `node` command to execute the JavaScript statusline script:

```powershell
$result = & node ".claude\helpers\statusline.js" @args 2>$null
```

Users with only Bun installed (not Node.js) would fail because the `node` command was not available on their system.

## Solution

Added runtime detection to automatically use either Node.js or Bun, whichever is available on the system.

### Changes Made

**Added `Get-JavaScriptRuntime` function** (lines 22-36):
```powershell
function Get-JavaScriptRuntime {
    <#
    .SYNOPSIS
        Detect available JavaScript runtime (Node.js or Bun)
    .DESCRIPTION
        Returns 'node' or 'bun' depending on which is available, or $null if neither
    #>
    if (Get-Command node -ErrorAction SilentlyContinue) {
        return 'node'
    }
    elseif (Get-Command bun -ErrorAction SilentlyContinue) {
        return 'bun'
    }
    return $null
}
```

**Modified `Get-ClaudeFlowStatus` function** (lines 96-106):
```powershell
# Detect JavaScript runtime (Node.js or Bun)
$runtime = Get-JavaScriptRuntime
if (-not $runtime) {
    Write-Error "No JavaScript runtime found. Install Node.js (https://nodejs.org) or Bun (https://bun.sh)"
    return
}

# Run local statusline with detected runtime
$result = & $runtime ".claude\helpers\statusline.js" @args 2>$null
```

## Files Updated

1. ✅ `C:\Dev\IDE-Configs\PowerShell-Runtime\powershell-profile-statusline.ps1` (deployed/live)
2. ✅ `C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\Powershell-Runtime\powershell-profile-statusline.ps1` (backup)

## Testing

Verified the fix works with Bun:

```powershell
❯ cfstatus
▊ Claude Flow V3 ● "user"  │  ⎇ ""  │  Opus 4.5
─────────────────────────────────────────────────────
🏗️  DDD Domains    [●●●○○]  3/5    ⚡ 1.0x → 2.49x-7.47x
🤖 Swarm  ○ [ 0/35]  👥 0    🔴 CVE 0/3    💾 0MB    📂  60%    🧠  12%
🔧 Architecture    DDD ●60%  │  Security ●PENDING  │  Memory ●AgentDB  │  Integration ●
```

## Behavior

The statusline now:

1. **Checks for Node.js first** - If `node` command exists, uses Node.js (preferred)
2. **Falls back to Bun** - If Node.js not found but `bun` command exists, uses Bun
3. **Shows error if neither** - If neither runtime is available, displays helpful error message with installation links

## Benefits

- ✅ **Works with Node.js** - Unchanged behavior for Node.js users
- ✅ **Works with Bun** - Now compatible with Bun-only environments
- ✅ **Clear error messages** - Helpful guidance if neither runtime is available
- ✅ **Zero breaking changes** - Existing installations continue to work
- ✅ **Automatic detection** - No manual configuration needed

## Compatibility Matrix

| Environment | Node.js | Bun | Statusline Works? |
|-------------|---------|-----|-------------------|
| Node.js only | ✅ | ❌ | ✅ Uses Node.js |
| Bun only | ❌ | ✅ | ✅ Uses Bun |
| Both installed | ✅ | ✅ | ✅ Prefers Node.js |
| Neither installed | ❌ | ❌ | ❌ Shows error |

## Future Considerations

The statusline could be extended to support additional JavaScript runtimes:

- **Deno** - Add check for `deno` command
- **Quick.js** - Add check for `qjs` command
- **GraalVM JS** - Add check for `js` command

Example extension:
```powershell
function Get-JavaScriptRuntime {
    if (Get-Command node -ErrorAction SilentlyContinue) { return 'node' }
    elseif (Get-Command bun -ErrorAction SilentlyContinue) { return 'bun' }
    elseif (Get-Command deno -ErrorAction SilentlyContinue) { return 'deno run' }
    return $null
}
```

---

**Fix Date**: 2026-01-18
**Bootstrap Version**: v2.2.0
**Claude Flow Version**: v3.0.0-alpha.104
**Tested With**: Bun 1.x
