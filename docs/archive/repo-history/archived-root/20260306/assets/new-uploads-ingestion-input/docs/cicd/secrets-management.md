# Secrets Management Guide

Complete guide for managing secrets and sensitive configuration in the CI/CD pipeline.

## Overview

This project uses multiple layers of secrets management:

1. **GitHub Secrets**: For CI/CD workflow secrets
2. **Infisical**: For application environment variables
3. **Environment Variables**: For runtime configuration
4. **Docker Secrets**: For container-specific credentials

## Secrets Hierarchy

```
GitHub Organization Secrets (shared across repos)
│
├── Repository Secrets (project-specific)
│   ├── Workflow Secrets (CI/CD)
│   └── Environment Secrets (staging/production)
│
└── Infisical (application runtime)
    ├── Development
    ├── Staging
    └── Production
```

## GitHub Secrets

### Required Repository Secrets

#### CI/CD Secrets

```bash
# Codecov Integration
CODECOV_TOKEN=<token>

# Container Registry
# GITHUB_TOKEN is automatically provided

# Infisical Integration
INFISICAL_TOKEN=<service-token>
```

#### Security Scanning

```bash
# Snyk Security
SNYK_TOKEN=<api-token>

# Gitleaks (optional, for enterprise)
GITLEAKS_LICENSE=<license-key>

# GitHub Security (automatically provided)
# GITHUB_TOKEN with security-events permission
```

#### Testing

```bash
# E2E Testing
E2E_API_KEY=<test-api-key>
STAGING_API_KEY=<staging-key>
PRODUCTION_API_KEY=<prod-key>

# Lighthouse CI
LHCI_GITHUB_APP_TOKEN=<app-token>
```

### Setting GitHub Secrets

#### Via GitHub UI

1. Navigate to repository Settings
2. Click "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Enter name and value
5. Click "Add secret"

#### Via GitHub CLI

```bash
# Set a secret
gh secret set SECRET_NAME

# Set from file
gh secret set SECRET_NAME < secret-file.txt

# List secrets
gh secret list

# Delete secret
gh secret delete SECRET_NAME
```

#### Via API

```bash
# Encrypt secret value
SECRET_VALUE="my-secret"
PUBLIC_KEY=$(gh api /repos/{owner}/{repo}/actions/secrets/public-key --jq .key)
KEY_ID=$(gh api /repos/{owner}/{repo}/actions/secrets/public-key --jq .key_id)

# Create/update secret
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/{owner}/{repo}/actions/secrets/SECRET_NAME \
  -f encrypted_value="$ENCRYPTED_VALUE" \
  -f key_id="$KEY_ID"
```

## Environment Secrets

### Staging Environment

```bash
# Database
DATABASE_URL=postgresql://user:pass@staging-db:5432/dbname
DB_POOL_SIZE=20
DB_SSL_MODE=require

# Redis
REDIS_URL=redis://staging-redis:6379
REDIS_TLS=true

# Authentication
JWT_SECRET=<random-256-bit-secret>
JWT_EXPIRY=24h
SESSION_SECRET=<random-256-bit-secret>

# API Keys
API_KEY_ENCRYPTION_KEY=<random-256-bit-key>
EXTERNAL_API_KEY=<third-party-key>

# Email Service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=<username>
SMTP_PASSWORD=<password>

# Object Storage
S3_BUCKET=staging-assets
S3_ACCESS_KEY=<access-key>
S3_SECRET_KEY=<secret-key>
S3_REGION=us-east-1
```

### Production Environment

```bash
# Database (different credentials)
DATABASE_URL=postgresql://prod-user:prod-pass@prod-db:5432/proddb
DB_POOL_SIZE=50
DB_SSL_MODE=require
DB_READ_REPLICA_URL=postgresql://readonly:pass@replica-db:5432/proddb

# Redis
REDIS_URL=redis://prod-redis:6379
REDIS_CLUSTER_NODES=node1:6379,node2:6379,node3:6379
REDIS_TLS=true

# Authentication
JWT_SECRET=<different-random-256-bit-secret>
JWT_EXPIRY=12h
SESSION_SECRET=<different-random-256-bit-secret>

# API Keys (production keys)
API_KEY_ENCRYPTION_KEY=<different-random-256-bit-key>
EXTERNAL_API_KEY=<production-third-party-key>

# Email Service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=<prod-username>
SMTP_PASSWORD=<prod-password>

# Object Storage
S3_BUCKET=production-assets
S3_ACCESS_KEY=<prod-access-key>
S3_SECRET_KEY=<prod-secret-key>
S3_REGION=us-east-1

# Monitoring
SENTRY_DSN=<sentry-dsn>
DATADOG_API_KEY=<datadog-key>
```

