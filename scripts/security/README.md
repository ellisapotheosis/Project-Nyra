# Security Scripts

Automated security tools and utilities for Project Nyra.

---

## Available Scripts

### 1. scan.sh - Security Scanning

Comprehensive security scanning across the entire infrastructure.

**Usage**:
```bash
./scripts/security/scan.sh [--quick|--full]
```

**Features**:
- Dependency vulnerability scanning (npm audit)
- Container image scanning (Trivy)
- Static application security testing (Semgrep)
- Secret scanning (TruffleHog)
- Infrastructure as Code scanning (Checkov)
- Custom security checks

**Reports**: Generated in `./security-reports/`

**Examples**:
```bash
# Full scan (all checks)
./scripts/security/scan.sh --full

# Quick scan (dependencies and secrets only)
./scripts/security/scan.sh --quick
```

---

### 2. rotate-secrets.sh - Secret Rotation

Automated secret rotation for all Infisical-managed secrets.

**Usage**:
```bash
./scripts/security/rotate-secrets.sh [--dry-run]
```

**Rotates**:
- Database passwords (PostgreSQL, Redis, FalkorDB, Qdrant)
- Application secrets (JWT, Session, Encryption keys)
- MCP server tokens

**Does NOT rotate** (manual required):
- External API keys (Anthropic, OpenRouter, E2B)

**Examples**:
```bash
# Preview rotation without making changes
./scripts/security/rotate-secrets.sh --dry-run

# Perform actual rotation
./scripts/security/rotate-secrets.sh
```

**Important**: Services must be restarted after rotation!

---

### 3. view-security-logs.sh - Log Viewer

View and analyze security logs with filtering options.

**Usage**:
```bash
./scripts/security/view-security-logs.sh [OPTIONS]
```

**Options**:
- `--today` - Show only today's logs
- `--failed-auth` - Show failed authentication attempts
- `--suspicious` - Show suspicious activity
- `--rate-limit` - Show rate limit violations
- `--admin-actions` - Show admin actions
- `--tail` - Follow logs in real-time
- `--summary` - Show summary statistics

**Examples**:
```bash
# View today's failed auth attempts
./scripts/security/view-security-logs.sh --today --failed-auth

# Follow logs in real-time
./scripts/security/view-security-logs.sh --tail

# Show summary statistics
./scripts/security/view-security-logs.sh --summary

# View suspicious activities
./scripts/security/view-security-logs.sh --suspicious
```

---

## Prerequisites

### Required Tools

| Tool | Installation | Purpose |
|------|--------------|---------|
| **Infisical CLI** | `brew install infisical/get-cli/infisical` | Secret management |
| **Trivy** | `brew install trivy` | Container scanning |
| **Semgrep** | `brew install semgrep` | SAST scanning |
| **TruffleHog** | `brew install trufflehog` | Secret scanning |
| **Checkov** | `brew install checkov` | IaC scanning |
| **jq** | `brew install jq` | JSON processing |

### Setup

1. Install required tools (see table above)
2. Login to Infisical:
   ```bash
   infisical login
   ```
3. Verify project access:
   ```bash
   infisical secrets list --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
   ```

---

## Security Workflow

### Daily Tasks

```bash
# View today's security events
./scripts/security/view-security-logs.sh --summary

# Check for failed authentication attempts
./scripts/security/view-security-logs.sh --failed-auth
```

### Weekly Tasks

```bash
# Run security scan
./scripts/security/scan.sh --full

# Review scan reports
cat ./security-reports/summary-*.md
```

### Quarterly Tasks

```bash
# Rotate secrets (dry-run first)
./scripts/security/rotate-secrets.sh --dry-run

# If dry-run looks good, rotate for real
./scripts/security/rotate-secrets.sh

# Restart services with new secrets
cd infra/docker
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="production" \
  --path="/shared" \
  -- docker compose -f docker-compose.orchestration.yml restart
```

---

## Automated Scanning (CI/CD)

### GitHub Actions Integration

