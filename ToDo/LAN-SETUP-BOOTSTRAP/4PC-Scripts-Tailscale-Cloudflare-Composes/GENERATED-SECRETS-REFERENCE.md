# Project Nyra - Generated Secrets Reference

**Generated**: 2026-02-10  
**Purpose**: Repository of all user-managed secrets for Project Nyra infrastructure

---

## Overview

This document contains **15 cryptographically secure secrets** generated for Project Nyra. These are secrets that:
- ✅ **You would set yourself** (passwords, internal keys, encryption keys)
- ❌ **NOT** provider-supplied keys (those are sourced externally)

### Categories of Secrets

1. **Database Passwords** - PostgreSQL, Redis, Neo4j
2. **JWT & Encryption Keys** - Application-level security
3. **API Keys** - Internal service authentication
4. **Network Secrets** - VPN and tunnel credentials
5. **Service Secrets** - Individual service tokens

---

## 1. Database Passwords

These are passwords for databases that you host yourself (not cloud services).

### PostgreSQL Master Password
```
Name: POSTGRES_PASSWORD
Usage: PostgreSQL database authentication
Paths: /databases/postgres, /machines/orchestrator, /machines/worker-rtx3090ti, /machines/worker-rtx5090
Secret: a8019fd47de26c43f68432f91ac9b8914a003d4f9df01978f2ac9efeab9c7ab3
Length: 64 hex characters (32 bytes)
Strength: Excellent (cryptographic quality)
Rotation: Every 90 days
```

**How to use:**
```bash
# In .env files
POSTGRES_PASSWORD=a8019fd47de26c43f68432f91ac9b8914a003d4f9df01978f2ac9efeab9c7ab3

# In PostgreSQL connection string
postgresql://postgres:a8019fd47de26c43f68432f91ac9b8914a003d4f9df01978f2ac9efeab9c7ab3@localhost:5432/nyra

# In docker-compose.yml
environment:
  POSTGRES_PASSWORD: a8019fd47de26c43f68432f91ac9b8914a003d4f9df01978f2ac9efeab9c7ab3
```

### Redis Password
```
Name: REDIS_PASSWORD
Usage: Redis cache & session store authentication
Paths: /databases/redis, /machines/orchestrator, /machines/worker-rtx3090ti, /machines/worker-rtx5090
Secret: dcae8e40c9f8941ad39d79b8cc78ca6fc3faffa33c36665d39dccccf45f57e43
Length: 64 hex characters (32 bytes)
Strength: Excellent (cryptographic quality)
Rotation: Every 90 days
```

### Neo4j/FalkorDB Password
```
Name: FALKORDB_PASSWORD (or NEO4J_PASSWORD)
Usage: FalkorDB/Neo4j graph database authentication
Paths: /databases/falkordb, /machines/orchestrator
Secret: bfbbd5f13608e8e2397bb3543a255893943a4d4283c77562349ac1d138847dbc
Length: 64 hex characters (32 bytes)
Strength: Excellent (cryptographic quality)
Rotation: Every 90 days
```

---

## 2. JWT & Encryption Keys

These keys secure application-level authentication and data encryption.

### Master JWT Secret (Application-wide)
```
Name: JWT_SECRET
Usage: Signing all JWT tokens for API authentication
Paths: /machines/orchestrator, /machines/worker-rtx3090ti, /machines/worker-rtx5090
Secret: 8edcc11a5eb595288bcfb22ee2b0016b56402bb466ca2eea8ae295a52bfc4e49
Length: 64 hex characters (32 bytes)
Algorithm: HMAC-SHA256
Expiration: 24 hours per token
Rotation: Every 90 days
Impact: Invalidates all existing tokens when rotated
```

### JWT Refresh Secret (Token refresh)
```
Name: JWT_REFRESH_SECRET
Usage: Signing refresh tokens for long-lived sessions
Paths: /machines/orchestrator
Secret: fe80c6a30177121752ce763eec187df7a9c28818f9b603d78069cc0e04c34617
Length: 64 hex characters (32 bytes)
Algorithm: HMAC-SHA256
Expiration: 30 days per refresh token
Rotation: Every 90 days
```

### Master Encryption Key
```
Name: ENCRYPTION_KEY
Usage: Encrypting sensitive data at rest (database fields, config values)
Paths: /machines/orchestrator, /machines/worker-rtx3090ti, /machines/worker-rtx5090
Secret: c7bd49505f53bc003dcad969f424e594cc7da6f74896f66559fd5b928cdb7b17
Length: 64 hex characters (32 bytes)
Algorithm: AES-256-CBC
Standard: NIST approved
Rotation: Every 180 days (requires data re-encryption)
WARNING: Changing this invalidates all encrypted data
```

