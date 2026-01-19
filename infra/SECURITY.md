# Security Guide - Project Nyra Infrastructure

## 🚨 Critical Security Fixes Applied

### Date: 2026-01-18

This document outlines the security vulnerabilities that were identified and fixed in the Project Nyra Docker infrastructure.

## 🔒 Vulnerabilities Identified and Fixed

### 1. Hardcoded Passwords (CRITICAL - CVE Equivalent)

**Severity**: CRITICAL
**CVSS Score**: 9.8 (Critical)
**CWE-798**: Use of Hard-coded Credentials

#### Fixed Files:
- `docker/orchestrator/docker-compose.yml` - Removed hardcoded `POSTGRES_PASSWORD=postgres`
- `docker-compose.nexus-router.yml` - Removed default `REDIS_PASSWORD:-changeme`
- `gitea/docker-compose.gitea.yml` - Removed placeholder `GITEA_RUNNER_REGISTRATION_TOKEN=REPLACE_ME`
- `infra/monitoring/docker-compose.yml` - Removed default `GF_SECURITY_ADMIN_PASSWORD=nyra2026`
- `infra/docker-compose/docker-compose.base.yml` - Removed default database and Redis passwords

#### Impact:
Hardcoded credentials in production environments allow:
- Unauthorized database access
- Data exfiltration
- Privilege escalation
- Complete system compromise

#### Remediation:
All credentials now require explicit environment variables. Default values removed.

---

### 2. Weak Default Credentials (HIGH)

**Severity**: HIGH
**CVSS Score**: 7.5 (High)
**CWE-521**: Weak Password Requirements

#### Identified Patterns:
```yaml
# BAD - Default values
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
REDIS_PASSWORD: ${REDIS_PASSWORD:-changeme}
GF_SECURITY_ADMIN_PASSWORD: nyra2026
```

```yaml
# GOOD - Required environment variables
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
REDIS_PASSWORD: ${REDIS_PASSWORD}
GF_SECURITY_ADMIN_PASSWORD: ${GF_SECURITY_ADMIN_PASSWORD}
```

#### Remediation:
- Created comprehensive `.env.example` with secure password generation instructions
- All passwords now require explicit configuration
- Added security comments in compose files

---

### 3. Exposed Ports (MEDIUM)

**Severity**: MEDIUM
**CVSS Score**: 5.3 (Medium)
**CWE-200**: Exposure of Sensitive Information

#### Exposed Services:

| Service | Port | Risk Level | Recommendation |
|---------|------|------------|----------------|
| PostgreSQL | 5432 | HIGH | Bind to localhost only or use VPN |
| Redis | 6379 | HIGH | Require password, bind to localhost |
| Grafana | 3005 | MEDIUM | Use strong admin password, enable HTTPS |
| Prometheus | 9090 | MEDIUM | Enable authentication, restrict access |
| Gitea | 3005, 2222 | MEDIUM | Use SSH keys, enable 2FA |
| MetaMCP Router | 12008 | LOW | Internal use only, firewall rules |

#### Security Warnings Added:

```yaml
# SECURITY WARNING: This service exposes sensitive ports
# - PostgreSQL (5432): Database access - MUST use strong passwords
# - Redis (6379): Cache access - MUST require authentication
# Recommendations:
# 1. Use firewall rules to restrict access to trusted IPs only
# 2. Never expose these ports to the public internet
# 3. Use VPN or SSH tunneling for remote access
# 4. Enable SSL/TLS for all connections
# 5. Implement IP allowlisting
```

---

### 4. API Keys with Empty Defaults (MEDIUM)

**Severity**: MEDIUM
**CVSS Score**: 5.0 (Medium)
**CWE-798**: Use of Hard-coded Credentials

#### Fixed Patterns:
```yaml
# Before:
ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:-}
OPENAI_API_KEY: ${OPENAI_API_KEY:-dummy}

# After:
# SECURITY: API keys must be set in .env file
ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
OPENAI_API_KEY: ${OPENAI_API_KEY}
```

#### Impact:
Empty or dummy API keys can lead to:
- Service failures
- Exposure of internal architecture
- Potential for injection attacks

---

### 5. Secrets in Plain Text (HIGH)

