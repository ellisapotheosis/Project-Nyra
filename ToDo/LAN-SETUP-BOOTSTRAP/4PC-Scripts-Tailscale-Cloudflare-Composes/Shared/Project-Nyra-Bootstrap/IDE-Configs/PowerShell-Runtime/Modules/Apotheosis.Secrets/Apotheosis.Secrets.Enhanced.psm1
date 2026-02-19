<#
.SYNOPSIS
Enhanced Apotheosis Secrets Module - Comprehensive secret management with persistent environment variables

.DESCRIPTION
Advanced secret management system providing:
- Persistent environment variable storage and retrieval
- Multi-source secret management (Infisical, Bitwarden, 1Password)  
- Automatic synchronization between secret stores
- Secure local caching with encryption
- CLI integration with aliases and shortcuts
- NYRA project-specific secret management
- Auto-loading of secrets on profile startup
#>

# Global configuration
$script:SecretsConfig = @{
    CacheDir = "$env:APPDATA\NYRA\Secrets"
    MaxCacheAge = 3600  # 1 hour in seconds
    AutoSync = $true
    PreferredSource = "infisical"
    EncryptCache = $true
}

# Secret source priority order
$script:SourcePriority = @('infisical', '1password', 'bitwarden', 'environment', 'cache')

function Initialize-SecretsSystem {
    <#
    .SYNOPSIS
    Initializes the secrets management system
    #>
    
    Write-Host "🔐 Initializing NYRA Secrets Management System..." -ForegroundColor Magenta
    
    # Create cache directory
    if (-not (Test-Path $script:SecretsConfig.CacheDir)) {
        New-Item -ItemType Directory -Path $script:SecretsConfig.CacheDir -Force | Out-Null
    }
    
    # Test CLI availability
    Test-SecretsCLIs
    
    # Load cached secrets into environment
    Import-CachedSecrets
    
    Write-Host "✅ Secrets system initialized" -ForegroundColor Green
}

function Test-SecretsCLIs {
    <#
    .SYNOPSIS
    Tests availability of secret management CLIs
    #>
    
    $cliStatus = @{}
    
    # Test Infisical
    try {
        $null = & infisical --version 2>$null
        $cliStatus.infisical = $true
        Write-Host "✅ Infisical CLI available" -ForegroundColor Green
    } catch {
        $cliStatus.infisical = $false
        Write-Host "⚠️ Infisical CLI not found" -ForegroundColor Yellow
    }
    
    # Test 1Password
    try {
        $null = & op --version 2>$null
        $cliStatus.'1password' = $true
        Write-Host "✅ 1Password CLI available" -ForegroundColor Green
    } catch {
        $cliStatus.'1password' = $false
        Write-Host "⚠️ 1Password CLI not found" -ForegroundColor Yellow
    }
    
    # Test Bitwarden
    try {
        $null = & bw --version 2>$null
        $cliStatus.bitwarden = $true
        Write-Host "✅ Bitwarden CLI available" -ForegroundColor Green
    } catch {
        $cliStatus.bitwarden = $false
        Write-Host "⚠️ Bitwarden CLI not found" -ForegroundColor Yellow
    }
    
    $script:CLIStatus = $cliStatus
}

function Get-SecretFromInfisical {
    param(
        [Parameter(Mandatory)]
        [string]$SecretKey,
        [string]$Environment = "dev"
    )
    
    if (-not $script:CLIStatus.infisical) {
        return $null
    }
    
    try {
        $result = & infisical secrets get $SecretKey --env=$Environment --format=json 2>$null | ConvertFrom-Json
        return $result.value
    } catch {
        Write-Verbose "Failed to get secret from Infisical: $($_.Exception.Message)"
        return $null
    }
}

