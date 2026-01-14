# Gitea Local Git Server for Orchestrator-Mini

Complete Gitea installation for WSL on orchestrator-mini PC as a GitHub backup solution with full CI/CD capabilities.

## Features

- Docker-based installation with PostgreSQL and Redis
- Automatic GitHub repository synchronization
- Gitea Actions (GitHub Actions compatible)
- Nginx reverse proxy with HTTPS
- Tailscale VPN access
- Automated backups to MinIO
- Container registry for Docker images
- Web-based UI for code review and issue tracking

## Architecture

```
┌─────────────────────────────────────────────┐
│           Nginx Reverse Proxy               │
│         (HTTPS with SSL/TLS)                │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│            Gitea Server                     │
│         (Git + Web UI)                      │
└──────┬────────────────┬─────────────────────┘
       │                │
┌──────▼──────┐  ┌─────▼──────┐  ┌──────────┐
│ PostgreSQL  │  │   Redis    │  │  Runner  │
│  Database   │  │   Cache    │  │ (CI/CD)  │
└─────────────┘  └────────────┘  └──────────┘
```

## Quick Start

### 1. Initial Setup

```bash
# Navigate to gitea directory
cd bootstrap/orchestrator-mini/wsl/gitea

# Copy environment template
cp .env.example .env

# Edit configuration (REQUIRED)
nano .env
# Set: POSTGRES_PASSWORD, SECRET_KEY, INTERNAL_TOKEN, GITEA_ADMIN_PASSWORD

# Run setup script
chmod +x setup-gitea.sh
./setup-gitea.sh
```

### 2. Generate Secrets

The setup script will auto-generate secrets, or you can generate them manually:

```bash
# Generate random secrets
openssl rand -hex 32  # Use for SECRET_KEY
openssl rand -hex 32  # Use for INTERNAL_TOKEN
openssl rand -hex 32  # Use for LFS_JWT_SECRET
openssl rand -hex 32  # Use for OAUTH2_JWT_SECRET
```

### 3. Access Gitea

- Web UI: `https://gitea.orchestrator-mini.local`
- SSH: `ssh://git@gitea.orchestrator-mini.local:2222`
- Default admin: Check `.env` file for credentials

### 4. Setup GitHub Sync

```bash
# Generate GitHub Personal Access Token
# Go to: https://github.com/settings/tokens
# Scopes needed: repo, workflow, admin:org, admin:repo_hook

# Add token to .env
nano .env
# Set: GITHUB_TOKEN, GITHUB_ORG

# Generate Gitea admin token
# Go to: Gitea UI -> Settings -> Applications -> Generate New Token
# Add to .env as GITEA_ADMIN_TOKEN

# Run sync script
chmod +x sync-github.sh
./sync-github.sh
```

### 5. Setup CI/CD (Gitea Actions)

```bash
# Generate runner token in Gitea UI:
# Site Administration -> Actions -> Runners -> Create New Runner

# Add token to .env
nano .env
# Set: RUNNER_TOKEN

# Run CI setup
chmod +x setup-ci.sh
./setup-ci.sh

# Convert GitHub Actions workflows
./convert-workflows.sh /path/to/repo/.github/workflows /path/to/repo/.gitea/workflows
```

## Configuration Files

### Required Files

- `docker-compose.yml` - Container orchestration
- `gitea-config.ini` - Gitea server configuration
- `.env` - Environment variables (create from `.env.example`)
- `nginx/gitea.conf` - Reverse proxy configuration

### Scripts

- `setup-gitea.sh` - Initial installation and setup
- `sync-github.sh` - Bi-directional GitHub sync
- `setup-ci.sh` - Configure Gitea Actions
- `backup.sh` - Backup Gitea data and database
- `restore.sh` - Restore from backup
- `convert-workflows.sh` - Convert GitHub Actions to Gitea Actions

## Repository Synchronization

### Automatic Sync

Sync runs automatically every 30 minutes (configurable in `.env`):

```bash
# Check sync logs
tail -f logs/sync-*.log

# Manual sync
./sync-github.sh
```

### Sync Features

- Creates mirror repositories for all GitHub repos
- Syncs commits, branches, and tags
- Sets up webhooks for real-time updates
- Handles private repositories
- Preserves repository metadata

## CI/CD with Gitea Actions

### Workflow Compatibility

Gitea Actions is compatible with GitHub Actions syntax:

```yaml
name: CI Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test
```

### Key Differences

- Context: `${{ gitea.* }}` instead of `${{ github.* }}`
- Env vars: `GITEA_*` instead of `GITHUB_*`
- Registry: Use local Gitea registry

### Supported Actions

Most GitHub Actions work out of the box:
- actions/checkout
- actions/setup-node
- docker/build-push-action
- And many more...

## Backup and Restore

### Automated Backups

Backups include:
- Full Gitea dump (repositories + data)
- PostgreSQL database dump
- Configuration files
- SHA256 checksums

### Manual Backup

