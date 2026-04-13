# Gitea Local Git Server Setup Guide

## Overview

This guide covers the setup and configuration of Gitea as a local Git server for the Project Nyra orchestrator PC. Gitea provides a self-hosted, lightweight Git service with a clean web interface, supporting Git operations, webhooks, and CI/CD integration.

## Table of Contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [SSH Access](#ssh-access)
6. [API Usage](#api-usage)
7. [Webhooks & Automation](#webhooks--automation)
8. [Backup & Restore](#backup--restore)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Configuration](#advanced-configuration)

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                  Orchestrator-Mini PC                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐         ┌──────────────┐              │
│  │              │         │              │              │
│  │    Gitea     │────────▶│  PostgreSQL  │              │
│  │  Container   │         │   Database   │              │
│  │              │         │              │              │
│  └──────┬───────┘         └──────────────┘              │
│         │                                                │
│  Port 3001 (HTTP)                                        │
│  Port 2222 (SSH)                                         │
│         │                                                │
└─────────┼────────────────────────────────────────────────┘
          │
    ┌─────▼─────┐
    │  Clients  │
    │  - Web UI │
    │  - Git CLI│
    │  - API    │
    └───────────┘
```

### Service Stack

- **Gitea**: `gitea/gitea:latest` - Git server with web interface
- **PostgreSQL**: `postgres:16-alpine` - Database backend
- **Networks**: Connected to `nyra-network` and `databases` networks
- **Volumes**:
  - `gitea_data`: Repository data and application files
  - `gitea_config`: Configuration files
  - `gitea_db_data`: PostgreSQL data

## Prerequisites

### System Requirements

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum (4GB recommended)
- 20GB disk space minimum

### Required Access

- Network access to orchestrator-mini PC
- Infisical CLI configured (optional, for credential management)
- SSH client for Git operations

## Quick Start

### 1. Run Setup Script

**Linux/macOS:**
```bash
cd bootstrap/orchestrator-mini/setup
chmod +x setup-gitea.sh
./setup-gitea.sh
```

**Windows (PowerShell):**
```powershell
cd bootstrap\orchestrator-mini\setup
.\setup-gitea.ps1
```

### 2. Access Gitea

After setup completes:

1. Open web browser: `http://localhost:3001`
2. Login with generated admin credentials (shown in setup output)
3. Change admin password immediately

### 3. Clone Initial Repository

```bash
git clone http://localhost:3001/admin/Project-Nyra.git
```

## Configuration

### Environment Variables

Configuration is managed through environment variables in `.env.gitea`:

```bash
# Database Configuration
GITEA_DB_USER=gitea
GITEA_DB_PASSWORD=<secure-password>
GITEA_DB_NAME=gitea

# Admin Account
GITEA_ADMIN_USER=admin
GITEA_ADMIN_PASSWORD=<secure-password>
GITEA_ADMIN_EMAIL=admin@localhost

# Security Keys (automatically generated)
GITEA_SECRET_KEY=<random-32-chars>
GITEA_INTERNAL_TOKEN=<random-64-chars>

# Server Configuration
GITEA_DOMAIN=localhost
GITEA_LOG_LEVEL=Info
```

### Using Infisical for Secrets

Store credentials in Infisical:

```bash
# Set secrets in Infisical
infisical secrets set GITEA_ADMIN_USER admin
infisical secrets set GITEA_ADMIN_PASSWORD <secure-password>
infisical secrets set GITEA_DB_PASSWORD <db-password>

# Run setup with Infisical integration
./setup-gitea.sh
```

### Docker Compose Configuration

The Gitea service is defined in `bootstrap/orchestrator-mini/docker/docker-compose.yml`:

```yaml
services:
  gitea-db:
    image: postgres:16-alpine
    # PostgreSQL configuration...

  gitea:
    image: gitea/gitea:latest
    depends_on:
      - gitea-db
    ports:
      - "3001:3000"  # HTTP
      - "2222:22"    # SSH
    # Additional configuration...
```

### Application Configuration

Advanced settings in `app.ini`:

```ini
[repository]
DEFAULT_BRANCH = main
DEFAULT_PRIVATE = private
ENABLE_PUSH_CREATE_USER = true

[server]
DOMAIN = localhost
ROOT_URL = http://localhost:3001/
SSH_PORT = 2222
LFS_START_SERVER = true

[security]
INSTALL_LOCK = true
MIN_PASSWORD_LENGTH = 8
PASSWORD_COMPLEXITY = lower,upper,digit

[service]
DISABLE_REGISTRATION = true
REQUIRE_SIGNIN_VIEW = false
```

## SSH Access

### Generate SSH Key

```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to agent
ssh-add ~/.ssh/id_ed25519
```

### Add SSH Key to Gitea

1. Login to Gitea web UI
2. Go to **Settings** → **SSH/GPG Keys**
3. Click **Add Key**
4. Paste your public key (`~/.ssh/id_ed25519.pub`)
5. Give it a descriptive name
6. Click **Add Key**

### Test SSH Connection

```bash
# Test SSH connection
ssh -T git@localhost -p 2222

# Clone repository via SSH
git clone ssh://git@localhost:2222/admin/Project-Nyra.git
```

### Configure SSH Host

Add to `~/.ssh/config`:

```
Host gitea-local
    HostName localhost
    Port 2222
    User git
    IdentityFile ~/.ssh/id_ed25519
```

Then clone with:
```bash
git clone gitea-local:admin/Project-Nyra.git
```

## API Usage

### Authentication

```bash
# Using Basic Auth
curl -u "admin:password" http://localhost:3001/api/v1/user

# Using API Token (generate in web UI)
curl -H "Authorization: token YOUR_TOKEN" \
     http://localhost:3001/api/v1/user
```

### Common API Operations

**List Repositories:**
```bash
curl -X GET "http://localhost:3001/api/v1/user/repos" \
     -H "Authorization: token YOUR_TOKEN"
```

**Create Repository:**
```bash
curl -X POST "http://localhost:3001/api/v1/user/repos" \
     -H "Authorization: token YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "my-repo",
       "description": "My new repository",
       "private": false,
       "auto_init": true
     }'
```

**Create Organization:**
```bash
curl -X POST "http://localhost:3001/api/v1/orgs" \
     -H "Authorization: token YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "username": "nyra-team",
       "full_name": "Project Nyra Team"
     }'
```

**List Pull Requests:**
```bash
curl -X GET "http://localhost:3001/api/v1/repos/admin/Project-Nyra/pulls" \
     -H "Authorization: token YOUR_TOKEN"
```

### API Documentation

Access interactive API documentation:
- Swagger UI: `http://localhost:3001/api/swagger`

## Webhooks & Automation

### Creating Webhooks

1. Navigate to repository **Settings** → **Webhooks**
2. Click **Add Webhook**
3. Configure webhook:
   - **Target URL**: Your CI/CD endpoint
   - **HTTP Method**: POST
   - **Content Type**: application/json
   - **Secret**: Optional signing secret
   - **Trigger Events**: Select events to trigger on

### Webhook Events

Available webhook events:
- Push
- Create (branch/tag)
- Delete (branch/tag)
- Pull Request
- Issues
- Release
- Repository

### Example Webhook Handler

```javascript
const express = require('express');
const app = express();

app.post('/webhook/gitea', express.json(), (req, res) => {
  const event = req.headers['x-gitea-event'];
  const payload = req.body;

  console.log(`Received ${event} event`);

  if (event === 'push') {
    // Handle push event
    const commits = payload.commits;
    const branch = payload.ref.split('/').pop();

    console.log(`Push to ${branch}: ${commits.length} commits`);

    // Trigger CI/CD pipeline
    triggerPipeline(branch, commits);
  }

  res.status(200).send('OK');
});

app.listen(3000);
```

### Git Hooks

Custom Git hooks in `configs/gitea/hooks/`:

**pre-receive.sample** - Validation before push:
```bash
#!/bin/bash
while read oldrev newrev refname; do
    # Validate commit messages
    # Check file types
    # Run pre-commit tests
done
```

**post-receive.sample** - Automation after push:
```bash
#!/bin/bash
while read oldrev newrev refname; do
    # Trigger CI/CD
    # Send notifications
    # Update documentation
done
```

## Backup & Restore

### Manual Backup

```bash
# Run backup script
cd bootstrap/orchestrator-mini/setup
./backup-gitea.sh
```

Backup includes:
- All repository data
- Gitea configuration
- PostgreSQL database
- User data and settings

### Automated Backups

**Linux (cron):**
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/setup/backup-gitea.sh
```

**Windows (Task Scheduler):**
```powershell
schtasks /create /tn "Gitea Backup" `
  /tr "powershell.exe -File C:\path\to\backup-gitea.ps1" `
  /sc daily /st 02:00
```

### Restore from Backup

```bash
# List available backups
ls -lh bootstrap/orchestrator-mini/backups/gitea/

# Restore specific backup
./restore-gitea.sh 20260115_120000
```

### Backup Storage

Backups are stored in:
- Location: `bootstrap/orchestrator-mini/backups/gitea/`
- Retention: Last 7 backups (automatic cleanup)
- Format:
  - `gitea_backup_YYYYMMDD_HHMMSS.tar.gz` - Data backup
  - `gitea_db_YYYYMMDD_HHMMSS.sql.gz` - Database backup

## Troubleshooting

### Service Won't Start

**Check logs:**
```bash
# Gitea logs
docker logs orchestrator-gitea

# Database logs
docker logs orchestrator-gitea-db

# Follow logs
docker logs -f orchestrator-gitea
```

**Check service health:**
```bash
# Service status
docker ps | grep gitea

# Health check
curl http://localhost:3001/api/healthz
```

### Database Connection Issues

**Verify database:**
```bash
# Connect to database
docker exec -it orchestrator-gitea-db psql -U gitea

# Check connection from Gitea
docker exec orchestrator-gitea /bin/sh -c \
  "nc -zv gitea-db 5432"
```

### SSH Connection Failed

**Check SSH service:**
```bash
# Check SSH is running in container
docker exec orchestrator-gitea ps aux | grep ssh

# Test SSH connection
ssh -vvv git@localhost -p 2222
```

**Verify SSH port:**
```bash
# Check port is exposed
docker port orchestrator-gitea

# Check firewall rules
sudo ufw status | grep 2222
```

### Permission Issues

**Fix repository permissions:**
```bash
# Enter container
docker exec -it orchestrator-gitea /bin/bash

# Fix permissions
chown -R git:git /data/git/repositories
chmod -R 755 /data/git/repositories
```

### Performance Issues

**Check resource usage:**
```bash
# Container stats
docker stats orchestrator-gitea orchestrator-gitea-db

# Database performance
docker exec orchestrator-gitea-db psql -U gitea -c "
  SELECT * FROM pg_stat_activity;
"
```

**Optimize database:**
```bash
# Vacuum database
docker exec orchestrator-gitea-db psql -U gitea -d gitea -c "VACUUM ANALYZE;"

# Reindex
docker exec orchestrator-gitea-db psql -U gitea -d gitea -c "REINDEX DATABASE gitea;"
```

## Advanced Configuration

### HTTPS Configuration

Add SSL/TLS with reverse proxy (nginx example):

```nginx
server {
    listen 443 ssl http2;
    server_name git.local.nyra;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### LDAP/Active Directory Integration

Configure in `app.ini`:

```ini
[auth.ldap]
ENABLED = true
NAME = LDAP
HOST = ldap.example.com
PORT = 389
SECURITY_PROTOCOL = unencrypted
BIND_DN = cn=admin,dc=example,dc=com
BIND_PASSWORD = password
USER_BASE = ou=users,dc=example,dc=com
USER_FILTER = (&(objectClass=user)(sAMAccountName=%s))
ADMIN_FILTER = (memberOf=cn=admins,ou=groups,dc=example,dc=com)
```

### Email Notifications

Configure SMTP in `app.ini`:

```ini
[mailer]
ENABLED = true
SMTP_ADDR = smtp.gmail.com
SMTP_PORT = 587
FROM = gitea@example.com
USER = your-email@gmail.com
PASSWD = your-app-password
```

### LFS (Large File Storage)

LFS is enabled by default. Configure in `app.ini`:

```ini
[server]
LFS_START_SERVER = true
LFS_CONTENT_PATH = /data/git/lfs

[lfs]
PATH = /data/git/lfs
STORAGE_TYPE = local
```

Track large files:
```bash
git lfs track "*.psd"
git lfs track "*.mp4"
git add .gitattributes
git commit -m "Track large files with LFS"
```

### External Runners (Actions)

Enable Gitea Actions:

```ini
[actions]
ENABLED = true
DEFAULT_ACTIONS_URL = https://gitea.com
```

### Monitoring Integration

Export metrics for Prometheus:

```ini
[metrics]
ENABLED = true
TOKEN = your-metrics-token
```

Access metrics: `http://localhost:3001/metrics?token=your-metrics-token`

### Custom Branding

Customize appearance in `app.ini`:

```ini
[ui]
DEFAULT_THEME = arc-green
THEMES = arc-green,auto
DEFAULT_SHOW_FULL_NAME = true

[ui.meta]
AUTHOR = Project Nyra
DESCRIPTION = Local Git Server
KEYWORDS = git,self-hosted,nyra
```

## Security Best Practices

1. **Change default admin password immediately**
2. **Disable user registration**: `DISABLE_REGISTRATION = true`
3. **Enforce strong passwords**: `MIN_PASSWORD_LENGTH = 12`
4. **Use SSH keys instead of passwords**
5. **Enable 2FA for admin accounts**
6. **Regular security updates**: `docker-compose pull && docker-compose up -d`
7. **Limit network access** to trusted IPs
8. **Use HTTPS** in production
9. **Regular backups** with off-site storage
10. **Monitor logs** for suspicious activity

## Integration with Other Services

### Cloudflare Tunnel

Expose Gitea securely via Cloudflare:

```yaml
# Add to cloudflared config
ingress:
  - hostname: git.nyra.example.com
    service: http://gitea:3000
```

### CI/CD Integration

**n8n Webhook:**
```javascript
// n8n workflow trigger
{
  "nodes": [
    {
      "name": "Gitea Webhook",
      "type": "n8n-nodes-base.webhook",
      "webhookId": "gitea-push",
      "parameters": {
        "path": "gitea-push",
        "responseMode": "onReceived"
      }
    }
  ]
}
```

**GitHub Actions Alternative:**
Use Gitea Actions (built-in CI/CD) with similar syntax to GitHub Actions.

## Conclusion

This Gitea setup provides a full-featured, self-hosted Git server for the Project Nyra orchestrator PC. It supports all standard Git operations, webhooks, API access, and integrates seamlessly with the existing infrastructure.

For additional help:
- Gitea Documentation: https://docs.gitea.io
- Gitea Community: https://discourse.gitea.io
- Project Nyra Documentation: `bootstrap/docs/`

---

**Last Updated**: 2026-01-15
**Maintainer**: Project Nyra DevOps Team
