# Security Documentation

Welcome to the Project Nyra Security Documentation. This directory contains comprehensive security hardening guides, checklists, and procedures.

---

## Documents Overview

### [INFISICAL-SETUP-README.md](./INFISICAL-SETUP-README.md)

**Current Infisical setup notes for host-scoped secret injection and rotation.**

**Contents**:

1. Infrastructure Security (Docker, Network, Secrets, API Auth, Rate Limiting)
2. Application Security (Input Validation, SQL Injection Prevention, XSS, CSRF, Headers)
3. MCP Server Security (Authentication, Authorization, Validation, Rate Limiting)
4. GPU Worker Security (Tailscale VPN, SSH Hardening, Firewall, Access Control)
5. Monitoring & Audit (Logging, Audit Trails, Security Scanning, Vulnerability Management)
6. Incident Response Plan
7. Compliance Guidelines (PCI-DSS, GDPR)

**Use this document** before validating host compose stacks or live service
startup.

---

### [SECRET_ROTATION_GUIDE.md](./SECRET_ROTATION_GUIDE.md)

**Quick reference for secret rotation, generated values, and owner-gated follow-up.**

**Contents**:

- Pre-Deployment Checklist (Infrastructure, Application, MCP, GPU, Monitoring)
- Deployment Checklist
- Ongoing Security Tasks (Daily, Weekly, Monthly, Quarterly, Annual)
- Quick Commands
- Incident Response Quick Reference
- Compliance Quick Check

**Use this document** when rotating or staging provider credentials.

### [agent-infra-infisical-review.md](./agent-infra-infisical-review.md)

**Static review of agent infrastructure secret requirements and Infisical coverage.**

**Use this document** when checking whether a host compose stack has the
expected secret paths, sidecars, and runtime mounts.

---

## Quick Start

### For New Deployments

1. Review the [INFISICAL-SETUP-README.md](./INFISICAL-SETUP-README.md) thoroughly
2. Follow the current owner gates in [docs/user-todo](../user-todo/README.md)
3. Run security scripts:
   ```bash
   # Run security scans
   ./scripts/security/scan.sh
   ```
4. Deploy with Infisical secrets injection:
   ```bash
   make agent-infra-validate
   ```
5. Verify security controls post-deployment

### For Existing Deployments

1. Run security audit:
   ```bash
   ./scripts/security/scan.sh
   ```
2. Review findings and prioritize remediation
3. Follow `docs/user-todo/RELEASE-CANDIDATE-MANUAL-GATES.md` for ongoing owner tasks
4. Schedule quarterly security reviews

---

## Security Architecture Overview

### Defense in Depth

Project Nyra implements multiple layers of security:

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Network Security                                   │
│ - Firewall (UFW)                                            │
│ - Network Segmentation (Docker networks)                    │
│ - Tailscale VPN (GPU workers)                               │
│ - TLS/SSL Encryption                                        │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Application Security                               │
│ - Authentication (JWT, API Keys)                            │
│ - Authorization (RBAC)                                      │
│ - Input Validation (Zod)                                    │
│ - Rate Limiting (Redis)                                     │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Data Security                                      │
│ - Encryption at Rest (PostgreSQL, Redis)                   │
│ - Secrets Management (Infisical)                            │
│ - Parameterized Queries (SQL Injection Prevention)          │
│ - Data Sanitization (XSS Prevention)                        │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Container Security                                 │
│ - Non-root users                                            │
│ - Read-only filesystems                                     │
│ - Capability dropping                                       │
│ - Image scanning (Trivy)                                    │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Monitoring & Response                              │
│ - Access Logging (Winston)                                  │
│ - Audit Trails (PostgreSQL)                                 │
│ - Security Scanning (Semgrep, npm audit)                    │
│ - Incident Response Plan                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Security Components

### 1. Secrets Management (Infisical)

- **Purpose**: Centralized secret storage and injection
- **Scope**: API keys, database passwords, JWT secrets
- **Location**: `infra/hosts/*` compose sidecars, `docs/security/`, and
  ignored host-local `.env` files when explicitly enabled.
- **Rotation**: Every 90 days

### 2. Authentication & Authorization

- **JWT**: Stateless authentication with Redis token revocation
- **API Keys**: SHA-256 hashed keys for service authentication
- **RBAC**: Role-based access control (Admin, Developer, Agent, Readonly)
- **Session Management**: Redis-based session storage

### 3. Network Security

- **Docker Networks**: Segmented (frontend, backend, database)
- **Firewall**: UFW with default deny
- **VPN**: Tailscale for GPU worker communication
- **TLS**: Let's Encrypt certificates

### 4. Container Security

- **Base Images**: Alpine (minimal attack surface)
- **Non-root**: All containers run as non-root users
- **Scanning**: Trivy for vulnerability detection
- **Least Privilege**: Dropped capabilities, read-only filesystems

### 5. MCP Server Security

- **Authentication**: Token-based authentication
- **Authorization**: Tool-level permissions
- **Validation**: Zod schemas for all requests
- **Rate Limiting**: Per-tool rate limits

### 6. Monitoring & Audit

- **Logging**: Winston with structured JSON
- **Audit Trail**: PostgreSQL partitioned tables
- **Scanning**: Trivy, Semgrep, npm audit
- **Alerting**: Prometheus + Grafana

---

## Security Scripts

Security automation scripts are located in `scripts/security/`:

| Script                  | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `rotate-secrets.sh`     | Rotate all secrets (API keys, passwords) |
| `scan.sh`               | Run comprehensive security scans         |
| `view-security-logs.sh` | View local generated security reports    |

### Running Security Scripts

