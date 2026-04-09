# CLAUDE.md Template: Security-Focused Development

**Specialization**: Security Audit & Penetration Testing
**Focus**: Vulnerability Detection
**Compliance**: OWASP Top 10
**Testing**: Comprehensive Security

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized

# Spawn security-focused agents
npx @claude-flow/cli@latest agent spawn -t coder --name security-architect --capabilities "security,threat-modeling"
npx @claude-flow/cli@latest agent spawn -t tester --name security-auditor --capabilities "pentest,vulnerability-scanning"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Attack Surface**: {{ATTACK_SURFACE}}
- **Threat Level**: {{THREAT_LEVEL}} (Low/Medium/High/Critical)
- **Compliance**: {{COMPLIANCE_REQUIREMENTS}}

## 🔧 Security Audit Process

### 1. Threat Modeling
```
- Identify assets
- Map threat actors
- Document attack vectors
- Assess impact & likelihood
- Prioritize mitigations
```

### 2. Code Review
```
- Input validation
- Authentication/Authorization
- Cryptography usage
- Secret management
- Error handling
- Injection vulnerabilities
```

### 3. Infrastructure Review
```
- Network segmentation
- Access controls
- Encryption in transit/rest
- Firewall configuration
- Load balancer security
```

### 4. Penetration Testing
```
- OWASP API Security Top 10
- Common Weakness Enumeration (CWE)
- Manual testing
- Automated scanning
- Social engineering tests
```

## 🚀 Security Scanning Tools

### Static Analysis
```bash
# JavaScript/TypeScript
npm install --save-dev eslint-plugin-security
npm install --save-dev @microsoft/eslint-plugin-security

# Python
pip install bandit
bandit -r src/

# Java
mvn spotbugs:check
```

### Dynamic Analysis
```bash
# OWASP ZAP
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://app.example.com

# Burp Suite
burpsuite --project=/path/to/project.burp
```

## 🔒 Security Checklist

### OWASP Top 10 Mitigation
```
[ ] A1: Broken Access Control - Role-based access, least privilege
[ ] A2: Cryptographic Failures - TLS, encryption at rest
[ ] A3: Injection - Input validation, parameterized queries
[ ] A4: Insecure Design - Threat modeling, secure defaults
[ ] A5: Security Misconfiguration - Hardened configs, defaults changed
[ ] A6: Vulnerable Components - Dependency scanning, updates
[ ] A7: Authentication Failures - MFA, strong passwords
[ ] A8: Software/Data Integrity - Code signing, integrity checks
[ ] A9: Logging & Monitoring - Comprehensive logging
[ ] A10: SSRF - Input validation, network segmentation
```

### Data Protection
```
[ ] Data classification implemented
[ ] Encryption at rest configured
[ ] Encryption in transit (TLS 1.3)
[ ] Key management system
[ ] PII data masking
[ ] Audit logging
[ ] Access controls
[ ] Data retention policy
```

### API Security
```
[ ] OAuth2/OIDC implemented
[ ] Rate limiting configured
[ ] API key rotation
[ ] Request validation
[ ] Response filtering
[ ] CORS properly configured
[ ] API versioning strategy
```

## 📊 Security Metrics

- Vulnerabilities found: {{VULN_COUNT}}
- Critical/High: {{CRITICAL_COUNT}}
- False positives: {{FALSE_POSITIVE_COUNT}}
- Time to fix: {{TIME_TO_FIX}}

## 📋 Security Audit Checklist

- [ ] Threat model completed
- [ ] Code review completed
- [ ] Security scanning enabled
- [ ] Penetration testing scheduled
- [ ] Vulnerability tracking system
- [ ] Patch management process
- [ ] Incident response plan
- [ ] Security training completed
- [ ] Compliance assessment done
- [ ] Security documentation

---

**Generated from**: claude-flow CLAUDE.md Security Audit Template
