# Docker Container Shims with Infisical Integration

Production-ready command-line shims for Project Nyra Docker-based tools with automatic Infisical secret injection.

## 📋 Overview

These shims provide seamless CLI access to containerized tools while maintaining security through Infisical secret management. Each shim:

- ✅ Checks Docker daemon status
- ✅ Validates container existence
- ✅ Auto-starts stopped containers
- ✅ Injects Infisical secrets automatically
- ✅ Passes through all CLI arguments
- ✅ Provides clear error messages
- ✅ Supports both Windows (CMD) and Linux/WSL (Bash)

## 🚀 Available Shims

### Claude Flow

**Production Mode:**
```bash
# Windows
claude-flow.cmd agent spawn -t coder --name my-coder
claude-flow.cmd swarm init --topology hierarchical

# Linux/WSL
./claude-flow.sh agent spawn -t coder --name my-coder
./claude-flow.sh swarm init --topology hierarchical
```

**Development Mode:**
```bash
# Windows
claude-flow-dev.cmd doctor --fix
claude-flow-dev.cmd hooks pre-task --description "my task"

# Linux/WSL
./claude-flow-dev.sh doctor --fix
./claude-flow-dev.sh hooks pre-task --description "my task"
```

### Archon OS

```bash
# Windows
archon.cmd --help
archon.cmd agent create --type coordinator

# Linux/WSL
./archon.sh --help
./archon.sh agent create --type coordinator
```

### Infisical CLI

```bash
# Windows
infisical.cmd secrets list --env=development
infisical.cmd export --env=production

# Linux/WSL
./infisical.sh secrets list --env=development
./infisical.sh export --env=production
```

## 🔧 Setup Instructions

### Windows Setup

1. **Add shims to PATH:**
   ```cmd
   setx PATH "%PATH%;C:\Dev\Projects\Repos\Project-Nyra\bootstrap\scripts\shims"
   ```

2. **Set environment variables:**
   ```cmd
   setx INFISICAL_PROJECT_ID "your-project-id"
   setx INFISICAL_TOKEN "your-token"
   ```

3. **Restart your terminal** to apply PATH changes.

4. **Test the shim:**
   ```cmd
   claude-flow --help
   ```

### Linux/WSL Setup

1. **Make scripts executable:**
   ```bash
   chmod +x C:/Dev/Projects/Repos/Project-Nyra/bootstrap/scripts/shims/*.sh
   ```

2. **Add shims to PATH** (add to ~/.bashrc or ~/.zshrc):
   ```bash
   export PATH="$PATH:/mnt/c/Dev/Projects/Repos/Project-Nyra/bootstrap/scripts/shims"
   ```

3. **Set environment variables** (add to ~/.bashrc or ~/.zshrc):
   ```bash
   export INFISICAL_PROJECT_ID="your-project-id"
   export INFISICAL_TOKEN="your-token"
   ```

4. **Reload shell configuration:**
   ```bash
   source ~/.bashrc  # or source ~/.zshrc
   ```

5. **Test the shim:**
   ```bash
   claude-flow.sh --help
   ```

### Alternative: Create Aliases (Linux/WSL)

Instead of adding to PATH, create aliases in ~/.bashrc or ~/.zshrc:

```bash
alias claude-flow='/mnt/c/Dev/Projects/Repos/Project-Nyra/bootstrap/scripts/shims/claude-flow.sh'
alias claude-flow-dev='/mnt/c/Dev/Projects/Repos/Project-Nyra/bootstrap/scripts/shims/claude-flow-dev.sh'
alias archon='/mnt/c/Dev/Projects/Repos/Project-Nyra/bootstrap/scripts/shims/archon.sh'
alias infisical='/mnt/c/Dev/Projects/Repos/Project-Nyra/bootstrap/scripts/shims/infisical.sh'
```

Then reload: `source ~/.bashrc`

## 🔐 Infisical Environment Configuration

### Environment Variables

