# OpenClaw Operations & Security Procedures

## Overview

This document covers operational security procedures for OpenClaw deployment, including secret management, access control, and security hardening practices.

---

## Table of Contents

1. [Secret Management](#secret-management)
2. [Access Control (RBAC)](#access-control-rbac)
3. [Security Hardening Checklist](#security-hardening-checklist)
4. [Security Monitoring](#security-monitoring)
5. [Troubleshooting](#troubleshooting)

---

## Secret Management

### 3.1 Required vs Optional Secrets

#### Required Core Secrets (Must be rotated regularly)

| Variable | Purpose | Rotation Frequency | Storage Requirement |
|----------|---------|-------------------|---------------------|
| `OPENAI_API_KEY` | Core LLM access | Every 30 days | Encrypted secrets manager |
| `MEM0_API_KEY` | Memory platform access | Every 30 days | Encrypted secrets manager |
| `OPENCLAW_GATEWAY_TOKEN` | Gateway authentication | Every 14 days | Encrypted secrets manager |
| `LITELLM_MASTER_KEY` | LiteLLM admin access | Every 14 days | Encrypted secrets manager |

#### Optional Integration Secrets

| Variable | Purpose | Rotation Frequency | Storage Requirement |
|----------|---------|-------------------|---------------------|
| `OPENROUTER_API_KEY` | Backup LLM provider | Every 30 days | Encrypted secrets manager |
| `TELEGRAM_BOT_TOKEN` | Telegram integration | Every 90 days | Environment-specific |
| `DISCORD_BOT_TOKEN` | Discord integration | Every 90 days | Environment-specific |
| `TWENTY_API_KEY` | Twenty CRM integration | Every 90 days | Environment-specific |
| `N8N_API_KEY` | n8n workflow automation | Every 90 days | Environment-specific |
| `ACTIVEPIECES_API_KEY` | ActivePieces automation | Every 90 days | Environment-specific |
| `INFI_*` | Infintia exchange API | Every 30 days | Encrypted secrets manager |

#### Optional Service Account Secrets

| Variable | Purpose | Rotation Frequency | Storage Requirement |
|----------|---------|-------------------|---------------------|
| `UNMUTE_OPENAI_API_KEY` | Voice service | Every 30 days | Encrypted secrets manager |
| `UNMUTE_PUBLIC_BASE_URL` | Voice service endpoint | N/A | Environment-specific |

### 3.2 Secret Rotation Procedures

#### Manual Rotation Procedure

```bash
# 1. Revoke old secret from secrets manager
# Example: AWS Secrets Manager
aws secretsmanager rotate-secret \
    --secret-id OPENAI_API_KEY \
    --rotation-lambda-arn arn:aws:lambda:us-east-1:123456789:lambda/rotate-openai \
    --rotation-rulesAutomateRotation=true,WindowInDays=30

# 2. Update environment variables in all affected services
# 3. Restart services to pick up new secrets
# 4. Update any hardcoded references in configuration
```

#### Automation with HashiCorp Vault

```hcl
# vault_secrets.tf
resource "vault_secret" "openai" {
  path = "openclaw/openai/api"
  data_json = jsonencode({
    api_key = var.openai_api_key
    rotate_after = "30d"
  })
  lease_duration = 7200
}
```

### 3.3 Environment-Specific Secret Handling

#### Production (Encrypted Secrets Manager)

```bash
# Load from secrets manager
export OPENAI_API_KEY=$(vault read -field=api_key secret/openai/key)
export MEM0_API_KEY=$(vault read -field=api_key secret/mem0/key)
export OPENCLAW_GATEWAY_TOKEN=$(vault read -field=token secret/openclaw/gateway)
```

#### Staging (Environment Variables with Warning)

```bash
# WARNING: Use temporary secrets in staging only
# Set expiration and monitor for unauthorized access
export OPENAI_API_KEY="staging_temp_key_XXX"  # Expires in 7 days
```

#### Development (Local Secrets)

```bash
# Use a local .env file with clear labeling
# NEVER commit .env files to version control
cp .env.example .env.local
# Edit .env.local with local secrets only
```

---

## Access Control (RBAC)

### 4.1 Master Key Usage and Protection

#### `LITELLM_MASTER_KEY` Security Guidelines

**Purpose:**
- Grants administrative access to LiteLLM proxy
- Can create/delete models, view usage analytics
- Bypasses normal authentication checks

**Security Requirements:**
1. **NEVER** commit master key to version control
2. Use separate keys for development vs production
3. Implement IP whitelisting if possible
4. Monitor all requests using the master key
5. Rotate immediately upon compromise

**Example RBAC Configuration:**

```yaml
# liteailm_master_key_config.yaml
master_key_admin:
  allowed_operations:
    - create_model
    - delete_model
    - view_analytics
    - manage_organizations
  restricted_operations:
    - execute_user_commands
    - access_user_data
  allowed_ips:
    - "10.0.0.0/8"  # Internal network only
    - "203.0.113.0/24"  # Approved corporate IPs
```

#### Gateway Token Configuration

```bash
# Example token with scopes
OPENCLAW_GATEWAY_TOKEN="sk-gw-xxxxxxxx-xxxxxxxx-xxxxxxxx:read,write:tools"

# Scopes:
# - read: Can read model outputs
# - write: Can invoke tools
# - tools: Can access MCP tools
# - admin: Full administrative access (use with caution)
```

### 4.2 Tool Policy and Access Control

#### Default Tool Policy (`openclaw.json`)

```json
{
  "allowed": [
    "mcp",
    "http_fetch",
    "task"
  ],
  "denied": [
    "shell_exec",
    "host_fs",
    "docker_sock",
    "raw_network_scan"
  ]
}
```

#### Tool Policy Security Implications

| Tool | Security Risk | Mitigation |
|------|---------------|------------|
| `mcp` | Sandboxed tool execution | Use only trusted MCP servers |
| `http_fetch` | External API calls | Allowlist only trusted domains |
| `task` | Task orchestration | Restrict to approved task types |
| `shell_exec` | Remote code execution | **DENIED** - critical risk |
| `host_fs` | Host file system access | **DENIED** - data exfiltration risk |
| `docker_sock` | Container escape | **DENIED** - critical risk |
| `raw_network_scan` | Network reconnaissance | **DENIED** - information gathering |

#### Custom Tool Policy Example

```json
{
  "allowed": [
    "mcp:read-only",
    "http_fetch:allowlist",
    "task:standard"
  ],
  "denied": [
    "shell_exec",
    "host_fs",
    "docker_sock",
    "raw_network_scan",
    "filesystem:write"
  ],
  "http_fetch_allowlist": [
    "https://api.openai.com",
    "https://api.mem0.ai",
    "https://*.n8n.io",
    "https://*.twentycrm.com"
  ]
}
```

---

## Security Hardening Checklist

### 5.1 Pre-Deployment Checklist

**Before deploying OpenClaw services:**

- [ ] All required secrets loaded from encrypted storage
- [ ] `.env` files removed from version control
- [ ] `openclaw.json` configured with restrictive tool policies
- [ ] Network segmentation rules applied
- [ ] Security headers configured on HTTP services
- [ ] Rate limiting enabled (if supported by provider)
- [ ] CORS policies configured appropriately
- [ ] Logging enabled for security events

### 5.2 Runtime Security Checklist

**Ongoing security requirements:**

- [ ] Secrets rotated per schedule (30 days for API keys, 14 days for admin keys)
- [ ] No hardcoded secrets in source code
- [ ] All network endpoints exposed only via `nexus-router`
- [ ] Health checks passing (`/healthz` endpoint)
- [ ] Monitoring alerts configured for security events
- [ ] Unusual tool invocation attempts logged

### 5.3 Container Security Checklist

**Docker security hardening:**

```dockerfile
# Example hardened Dockerfile for OpenClaw
FROM node:20-alpine as base

# Non-root user
RUN addgroup -g 1000 -S node && \
    adduser -S node -u 1000

# Minimal runtime image
FROM base as runtime
USER node
WORKDIR /app

# Read-only filesystem
RUN chmod -R 555 /app && \
    chmod -R 755 /data

# No shell execution capability
USER node
CMD ["node", "dist/index.js"]
```

---

## Security Monitoring

### 6.1 Health Check Monitoring

The OpenClaw system uses health checks with exponential backoff:

```yaml
# docker-compose.yaml health check
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3401/healthz"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### 6.2 Security Event Monitoring

**Events to monitor:**

1. **Failed authentication attempts**
   - Log location: Gateway access logs
   - Threshold: >100 attempts/minute → alert

2. **Unusual tool policy violations**
   - Log location: OpenClaw access logs
   - Alert on any denied tool access attempt

3. **Rate limit violations**
   - Log location: OpenAI rate limit headers
   - Investigate >10% error rate increase

4. **Container escape attempts**
   - Monitor for:
     - Docker socket access patterns
     - Privilege escalation indicators
     - Host filesystem modifications

### 6.3 Log Aggregation

```bash
# Collect security logs from all services
docker-compose logs -f --tail=100 openclaw-gateway | grep -E "auth|error|warn"
docker-compose logs -f --tail=100 openclaw-mvp | grep -E "tool|policy|violation"
```

---

## Troubleshooting

### 7.1 Common Security Issues

#### Issue: Tool access denied

**Symptoms:** MCP tool requests failing with 403 errors

**Diagnosis:**
```bash
# Check current tool policy
cat openclaw/openclaw.json | jq '.denied'

# Review recent policy changes
docker-compose logs openclaw-mvp --tail=50 | grep -i "policy\|tool"
```

**Resolution:**
- Verify tool is in allowed list
- Check `OPENCLAW_TOOL_POLICY` environment variable
- Ensure `openclaw.json` is mounted correctly

#### Issue: Secret rotation causing service failures

**Symptoms:** Services restart immediately after secret rotation

**Diagnosis:**
```bash
# Check secret validity
vault read -field=api_key secret/openai/key > /tmp/test_key

# Restart services and check health
docker-compose restart openclaw-mvp
docker health openclaw-mvp
```

**Resolution:**
- Verify secret format matches expected schema
- Check for hardcoded references to old secrets
- Update all environment variables across all replicas

#### Issue: Network connectivity to MCP servers

**Symptoms:** MCP tool timeouts connecting to `nexus-router`

**Diagnosis:**
```bash
# Test internal connectivity
curl -v http://nexus-router:8080/mcp
```

**Resolution:**
- Verify `nexus-router` is running
- Check `NEXUS_MCP_URL` environment variable
- Review network segmentation rules

### 7.2 Emergency Procedures

#### Secret Compromise Response

1. **Immediate:**
   - Rotate all affected secrets
   - Revoke compromised API keys
   - Monitor for unauthorized access

2. **Within 1 hour:**
   - Review access logs for suspicious activity
   - Identify scope of compromise
   - Notify security team

3. **Within 24 hours:**
   - Conduct incident review
   - Update rotation schedule if needed
   - Document lessons learned

---

## References

- [OpenClaw Security Baseline](./openclaw-security.md)
- [Compliance Guidelines](./openclaw-compliance.md)
- [Incident Response Runbook](./openclaw-incident-response.md)
- [Network Segmentation](./openclaw-network.md)
- [Supply Chain Security](./openclaw-supply-chain.md)