### Encryption IV (Initialization Vector)
```
Name: ENCRYPTION_IV
Usage: IV for AES-256-CBC encryption (must be random per encryption)
Paths: /machines/orchestrator
Secret: 0019d250945ef4fca816c2ce1558a52fd24b79525dc69b1050d5b15305e8e420
Length: 64 hex characters (32 bytes)
Note: In production, this should be randomly generated per encryption operation
Rotation: Not needed (IVs are unique per operation)
```

---

## 3. API Keys (Internal Services)

These authenticate communication between your internal services.

### Orchestrator API Key
```
Name: ORCHESTRATOR_API_KEY
Usage: Authentication for workers to communicate with orchestrator
Paths: /machines/orchestrator (define), /machines/worker-rtx3090ti, /machines/worker-rtx5090
Secret: 1ca2a9dbc839981adfeb6611ab56980c433d378f10a89601be6c6b60e05e4c0a
Length: 64 hex characters (32 bytes)
Scope: Worker health reports, metrics submission
Rotation: Every 90 days
Multiple workers: Use same key OR create unique keys per worker
```

### Letta API Key (Memory Service)
```
Name: LETTA_API_KEY
Usage: Authentication for agents accessing Letta memory service
Paths: /clients/letta, /machines/orchestrator, /machines/worker-rtx3090ti, /machines/worker-rtx5090
Secret: 6bc60330958a6aa0bb67fa9e9de4e1580fed71bb8119b6d493085c33d31dad23
Length: 64 hex characters (32 bytes)
Scope: Conversation memory access, agent memory management
Rotation: Every 90 days
Usage: `Authorization: Bearer 6bc60330...`
```

### Qdrant API Key (Vector Database)
```
Name: QDRANT_API_KEY
Usage: Authentication for vector similarity searches
Paths: /databases/qdrant, /machines/orchestrator
Secret: 7f718f652298e11f07d89ebdffad2e132ba5d0e400551bbd6e9e4f78c561233c
Length: 64 hex characters (32 bytes)
Scope: Embedding storage, similarity search
Rotation: Every 90 days
Usage: `api-key: 7f718f65...`
```

### Nexus Router Admin Token
```
Name: NEXUS_ADMIN_TOKEN
Usage: Administrative access to Nexus MCP router configuration
Paths: /router/nexus
Secret: aff088e0d0c8de7d64b3d06ce70eba7420f1f2a1d16a6d2e2e385f4db76ebb2c
Length: 64 hex characters (32 bytes)
Scope: Router config changes, service registration
Rotation: Every 90 days
Access: Admin panel, configuration API
```

---

## 4. Network & VPN Secrets

These authenticate secure network communication between machines.

### Tailscale API Key
```
Name: TAILSCALE_API_KEY
Usage: Managing Tailscale networks via API
Paths: /clients/tailscale
Secret: 3d27eecb6d4ea60c35b4093bfadfc84142cbd03983703031f2bcef1aa50f6f5d
Length: 64 hex characters (32 bytes)
Scope: Device management, ACL configuration
Rotation: Every 90 days
Source: Generated from Tailscale dashboard → Account → API access
Note: Different from auth keys; used for API calls
```

### Tailscale Auth Key
```
Name: TAILSCALE_AUTH_KEY
Usage: Authenticating new devices to Tailscale network
Paths: /clients/tailscale
Secret: 82c6d518ad74585a04c8feae297d64a276c4dd1571a5961ecdccfaeee49710d3
Length: 64 hex characters (32 bytes)
Scope: Device enrollment/provisioning
Rotation: Generate new key after revoking old one
Source: Tailscale dashboard → Auth Keys
Lifespan: Can set expiration (recommend 7-30 days)
Usage: `tailscale up --authkey=82c6d518...`
```

### Cloudflare Tunnel Token
```
Name: CLOUDFLARE_TUNNEL_TOKEN
Usage: Authenticating Cloudflare tunnel daemon (cloudflared)
Paths: /clients/cloudflare
Secret: 3c7dd1eb0a7ff37df8c93356da99925d4fb60c431859624e7ab0fa0cb9fc2be5
Length: 64 hex characters (32 bytes)
Scope: Secure tunnel connection to Cloudflare edge
Rotation: Regenerate from Cloudflare dashboard
Source: Cloudflare Zero Trust → Networks → Tunnels → [Your tunnel] → Token
Usage: In cloudflared config or `cloudflared tunnel run --token=3c7dd1eb...`
```

---

## 5. LMCache & Cache Passwords

### LMCache Redis Password
```
Name: LMCACHE_REDIS_PASSWORD
Usage: Authentication for KV cache offloading to Redis
Paths: /machines/worker-rtx3090ti, /machines/worker-rtx5090
Secret: d4ac11e660962dabfbb9555fbc8908990c074dcc18d276a03971f9bb45ee09a8
Length: 64 hex characters (32 bytes)
Scope: vLLM ↔ Redis KV cache operations
Note: Same as REDIS_PASSWORD or create separate instance
Rotation: Every 90 days
```

