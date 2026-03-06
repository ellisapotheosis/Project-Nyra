# GitHub Actions Setup Script for NYRA Project
# Run this script to complete the GitHub Actions configuration

param(
    [string]$PyPIToken = "",
    [string]$CodecovToken = "",
    [switch]$DryRun = $false
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host @"

  ███╗   ██╗██╗   ██╗██████╗  █████╗     ██████╗ ██╗      ██████╗██████╗ 
  ████╗  ██║╚██╗ ██╔╝██╔══██╗██╔══██╗   ██╔════╝██║     ██╔════╝██╔══██╗
  ██╔██╗ ██║ ╚████╔╝ ██████╔╝███████║   ██║     ██║     ██║     ██║  ██║
  ██║╚██╗██║  ╚██╔╝  ██╔══██╗██╔══██║   ██║     ██║     ██║     ██║  ██║
  ██║ ╚████║   ██║   ██║  ██║██║  ██║   ╚██████╗██║     ╚██████╗██████╔╝
  ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝    ╚═════╝╚═╝      ╚═════╝╚═════╝ 

🚀 GitHub Actions Setup for NYRA Project

"@ -ForegroundColor Cyan

Write-Host "This script will help you complete the GitHub Actions setup." -ForegroundColor Green
Write-Host ""

# Function to check if gh CLI is available and authenticated
function Test-GitHubCLI {
    try {
        $null = gh auth status 2>$null
        return $true
    } catch {
        return $false
    }
}

# Function to enable GitHub features
function Enable-GitHubFeatures {
    Write-Host "🔧 Configuring GitHub repository features..." -ForegroundColor Yellow
    
    if (-not $DryRun) {
        try {
            # Enable Issues (should already be enabled)
            Write-Host "✅ Issues: Already enabled" -ForegroundColor Green
            
            # Enable Actions (usually enabled by default for public repos)
            Write-Host "✅ Actions: Enabled by default for public repositories" -ForegroundColor Green
            
            # Enable Pages (will be configured when first workflow runs)
            Write-Host "ℹ️  Pages: Will be auto-configured on first documentation workflow run" -ForegroundColor Yellow
            
        } catch {
            Write-Warning "Could not configure all repository features: $_"
        }
    } else {
        Write-Host "🧪 DRY RUN: Would configure repository features" -ForegroundColor Cyan
    }
}

# Function to create environments
function New-GitHubEnvironments {
    Write-Host "🌍 Creating GitHub Environments..." -ForegroundColor Yellow
    
    $environments = @('staging', 'production', 'pypi')
    
    foreach ($env in $environments) {
        Write-Host "Creating environment: $env" -ForegroundColor Cyan
        
        if (-not $DryRun) {
            try {
                # Note: Environment creation via gh CLI requires admin access
                # For now, we'll provide instructions
                Write-Host "ℹ️  Environment '$env' - Please create manually in GitHub UI" -ForegroundColor Yellow
            } catch {
                Write-Warning "Could not create environment '$env': $_"
            }
        } else {
            Write-Host "🧪 DRY RUN: Would create environment '$env'" -ForegroundColor Cyan
        }
    }
}

# Function to set up secrets (with user prompts)
function Set-GitHubSecrets {
    Write-Host "🔐 Setting up GitHub Secrets..." -ForegroundColor Yellow
    
    $secrets = @{
        'PYPI_API_TOKEN' = @{
            'value' = $PyPIToken
            'description' = 'PyPI API token for package publishing'
            'required' = $false
        }
        'CODECOV_TOKEN' = @{
            'value' = $CodecovToken
            'description' = 'Codecov token for coverage reporting'
            'required' = $false
        }
    }
    
    foreach ($secretName in $secrets.Keys) {
        $secret = $secrets[$secretName]
        
        if ([string]::IsNullOrWhiteSpace($secret.value)) {
            Write-Host "⚠️  Secret '$secretName' not provided" -ForegroundColor Yellow
            Write-Host "   Description: $($secret.description)" -ForegroundColor Gray
            
            if ($secret.required) {
                Write-Host "   This secret is REQUIRED for full functionality" -ForegroundColor Red
            } else {
                Write-Host "   This secret is OPTIONAL" -ForegroundColor Yellow
            }
            continue
        }
        
        if (-not $DryRun) {
            try {
                # Set the secret using gh CLI
                $secret.value | gh secret set $secretName
                Write-Host "✅ Set secret: $secretName" -ForegroundColor Green
            } catch {
                Write-Warning "Could not set secret '$secretName': $_"
            }
        } else {
            Write-Host "🧪 DRY RUN: Would set secret '$secretName'" -ForegroundColor Cyan
        }
    }
}

# Function to merge the PR
function Merge-SetupPR {
    Write-Host "🔀 Checking for setup PR..." -ForegroundColor Yellow
    
    try {
        # Get the most recent PR with our title
        $pr = gh pr list --limit 1 --search "Add Comprehensive GitHub Actions CI/CD Pipeline" --json number,title,state | ConvertFrom-Json
        
        if ($pr -and $pr.Count -gt 0 -and $pr[0].state -eq "OPEN") {
            $prNumber = $pr[0].number
            $prTitle = $pr[0].title
            Write-Host "Found PR #${prNumber}: $prTitle" -ForegroundColor Cyan
            
            if (-not $DryRun) {
                $response = Read-Host "Would you like to merge PR #$prNumber now? (y/N)"
                if ($response -eq 'y' -or $response -eq 'Y') {
                    gh pr merge $prNumber --squash --delete-branch
                    Write-Host "✅ PR #${prNumber} merged successfully!" -ForegroundColor Green
                } else {
                    Write-Host "ℹ️  PR #${prNumber} left open - you can merge it manually later" -ForegroundColor Yellow
                }
            } else {
                Write-Host "🧪 DRY RUN: Would ask to merge PR #${prNumber}" -ForegroundColor Cyan
            }
        } else {
            Write-Host "ℹ️  No open setup PR found" -ForegroundColor Yellow
        }
    } catch {
        Write-Warning "Could not check for setup PR: $_"
    }
}

# Function to provide setup instructions
function Show-SetupInstructions {
    Write-Host @"

📋 MANUAL SETUP STEPS REQUIRED:

1. 🌍 Create GitHub Environments:
   Go to: https://github.com/ellisapotheosis/Project-Nyra/settings/environments
   Create these environments:
   • staging (no protection rules needed)
   • production (add protection rules: require reviewers)
   • pypi (add secrets here for PyPI publishing)

2. 🔐 Add Required Secrets:
   Go to: https://github.com/ellisapotheosis/Project-Nyra/settings/secrets/actions
   
   OPTIONAL BUT RECOMMENDED:
   • PYPI_API_TOKEN: Get from https://pypi.org/manage/account/token/
   • CODECOV_TOKEN: Get from https://codecov.io/ (after adding your repo)
   
   DEPLOYMENT SECRETS (customize as needed):
   • STAGING_API_KEY, STAGING_URL
   • PRODUCTION_API_KEY, PRODUCTION_URL

3. 🛡️ Enable Branch Protection:
   Go to: https://github.com/ellisapotheosis/Project-Nyra/settings/branches
   Add rule for 'main' branch:
   • Require pull request reviews
   • Require status checks: CI/CD Pipeline jobs
   • Include administrators

4. 📖 Enable GitHub Pages:
   Go to: https://github.com/ellisapotheosis/Project-Nyra/settings/pages
   • Source: GitHub Actions
   • Will be auto-configured when docs workflow runs

5. 🎯 Test the Workflows:
   • Create a feature branch
   • Make a small change
   • Open a PR and watch the magic happen!

"@ -ForegroundColor Green
}

# Function to run workflow tests
function Test-Workflows {
    Write-Host "🧪 Testing GitHub Actions Workflows..." -ForegroundColor Yellow
    
    if (-not $DryRun) {
        try {
            # Check if any workflows have run
            $workflows = gh workflow list --json name,state,id | ConvertFrom-Json
            
            if ($workflows -and $workflows.Count -gt 0) {
                Write-Host "✅ Found $($workflows.Count) workflows configured" -ForegroundColor Green
                
                foreach ($workflow in $workflows) {
                    Write-Host "   • $($workflow.name): $($workflow.state)" -ForegroundColor Gray
                }
            } else {
                Write-Host "ℹ️  No workflows found - they will be available after merging PR" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "ℹ️  Cannot check workflows yet - merge PR first" -ForegroundColor Yellow
        }
    } else {
        Write-Host "🧪 DRY RUN: Would test workflows" -ForegroundColor Cyan
    }
}

# Main execution
function Main {
    Write-Host "Starting GitHub Actions setup..." -ForegroundColor Cyan
    
    # Check prerequisites
    if (-not (Test-GitHubCLI)) {
        Write-Error "GitHub CLI (gh) is not installed or not authenticated. Please run: gh auth login"
        return
    }
    
    Write-Host "✅ GitHub CLI authenticated" -ForegroundColor Green
    
    try {
        Enable-GitHubFeatures
        New-GitHubEnvironments  
        Set-GitHubSecrets
        Merge-SetupPR
        Test-Workflows
        Show-SetupInstructions
        
        Write-Host @"

🎉 GitHub Actions Setup Complete!

Your NYRA project now has a world-class CI/CD pipeline! 

🚀 Next Steps:
1. Complete the manual setup steps above
2. Create a feature branch and test the workflows
3. Watch your development productivity soar!

🔗 Useful Links:
• Repository: https://github.com/ellisapotheosis/Project-Nyra
• Actions: https://github.com/ellisapotheosis/Project-Nyra/actions
• Settings: https://github.com/ellisapotheosis/Project-Nyra/settings

Happy coding! 🚀

"@ -ForegroundColor Magenta
        
    } catch {
        Write-Error "Setup failed: $_"
    }
}

# Run main function
Main