function Get-SecretFrom1Password {
    param(
        [Parameter(Mandatory)]
        [string]$SecretKey,
        [string]$Vault = "Private"
    )
    
    if (-not $script:CLIStatus.'1password') {
        return $null
    }
    
    try {
        # Try different common field names
        $fieldNames = @('password', 'credential', 'token', 'key', 'secret')
        
        foreach ($field in $fieldNames) {
            try {
                $result = & op item get $SecretKey --vault=$Vault --field=$field 2>$null
                if ($result -and $result -ne "") {
                    return $result
                }
            } catch {
                continue
            }
        }
        
        # Fallback: get the first field value
        $item = & op item get $SecretKey --vault=$Vault --format=json 2>$null | ConvertFrom-Json
        if ($item.fields -and $item.fields.Count -gt 0) {
            return $item.fields[0].value
        }
        
    } catch {
        Write-Verbose "Failed to get secret from 1Password: $($_.Exception.Message)"
    }
    
    return $null
}

function Get-SecretFromBitwarden {
    param(
        [Parameter(Mandatory)]
        [string]$SecretKey
    )
    
    if (-not $script:CLIStatus.bitwarden) {
        return $null
    }
    
    try {
        # Check if logged in and unlocked
        $status = & bw status | ConvertFrom-Json
        if (-not $status.loggedIn) {
            Write-Verbose "Bitwarden not logged in"
            return $null
        }
        if (-not $status.unlocked) {
            Write-Verbose "Bitwarden vault locked"
            return $null
        }
        
        # Search for the item
        $items = & bw list items --search $SecretKey | ConvertFrom-Json
        $item = $items | Where-Object { $_.name -eq $SecretKey -or $_.id -eq $SecretKey } | Select-Object -First 1
        
        if ($item) {
            if ($item.type -eq 1) {  # Login item
                return $item.login.password
            } elseif ($item.type -eq 2) {  # Secure note
                return $item.notes
            } elseif ($item.fields) {  # Custom fields
                $field = $item.fields | Where-Object { $_.name -eq "value" -or $_.name -eq "secret" } | Select-Object -First 1
                if ($field) {
                    return $field.value
                }
            }
        }
        
    } catch {
        Write-Verbose "Failed to get secret from Bitwarden: $($_.Exception.Message)"
    }
    
    return $null
}

function Get-SecretFromCache {
    param(
        [Parameter(Mandatory)]
        [string]$SecretKey
    )
    
    $cacheFile = Join-Path $script:SecretsConfig.CacheDir "$SecretKey.json"
    
    if (-not (Test-Path $cacheFile)) {
        return $null
    }
    
    try {
        $cacheData = Get-Content $cacheFile | ConvertFrom-Json
        
        # Check if cache is expired
        $cacheAge = (Get-Date) - [datetime]$cacheData.timestamp
        if ($cacheAge.TotalSeconds -gt $script:SecretsConfig.MaxCacheAge) {
            Remove-Item $cacheFile -Force
            return $null
        }
        
        # Decrypt if needed
        if ($script:SecretsConfig.EncryptCache -and $cacheData.encrypted) {
            return Decrypt-SecretValue $cacheData.value
        } else {
            return $cacheData.value
        }
        
    } catch {
        Write-Verbose "Failed to read cached secret: $($_.Exception.Message)"
        return $null
    }
}

function Set-SecretToCache {
    param(
        [Parameter(Mandatory)]
        [string]$SecretKey,
        [Parameter(Mandatory)]
        [string]$SecretValue,
        [string]$Source = "unknown"
    )
    
    $cacheFile = Join-Path $script:SecretsConfig.CacheDir "$SecretKey.json"
    
    try {
        $value = $SecretValue
        $encrypted = $false
        
        # Encrypt if enabled
        if ($script:SecretsConfig.EncryptCache) {
            $value = Encrypt-SecretValue $SecretValue
            $encrypted = $true
        }
        
        $cacheData = @{
            key = $SecretKey
            value = $value
            source = $Source
            timestamp = (Get-Date).ToString("o")
            encrypted = $encrypted
        }
        
        $cacheData | ConvertTo-Json | Out-File $cacheFile -Encoding UTF8
        
    } catch {
        Write-Verbose "Failed to cache secret: $($_.Exception.Message)"
    }
}

