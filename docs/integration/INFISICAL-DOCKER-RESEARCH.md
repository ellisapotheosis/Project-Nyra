# Infisical Docker Integration Research
## Comprehensive Analysis for Project Nyra

**Research Date:** 2026-01-15
**Scope:** Docker Compose integration with 10+ containers
**Objective:** Secure secret management for MCP servers and microservices

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Infisical Components Overview](#infisical-components-overview)
3. [Secret Injection Methods Comparison](#secret-injection-methods-comparison)
4. [Recommended Architecture](#recommended-architecture)
5. [Integration Guide](#integration-guide)
6. [Security Best Practices](#security-best-practices)
7. [Example Configurations](#example-configurations)
8. [Performance Considerations](#performance-considerations)
9. [References](#references)

---

## Executive Summary

Infisical is an open-source secret management platform that offers multiple integration methods for Docker Compose environments. For Project Nyra's 10-container architecture with MCP servers, the **Machine Identity + Infisical CLI** approach is recommended for production, while the **Infisical Agent sidecar pattern** provides the best balance of security and real-time secret updates.

**Key Finding:** Infisical provides 4 primary methods for Docker integration, each with distinct trade-offs. The optimal choice depends on security requirements, update frequency, and operational complexity.

---

## Infisical Components Overview

### 1. Self-Hosted Infisical Server (`infisical/infisical`)

**Purpose:** Central secret management server
**Docker Image:** `infisical/infisical:latest`
**Requirements:**
- PostgreSQL database
- Redis instance
- Environment variables: `ENCRYPTION_KEY`, `AUTH_SECRET`, `DB_CONNECTION_URI`, `REDIS_URL`, `SITE_URL`

**Use Case:** Host your own Infisical instance for complete control over secrets infrastructure.

**Production Considerations:**
- NOT designed for high-availability in basic Docker Compose setup
- Recommended to use managed PostgreSQL and Redis for production
- Requires strong encryption keys (not defaults)
- Supports container orchestration platforms (AWS ECS, Cloud Run, Kubernetes)

### 2. Infisical CLI (`@infisical/cli`)

**Purpose:** Command-line tool for secret injection and management
**Installation:**
```bash
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt update && sudo apt install -y infisical
```

**Key Features:**
- Inject secrets into applications: `infisical run --command="..."`
- Export secrets to various formats (dotenv, JSON, YAML)
- Scan for secret leaks in codebase and git history
- Authenticate with Infisical Cloud or self-hosted instances
- Integrate with CI/CD pipelines and Docker containers

**Limitations:**
- Cannot handle multi-line environment variables
- Requires authentication (machine identity or manual login)

### 3. Infisical Agent (Sidecar Pattern)

**Purpose:** Autonomous secret retrieval and real-time updates
**Architecture:** Runs as sidecar container alongside application services
**Key Capabilities:**
- Authenticates with Infisical to retrieve secrets
- Stores secrets in shared volume
- Provides real-time secret updates based on polling interval
- Ideal for Docker Swarm multi-node deployments

**How It Works:**
1. Infisical Agent container starts and authenticates
2. Retrieves secrets from Infisical server
3. Writes secrets to shared volume (e.g., `/secrets`)
4. Application containers read from shared volume
5. Agent polls for updates and refreshes secrets automatically

**Advantages:**
- Real-time secret updates without container restarts
- Decouples secret management from application code
- Works well in distributed environments (Docker Swarm)

### 4. Infisical SDK

**Purpose:** Programmatic API access to secrets from application code
**Available SDKs:** Node.js, Python, Go, Ruby, Java, .NET
**NPM Package:** `@infisical/sdk`

**Use Cases:**
- On-demand secret fetching within application
- Production environments requiring dynamic secret access
- More reliable than CLI in certain environments
- Preferred for larger teams and complex applications

**When to Use SDK vs CLI:**
- **SDK:** Production apps, programmatic access, on-demand fetching
- **CLI:** Development workflows, CI/CD, secret export/scan

### 5. Infisical MCP Server

**Purpose:** Model Context Protocol server for AI agent secret management
**Package:** `@infisical/mcp`
**GitHub:** https://github.com/Infisical/infisical-mcp-server

**Authentication:**
```bash
INFISICAL_UNIVERSAL_AUTH_CLIENT_ID=your_client_id
INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET=your_client_secret
INFISICAL_HOST_URL=http://localhost:8080  # Optional for self-hosted
```

**Capabilities:**
- Manage secrets, projects, environments, folders
- Create, update, delete, list, and retrieve secrets
- Invite members and manage access
- Integrates with Claude Desktop and other MCP clients

**Configuration (Claude Desktop):**
```json
{
  "mcpServers": {
    "infisical": {
      "command": "npx",
      "args": ["-y", "@infisical/mcp"],
      "env": {
        "INFISICAL_UNIVERSAL_AUTH_CLIENT_ID": "your_client_id",
        "INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

---

## Secret Injection Methods Comparison

### Method 1: Service Tokens (Legacy)

**How It Works:**
- Generate unique service token per container
- Set `INFISICAL_TOKEN` environment variable
- Container uses token to fetch secrets on startup

**Pros:**
- Simple setup
- Per-service authentication

**Cons:**
- Less secure than machine identities
- Manual token rotation
- Tokens can be long-lived

**Rating:** ⭐⭐⭐☆☆ (Suitable for development, not recommended for production)

### Method 2: Machine Identity (Recommended for Production)

**How It Works:**
- Generate machine identity with Universal Auth credentials
- Set `INFISICAL_MACHINE_IDENTITY_CLIENT_ID` and `INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET`
- Credentials authenticate to obtain short-lived access tokens

**Pros:**
- Short-lived tokens (automatic rotation)
- Secure authentication mechanism
- Fine-grained access control
- Recommended by Infisical for production

**Cons:**
- More setup complexity
- Requires credential management

**Rating:** ⭐⭐⭐⭐⭐ (Best for production)

### Method 3: Infisical CLI with `infisical run`

**How It Works:**
```bash
infisical run --command="docker compose up -d"
```
- Wraps Docker Compose command
- Injects secrets as environment variables before container starts

**Pros:**
- No container image modification needed
- Works with existing Docker Compose files
- Secrets never stored in files

**Cons:**
- Requires CLI installed on host
- Secrets injected at startup only (no runtime updates)
- Not suitable for long-running containers needing secret rotation

**Rating:** ⭐⭐⭐⭐☆ (Excellent for CI/CD and development)

### Method 4: CLI with `--env-file` Flag

**How It Works:**
```bash
docker compose --env-file <(infisical export --format=dotenv) up
```
- Exports secrets to dotenv format
- Passes as environment file to Docker Compose

**Pros:**
- Simple command
- Compatible with standard Docker Compose workflow

**Cons:**
- Secrets written to process substitution (less secure)
- No runtime updates

**Rating:** ⭐⭐⭐☆☆ (Good for quick local development)

### Method 5: Infisical Agent Sidecar

**How It Works:**
```yaml
services:
  infisical-agent:
    image: infisical/agent:latest
    volumes:
      - secrets:/secrets

  app:
    image: myapp:latest
    volumes:
      - secrets:/secrets:ro
    environment:
      SECRET_FILE: /secrets/app-secrets.env
```
- Agent container authenticates and retrieves secrets
- Writes to shared volume
- Applications read from volume
- Automatic polling for updates

**Pros:**
- Real-time secret updates (no restarts)
- Decoupled from application
- Scales well in distributed systems (Docker Swarm)
- Works across multiple nodes

**Cons:**
- Additional container overhead
- More complex setup
- Shared volume management

**Rating:** ⭐⭐⭐⭐⭐ (Best for production with dynamic secrets)

### Method 6: Infisical SDK Integration

**How It Works:**
```javascript
const { InfisicalClient } = require("@infisical/sdk");

const client = new InfisicalClient({
  clientId: process.env.INFISICAL_CLIENT_ID,
  clientSecret: process.env.INFISICAL_CLIENT_SECRET,
});

const secrets = await client.listSecrets({ environment: "prod" });
```

**Pros:**
- On-demand secret fetching
- Programmatic control
- Dynamic secret updates
- No external tools required

**Cons:**
- Requires code changes
- SDK dependency in application
- More complex error handling

**Rating:** ⭐⭐⭐⭐☆ (Best for application-level secret management)

---

## Comparison Matrix

| Method | Security | Setup Complexity | Runtime Updates | Container Overhead | Production Ready | Best For |
|--------|----------|------------------|-----------------|-------------------|------------------|----------|
| Service Tokens | ⭐⭐⭐ | ⭐⭐ | ❌ | Low | ❌ | Development |
| Machine Identity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ | Low | ✅ | Production CLI |
| `infisical run` | ⭐⭐⭐⭐ | ⭐⭐ | ❌ | None | ✅ | CI/CD |
| `--env-file` | ⭐⭐⭐ | ⭐ | ❌ | None | ⚠️ | Local Dev |
| Agent Sidecar | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | Medium | ✅ | Production (Dynamic) |
| SDK | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | Low | ✅ | App Integration |

---

## Recommended Architecture for Project Nyra

### Overview

Project Nyra has 10 Docker containers requiring secret management:
1. MCP servers (3-5 containers)
2. Backend services (2-3 containers)
3. Frontend applications (1-2 containers)
4. Infrastructure services (databases, Redis, etc.)

### Recommended Hybrid Approach

**Tier 1: Critical Services (MCP Servers, Backend APIs)**
- **Method:** Infisical Agent Sidecar Pattern
- **Reason:** Real-time secret updates, high security, dynamic rotation

**Tier 2: Standard Services (Frontend, Workers)**
- **Method:** Machine Identity + CLI Injection
- **Reason:** Simpler setup, sufficient security, startup-time injection

**Tier 3: Development/Testing**
- **Method:** `infisical run` or `--env-file`
- **Reason:** Quick iteration, minimal setup

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Infisical Server                         │
│                  (Self-Hosted or Cloud)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Agent Sidecar│  │ Agent Sidecar│  │   CLI Layer  │
│  (MCP-1)     │  │  (Backend-1) │  │  (Frontend)  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │ volume          │ volume          │ env vars
       ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ MCP Server 1 │  │ Backend API  │  │  Frontend    │
│ (Claude Flow)│  │  Service     │  │  App         │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Network Topology

```yaml
networks:
  infisical-net:
    internal: true  # Infisical agent communication
  app-net:
    internal: false  # Application traffic

services:
  infisical-server:
    networks:
      - infisical-net

  infisical-agent-mcp:
    networks:
      - infisical-net

  mcp-server:
    networks:
      - infisical-net
      - app-net
```

---

## Integration Guide

### Step 1: Deploy Self-Hosted Infisical

**1.1 Generate Encryption Keys**
```bash
# Generate secure keys (DO NOT use defaults in production)
openssl rand -hex 16  # ENCRYPTION_KEY
openssl rand -base64 32  # AUTH_SECRET
```

**1.2 Create `docker-compose.infisical.yml`**
```yaml
version: '3.8'

services:
  infisical:
    image: infisical/infisical:latest
    container_name: infisical-server
    environment:
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - AUTH_SECRET=${AUTH_SECRET}
      - DB_CONNECTION_URI=postgresql://infisical:password@postgres:5432/infisical
      - REDIS_URL=redis://redis:6379
      - SITE_URL=http://localhost:8080
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis
    networks:
      - infisical-net

  postgres:
    image: postgres:15-alpine
    container_name: infisical-postgres
    environment:
      - POSTGRES_USER=infisical
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=infisical
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - infisical-net

  redis:
    image: redis:7-alpine
    container_name: infisical-redis
    volumes:
      - redis-data:/data
    networks:
      - infisical-net

volumes:
  postgres-data:
  redis-data:

networks:
  infisical-net:
    driver: bridge
```

**1.3 Start Infisical Server**
```bash
docker compose -f docker-compose.infisical.yml up -d
```

**1.4 Access Web UI**
- Navigate to `http://localhost:8080`
- Create admin account
- Create organization and project

### Step 2: Configure Machine Identities

**2.1 Create Machine Identity (Web UI)**
1. Navigate to **Organization Settings** > **Machine Identities**
2. Click **Create Machine Identity**
3. Name: `nyra-mcp-server-1`
4. Choose **Universal Auth**
5. Copy `Client ID` and `Client Secret`

**2.2 Assign Permissions**
1. Go to **Project Settings** > **Access Control**
2. Add machine identity to project
3. Grant appropriate role (e.g., `Developer`, `Viewer`)

**2.3 Store Credentials Securely**
```bash
# Add to .env file (DO NOT commit to git)
echo "INFISICAL_CLIENT_ID_MCP1=<client-id>" >> .env
echo "INFISICAL_CLIENT_SECRET_MCP1=<client-secret>" >> .env
```

### Step 3: Method A - Infisical Agent Sidecar (Recommended for MCP Servers)

**3.1 Create Agent Configuration**
```yaml
# infisical-agent-config.yaml
infisical:
  address: "http://infisical-server:8080"

auth:
  type: "universal-auth"
  config:
    client_id: "${INFISICAL_CLIENT_ID_MCP1}"
    client_secret: "${INFISICAL_CLIENT_SECRET_MCP1}"

sinks:
  - type: "file"
    config:
      path: "/secrets/app-secrets.env"
      format: "dotenv"

templates:
  - source_path: "/templates/app-config.tpl"
    destination_path: "/secrets/app-config.json"

polling_interval: 60  # Poll every 60 seconds for updates
```

**3.2 Update Docker Compose**
```yaml
version: '3.8'

services:
  # Infisical Agent for MCP Server 1
  agent-mcp-1:
    image: infisical/agent:latest
    container_name: infisical-agent-mcp-1
    environment:
      - INFISICAL_CLIENT_ID=${INFISICAL_CLIENT_ID_MCP1}
      - INFISICAL_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET_MCP1}
      - INFISICAL_HOST_URL=http://infisical-server:8080
    volumes:
      - mcp-1-secrets:/secrets
      - ./infisical-agent-config.yaml:/config/config.yaml:ro
    networks:
      - infisical-net
    restart: unless-stopped

  # MCP Server 1
  mcp-server-1:
    image: mcp-server:latest
    container_name: mcp-server-1
    volumes:
      - mcp-1-secrets:/secrets:ro  # Read-only mount
    environment:
      - SECRET_FILE=/secrets/app-secrets.env
    # Application loads secrets from file
    command: sh -c "set -a; . /secrets/app-secrets.env; set +a; npm start"
    depends_on:
      - agent-mcp-1
    networks:
      - infisical-net
      - app-net
    restart: unless-stopped

volumes:
  mcp-1-secrets:

networks:
  infisical-net:
    driver: bridge
  app-net:
    driver: bridge
```

### Step 4: Method B - Machine Identity + CLI (For Frontend/Workers)

**4.1 Update Docker Compose**
```yaml
services:
  frontend:
    image: frontend:latest
    container_name: frontend-app
    environment:
      # Reference secrets - actual values injected by CLI
      - NEXT_PUBLIC_API_URL
      - DATABASE_URL
      - REDIS_URL
    # No values defined here - pulled from Infisical
    networks:
      - app-net
```

**4.2 Create Infisical Project and Add Secrets**
1. Web UI > **Create Environment** (e.g., `production`, `development`)
2. Add secrets:
   - `NEXT_PUBLIC_API_URL=https://api.example.com`
   - `DATABASE_URL=postgresql://...`
   - `REDIS_URL=redis://...`

**4.3 Deploy with CLI**
```bash
# Install Infisical CLI
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt update && sudo apt install -y infisical

# Authenticate with Machine Identity
export INFISICAL_MACHINE_IDENTITY_CLIENT_ID="<client-id>"
export INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET="<client-secret>"

# Run Docker Compose with secret injection
infisical run --env=production --project-id=<project-id> -- docker compose up -d
```

### Step 5: Configure MCP Server with Infisical

**5.1 Update MCP Server Configuration**
```json
// claude_desktop_config.json or .mcp.json
{
  "mcpServers": {
    "infisical": {
      "command": "npx",
      "args": ["-y", "@infisical/mcp"],
      "env": {
        "INFISICAL_UNIVERSAL_AUTH_CLIENT_ID": "${INFISICAL_CLIENT_ID_MCP1}",
        "INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET": "${INFISICAL_CLIENT_SECRET_MCP1}",
        "INFISICAL_HOST_URL": "http://localhost:8080"
      }
    },
    "archon-os": {
      "command": "npx",
      "args": ["-y", "@archon-os/cli@latest"],
      "env": {
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}",
        "OPENAI_API_KEY": "${OPENAI_API_KEY}"
      }
    }
  }
}
```

**5.2 Store API Keys in Infisical**
1. Create secrets in Infisical project:
   - `ANTHROPIC_API_KEY=sk-ant-...`
   - `OPENAI_API_KEY=sk-...`
2. Agent will inject these into MCP server environment

### Step 6: Testing and Validation

**6.1 Verify Secret Injection**
```bash
# Check if secrets are available in container
docker exec mcp-server-1 cat /secrets/app-secrets.env

# Test environment variables
docker exec mcp-server-1 env | grep API_KEY
```

**6.2 Test Secret Updates (Agent Sidecar)**
1. Update secret in Infisical Web UI
2. Wait for polling interval (60 seconds)
3. Verify file updated: `docker exec agent-mcp-1 cat /secrets/app-secrets.env`
4. Application should reload secrets (implement file watcher)

**6.3 Test MCP Server**
```bash
# Test Infisical MCP server
npx @infisical/mcp <<EOF
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
EOF
```

### Step 7: Production Hardening

**7.1 Use Managed Database and Redis**
```yaml
services:
  infisical:
    environment:
      - DB_CONNECTION_URI=postgresql://user:pass@managed-postgres.aws.com:5432/infisical
      - REDIS_URL=redis://managed-redis.aws.com:6379
```

**7.2 Enable TLS/HTTPS**
```yaml
services:
  infisical:
    environment:
      - SITE_URL=https://infisical.company.com
    # Add nginx reverse proxy with SSL certificates
```

**7.3 Implement Secret Rotation**
1. Enable Infisical Secret Rotation in Web UI
2. Configure rotation policies (e.g., every 90 days)
3. Supported services: PostgreSQL, MySQL, AWS IAM

**7.4 Enable Audit Logging**
```yaml
services:
  infisical:
    environment:
      - AUDIT_LOG_ENABLED=true
      - AUDIT_LOG_RETENTION_DAYS=90
```

---

## Security Best Practices

### 1. Encryption Keys

**DO:**
- Generate strong keys: `openssl rand -hex 16` (ENCRYPTION_KEY), `openssl rand -base64 32` (AUTH_SECRET)
- Store keys in secure vaults (AWS Secrets Manager, Azure Key Vault)
- Rotate keys periodically

**DON'T:**
- Use default keys from documentation
- Commit keys to git repositories
- Share keys across environments

### 2. Authentication

**DO:**
- Use Machine Identities with Universal Auth (short-lived tokens)
- Implement least privilege access (assign minimal required permissions)
- Create separate identities per service
- Enable multi-factor authentication for user accounts

**DON'T:**
- Use Service Tokens in production (long-lived)
- Share credentials between services
- Hard-code credentials in code or Dockerfiles

### 3. Network Security

**DO:**
- Use internal Docker networks for Infisical communication
- Implement network segmentation (separate networks for different tiers)
- Enable TLS for all external communication
- Restrict Infisical server access to known IPs

**DON'T:**
- Expose Infisical ports to public internet without authentication
- Use unencrypted HTTP in production
- Allow unrestricted network access between containers

### 4. Secret Rotation

**DO:**
- Enable automatic secret rotation for databases and API keys
- Implement graceful secret reloading in applications
- Monitor rotation events and failures
- Test rotation procedures regularly

**DON'T:**
- Rely on manual rotation processes
- Skip testing after rotation
- Use secrets that cannot be rotated

### 5. Audit and Monitoring

**DO:**
- Enable audit logging for all secret access
- Monitor for unusual access patterns
- Set up alerts for failed authentication attempts
- Regularly review access logs

**DON'T:**
- Disable logging in production
- Ignore security alerts
- Grant overly broad permissions

### 6. Container Security

**DO:**
- Use read-only volume mounts for secrets (`secrets:/secrets:ro`)
- Run containers with non-root users
- Implement resource limits
- Use minimal base images

**DON'T:**
- Run containers as root
- Mount secrets with write permissions
- Expose secrets in container logs

### 7. Development vs Production

**DO:**
- Use separate Infisical projects for dev/staging/production
- Implement different access controls per environment
- Use `infisical run` in CI/CD for secret injection
- Test secret rotation in staging first

**DON'T:**
- Share secrets between environments
- Use production secrets in development
- Skip security reviews for development setups

---

## Example Configurations

### Example 1: Basic Self-Hosted Infisical

```yaml
# docker-compose.infisical.yml
version: '3.8'

services:
  infisical:
    image: infisical/infisical:latest
    container_name: infisical
    environment:
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - AUTH_SECRET=${AUTH_SECRET}
      - DB_CONNECTION_URI=postgresql://infisical:${DB_PASSWORD}@postgres:5432/infisical
      - REDIS_URL=redis://redis:6379
      - SITE_URL=http://localhost:8080
      - AUDIT_LOG_ENABLED=true
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - infisical-net
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    container_name: infisical-db
    environment:
      - POSTGRES_USER=infisical
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=infisical
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - infisical-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U infisical"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: infisical-redis
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - infisical-net
    restart: unless-stopped

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local

networks:
  infisical-net:
    driver: bridge
    internal: true
```

### Example 2: Agent Sidecar with MCP Server

```yaml
# docker-compose.mcp.yml
version: '3.8'

services:
  # Infisical Agent for Claude Flow MCP
  agent-archon-os:
    image: infisical/agent:latest
    container_name: agent-archon-os
    environment:
      - INFISICAL_CLIENT_ID=${INFISICAL_CLIENT_ID_CLAUDE_FLOW}
      - INFISICAL_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET_CLAUDE_FLOW}
      - INFISICAL_HOST_URL=http://infisical:8080
      - INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID}
      - INFISICAL_ENVIRONMENT=production
    volumes:
      - archon-os-secrets:/secrets
      - ./agent-config.yaml:/config/config.yaml:ro
    networks:
      - infisical-net
    depends_on:
      - infisical
    restart: unless-stopped

  # Claude Flow MCP Server
  archon-os-mcp:
    image: ghcr.io/ruvnet/archon-os:latest
    container_name: archon-os-mcp
    volumes:
      - archon-os-secrets:/secrets:ro
      - ./data/memory:/app/data/memory
    environment:
      - SECRET_FILE=/secrets/archon-os.env
      - NODE_ENV=production
    command: sh -c "set -a; . /secrets/archon-os.env; set +a; npx @archon-os/cli@latest"
    depends_on:
      - agent-archon-os
    networks:
      - infisical-net
      - mcp-net
    ports:
      - "3000:3000"
    restart: unless-stopped

  # Infisical Agent for RUV Swarm
  agent-ruv-swarm:
    image: infisical/agent:latest
    container_name: agent-ruv-swarm
    environment:
      - INFISICAL_CLIENT_ID=${INFISICAL_CLIENT_ID_RUV}
      - INFISICAL_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET_RUV}
      - INFISICAL_HOST_URL=http://infisical:8080
      - INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID}
      - INFISICAL_ENVIRONMENT=production
    volumes:
      - ruv-swarm-secrets:/secrets
    networks:
      - infisical-net
    depends_on:
      - infisical
    restart: unless-stopped

  # RUV Swarm MCP Server
  ruv-swarm-mcp:
    image: ghcr.io/ruvnet/ruv-swarm:latest
    container_name: ruv-swarm-mcp
    volumes:
      - ruv-swarm-secrets:/secrets:ro
    environment:
      - SECRET_FILE=/secrets/ruv-swarm.env
    command: sh -c "set -a; . /secrets/ruv-swarm.env; set +a; npm start"
    depends_on:
      - agent-ruv-swarm
    networks:
      - infisical-net
      - mcp-net
    ports:
      - "3001:3001"
    restart: unless-stopped

volumes:
  archon-os-secrets:
  ruv-swarm-secrets:

networks:
  infisical-net:
    external: true
    name: infisical_infisical-net
  mcp-net:
    driver: bridge
```

### Example 3: Agent Configuration File

```yaml
# agent-config.yaml
infisical:
  address: "http://infisical:8080"
  skip_tls_verify: false  # Set to true for self-signed certs in dev

auth:
  type: "universal-auth"
  config:
    client_id: "${INFISICAL_CLIENT_ID}"
    client_secret: "${INFISICAL_CLIENT_SECRET}"
    remove_client_secret_on_read: false

sinks:
  - type: "file"
    config:
      path: "/secrets/archon-os.env"
      format: "dotenv"
      template: |
        {{- range .Secrets }}
        {{ .Key }}={{ .Value }}
        {{- end }}

templates:
  - source_path: "/templates/config.json.tpl"
    destination_path: "/secrets/config.json"

polling_interval: 60  # seconds
retry_interval: 10    # seconds on error
max_retries: 5

log_level: "info"  # debug, info, warn, error
```

### Example 4: CLI Injection (Development)

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile.dev
    container_name: frontend-dev
    environment:
      # Values injected by Infisical CLI
      - NEXT_PUBLIC_API_URL
      - NEXT_PUBLIC_AUTH_DOMAIN
      - DATABASE_URL
      - REDIS_URL
    ports:
      - "3000:3000"
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules
    networks:
      - dev-net

  backend:
    build:
      context: ./services/backend
      dockerfile: Dockerfile.dev
    container_name: backend-dev
    environment:
      - DATABASE_URL
      - REDIS_URL
      - JWT_SECRET
      - SMTP_HOST
      - SMTP_USER
      - SMTP_PASSWORD
    ports:
      - "4000:4000"
    volumes:
      - ./services/backend:/app
      - /app/node_modules
    networks:
      - dev-net

networks:
  dev-net:
    driver: bridge
```

**Run with:**
```bash
# Authenticate
infisical login

# OR use machine identity
export INFISICAL_MACHINE_IDENTITY_CLIENT_ID="client-id"
export INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET="client-secret"

# Run with secret injection
infisical run --env=development --project-id=<project-id> -- docker compose -f docker-compose.dev.yml up
```

### Example 5: Production Setup with Managed Services

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  infisical:
    image: infisical/infisical:latest-alpine
    container_name: infisical-prod
    environment:
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - AUTH_SECRET=${AUTH_SECRET}
      - DB_CONNECTION_URI=${DB_CONNECTION_URI}  # Managed PostgreSQL (AWS RDS)
      - REDIS_URL=${REDIS_URL}  # Managed Redis (AWS ElastiCache)
      - SITE_URL=https://infisical.company.com
      - AUDIT_LOG_ENABLED=true
      - AUDIT_LOG_RETENTION_DAYS=90
      - RATE_LIMIT_ENABLED=true
      - TRUST_PROXY=true
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    networks:
      - infisical-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/status"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    ports:
      - "443:443"
      - "80:80"
    depends_on:
      - infisical
    networks:
      - infisical-net
      - public-net
    restart: unless-stopped

networks:
  infisical-net:
    driver: bridge
    internal: true
  public-net:
    driver: bridge
```

### Example 6: Multi-Environment Setup

```yaml
# docker-compose.multi-env.yml
version: '3.8'

x-agent-base: &agent-base
  image: infisical/agent:latest
  environment:
    INFISICAL_HOST_URL: http://infisical:8080
  networks:
    - infisical-net
  restart: unless-stopped

services:
  # Development Environment
  agent-dev:
    <<: *agent-base
    container_name: agent-dev
    environment:
      INFISICAL_HOST_URL: http://infisical:8080
      INFISICAL_CLIENT_ID: ${INFISICAL_CLIENT_ID_DEV}
      INFISICAL_CLIENT_SECRET: ${INFISICAL_CLIENT_SECRET_DEV}
      INFISICAL_ENVIRONMENT: development
    volumes:
      - dev-secrets:/secrets

  app-dev:
    image: myapp:dev
    container_name: app-dev
    volumes:
      - dev-secrets:/secrets:ro
    environment:
      - NODE_ENV=development
      - SECRET_FILE=/secrets/app.env
    depends_on:
      - agent-dev
    networks:
      - infisical-net
      - dev-net

  # Staging Environment
  agent-staging:
    <<: *agent-base
    container_name: agent-staging
    environment:
      INFISICAL_HOST_URL: http://infisical:8080
      INFISICAL_CLIENT_ID: ${INFISICAL_CLIENT_ID_STAGING}
      INFISICAL_CLIENT_SECRET: ${INFISICAL_CLIENT_SECRET_STAGING}
      INFISICAL_ENVIRONMENT: staging
    volumes:
      - staging-secrets:/secrets

  app-staging:
    image: myapp:staging
    container_name: app-staging
    volumes:
      - staging-secrets:/secrets:ro
    environment:
      - NODE_ENV=staging
      - SECRET_FILE=/secrets/app.env
    depends_on:
      - agent-staging
    networks:
      - infisical-net
      - staging-net

  # Production Environment
  agent-prod:
    <<: *agent-base
    container_name: agent-prod
    environment:
      INFISICAL_HOST_URL: http://infisical:8080
      INFISICAL_CLIENT_ID: ${INFISICAL_CLIENT_ID_PROD}
      INFISICAL_CLIENT_SECRET: ${INFISICAL_CLIENT_SECRET_PROD}
      INFISICAL_ENVIRONMENT: production
    volumes:
      - prod-secrets:/secrets

  app-prod:
    image: myapp:production
    container_name: app-prod
    volumes:
      - prod-secrets:/secrets:ro
    environment:
      - NODE_ENV=production
      - SECRET_FILE=/secrets/app.env
    depends_on:
      - agent-prod
    networks:
      - infisical-net
      - prod-net
    deploy:
      replicas: 3

volumes:
  dev-secrets:
  staging-secrets:
  prod-secrets:

networks:
  infisical-net:
    external: true
  dev-net:
  staging-net:
  prod-net:
```

---

## Performance Considerations

### Agent Sidecar Pattern

**Pros:**
- Minimal overhead (lightweight container ~50MB)
- Efficient polling (configurable interval, default 60s)
- Shared memory access (volume mount, no network latency)

**Cons:**
- Additional container per service requiring secrets
- Volume management overhead
- Polling delay (up to 60s for updates)

**Optimization:**
- Reduce polling interval for critical services: `polling_interval: 10`
- Use single agent for multiple containers (shared volume)
- Implement file watchers in applications for immediate reload

### CLI Injection

**Pros:**
- Zero runtime overhead (secrets injected at startup)
- No additional containers
- Fast startup (one-time fetch)

**Cons:**
- No runtime updates (requires container restart)
- CLI dependency on host
- Startup delay for large secret sets

**Optimization:**
- Cache secrets locally for faster restarts
- Batch secret fetches
- Use `--env-file` for faster injection

### SDK Integration

**Pros:**
- On-demand fetching (minimal memory footprint)
- Dynamic updates (no restarts)
- Fine-grained control

**Cons:**
- Network latency per fetch
- SDK dependency in application
- Potential rate limiting

**Optimization:**
- Implement local caching in application
- Batch secret requests
- Use background refresh for frequently accessed secrets

### Network Performance

**Recommendations:**
1. Use internal Docker networks (lower latency)
2. Co-locate Infisical server with applications (same Docker host)
3. Use connection pooling for SDK requests
4. Monitor network bandwidth for agent polling

### Resource Allocation

**Infisical Server:**
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

**Infisical Agent:**
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 256M
    reservations:
      cpus: '0.1'
      memory: 128M
```

### Scaling Considerations

**Horizontal Scaling:**
- Infisical server supports multiple replicas (stateless)
- Use load balancer (nginx, Traefik) for high availability
- Agents scale with application containers

**Database Optimization:**
- Use managed PostgreSQL with read replicas for high-traffic
- Enable connection pooling (pgBouncer)
- Index frequently queried secrets

**Redis Caching:**
- Use Redis Cluster for high availability
- Enable persistence (AOF + RDB)
- Monitor memory usage

---

## References

### Official Documentation
1. [Docker Compose Integration](https://infisical.com/docs/integrations/platforms/docker-compose) - Official Infisical Docker Compose guide
2. [Docker Swarm with Agent](https://infisical.com/docs/integrations/platforms/docker-swarm-with-agent) - Agent sidecar pattern documentation
3. [MCP Servers](https://infisical.com/docs/documentation/platform/agent-sentinel/mcp-servers) - MCP server integration
4. [SDKs Overview](https://infisical.com/docs/sdks/overview) - SDK documentation for multiple languages
5. [Self-Hosting Deployment](https://infisical.com/docs/self-hosting/deployment-options/docker-compose) - Self-hosting with Docker Compose

### Blog Posts and Guides
6. [Self-Hosting Infisical Homelab](https://infisical.com/blog/self-hosting-infisical-homelab) - Comprehensive self-hosting guide
7. [Managing Secrets in MCP Servers](https://infisical.com/blog/managing-secrets-mcp-servers) - MCP-specific secret management
8. [Open Source Secrets Management](https://infisical.com/blog/open-source-secrets-management-devops) - DevOps best practices

### GitHub Repositories
9. [Infisical Main Repo](https://github.com/Infisical/infisical) - Official Infisical repository
10. [Infisical CLI](https://github.com/Infisical/cli) - CLI tool repository
11. [Infisical MCP Server](https://github.com/Infisical/infisical-mcp-server) - Official MCP server implementation

### Community Resources
12. [Docker Compose Secrets Discussion](https://sysadmins.zone/topic/53/using-infisical-for-docker-composer-secrets) - Community discussion
13. [Infisical Docker Hub](https://hub.docker.com/r/infisical/infisical) - Official Docker images
14. [Medium: Machine Identities Guide](https://medium.com/@tony.infisical/how-to-use-infisicals-machine-identities-feature-ac64d3a37f74) - Machine identity tutorial
15. [LobeHub MCP Integration](https://lobehub.com/mcp/infisical-infisical-mcp) - MCP server catalog entry

---

## Appendix A: Troubleshooting

### Issue: Agent Cannot Connect to Infisical Server

**Symptoms:**
- Agent logs show connection errors
- Secrets not appearing in shared volume

**Solutions:**
1. Verify network connectivity: `docker exec agent-mcp-1 ping infisical`
2. Check Infisical server logs: `docker logs infisical`
3. Verify `INFISICAL_HOST_URL` uses correct Docker service name
4. Ensure agent and server on same Docker network

### Issue: Multi-line Environment Variables Not Working

**Known Limitation:**
- Infisical does not support multi-line environment variables

**Workarounds:**
1. Use base64 encoding: `BASE64_SECRET=$(echo "$MULTILINE_SECRET" | base64)`
2. Store as file template instead of environment variable
3. Use JSON format with escaped newlines

### Issue: Secrets Not Updating in Real-Time

**Symptoms:**
- Agent shows updated secrets but application still uses old values

**Solutions:**
1. Implement file watcher in application to detect changes
2. Reduce polling interval: `polling_interval: 10`
3. Use SDK for on-demand fetching instead of file-based approach
4. Restart application container after secret update

### Issue: Permission Denied Reading Secrets

**Symptoms:**
- Application cannot read `/secrets/app.env` file

**Solutions:**
1. Check volume mount permissions: `docker exec app-1 ls -la /secrets`
2. Ensure agent writes files with correct permissions
3. Run application container with same user as agent
4. Use read-only mount: `secrets:/secrets:ro`

---

## Appendix B: Migration Guide

### Migrating from Environment Variables to Infisical

**Step 1: Audit Current Secrets**
```bash
# List all environment variables in docker-compose.yml
grep -r "environment:" docker-compose.yml

# Extract unique secret keys
grep -A 20 "environment:" docker-compose.yml | grep "^      -" | sort | uniq
```

**Step 2: Create Infisical Project and Secrets**
1. Web UI > Create Project: `project-nyra`
2. Create environments: `development`, `staging`, `production`
3. Import secrets via CLI:
```bash
infisical secrets set DATABASE_URL "postgresql://..." --env production
infisical secrets set REDIS_URL "redis://..." --env production
# ... repeat for all secrets
```

**Step 3: Update Docker Compose**
```yaml
# Before
services:
  app:
    environment:
      - DATABASE_URL=postgresql://user:pass@db/mydb
      - API_KEY=secret123

# After (using agent sidecar)
services:
  agent:
    image: infisical/agent:latest
    environment:
      - INFISICAL_CLIENT_ID=${INFISICAL_CLIENT_ID}
      - INFISICAL_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET}
    volumes:
      - secrets:/secrets

  app:
    volumes:
      - secrets:/secrets:ro
    environment:
      - SECRET_FILE=/secrets/app.env
```

**Step 4: Test Migration**
1. Start with development environment
2. Verify secrets loaded correctly: `docker exec app cat /secrets/app.env`
3. Run application tests
4. Repeat for staging, then production

**Step 5: Remove Hardcoded Secrets**
1. Delete secrets from docker-compose.yml
2. Remove .env files from repository
3. Update .gitignore to exclude secret files
4. Commit changes

---

## Appendix C: Infisical API Reference

### Authentication

```bash
# Login with Machine Identity
curl -X POST "http://localhost:8080/api/v1/auth/universal-auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-id",
    "clientSecret": "client-secret"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 7200,
  "tokenType": "Bearer"
}
```

### List Secrets

```bash
curl -X GET "http://localhost:8080/api/v3/secrets/raw?workspaceId=<project-id>&environment=production" \
  -H "Authorization: Bearer <access-token>"
```

**Response:**
```json
{
  "secrets": [
    {
      "id": "secret-id-1",
      "key": "DATABASE_URL",
      "value": "postgresql://...",
      "type": "shared",
      "tags": []
    }
  ]
}
```

### Create Secret

```bash
curl -X POST "http://localhost:8080/api/v3/secrets/raw/<secret-name>" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "<project-id>",
    "environment": "production",
    "secretValue": "my-secret-value",
    "type": "shared"
  }'
```

### Update Secret

```bash
curl -X PATCH "http://localhost:8080/api/v3/secrets/raw/<secret-name>" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "<project-id>",
    "environment": "production",
    "secretValue": "new-secret-value"
  }'
```

### Delete Secret

```bash
curl -X DELETE "http://localhost:8080/api/v3/secrets/raw/<secret-name>?workspaceId=<project-id>&environment=production" \
  -H "Authorization: Bearer <access-token>"
```

---

## Conclusion

Infisical provides a robust, open-source solution for managing secrets in Docker Compose environments. For Project Nyra's architecture:

**Recommended Approach:**
1. **Self-host Infisical** using Docker Compose with managed PostgreSQL and Redis
2. **Use Agent Sidecar Pattern** for MCP servers and critical services (real-time updates)
3. **Use Machine Identity + CLI** for frontend and worker services (simpler setup)
4. **Implement Infisical MCP Server** for AI agent secret management
5. **Enable secret rotation** and audit logging for production

This hybrid approach balances security, performance, and operational simplicity while maintaining the flexibility to adapt as requirements evolve.

---

**Document Version:** 1.0
**Last Updated:** 2026-01-15
**Author:** Research Agent (Claude Code)
**Status:** Complete