Security scans run automatically on:
- Every push to `main` or `develop`
- Every pull request
- Weekly schedule (Sundays at midnight)

See `.github/workflows/security-scan.yml` for configuration.

### Local Pre-Commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Run quick security scan before commit
./scripts/security/scan.sh --quick

if [ $? -ne 0 ]; then
    echo "Security scan failed. Commit aborted."
    exit 1
fi
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## Troubleshooting

### Scan Script Issues

**Problem**: `trivy: command not found`
```bash
# Install Trivy
brew install trivy
```

**Problem**: `semgrep: command not found`
```bash
# Install Semgrep
brew install semgrep
```

**Problem**: Scan reports critical vulnerabilities
```bash
# Review the report
cat ./security-reports/summary-*.md

# Prioritize by severity (Critical > High > Medium > Low)
# Create remediation tickets
# Apply fixes
# Re-run scan to verify
```

### Secret Rotation Issues

**Problem**: `Not logged in to Infisical`
```bash
# Login to Infisical
infisical login
```

**Problem**: Services fail after rotation
```bash
# Check Infisical audit log for previous values
# Rollback if necessary
# Investigate root cause

# View service logs
docker compose -f infra/docker/docker-compose.orchestration.yml logs -f
```

**Problem**: External API keys not working
```bash
# Reminder: External API keys must be rotated manually
# Anthropic: https://console.anthropic.com/settings/keys
# OpenRouter: https://openrouter.ai/keys
# E2B: https://e2b.dev/dashboard
```

### Log Viewer Issues

**Problem**: `Log directory not found`
```bash
# Create log directory
mkdir -p ./logs

# Verify logging is configured in applications
# Check winston configuration
```

**Problem**: Logs are not in JSON format
```bash
# Logs should be structured JSON
# Check winston configuration in services/shared/src/logging/logger.ts
# Ensure format is set to json()
```

---

## Security Report Retention

| Report Type | Retention | Location |
|-------------|-----------|----------|
| Scan Reports | 90 days | `./security-reports/` |
| Security Logs | 90 days | `./logs/security-*.log` |
| Incident Reports | 365 days | `./logs/security-incidents-*.log` |
| Rotation Reports | 365 days | `./security-reports/secret-rotation-*.md` |

### Cleanup Script

```bash
# Remove old scan reports (older than 90 days)
find ./security-reports -name "*.json" -mtime +90 -delete
find ./security-reports -name "*.md" -mtime +90 -delete

# Remove old security logs (older than 90 days)
find ./logs -name "security-*.log" -mtime +90 -delete
```

---

## Integration with Monitoring

### Prometheus Metrics

Security metrics exposed at `/metrics`:
- `security_scan_duration_seconds` - Scan execution time
- `security_vulnerabilities_total` - Total vulnerabilities by severity
- `security_auth_failures_total` - Failed authentication attempts
- `security_rate_limit_hits_total` - Rate limit violations

### Grafana Dashboards

Import security dashboard:
- Dashboard ID: TBD
- Panels: Failed auth, rate limits, vulnerabilities, scan status

### Alerting Rules

Alerts configured for:
- Critical vulnerabilities detected
- High number of failed auth attempts (>10 in 5 minutes)
- Multiple rate limit violations from single IP
- Suspicious activity patterns

---

## Additional Resources

- [Security Hardening Guide](../../docs/security/HARDENING-GUIDE.md)
- [Security Checklist](../../docs/security/SECURITY-CHECKLIST.md)
- [Incident Response Plan](../../docs/security/HARDENING-GUIDE.md#incident-response)

---

## Contributing

When adding new security scripts:

1. Follow existing naming convention
2. Include detailed help text
3. Add error handling
4. Support `--dry-run` mode for destructive operations
5. Generate reports in `./security-reports/`
6. Update this README

---

## Support

For security-related questions:
- Email: security@nyra.ai
- Slack: `#security` (internal)

For script issues:
- Create GitHub issue with `security` label
- Include error output and environment details

---

**Last Updated**: 2026-01-10
**Maintained By**: Security Team
