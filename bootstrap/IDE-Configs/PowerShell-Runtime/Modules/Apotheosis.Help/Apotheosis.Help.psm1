<#
.SYNOPSIS
Apotheosis Help Module - Comprehensive documentation and help system for all profile features

.DESCRIPTION
Provides interactive help, command reference, keybinds documentation, and feature discovery
for the entire Apotheosis PowerShell profile system including all modules and capabilities.
#>

# NYRA/Apotheosis color scheme
$Script:Colors = @{
    Primary   = 'Magenta'      # Xulbux Purple equivalent
    Success   = 'Green'        # Neon Green
    Warning   = 'Yellow'       # Pink equivalent  
    Error     = 'Red'          # Rose Pink
    Info      = 'Cyan'         # Blue equivalent
    Accent    = 'Blue'         # Accent color
    Secondary = 'White'        # Secondary text
    Gray      = 'DarkGray'     # Muted text
}

function Show-ApotheosisWelcome {
    <#
    .SYNOPSIS
    Shows the Apotheosis loading screen with essential commands
    #>
    
    # Prevent showing multiple times in the same session
    if ($Script:WelcomeShown) { return }
    $Script:WelcomeShown = $true
    
    Write-Host @"

    ╔══════════════════════════════════════════════════════════════════════════════════╗
    ║                    🚀 APOTHEOSIS POWERSHELL PROFILE SYSTEM                      ║
    ║                          Enhanced for NYRA Development                          ║
    ╚══════════════════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor $Script:Colors.Primary

    Write-Host "  ✨ " -NoNewline -ForegroundColor $Script:Colors.Success
    Write-Host "Quick Commands: " -NoNewline -ForegroundColor $Script:Colors.Info
    Write-Host "sspeed" -NoNewline -ForegroundColor $Script:Colors.Primary
    Write-Host " | " -NoNewline -ForegroundColor $Script:Colors.Gray
    Write-Host "sfull" -NoNewline -ForegroundColor $Script:Colors.Primary  
    Write-Host " | " -NoNewline -ForegroundColor $Script:Colors.Gray
    Write-Host "sminimal" -NoNewline -ForegroundColor $Script:Colors.Primary
    Write-Host " (profile variants)" -ForegroundColor $Script:Colors.Gray

    Write-Host "  🎭 " -NoNewline -ForegroundColor $Script:Colors.Warning
    Write-Host "Prompts: " -NoNewline -ForegroundColor $Script:Colors.Info
    Write-Host "sstarship" -NoNewline -ForegroundColor $Script:Colors.Primary
    Write-Host " | " -NoNewline -ForegroundColor $Script:Colors.Gray
    Write-Host "sposh" -NoNewline -ForegroundColor $Script:Colors.Primary
    Write-Host " | " -NoNewline -ForegroundColor $Script:Colors.Gray  
    Write-Host "Switch-Prompt" -NoNewline -ForegroundColor $Script:Colors.Primary
    Write-Host " (toggle)" -ForegroundColor $Script:Colors.Gray

    Write-Host "  🏠 " -NoNewline -ForegroundColor $Script:Colors.Accent
    Write-Host "NYRA: " -NoNewline -ForegroundColor $Script:Colors.Info
    Write-Host "nyra core" -NoNewline -ForegroundColor $Script:Colors.Primary
    Write-Host " | " -NoNewline -ForegroundColor $Script:Colors.Gray
    Write-Host "start-stack" -NoNewline -ForegroundColor $Script:Colors.Primary
    Write-Host " | " -NoNewline -ForegroundColor $Script:Colors.Gray
    Write-Host "init-nyra-secrets" -ForegroundColor $Script:Colors.Primary

    Write-Host "  📋 " -NoNewline -ForegroundColor $Script:Colors.Success
    Write-Host "Help: " -NoNewline -ForegroundColor $Script:Colors.Info  
    Write-Host "apotheosis-help" -NoNewline -ForegroundColor $Script:Colors.Primary
    Write-Host " | " -NoNewline -ForegroundColor $Script:Colors.Gray
    Write-Host "Get-ProfileHelp" -NoNewline -ForegroundColor $Script:Colors.Primary
    Write-Host " | " -NoNewline -ForegroundColor $Script:Colors.Gray
    Write-Host "list-voices" -ForegroundColor $Script:Colors.Primary

    Write-Host ""
}

