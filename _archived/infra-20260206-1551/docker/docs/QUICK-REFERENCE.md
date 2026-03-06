# Docker Quick Reference Guide

## Instant Commands

### Getting Started

```bash
# Quick start (development)
make dev

# Quick start (production)
make prod

# Initialize with secure passwords
make init-prod

# Full setup from scratch
make setup
```

### Daily Operations

```bash
# View logs
make logs                    # All services
make logs-claude-flow       # Specific service

# Service management
make restart-postgres       # Restart service
make shell-claude-flow      # Shell into container

# Health checks
make health                 # Quick status
make test                   # Full test suite
```

### Database Operations

```bash
# Backup
make db-backup              # Creates timestamped backup

# Restore
make db-restore FILE=backup.sql

# Shell access
make db-shell               # PostgreSQL
make redis-cli              # Redis
make mongo-shell            # MongoDB
```

### Troubleshooting

```bash
# Check status
make ps                     # List containers
make stats                  # Resource usage
make health                 # Health checks

# View logs
make logs-<service>         # Specific service logs

# Restart services
make restart                # All services
make restart-<service>      # Specific service
```

## Service URLs

### Development

| Service | URL |
|---------|-----|
| Claude Flow | http://localhost:3000 |
| Archon OS | http://localhost:8000 |
| Graphiti MCP | http://localhost:8001 |
| Mem0 MCP | http://localhost:8002 |
| Infisical | http://localhost:8080 |
| Gitea | http://localhost:3001 |
| n8n | http://localhost:5678 |
| Adminer | http://localhost:8082 |
| Redis Commander | http://localhost:8081 |
| Mailhog | http://localhost:8025 |

### Production

| Service | URL |
|---------|-----|
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3002 |
| Loki | http://localhost:3100 |

## Environment Variables

### Required (Must Set)

```bash
ANTHROPIC_API_KEY=sk-ant-...
POSTGRES_PASSWORD=
REDIS_PASSWORD=
MONGO_ROOT_PASSWORD=
INFISICAL_ENCRYPTION_KEY=
INFISICAL_JWT_SECRET=
N8N_BASIC_AUTH_PASSWORD=
```

### Generate Secure Keys

```bash
# PostgreSQL/Redis/MongoDB passwords
openssl rand -base64 32

# Infisical keys
openssl rand -hex 32

# Auto-generate all (production init)
make init-prod
```

## Common Issues

### Port Already in Use

```bash
# Find what's using the port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Change port in .env
CLAUDE_FLOW_MCP_PORT=3100
```

### Service Won't Start

```bash
# Check logs
make logs-<service>

# Check health
make health

# Restart service
make restart-<service>
```

### Out of Memory

```bash
# Check usage
make stats

# Clean up
make clean
```

### Database Connection Issues

```bash
# Check database health
make health

# Connect directly
make db-shell
```

## File Structure

```
bootstrap/docker/
├── docker-compose.yml           # Main configuration
├── docker-compose.dev.yml       # Development overrides
├── docker-compose.prod.yml      # Production overrides
├── claude-flow.Dockerfile       # Claude Flow image
├── archon.Dockerfile            # Archon OS image
├── .env.example                 # Environment template
├── .dockerignore               # Exclude files
├── Makefile                     # Command shortcuts
├── README.md                    # Full documentation
├── QUICK-REFERENCE.md          # This file
├── init-scripts/
│   └── postgres/
│       └── 01-init-databases.sql
├── monitoring/
│   ├── prometheus.yml
│   └── loki.yml
└── tests/
    ├── docker-compose.test.yml
    ├── health-check-tests.sh
    ├── integration-tests.sh
    └── security-tests.sh
```

## Testing

```bash
# All tests
make test

# Individual test suites
make test-health           # Health checks
make test-integration      # Integration tests
make test-security         # Security scan
```

## Maintenance

```bash
# Update images
make update

# Clean up
make clean                 # Safe cleanup
make clean-all            # Remove everything (careful!)

# Backup before major changes
make db-backup

# Security audit
make security-audit
```

## Production Deployment

```bash
# 1. Initialize with secure passwords
make init-prod

# 2. Edit .env with your values
nano .env

# 3. Build and start production
make prod

# 4. Verify health
make health

# 5. Run tests
make test

# 6. Monitor logs
make prod-logs
```

## Getting Help

```bash
# View all make commands
make help

# View docker-compose config
make validate

# Check versions
make version
```

## Tips

- Always backup before updates: `make db-backup`
- Use `.env` file for configuration, never commit it
- Monitor logs regularly: `make logs`
- Run health checks after changes: `make health`
- Use development mode for local work: `make dev`
- Use production mode for deployments: `make prod`
- Scale services with: `docker-compose up -d --scale service=N`
- View resource usage: `make stats`

## Support

- Full docs: [README.md](./README.md)
- Project docs: [../../docs/](../../docs/)
- Issues: GitHub Issues
