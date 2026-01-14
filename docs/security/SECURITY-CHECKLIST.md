# Security Hardening Checklist - Quick Reference

**Version**: 1.0
**Last Updated**: 2026-01-10

This is a quick reference checklist. For detailed implementation instructions, see [HARDENING-GUIDE.md](./HARDENING-GUIDE.md).

---

## Pre-Deployment Checklist

### Infrastructure Security

#### Docker Security
- [ ] All containers run as non-root users
- [ ] Read-only root filesystems enabled where possible
- [ ] Security capabilities dropped (`cap_drop: ALL`)
- [ ] Minimal base images (Alpine, Distroless)
- [ ] Multi-stage builds implemented
- [ ] `.dockerignore` configured
- [ ] Health checks defined for all services
- [ ] Container images scanned with Trivy
- [ ] No secrets in Dockerfiles or images
- [ ] Resource limits configured

#### Network Security
- [ ] Docker networks segmented (frontend, backend, database)
- [ ] Internal networks for databases
- [ ] UFW firewall enabled and configured
- [ ] Default deny incoming traffic
- [ ] Rate limiting for SSH (port 22122)
- [ ] Only required ports exposed
- [ ] Tailscale VPN configured for GPU workers
- [ ] TLS/SSL certificates configured

#### Secrets Management
- [ ] Infisical CLI installed
- [ ] Project initialized with Infisical
- [ ] All secrets stored in Infisical (not .env files)
- [ ] Service tokens created for CI/CD
- [ ] Secret rotation schedule defined (90 days)
- [ ] No secrets committed to Git
- [ ] `.env` files in `.gitignore`

### Application Security

#### Authentication & Authorization
- [ ] JWT-based authentication implemented
- [ ] Token expiration configured
- [ ] Token revocation list (Redis)
- [ ] Session management in Redis
- [ ] Role-based access control (RBAC)
- [ ] API key management system
- [ ] Multi-factor authentication (MFA) enabled
- [ ] Password requirements enforced (12+ chars, complexity)

#### Input Validation
- [ ] Zod schemas for all endpoints
- [ ] Input sanitization middleware
- [ ] File upload validation
- [ ] Request size limits
- [ ] URL parameter validation
- [ ] JSON payload validation

#### SQL Injection Prevention
- [ ] Parameterized queries everywhere
- [ ] Query builder with automatic escaping
- [ ] Table name whitelist
- [ ] No dynamic SQL construction
- [ ] Database user with minimal privileges