function Show-ApotheosisHelp {
    <#
    .SYNOPSIS
    Main help system - shows comprehensive documentation for all profile features
    
    .PARAMETER Category
    Specific help category to display
    
    .PARAMETER Search
    Search for specific commands or features
    #>
    param(
        [ValidateSet('all', 'profiles', 'prompts', 'modules', 'nyra', 'voice', 'claude', 'secrets', 'keybinds', 'aliases')]
        [string]$Category = 'all',
        [string]$Search
    )

    if ($Search) {
        Show-SearchResults -Query $Search
        return
    }

    # Only show welcome for 'all' category
    if ($Category -eq 'all') {
        Show-AllHelp
    } else {
        switch ($Category) {
            'profiles' { Show-ProfileHelp }
            'prompts' { Show-PromptHelp }
            'modules' { Show-ModuleHelp }
            'nyra' { Show-NYRAHelp }
            'voice' { Show-VoiceHelp }
            'claude' { Show-ClaudeHelp }
            'secrets' { Show-SecretsHelp }
            'keybinds' { Show-KeybindsHelp }
            'aliases' { Show-AliasHelp }
        }
    }
}

function Show-AllHelp {
    Write-Host @"

  ╔══════════════════════════════════════════════════════════════════════════════════╗
  ║                        🔮 APOTHEOSIS PROFILE SYSTEM HELP                        ║
  ║                    Comprehensive PowerShell Enhancement Suite                   ║
  ╚══════════════════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor $Script:Colors.Primary

    Write-Host "  📖 " -NoNewline -ForegroundColor $Script:Colors.Info
    Write-Host "HELP CATEGORIES:" -ForegroundColor $Script:Colors.Info
    Write-Host ""
    
    $categories = @(
        @{Icon="⚡"; Name="profiles"; Description="Profile variants (speed, full, minimal)"},
        @{Icon="🎭"; Name="prompts"; Description="Oh My Posh & Starship prompt engines"},
        @{Icon="📦"; Name="modules"; Description="Custom modules (Nav, Dev, Secrets, Voice)"},
        @{Icon="🏠"; Name="nyra"; Description="NYRA development workflow commands"},
        @{Icon="🎤"; Name="voice"; Description="Text-to-speech and voice integration"},
        @{Icon="🤖"; Name="claude"; Description="Claude-flow MCP server integration"},
        @{Icon="🔐"; Name="secrets"; Description="Secret management (Infisical/1Pass/BW)"},
        @{Icon="⌨️"; Name="keybinds"; Description="Keyboard shortcuts and hotkeys"},
        @{Icon="🔗"; Name="aliases"; Description="Command aliases and shortcuts"}
    )
    
    foreach ($cat in $categories) {
        Write-Host "    $($cat.Icon) " -NoNewline -ForegroundColor $Script:Colors.Success
        Write-Host "apotheosis-help " -NoNewline -ForegroundColor $Script:Colors.Primary
        Write-Host "$($cat.Name)" -NoNewline -ForegroundColor $Script:Colors.Accent
        Write-Host " - $($cat.Description)" -ForegroundColor $Script:Colors.Gray
    }
    
    Write-Host ""
    Write-Host "  🔍 " -NoNewline -ForegroundColor $Script:Colors.Warning
    Write-Host "SEARCH: " -NoNewline -ForegroundColor $Script:Colors.Info
    Write-Host "apotheosis-help -Search '<term>'" -ForegroundColor $Script:Colors.Primary
    Write-Host ""
    Write-Host "  💡 " -NoNewline -ForegroundColor $Script:Colors.Success
    Write-Host "TIP: " -NoNewline -ForegroundColor $Script:Colors.Info  
    Write-Host "Tab completion works with all commands!" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
}