## Infisical Setup

### Installation

```bash
# Linux/macOS
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical

# macOS (Homebrew)
brew install infisical/get-cli/infisical

# Windows (Scoop)
scoop bucket add infisical https://github.com/Infisical/scoop-infisical.git
scoop install infisical
```

### Initial Configuration

```bash
# Login to Infisical
infisical login

# Initialize project
infisical init

# Set project ID
infisical projects
infisical use <project-id>
```

### Managing Secrets

#### Create/Update Secrets

```bash
# Set a secret
infisical secrets set DATABASE_URL "postgresql://..." --env=staging

# Set multiple secrets
infisical secrets set JWT_SECRET "secret1" SESSION_SECRET "secret2" --env=production

# Import from .env file
infisical secrets import --env=staging < .env.staging
```

#### Retrieve Secrets

```bash
# List all secrets
infisical secrets

# Get specific secret
infisical secrets get DATABASE_URL --env=production

# Export to .env format
infisical export --env=staging --format=dotenv > .env.staging

# Export as JSON
infisical export --env=production --format=json > secrets.json
```

#### Delete Secrets

```bash
# Delete a secret
infisical secrets delete OLD_SECRET --env=staging
```

### Service Tokens

For CI/CD, create service tokens:

```bash
# Create service token (via Infisical dashboard)
# 1. Go to Project Settings
# 2. Click "Service Tokens"
# 3. Create new token with appropriate permissions
# 4. Copy token and add to GitHub Secrets as INFISICAL_TOKEN
```

### Using Infisical in Workflows

```yaml
- name: Setup Infisical
  run: |
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
    sudo apt-get update && sudo apt-get install -y infisical

- name: Pull secrets
  run: |
    infisical export --env=production --format=dotenv > .env.production
  env:
    INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}

- name: Use secrets
  run: |
    source .env.production
    ./deploy.sh
```

## Secret Rotation

### Rotation Schedule

| Secret Type | Rotation Frequency | Automated |
|-------------|-------------------|-----------|
| API Keys (external) | 90 days | No |
| Database passwords | 180 days | No |
| JWT secrets | 365 days | No |
| Service tokens | 90 days | No |
| Encryption keys | Never (versioned) | No |
| GitHub tokens | 1 year | Yes |

### Rotation Process

#### 1. Database Password Rotation

```bash
# Create new password
NEW_PASSWORD=$(openssl rand -base64 32)

# Update database user
psql -U admin -c "ALTER USER app_user WITH PASSWORD '$NEW_PASSWORD';"

# Update Infisical
infisical secrets set DATABASE_URL "postgresql://app_user:$NEW_PASSWORD@..." --env=production

# Trigger deployment to pick up new secret
gh workflow run cd-production.yml
```

#### 2. API Key Rotation

```bash
# Generate new key
NEW_API_KEY=$(openssl rand -hex 32)

# Update in Infisical
infisical secrets set EXTERNAL_API_KEY "$NEW_API_KEY" --env=production

# Update external service with new key

# Deploy application
gh workflow run cd-production.yml

# Verify new key works

# Revoke old key from external service
```

#### 3. JWT Secret Rotation (Zero-Downtime)

```bash
# Add new secret alongside old one
infisical secrets set JWT_SECRET_NEW "new-secret" --env=production

# Deploy application configured to accept both secrets

# Wait for all old tokens to expire

# Remove old secret
infisical secrets delete JWT_SECRET_OLD --env=production

# Rename new secret to primary
infisical secrets set JWT_SECRET "new-secret" --env=production
```

## Secret Generation

### Strong Random Secrets

```bash
# 256-bit secret (base64)
openssl rand -base64 32

# 256-bit secret (hex)
openssl rand -hex 32

# UUID
uuidgen

# Secure random string
pwgen -s 32 1

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Encryption Keys

```bash
# AES-256 key
openssl rand -hex 32

# RSA key pair
openssl genrsa -out private.pem 4096
openssl rsa -in private.pem -pubout -out public.pem

# Ed25519 key pair
ssh-keygen -t ed25519 -C "deployment-key"
```

## Security Best Practices

### 1. Never Commit Secrets

```bash
# Add to .gitignore
cat >> .gitignore <<EOF
.env
.env.*
!.env.example
secrets/
*.pem
*.key
EOF
```

### 2. Use git-secrets

```bash
# Install git-secrets
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
sudo make install

# Setup
cd /path/to/repo
git secrets --install
git secrets --register-aws
```

### 3. Secret Scanning

```bash
# Run Gitleaks locally
docker run --rm -v $(pwd):/repo zricethezav/gitleaks:latest detect --source /repo