---

## Mapping to Infisical Paths

### How These Secrets Map to Your Infisical Structure

```
/shared/
  shared-base/
    DEFAULT_TIMEOUT_S = "30"  (non-secret)
    LOG_LEVEL = "info"  (non-secret)
  shared-network/
    INTERNAL_NETWORK = "192.168.1.0/24"  (non-secret)

/machines/
  orchestrator/
    POSTGRES_PASSWORD ← Secret #1
    REDIS_PASSWORD ← Secret #2
    JWT_SECRET ← Secret #4
    JWT_REFRESH_SECRET ← Secret #5
    ENCRYPTION_KEY ← Secret #6
    ENCRYPTION_IV ← Secret #7
    ORCHESTRATOR_API_KEY ← Secret #8
    TAILSCALE_API_KEY ← Secret #11
    TAILSCALE_AUTH_KEY ← Secret #12
    CLOUDFLARE_TUNNEL_TOKEN ← Secret #13

  worker-rtx3090ti/
    POSTGRES_PASSWORD ← Secret #1 (shared)
    REDIS_PASSWORD ← Secret #2 (shared)
    JWT_SECRET ← Secret #4 (shared)
    ORCHESTRATOR_API_KEY ← Secret #8 (shared)
    LETTA_API_KEY ← Secret #9
    QDRANT_API_KEY ← Secret #10
    LMCACHE_REDIS_PASSWORD ← Secret #2 (shared Redis)
    
  worker-rtx5090/
    POSTGRES_PASSWORD ← Secret #1 (shared)
    REDIS_PASSWORD ← Secret #2 (shared)
    JWT_SECRET ← Secret #4 (shared)
    ORCHESTRATOR_API_KEY ← Secret #8 (shared)
    LETTA_API_KEY ← Secret #9 (shared)
    QDRANT_API_KEY ← Secret #10 (shared)
    LMCACHE_REDIS_PASSWORD ← Secret #2 (shared Redis)

/clients/
  cloudflare/
    CLOUDFLARE_TUNNEL_TOKEN ← Secret #13
  tailscale/
    TAILSCALE_API_KEY ← Secret #11
    TAILSCALE_AUTH_KEY ← Secret #12

/databases/
  postgres/
    POSTGRES_PASSWORD ← Secret #1
  redis/
    REDIS_PASSWORD ← Secret #2
  falkordb/
    FALKORDB_PASSWORD ← Secret #3

/router/
  nexus/
    NEXUS_ADMIN_TOKEN ← Secret #9
    JWT_SECRET ← Secret #4 (shared)
```

---

## Installation Instructions

### Step 1: Store Secrets in Infisical

Using the bulk import script:

```powershell
# First, update your .env template files with these secrets
# Then run the import script
.\scripts\bulk-import-smart.ps1 -Env dev

# For staging
.\scripts\bulk-import-smart.ps1 -Env staging

# For production
.\scripts\bulk-import-smart.ps1 -Env prod
```

### Step 2: Per-Environment Variations

**Development (dev)**
- Use these generated secrets as-is
- Shorter rotation intervals (every 30 days)

**Staging**
- Same secrets OR regenerate for isolation
- Medium rotation intervals (every 90 days)

**Production**
- MUST use different secrets
- Shorter rotation intervals (every 30 days)
- Store in AWS Secrets Manager or Vault as backup

### Step 3: Populate Worker `.env` Files

For **RTX 3090 Ti Worker**:
```bash
# File: machines.worker-rtx3090ti-complete.env
POSTGRES_PASSWORD=a8019fd47de26c43f68432f91ac9b8914a003d4f9df01978f2ac9efeab9c7ab3
REDIS_PASSWORD=dcae8e40c9f8941ad39d79b8cc78ca6fc3faffa33c36665d39dccccf45f57e43
JWT_SECRET=8edcc11a5eb595288bcfb22ee2b0016b56402bb466ca2eea8ae295a52bfc4e49
ORCHESTRATOR_API_KEY=1ca2a9dbc839981adfeb6611ab56980c433d378f10a89601be6c6b60e05e4c0a
LETTA_API_KEY=6bc60330958a6aa0bb67fa9e9de4e1580fed71bb8119b6d493085c33d31dad23
QDRANT_API_KEY=7f718f652298e11f07d89ebdffad2e132ba5d0e400551bbd6e9e4f78c561233c
LMCACHE_REDIS_PASSWORD=d4ac11e660962dabfbb9555fbc8908990c074dcc18d276a03971f9bb45ee09a8
```