function Show-ProfileHelp {
    Write-Host ""
    Write-Host "  ⚡ PROFILE VARIANTS" -ForegroundColor $Script:Colors.Primary
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Script:Colors.Primary
    Write-Host ""
    
    $profiles = @(
        @{Cmd="sspeed"; Name="Speed Profile"; Desc="⚡ Warp-optimized, minimal startup time, PSReadLine only"},
        @{Cmd="sfull"; Name="Full Profile"; Desc="🎯 Feature-rich, all modules, enhanced predictions"},  
        @{Cmd="sminimal"; Name="Minimal Profile"; Desc="💨 Lightweight, basic PSReadLine, quick loading"}
    )
    
    foreach ($profile in $profiles) {
        Write-Host "    " -NoNewline
        Write-Host "$($profile.Cmd)" -NoNewline -ForegroundColor $Script:Colors.Success
        Write-Host " - " -NoNewline -ForegroundColor $Script:Colors.Gray
        Write-Host "$($profile.Name)" -NoNewline -ForegroundColor $Script:Colors.Info
        Write-Host ""
        Write-Host "      $($profile.Desc)" -ForegroundColor $Script:Colors.Gray
        Write-Host ""
    }
    
    Write-Host "  🔧 PROFILE MANAGEMENT" -ForegroundColor $Script:Colors.Accent
    Write-Host "    " -NoNewline
    Write-Host "Refresh-Profile" -NoNewline -ForegroundColor $Script:Colors.Success
    Write-Host " - Reload current profile configuration" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
}

function Show-PromptHelp {
    Write-Host ""
    Write-Host "  🎭 PROMPT ENGINES" -ForegroundColor $Script:Colors.Primary
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Script:Colors.Primary
    Write-Host ""
    
    Write-Host "  🌟 STARSHIP COMMANDS" -ForegroundColor $Script:Colors.Success
    $starshipCmds = @(
        @{Cmd="sstarship"; Desc="Switch to Starship prompt"},
        @{Cmd="Use-Starship"; Desc="Advanced Starship switching with options"},
        @{Cmd="Use-StarshipAI"; Desc="AI/Multi-Agent optimized Starship config"},
        @{Cmd="Use-StarshipWarp"; Desc="Warp Terminal optimized Starship config"}
    )
    
    foreach ($cmd in $starshipCmds) {
        Write-Host "    " -NoNewline
        Write-Host "$($cmd.Cmd)" -NoNewline -ForegroundColor $Script:Colors.Success  
        Write-Host " - $($cmd.Desc)" -ForegroundColor $Script:Colors.Gray
    }
    
    Write-Host ""
    Write-Host "  🎨 OH MY POSH COMMANDS" -ForegroundColor $Script:Colors.Warning
    $ompCmds = @(
        @{Cmd="sposh"; Desc="Switch to Oh My Posh prompt"},
        @{Cmd="Use-OhMyPosh"; Desc="Switch with optional custom theme path"},
        @{Cmd="Use-NativePrompt"; Desc="Use basic PowerShell prompt"}
    )
    
    foreach ($cmd in $ompCmds) {
        Write-Host "    " -NoNewline  
        Write-Host "$($cmd.Cmd)" -NoNewline -ForegroundColor $Script:Colors.Warning
        Write-Host " - $($cmd.Desc)" -ForegroundColor $Script:Colors.Gray
    }
    
    Write-Host ""
    Write-Host "  🔄 PROMPT UTILITIES" -ForegroundColor $Script:Colors.Accent
    Write-Host "    " -NoNewline
    Write-Host "Switch-Prompt" -NoNewline -ForegroundColor $Script:Colors.Accent
    Write-Host " - Toggle between Starship and Oh My Posh" -ForegroundColor $Script:Colors.Gray
    Write-Host "    " -NoNewline
    Write-Host "Get-WarpPrompt" -NoNewline -ForegroundColor $Script:Colors.Accent  
    Write-Host " - Show current prompt configuration" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
}

