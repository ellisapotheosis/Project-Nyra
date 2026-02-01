# Claude Flow CI/CD Container Configuration

This directory contains configuration files for the Claude Flow CI/CD container.

## Directory Structure

```
configs/claude-flow-cicd/
├── .env.cicd.example          # Environment variables template
├── .env.cicd                  # Actual environment variables (DO NOT COMMIT)
├── gitconfig                  # Git configuration
├── git-credentials.example    # Git credentials template
├── git-credentials            # Actual credentials (DO NOT COMMIT)
├── hooks/                     # Custom hook scripts
│   ├── pre-task.sh
│   ├── post-task.sh
│   └── session-end.sh
├── ssh/                       # SSH keys for Git operations
│   ├── id_ed25519             # Private key (DO NOT COMMIT)
│   ├── id_ed25519.pub         # Public key
│   └── known_hosts            # SSH known hosts
└── README.md                  # This file
```

## Setup Instructions

### 1. Environment Configuration

```bash
# Copy example environment file
cp .env.cicd.example .env.cicd

# Edit with your actual values
vim .env.cicd
```

Required variables:
- `ANTHROPIC_API_KEY` - Claude API key
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `GOOGLE_API_KEY` - Google Gemini API key (optional)
- `OPENROUTER_API_KEY` - OpenRouter API key (optional)
- `JWT_SECRET` - Generate with `openssl rand -hex 32`
- `ENCRYPTION_KEY` - Generate with `openssl rand -hex 32`
- `SESSION_SECRET` - Generate with `openssl rand -hex 32`
- `POSTGRES_PASSWORD` - Database password
- `REDIS_PASSWORD` - Redis password

### 2. Git Configuration

#### Option A: HTTPS Authentication (Recommended for CI/CD)

```bash
# Copy credentials template
cp git-credentials.example git-credentials

# Add your GitHub token
echo "https://YOUR_USERNAME:YOUR_GITHUB_TOKEN@github.com" > git-credentials

# Set proper permissions
chmod 600 git-credentials
```

#### Option B: SSH Authentication

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "cicd@nyra.local" -f ssh/id_ed25519 -N ""

# Add public key to GitHub/GitLab
cat ssh/id_ed25519.pub
# Copy and add to GitHub: Settings > SSH and GPG keys

# Set proper permissions
chmod 700 ssh
chmod 600 ssh/id_ed25519
chmod 644 ssh/id_ed25519.pub
```

### 3. Custom Hooks (Optional)

Create custom hook scripts in the `hooks/` directory:

```bash
# Create pre-task hook
cat > hooks/pre-task.sh << 'EOF'
#!/bin/bash
# Custom pre-task logic
echo "Starting task: $1"
npx @claude-flow/cli@latest memory search --query "$1" --namespace cicd
EOF

chmod +x hooks/pre-task.sh
```

### 4. Start the Container

```bash
# From project root
cd /home/ellisapotheosis/projects/project-nyra

# Start Claude Flow CI/CD container
docker compose -f infra/docker-compose.claude-flow-cicd.yml up -d

# View logs
docker compose -f infra/docker-compose.claude-flow-cicd.yml logs -f

# Access shell
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd bash
```

## Usage

### Running Claude Flow Commands

```bash
# From host
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest status

# Inside container
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd bash
npx @claude-flow/cli@latest swarm init --topology mesh
npx @claude-flow/cli@latest agent spawn -t coder --name cicd-coder
npx @claude-flow/cli@latest memory search --query "deployment patterns" --namespace cicd
```

### Common Tasks

#### Initialize Swarm
```bash
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 8
```

#### Run CI/CD Pipeline
```bash
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest workflow run ci-pipeline --environment cicd
```

#### Check Memory
```bash
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest memory list --namespace cicd
```

#### Run Diagnostics
```bash
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest doctor --fix
```

### Data Backup

#### Backup AgentDB
```bash
docker run --rm \
  -v claude_flow_cicd_agentdb:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/agentdb-$(date +%Y%m%d).tar.gz /data
```

#### Restore AgentDB
```bash
docker run --rm \
  -v claude_flow_cicd_agentdb:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/agentdb-YYYYMMDD.tar.gz -C /
```

## Security Best Practices

1. **Never commit sensitive files:**
   - `.env.cicd`
   - `git-credentials`
   - `ssh/id_ed25519` (private key)

2. **Use proper file permissions:**
   ```bash
   chmod 600 .env.cicd
   chmod 600 git-credentials
   chmod 600 ssh/id_ed25519
   ```

3. **Rotate credentials regularly:**
   - API keys: Every 90 days
   - Git tokens: Every 90 days
   - SSH keys: Every 180 days

4. **Use secrets management in production:**
   - Infisical
   - HashiCorp Vault
   - Docker secrets
   - AWS Secrets Manager

5. **Monitor access:**
   - Review container logs regularly
   - Monitor API usage
   - Track Git operations

## Troubleshooting

### Container won't start
```bash
# Check logs
docker compose -f infra/docker-compose.claude-flow-cicd.yml logs claude-flow-cicd

# Verify environment file
docker compose -f infra/docker-compose.claude-flow-cicd.yml config

# Check volume permissions
docker volume inspect claude_flow_cicd_data
```

### Git authentication fails
```bash
# Test Git credentials
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  git ls-remote https://github.com/your-org/your-repo.git

# Verify credentials file
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  cat /root/.git-credentials
```

### Memory operations fail
```bash
# Check AgentDB status
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest memory list

# Reinitialize AgentDB
docker compose -f infra/docker-compose.claude-flow-cicd.yml exec claude-flow-cicd \
  npx @claude-flow/cli@latest memory init --force
```

### Performance issues
```bash
# Check resource usage
docker stats nyra-claude-flow-cicd

# Increase resource limits in docker-compose.claude-flow-cicd.yml
# Increase CLAUDE_FLOW_MEMORY_LIMIT and CLAUDE_FLOW_CACHE_SIZE in .env.cicd
```

## Advanced Configuration

### Custom Node.js Version
Edit `docker-compose.claude-flow-cicd.yml`:
```yaml
image: node:22-bullseye  # Change to desired version
```

### Additional Tools
Add to the `command` section in `docker-compose.claude-flow-cicd.yml`:
```bash
apt-get install -y -qq your-tool-here
```

### Network Isolation
To isolate from main services, remove `nyra-network` from networks section.

### Multiple Environments
Create separate compose files:
- `docker-compose.claude-flow-cicd-dev.yml`
- `docker-compose.claude-flow-cicd-staging.yml`
- `docker-compose.claude-flow-cicd-prod.yml`

## Support

For issues or questions:
1. Check [Claude Flow documentation](https://github.com/ruvnet/claude-flow)
2. Review container logs
3. Run diagnostics: `npx @claude-flow/cli@latest doctor`
4. Check project documentation in `docs/`
