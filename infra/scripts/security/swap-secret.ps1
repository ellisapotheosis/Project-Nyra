# NYRA Secret Swapper - Interactive Infisical Secret Replacement
# Usage: .\scripts\swap-secret.ps1 [SecretName] [NewValue]

param(
    [string]$SecretName,
    [string]$NewValue,
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev"
)

. "$PSScriptRoot\..\..\..\scripts\lib\InfisicalToken.ps1"
$projectId = Get-NyraInfisicalProjectId

Write-Host "🔄 NYRA Secret Swapper" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

# Helper function to mask secret values for display
function Mask-Secret($value) {
    if ($value.Length -le 8) {
        return "*" * $value.Length
    }
    return $value.Substring(0, 4) + "*" * ($value.Length - 8) + $value.Substring($value.Length - 4)
}

# Helper function to validate Infisical setup
function Test-InfisicalSetup {
    try {
        Assert-NyraInfisicalToken
        return $true
    }
    catch {
        Write-Host "❌ $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Interactive mode if no parameters provided
if (-not $SecretName) {
    Write-Host "`n🎯 Interactive Secret Replacement Mode" -ForegroundColor Green
    
    # Check Infisical setup
    if (!(Test-InfisicalSetup)) {
        exit 1
    }
    
    # Show current secrets (masked)
    Write-Host "`n📋 Current secrets in '$Environment' environment:" -ForegroundColor Blue
    try {
        $secretsList = & infisical secrets list --projectId $projectId --env $Environment --format json 2>$null | ConvertFrom-Json
        if ($secretsList) {
            $secretsList.secrets | ForEach-Object {
                if ($_.secretKey -and $_.secretValue) {
                    $name = $_.secretKey
                    $value = $_.secretValue
                    $maskedValue = Mask-Secret $value
                    Write-Host "   $name = $maskedValue" -ForegroundColor DarkGray
                }
            }
        }
    }
    catch {
        Write-Host "   Could not retrieve secrets list" -ForegroundColor DarkRed
    }
    
    Write-Host "`n" -NoNewline
    $SecretName = Read-Host "Enter secret name to update (or 'quit' to exit)"
    
    if ($SecretName -eq 'quit' -or $SecretName -eq 'q') {
        Write-Host "👋 Exiting secret swapper" -ForegroundColor Yellow
        exit 0
    }
    
    if (-not $SecretName) {
        Write-Host "❌ Secret name cannot be empty" -ForegroundColor Red
        exit 1
    }
    
    # Get current value (masked for confirmation)
    try {
        $currentValue = Get-NyraInfisicalSecret -SecretName $SecretName -Environment $Environment -ProjectId $projectId -ExtraArgs @("--plain") 2>$null
        if ($currentValue) {
            $maskedCurrent = Mask-Secret $currentValue
            Write-Host "Current value: $maskedCurrent" -ForegroundColor DarkGray
        }
    }
    catch {
        Write-Host "Secret '$SecretName' not found (will be created)" -ForegroundColor Yellow
    }
    
    Write-Host "`n" -NoNewline
    $SecureNewValue = Read-Host "Enter new secret value" -AsSecureString
    
    # Convert SecureString back to plain text for Infisical
    $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureNewValue)
    $NewValue = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    
    if (-not $NewValue) {
        Write-Host "❌ Secret value cannot be empty" -ForegroundColor Red
        exit 1
    }
}

# Validate inputs
if (-not $SecretName -or -not $NewValue) {
    Write-Host "❌ Usage: .\scripts\swap-secret.ps1 <SecretName> <NewValue> [Environment]" -ForegroundColor Red
    Write-Host "   Example: .\scripts\swap-secret.ps1 GITHUB_TOKEN ghp_newtoken123" -ForegroundColor Yellow
    Write-Host "   Or run without parameters for interactive mode" -ForegroundColor Yellow
    exit 1
}

# Check Infisical setup if not in interactive mode
if (-not (Test-InfisicalSetup)) {
    exit 1
}

Write-Host "`n🔄 Updating secret..." -ForegroundColor Green

try {
    # Update the secret in Infisical
    $result = Set-NyraInfisicalSecret -Name $SecretName -Value $NewValue -Environment $Environment -Path "" -ProjectId $projectId 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $maskedNew = Mask-Secret $NewValue
        Write-Host "✅ Successfully updated '$SecretName' = $maskedNew" -ForegroundColor Green
        
        # Show confirmation
        Write-Host "   Environment: $Environment" -ForegroundColor DarkGray
        Write-Host "   Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkGray
        
        # Ask if user wants to update another secret
        Write-Host "`n" -NoNewline
        $continue = Read-Host "Update another secret? (y/N)"
        if ($continue -eq 'y' -or $continue -eq 'Y' -or $continue -eq 'yes') {
            # Recursive call for next secret
            & $PSCommandPath
        }
    }
    else {
        Write-Host "❌ Failed to update secret: $result" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Error updating secret: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Secret rotation complete!" -ForegroundColor Green
