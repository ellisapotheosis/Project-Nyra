# Cloudflared Quick Reference Card

## Quick Start Commands

### Setup (First Time)
```bash
# Orchestrator-Mini
cd bootstrap/orchestrator-mini/docker
cp .env.example .env
# Edit .env and add: CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR=your-token
docker-compose up -d cloudflared

# Workers (same pattern for all)
cd bootstrap/worker-<gpu>/docker
cp .env.example .env
# Edit .env and add: CLOUDFLARE_TUNNEL_TOKEN_WORKER_<GPU>=your-token
docker-compose up -d
```

### Automated Setup
```bash
./bootstrap/scripts/setup-cloudflared.sh orchestrator-mini
./bootstrap/scripts/setup-cloudflared.sh worker-rtx5090
./bootstrap/scripts/setup-cloudflared.sh worker-rtx3060
./bootstrap/scripts/setup-cloudflared.sh worker-rtx3090ti
```

## Common Commands

### Status & Monitoring
```bash
# Check container status
docker ps | grep cloudflared

# View logs
docker logs orchestrator-cloudflared
docker logs -f worker-rtx5090-cloudflared  # Follow mode

# Check health
docker inspect orchestrator-cloudflared | grep -A 5 "Health"

# View metrics
curl http://localhost:9126/metrics
```

### Service Management
```bash
# Start
docker-compose up -d cloudflared

# Stop
docker-compose stop cloudflared

# Restart
docker-compose restart cloudflared

# Recreate (after config changes)
docker-compose up -d --force-recreate cloudflared

# Remove
docker-compose down cloudflared
```

### Updates
```bash
# Pull latest image
docker pull cloudflare/cloudflared:latest

# Update and restart
docker-compose pull cloudflared
docker-compose up -d --force-recreate cloudflared
```

### Troubleshooting
```bash
# View last 100 log lines
docker logs --tail 100 orchestrator-cloudflared

# Check network connectivity
docker exec orchestrator-cloudflared ping -c 3 cloudflare.com

# Test tunnel connection
docker exec orchestrator-cloudflared cloudflared tunnel info

# Validate compose file
docker-compose config

# Inspect container details
docker inspect orchestrator-cloudflared
```

## Environment Variables

### Required (All PCs)
```env
# Orchestrator
CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR=eyJhY2NvdW50...

# Workers
CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX5090=eyJhY2NvdW50...
CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3060=eyJhY2NvdW50...
CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3090TI=eyJhY2NvdW50...
```

### Optional
```env
CLOUDFLARE_TUNNEL_LOGLEVEL=info  # debug, info, warn, error
CLOUDFLARE_TUNNEL_METRICS=0.0.0.0:9126
```

## Service Ports

### Orchestrator Services
| Service | Port | Hostname |
|---------|------|----------|
| Grafana | 3003 | grafana.nyra.yourdomain.com |
| Prometheus | 9090 | prometheus.nyra.yourdomain.com |
| Infisical | 8080 | infisical.nyra.yourdomain.com |
| Nexus | 6000 | nexus.nyra.yourdomain.com |

### Worker Services
| Worker | Dev UI | GPU Monitor |
|--------|--------|-------------|
| RTX5090 | 8090 | 9835 |
| RTX3060 | 8091 | 9836 |
| RTX3090Ti | 8092 | 9837 |

## File Locations

### Docker Compose Files
```
infra/docker-compose.yml                          # Orchestrator (main)
bootstrap/orchestrator-mini/docker/docker-compose.yml
bootstrap/worker-rtx5090/docker/docker-compose.yml
bootstrap/worker-rtx3060/docker/docker-compose.yml
bootstrap/worker-rtx3090ti/docker/docker-compose.yml
```

### Environment Files
```
bootstrap/orchestrator-mini/docker/.env
bootstrap/worker-rtx5090/docker/.env
bootstrap/worker-rtx3060/docker/.env
bootstrap/worker-rtx3090ti/docker/.env
```

### Configuration Files (Optional)
```
bootstrap/orchestrator-mini/docker/configs/cloudflared/config.yml
bootstrap/worker-*/docker/configs/cloudflared/config.yml
```

## Cloudflare Dashboard URLs

- **Zero Trust Dashboard**: https://one.dash.cloudflare.com/
- **Tunnels**: Zero Trust → Access → Tunnels
- **Access Policies**: Zero Trust → Access → Applications
- **Analytics**: Zero Trust → Analytics → Access

## Health Check

### Expected Status
```bash
$ docker ps | grep cloudflared
orchestrator-cloudflared   Up 5 minutes   Healthy
```

### Expected Logs (Success)
```
INFO[...] Starting tunnel
INFO[...] Connection established
INFO[...] Tunnel started successfully
```

### Common Errors
```
ERR[...] Invalid tunnel token            → Check .env file
ERR[...] Failed to connect to edge      → Check internet/firewall
ERR[...] Service unreachable            → Check Docker network
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Rotate tunnel tokens** every 90 days
3. **Set up access policies** for sensitive services
4. **Enable audit logging** in Cloudflare
5. **Use service tokens** for service-to-service auth
6. **Monitor metrics** for unusual activity
7. **Keep cloudflared updated** regularly

## Documentation

- **Setup Guide**: `docs/deployment/CLOUDFLARE-TUNNEL-SETUP.md`
- **Implementation Summary**: `docs/deployment/CLOUDFLARED-IMPLEMENTATION-SUMMARY.md`
- **This Quick Ref**: `bootstrap/CLOUDFLARED-QUICKREF.md`

## Support

Need help? Check in order:
1. Container logs: `docker logs <container-name>`
2. Cloudflare dashboard tunnel status
3. Local service connectivity: `curl http://localhost:<port>`
4. Docker network: `docker network inspect nyra-network`
5. Full documentation in `docs/deployment/`

---

**Last Updated**: 2026-01-15
