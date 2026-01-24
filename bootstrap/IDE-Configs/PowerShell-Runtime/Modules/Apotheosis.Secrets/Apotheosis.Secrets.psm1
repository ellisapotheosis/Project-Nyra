<#
.SYNOPSIS
Apotheosis Secrets Module - Universal secret management for NYRA project

.DESCRIPTION
Provides unified access to secrets from Infisical, 1Password, and Bitwarden.
Supports both development and production secret workflows with environment-specific configurations.
#>

# Infisical Functions
function Load-InfisicalEnv {
    <#
    .SYNOPSIS
    Loads environment variables from Infisical for a specific environment
    
    .PARAMETER Environment
    The environment to load secrets from (dev, staging, prod)
    
    .PARAMETER ProjectId
    Optional project ID for Infisical. Uses INFISICAL_PROJECT_ID env var if not specified
    #>
    param(
        [ValidateSet('dev', 'staging', 'prod', 'test')]
        [string]$Environment = 'dev',
        [string]$ProjectId = $env:INFISICAL_PROJECT_ID
    )
    
    try {
        if (-not (Get-Command infisical -ErrorAction SilentlyContinue)) {
            throw "Infisical CLI not found. Install with: winget install Infisical.CLI"
        }
        
        if (-not $env:INFISICAL_TOKEN) {
            throw "INFISICAL_TOKEN environment variable not set"
        }
        
        Write-Host "Loading Infisical secrets for environment: $Environment" -ForegroundColor Cyan
        
        $secretsJson = infisical export --env $Environment --format json
        $secrets = $secretsJson | ConvertFrom-Json
        
        foreach ($secret in $secrets) {
            [Environment]::SetEnvironmentVariable($secret.key, $secret.value, 'Process')
            Write-Host "✅ Loaded: $($secret.key)" -ForegroundColor Green
        }
        
        Write-Host "Successfully loaded $($secrets.Count) secrets from Infisical" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to load Infisical environment: $($_.Exception.Message)"
    }
}

function Get-InfisicalSecret {
    <#
    .SYNOPSIS
    Retrieves a specific secret from Infisical
    
    .PARAMETER Key
    The secret key to retrieve
    
    .PARAMETER Environment
    The environment to get the secret from
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Key,
        [ValidateSet('dev', 'staging', 'prod', 'test')]
        [string]$Environment = 'dev'
    )
    
    try {
        if (-not (Get-Command infisical -ErrorAction SilentlyContinue)) {
            throw "Infisical CLI not found. Install with: winget install Infisical.CLI"
        }
        
        $value = infisical secrets get $Key --env $Environment --plain
        return $value
    }
    catch {
        Write-Error "Failed to retrieve secret '$Key': $($_.Exception.Message)"
        return $null
    }
}

function Set-InfisicalSecret {
    <#
    .SYNOPSIS
    Sets a secret in Infisical
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Key,
        [Parameter(Mandatory=$true)]
        [string]$Value,
        [ValidateSet('dev', 'staging', 'prod', 'test')]
        [string]$Environment = 'dev'
    )
    
    try {
        infisical secrets set $Key $Value --env $Environment
        Write-Host "✅ Set secret: $Key" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to set secret '$Key': $($_.Exception.Message)"
    }
}

# 1Password Functions
function Get-1PasswordSecret {
    <#
    .SYNOPSIS
    Retrieves a secret from 1Password using the op CLI
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Item,
        [string]$Field = 'password',
        [string]$Vault = ''
    )
    
    try {
        if (-not (Get-Command op -ErrorAction SilentlyContinue)) {
            throw "1Password CLI not found. Install with: winget install AgileBits.1Password.CLI"
        }
        
        $opArgs = @('item', 'get', $Item, '--field', $Field)
        if ($Vault) {
            $opArgs += '--vault', $Vault
        }
        
        $value = & op @opArgs
        return $value
    }
    catch {
        Write-Error "Failed to retrieve 1Password secret '$Item': $($_.Exception.Message)"
        return $null
    }
}

