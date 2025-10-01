# NYRA Environment Setup - Pull secrets from Infisical into local .env
# Usage: .\scripts\setup-env.ps1 [Environment] [OutputFile]

param(
    [string]$Environment = "dev",
    [string]$OutputFile = ".env.development",
    [switch]$Help
)

if ($Help) {
    Write-Host "🌍 NYRA Environment Setup" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pull secrets from Infisical into local .env file:" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\scripts\setup-env.ps1                           # dev -> .env.development"
    Write-Host "  .\scripts\setup-env.ps1 prod .env.production      # prod -> .env.production"
    Write-Host "  .\scripts\setup-env.ps1 staging                   # staging -> .env.development"
    Write-Host ""
    Write-Host "Features:" -ForegroundColor Blue
    Write-Host "  • Pulls all secrets from Infisical environment"
    Write-Host "  • Creates properly formatted .env file"
    Write-Host "  • Backs up existing .env file"
    Write-Host "  • Validates Infisical connection"
    exit 0
}

Write-Host "🌍 NYRA Environment Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Validate Infisical setup
function Test-InfisicalSetup {
    try {
        infisical user get token >$null 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Not logged in"
        }
        
        if (!(Test-Path ".infisical.json")) {
            Write-Host "❌ Infisical project not initialized" -ForegroundColor Red
            Write-Host "Run: infisical init" -ForegroundColor Yellow
            return $false
        }
        return $true
    }
    catch {
        Write-Host "❌ Infisical not accessible" -ForegroundColor Red
        Write-Host "Run: infisical login" -ForegroundColor Yellow
        return $false
    }
}

if (!(Test-InfisicalSetup)) {
    exit 1
}

Write-Host "✅ Infisical setup verified" -ForegroundColor Green
Write-Host "📁 Environment: $Environment" -ForegroundColor Blue
Write-Host "📄 Output file: $OutputFile" -ForegroundColor Blue

# Backup existing file if it exists
if (Test-Path $OutputFile) {
    $backupFile = "$OutputFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Host "💾 Backing up existing file to: $backupFile" -ForegroundColor Yellow
    Copy-Item $OutputFile $backupFile
}

Write-Host "`n🔄 Pulling secrets from Infisical..." -ForegroundColor Green

try {
    # Get all secrets from Infisical
    $secretsOutput = infisical secrets get --env $Environment 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to retrieve secrets: $secretsOutput" -ForegroundColor Red
        exit 1
    }
    
    # Create .env content
    $envContent = @()
    $envContent += "# NYRA Environment Variables - Generated from Infisical"
    $envContent += "# Environment: $Environment"
    $envContent += "# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $envContent += "# WARNING: This file contains secrets - never commit to git"
    $envContent += ""
    
    # Parse the table output and extract secrets
    $secretCount = 0
    $secretsOutput | ForEach-Object {
        if ($_ -match "│\s+([^│]+?)\s+│\s+([^│]+?)\s+│\s+[^│]+\s+│") {
            $secretName = $matches[1].Trim()
            $secretValue = $matches[2].Trim()
            
            # Skip header row
            if ($secretName -ne "SECRET NAME" -and $secretName -ne "─") {
                $envContent += "$secretName=$secretValue"
                $secretCount++
            }
        }
    }
    
    if ($secretCount -eq 0) {
        Write-Host "⚠️  No secrets found in environment '$Environment'" -ForegroundColor Yellow
        Write-Host "Use the swap-secret script to add secrets first:" -ForegroundColor Blue
        Write-Host "  .\scripts\swap-secret.ps1" -ForegroundColor Blue
        exit 1
    }
    
    # Write to file
    $envContent | Out-File -FilePath $OutputFile -Encoding UTF8
    
    Write-Host "✅ Successfully created $OutputFile with $secretCount secrets" -ForegroundColor Green
    Write-Host "   Environment: $Environment" -ForegroundColor DarkGray
    Write-Host "   File size: $(Get-Item $OutputFile | Select-Object -ExpandProperty Length) bytes" -ForegroundColor DarkGray
    
    # Show summary (with masked values)
    Write-Host "`n📋 Loaded secrets:" -ForegroundColor Blue
    Get-Content $OutputFile | ForEach-Object {
        if ($_ -match "^([^=]+)=(.+)$") {
            $name = $matches[1]
            $value = $matches[2]
            $masked = if ($value.Length -le 8) { "*" * $value.Length } 
                     else { $value.Substring(0, 4) + "*" * ($value.Length - 8) + $value.Substring($value.Length - 4) }
            Write-Host "  • $name = $masked" -ForegroundColor DarkGray
        }
    }
    
    Write-Host "`n🎉 Environment setup complete!" -ForegroundColor Green
    Write-Host "You can now run your application with these secrets." -ForegroundColor White
    
}
catch {
    Write-Host "❌ Error setting up environment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}