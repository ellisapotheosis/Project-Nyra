# NYRA Secret Rotation Helper Script
# This script helps manage the secret rotation process after the GitHub exposure

param(
    [ValidateSet("priority", "github", "openai", "setup-infisical", "all")]
    [string]$Action = "priority"
)

Write-Host "🔐 NYRA Secret Rotation Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

function Show-RotationPriority {
    Write-Host "`n📋 ROTATION PRIORITY ORDER:" -ForegroundColor Yellow
    
    Write-Host "`n🚨 TIER 1 - CRITICAL (Do First):" -ForegroundColor Red
    Write-Host "   • GitHub Tokens (4) - Controls repo access, CI/CD"
    Write-Host "   • OpenAI Keys (4) - Core AI functionality" 
    Write-Host "   • Anthropic API Key - Claude access"
    Write-Host "   • Postgres Password - Database access"
    Write-Host "   • Supabase Keys (2) - Backend services"
    
    Write-Host "`n⚠️  TIER 2 - HIGH (Do Today):" -ForegroundColor DarkYellow
    Write-Host "   • Google APIs (2) - Search, language services"
    Write-Host "   • Qdrant Keys (3) - Vector database" 
    Write-Host "   • Notion API Key - Documentation"
    Write-Host "   • Groq API Key - Fast inference"
    Write-Host "   • Mistral API Key - EU AI services"
    
    Write-Host "`n📝 TIER 3 - MEDIUM (This Week):" -ForegroundColor DarkGreen  
    Write-Host "   • Specialized AI services (8+)"
    Write-Host "   • Browser/productivity tools (4+)"
    Write-Host "   • Monitoring services (2+)"
    Write-Host "   • Other development tools (10+)"
}

function Start-GitHubRotation {
    Write-Host "`n🔄 GitHub Token Rotation Process:" -ForegroundColor Green
    Write-Host "1. Go to https://github.com/settings/tokens"
    Write-Host "2. Find and delete the compromised tokens"
    Write-Host "3. Create new Personal Access Tokens with same scopes"
    Write-Host "4. Update the following:"
    Write-Host "   - GITHUB_TOKEN"
    Write-Host "   - GITHUB_API_KEY" 
    Write-Host "   - GITHUB_PAT"
    Write-Host "   - GH_TOKEN"
    
    Write-Host "`n🤖 Automated options:" -ForegroundColor Blue
    Write-Host "   gh auth refresh --scopes repo,workflow,write:packages"
    Write-Host "   gh auth status # to verify"
    
    $response = Read-Host "`nPress Enter when GitHub tokens are rotated..."
}

function Start-OpenAIRotation {
    Write-Host "`n🔄 OpenAI Key Rotation Process:" -ForegroundColor Green
    Write-Host "1. Go to https://platform.openai.com/api-keys"
    Write-Host "2. Delete the compromised keys:"
    Write-Host "   - OPENAI_API_KEY"
    Write-Host "   - OPENAI_API_KEY_CREWAI"
    Write-Host "   - OPENAI_API_KEY_NYRA" 
    Write-Host "   - OPENAI_API_KEY_TERMINAL"
    Write-Host "3. Create new API keys with descriptive names"
    Write-Host "4. Note usage limits and organization settings"
    
    $response = Read-Host "`nPress Enter when OpenAI keys are rotated..."
}

function Setup-Infisical {
    Write-Host "`n🔧 Setting up Infisical for NYRA:" -ForegroundColor Green
    
    # Check if logged in
    try {
        infisical user get token | Out-Null
        Write-Host "✅ Already logged into Infisical" -ForegroundColor Green
    } catch {
        Write-Host "❌ Not logged into Infisical" -ForegroundColor Red
        Write-Host "Run: infisical login" -ForegroundColor Yellow
        return
    }
    
    Write-Host "`n📁 Creating NYRA project structure..."
    
    # Initialize infisical in project
    Write-Host "Run the following commands:"
    Write-Host "1. infisical init" -ForegroundColor Yellow
    Write-Host "2. Select or create 'project-nyra' project" -ForegroundColor Yellow  
    Write-Host "3. Choose 'dev' environment" -ForegroundColor Yellow
    
    Write-Host "`n🔑 After project setup, you can batch import secrets:"
    Write-Host "infisical secrets set GITHUB_TOKEN=your_new_token" -ForegroundColor Yellow
    Write-Host "infisical secrets set OPENAI_API_KEY=your_new_key" -ForegroundColor Yellow
    Write-Host "# ... etc for all rotated secrets" -ForegroundColor Yellow
}

function Show-NextSteps {
    Write-Host "`n📋 RECOMMENDED WORKFLOW:" -ForegroundColor Cyan
    Write-Host "1. Start with GitHub tokens (affects CI/CD immediately)"
    Write-Host "2. Rotate OpenAI keys (affects core functionality)"  
    Write-Host "3. Set up Infisical project for centralized management"
    Write-Host "4. Batch rotate remaining Tier 1 services"
    Write-Host "5. Continue with Tier 2 and Tier 3"
    
    Write-Host "`n⏱️  Time Investment:"
    Write-Host "   • Tier 1: ~3 hours"
    Write-Host "   • Infisical setup: ~1 hour"
    Write-Host "   • Remaining services: ~8-12 hours over 2-3 days"
    
    Write-Host "`n🎯 Quick wins to start:"
    Write-Host "   .\scripts\rotate-secrets.ps1 github"
    Write-Host "   .\scripts\rotate-secrets.ps1 openai"
    Write-Host "   .\scripts\rotate-secrets.ps1 setup-infisical"
}

# Main execution logic
switch ($Action) {
    "priority" { 
        Show-RotationPriority
        Show-NextSteps
    }
    "github" { Start-GitHubRotation }
    "openai" { Start-OpenAIRotation }
    "setup-infisical" { Setup-Infisical }
    "all" { 
        Show-RotationPriority
        Start-GitHubRotation
        Start-OpenAIRotation  
        Setup-Infisical
    }
}

Write-Host "`n✅ Use this script to guide your rotation process!" -ForegroundColor Green
Write-Host "Run: .\scripts\rotate-secrets.ps1 -Action <priority|github|openai|setup-infisical>" -ForegroundColor Blue