# Run TruffleHog
docker run --rm -v $(pwd):/repo trufflesecurity/trufflehog:latest filesystem /repo
```

### 4. Access Control

- Use least privilege principle
- Implement environment protection rules
- Require reviews for production deployments
- Enable audit logging
- Regular access reviews

### 5. Secret Storage

- Never store secrets in:
  - Git repository
  - Docker images
  - Application code
  - Log files
  - Error messages

- Store secrets in:
  - GitHub Secrets (CI/CD)
  - Infisical (application runtime)
  - Environment variables (container runtime)
  - Secure vaults (HashiCorp Vault, AWS Secrets Manager)

## Monitoring and Auditing

### Audit Secret Access

```bash
# GitHub audit log (enterprise)
gh api /orgs/{org}/audit-log --paginate

# Infisical audit logs
# Available in dashboard: Project Settings → Audit Logs
```

### Secret Expiration Alerts

Set up monitoring for:
- Service token expiration
- SSL certificate expiration
- API key rotation schedules
- Database credential age

### Detection of Secret Leaks

```yaml
# GitHub secret scanning (automatic)
# Detects committed secrets and creates alerts

# Add custom patterns
# Repository Settings → Code security and analysis → Secret scanning
```

## Troubleshooting

### Cannot Access Secrets in Workflow

**Issue**: Workflow fails with "secret not found"

**Solutions**:
1. Verify secret name matches exactly (case-sensitive)
2. Check environment protection rules
3. Verify branch has access to environment
4. Check if secret is organization vs repository level

### Infisical Authentication Failed

**Issue**: Cannot pull secrets from Infisical

**Solutions**:
1. Verify `INFISICAL_TOKEN` is set correctly
2. Check token hasn't expired
3. Verify token has correct permissions
4. Check project ID matches

### Wrong Secret Value in Deployment

**Issue**: Application uses old secret value

**Solutions**:
1. Verify secret updated in Infisical
2. Check if cache needs clearing
3. Restart application to reload secrets
4. Verify export command ran successfully

### Secret in Logs

**Issue**: Secret accidentally logged

**Solutions**:
1. Rotate the secret immediately
2. Purge logs containing secret
3. Update code to mask sensitive values
4. Review logging configuration

## Emergency Procedures

### Secret Compromise

If a secret is compromised:

1. **Immediate Actions** (within 15 minutes):
   ```bash
   # Revoke compromised secret
   # For API keys
   # - Disable key in external service

   # For database passwords
   # - Change password immediately
   psql -U admin -c "ALTER USER app_user WITH PASSWORD 'temp-password';"

   # For GitHub tokens
   gh auth refresh -h github.com
   ```

2. **Generate New Secret** (within 30 minutes):
   ```bash
   # Generate replacement
   NEW_SECRET=$(openssl rand -base64 32)

   # Update in Infisical
   infisical secrets set COMPROMISED_SECRET "$NEW_SECRET" --env=production
   ```

3. **Deploy Update** (within 1 hour):
   ```bash
   # Trigger emergency deployment
   gh workflow run cd-production.yml
   ```

4. **Verify and Monitor** (next 24 hours):
   - Check application logs for errors
   - Monitor for unauthorized access
   - Review audit logs
   - Update incident documentation

5. **Post-Incident Review** (within 1 week):
   - Document incident timeline
   - Identify root cause
   - Implement preventive measures
   - Update procedures

## Checklist

### New Service Setup

- [ ] Identify all required secrets
- [ ] Generate strong random secrets
- [ ] Add secrets to Infisical (dev/staging/prod)
- [ ] Add CI/CD secrets to GitHub
- [ ] Document secrets in this guide
- [ ] Set up rotation schedule
- [ ] Configure monitoring alerts
- [ ] Test secret retrieval
- [ ] Verify application functionality
- [ ] Document emergency procedures

### Production Deployment

- [ ] Verify all secrets configured
- [ ] Test secret access in staging
- [ ] Backup current secrets
- [ ] Deploy with new secrets
- [ ] Verify application health
- [ ] Test all integrations
- [ ] Monitor for issues
- [ ] Document deployment

### Secret Rotation

- [ ] Schedule rotation window
- [ ] Generate new secret
- [ ] Update in Infisical
- [ ] Test in staging
- [ ] Deploy to production
- [ ] Verify functionality
- [ ] Revoke old secret
- [ ] Document rotation
- [ ] Update next rotation date

---

**Last Updated**: 2025-12-31
**Security Contact**: security@example.com
