# Warp Terminal Startup Configuration
# Automatically applies XulbuX Warp-optimized theme when Warp is detected

param(
    [switch]$Force,
    [ValidateSet('starship', 'posh')]$PreferredEngine = 'starship'
)

# Enhanced Warp detection
function Test-WarpTerminal {
    $warpIndicators = @(
        ($env:TERM_PROGRAM -eq 'WarpTerminal'),
        ($env:WARP -eq '1'),
        ($env:WARP_TERMINAL -eq '1'),
        (Get-Process -Name 'warp' -ErrorAction SilentlyContinue),
        (Get-Process | Where-Object ProcessName -like '*warp*' -ErrorAction SilentlyContinue),
        ($env:TERMINAL_EMULATOR -like '*warp*')
    )
    
    return ($warpIndicators | Where-Object { $_ }) -ne $null
}

function Set-WarpOptimizedPrompt {
    param(
        [ValidateSet('starship', 'posh')]$Engine = $PreferredEngine
    )
    
    $baseDir = 'C:\Dev\Profiles\PowerShell'
    
    try {
        if ($Engine -eq 'starship') {
            Write-Host "🚀 Setting up Warp-optimized Starship..." -ForegroundColor Magenta
            
            # Set Warp-specific Starship config
            $env:STARSHIP_CONFIG = "$baseDir\Starship\starship-warp.toml"
            
            # Verify Starship is available
            if (-not (Get-Command starship -ErrorAction SilentlyContinue)) {
                Write-Host "⚠️  Starship not found. Install from https://starship.rs" -ForegroundColor Yellow
                return $false
            }
            
            # Initialize Starship
            Invoke-Expression (&starship init powershell)
            
            Write-Host "✅ Warp-optimized Starship active with XulbuX colors" -ForegroundColor Green
            return $true
            
        } else {
            Write-Host "🎨 Setting up Warp-optimized Oh My Posh..." -ForegroundColor Magenta
            
            # Set Warp-specific Oh My Posh config
            $warpPoshConfig = "$baseDir\PoshThemes\xulbux-warp-optimized.omp.json"
            
            if (-not (Test-Path $warpPoshConfig)) {
                Write-Host "❌ Warp Oh My Posh config not found: $warpPoshConfig" -ForegroundColor Red
                return $false
            }
            
            # Verify Oh My Posh is available
            if (-not (Get-Command oh-my-posh -ErrorAction SilentlyContinue)) {
                Write-Host "⚠️  Oh My Posh not found. Install from https://ohmyposh.dev" -ForegroundColor Yellow
                return $false
            }
            
            # Initialize Oh My Posh with Warp config
            oh-my-posh init pwsh --config $warpPoshConfig | Invoke-Expression
            
            Write-Host "✅ Warp-optimized Oh My Posh active with XulbuX colors" -ForegroundColor Green
            return $true
        }
        
    } catch {
        Write-Host "❌ Failed to set Warp prompt: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Show-WarpConfig {
    Write-Host @"

  ╔══════════════════════════════════════════════════════════════════════════════════╗
  ║                    🚀 WARP TERMINAL DETECTED                                    ║
  ║                      XulbuX Theme Optimized                                     ║
  ╚══════════════════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

    Write-Host "  🎨 XulbuX Color Palette:" -ForegroundColor Cyan
    Write-Host "     • XulbuX Primary: #7572F7 (icons, time)" -ForegroundColor Blue
    Write-Host "     • Purple: #B38CFF (username, prompt symbol)" -ForegroundColor Magenta  
    Write-Host "     • Blue: #668CFF (directory paths)" -ForegroundColor Blue
    Write-Host "     • Neon Green: #96FFBE (git branch, success)" -ForegroundColor Green
    Write-Host "     • Cyan: #9CF6FF (Python, duration)" -ForegroundColor Cyan
    Write-Host "     • Mint: #A7FFD7 (Node.js)" -ForegroundColor Green
    Write-Host "     • Hot Pink: #FF5DAE (errors, admin, git changes)" -ForegroundColor Red
    Write-Host ""
    
    Write-Host "  ⚡ Warp Optimizations:" -ForegroundColor Yellow
    Write-Host "     • Minimal modules for faster startup" -ForegroundColor Gray
    Write-Host "     • Context-aware language detection" -ForegroundColor Gray
    Write-Host "     • Pure black backgrounds with colored text" -ForegroundColor Gray
    Write-Host "     • Reduced Git fetch operations" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  🔧 Quick Commands:" -ForegroundColor Green
    Write-Host "     swarp-starship    - Switch to Warp Starship" -ForegroundColor White
    Write-Host "     swarp-posh        - Switch to Warp Oh My Posh" -ForegroundColor White
    Write-Host "     sspeed            - Use speed profile variant" -ForegroundColor White
    Write-Host ""
}

# Main execution
if (Test-WarpTerminal -or $Force) {
    Show-WarpConfig
    
    if (Set-WarpOptimizedPrompt -Engine $PreferredEngine) {
        # Additional Warp optimizations
        $env:VIRTUAL_ENV_DISABLE_PROMPT = '1'  # Hide Python venv from prompt
        $env:STARSHIP_SESSION_KEY = [System.Guid]::NewGuid().ToString()  # Unique session
        
        # Speed up PowerShell for Warp
        $PSDefaultParameterValues['*:Encoding'] = 'utf8'
        
        Write-Host "🎯 Warp optimizations applied successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some optimizations failed - check configurations" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  Warp terminal not detected - skipping Warp optimizations" -ForegroundColor Blue
}