function Encrypt-SecretValue {
    param([string]$Value)
    
    try {
        # Use Windows DPAPI for encryption
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
        $encrypted = [System.Security.Cryptography.ProtectedData]::Protect($bytes, $null, [System.Security.Cryptography.DataProtectionScope]::CurrentUser)
        return [Convert]::ToBase64String($encrypted)
    } catch {
        Write-Verbose "Encryption failed, storing in plain text"
        return $Value
    }
}

function Decrypt-SecretValue {
    param([string]$EncryptedValue)
    
    try {
        $bytes = [Convert]::FromBase64String($EncryptedValue)
        $decrypted = [System.Security.Cryptography.ProtectedData]::Unprotect($bytes, $null, [System.Security.Cryptography.DataProtectionScope]::CurrentUser)
        return [System.Text.Encoding]::UTF8.GetString($decrypted)
    } catch {
        Write-Verbose "Decryption failed"
        return $EncryptedValue
    }
}

function Get-Secret {
    <#
    .SYNOPSIS
    Universal secret retrieval function with source fallback
    
    .PARAMETER SecretKey
    The key/name of the secret to retrieve
    
    .PARAMETER Source
    Preferred source (infisical, 1password, bitwarden, environment, cache)
    
    .PARAMETER Environment
    Environment for Infisical (dev, staging, prod)
    
    .PARAMETER SetEnvironmentVariable
    Automatically set as environment variable
    
    .PARAMETER Force
    Force refresh from source, ignore cache
    #>
    param(
        [Parameter(Mandatory)]
        [string]$SecretKey,
        
        [ValidateSet('infisical', '1password', 'bitwarden', 'environment', 'cache', 'auto')]
        [string]$Source = 'auto',
        
        [string]$Environment = 'dev',
        
        [switch]$SetEnvironmentVariable,
        
        [switch]$Force
    )
    
    $secretValue = $null
    $sourceUsed = $null
    
    # Check environment variables first if not forcing
    if (-not $Force) {
        $envValue = [Environment]::GetEnvironmentVariable($SecretKey, "User")
        if (-not $envValue) {
            $envValue = [Environment]::GetEnvironmentVariable($SecretKey, "Process")
        }
        if ($envValue) {
            Write-Verbose "Secret found in environment variables"
            return $envValue
        }
    }
    
    # Determine source order
    $sourcesToTry = if ($Source -eq 'auto') {
        $script:SourcePriority
    } else {
        @($Source) + ($script:SourcePriority | Where-Object { $_ -ne $Source })
    }
    
    foreach ($currentSource in $sourcesToTry) {
        if ($Force -and $currentSource -eq 'cache') {
            continue  # Skip cache when forcing
        }
        
        switch ($currentSource) {
            'infisical' {
                $secretValue = Get-SecretFromInfisical -SecretKey $SecretKey -Environment $Environment
                $sourceUsed = 'infisical'
            }
            '1password' {
                $secretValue = Get-SecretFrom1Password -SecretKey $SecretKey
                $sourceUsed = '1password'
            }
            'bitwarden' {
                $secretValue = Get-SecretFromBitwarden -SecretKey $SecretKey
                $sourceUsed = 'bitwarden'
            }
            'environment' {
                $secretValue = [Environment]::GetEnvironmentVariable($SecretKey)
                $sourceUsed = 'environment'
            }
            'cache' {
                $secretValue = Get-SecretFromCache -SecretKey $SecretKey
                $sourceUsed = 'cache'
            }
        }
        
        if ($secretValue) {
            Write-Verbose "Secret '$SecretKey' retrieved from $sourceUsed"
            
            # Cache the secret if it's not from cache
            if ($sourceUsed -ne 'cache' -and $sourceUsed -ne 'environment') {
                Set-SecretToCache -SecretKey $SecretKey -SecretValue $secretValue -Source $sourceUsed
            }
            
            # Set environment variable if requested
            if ($SetEnvironmentVariable) {
                Set-PersistentEnvironmentVariable -Name $SecretKey -Value $secretValue
            }
            
            return $secretValue
        }
    }
    
    Write-Warning "Secret '$SecretKey' not found in any source"
    return $null
}