function Show-ModuleHelp {
    Write-Host ""
    Write-Host "  📦 APOTHEOSIS MODULES" -ForegroundColor $Script:Colors.Primary
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Script:Colors.Primary
    Write-Host ""
    
    Write-Host "  🧭 NAV MODULE" -ForegroundColor $Script:Colors.Success
    Write-Host "    Up - Move up one directory (cd ..)" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Jump <path> - Navigate to specific directory" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🛠️ APOTHEOSIS.DEV MODULE" -ForegroundColor $Script:Colors.Success  
    Write-Host "    Install-GitAutosync - Setup Git auto-sync tasks" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Initialize-NYRAEnvironment - Setup NYRA project structure" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Create-DevDriveVHD - Create ReFS Dev Drive" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Start-NYRAStack - Launch NYRA development services" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Go-NYRA <component> - Navigate to NYRA directories" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🔐 APOTHEOSIS.SECRETS MODULE" -ForegroundColor $Script:Colors.Warning
    Write-Host "    Get-Secret <key> - Universal secret retrieval" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Load-InfisicalEnv <env> - Load Infisical environment" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Initialize-NYRASecrets - Load all NYRA secrets" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🎤 APOTHEOSIS.VOICE MODULE" -ForegroundColor $Script:Colors.Accent
    Write-Host "    Speak-ElevenLabs <text> - ElevenLabs TTS" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Speak-LocalHttp <text> - Local TTS server" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Speak-Web <text> - Windows Speech Platform" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Invoke-NYRAVoiceCommand <cmd> - NYRA voice commands" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
}

function Show-NYRAHelp {
    Write-Host ""
    Write-Host "  🏠 NYRA DEVELOPMENT WORKFLOW" -ForegroundColor $Script:Colors.Primary
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Script:Colors.Primary
    Write-Host ""
    
    Write-Host "  🧭 NAVIGATION" -ForegroundColor $Script:Colors.Success
    Write-Host "    nyra core - Navigate to nyra-core" -ForegroundColor $Script:Colors.Gray
    Write-Host "    nyra webapp - Navigate to nyra-webapp" -ForegroundColor $Script:Colors.Gray  
    Write-Host "    nyra memory - Navigate to nyra-memory" -ForegroundColor $Script:Colors.Gray
    Write-Host "    nyra infra - Navigate to nyra-infra" -ForegroundColor $Script:Colors.Gray
    Write-Host "    nyra prompts - Navigate to nyra-prompts" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  ⚡ ENVIRONMENT SETUP" -ForegroundColor $Script:Colors.Warning
    Write-Host "    dev-init - Initialize NYRA development environment" -ForegroundColor $Script:Colors.Gray
    Write-Host "    init-nyra-secrets - Load NYRA development secrets" -ForegroundColor $Script:Colors.Gray
    Write-Host "    start-stack - Launch NYRA development services" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🎤 VOICE INTEGRATION" -ForegroundColor $Script:Colors.Accent  
    Write-Host "    nyra-voice 'status' - Check system status" -ForegroundColor $Script:Colors.Gray
    Write-Host "    nyra-voice 'start stack' - Start development stack" -ForegroundColor $Script:Colors.Gray
    Write-Host "    nyra-voice 'load secrets' - Load environment secrets" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
}

function Show-VoiceHelp {
    Write-Host ""
    Write-Host "  🎤 VOICE & TTS INTEGRATION" -ForegroundColor $Script:Colors.Primary
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Script:Colors.Primary
    Write-Host ""
    
    Write-Host "  🔊 TEXT-TO-SPEECH" -ForegroundColor $Script:Colors.Success
    Write-Host "    speak '<text>' - Windows Speech Platform TTS" -ForegroundColor $Script:Colors.Gray
    Write-Host "    speak-el '<text>' - ElevenLabs AI voice synthesis" -ForegroundColor $Script:Colors.Gray
    Write-Host "    speak-local '<text>' - Local TTS server (Piper/Coqui)" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🎙️ VOICE SERVERS" -ForegroundColor $Script:Colors.Warning
    Write-Host "    Start-PiperServer - Launch Piper TTS HTTP server" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Start-CoquiServer - Launch Coqui TTS server" -ForegroundColor $Script:Colors.Gray
    Write-Host "    list-voices - Show available TTS voices" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🎭 VOICEMOD INTEGRATION" -ForegroundColor $Script:Colors.Accent
    Write-Host "    voicemod '<filter>' - Set voice filter (Robot, Chipmunk, etc)" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🤖 NYRA VOICE COMMANDS" -ForegroundColor $Script:Colors.Info
    Write-Host "    nyra-voice 'status' - System status check" -ForegroundColor $Script:Colors.Gray
    Write-Host "    nyra-voice 'start stack' - Launch development stack" -ForegroundColor $Script:Colors.Gray
    Write-Host "    nyra-voice 'navigate core' - Go to NYRA core directory" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
}