**Severity**: HIGH
**CVSS Score**: 7.5 (High)
**CWE-312**: Cleartext Storage of Sensitive Information

#### Identified Secrets:
- Database connection strings with passwords
- JWT secrets
- Encryption keys
- API tokens
- Session secrets

#### Remediation:
1. Created `.env.example` template
2. Added `.env` to `.gitignore` (verify)
3. Recommended secrets management tools:
   - Infisical (already integrated)
   - HashiCorp Vault
   - Docker Secrets
   - AWS Secrets Manager

---

## 🛡️ Security Best Practices Implemented

### 1. Environment Variable Security

All sensitive values must now be set via environment variables:

```bash
# Generate strong passwords
openssl rand -base64 32  # For passwords
openssl rand -hex 32     # For API keys
openssl rand -base64 64  # For JWT secrets
```

### 2. .env File Management

```bash
# Copy template
cp infra/.env.example infra/.env

# Edit with secure values
nano infra/.env

# Verify .env is in .gitignore
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
```

### 3. Secrets Rotation Policy

Rotate secrets according to this schedule:

| Secret Type | Rotation Frequency |
|-------------|-------------------|
| Database passwords | Quarterly (90 days) |
| API keys | Quarterly (90 days) |
| JWT secrets | Monthly (30 days) |
| Session secrets | Monthly (30 days) |
| Admin passwords | After each use (if shared) |

### 4. Network Security

```yaml
# Bind sensitive services to localhost only
ports:
  - "127.0.0.1:5432:5432"  # PostgreSQL
  - "127.0.0.1:6379:6379"  # Redis
```

### 5. Docker Security

```bash
# Scan images for vulnerabilities
docker scan nyra-postgres
docker scan nyra-redis

# Use specific image versions (not :latest)
image: postgres:16-alpine    # Good
image: postgres:latest       # Bad
```

---

## 🔍 Security Scanning Tools

### Recommended Tools:

1. **git-secrets** - Prevent committing secrets
```bash
git secrets --install
git secrets --register-aws
```

2. **gitleaks** - Scan for secrets in history
```bash
gitleaks detect --source . --verbose
```

3. **trivy** - Container vulnerability scanner
```bash
trivy image postgres:16
trivy image redis:7-alpine
```

4. **Docker Bench Security** - CIS Docker benchmark
```bash
docker run --rm --net host --pid host --userns host --cap-add audit_control \
    -v /var/lib:/var/lib -v /var/run/docker.sock:/var/run/docker.sock \
    -v /etc:/etc --label docker_bench_security \
    docker/docker-bench-security
```

---

## 📋 Security Checklist

### Before Deployment:

- [ ] All passwords set in `.env` file
- [ ] `.env` file added to `.gitignore`
- [ ] Strong passwords generated (min 32 characters)
- [ ] API keys configured for all services
- [ ] Exposed ports reviewed and restricted
- [ ] Firewall rules configured
- [ ] SSL/TLS certificates installed
- [ ] Security scanning completed
- [ ] Vulnerability scan passed
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured

### After Deployment:

- [ ] Change all default passwords
- [ ] Verify no secrets in git history
- [ ] Test authentication on all services
- [ ] Verify firewall rules are active
- [ ] Check logs for suspicious activity
- [ ] Set up automated security scans
- [ ] Document incident response plan
- [ ] Schedule secret rotation

---

## 🚨 Incident Response

If you suspect a security breach:

1. **Immediate Actions:**
   - Rotate all compromised credentials immediately
   - Check access logs for unauthorized access
   - Review git history for exposed secrets
   - Scan for malware and backdoors

2. **Investigation:**
   - Identify the scope of the breach
   - Determine what data was accessed
   - Review security logs and audit trails

3. **Remediation:**
   - Apply security patches
   - Update all credentials
   - Implement additional security controls
   - Document lessons learned

4. **Notification:**
   - Inform affected parties
   - Report to relevant authorities (if required)
   - Update security documentation

---

## 📞 Security Contacts

For security issues:
- Create a private security advisory on GitHub
- Contact project maintainers directly
- Do not disclose vulnerabilities publicly until patched

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Last Updated**: 2026-01-18
**Security Audit Version**: 1.0
**Next Review**: 2026-04-18 (90 days)
