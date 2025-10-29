#!/usr/bin/env pwsh
<#
.SYNOPSIS
NYRA Claude-Flow New Laptop Setup Script

.DESCRIPTION
Run this script on your new laptop to replicate the complete NYRA claude-flow environment.

.EXAMPLE
.\New-Laptop-Setup.ps1
#>

Write-Host "🚀 NYRA Claude-Flow New Laptop Setup" -ForegroundColor Magenta
Write-Host "====================================" -ForegroundColor Magenta

# Step 1: Create project structure
Write-Host "📁 Creating project structure..." -ForegroundColor Cyan
$projectRoot = "C:\Dev\DevProjects\Personal-Projects\Project-Nyra"
if (-not (Test-Path $projectRoot)) {
    New-Item -ItemType Directory -Path $projectRoot -Force | Out-Null
}
Set-Location $projectRoot

# Step 2: Copy deployment files
Write-Host "📦 Copying deployment files..." -ForegroundColor Cyan
Copy-Item ".\*" $projectRoot -Recurse -Force

# Step 3: Run main setup
Write-Host "⚙️  Running main setup script..." -ForegroundColor Cyan
& .\NYRA-Claude-Flow-Complete-Setup.ps1 -Mode fresh -DeploymentType local

Write-Host "✅ New laptop setup completed!" -ForegroundColor Green
Write-Host "Check the setup report for next steps." -ForegroundColor Gray