# Bitwarden Functions
function Get-BitwardenSecret {
    <#
    .SYNOPSIS
    Retrieves a secret from Bitwarden using the bw CLI
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Item,
        [string]$Field = 'password'
    )
    
    try {
        if (-not (Get-Command bw -ErrorAction SilentlyContinue)) {
            throw "Bitwarden CLI not found. Install with: winget install Bitwarden.CLI"
        }
        
        # Check if logged in
        $status = bw status | ConvertFrom-Json
        if ($status.status -ne 'unlocked') {
            throw "Bitwarden vault is locked. Run: bw unlock"
        }
        
        $itemJson = bw get item $Item
        $itemObj = $itemJson | ConvertFrom-Json
        
        switch ($Field) {
            'password' { return $itemObj.login.password }
            'username' { return $itemObj.login.username }
            'notes' { return $itemObj.notes }
            default { 
                $customField = $itemObj.fields | Where-Object { $_.name -eq $Field }
                return $customField.value
            }
        }
    }
    catch {
        Write-Error "Failed to retrieve Bitwarden secret '$Item': $($_.Exception.Message)"
        return $null
    }
}

# Universal Secret Retrieval
function Get-Secret {
    <#
    .SYNOPSIS
    Universal secret retrieval that tries multiple secret managers
    
    .PARAMETER Key
    The secret key/item to retrieve
    
    .PARAMETER Source
    Preferred source: infisical, 1password, bitwarden, or auto (tries all)
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Key,
        [ValidateSet('infisical', '1password', 'bitwarden', 'auto')]
        [string]$Source = 'auto',
        [string]$Environment = 'dev'
    )
    
    switch ($Source) {
        'infisical' {
            return Get-InfisicalSecret -Key $Key -Environment $Environment
        }
        '1password' {
            return Get-1PasswordSecret -Item $Key
        }
        'bitwarden' {
            return Get-BitwardenSecret -Item $Key
        }
        'auto' {
            # Try Infisical first (for NYRA development secrets)
            $value = Get-InfisicalSecret -Key $Key -Environment $Environment -ErrorAction SilentlyContinue
            if ($value) { return $value }
            
            # Then try 1Password
            $value = Get-1PasswordSecret -Item $Key -ErrorAction SilentlyContinue
            if ($value) { return $value }
            
            # Finally try Bitwarden
            $value = Get-BitwardenSecret -Item $Key -ErrorAction SilentlyContinue
            if ($value) { return $value }
            
            Write-Warning "Secret '$Key' not found in any configured secret manager"
            return $null
        }
    }
}

# Environment Setup for NYRA
function Initialize-NYRASecrets {
    <#
    .SYNOPSIS
    Initializes all NYRA-specific secrets and environment variables
    #>
    param(
        [ValidateSet('dev', 'staging', 'prod')]
        [string]$Environment = 'dev'
    )
    
    Write-Host "Initializing NYRA secrets for $Environment environment..." -ForegroundColor Cyan
    
    try {
        # Load base environment from Infisical
        Load-InfisicalEnv -Environment $Environment
        
        # Set NYRA-specific environment variables
        $env:NYRA_ENV = $Environment
        $env:NYRA_LOG_LEVEL = if ($Environment -eq 'dev') { 'debug' } else { 'info' }
        
        # Load additional secrets for specific NYRA components
        $nyraSecrets = @(
            'NYRA_DATABASE_URL',
            'NYRA_REDIS_URL', 
            'NYRA_API_KEY',
            'NYRA_WEBHOOK_SECRET',
            'ELEVENLABS_API_KEY',
            'OPENAI_API_KEY'
        )
        
        foreach ($secretKey in $nyraSecrets) {
            $value = Get-Secret -Key $secretKey -Environment $Environment
            if ($value) {
                [Environment]::SetEnvironmentVariable($secretKey, $value, 'Process')
            }
        }
        
        Write-Host "✅ NYRA secrets initialized for $Environment" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to initialize NYRA secrets: $($_.Exception.Message)"
    }
}

# Aliases for convenience
Set-Alias get-secret Get-Secret
Set-Alias load-secrets Load-InfisicalEnv
Set-Alias init-nyra-secrets Initialize-NYRASecrets

Export-ModuleMember -Function Load-InfisicalEnv, Get-InfisicalSecret, Set-InfisicalSecret, Get-1PasswordSecret, Get-BitwardenSecret, Get-Secret, Initialize-NYRASecrets -Alias get-secret, load-secrets, init-nyra-secrets
