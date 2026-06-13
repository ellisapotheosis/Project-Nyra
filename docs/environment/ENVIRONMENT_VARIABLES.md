# Environment Variables Documentation

Complete reference for all environment variables used across Project Nyra services.

**Last Updated:** 2026-01-13

## Table of Contents

- [Quick Start](#quick-start)
- [Secrets Management](#secrets-management)
- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Variable Reference](#variable-reference)
- [Security Best Practices](#security-best-practices)
- [Validation](#validation)

---

## Quick Start

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Generate Required Secrets

```bash
# Generate all secrets at once
for i in {1..15}; do openssl rand -hex 32; done
```

### 3. Fill in API Keys

- **Anthropic**: https://console.anthropic.com
- **Google Gemini**: https://aistudio.google.com/apikey
- **Twilio**: https://console.twilio.com
- **GitHub**: https://github.com/settings/tokens

### 4. Validate Configuration

```bash
./scripts/validate-env.sh
```

---

## Secrets Management

Project Nyra supports two modes of secrets management:

### Local Development (.env files)

- Store secrets in `.env` file at repo root
- Never commit `.env` files to git
- Use `.env.example` as template

### Production (Infisical)

For production deployments across multiple PCs, use Infisical:

```bash
# Install Infisical CLI
npm install -g @infisical/cli

# Login and fetch secrets
infisical login
infisical run -- docker-compose up -d
```

**Required Infisical Variables:**

- `INFISICAL_TOKEN` - Authentication token
- `INFISICAL_PROJECT_ID` - Your project ID
- `INFISICAL_ENVIRONMENT` - development/staging/production

---

## Required Variables

These variables **MUST** be set for the system to function:

### Core API Keys

| Variable              | Where to Get                                                     | Description                             |
| --------------------- | ---------------------------------------------------------------- | --------------------------------------- |
| `ANTHROPIC_API_KEY`   | [console.anthropic.com](https://console.anthropic.com)           | Claude API for complex reasoning        |
| `GOOGLE_API_KEY`      | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | Gemini API for cost-efficient tasks     |
| `TWILIO_ACCOUNT_SID`  | [console.twilio.com](https://console.twilio.com)                 | SMS/Voice communication                 |
| `TWILIO_AUTH_TOKEN`   | [console.twilio.com](https://console.twilio.com)                 | Twilio authentication                   |
| `TWILIO_PHONE_NUMBER` | [console.twilio.com](https://console.twilio.com)                 | Your Twilio phone number (+15551234567) |

### Database Secrets

| Variable            | How to Generate        | Description                |
| ------------------- | ---------------------- | -------------------------- |
| `POSTGRES_PASSWORD` | `openssl rand -hex 32` | PostgreSQL master password |
| `REDIS_PASSWORD`    | `openssl rand -hex 32` | Redis authentication       |
| `FALKORDB_PASSWORD` | `openssl rand -hex 32` | FalkorDB graph database    |

### Service Secrets

| Variable                  | How to Generate        | Service                   |
| ------------------------- | ---------------------- | ------------------------- |
| `NEXUS_JWT_SECRET`        | `openssl rand -hex 32` | Nexus Router              |
| `NEXUS_ADMIN_TOKEN`       | `openssl rand -hex 32` | Nexus Router admin access |
| `LITELLM_MASTER_KEY`      | `openssl rand -hex 32` | LiteLLM proxy             |
| `N8N_BASIC_AUTH_PASSWORD` | Strong password        | n8n workflow automation   |
| `N8N_ENCRYPTION_KEY`      | `openssl rand -hex 32` | n8n data encryption       |
| `DIFY_SECRET_KEY`         | `openssl rand -hex 32` | Dify AI platform          |
| `DIFY_ENCRYPTION_KEY`     | `openssl rand -hex 32` | Dify data encryption      |
| `LETTA_API_KEY`           | `openssl rand -hex 32` | Letta memory server       |
| `LETTA_SERVER_PASS`       | Strong password        | Letta admin access        |
| `GRAFANA_ADMIN_PASSWORD`  | Strong password        | Grafana monitoring        |

### TwentyCRM Secrets

| Variable                      | How to Generate        |
| ----------------------------- | ---------------------- |
| `TWENTY_ACCESS_TOKEN_SECRET`  | `openssl rand -hex 32` |
| `TWENTY_LOGIN_TOKEN_SECRET`   | `openssl rand -hex 32` |
| `TWENTY_REFRESH_TOKEN_SECRET` | `openssl rand -hex 32` |
| `TWENTY_FILE_TOKEN_SECRET`    | `openssl rand -hex 32` |

### Activepieces Secrets

| Variable               | How to Generate        |
| ---------------------- | ---------------------- |
| `ACTIVEPIECES_API_KEY` | `openssl rand -hex 32` |
| `AP_ENCRYPTION_KEY`    | `openssl rand -hex 32` |
| `AP_JWT_SECRET`        | `openssl rand -hex 32` |

### Email Configuration

| Variable          | Description           | Example                    |
| ----------------- | --------------------- | -------------------------- |
| `SMTP_USER`       | Your email address    | `noreply@ratehunter.com`   |
| `SMTP_PASSWORD`   | App-specific password | Generate in Gmail settings |
| `SMTP_FROM_EMAIL` | From address          | `noreply@ratehunter.com`   |

---

## Optional Variables

### LLM Providers

- `OPENROUTER_API_KEY` - Alternative/fallback LLM provider
- `CONTEXT7_API_KEY` - Enhanced context management

### Memory Services

- `letta_API_KEY` - letta cloud mode (use local FalkorDB if not set)
- `MEM0_API_KEY` - Mem0 cloud mode (use local if not set)

### Integrations

- `GITHUB_TOKEN` - GitHub operations (personal access token)
- `BITWARDEN_CLIENT_ID` - Bitwarden secrets vault
- `BITWARDEN_CLIENT_SECRET` - Bitwarden authentication
- `BITWARDEN_PASSWORD` - Bitwarden master password

### Multi-PC Setup

- `CLOUDFLARED_TUNNEL_TOKEN` - Secure networking between PCs
- `CLOUDFLARED_TUNNEL_NAME` - Tunnel identifier

---

## Variable Reference

### Database Configuration

#### PostgreSQL

```bash
POSTGRES_USER=postgres              # Database superuser
POSTGRES_PASSWORD=<secret>          # Master password
POSTGRES_PORT=5432                  # Port (default: 5432)
```

**Databases Created:**

- `dify` - AI application platform
- `twenty` - CRM system
- `letta` - Memory server
- `n8n` - Workflow automation
- `litellm` - LLM proxy
- `nyra` - Business services
- `activepieces` - Low-code automation

#### Redis

```bash
REDIS_PASSWORD=<secret>             # Authentication password
REDIS_PORT=6380                     # Port (6380 to avoid FalkorDB conflict)
```

**Used By:**

- Dify (caching)
- n8n (queue management)
- Activepieces (job queue)
- TwentyCRM (session store)

#### FalkorDB (Graph Database)

```bash
FALKORDB_PASSWORD=<secret>          # Authentication password
```

**Used By:**

- letta MCP (relationship tracking)
- Temporal knowledge graphs

---

### LLM Configuration

#### Nexus Router (Unified Gateway)

```bash
NEXUS_ROUTER_PORT=7000              # HTTP port
NEXUS_URL=http://localhost:7000     # Base URL
NEXUS_JWT_SECRET=<secret>           # JWT signing key
NEXUS_ADMIN_TOKEN=<secret>          # Admin API token
```

**Features:**

- Unified MCP server aggregation
- Intelligent LLM routing
- Cost optimization
- Fuzzy tool matching

#### LiteLLM (Legacy)

```bash
PORT_LITELLM=4000                   # HTTP port
LITELLM_MASTER_KEY=<secret>         # Master API key
```

_Note: Being replaced by Nexus Router_

---

### Business Services

#### Quote Engine

```bash
QUOTE_ENGINE_PORT=8001              # HTTP port
QUOTE_ENGINE_URL=http://localhost:8001
QUOTE_ENGINE_HOST=0.0.0.0           # Bind address
LOG_LEVEL=INFO                      # Logging level
```

**Endpoints:**

- `POST /quote` - Generate mortgage quote
- `GET /rates` - Current rate tables
- `GET /health` - Health check

#### Campaign Engine

```bash
CAMPAIGN_ENGINE_PORT=8002           # HTTP port
CAMPAIGN_ENGINE_URL=http://localhost:8002
CAMPAIGN_ENGINE_HOST=0.0.0.0
```

**Features:**

- 45-day drip campaigns
- Multi-channel messaging (SMS, email, voice)
- Twilio integration

#### Nyra Orchestrator

```bash
NYRA_ORCHESTRATOR_PORT=8003         # HTTP port
ORCHESTRATOR_URL=http://localhost:8010
NYRA_ORCHESTRATOR_HOST=0.0.0.0
```

**Features:**

- Compliance validation (RESPA, TILA, TCPA)
- Workflow coordination
- Human escalation

---

### Communication Services

#### Twilio (SMS/Voice)

```bash
TWILIO_ACCOUNT_SID=ACxxxxx          # Account SID
TWILIO_AUTH_TOKEN=<secret>          # Auth token
TWILIO_PHONE_NUMBER=+15551234567    # Your Twilio number
```

**Capabilities:**

- SMS messaging
- Voice calls (automated)
- Message delivery status tracking

#### Email (SMTP)

```bash
SMTP_HOST=smtp.gmail.com            # SMTP server
SMTP_PORT=587                       # Port (587 for TLS)
SMTP_USER=<email>                   # Email address
SMTP_PASSWORD=<app-password>        # App-specific password
SMTP_FROM_EMAIL=<email>             # From address
SMTP_FROM_NAME=RateHunter Team      # Display name
```

---

### Workflow Automation

#### n8n

```bash
PORT_N8N=5678                       # HTTP port
N8N_URL=http://localhost:5678       # Base URL
N8N_BASIC_AUTH_USER=admin           # Admin username
N8N_BASIC_AUTH_PASSWORD=<password>  # Admin password
N8N_ENCRYPTION_KEY=<secret>         # Data encryption
N8N_HOST=localhost                  # Hostname
```

**Use Cases:**

- Mortgage drip campaigns
- Lead nurturing workflows
- Automated follow-ups
- Rate alert notifications

#### Activepieces

```bash
PORT_ACTIVEPIECES=3002              # HTTP port
ACTIVEPIECES_API_KEY=<secret>       # API key
AP_ENCRYPTION_KEY=<secret>          # Encryption key
AP_JWT_SECRET=<secret>              # JWT signing
```

---

### Memory Systems

#### Letta (Stateful Memory)

```bash
PORT_LETTA=8283                     # HTTP port
LETTA_URL=http://localhost:8283     # Base URL
LETTA_API_KEY=<secret>              # API authentication
LETTA_SERVER_PASS=<password>        # Admin password
```

**Features:**

- Long-term conversational memory
- Multi-session context
- PostgreSQL persistence

#### letta MCP (Graph Memory)

```bash
letta_API_KEY=<secret>                    # Optional - cloud mode
letta_TEMPORAL_TRACKING=true              # Track time-based relationships
letta_RELATIONSHIP_INFERENCE=true         # Infer implicit relationships
```

**Features:**

- Temporal knowledge graphs
- Relationship tracking
- FalkorDB backend

#### Mem0 (Vector Memory)

```bash
MEM0_API_KEY=<secret>                        # Optional - cloud mode
MEM0_PORT=8081                               # HTTP port
MEM0_URL=http://localhost:4321               # Base URL
MEM0_DEFAULT_USER_ID=default                 # Default user
MEM0_BASE_URL=https://api.mem0.ai            # Cloud API
```

**Features:**

- Episodic memory
- Vector-based retrieval
- Qdrant backend

---

### MCP Servers

All MCP servers are registered with Nexus Router:

| Server       | Port | Description             |
| ------------ | ---- | ----------------------- |
| VSCode       | 8081 | Code editing operations |
| TwentyCRM    | 8082 | CRM operations          |
| Dify         | 8083 | Dify workflow proxy     |
| Filesystem   | 8084 | File system access      |
| GitHub       | 8085 | GitHub integration      |
| Brave Search | 8086 | Web search              |
| Bitwarden    | 8087 | Secrets management      |
| GitLab       | 8088 | GitLab integration      |
| Google Maps  | 8089 | Location services       |
| Sentry       | 8090 | Error tracking          |
| Slack        | 8091 | Slack integration       |
| Postgres     | 8092 | Database queries        |

**Configuration:**

```bash
MCP_VSCODE_PORT=8081
MCP_TWENTYCRM_PORT=8082
MCP_DIFY_PORT=8083
# ... etc
```

---

### Monitoring

#### Prometheus

```bash
PROMETHEUS_PORT=9090                # HTTP port
PROMETHEUS_RETENTION=15d            # Data retention period
```

**Metrics Collected:**

- Service health
- Request latency
- Error rates
- Resource usage

#### Grafana

```bash
GRAFANA_PORT=3000                   # HTTP port
GRAFANA_ADMIN_USER=admin            # Admin username
GRAFANA_ADMIN_PASSWORD=<password>   # Admin password
```

**Dashboards:**

- System overview
- Service health
- LLM usage and costs
- Campaign performance

---

## Security Best Practices

### 1. Secret Generation

**Always use cryptographically secure random values:**

```bash
# Good - Cryptographically secure
openssl rand -hex 32

# Bad - Predictable
echo "mysecret123"
```

### 2. Password Requirements

- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- No dictionary words
- No reuse across services

### 3. API Key Storage

- **Development:** Store in local `.env` file
- **Production:** Use Infisical secrets management
- **Never:** Commit to git, share in plaintext, hardcode

### 4. Access Control

- Use unique credentials per service
- Rotate secrets every 90 days
- Audit access logs regularly
- Use least-privilege principle

### 5. Network Security

- Use Cloudflared tunnels for inter-PC communication
- Enable HTTPS in production
- Restrict database access to internal network
- Use firewall rules to limit exposed ports

### 6. Monitoring

- Enable audit logging (via PostgreSQL audit tables)
- Monitor for unusual API usage
- Track failed authentication attempts
- Alert on compliance violations

---

## Validation

### Manual Validation

Run the validation script:

```bash
./scripts/validate-env.sh
```

**Checks:**

- All required variables are set
- Secret strength (minimum length)
- Format validation (URLs, emails, phone numbers)
- Port conflicts

### Docker Compose Validation

```bash
# Check configuration syntax
docker-compose -f infra/docker-compose.dev.yml config

# Validate environment variable substitution
docker-compose -f infra/docker-compose.dev.yml config --resolve-image-digests
```

### Service-Specific Health Checks

```bash
# PostgreSQL
psql -U postgres -h localhost -p 5432 -c "SELECT version();"

# Redis
redis-cli -p 6380 -a "$REDIS_PASSWORD" ping

# FalkorDB
redis-cli -p 6379 -a "$FALKORDB_PASSWORD" ping

# Quote Engine
curl http://localhost:8001/health

# Nexus Router
curl http://localhost:7000/health
```

---

## Troubleshooting

### Common Issues

#### 1. Missing Required Variables

**Error:**

```
ERROR: Missing required environment variable: ANTHROPIC_API_KEY
```

**Fix:**

```bash
# Add to .env file
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```

#### 2. Port Conflicts

**Error:**

```
ERROR: Port 6379 is already in use
```

**Fix:**

```bash
# Change port in .env
REDIS_PORT=6380
```

#### 3. Database Connection Failed

**Error:**

```
ERROR: Could not connect to PostgreSQL
```

**Fix:**

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check password is correct
psql -U postgres -h localhost -p 5432
```

#### 4. Invalid Secret Format

**Error:**

```
ERROR: NEXUS_JWT_SECRET must be at least 32 characters
```

**Fix:**

```bash
# Generate new secret
openssl rand -hex 32
```

---

## Environment Variable Checklist

Use this checklist when setting up a new environment:

### Core Infrastructure

- [ ] `POSTGRES_PASSWORD` - Generated (32+ chars)
- [ ] `REDIS_PASSWORD` - Generated (32+ chars)
- [ ] `FALKORDB_PASSWORD` - Generated (32+ chars)

### LLM API Keys

- [ ] `ANTHROPIC_API_KEY` - Obtained from console
- [ ] `GOOGLE_API_KEY` - Obtained from AI Studio

### Nexus Router

- [ ] `NEXUS_JWT_SECRET` - Generated (32+ chars)
- [ ] `NEXUS_ADMIN_TOKEN` - Generated (32+ chars)

### n8n Workflow

- [ ] `N8N_BASIC_AUTH_PASSWORD` - Strong password
- [ ] `N8N_ENCRYPTION_KEY` - Generated (32+ chars)

### Dify Platform

- [ ] `DIFY_SECRET_KEY` - Generated (32+ chars)
- [ ] `DIFY_ENCRYPTION_KEY` - Generated (32+ chars)

### TwentyCRM

- [ ] `TWENTY_ACCESS_TOKEN_SECRET` - Generated
- [ ] `TWENTY_LOGIN_TOKEN_SECRET` - Generated
- [ ] `TWENTY_REFRESH_TOKEN_SECRET` - Generated
- [ ] `TWENTY_FILE_TOKEN_SECRET` - Generated

### Letta Memory

- [ ] `LETTA_API_KEY` - Generated (32+ chars)
- [ ] `LETTA_SERVER_PASS` - Strong password

### Twilio Communication

- [ ] `TWILIO_ACCOUNT_SID` - From console
- [ ] `TWILIO_AUTH_TOKEN` - From console
- [ ] `TWILIO_PHONE_NUMBER` - Purchased number

### Email Service

- [ ] `SMTP_USER` - Email address
- [ ] `SMTP_PASSWORD` - App password
- [ ] `SMTP_FROM_EMAIL` - From address

### Monitoring

- [ ] `GRAFANA_ADMIN_PASSWORD` - Strong password

### Production Only

- [ ] `INFISICAL_TOKEN` - From Infisical
- [ ] `INFISICAL_PROJECT_ID` - From Infisical
- [ ] `CLOUDFLARED_TUNNEL_TOKEN` - From Cloudflare

---

## Related Documentation

- [BOOTSTRAP-WORKFLOW.md](BOOTSTRAP-WORKFLOW.md) - Multi-week setup guide
- [FINAL_ARCHITECTURE_DECISIONS_SOURCE.md](docs/FINAL_ARCHITECTURE_DECISIONS_SOURCE.md) - System architecture
- [infra/database/README.md](infra/database/README.md) - Database schemas
- [infra/nexus/README.md](infra/nexus/README.md) - Nexus Router configuration

---

## Support

For questions or issues with environment configuration:

1. Check this documentation first
2. Run `./scripts/validate-env.sh`
3. Review service logs: `docker-compose logs <service-name>`
4. Check GitHub issues: https://github.com/mhenry3164/Project-Nyra/issues
