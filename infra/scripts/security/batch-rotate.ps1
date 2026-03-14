# NYRA Batch Secret Rotation - Process multiple secrets efficiently
# Usage: .\scripts\batch-rotate.ps1

param(
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",
    [switch]$FromClipboard,
    [switch]$Help
)

. "$PSScriptRoot\..\..\..\scripts\lib\InfisicalToken.ps1"
$projectId = Get-NyraInfisicalProjectId

if ($Help) {
    Write-Host "🔄 NYRA Batch Secret Rotator" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Process multiple secret rotations efficiently:" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage Options:" -ForegroundColor Yellow
    Write-Host "  .\scripts\batch-rotate.ps1                    # Interactive mode"
    Write-Host "  .\scripts\batch-rotate.ps1 -FromClipboard     # Paste multiple secrets"
    Write-Host "  .\scripts\batch-rotate.ps1 -Environment prod  # Target different env"
    Write-Host ""
    Write-Host "Interactive Format:" -ForegroundColor Blue
    Write-Host "  SECRET_NAME=new_value"
    Write-Host "  ANOTHER_SECRET=another_value"
    Write-Host "  (empty line to finish)"
    Write-Host ""
    Write-Host "Clipboard Format:" -ForegroundColor Blue  
    Write-Host "  Copy lines like: SECRET_NAME=value (one per line)"
    exit 0
}

Write-Host "🔄 NYRA Batch Secret Rotator" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Helper function to mask secret values
function Mask-Secret($value) {
    if ($value.Length -le 8) {
        return "*" * $value.Length
    }
    return $value.Substring(0, 4) + "*" * ($value.Length - 8) + $value.Substring($value.Length - 4)
}

# Validate Infisical setup
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

if (!(Test-InfisicalSetup)) {
    exit 1
}

Write-Host "✅ Infisical setup verified" -ForegroundColor Green
Write-Host "📁 Environment: $Environment" -ForegroundColor Blue

$secretPairs = @()

if ($FromClipboard) {
    Write-Host "`n📋 Reading from clipboard..." -ForegroundColor Yellow
    try {
        $clipboardContent = Get-Clipboard -Raw
        $lines = $clipboardContent -split "`n" | ForEach-Object { $_.Trim() }
        
        foreach ($line in $lines) {
            if ($line -and $line.Contains("=")) {
                $parts = $line -split "=", 2
                if ($parts.Count -eq 2) {
                    $secretPairs += @{
                        Name = $parts[0].Trim()
                        Value = $parts[1].Trim()
                    }
                }
            }
        }
        
        if ($secretPairs.Count -eq 0) {
            Write-Host "❌ No valid secret pairs found in clipboard" -ForegroundColor Red
            Write-Host "Expected format: SECRET_NAME=value (one per line)" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "Found $($secretPairs.Count) secrets to rotate" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error reading clipboard: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "`n🎯 Interactive Batch Mode" -ForegroundColor Green
    Write-Host "Enter secrets in format: SECRET_NAME=value" -ForegroundColor Blue
    Write-Host "Press Enter on empty line when done" -ForegroundColor Blue
    Write-Host ""
    
    do {
        $input = Read-Host "Secret (or press Enter to finish)"
        
        if ($input -and $input.Contains("=")) {
            $parts = $input -split "=", 2
            if ($parts.Count -eq 2) {
                $secretPairs += @{
                    Name = $parts[0].Trim()
                    Value = $parts[1].Trim()
                }
                $maskedValue = Mask-Secret $parts[1].Trim()
                Write-Host "  ✓ Added: $($parts[0].Trim()) = $maskedValue" -ForegroundColor DarkGreen
            }
            else {
                Write-Host "  ❌ Invalid format. Use: SECRET_NAME=value" -ForegroundColor Red
            }
        }
    } while ($input)
}

if ($secretPairs.Count -eq 0) {
    Write-Host "❌ No secrets to process" -ForegroundColor Red
    exit 1
}

# Confirmation
Write-Host "`n📊 Summary:" -ForegroundColor Yellow
Write-Host "  Environment: $Environment" -ForegroundColor White
Write-Host "  Secrets to update: $($secretPairs.Count)" -ForegroundColor White

foreach ($secret in $secretPairs) {
    $maskedValue = Mask-Secret $secret.Value
    Write-Host "    • $($secret.Name) = $maskedValue" -ForegroundColor DarkGray
}

Write-Host "`n" -NoNewline
$confirm = Read-Host "Proceed with batch rotation? (y/N)"

if ($confirm -ne 'y' -and $confirm -ne 'Y' -and $confirm -ne 'yes') {
    Write-Host "❌ Batch rotation cancelled" -ForegroundColor Yellow
    exit 0
}

# Process rotations
Write-Host "`n🔄 Processing batch rotation..." -ForegroundColor Green
$successCount = 0
$failureCount = 0
$results = @()

foreach ($secret in $secretPairs) {
    Write-Host "`n  🔄 Updating $($secret.Name)..." -ForegroundColor Cyan
    
    try {
        $result = Set-NyraInfisicalSecret -Name $secret.Name -Value $secret.Value -Environment $Environment -Path "" -ProjectId $projectId 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ Success" -ForegroundColor Green
            $successCount++
            $results += "✅ $($secret.Name)"
        }
        else {
            Write-Host "    ❌ Failed: $result" -ForegroundColor Red
            $failureCount++
            $results += "❌ $($secret.Name) - $result"
        }
    }
    catch {
        Write-Host "    ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        $failureCount++
        $results += "❌ $($secret.Name) - $($_.Exception.Message)"
    }
    
    # Small delay to avoid rate limiting
    Start-Sleep -Milliseconds 500
}

# Final summary
Write-Host "`n" + ("="*50) -ForegroundColor Cyan
Write-Host "🎉 Batch Rotation Complete!" -ForegroundColor Green
Write-Host ("="*50) -ForegroundColor Cyan

Write-Host "`n📊 Results Summary:" -ForegroundColor Yellow
Write-Host "  ✅ Successful: $successCount" -ForegroundColor Green
Write-Host "  ❌ Failed: $failureCount" -ForegroundColor Red
Write-Host "  📁 Environment: $Environment" -ForegroundColor Blue
Write-Host "  🕐 Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkGray

if ($failureCount -gt 0) {
    Write-Host "`n❌ Failed rotations:" -ForegroundColor Red
    foreach ($result in $results) {
        if ($result.StartsWith("❌")) {
            Write-Host "    $result" -ForegroundColor DarkRed
        }
    }
    Write-Host "`n💡 Tip: Try individual rotation for failed secrets:" -ForegroundColor Yellow
    Write-Host "    .\scripts\swap-secret.ps1" -ForegroundColor Blue
}

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
if ($successCount -gt 0) {
    Write-Host "  • Test your applications with the new secrets" -ForegroundColor White
    Write-Host "  • Monitor for any authentication failures" -ForegroundColor White
    Write-Host "  • Update any local .env files if needed" -ForegroundColor White
}
Write-Host "  • Continue with remaining secret rotations" -ForegroundColor White

Write-Host "`n✅ Batch rotation process complete!" -ForegroundColor Green
