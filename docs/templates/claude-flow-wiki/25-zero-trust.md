# CLAUDE.md Template: Zero Trust Security Model

**Specialization**: Zero Trust Architecture
**Principle**: Never Trust, Always Verify
**Focus**: Continuous Authentication & Authorization
**Goal**: Assume Compromise

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Trust Model**: Zero Trust
- **Verification**: Continuous
- **Authentication**: Multi-factor

## 🔧 Zero Trust Pillars

### 1. Identity Verification
```
- MFA for all users
- Continuous authentication
- Device health checks
- Behavioral analysis
- Risk scoring
```

### 2. Device Security
```
- Device compliance checks
- Encryption enforced
- Endpoint protection
- OS patch requirements
- Anti-malware detection
```

### 3. Network Segmentation
```
- Microsegmentation
- Network isolation
- VPC per tenant
- Private endpoints
- Network policies
```

### 4. Access Control
```
- Least privilege principle
- Time-based access
- Geo-fencing
- Context-aware policies
- Just-in-time access
```

### 5. Monitoring & Analytics
```
- Real-time threat detection
- Anomaly detection
- User behavior analytics
- Log aggregation
- Continuous auditing
```

## 🚀 Zero Trust Implementation

### Identity & Access Management
```yaml
# Okta/Azure AD configuration
apiVersion: v1
kind: AuthenticationPolicy
metadata:
  name: zero-trust-policy
spec:
  requireMFA: true
  deviceCompliance: true
  geoFencing: true
  sessionDuration: 30m
  riskScoring: enabled
  behaviors:
    - anomalousLogin: block
    - impossibleTravel: alert
    - suspiciousActivity: challenge
```

### Continuous Verification
```typescript
// Every request requires verification
async function verifyRequest(request: Request): Promise<boolean> {
  const checks = await Promise.all([
    verifyIdentity(request.user),
    verifyDevice(request.deviceId),
    verifyLocation(request.ipAddress),
    verifyTiming(request.timestamp),
    verifyBehavior(request.user, request.action),
  ]);

  return checks.every(result => result === true);
}
```

## 📊 Zero Trust Metrics

- Authentication failures: {{FAILURES_COUNT}}
- Blocked requests: {{BLOCKED_COUNT}}
- False positives: {{FALSE_POSITIVES}}
- Mean time to detect: {{MTTD}}

## 📋 Zero Trust Implementation Checklist

- [ ] Identity verification system
- [ ] MFA implementation
- [ ] Device compliance checks
- [ ] Network segmentation
- [ ] Continuous monitoring
- [ ] Anomaly detection
- [ ] Incident response integration
- [ ] Compliance validation

---

**Generated from**: claude-flow CLAUDE.md Zero Trust Template
