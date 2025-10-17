# NYRA Secret Rotation Emergency Plan

## Compromised Services Analysis

### TIER 1 - CRITICAL (Rotate Immediately)
**High Impact + Business Critical**

| Service | API Rotation | Priority | Notes |
|---------|-------------|----------|-------|
| GitHub (4 keys) | ✅ Yes | URGENT | Controls repository access, CI/CD |
| OpenAI (4 keys) | ✅ Yes | URGENT | Core AI functionality |
| Anthropic | ❌ Manual | HIGH | Claude API access |
| Postgres | ❌ Manual | HIGH | Database access |
| Supabase (2 keys) | ✅ Partial | HIGH | Backend/auth services |

### TIER 2 - HIGH IMPACT (Rotate Today)
**Moderate Impact + Frequent Use**

| Service | API Rotation | Priority | Notes |
|---------|-------------|----------|-------|
| Google APIs (2 keys) | ✅ Yes | HIGH | Search, language services |
| Qdrant (3 keys) | ❌ Manual | HIGH | Vector database |
| Notion | ❌ Manual | MEDIUM | Documentation/PKM |
| Groq | ❌ Manual | MEDIUM | Fast inference |
| Mistral | ❌ Manual | MEDIUM | EU-based AI |

### TIER 3 - MEDIUM IMPACT (Rotate This Week)
**Lower Impact + Less Frequent Use**

| Service | Count | API Rotation | Notes |
|---------|-------|-------------|-------|
| Specialized AI (Cerebras, SambaNova, etc.) | 8 | ❌ Manual | Development/testing |
| Browser/Productivity | 4 | ❌ Manual | Arc, Floccus tools |
| Monitoring | 2 | ❌ Manual | Sentry, VirusTotal |
| Other Services | 10+ | ❌ Manual | Various dev tools |

## Automation Opportunities

### Services with API Key Rotation:
1. **GitHub** - REST API for PAT management
2. **OpenAI** - API key management via dashboard API
3. **Google Cloud** - Service account key rotation
4. **Supabase** - Project API key regeneration

### Services with CLI Management:
- GitHub CLI (`gh auth refresh`)
- Google Cloud CLI (`gcloud auth`)
- Supabase CLI (`supabase projects api-keys`)

## Batch Rotation Strategy

### Phase 1: Critical Services (Now)
```bash
# 1. Rotate GitHub tokens via API
# 2. Regenerate OpenAI keys  
# 3. Update Postgres password
# 4. Rotate Anthropic key manually
```

### Phase 2: Infisical Integration Setup
```bash
# 1. Initialize Infisical project
# 2. Create environments (dev, staging, prod)
# 3. Bulk import rotated secrets
# 4. Update application to use Infisical
```

### Phase 3: Remaining Services
- Batch process remaining 20+ services
- Use 1Password/Bitwarden for temporary storage during rotation
- Update Infisical with new values

## Emergency Response Checklist

- [x] Remove secrets from git history
- [x] Fix .gitignore to prevent future exposure
- [ ] Rotate Tier 1 critical secrets
- [ ] Set up Infisical for centralized management
- [ ] Rotate remaining services
- [ ] Update application configuration
- [ ] Test all integrations
- [ ] Document new secret management workflow

## Time Estimates
- **Tier 1 (5 services)**: 2-3 hours with automation
- **Tier 2 (8 services)**: 3-4 hours mostly manual
- **Tier 3 (20+ services)**: 6-8 hours manual work
- **Infisical setup**: 1-2 hours
- **Application integration**: 2-3 hours

**Total estimated time**: 14-20 hours spread over 2-3 days