function Show-ClaudeHelp {
    Write-Host ""
    Write-Host "  🤖 CLAUDE-FLOW MCP INTEGRATION" -ForegroundColor $Script:Colors.Primary
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Script:Colors.Primary
    Write-Host ""
    
    Write-Host "  🚀 QUICK COMMANDS" -ForegroundColor $Script:Colors.Success
    Write-Host "    claude-start - Start all claude-flow MCP servers" -ForegroundColor $Script:Colors.Gray
    Write-Host "    claude-stop - Stop all claude-flow processes" -ForegroundColor $Script:Colors.Gray
    Write-Host "    claude-status - Show claude-flow system status dashboard" -ForegroundColor $Script:Colors.Gray
    Write-Host "    claude-test - Test MCP server connectivity" -ForegroundColor $Script:Colors.Gray
    Write-Host "    nyra-claude - Start complete NYRA + Claude-flow stack" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  ⚙️ MANAGEMENT" -ForegroundColor $Script:Colors.Warning
    Write-Host "    Install-ClaudeFlow - Install claude-flow ecosystem packages" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Initialize-ClaudeConfig - Setup claude-flow configurations" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Start-ClaudeFlow <server> - Start specific MCP server" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Test-ClaudeServers - Detailed server connectivity testing" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🌐 MCP SERVERS" -ForegroundColor $Script:Colors.Accent
    Write-Host "    claude-flow (Port 3001) - Main claude-flow server" -ForegroundColor $Script:Colors.Gray
    Write-Host "    roo (Port 3002) - ruvnet/roo MCP server" -ForegroundColor $Script:Colors.Gray
    Write-Host "    spar (Port 3003) - ruv/spar MCP server" -ForegroundColor $Script:Colors.Gray
    Write-Host "    sparc2 (Port 3004) - ruvnet/sparc2 MCP server" -ForegroundColor $Script:Colors.Gray
    Write-Host "    nexus-flow (Port 3005) - ruv/nexus-flow workflow engine" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  💻 WINDOWS COMPATIBILITY" -ForegroundColor $Script:Colors.Info
    Write-Host "    claude-cmd '<command>' - Execute with Windows /c wrappers" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Uses PowerShell/cmd wrappers for optimal Windows 11 compatibility" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
}

function Show-SecretsHelp {
    Write-Host ""
    Write-Host "  🔐 SECRET MANAGEMENT" -ForegroundColor $Script:Colors.Primary
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Script:Colors.Primary
    Write-Host ""
    
    Write-Host "  🌐 UNIVERSAL COMMANDS" -ForegroundColor $Script:Colors.Success
    Write-Host "    get-secret '<key>' - Retrieve from any source (auto-detect)" -ForegroundColor $Script:Colors.Gray
    Write-Host "    init-nyra-secrets - Load all NYRA development secrets" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  📡 INFISICAL (PRIMARY)" -ForegroundColor $Script:Colors.Warning
    Write-Host "    load-secrets <env> - Load environment (dev/staging/prod)" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Get-InfisicalSecret <key> - Get specific secret" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Set-InfisicalSecret <key> <value> - Set secret" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🔑 1PASSWORD" -ForegroundColor $Script:Colors.Accent
    Write-Host "    Get-1PasswordSecret <item> - Retrieve from 1Password vault" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🛡️ BITWARDEN" -ForegroundColor $Script:Colors.Info
    Write-Host "    Get-BitwardenSecret <item> - Retrieve from Bitwarden vault" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  ⚠️ REQUIREMENTS" -ForegroundColor $Script:Colors.Error
    Write-Host "    • INFISICAL_TOKEN environment variable" -ForegroundColor $Script:Colors.Gray
    Write-Host "    • CLIs installed: infisical, op (1Password), bw (Bitwarden)" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
}

