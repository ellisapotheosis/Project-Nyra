# CLAUDE.md Template: Compliance-Focused Development

**Specialization**: Regulatory Compliance
**Standards**: {{COMPLIANCE_STANDARDS}} (HIPAA/SOX/GDPR/PCI-DSS)
**Focus**: Audit Trail, Data Protection
**Certification**: Industry Compliance

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Compliance Standard**: {{STANDARD}}
- **Audit Frequency**: {{AUDIT_FREQUENCY}}
- **Certifying Body**: {{CERTIFYING_BODY}}

## 🔧 Compliance Requirements

### HIPAA (Healthcare)
```
- PHI data protection
- Audit logging (2+ years)
- Access controls
- Encryption (at rest & transit)
- Business associate agreements
- Incident breach notification
```

### GDPR (EU Data Protection)
```
- Data subject rights
- Privacy by design
- Data retention limits
- DPA agreements
- Consent management
- Right to be forgotten
- Data portability
```

### SOX (Financial Controls)
```
- Financial data controls
- Access restrictions
- Change management
- Disaster recovery
- Audit trails
- Executive certification
```

### PCI-DSS (Payment Card)
```
- Cardholder data protection
- Network segmentation
- Access controls
- Encryption
- Vulnerability management
- Security testing
- Monitoring & logging
```

## 🚀 Compliance Implementation

### Data Governance
```javascript
// Audit logging
async function logComplianceEvent(event) {
  const record = {
    timestamp: new Date().toISOString(),
    user: getCurrentUser(),
    action: event.action,
    resource: event.resource,
    changes: event.changes,
    ipAddress: getClientIP(),
    userAgent: getUserAgent(),
  };

  await auditLog.insert(record);
  await archiveLog(record); // 7-year retention
}
```

### Data Classification
```
PUBLIC:     No restrictions
INTERNAL:   Company only
CONFIDENTIAL: Limited access
RESTRICTED:  Executive only
```

## 📊 Compliance Metrics

- Audit coverage: {{AUDIT_COVERAGE}}%
- Data retention: {{RETENTION_DAYS}} days
- Access violations: {{VIOLATIONS_COUNT}}
- Compliance score: {{COMPLIANCE_SCORE}}

## 📋 Compliance Checklist

- [ ] Compliance standard selected
- [ ] Policy documentation
- [ ] Data classification system
- [ ] Audit logging enabled
- [ ] Access controls implemented
- [ ] Encryption configured
- [ ] DPA agreements signed
- [ ] Training completed
- [ ] Audit trail validated
- [ ] Incident response plan
- [ ] 3rd party vendor compliance
- [ ] Regular compliance audits

---

**Generated from**: claude-flow CLAUDE.md Compliance Template
