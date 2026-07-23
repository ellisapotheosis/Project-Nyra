# Infisical Agent Gateway — Quick Start

Fast path to deploy and test the gateway.

---

## Prerequisites

- [ ] Infisical Agent Vault running on oracle-vps:8080
- [ ] Docker and docker compose on oracle-vps
- [ ] Tailscale mesh connected
- [ ] Access to Infisical admin panel (to create machine identity)

---

## 1. Create Machine Identity (5 min)

[Infisical → Settings → Machine Identities → Create](https://app.infisical.com)

```
Name: agent-gateway-dev
Permissions:
  ✓ Can read secrets
  ✓ Can manage dynamic secrets
  ✓ Paths: /domains/project-nyra/dev, /shared/credentials, /shared/api-keys
```

Copy:
- Client ID → `INFISICAL_BACKEND_MACHINE_IDENTITY_ID`
- Client Secret → `INFISICAL_BACKEND_MACHINE_IDENTITY_KEY`

---

## 2. Fill Environment File (2 min)

```bash
# Edit this file
nano security/infisical/agent-gateway/dev.env

# Fill in the machine identity:
INFISICAL_BACKEND_MACHINE_IDENTITY_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
INFISICAL_BACKEND_MACHINE_IDENTITY_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Fill in database admin password (for dynamic secrets)
INFISICAL_POSTGRES_ADMIN_PASSWORD=your_actual_postgres_password

# Fill in API keys (if available)
INFISICAL_TWILIO_ACCOUNT_SID=ACxxxxxxxx
INFISICAL_TWILIO_AUTH_TOKEN=xxxxxxxx
INFISICAL_SENDGRID_API_KEY=SG.xxxxxxxx
INFISICAL_ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

---

## 3. Deploy Gateway (1 min)

```bash
# SSH to oracle-vps
ssh ubuntu@oracle-vps.trex-fiordland.ts.net

# Navigate to project
cd ~/project-nyra

# Start gateway (dev environment)
COMPOSE_PROJECT_NAME=nyra ENVIRONMENT=dev docker compose \
  --env-file /dev/null \
  -f infra/hosts/oracle-vps/docker-compose.yml \
  -f infra/hosts/oracle-vps/docker-compose.infisical-gateway.yml \
  up -d

# Verify running
docker ps | grep infisical-gateway
docker logs nyra-infisical-gateway | tail -20
```

---

## 4. Test Health (1 min)

```bash
# Health check
docker exec nyra-infisical-gateway curl http://localhost:8200/health

# Expected:
# {"status": "healthy", "version": "..."}
```

---

## 5. Test Secret Caching (1 min)

```bash
# From oracle-vps
docker exec nyra-infisical-gateway curl http://localhost:8200/api/v1/secrets

# Expected: List of cached secrets from Agent Vault
```

---

## 6. Test Dynamic DB Credentials (1 min)

```bash
# Request temporary postgres role
docker exec nyra-infisical-gateway curl -X POST \
  http://localhost:8200/api/v1/dynamic-secrets/postgres \
  -H "Content-Type: application/json" \
  -d '{"ttl_hours": 1}'

# Expected:
# {"username": "dev_app_xyz", "password": "random_pass", "expires_at": "..."}
```

---

## 7. Test Public Access via Cloudflare (2 min)

```bash
# From any device with internet
curl https://infisical-gateway.projectnyra.com/health

# Should prompt browser login (if CF Access policy is set)
# Then return: {"status": "healthy"}
```

---

## Summary

✅ **Total time: ~15 minutes**

| Step | Time | Status |
|---|---|---|
| Create machine identity | 5 min | Manual (browser) |
| Fill .env file | 2 min | Manual (edit) |
| Deploy container | 1 min | Automated |
| Test health | 1 min | Automated |
| Test secrets | 1 min | Automated |
| Test dynamic secrets | 1 min | Automated |
| Test public access | 2 min | Manual (browser test) |

---

## Troubleshooting

**Container won't start?**
```bash
docker logs nyra-infisical-gateway
# Check for: "machine identity not found" → verify .env values
# Check for: "cannot connect to vault" → verify INFISICAL_BACKEND_URL
```

**No secrets returned?**
```bash
# Check machine identity has permission to secret paths
# In Infisical UI, verify:
#   - Settings → Machine Identities → Select identity
#   - Permissions tab → check paths listed
```

**Database credentials generation fails?**
```bash
# Check postgres admin password is correct
docker exec nyra-postgres psql -U postgres -c "SELECT 1"
# Should succeed with no password prompt (auth via trust mode)
```

---

## Next Steps

- [ ] Deploy to staging (update ENVIRONMENT=staging)
- [ ] Deploy to production (update ENVIRONMENT=prod)
- [ ] Add apps to call gateway: `http://infisical-gateway:8200`
- [ ] Configure Cloudflare Access policy for public endpoint
- [ ] Monitor logs: `docker logs -f nyra-infisical-gateway`

---

## Links

- [Full Setup Guide](./docs/INFISICAL_GATEWAY_SETUP.md)
- [Manual Actions Checklist](./docs/MANUAL_ACTIONS_INFISICAL_GATEWAY.md)
- [Infisical Docs](https://infisical.com/docs)