```bash
./backup.sh

# Backups are stored in: ./backup/
# Format: gitea-backup-YYYYMMDD-HHMMSS.*
```

### Upload to MinIO

Configure in `.env`:

```bash
MINIO_ENDPOINT=http://minio.orchestrator-mini.local:9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET=gitea-backups
```

### Restore from Backup

```bash
# List available backups
./restore.sh

# Restore specific backup
./restore.sh gitea-backup-20250131-120000
```

## Security

### Access Control

- Gitea is only accessible via Tailscale VPN
- HTTPS enforced with SSL/TLS
- Rate limiting on Nginx
- Security headers configured

### Authentication

- Admin user with strong password
- SSH key authentication supported
- 2FA available in Gitea UI
- OAuth2 integration supported

### Audit Logging

All actions are logged:
- User activities
- Git operations
- Admin changes
- Webhook deliveries

## Tailscale Integration

### Setup Tailscale on WSL

```bash
# Install Tailscale in WSL
curl -fsSL https://tailscale.com/install.sh | sh

# Start Tailscale
sudo tailscale up --hostname=orchestrator-mini

# Get Tailscale IP
tailscale ip -4
```

### Access from Remote

```bash
# Connect to Tailscale network
tailscale up

# Access Gitea
https://gitea.orchestrator-mini.local

# Or use Tailscale IP
https://<tailscale-ip>
```

## Maintenance

### Update Gitea

```bash
# Pull latest images
docker-compose pull

# Restart services
docker-compose down
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f gitea
docker-compose logs -f postgres
docker-compose logs -f gitea-runner
```

### Health Checks

```bash
# Service status
docker-compose ps

# Health check
curl -f https://gitea.orchestrator-mini.local/health
```

### Database Management

```bash
# Access PostgreSQL
docker exec -it gitea-postgres psql -U gitea -d gitea

# Backup database only
docker exec gitea-postgres pg_dump -U gitea gitea > backup.sql

# Restore database only
docker exec -i gitea-postgres psql -U gitea gitea < backup.sql
```

## Troubleshooting

### Common Issues

#### Services won't start

```bash
# Check Docker status
sudo systemctl status docker

# Check logs
docker-compose logs

# Verify ports
sudo netstat -tulpn | grep -E '(3000|2222|443)'
```

#### Cannot access Gitea UI

```bash
# Check Nginx config
docker exec gitea-nginx nginx -t

# Verify SSL certificates
ls -la nginx/certs/

# Check firewall
sudo ufw status
```

#### Sync script fails

```bash
# Verify GitHub token
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Check Gitea API
curl http://localhost:3000/api/v1/version

# Review sync logs
tail -f logs/sync-*.log
```

#### Runner not registering

```bash
# Check runner logs
docker-compose logs gitea-runner

# Verify runner token
# Regenerate in Gitea UI if needed

# Restart runner
docker-compose restart gitea-runner
```

## Performance Optimization

### PostgreSQL Tuning

Edit `docker-compose.yml` and add to postgres environment:

```yaml
- POSTGRES_SHARED_BUFFERS=256MB
- POSTGRES_EFFECTIVE_CACHE_SIZE=1GB
- POSTGRES_WORK_MEM=16MB
```

### Redis Optimization

For high-traffic instances:

```yaml
redis:
  command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Gitea Performance

In `gitea-config.ini`:

```ini
[server]
OFFLINE_MODE = true  # If no internet needed

[cache]
ENABLED = true
ADAPTER = redis
ITEM_TTL = 24h

[indexer]
REPO_INDEXER_ENABLED = true  # Enable code search
```

## Integration with Project-Nyra

### Repository Setup

```bash
# Clone from GitHub
git clone https://github.com/your-org/Project-Nyra.git
cd Project-Nyra

# Add Gitea remote
git remote add gitea ssh://git@gitea.orchestrator-mini.local:2222/your-org/Project-Nyra.git

# Push to both remotes
git push origin main
git push gitea main
```

### Automatic Mirroring

Add to `.github/workflows/mirror.yml`:

```yaml
name: Mirror to Gitea
on: [push]
jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Mirror to Gitea
        run: |
          git remote add gitea ${{ secrets.GITEA_REPO_URL }}
          git push --mirror gitea
```

## Support and Documentation

### Resources

- Gitea Documentation: https://docs.gitea.io
- GitHub Actions Compatibility: `GITHUB_ACTIONS_COMPATIBILITY.md`
- Docker Compose Docs: https://docs.docker.com/compose/

### Getting Help

1. Check logs: `docker-compose logs -f`
2. Review configuration: `.env` and `gitea-config.ini`
3. Verify network: `docker network inspect gitea_gitea`
4. Test connectivity: `curl http://localhost:3000`

## License

This configuration is part of Project-Nyra and follows the project's licensing.

## Credits

- Gitea: https://gitea.io
- PostgreSQL: https://www.postgresql.org
- Nginx: https://nginx.org
- Docker: https://www.docker.com
