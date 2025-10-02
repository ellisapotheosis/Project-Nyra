# Secret Rotation Scripts - How They Work

## Overview

The secret rotation system provides guided, interactive tools to help manage API key rotation efficiently after a security incident. The scripts are designed to minimize manual work while ensuring nothing is missed.

## Main Script: `scripts/rotate-secrets.ps1`

This PowerShell script provides guided workflows for different rotation scenarios.

### Usage Modes

```powershell
# Show priority matrix and next steps
.\scripts\rotate-secrets.ps1

# Target specific services
.\scripts\rotate-secrets.ps1 -Action github
.\scripts\rotate-secrets.ps1 -Action openai
.\scripts\rotate-secrets.ps1 -Action setup-infisical

# Full guided workflow
.\scripts\rotate-secrets.ps1 -Action all
```

### How Each Mode Works

#### 1. Priority Mode (Default)
```powershell
.\scripts\rotate-secrets.ps1
```
**What it does:**
- Shows the complete priority matrix (Tier 1, 2, 3 services)
- Displays time estimates for each tier
- Provides quick-start commands
- Explains the recommended workflow

**Output:**
- Color-coded priority list
- Service impact explanations
- Next steps recommendations

#### 2. GitHub Mode
```powershell
.\scripts\rotate-secrets.ps1 -Action github
```
**What it does:**
- Provides step-by-step GitHub token rotation instructions
- Lists all 4 compromised GitHub tokens by name
- Gives direct links to GitHub settings
- Suggests automated options using GitHub CLI
- Waits for user confirmation before proceeding

**Interactive Process:**
1. Opens GitHub token management URL
2. Guides through manual deletion of old tokens
3. Explains how to create new tokens with same scopes
4. Offers `gh auth refresh` automation option
5. Validates with `gh auth status`

#### 3. OpenAI Mode
```powershell
.\scripts\rotate-secrets.ps1 -Action openai
```
**What it does:**
- Lists all 4 OpenAI keys that need rotation
- Provides direct link to OpenAI API key dashboard
- Explains usage limits and organization considerations
- Waits for manual completion

**Key Features:**
- Names each specific key (CREWAI, NYRA, TERMINAL variants)
- Reminds about usage limits and billing
- Suggests descriptive naming for new keys

#### 4. Infisical Setup Mode
```powershell
.\scripts\rotate-secrets.ps1 -Action setup-infisical
```
**What it does:**
- Checks if already logged into Infisical
- Guides through project initialization
- Explains environment setup (dev, staging, prod)
- Shows how to batch import secrets

**Smart Features:**
- Tests Infisical login status automatically
- Provides conditional instructions based on login state
- Shows example commands for bulk secret import

## Integration with Secret Management Tools

### Infisical Workflow
```powershell
# After rotating secrets manually:
infisical init                           # Set up project
infisical secrets set GITHUB_TOKEN=new_token
infisical secrets set OPENAI_API_KEY=new_key
# ... batch import all rotated secrets
```

### 1Password Integration (Planned)
```powershell
# Future enhancement:
op item create --category=login --title="GitHub Token" --field="token=new_token"
```

### Bitwarden Integration (Planned)  
```powershell
# Future enhancement:
bw create item '{"type":1,"name":"GitHub Token","login":{"password":"new_token"}}'
```

## How the Priority System Works

### Tier Classification Logic

**Tier 1 - Critical (Immediate)**
- Controls core functionality (GitHub → CI/CD, OpenAI → AI features)
- High business impact if compromised
- Frequently used services
- Security-sensitive (database access, auth services)

**Tier 2 - High (Same Day)**  
- Moderate business impact
- Regular usage but not core pipeline
- Services with good rotation APIs

**Tier 3 - Medium (This Week)**
- Development/testing services
- Lower usage frequency
- Mainly manual rotation required

### Time Estimates Based On:
- **API availability** - Services with rotation APIs are faster
- **Complexity** - Number of integration points
- **Frequency** - How often the service is used
- **Dependencies** - Whether other services depend on it

## Error Handling & Recovery

### Common Issues & Solutions

1. **Infisical Not Logged In**
   ```
   ❌ Not logged into Infisical
   Run: infisical login
   ```
   **Solution:** Follow the login prompt, then re-run the script

2. **GitHub CLI Not Authenticated**
   ```
   gh auth refresh --scopes repo,workflow,write:packages
   ```
   **Solution:** Re-authenticate with required scopes

3. **PowerShell Execution Policy**
   ```
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
   **Solution:** Allow local script execution

## Future Enhancements

### Planned Features
- **API-based rotation** for services that support it
- **Batch processing** with parallel rotation
- **Validation testing** to confirm new keys work
- **Rollback capability** in case of issues
- **Integration with CI/CD** to update secrets in GitHub Actions

### Service-Specific Automations

**GitHub (Partially Automated)**
```powershell
# Current:
gh auth refresh --scopes repo,workflow,write:packages

# Planned: 
Invoke-GitHubTokenRotation -OldToken $old -NewToken $new
```

**OpenAI (Manual, API Planned)**
```powershell
# Planned:
Rotate-OpenAIKey -Organization "your-org" -KeyName "NYRA-Production"
```

## Best Practices

1. **Always rotate Tier 1 first** - These have the highest impact
2. **Test immediately** - Verify new keys work before moving on
3. **Update documentation** - Keep the `.env.example` template current  
4. **Use descriptive names** - Make key purposes clear for future reference
5. **Monitor usage** - Check for any failed API calls after rotation

## Security Notes

- **Never log actual secrets** - Scripts only show templates and guides
- **Use secure channels** - Copy keys directly from service dashboards
- **Clean up temp files** - Ensure no secrets are left in temp storage
- **Verify scope requirements** - New keys need same permissions as old ones