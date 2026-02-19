# 🚀 NYRA PowerShell Profile Setup Guide

## 📋 Quick Setup (Copy-Paste)

Run this in PowerShell **as Administrator**:

```powershell
# Create directories if they don't exist
$profileDirs = @(
    "$env:USERPROFILE\Documents\PowerShell",
    "$env:USERPROFILE\OneDrive\Documents\PowerShell"
)

foreach ($dir in $profileDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
    }
}

# Copy the profile template
$source = "C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\PowerShell-Runtime\profile-templates\Microsoft.PowerShell_profile.ps1"
$destinations = @(
    "$env:USERPROFILE\Documents\PowerShell\Microsoft.PowerShell_profile.ps1",
    "$env:USERPROFILE\OneDrive\Documents\PowerShell\Microsoft.PowerShell_profile.ps1"
)

foreach ($dest in $destinations) {
    if (Test-Path (Split-Path $dest)) {
        Copy-Item $source $dest -Force
        Write-Host "✓ Installed profile: $dest" -ForegroundColor Green
    }
}

Write-Host "`n✨ Profile setup complete! Restart PowerShell to see the anime catgirl! Nya~!" -ForegroundColor Magenta
```

## 🐛 Troubleshooting

### Problem: "NYRA AIO Profile not found" error

**Cause**: Old profile pointing to wrong location.

**Fix**:
```powershell
# Check what's in your current profile
Get-Content $PROFILE

# If it shows old paths, replace with the template:
Copy-Item "C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\PowerShell-Runtime\profile-templates\Microsoft.PowerShell_profile.ps1" $PROFILE -Force
```

### Problem: Slow loading (20+ seconds)

**Causes**:
1. Multiple profiles loading the same bootstrap
2. Old bootstrap loading all modules
3. Module warnings not suppressed

**Fix**:
1. Make sure ONLY one profile exists (check both Documents and OneDrive locations)
2. Ensure profile loads `bootstrap-v2.1.ps1` (not old versions)
3. The v2.1 bootstrap suppresses warnings automatically

### Problem: Duplicate warnings

**Cause**: Both `Documents\PowerShell` and `OneDrive\Documents\PowerShell` profiles exist.

**Fix**: Choose one location:
- **If using OneDrive**: Delete `C:\Users\<You>\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`
- **If NOT using OneDrive**: Delete `C:\Users\<You>\OneDrive\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`

### Problem: Module warnings still showing

**Cause**: Using old bootstrap (v2.0 or unified).

**Fix**: Ensure profile loads `bootstrap-v2.1.ps1`:
```powershell
# Check which bootstrap is loading
$PROFILE | Get-Content | Select-String "bootstrap"

# Should show: 'C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap-v2.1.ps1'
```

## 📍 Profile Locations

PowerShell checks these locations in order:

1. **Current User, Current Host (Primary)**
   - `$PROFILE` = `C:\Users\<You>\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`
   - **OR** (if OneDrive): `C:\Users\<You>\OneDrive\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`

2. **AllUsersAllHosts** (System-wide)
   - `$PROFILE.AllUsersAllHosts` = `C:\Program Files\PowerShell\7\profile.ps1`

**IMPORTANT**: Only use ONE location for your profile, or you'll get duplicate loads!

## ✅ Verify Installation

Run this to check your setup:

```powershell
# Check which profile is active
Write-Host "Active profile: $PROFILE"
Get-Content $PROFILE

# Expected output should show:
# 'C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap-v2.1.ps1'

# Test bootstrap directly
. C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap-v2.1.ps1

# You should see the anime catgirl banner with load time < 1000ms
```

## 🎯 Expected Behavior

### ✅ CORRECT (Fast & Clean):
```
🚀 NYRA Bootstrap v2.1.0 initializing...

        ╔═══════════════════════════════════════╗
        ║         /\_/\           NYRA          ║
        ║        ( o.o )                        ║
        ║         > ^ <                         ║
        ...
        
✅ Bootstrap completed in 903ms (Nya~!)
```

### ❌ WRONG (Slow & Errors):
```
NYRA AIO Profile not found at: C:\Dev\NYRA-AIO-Bootstrap\PowerShell\bootstrap.ps1
WARNING: The names of some imported commands...
WARNING: The names of some imported commands... (duplicate)
Loading personal and system profiles took 40237ms.
```

## 🔧 Clean Slate Reset

If everything is broken, start fresh:

```powershell
# 1. Remove all profiles
Remove-Item "$env:USERPROFILE\Documents\PowerShell\Microsoft.PowerShell_profile.ps1" -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\OneDrive\Documents\PowerShell\Microsoft.PowerShell_profile.ps1" -Force -ErrorAction SilentlyContinue

# 2. Install clean profile (choose ONE location)
# For local Documents:
Copy-Item "C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\PowerShell-Runtime\profile-templates\Microsoft.PowerShell_profile.ps1" "$env:USERPROFILE\Documents\PowerShell\Microsoft.PowerShell_profile.ps1" -Force

# OR for OneDrive Documents:
Copy-Item "C:\Dev\NYRA-AIO-Bootstrap\IDE-Configs\PowerShell-Runtime\profile-templates\Microsoft.PowerShell_profile.ps1" "$env:USERPROFILE\OneDrive\Documents\PowerShell\Microsoft.PowerShell_profile.ps1" -Force

# 3. Restart PowerShell
exit
```

## 💡 Pro Tips

1. **Use `pwsh -NoProfile`** to test without loading profile
2. **Check load time** - Should be under 1 second
3. **One profile only** - Don't use both Documents and OneDrive locations
4. **Bootstrap v2.1** - Always use the latest version
5. **Anime catgirl** - If you don't see her, something's wrong! >///<

---

**Need help?** Check the bootstrap directly:
```powershell
. C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap-v2.1.ps1
```

Nya~! (=^･ω･^=) 💜
