# 🎨 NYRA Watercolor Theme

**Beautiful watercolor-inspired Oh-My-Posh theme with no yellow!**

## 🌈 Color Palette

The theme uses a dreamy watercolor-inspired palette:

| Element | Color | Hex |
|---------|-------|-----|
| 👤 Username | Lavender Purple | `#B794F6` |
| 📁 Directory | Seafoam Green | `#A8E6CF` |
| 🌿 Git Branch | Mint Turquoise | `#88D5C5` |
| 💖 Git Changes | Watermelon Pink | `#FFB3D9` |
| ❯ Prompt Symbol | Soft Purple | `#9D7FEA` |
| ⏱️ Time | Lavender Purple | `#B794F6` |
| 🐳 Docker | Pale Blue | `#87CEEB` |
| 📦 Node.js | Seafoam Green | `#A8E6CF` |

## ✨ Features

- **No Yellow!** All yellow colors replaced with watercolor tones
- **Purple-Centric** - Main theme color is soft purple
- **Watercolor Aesthetic** - Seafoam, turquoise, neon pink accents
- **High Contrast** - Text pops beautifully against backgrounds
- **Error-Free** - No template errors or broken segments
- **Fast** - Minimal segments for quick rendering

## 🚀 Installation

### Automatic (Recommended)

```powershell
C:\Dev\IDE-Configs\PowerShell-Runtime\ULTIMATE-WATERCOLOR-FIX.ps1
```

This will:
- Clear all Oh-My-Posh caches
- Install the watercolor theme
- Update your bootstrap configuration
- Fix any template errors
- Create preview utilities

### Manual

1. Copy the theme file:
```powershell
Copy-Item "C:\Dev\IDE-Configs\PowerShell-Runtime\PoshThemes\nyra-watercolor.omp.json" `
          "C:\Dev\IDE-Configs\PowerShell-Runtime\PoshThemes\xulbux-ultimate.omp.json"
```

2. Clear Oh-My-Posh cache:
```powershell
oh-my-posh cache clear
```

3. Restart PowerShell

## 🎯 Quick Commands

### Preview Theme Colors
```powershell
.\PREVIEW-WATERCOLOR.ps1
```

### Apply to Current Session
```powershell
.\Switch-WatercolorTheme.ps1 -Apply
```

### Show Theme Config
```powershell
.\Switch-WatercolorTheme.ps1 -Preview
```

## 🖼️ What It Looks Like

```
 🪟 edane 📁 Project-Nyra  main                 🐳 docker-desktop 78% 100% 09:40 365ms

❯ 
```

### Color Breakdown
- ` 🪟` - Windows icon (Soft Purple)
- `edane` - Username (Lavender Purple) - **NO MORE YELLOW!**
- ` 📁 Project-Nyra` - Directory (Seafoam Green) - **NO MORE YELLOW!**
- ` main` - Git branch (Mint Turquoise)
- ` 🐳 docker-desktop` - Docker context (Pale Blue)
- `78%` - RAM usage (Mint)
- `100%` - Battery (Seafoam)
- `09:40` - Time (Lavender Purple)
- `365ms` - Command duration (Turquoise)
- `❯` - Prompt (Soft Purple)

## 🔧 Customization

Edit `nyra-watercolor.omp.json` to customize colors:

```json
"palette": {
  "soft-purple": "#9D7FEA",      // Main purple
  "lavender": "#B794F6",          // Username, time
  "seafoam": "#A8E6CF",           // Directories
  "mint": "#88D5C5",              // Git, system info
  "pale-blue": "#87CEEB",         // Docker
  "watermelon": "#FFB3D9",        // Warnings
  "neon-pink": "#FF8DC7"          // Errors, admin
}
```

## 🐛 Troubleshooting

### Still Seeing Yellow Text?
Your PowerShell session is using cached config. Close **ALL** PowerShell windows and reopen.

### Template Errors?
Run the fix script again:
```powershell
C:\Dev\IDE-Configs\PowerShell-Runtime\ULTIMATE-WATERCOLOR-FIX.ps1
```

### Theme Not Loading?
Check your bootstrap is pointing to the correct theme:
```powershell
Get-Content "C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap-v2.1.ps1" | Select-String "omp.json"
```

Should show: `nyra-watercolor.omp.json`

## 📦 Files Created

- `nyra-watercolor.omp.json` - Main theme file
- `ULTIMATE-WATERCOLOR-FIX.ps1` - Installer/fixer script
- `PREVIEW-WATERCOLOR.ps1` - Preview utility
- `Switch-WatercolorTheme.ps1` - Quick switcher
- `nyra-active.omp.json` - Symlink to active theme

## 🎨 Design Philosophy

The watercolor theme was designed with these principles:

1. **Eliminate Yellow** - No more harsh yellow text
2. **Soft Purple Primary** - Easy on the eyes for long coding sessions
3. **Watercolor Accents** - Seafoam, turquoise, pink create dreamy aesthetic
4. **High Readability** - Text contrasts well against black background
5. **Semantic Colors** - Different elements get distinct, meaningful colors
6. **Performance** - Minimal segments for fast prompt rendering

## 💡 Tips

- Works best with **dark terminal background** (black recommended)
- Use a **Nerd Font** for icons (FiraCode, JetBrains Mono)
- Disable Python virtualenv prompts (handled by theme)
- Check RAM usage with the built-in segment
- Git status shows at-a-glance with color coding

## 🔄 Reverting

To revert to the old theme:

```powershell
# Restore from backup
$backup = Get-ChildItem "C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap-v2.1.ps1.backup-*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Copy-Item $backup.FullName "C:\Dev\IDE-Configs\PowerShell-Runtime\bootstrap-v2.1.ps1" -Force
```

---

**Nya~! (=^･ω･^=)** Made with 💜 by the NYRA development team

Enjoy your beautiful watercolor terminal! 🎨✨