For **RTX 5090 Worker**:
```bash
# File: machines.worker-rtx5090-complete.env
POSTGRES_PASSWORD=a8019fd47de26c43f68432f91ac9b8914a003d4f9df01978f2ac9efeab9c7ab3
REDIS_PASSWORD=dcae8e40c9f8941ad39d79b8cc78ca6fc3faffa33c36665d39dccccf45f57e43
JWT_SECRET=8edcc11a5eb595288bcfb22ee2b0016b56402bb466ca2eea8ae295a52bfc4e49
ORCHESTRATOR_API_KEY=1ca2a9dbc839981adfeb6611ab56980c433d378f10a89601be6c6b60e05e4c0a
LETTA_API_KEY=6bc60330958a6aa0bb67fa9e9de4e1580fed71bb8119b6d493085c33d31dad23
QDRANT_API_KEY=7f718f652298e11f07d89ebdffad2e132ba5d0e400551bbd6e9e4f78c561233c
LMCACHE_REDIS_PASSWORD=d4ac11e660962dabfbb9555fbc8908990c074dcc18d276a03971f9bb45ee09a8
```

---

## Secret Rotation Procedure

### 90-Day Rotation (Standard)

```bash
#!/bin/bash
# rotate-secrets.sh

# 1. Generate new secrets
new_postgres=$(openssl rand -hex 32)
new_redis=$(openssl rand -hex 32)
new_jwt=$(openssl rand -hex 32)

# 2. Update Infisical
infisical secrets set --path=/databases/postgres POSTGRES_PASSWORD "$new_postgres" --env=prod
infisical secrets set --path=/databases/redis REDIS_PASSWORD "$new_redis" --env=prod
infisical secrets set --path=/machines/orchestrator JWT_SECRET "$new_jwt" --env=prod

# 3. Redeploy affected services
docker-compose restart postgres redis orchestrator

# 4. Monitor for errors
docker-compose logs -f orchestrator

# 5. Update backup (print to file for manual backup)
echo "New secrets generated: $(date)" >> ./backups/secret-rotation-log.txt
```

### Immediate Rotation (Suspected Compromise)

```bash
#!/bin/bash
# emergency-rotate-secrets.sh

# Generate completely new secrets
# Do NOT use previous values
for i in {1..15}; do
  echo "Secret $i: $(openssl rand -hex 32)"
done

# Update all services SIMULTANEOUSLY
# Avoid service downtime during key rotation

# Verify all services connected with new keys
curl -H "Authorization: Bearer <new_key>" http://localhost:6100/health
```

---

## Security Checklist

- [ ] **Never commit secrets to git** - Only `.env.example` with placeholders
- [ ] **Never share secrets in plaintext** - Use Infisical, AWS Secrets Manager, or Vault
- [ ] **Never log secrets** - Configure logging to exclude sensitive values
- [ ] **Never hardcode secrets** - Always use environment variables
- [ ] **Rotate every 90 days** - Set calendar reminder
- [ ] **Backup secrets** - Store encrypted backup of Infisical credentials
- [ ] **Audit access** - Review who accessed secrets in Infisical logs
- [ ] **Monitor rotation** - Alert on missing secrets after rotation date
- [ ] **Test rotation** - Verify new secrets work before deleting old ones
- [ ] **Document changes** - Keep changelog of secret modifications

---

## Testing Secret Installation

```bash
# Test database connection
psql -U postgres -h localhost -p 5432 -c "SELECT version();" << EOF
a8019fd47de26c43f68432f91ac9b8914a003d4f9df01978f2ac9efeab9c7ab3
EOF

# Test Redis
redis-cli -h localhost -p 6379 -a dcae8e40c9f8941ad39d79b8cc78ca6fc3faffa33c36665d39dccccf45f57e43 PING

# Test API key
curl -H "Authorization: Bearer 1ca2a9dbc839981adfeb6611ab56980c433d378f10a89601be6c6b60e05e4c0a" \
  http://orchestrator:6100/health

# Test JWT
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | jq -R 'split(".")[1] | @base64d | fromjson'
```

---

## Related Documentation

- `IMPORT-STRATEGY.md` - How secrets are routed to paths
- `CURRENT-STRUCTURE-EXPORT.md` - Complete path mapping
- `bulk-import-smart.ps1` - Automated import script
- `.env.example` - Template without secrets

---

## Next Steps

1. **Review this document** - Understand each secret's purpose
2. **Store in Infisical** - Use bulk import script
3. **Test access** - Run health checks with new secrets
4. **Document in team** - Share access procedures with team members
5. **Set rotation reminders** - Calendar alert for 90-day rotation
6. **Monitor logs** - Audit secret access in Infisical

---

**Last Updated**: 2026-02-10  
**Rotation Due**: 2026-05-10 (90 days)  
**Next Review**: 2026-03-10 (30 days)