#### XSS Protection
- [ ] Content Security Policy (CSP) headers
- [ ] HTML sanitization (DOMPurify)
- [ ] Output encoding
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`

#### CSRF Protection
- [ ] CSRF tokens for state-changing operations
- [ ] SameSite cookies (`strict` or `lax`)
- [ ] Double-submit cookie pattern
- [ ] Origin/Referer header validation

#### Rate Limiting
- [ ] Global rate limiter (100 req/15min)
- [ ] Authentication rate limiter (5 req/15min)
- [ ] AI API rate limiter (30 req/min)
- [ ] Database query rate limiter
- [ ] Redis-based rate limiting

#### Security Headers
- [ ] Helmet.js configured
- [ ] HSTS enabled (production)
- [ ] CSP configured
- [ ] Referrer-Policy set
- [ ] Permissions-Policy configured

### MCP Server Security

- [ ] Authentication tokens configured
- [ ] Token-based authentication middleware
- [ ] Role-based tool authorization
- [ ] Request validation schemas (Zod)
- [ ] Rate limiting per tool
- [ ] Audit logging enabled
- [ ] Error handling (no stack traces in production)

### GPU Worker Security

#### Tailscale VPN
- [ ] Tailscale installed on all workers
- [ ] ACLs configured
- [ ] Tags assigned to workers
- [ ] Nexus Router using Tailscale IPs

#### SSH Hardening
- [ ] Custom SSH port (22122)
- [ ] Root login disabled
- [ ] Password authentication disabled
- [ ] Key-based authentication only
- [ ] Ed25519 keys generated
- [ ] MaxAuthTries set to 3
- [ ] ClientAliveInterval set to 300
- [ ] Strong ciphers configured

#### Firewall
- [ ] UFW enabled
- [ ] Default deny incoming
- [ ] SSH allowed (custom port)
- [ ] Tailscale allowed
- [ ] LLM API restricted to Tailscale network
- [ ] Rate limiting enabled

#### Model Access Control
- [ ] Access policies defined per model
- [ ] User/role validation
- [ ] Token limits enforced
- [ ] Approval workflow for restricted models

### Monitoring & Audit

#### Logging
- [ ] Winston logger configured
- [ ] Structured JSON logging
- [ ] Daily log rotation
- [ ] 90-day retention for security logs
- [ ] 365-day retention for incidents
- [ ] Access logging middleware
- [ ] Security event logging

#### Audit Trail
- [ ] Audit logs table created
- [ ] Partitioned by month
- [ ] Indexes on key columns
- [ ] Audit logger service implemented
- [ ] CRUD operations audited
- [ ] Authentication events audited
- [ ] Admin actions audited

#### Security Scanning
- [ ] Trivy image scanning configured
- [ ] npm audit in CI/CD
- [ ] Semgrep SAST configured
- [ ] TruffleHog secret scanning
- [ ] Checkov IaC scanning
- [ ] Weekly automated scans scheduled

#### Vulnerability Management
- [ ] SLA defined per severity
  - Critical: 24 hours
  - High: 7 days
  - Medium: 30 days
  - Low: 90 days
- [ ] Automated vulnerability tracking
- [ ] GitHub issues for remediation
- [ ] Security team alerts for overdue

---

## Deployment Checklist

### Pre-Deployment

- [ ] All security controls tested in staging
- [ ] Penetration testing completed
- [ ] Security audit passed
- [ ] Secrets rotated
- [ ] Backups verified
- [ ] Incident response plan reviewed
- [ ] Team trained on security procedures

### During Deployment

- [ ] Infisical secrets injected
- [ ] Docker Compose with security configurations
- [ ] Health checks passing
- [ ] SSL certificates valid
- [ ] Firewall rules active
- [ ] Monitoring alerts configured
- [ ] Log aggregation working

### Post-Deployment

- [ ] Security scan all running containers
- [ ] Verify all endpoints require authentication
- [ ] Test rate limiting
- [ ] Verify CSRF protection
- [ ] Check CSP headers
- [ ] Monitor logs for anomalies (24 hours)
- [ ] Perform smoke test of incident response

---

## Ongoing Security Tasks

### Daily

- [ ] Review security logs
- [ ] Check failed authentication attempts
- [ ] Monitor system resources
- [ ] Review Grafana dashboards

### Weekly

- [ ] Review vulnerability scan reports
- [ ] Update dependencies (`pnpm update`)
- [ ] Review access logs
- [ ] Check backup status

### Monthly

- [ ] Rotate secrets (API keys, DB passwords)
- [ ] Review user permissions
- [ ] Test backup restoration
- [ ] Security awareness training
- [ ] Review audit logs

### Quarterly

- [ ] Penetration testing
- [ ] Comprehensive security audit
- [ ] Update security policies
- [ ] Review incident response plan
- [ ] Compliance assessment

### Annually

- [ ] Full security assessment
- [ ] Update threat model
- [ ] Review and update security architecture
- [ ] Third-party security audit
- [ ] Disaster recovery test

---

## Quick Commands

### Rotate Secrets
```bash
./scripts/security/rotate-secrets.sh
```

### Run Security Scans
```bash
./scripts/security/scan.sh
```

### Harden SSH
```bash
./scripts/security/harden-ssh.sh
```

### Configure Firewall
```bash
./scripts/security/configure-firewall.sh
```

### View Security Logs
```bash
tail -f logs/security-$(date +%Y-%m-%d).log
```

### Check Container Security
```bash
trivy image nyra-claude-flow:latest
```

### Audit Dependencies
```bash
pnpm audit
```

---

## Incident Response Quick Reference

### Phase 1: Detect & Analyze
1. Identify the incident type
2. Assess severity
3. Notify incident response team

### Phase 2: Contain
```bash
# Block attacker IP
sudo ufw deny from <attacker_ip>

# Revoke compromised token
# (via Infisical or Redis)

# Stop affected service
docker compose stop <service>

# Capture logs
sudo tar czf /backups/forensics-$(date +%Y%m%d).tar.gz /var/log/
```

### Phase 3: Eradicate
- Remove malware/unauthorized access
- Patch vulnerabilities
- Update credentials

### Phase 4: Recover
- Restore from backups
- Verify integrity
- Gradually restore services

### Phase 5: Document
- Timeline of events
- Root cause analysis
- Lessons learned

---

## Compliance Quick Check

### PCI-DSS (if handling payments)
- [ ] Firewall configured
- [ ] Default passwords changed
- [ ] Cardholder data encrypted
- [ ] Secure transmission
- [ ] Access controls
- [ ] Monitoring and testing

### GDPR (if handling EU data)
- [ ] Data inventory
- [ ] Privacy by design
- [ ] Right to access
- [ ] Right to erasure
- [ ] Breach notification (72h)
- [ ] Privacy policy

---

## Emergency Contacts

| Role | Contact |
|------|---------|
| Security Team | security@nyra.ai |
| DevOps On-Call | PagerDuty |
| Incident Commander | TBD |
| Legal Counsel | legal@nyra.ai |

---

## Additional Resources

- [Full Hardening Guide](./HARDENING-GUIDE.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)

---

**Last Reviewed**: 2026-01-10
**Next Review**: 2026-04-10
