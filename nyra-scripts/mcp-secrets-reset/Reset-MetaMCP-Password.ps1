#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick MetaMCP Password Reset for Running Instance
    
.DESCRIPTION
    Resets the password for your running MetaMCP instance using database access
    
.PARAMETER Email
    Email address to reset password for
    
.PARAMETER NewPassword
    New password to set (will be hashed automatically)
    
.EXAMPLE
    .\Reset-MetaMCP-Password.ps1 -Email "your@email.com" -NewPassword "newpassword123"
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$Email,
    
    [Parameter(Mandatory = $true)]
    [string]$NewPassword
)

Write-Host "🔐 Resetting MetaMCP Password..." -ForegroundColor Cyan

# Check if containers are running
$metamcpPg = docker ps --filter "name=metamcp-pg" --format "{{.Names}}"
if (-not $metamcpPg) {
    Write-Error "❌ MetaMCP PostgreSQL container not found or not running!"
    Write-Host "Run: docker ps to check running containers" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found PostgreSQL container: $metamcpPg" -ForegroundColor Green

# Generate password hash (bcrypt compatible)
Write-Host "🔨 Generating password hash..." -ForegroundColor Yellow

# Create a temporary Node.js script to generate bcrypt hash
$hashScript = @"
const bcrypt = require('bcrypt');
const password = process.argv[2];
const hash = bcrypt.hashSync(password, 12);
console.log(hash);
"@

# Write the script to a temp file
$tempDir = $env:TEMP
$tempScript = "$tempDir\generate-hash.js"
Set-Content -Path $tempScript -Value $hashScript

# Generate the hash using Node.js in the MetaMCP container
Write-Host "🔐 Generating secure password hash..." -ForegroundColor Yellow
try {
    $passwordHash = docker exec metamcp node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('$NewPassword', 12));"
    if (-not $passwordHash) {
        throw "Failed to generate password hash"
    }
    Write-Host "✅ Password hash generated" -ForegroundColor Green
}
catch {
    Write-Error "❌ Failed to generate password hash: $_"
    exit 1
}

# Reset password in database
Write-Host "🔄 Updating password in database..." -ForegroundColor Yellow

$sqlCommand = "UPDATE users SET password = '$passwordHash' WHERE email = '$Email';"

try {
    # Execute SQL command
    $result = docker exec -i $metamcpPg psql -U postgres -d metamcp -c "$sqlCommand"
    
    if ($result -match "UPDATE 1") {
        Write-Host "✅ Password updated successfully!" -ForegroundColor Green
        Write-Host "🚀 You can now log in to MetaMCP at http://localhost:12008" -ForegroundColor Cyan
        Write-Host "   Email: $Email" -ForegroundColor White
        Write-Host "   Password: $NewPassword" -ForegroundColor White
    }
    elseif ($result -match "UPDATE 0") {
        Write-Warning "⚠️  No user found with email: $Email"
        Write-Host "Creating new admin user..." -ForegroundColor Yellow
        
        # Create new user
        $createUserSql = "INSERT INTO users (id, email, password, name, role, created_at, updated_at) VALUES (gen_random_uuid(), '$Email', '$passwordHash', 'Admin User', 'admin', NOW(), NOW());"
        $createResult = docker exec -i $metamcpPg psql -U postgres -d metamcp -c "$createUserSql"
        
        if ($createResult -match "INSERT") {
            Write-Host "✅ New admin user created!" -ForegroundColor Green
            Write-Host "🚀 You can now log in to MetaMCP at http://localhost:12008" -ForegroundColor Cyan
            Write-Host "   Email: $Email" -ForegroundColor White
            Write-Host "   Password: $NewPassword" -ForegroundColor White
        }
        else {
            Write-Error "❌ Failed to create new user"
            exit 1
        }
    }
    else {
        Write-Error "❌ Unexpected result from database update"
        exit 1
    }
}
catch {
    Write-Error "❌ Failed to update password: $_"
    Write-Host "💡 Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Check if database is accessible: docker exec -it $metamcpPg psql -U postgres -d metamcp -c '\dt'" -ForegroundColor White
    Write-Host "2. Check user table: docker exec -it $metamcpPg psql -U postgres -d metamcp -c 'SELECT email FROM users;'" -ForegroundColor White
    exit 1
}

# Clean up temp file
Remove-Item -Path $tempScript -Force -ErrorAction SilentlyContinue

Write-Host "`n🎉 MetaMCP password reset complete!" -ForegroundColor Green
Write-Host "🌐 Access MetaMCP: http://localhost:12008" -ForegroundColor Cyan