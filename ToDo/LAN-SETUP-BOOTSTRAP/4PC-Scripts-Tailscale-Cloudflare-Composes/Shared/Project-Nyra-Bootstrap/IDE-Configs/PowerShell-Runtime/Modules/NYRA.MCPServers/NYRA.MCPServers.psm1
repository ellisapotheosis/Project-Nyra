# NYRA MCP Servers Module - NPX Edition
# Quick launchers for NPX-based MCP servers

$script:MCPPath = "C:\Dev\Tools\MCP-Servers-NPX"

function Start-InfisicalMCP {
    <#
    .SYNOPSIS
    Start Infisical MCP server via npx
    
    .DESCRIPTION
    Launches Infisical MCP with credentials from config file
    
    .EXAMPLE
    Start-InfisicalMCP
    #>
    [CmdletBinding()]
    param()
    
    $launcher = Join-Path $script:MCPPath "scripts\start-infisical-mcp.ps1"
    if (Test-Path $launcher) {
        & $launcher
    } else {
        Write-Error "Launcher not found: $launcher"
    }
}

function Start-BitwardenMCP {
    <#
    .SYNOPSIS
    Start Bitwarden MCP server via npx
    
    .DESCRIPTION
    Launches Bitwarden MCP with optional session token
    
    .PARAMETER SessionToken
    Bitwarden session token (optional, will auto-unlock if not provided)
    
    .EXAMPLE
    Start-BitwardenMCP
    
    .EXAMPLE
    Start-BitwardenMCP -SessionToken "your-session-token"
    #>
    [CmdletBinding()]
    param([string]$SessionToken)
    
    $launcher = Join-Path $script:MCPPath "scripts\start-bitwarden-mcp.ps1"
    if (Test-Path $launcher) {
        if ($SessionToken) {
            & $launcher -SessionToken $SessionToken
        } else {
            & $launcher
        }
    } else {
        Write-Error "Launcher not found: $launcher"
    }
}

function Get-InfisicalSecret {
    <#
    .SYNOPSIS
    Get a secret from Infisical
    
    .PARAMETER Name
    Secret name
    
    .PARAMETER Path
    Secret path (default: /)
    
    .EXAMPLE
    Get-InfisicalSecret -Name "API_KEY"
    
    .EXAMPLE
    Get-InfisicalSecret -Name "DATABASE_URL" -Path "/apotheosis/project-nyra"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Name,
        
        [string]$Path = "/"
    )
    
    # Load environment
    $envFile = Join-Path $script:MCPPath "configs\.env.infisical"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^([^#][^=]+)=(.*)$') {
                [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
            }
        }
    }
    
    try {
        $result = infisical secrets get $Name --path="$Path" --plain 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $result
        } else {
            Write-Error "Failed to get secret: $result"
        }
    } catch {
        Write-Error "Infisical CLI error: $_"
    }
}

function Get-InfisicalSecrets {
    <#
    .SYNOPSIS
    List all secrets from Infisical
    
    .PARAMETER Path
    Secret path (default: /)
    
    .EXAMPLE
    Get-InfisicalSecrets
    
    .EXAMPLE
    Get-InfisicalSecrets -Path "/apotheosis/project-nyra"
    #>
    [CmdletBinding()]
    param([string]$Path = "/")
    
    # Load environment
    $envFile = Join-Path $script:MCPPath "configs\.env.infisical"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^([^#][^=]+)=(.*)$') {
                [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
            }
        }
    }
    
    try {
        infisical secrets list --path="$Path" 2>&1
    } catch {
        Write-Error "Infisical CLI error: $_"
    }
}

function Get-BitwardenItem {
    <#
    .SYNOPSIS
    Get an item from Bitwarden
    
    .PARAMETER Name
    Item name or ID
    
    .EXAMPLE
    Get-BitwardenItem -Name "GitHub"
    #>
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$Name)
    
    if (-not $env:BW_SESSION) {
        Write-Error "BW_SESSION not set. Run: `$env:BW_SESSION = bw unlock --raw"
        return
    }
    
    try {
        bw get item $Name --session $env:BW_SESSION | ConvertFrom-Json
    } catch {
        Write-Error "Bitwarden CLI error: $_"
    }
}

function Edit-InfisicalConfig {
    <#
    .SYNOPSIS
    Open Infisical configuration file in notepad
    
    .EXAMPLE
    Edit-InfisicalConfig
    #>
    $envFile = Join-Path $script:MCPPath "configs\.env.infisical"
    if (Test-Path $envFile) {
        notepad $envFile
    } else {
        Write-Error "Config file not found: $envFile"
    }
}

function Show-MCPServerPaths {
    <#
    .SYNOPSIS
    Show MCP server installation paths
    
    .EXAMPLE
    Show-MCPServerPaths
    #>
    Write-Host "`n📁 MCP Server Paths:" -ForegroundColor Cyan
    Write-Host "  Base:    $script:MCPPath" -ForegroundColor White
    Write-Host "  Scripts: $(Join-Path $script:MCPPath 'scripts')" -ForegroundColor White
    Write-Host "  Configs: $(Join-Path $script:MCPPath 'configs')" -ForegroundColor White
    Write-Host "  Logs:    $(Join-Path $script:MCPPath 'logs')" -ForegroundColor White
}

# Aliases for convenience
Set-Alias -Name infisical-mcp -Value Start-InfisicalMCP
Set-Alias -Name bitwarden-mcp -Value Start-BitwardenMCP
Set-Alias -Name get-secret -Value Get-InfisicalSecret
Set-Alias -Name list-secrets -Value Get-InfisicalSecrets
Set-Alias -Name get-bw -Value Get-BitwardenItem
Set-Alias -Name edit-infisical -Value Edit-InfisicalConfig

Export-ModuleMember -Function * -Alias *