function Show-KeybindsHelp {
    Write-Host ""
    Write-Host "  ⌨️ KEYBOARD SHORTCUTS & HOTKEYS" -ForegroundColor $Script:Colors.Primary
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Script:Colors.Primary
    Write-Host ""
    
    Write-Host "  🧭 NAVIGATION (NAV MODULE)" -ForegroundColor $Script:Colors.Success
    Write-Host "    Alt + ← - Navigate back (if configured in Nav module)" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Alt + → - Navigate forward (if configured in Nav module)" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  📋 PSREADLINE SHORTCUTS" -ForegroundColor $Script:Colors.Warning
    Write-Host "    Ctrl + R - Reverse history search" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Ctrl + L - Clear screen" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Tab - Command/parameter completion" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Ctrl + Space - Trigger IntelliSense" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🔍 FUZZY FINDING (PSFZF)" -ForegroundColor $Script:Colors.Accent
    Write-Host "    Ctrl + T - Fuzzy file finder" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Ctrl + R - Fuzzy history search" -ForegroundColor $Script:Colors.Gray
    Write-Host "    Alt + C - Fuzzy directory change" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  💡 NOTE: Keybind availability depends on your profile variant" -ForegroundColor $Script:Colors.Info
    Write-Host "         Full profile has all keybinds, Speed profile has minimal" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
}

function Show-AliasHelp {
    Write-Host ""
    Write-Host "  🔗 COMMAND ALIASES & SHORTCUTS" -ForegroundColor $Script:Colors.Primary
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Script:Colors.Primary
    Write-Host ""
    
    Write-Host "  ⚡ PROFILE ALIASES" -ForegroundColor $Script:Colors.Success
    Write-Host "    spv → Set-ProfileVariant" -ForegroundColor $Script:Colors.Gray
    Write-Host "    sps → Use-Starship (legacy)" -ForegroundColor $Script:Colors.Gray
    Write-Host "    spp → Use-OMP (legacy)" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🏠 NYRA ALIASES" -ForegroundColor $Script:Colors.Warning
    Write-Host "    nyra → Go-NYRA" -ForegroundColor $Script:Colors.Gray
    Write-Host "    dev-init → Initialize-NYRAEnvironment" -ForegroundColor $Script:Colors.Gray
    Write-Host "    start-stack → Start-NYRAStack" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🔐 SECRETS ALIASES" -ForegroundColor $Script:Colors.Accent
    Write-Host "    get-secret → Get-Secret" -ForegroundColor $Script:Colors.Gray
    Write-Host "    load-secrets → Load-InfisicalEnv" -ForegroundColor $Script:Colors.Gray
    Write-Host "    init-nyra-secrets → Initialize-NYRASecrets" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🎤 VOICE ALIASES" -ForegroundColor $Script:Colors.Info
    Write-Host "    speak → Speak-Web" -ForegroundColor $Script:Colors.Gray
    Write-Host "    speak-el → Speak-ElevenLabs" -ForegroundColor $Script:Colors.Gray
    Write-Host "    speak-local → Speak-LocalHttp" -ForegroundColor $Script:Colors.Gray
    Write-Host "    nyra-voice → Invoke-NYRAVoiceCommand" -ForegroundColor $Script:Colors.Gray
    Write-Host "    list-voices → Get-AvailableVoices" -ForegroundColor $Script:Colors.Gray
    Write-Host "    voicemod → Set-VoicemodFilter" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  🤖 CLAUDE ALIASES" -ForegroundColor $Script:Colors.Warning
    Write-Host "    claude-start → Start-ClaudeFlow" -ForegroundColor $Script:Colors.Gray
    Write-Host "    claude-stop → Stop-ClaudeFlow" -ForegroundColor $Script:Colors.Gray
    Write-Host "    claude-status → Get-ClaudeStatus" -ForegroundColor $Script:Colors.Gray
    Write-Host "    claude-test → Test-ClaudeServers" -ForegroundColor $Script:Colors.Gray
    Write-Host "    claude-cmd → Invoke-ClaudeCommand" -ForegroundColor $Script:Colors.Gray
    Write-Host "    nyra-claude → Start-NYRAWithClaude" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
    
    Write-Host "  📋 HELP ALIASES" -ForegroundColor $Script:Colors.Primary
    Write-Host "    apotheosis-help → Show-ApotheosisHelp" -ForegroundColor $Script:Colors.Gray
    Write-Host "    apo-help → Show-ApotheosisHelp (short form)" -ForegroundColor $Script:Colors.Gray
    Write-Host ""
}

