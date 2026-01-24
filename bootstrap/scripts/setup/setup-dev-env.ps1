param()

$ErrorActionPreference = 'Continue'

Write-Host "[NYRA DEV ENV] Starting Windows developer environment setup..." -ForegroundColor Cyan

function Write-Info($msg)  { Write-Host "[INFO]  $msg" -ForegroundColor White }
function Write-Warn($msg)  { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Success($msg) { Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-ErrorLine($msg) { Write-Host "[ERR]  $msg" -ForegroundColor Red }

# 1) Volta (Node toolchain manager)
try {
    $volta = Get-Command volta -ErrorAction SilentlyContinue
    if (-not $volta) {
        Write-Info "Volta not found - installing via official installer script..."
        # Official Volta install script (cross-platform)
        $voltaScript = "https://get.volta.sh"
        try {
            Invoke-WebRequest -UseBasicParsing -Uri $voltaScript -OutFile "$env:TEMP\install-volta.sh"
            & powershell -NoProfile -ExecutionPolicy Bypass -Command "bash `"$env:TEMP/install-volta.sh`"" 2>$null
            Write-Success "Volta installation script executed. You may need to open a new shell."
        } catch {
            Write-Warn "Volta installation script failed: $($_.Exception.Message)"
        }
    } else {
        Write-Info "Volta already installed: $($volta.Source)"
    }
} catch {
    Write-Warn "Error while checking/installing Volta: $($_.Exception.Message)"
}

# Ensure Volta is usable in this session if it was just installed
try {
    $env:VOLTA_HOME = "$env:USERPROFILE\.volta"
    $env:PATH = "$env:VOLTA_HOME\bin;$env:PATH"
} catch {}

# 2) Node LTS and pnpm via Volta
try {
    if (Get-Command volta -ErrorAction SilentlyContinue) {
        Write-Info "Ensuring Node LTS via Volta..."
        volta install node@lts | Out-Null
        Write-Success "Node LTS installed/configured via Volta."

        Write-Info "Ensuring pnpm via Volta..."
        volta install pnpm | Out-Null
        Write-Success "pnpm installed/configured via Volta."
    } else {
        Write-Warn "Volta not available; skipping Node/pnpm installation."
    }
} catch {
    Write-Warn "Error installing Node/pnpm via Volta: $($_.Exception.Message)"
}

# 3) Claude Flow CLI (optional convenience)
try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        Write-Info "You can run Claude-Flow via npx without global install, e.g.:"
        Write-Info "  npx claude-flow@alpha init --sparc"
    } else {
        Write-Warn "pnpm not detected; Claude-Flow will be available via npx once Node is configured in a fresh shell."
    }
} catch {
    Write-Warn "Error while checking pnpm/Claude-Flow: $($_.Exception.Message)"
}

# 4) oh-my-posh (prompt theming) - install only, do not override existing profile
try {
    $omp = Get-Command oh-my-posh -ErrorAction SilentlyContinue
    if (-not $omp) {
        if (Get-Command winget -ErrorAction SilentlyContinue) {
            Write-Info "Installing oh-my-posh via winget (no profile changes will be made)..."
            winget install JanDeDobbeleer.OhMyPosh -s winget -e --accept-package-agreements --accept-source-agreements | Out-Null
            Write-Success "oh-my-posh installation attempted. Configure your profile or reuse your existing Nyra PowerShell runtime to enable it."
        } else {
            Write-Warn "winget not available; skipping oh-my-posh installation."
        }
    } else {
        Write-Info "oh-my-posh already installed: $($omp.Source)"
    }
} catch {
    Write-Warn "Error while checking/installing oh-my-posh: $($_.Exception.Message)"
}

# 5) Claude Code native installer (manual step if missing)
try {
    $claudeCli = Get-Command claude -ErrorAction SilentlyContinue
    if (-not $claudeCli) {
        Write-Warn "Claude Code CLI not found on PATH."
        Write-Info "Please install Claude Code / Claude Desktop via the official Anthropic installer, then restart PowerShell."
    } else {
        Write-Success "Claude Code CLI detected at: $($claudeCli.Source)"
    }
} catch {
    Write-Warn "Error while checking Claude Code CLI: $($_.Exception.Message)"
}

Write-Success "NYRA Windows developer environment setup script completed. Open a new PowerShell/terminal to pick up PATH changes if Volta was just installed."

exit 0
