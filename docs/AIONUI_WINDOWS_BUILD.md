# AionUI Windows 11 Build & Deployment Guide

**Date:** 2026-08-25  
**Platform:** Windows 11 (native, not WSL2)  
**Status:** Ready for manual execution

---

## Prerequisites Check

Run these on your Windows 11 machine:

```powershell
# Check Node.js
node --version      # Should be v18.0+
npm --version       # Should be v9.0+

# Check Git
git --version       # Should be v2.30+

# Check Windows build tools
npm install -g windows-build-tools  # One-time setup
```

If any are missing, install from:

- Node.js: https://nodejs.org/ (LTS)
- Git: https://git-scm.com/download/win
- Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads

---

## Step 1: Clone AionUI Repository

```powershell
cd C:\Users\%USERNAME%\projects
git clone https://github.com/projectnyra/aionui.git
cd aionui
```

Or if already cloned:

```powershell
cd C:\Users\%USERNAME%\projects\aionui
git pull origin main
```

---

## Step 2: Install Dependencies

```powershell
npm install

# This installs:
# - Electron (desktop app framework)
# - React (UI library)
# - Tailscale SDK (for Tailscale identity)
# - Axios (API client)
```

---

## Step 3: Configure for Nyra

Create `.env.local` in the aionui directory:

```env
# API Configuration
REACT_APP_API_URL=https://api.projectnyra.com
REACT_APP_LITELLM_KEY=<get from Infisical LITELLM_AIONUI_KEY>

# Tailscale Configuration
REACT_APP_TAILSCALE_ENABLED=true
REACT_APP_TAILSCALE_MESH=projectnyra.com

# Feature Flags
REACT_APP_ENABLE_CLIPBOARD=true
REACT_APP_ENABLE_FILE_PICKER=true
```

**Get LITELLM_AIONUI_KEY:**

Option A (If you have Infisical CLI):

```powershell
infisical secrets --env=prod --path=/ | findstr LITELLM_AIONUI_KEY
```

Option B (Ask Administrator):

- Request key from ops team
- Value format: `sk-...` (64 chars)

---

## Step 4: Build for Windows

```powershell
npm run build:win

# This creates:
# - dist/AionUI Setup 1.0.0.exe (installer)
# - dist/AionUI 1.0.0.exe (portable)

# Wait 3-5 minutes for build to complete
```

---

## Step 5: Install AionUI

```powershell
# Run installer
.\dist\AionUI Setup 1.0.0.exe

# Follow installer steps:
# 1. Choose installation path (default: C:\Program Files\AionUI)
# 2. Create Start Menu shortcuts
# 3. Add to PATH (optional)
```

Or portable (no installer):

```powershell
.\dist\AionUI 1.0.0.exe
```

---

## Step 6: First Launch & Configuration

**On first run:**

1. **Tailscale Login**
   - App prompts for Tailscale identity
   - Use your Tailscale account
   - Approve device on Tailscale dashboard

2. **API Endpoint Setup**
   - Enter: `api.projectnyra.com`
   - Port: `443` (HTTPS)
   - API Key: Paste your LITELLM_AIONUI_KEY

3. **Verify Connection**
   - Click "Test Connection"
   - Should respond: "✓ Connected to Nyra"

---

## Step 7: Verify Installation

**Checklist:**

- [ ] AionUI appears in Windows Start Menu
- [ ] App launches without errors
- [ ] Tailscale integration working (shows identity)
- [ ] API connection successful
- [ ] Can see Nyra agent list
- [ ] Can create a test task

**Test task:**

```
Create task: "List files in current directory"
Assign to: "local-agent"
Execute
Expected output: List of files
```

---

## Step 8: Enable Auto-Start (Optional)

Add AionUI to Windows Startup:

```powershell
$shortcutPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\AionUI.lnk"
$targetPath = "C:\Program Files\AionUI\AionUI.exe"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.Save()

Write-Host "AionUI added to startup"
```

---

## Troubleshooting

### Issue: "Cannot find node_modules"

```powershell
# Solution: Reinstall dependencies
rm -Recurse -Force node_modules
npm install
```

### Issue: Build fails with "Visual Studio Build Tools not found"

```powershell
# Solution: Install build tools
npm install -g windows-build-tools
npm rebuild
```

### Issue: Tailscale login fails

```powershell
# Solution: Restart Tailscale daemon
Stop-Service "Tailscale Client Updater" -Force
Start-Service "Tailscale Client Updater"
```

### Issue: API key not working

```powershell
# Verify key format
# Should start with: sk-
# Should be ~64 characters

# Get fresh key from Infisical
infisical secrets get LITELLM_AIONUI_KEY --env=prod
```

### Issue: Firewall blocks connection

```powershell
# Add AionUI to Windows Firewall
netsh advfirewall firewall add rule name="AionUI" dir=out action=allow program="C:\Program Files\AionUI\AionUI.exe"
```

---

## Performance Tips

1. **Disable logs for production**
   - Set `REACT_APP_DEBUG=false` in `.env.local`
   - Reduces memory usage by ~100MB

2. **Use portable version if possible**
   - No installer overhead
   - Faster startup

3. **Tailscale optimization**
   - Keep Tailscale updated
   - Use Tailscale's built-in DNS (avoid external DNS)

---

## Updating AionUI

When new version released:

```powershell
cd C:\Users\%USERNAME%\projects\aionui

# Pull latest
git pull origin main

# Rebuild
npm install
npm run build:win

# Re-run installer
.\dist\AionUI Setup 1.0.0.exe

# Choose "Upgrade" when prompted
```

---

## Uninstall AionUI

**Method 1: Windows Add/Remove Programs**

- Settings → Apps → Installed apps
- Find "AionUI"
- Click "Uninstall"

**Method 2: Manual**

```powershell
# Remove installation
Remove-Item "C:\Program Files\AionUI" -Recurse -Force

# Remove Start Menu shortcut
Remove-Item "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\AionUI.lnk"

# Remove from Startup (if added)
Remove-Item "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\AionUI.lnk"
```

---

## Support & Feedback

- **Issues:** github.com/projectnyra/aionui/issues
- **Features:** Slack #aionui-desktop
- **Critical bugs:** ops-team@projectnyra.com

---

**AionUI Windows deployment ready. Follow steps above to build and deploy.**