function Show-SearchResults {
    param([string]$Query)
    
    Write-Host ""
    Write-Host "  🔍 SEARCH RESULTS FOR: '$Query'" -ForegroundColor $Script:Colors.Primary
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Script:Colors.Primary
    Write-Host ""
    
    # Simple search implementation - in a real scenario you'd want more sophisticated matching
    $allCommands = @{
        "sspeed" = "Switch to speed profile variant";
        "sfull" = "Switch to full profile variant";
        "sminimal" = "Switch to minimal profile variant";
        "sstarship" = "Switch to Starship prompt";
        "sposh" = "Switch to Oh My Posh prompt";
        "nyra" = "Navigate to NYRA project components";
        "init-nyra-secrets" = "Initialize NYRA development secrets";
        "start-stack" = "Start NYRA development stack";
        "get-secret" = "Retrieve secrets from any source";
        "speak" = "Text-to-speech using Windows Speech Platform";
        "claude-start" = "Start claude-flow MCP servers";
        "claude-stop" = "Stop all claude-flow processes";
        "claude-status" = "Show claude-flow system status";
        "nyra-claude" = "Start complete NYRA + Claude-flow stack";
        "apotheosis-help" = "Show comprehensive help system"
    }
    
    $results = $allCommands.GetEnumerator() | Where-Object { 
        $_.Key -like "*$Query*" -or $_.Value -like "*$Query*" 
    }
    
    if ($results) {
        foreach ($result in $results) {
            Write-Host "    " -NoNewline
            Write-Host "$($result.Key)" -NoNewline -ForegroundColor $Script:Colors.Success
            Write-Host " - $($result.Value)" -ForegroundColor $Script:Colors.Gray
        }
    } else {
        Write-Host "    No results found for '$Query'" -ForegroundColor $Script:Colors.Error
        Write-Host "    Try: apotheosis-help all" -ForegroundColor $Script:Colors.Info
    }
    Write-Host ""
}

function Get-ApotheosisVersion {
    <#
    .SYNOPSIS
    Shows version and system information
    #>
    Write-Host ""
    Write-Host "  🔮 APOTHEOSIS PROFILE SYSTEM" -ForegroundColor $Script:Colors.Primary
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Script:Colors.Primary
    Write-Host ""
    Write-Host "    Version: 2.0 Enhanced" -ForegroundColor $Script:Colors.Info
    Write-Host "    Project: NYRA AI-Powered Mortgage Assistant" -ForegroundColor $Script:Colors.Info
    Write-Host "    PowerShell: $($PSVersionTable.PSVersion)" -ForegroundColor $Script:Colors.Info
    Write-Host "    OS: $($PSVersionTable.OS)" -ForegroundColor $Script:Colors.Info
    Write-Host ""
    Write-Host "    🎨 Theme: Xulbux Purple (NYRA Branded)" -ForegroundColor $Script:Colors.Warning
    Write-Host "    🚀 Optimized for: Warp Terminal + Multi-Agent Development" -ForegroundColor $Script:Colors.Success
    Write-Host ""
}

# Quick access functions
function Get-QuickHelp {
    <#
    .SYNOPSIS
    Shows essential commands only (for loading screen)
    #>
    Show-ApotheosisWelcome
}

# Export all functions and create aliases
Set-Alias apotheosis-help Show-ApotheosisHelp
Set-Alias apo-help Show-ApotheosisHelp
Set-Alias apo-welcome Show-ApotheosisWelcome
Set-Alias apo-version Get-ApotheosisVersion

Export-ModuleMember -Function Show-ApotheosisHelp, Show-ApotheosisWelcome, Get-ApotheosisVersion, Get-QuickHelp -Alias apotheosis-help, apo-help, apo-welcome, apo-version