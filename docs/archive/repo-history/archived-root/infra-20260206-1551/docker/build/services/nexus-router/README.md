# Nexus Router with Infisical Integration

## Overview

This directory contains the Dockerfile and configuration for the Nexus Router service with Infisical secrets management integration. The Nexus Router serves as a unified LLM gateway for Project Nyra, and this custom build extends it with secure secret injection capabilities.

## Features

- **Infisical CLI Integration**: Automatic secret injection at runtime using Infisical CLI
- **Secure Secret Management**: All API keys and sensitive configuration pulled from Infisical
- **Health Checks**: Built-in health check endpoint for container orchestration
- **Non-Root Execution**: Runs as non-root user for enhanced security
- **Zero-Secret Docker Images**: No secrets baked into the image

## Architecture

```
┌─────────────────────────────────────────────────┐
│         Nexus Router Container                  │
├─────────────────────────────────────────────────┤
│  1. Entrypoint Script (entrypoint.sh)           │
│     ├── Validates INFISICAL_TOKEN               │
│     ├── Tests Infisical connection              │
│     └── Executes: infisical run -- nexus        │
│                                                  │
│  2. Infisical CLI                                │
│     ├── Connects to Infisical API               │
│     ├── Fetches secrets from:                   │
│     │   - Project: 8374cea9-e5e8-4050-bda4...   │
│     │   - Environment: dev                       │
│     │   - Path: /shared                          │
│     └── Injects as environment variables         │
│                                                  │
│  3. Nexus Router                                 │
│     ├── Reads config from /etc/nexus.toml       │
│     ├── Uses injected secrets                    │
│     └── Serves on port 6000                      │
└─────────────────────────────────────────────────┘
```

## Files

### Dockerfile

The Dockerfile extends the official Nexus Router image and:
1. Installs Infisical CLI
2. Adds custom entrypoint script
3. Configures health checks
4. Sets up proper permissions

### entrypoint.sh

The entrypoint script:
1. Validates Infisical token
2. Tests connection to Infisical
3. Wraps Nexus Router execution with `infisical run`
4. Provides debug logging

## Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `INFISICAL_TOKEN` | Machine identity token from Infisical | `st.xxx...` |

### Optional Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `INFISICAL_PROJECT_ID` | `8374cea9-e5e8-4050-bda4-b91f25ab30ef` | Infisical project ID |
| `INFISICAL_ENV` | `dev` | Environment (dev/staging/prod) |
| `INFISICAL_PATH` | `/shared` | Secret path in Infisical |
| `NEXUS_CONFIG` | `/etc/nexus.toml` | Path to Nexus config file |
| `DEBUG` | `false` | Enable debug logging |

### Secrets in Infisical

The following secrets should be configured in Infisical:

```
Project: 8374cea9-e5e8-4050-bda4-b91f25ab30ef
Environment: dev
Path: /shared

Secrets:
├── ANTHROPIC_API_KEY      - Claude API key
├── OPENROUTER_API_KEY     - OpenRouter API key
├── GOOGLE_API_KEY         - Google Gemini API key
├── OPENAI_API_KEY         - OpenAI API key (optional)
└── NEXUS_JWT_SECRET       - JWT secret for Nexus auth (optional)
```

## Building

### Local Build

```bash
cd infra/docker/build/services/nexus-router
docker build -t nyra-nexus-router:latest .
```

### With Docker Compose

```bash
cd infra
docker compose -f docker-compose/docker-compose.ai.yml build nexus
```

## Running

### Standalone Container

```bash
docker run -d \
  --name nyra-nexus \
  -p 6000:6000 \
  -e INFISICAL_TOKEN="st.xxx..." \
  -v $(pwd)/configs/nexus/nexus.toml:/etc/nexus.toml:ro \
  nyra-nexus-router:latest
```

### With Docker Compose

```bash
# Ensure INFISICAL_TOKEN is set in .env file
echo "INFISICAL_TOKEN=st.xxx..." >> infra/.env

# Start Nexus Router
cd infra
docker compose up -d nexus
```

## Testing

### Test Build

```bash
docker build -t nyra-nexus-router:test .
```