All shims require these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `INFISICAL_PROJECT_ID` | Your Infisical project ID | `abc123def456` |
| `INFISICAL_TOKEN` | Infisical authentication token | `st.xxx.yyy.zzz` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `INFISICAL_ENV` | Environment name (development/staging/production) | `development` |
| `INFISICAL_PATH` | Secret path within project | Tool-specific |

### Per-Tool Secret Paths

Each tool uses its own Infisical secret path:

| Tool | Production Path | Development Path |
|------|----------------|------------------|
| Claude Flow | `/nyra/claude-flow` | `/nyra/claude-flow/dev` |
| Archon OS | `/nyra/archon` | `/nyra/archon/dev` |
| Infisical CLI | N/A (direct access) | N/A |

## 🐳 Container Requirements

### Required Containers

Before using the shims, ensure these containers are running:

```bash
# Start all MCP containers
docker-compose -f docker-compose.infisical.yml up -d

# Or start specific containers
docker-compose -f docker-compose.infisical.yml up -d claude-flow-mcp
docker-compose -f docker-compose.infisical.yml up -d archon-mcp
docker-compose -f docker-compose.infisical.yml up -d infisical-mcp
```

### Container Names

| Shim | Container Name | Service Name |
|------|---------------|--------------|
| `claude-flow.cmd/.sh` | `nyra-claude-flow-mcp` | `claude-flow-mcp` |
| `claude-flow-dev.cmd/.sh` | `nyra-claude-flow-mcp` | `claude-flow-mcp` |
| `archon.cmd/.sh` | `nyra-archon-mcp` | `archon-mcp` |
| `infisical.cmd/.sh` | `nyra-infisical-mcp` | `infisical-mcp` |

## 🔍 Troubleshooting

### "Docker is not running"

**Problem:** Docker daemon is not active.

**Solution:**
- **Windows:** Start Docker Desktop
- **Linux:** `sudo systemctl start docker`
- **WSL:** Ensure Docker Desktop has WSL2 integration enabled

### "Container does not exist"

**Problem:** Container hasn't been created yet.

**Solution:**
```bash
docker-compose -f docker-compose.infisical.yml up -d [service-name]
```

### "Failed to start container"

**Problem:** Container exists but won't start (usually port conflicts or configuration errors).

**Solution:**
```bash
# Check container logs
docker logs nyra-claude-flow-mcp

# Check for port conflicts
docker ps -a

# Remove and recreate container
docker-compose -f docker-compose.infisical.yml down [service-name]
docker-compose -f docker-compose.infisical.yml up -d [service-name]
```

### "Infisical authentication failed"

**Problem:** Invalid or missing Infisical credentials.

**Solution:**
1. Verify your `INFISICAL_PROJECT_ID` and `INFISICAL_TOKEN`
2. Check token permissions in Infisical dashboard
3. Ensure token hasn't expired
4. Test with Infisical CLI: `infisical secrets list --env=development`

### Permission Denied (Linux/WSL)

**Problem:** Shell scripts not executable.

**Solution:**
```bash
chmod +x /mnt/c/Dev/Projects/Repos/Project-Nyra/bootstrap/scripts/shims/*.sh
```

### Path Not Found (Windows)

**Problem:** CMD shims not in PATH.

**Solution:**
1. Verify PATH: `echo %PATH%`
2. Re-add to PATH and restart terminal
3. Use full path: `C:\Dev\Projects\Repos\Project-Nyra\bootstrap\scripts\shims\claude-flow.cmd`

## 🎯 Usage Examples

### Claude Flow Examples

```bash
# Initialize project
claude-flow init --wizard

# Start daemon
claude-flow daemon start

# Spawn agent
claude-flow agent spawn -t coder --name backend-dev

# Initialize swarm
claude-flow swarm init --topology hierarchical --max-agents 8

# Search memory
claude-flow memory search --query "authentication patterns"

# Run doctor diagnostics
claude-flow doctor --fix

# View hooks
claude-flow hooks list

# Development mode - with dev secrets
claude-flow-dev hooks session-start --session-id dev-session
```