function Set-PersistentEnvironmentVariable {
    <#
    .SYNOPSIS
    Sets a persistent environment variable for the current user
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Name,
        [Parameter(Mandatory)]
        [string]$Value,
        [ValidateSet('User', 'Machine', 'Process')]
        [string]$Scope = 'User'
    )
    
    try {
        [Environment]::SetEnvironmentVariable($Name, $Value, $Scope)
        
        # Also set in current session
        Set-Item -Path "env:$Name" -Value $Value
        
        Write-Host "✅ Environment variable '$Name' set persistently ($Scope scope)" -ForegroundColor Green
        
    } catch {
        Write-Error "Failed to set environment variable '$Name': $($_.Exception.Message)"
    }
}

function Get-PersistentEnvironmentVariable {
    <#
    .SYNOPSIS
    Gets a persistent environment variable, checking User then Machine scope
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )
    
    # Try User scope first
    $value = [Environment]::GetEnvironmentVariable($Name, "User")
    if ($value) {
        return $value
    }
    
    # Try Machine scope
    $value = [Environment]::GetEnvironmentVariable($Name, "Machine")
    if ($value) {
        return $value
    }
    
    # Try current process
    return [Environment]::GetEnvironmentVariable($Name, "Process")
}

function Initialize-NYRASecrets {
    <#
    .SYNOPSIS
    Loads all NYRA-specific secrets and sets them as environment variables
    #>
    param(
        [string]$Environment = 'dev'
    )
    
    Write-Host "🔐 Loading NYRA secrets for $Environment environment..." -ForegroundColor Cyan
    
    # Define NYRA secret keys
    $nyraSecrets = @(
        'NYRA_API_KEY',
        'NYRA_DATABASE_URL', 
        'NYRA_REDIS_URL',
        'NYRA_JWT_SECRET',
        'NYRA_ENCRYPTION_KEY',
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY',
        'ELEVENLABS_API_KEY',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'INFISICAL_TOKEN',
        'GITHUB_TOKEN',
        'DOCKER_REGISTRY_TOKEN'
    )
    
    $loadedCount = 0
    
    foreach ($secretKey in $nyraSecrets) {
        try {
            $secretValue = Get-Secret -SecretKey $secretKey -Environment $Environment -SetEnvironmentVariable
            if ($secretValue) {
                $loadedCount++
                Write-Host "  ✅ $secretKey" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️ $secretKey (not found)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ❌ $secretKey (error: $($_.Exception.Message))" -ForegroundColor Red
        }
    }
    
    Write-Host "📊 Loaded $loadedCount/$($nyraSecrets.Count) NYRA secrets" -ForegroundColor Cyan
}

function Sync-SecretsToSources {
    <#
    .SYNOPSIS
    Synchronizes secrets between different secret management sources
    #>
    param(
        [ValidateSet('infisical', '1password', 'bitwarden')]
        [string]$SourceProvider = 'infisical',
        
        [ValidateSet('infisical', '1password', 'bitwarden')]
        [string[]]$TargetProviders = @('bitwarden'),
        
        [string]$Environment = 'dev'
    )
    
    Write-Host "🔄 Synchronizing secrets from $SourceProvider to $($TargetProviders -join ', ')..." -ForegroundColor Cyan
    
    # Get list of secrets from source
    $sourceSecrets = @()
    
    try {
        if ($SourceProvider -eq 'infisical') {
            $secrets = & infisical secrets --env=$Environment --format=json | ConvertFrom-Json
            $sourceSecrets = $secrets | ForEach-Object { @{Key = $_.key; Value = $_.value} }
        }
        
        Write-Host "📊 Found $($sourceSecrets.Count) secrets in $SourceProvider" -ForegroundColor Info
        
        foreach ($target in $TargetProviders) {
            $syncCount = 0
            
            foreach ($secret in $sourceSecrets) {
                try {
                    switch ($target) {
                        'bitwarden' {
                            # Create secure note in Bitwarden
                            $item = @{
                                type = 2  # Secure note
                                name = $secret.Key
                                notes = $secret.Value
                                secureNote = @{ type = 0 }
                                folderId = $null
                            } | ConvertTo-Json -Compress | & bw encode
                            
                            # Check if item exists
                            $existing = & bw list items --search $secret.Key | ConvertFrom-Json | Where-Object { $_.name -eq $secret.Key } | Select-Object -First 1
                            
                            if ($existing) {
                                & bw edit item $existing.id $item | Out-Null
                            } else {
                                & bw create item $item | Out-Null
                            }
                            
                            $syncCount++
                        }
                        '1password' {
                            # Create item in 1Password (would need specific op commands)
                            Write-Verbose "1Password sync not yet implemented"
                        }
                    }
                } catch {
                    Write-Warning "Failed to sync secret '$($secret.Key)' to $target: $($_.Exception.Message)"
                }
            }
            
            Write-Host "✅ Synced $syncCount secrets to $target" -ForegroundColor Green
        }
        
    } catch {
        Write-Error "Sync failed: $($_.Exception.Message)"
    }
}

function Clear-SecretsCache {
    <#
    .SYNOPSIS
    Clears the local secrets cache
    #>
    param([switch]$Force)
    
    if (-not $Force) {
        $confirm = Read-Host "Are you sure you want to clear the secrets cache? (y/N)"
        if ($confirm -ne 'y' -and $confirm -ne 'Y') {
            Write-Host "Cache clear cancelled" -ForegroundColor Yellow
            return
        }
    }
    
    try {
        if (Test-Path $script:SecretsConfig.CacheDir) {
            Remove-Item $script:SecretsConfig.CacheDir -Recurse -Force
            New-Item -ItemType Directory -Path $script:SecretsConfig.CacheDir -Force | Out-Null
            Write-Host "✅ Secrets cache cleared" -ForegroundColor Green
        }
    } catch {
        Write-Error "Failed to clear cache: $($_.Exception.Message)"
    }
}

function Import-CachedSecrets {
    <#
    .SYNOPSIS
    Imports cached secrets as environment variables
    #>
    
    if (-not (Test-Path $script:SecretsConfig.CacheDir)) {
        return
    }
    
    $cacheFiles = Get-ChildItem $script:SecretsConfig.CacheDir -Filter "*.json"
    $importCount = 0
    
    foreach ($file in $cacheFiles) {
        try {
            $secretKey = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
            $secretValue = Get-SecretFromCache -SecretKey $secretKey
            
            if ($secretValue) {
                # Only set if not already in environment
                if (-not [Environment]::GetEnvironmentVariable($secretKey)) {
                    Set-Item -Path "env:$secretKey" -Value $secretValue
                    $importCount++
                }
            }
        } catch {
            Write-Verbose "Failed to import cached secret $($file.Name): $($_.Exception.Message)"
        }
    }
    
    if ($importCount -gt 0) {
        Write-Host "📥 Imported $importCount cached secrets to environment" -ForegroundColor Cyan
    }
}

# Convenient aliases and shortcuts
Set-Alias get-secret Get-Secret
Set-Alias set-env Set-PersistentEnvironmentVariable
Set-Alias load-secrets Initialize-NYRASecrets
Set-Alias init-nyra-secrets Initialize-NYRASecrets
Set-Alias sync-secrets Sync-SecretsToSources
Set-Alias clear-secrets-cache Clear-SecretsCache

# Auto-initialize on module load
Initialize-SecretsSystem

# Export all functions and aliases
Export-ModuleMember -Function Get-Secret, Set-PersistentEnvironmentVariable, Get-PersistentEnvironmentVariable, Initialize-NYRASecrets, Sync-SecretsToSources, Clear-SecretsCache, Import-CachedSecrets -Alias get-secret, set-env, load-secrets, init-nyra-secrets, sync-secrets, clear-secrets-cache