### Test Container Startup

```bash
docker run --rm \
  -e INFISICAL_TOKEN="${INFISICAL_TOKEN}" \
  -e DEBUG=true \
  nyra-nexus-router:test
```

### Test Health Check

```bash
# After container is running
curl http://localhost:6000/health
```

### Test Secret Injection

```bash
# View container logs to see debug output
docker logs nyra-nexus

# Expected output:
# [NEXUS-ENTRYPOINT] Starting Nexus Router with Infisical integration...
# [NEXUS-ENTRYPOINT] Successfully connected to Infisical
# [NEXUS-ENTRYPOINT] Starting Nexus Router with injected secrets...
```

## Troubleshooting

### Container Fails to Start

**Check logs:**
```bash
docker logs nyra-nexus
```

**Common issues:**
1. **Missing INFISICAL_TOKEN**: Ensure the token is set
2. **Invalid token**: Verify token has access to the project
3. **Network issues**: Check Infisical service availability

### Secrets Not Injected

**Enable debug mode:**
```bash
docker run --rm \
  -e INFISICAL_TOKEN="${INFISICAL_TOKEN}" \
  -e DEBUG=true \
  nyra-nexus-router:latest
```

**Verify Infisical configuration:**
```bash
# Test Infisical connection manually
docker run --rm -it \
  -e INFISICAL_TOKEN="${INFISICAL_TOKEN}" \
  nyra-nexus-router:latest \
  bash -c "infisical secrets list --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef --env=dev --path=/shared"
```

### Health Check Failing

**Test health endpoint manually:**
```bash
docker exec nyra-nexus wget -qO- http://localhost:6000/health
```

**Common issues:**
1. Nexus not started (check logs)
2. Port conflict (verify 6000 is available)
3. Configuration error (check nexus.toml)

## Security Considerations

### Best Practices

1. **Never commit INFISICAL_TOKEN** to version control
2. **Use machine identities** for production deployments
3. **Rotate tokens regularly** (every 90 days recommended)
4. **Use separate environments** (dev/staging/prod) in Infisical
5. **Limit token scope** to only required secrets

### Token Management

```bash
# Create .env file (gitignored)
echo "INFISICAL_TOKEN=st.xxx..." > infra/.env

# Verify .gitignore includes .env
grep ".env" .gitignore
```

### Audit Logging

Infisical provides audit logs for secret access. Monitor:
- Token usage
- Secret access patterns
- Failed authentication attempts

## Integration with Project Nyra

### Service Dependencies

The Nexus Router depends on:
- **PostgreSQL**: Service health check
- **LiteLLM**: AI proxy integration
- **Redis**: Caching layer (optional)

### Network Configuration

```yaml
networks:
  - nyra-network  # Shared network with other Nyra services
```

### Volume Mounts

```yaml
volumes:
  - ../../configs/nexus/nexus.toml:/etc/nexus.toml:ro  # Config file (read-only)
```

## Monitoring

### Prometheus Metrics

Nexus exposes metrics at `/metrics` (if enabled in nexus.toml)

### Health Checks

```bash
# Docker health check
docker inspect --format='{{.State.Health.Status}}' nyra-nexus

# Manual health check
curl http://localhost:6000/health
```

### Logs

```bash
# View live logs
docker logs -f nyra-nexus

# View last 100 lines
docker logs --tail 100 nyra-nexus
```

## Updating

### Update Nexus Version

```bash
# Edit Dockerfile to change NEXUS_VERSION
docker compose build nexus --no-cache

# Restart service
docker compose up -d nexus
```

### Update Infisical CLI

```bash
# Rebuild with latest CLI
docker compose build nexus --no-cache --pull
```

## References

- [Nexus Router Documentation](https://github.com/grafbase/nexus)
- [Infisical Documentation](https://infisical.com/docs)
- [Project Nyra Infrastructure Guide](../../README.md)
- [Docker Compose AI Stack](../../docker-compose/docker-compose.ai.yml)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review container logs
3. Verify Infisical configuration
4. Consult Project Nyra documentation

## License

Part of Project Nyra - See main repository for license information