### Archon OS Examples

```bash
# Check version
archon --version

# List agents
archon agent list

# Create coordinator
archon agent create --type coordinator --name main-coordinator

# Execute task
archon task run --file task.yaml
```

### Infisical CLI Examples

```bash
# List secrets
infisical secrets list --env=development

# Get specific secret
infisical secrets get API_KEY --env=production

# Export secrets to .env
infisical export --env=development > .env.local

# Inject secrets into command
infisical run --env=development -- npm start
```

## 🏗️ Architecture

### Shim Flow

```
User Command
    ↓
Shim Script (claude-flow.cmd/.sh)
    ↓
Docker Status Check
    ↓
Container Auto-Start (if needed)
    ↓
Infisical Secret Injection
    ↓
docker exec [container] sh -c "infisical run -- [command] [args]"
    ↓
Tool Execution in Container
    ↓
Output to User
```

### Secret Injection Flow

```
Environment Variables (HOST)
    ↓
Docker exec -e (Pass to container)
    ↓
infisical run (Load secrets from Infisical)
    ↓
Tool Execution (With full secret context)
```

## 📚 Advanced Configuration

### Custom Infisical Paths

Override default paths per-invocation:

```bash
# Windows
set INFISICAL_PATH=/custom/path
claude-flow.cmd doctor

# Linux/WSL
INFISICAL_PATH=/custom/path ./claude-flow.sh doctor
```

### Different Environments

Switch between development/staging/production:

```bash
# Windows
set INFISICAL_ENV=production
claude-flow.cmd swarm status

# Linux/WSL
INFISICAL_ENV=production ./claude-flow.sh swarm status
```

### Direct Docker Exec (Bypass Shim)

For debugging or advanced use:

```bash
# Without Infisical
docker exec nyra-claude-flow-mcp npx @claude-flow/cli@latest doctor

# With Infisical
docker exec -e INFISICAL_PROJECT_ID=$INFISICAL_PROJECT_ID \
            -e INFISICAL_TOKEN=$INFISICAL_TOKEN \
            nyra-claude-flow-mcp \
            sh -c "infisical run --env=development --path=/nyra/claude-flow -- npx @claude-flow/cli@latest doctor"
```

## 🔄 Updating Shims

When updating shims:

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Make scripts executable (Linux/WSL):**
   ```bash
   chmod +x bootstrap/scripts/shims/*.sh
   ```

3. **Test updated shims:**
   ```bash
   claude-flow --version
   archon --version
   ```

## 🤝 Contributing

When creating new shims:

1. Follow the existing pattern (status check, auto-start, error handling)
2. Include both Windows (.cmd) and Linux (.sh) versions
3. Add Infisical integration if the tool needs secrets
4. Update this README with usage examples
5. Test on both Windows and WSL/Linux

## 📝 Notes

- **Performance:** Shims add ~2-3 seconds on first use (container start time)
- **Caching:** Subsequent calls are near-instant if container is running
- **Isolation:** Each tool runs in its own container with isolated secrets
- **Security:** Secrets never touch the host filesystem
- **Compatibility:** Works with Docker Desktop (Windows/Mac) and Docker Engine (Linux)

## 🔗 Related Documentation

- [Claude Flow Documentation](https://github.com/ruvnet/claude-flow)
- [Archon OS Documentation](../../tools/archon-os/README.md)
- [Infisical Documentation](https://infisical.com/docs)
- [Docker Compose Configuration](../../docker-compose.infisical.yml)
- [4PC Distributed Architecture](../../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md)

## 📞 Support

For issues with shims:
1. Check troubleshooting section above
2. Verify Docker and container status: `docker ps -a`
3. Check container logs: `docker logs [container-name]`
4. Review Infisical configuration
5. Open an issue on GitHub with error details