```bash
# Make scripts executable
chmod +x scripts/security/*.sh

# Run individual scripts
./scripts/security/scan.sh
./scripts/security/rotate-secrets.sh

# View generated reports
./scripts/security/view-security-logs.sh
```

---

## Threat Model

### Assets to Protect

1. **Customer PII**: Names, addresses, phone numbers, email addresses
2. **Financial Data**: Mortgage applications, credit scores, income information
3. **API Keys**: Anthropic, OpenRouter, E2B, Infisical
4. **AI Models**: Trained models, embeddings, knowledge graphs
5. **System Credentials**: Database passwords, Redis passwords, SSH keys

### Threat Actors

1. **External Attackers**: Opportunistic hackers, targeted attacks
2. **Insider Threats**: Malicious or negligent employees
3. **Supply Chain**: Compromised dependencies or third-party services
4. **AI-Specific**: Prompt injection, model poisoning, data exfiltration

### Attack Vectors

1. **Web Application**: SQL injection, XSS, CSRF, authentication bypass
2. **API**: Rate limit abuse, authentication bypass, data scraping
3. **Infrastructure**: Container escape, network pivoting, privilege escalation
4. **Social Engineering**: Phishing, pretexting, baiting
5. **AI/LLM**: Prompt injection, jailbreaking, model inversion

---

## Compliance

### Financial Industry Regulations

Project Nyra handles mortgage data, requiring compliance with:

- **PCI-DSS**: If processing payments
- **GLBA**: Gramm-Leach-Bliley Act (financial privacy)
- **State Regulations**: Varies by state (e.g., CCPA in California)
- **SOC 2 Type II**: For enterprise customers

### Security Standards

- **OWASP Top 10**: Web application security risks
- **CIS Benchmarks**: Container and infrastructure hardening
- **NIST Cybersecurity Framework**: Identify, Protect, Detect, Respond, Recover

---

## Incident Response

### Severity Levels

| Level         | Description                                    | Response Time  | Escalation    |
| ------------- | ---------------------------------------------- | -------------- | ------------- |
| P0 - Critical | Data breach, system compromise                 | Immediate      | CEO, Legal    |
| P1 - High     | Service outage, authentication bypass          | 1 hour         | CTO, DevOps   |
| P2 - Medium   | Performance degradation, minor vulnerabilities | 4 hours        | Security Team |
| P3 - Low      | UI bugs, informational findings                | 1 business day | Development   |

### Contact Information

- **Security Team**: security@nyra.ai
- **On-Call Rotation**: PagerDuty
- **Legal Counsel**: legal@nyra.ai
- **Incident Commander**: TBD

### Incident Response Phases

1. **Preparation**: Team, tools, procedures
2. **Detection**: Monitoring, alerts, user reports
3. **Analysis**: Assess severity and impact
4. **Containment**: Isolate affected systems
5. **Eradication**: Remove threat, patch vulnerabilities
6. **Recovery**: Restore services, verify integrity
7. **Post-Incident**: Document, lessons learned, update procedures

---

## Security Training

### Required Training

All team members must complete:

- [ ] Security awareness training (annually)
- [ ] Phishing simulation tests (quarterly)
- [ ] Secure coding practices (for developers)
- [ ] Incident response procedures

### Recommended Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [TypeScript Security](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)

---

## Security Tools

### Development Tools

- **Zod**: Input validation and schema definition
- **Helmet**: Security headers for Express
- **CSRF**: Cross-site request forgery protection
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token management

### Security Scanning Tools

- **Trivy**: Container vulnerability scanning
- **Semgrep**: Static application security testing (SAST)
- **TruffleHog**: Secret scanning
- **npm audit**: Dependency vulnerability scanning
- **Checkov**: Infrastructure as Code scanning

### Monitoring Tools

- **Winston**: Structured logging
- **Prometheus**: Metrics collection
- **Grafana**: Visualization and alerting
- **ELK Stack**: Log aggregation and analysis

---

## Vulnerability Disclosure

### Reporting Security Vulnerabilities

If you discover a security vulnerability in Project Nyra:

1. **DO NOT** open a public GitHub issue
2. Email security@nyra.ai with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)
3. Allow 90 days for remediation before public disclosure
4. Coordinate disclosure timing with security team

### Bug Bounty Program

- Status: TBD
- Scope: Web applications, APIs, infrastructure
- Rewards: Based on severity (Critical: $500+, High: $200+, Medium: $100+)

---

## Security Roadmap

### Q1 2026

- [x] Comprehensive security hardening guide
- [ ] Implement all security controls
- [ ] Complete penetration testing
- [ ] Achieve SOC 2 Type I compliance

### Q2 2026

- [ ] Automated security scanning in CI/CD
- [ ] Bug bounty program launch
- [ ] Security awareness training program
- [ ] Quarterly security audits

### Q3 2026

- [ ] Achieve SOC 2 Type II compliance
- [ ] Third-party security audit
- [ ] Advanced threat detection (SIEM)
- [ ] Zero-trust architecture implementation

### Q4 2026

- [ ] PCI-DSS compliance (if needed)
- [ ] Advanced monitoring and alerting
- [ ] Disaster recovery testing
- [ ] Security maturity assessment

---

## Support

For security-related questions or concerns:

- **Email**: security@nyra.ai
- **Slack**: `#security` (internal)
- **Documentation**: This directory

---

## Document Maintenance

- **Owner**: Security Team
- **Last Updated**: 2026-01-10
- **Next Review**: 2026-04-10 (Quarterly)
- **Version**: 1.0

---

## License

This documentation is confidential and proprietary to Project Nyra. Unauthorized distribution is prohibited.

---

**Remember**: Security is everyone's responsibility. When in doubt, ask the security team.
