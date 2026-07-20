# Environment Configuration Master Guide

This guide provides comprehensive instructions for setting up environment variables across the Project-Nyra distributed AI infrastructure.

## 📁 Directory Structure

### Environment File Backups

All `.env` files and templates have been backed up to `docs/configuration/env-backups/`:

```
docs/configuration/env-backups/
├── root/                    # 19 .env files from project root
│   ├── .env                # Active environment (DO NOT COMMIT with secrets)
│   ├── .env.example       # Template with placeholder values
│   ├── .env.template      # Base template
│   ├── .env.master        # Master configuration template
│   ├── .env.development   # Development environment
│   ├── .env.production    # Production environment
│   ├── .env.orchestrator  # Orchestrator PC configuration
│   ├── .env.worker-3060   # RTX 3060 worker configuration
│   ├── .env.worker-5090   # RTX 5090 worker configuration
│   ├── .env.worker-3090ti # RTX 3090 Ti worker configuration
│   └── ... (15 more files)
└── infra/                   # 15 .env files from infra folder
    ├── .env                # Infra environment configuration
    ├── .env.example       # Infra template
    ├── bitwarden-mcp/
    │   └── .env.example   # Bitwarden MCP configuration
    ├── docker/
    │   ├── .env           # Docker environment
    │   └── .env.mcp.template  # MCP service template
    ├── machines/
    │   ├── .env.machine   # Machine-specific variables
    │   └── .env.shared.template  # Shared variables template
    └── ... (11 more files)
```

### Infisical Secrets Management

Complete Infisical integration documentation and scripts:

```
docs/configuration/infisical-secrets-management/
├── README.md                  # Main Infisical setup guide
├── PATHS.md                   # Infisical path structure documentation
├── machines/
│   ├── README.md             # Machine-specific configuration guide
│   ├── orchestrator-mini.env # PC1 configuration
│   ├── worker-rtx3060.env    # PC2 configuration (with actual values)
│   ├── worker-rtx5090.env    # PC3 configuration (placeholders)
│   ├── worker-rtx3090ti.env  # PC4 configuration (placeholders)
│   ├── upload-machines-to-infisical.ps1  # Upload script
│   └── generate-combined-env.ps1          # Download & merge script
├── migration/
│   ├── README.md             # Migration guide
│   ├── QUICK-START.md        # Quick start instructions
│   ├── MIGRATION-REPORT.md   # Migration analysis
│   ├── create-folders.ps1    # Create Infisical folder structure
│   └── migrate-secrets.ps1   # Migrate secrets to Infisical
├── scripts/
│   └── bulk-import-tree.ps1  # Bulk import utility
└── envtree/                  # Example environment tree structure
    └── dev/
        ├── shared/
        ├── machines/
        ├── databases/
        └── ...
```

## 🎯 Quick Start

### 1. Choose Your Environment Setup Method

You have three options for managing environment variables:

#### Option A: Local .env Files (Development)
Best for: Local development, testing, quick iteration

1. Copy the template:
   ```bash
   cp docs/configuration/env-backups/root/.env.example .env
   ```

2. Fill in your values:
   ```bash
   nano .env  # or your preferred editor
   ```

3. Never commit `.env` with real secrets!

#### Option B: Infisical Secrets Management (Recommended)
Best for: Team collaboration, distributed deployment, production

1. Follow the [Infisical Setup Guide](./infisical-secrets-management/README.md)

2. Upload secrets:
   ```powershell
   cd docs/configuration/infisical-secrets-management/machines
   .\upload-machines-to-infisical.ps1 -Verbose
   ```

3. Generate combined .env files:
   ```powershell
   .\generate-combined-env.ps1 -OutputToFiles
   ```

4. Deploy to each PC:
   ```bash
   # Copy generated file to project root
   cp combined/orchestrator-mini.env $PROJECT_ROOT/.env
   ```

#### Option C: Hybrid Approach
Best for: Mixing local overrides with team secrets

1. Set up Infisical for shared secrets (API keys, databases)
2. Use local `.env.local` for machine-specific overrides
3. Merge with: `infisical export --path=/shared > .env && cat .env.local >> .env`

### 2. Configure Your Machine Type

Select the configuration matching your role:

#### Orchestrator (PC1)
```bash
cp docs/configuration/env-backups/root/.env.orchestrator .env
```

**Key Variables**:
- `MACHINE_ROLE=orchestrator`
- `NEXUS_ROUTER_BIND=0.0.0.0:7000`
- `POSTGRES_BIND=0.0.0.0:5432`
- `REDIS_BIND=0.0.0.0:6379`
- All database passwords and API keys

#### Worker - RTX 3060 (PC2)
```bash
cp docs/configuration/env-backups/root/.env.worker-3060 .env
```

**Key Variables**:
- `MACHINE_ROLE=worker-rtx3060`
- `MACHINE_GPU_TYPE=rtx_3060`
- `OLLAMA_MODELS=codellama:34b,qwen2.5:32b,gemma2:27b`
- `WORKER_3060_SPECIALIZATION=code`

#### Worker - RTX 5090 (PC3)
```bash
cp docs/configuration/env-backups/root/.env.worker-5090 .env
```

**Key Variables**:
- `MACHINE_ROLE=worker-rtx5090`
- `MACHINE_GPU_TYPE=rtx_5090`
- `OLLAMA_MODELS=deepseek-r1:236b,qwen2.5:72b`
- `WORKER_5090_SPECIALIZATION=reasoning`

#### Worker - RTX 3090 Ti (PC4)
```bash
cp docs/configuration/env-backups/root/.env.worker-3090ti .env
```

**Key Variables**:
- `MACHINE_ROLE=worker-rtx3090ti`
- `MACHINE_GPU_TYPE=rtx_3090ti`
- `OLLAMA_MODELS=llama3.1:70b,mistral-large:123b`
- `WORKER_3090_SPECIALIZATION=analysis`

## 📋 Environment Variable Categories

### Shared Variables (in `/shared` path)

Located in: `docs/configuration/infisical-secrets-management/envtree/dev/shared/`

**API Keys & Authentication**:
- `ANTHROPIC_API_KEY` - Claude API access
- `OPENAI_API_KEY` - OpenAI API access
- `GOOGLE_API_KEY` - Google services
- `GITHUB_TOKEN` - GitHub API access
- `JWT_SECRET` - Authentication token secret
- `CLERK_SECRET_KEY` - Clerk authentication

**Database Credentials**:
- `POSTGRES_PASSWORD` - PostgreSQL password
- `POSTGRES_USER` - Database user
- `POSTGRES_DB` - Database name
- `REDIS_PASSWORD` - Redis password

**External Services**:
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` - Supabase backend
- `STRIPE_SECRET_KEY` - Payment processing
- `CLOUDFLARE_API_TOKEN` - CDN and DNS
- `N8N_API_KEY` - Workflow automation

### Machine-Specific Variables (in `/hosts/<hostname>`)

Located in: `docs/configuration/infisical-secrets-management/machines/`

**Identity & Hardware**:
- `MACHINE_HOSTNAME` - PC hostname
- `MACHINE_ROLE` - orchestrator/worker-rtx3060/worker-rtx5090/worker-rtx3090ti
- `MACHINE_CPU`, `MACHINE_RAM_GB` - Hardware specs
- `MACHINE_GPU_TYPE`, `MACHINE_GPU_VRAM_GB` - GPU configuration

**Networking**:
- `MACHINE_IP_ETHERNET`, `MACHINE_IP_WIFI` - Local IPs
- `MACHINE_IP_TAILSCALE` - Tailscale VPN IP
- `MACHINE_MAC_ETHERNET`, `MACHINE_MAC_WIFI` - MAC addresses
- `TAILSCALE_HOSTNAME`, `TAILSCALE_FQDN` - Tailscale identifiers

**Services & Ports**:
- `OLLAMA_HOST`, `OLLAMA_PORT` - LLM inference service
- `VLLM_ENABLED`, `VLLM_PORT` - vLLM production inference
- `NEXUS_ROUTER_URL` - Router gateway
- `ORCHESTRATOR_URL` - Coordination service

**GPU Configuration**:
- `OLLAMA_MODELS` - Models to load on this GPU
- `OLLAMA_GPU_LAYERS` - Layers to offload to GPU
- `OLLAMA_NUM_PARALLEL` - Concurrent inference requests
- `NVIDIA_VISIBLE_DEVICES` - GPU visibility

**Monitoring**:
- `PROMETHEUS_NODE_EXPORTER_PORT` - System metrics
- `NVIDIA_DCGM_EXPORTER_PORT` - GPU metrics
- `WORKER_*_DEV_UI_PORT` - Development dashboard

## 🔐 Security Best Practices

### DO NOT Commit

**Never commit these files with real secrets**:
- `.env` (active environment)
- `.env.local` (local overrides)
- `.env.production` (with real credentials)
- Any file with actual API keys or passwords

### Safe to Commit

These files are safe to commit:
- `.env.example` (template with placeholders)
- `.env.template` (base template)
- `.env.*.example` (any file ending in .example)
- Documentation in `docs/configuration/`

### Rotation Schedule

Rotate secrets regularly:
- **Critical** (API keys, DB passwords): Every 90 days
- **High** (Service tokens, JWTs): Every 180 days
- **Medium** (Webhook secrets, internal tokens): Annually
- **Low** (Development keys): As needed

### Access Control

Use Infisical for team access control:
- Orchestrator secrets: Admin only
- Worker secrets: Limited to machine owners
- Shared secrets: Team members by role
- Development secrets: All developers

## 🚀 Deployment Workflows

### Development Environment

1. **Local Development**:
   ```bash
   # Use local .env with development values
   cp docs/configuration/env-backups/root/.env.development .env

   # Start services
   docker-compose -f infra/docker-compose.dev.yml up -d
   ```

2. **With Infisical Sync**:
   ```bash
   # Pull latest from Infisical /shared + /hosts/orchestrator
   cd docs/configuration/infisical-secrets-management/machines
   ./generate-combined-env.ps1 -MachineRole "orchestrator-mini"

   # Start services
   docker-compose up -d
   ```

### Production Deployment

1. **Orchestrator (PC1)**:
   ```bash
   # Generate production config
   cd /c/Dev/Projects/Repos/Project-Nyra
   cd docs/configuration/infisical-secrets-management/machines
   ./generate-combined-env.ps1 -MachineRole "orchestrator-mini" -OutputToFiles

   # Deploy
   cp combined/orchestrator-mini.env $PROJECT_ROOT/.env
   cd $PROJECT_ROOT
   docker-compose -f infra/cluster-setup/docker-compose.orchestrator.yml up -d
   ```

2. **Workers (PC2, PC3, PC4)**:
   ```bash
   # For each worker
   cd docs/configuration/infisical-secrets-management/machines
   ./generate-combined-env.ps1 -MachineRole "worker-rtx3060" -OutputToFiles

   # Deploy to PC2
   cp combined/worker-rtx3060.env $PROJECT_ROOT/.env
   docker-compose -f infra/cluster-setup/docker-compose.worker.yml up -d
   ```

3. **Verify Cluster Health**:
   ```bash
   # Check all services
   npm run health:check

   # Verify network connectivity
   tailscale status

   # Check GPU workers
   curl http://100.83.23.49:11434/api/tags  # PC2
   curl http://worker-5090.tail558973.ts.net:11434/api/tags  # PC3
   ```

## 📖 Related Documentation

### Primary Guides
- **[Infisical Secrets Management](./infisical-secrets-management/README.md)** - Complete Infisical setup
- **[Machine Configuration Guide](./infisical-secrets-management/machines/README.md)** - Per-machine .env setup
- **[Migration Guide](./infisical-secrets-management/migration/README.md)** - Migrate existing secrets

### Reference Locations
- **Root .env Backups**: `docs/configuration/env-backups/root/`
- **Infra .env Backups**: `docs/configuration/env-backups/infra/`
- **Active .env Files**: Project root and `infra/` subdirectories
- **Infisical Integration**: `docs/configuration/infisical-secrets-management/`

### Setup Scripts
- **Environment Variables Setup**: `scripts/set-env-vars.ps1`
- **Backup .env Files**: `scripts/backup-env-files.ps1`
- **Upload to Infisical**: `docs/configuration/infisical-secrets-management/machines/upload-machines-to-infisical.ps1`
- **Generate Combined**: `docs/configuration/infisical-secrets-management/machines/generate-combined-env.ps1`

## 🐛 Troubleshooting

### Issue: Missing Environment Variables

**Symptom**: Services fail to start with "Environment variable not set" errors

**Solutions**:
1. Check `.env` file exists in project root:
   ```bash
   ls -la .env
   ```

2. Verify all required variables are set:
   ```bash
   grep "API_KEY" .env
   ```

3. Regenerate from Infisical:
   ```bash
   cd docs/configuration/infisical-secrets-management/machines
   ./generate-combined-env.ps1 -MachineRole "your-role" -OutputToFiles
   ```

### Issue: Infisical Access Denied

**Symptom**: "Invalid token" or "Access denied" when running Infisical CLI

**Solutions**:
1. Check token is set:
   ```bash
   echo $INFISICAL_ACCESS_TOKEN
   ```

2. Re-export from Infisical /shared:
   ```bash
   infisical export --path="/shared" --format=dotenv-export | Invoke-Expression
   ```

3. Verify project ID and environment:
   ```bash
   infisical secrets list --path="/shared" --env=dev
   ```

### Issue: Machine-Specific Values Missing

**Symptom**: Placeholder values like `TO_BE_COLLECTED` in generated .env

**Solutions**:
1. Run PC info collector on that machine:
   ```powershell
   cd infra/machines
   ./PC-INFO-COLLECTOR.ps1
   ```

2. Update machine-specific .env file with actual values

3. Re-upload to Infisical:
   ```powershell
   cd docs/configuration/infisical-secrets-management/machines
   ./upload-machines-to-infisical.ps1 -Verbose
   ```

### Issue: Docker Services Can't Read .env

**Symptom**: Docker compose starts but containers have empty environment variables

**Solutions**:
1. Ensure `.env` is in the same directory as `docker-compose.yml`:
   ```bash
   cd /path/to/docker-compose.yml
   ls .env
   ```

2. Check file encoding (should be UTF-8):
   ```bash
   file .env
   ```

3. Test environment loading:
   ```bash
   docker-compose config | grep API_KEY
   ```

## 🔄 Update Procedures

### Adding New Variables

1. **Add to master template**:
   ```bash
   # Edit template
   nano docs/configuration/env-backups/root/.env.example
   ```

2. **Categorize appropriately**:
   - Shared → Add to `/shared` in Infisical
   - Machine-specific → Add to `/hosts/<hostname>` in Infisical

3. **Update documentation**:
   - Add to this guide under appropriate category
   - Update machine-specific READMEs if needed

4. **Deploy to all machines**:
   ```bash
   # Upload to Infisical
   cd docs/configuration/infisical-secrets-management/machines
   ./upload-machines-to-infisical.ps1

   # Regenerate combined files
   ./generate-combined-env.ps1 -OutputToFiles
   ```

### Rotating Secrets

1. **Update in Infisical**:
   ```bash
   infisical secrets set "API_KEY_NAME" "new-secret-value" \
     --path="/shared" \
     --env="dev" \
     --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
   ```

2. **Regenerate all machine configs**:
   ```powershell
   cd docs/configuration/infisical-secrets-management/machines
   ./generate-combined-env.ps1 -OutputToFiles
   ```

3. **Deploy to each PC**:
   ```bash
   # Copy new .env
   cp combined/orchestrator-mini.env $PROJECT_ROOT/.env

   # Restart services
   docker-compose restart
   ```

4. **Verify services**:
   ```bash
   npm run health:check
   ```

## 📝 Checklist

### Initial Setup
- [ ] Choose environment management approach (local/.env, Infisical, or hybrid)
- [ ] Copy appropriate `.env` template for your machine role
- [ ] Fill in all required variables (no placeholders remain)
- [ ] Configure Volta and pnpm environment variables
- [ ] Test services start correctly with `docker-compose up`

### Infisical Setup (if using)
- [ ] Install Infisical CLI
- [ ] Set `INFISICAL_ACCESS_TOKEN` environment variable
- [ ] Upload shared secrets to `/shared` path
- [ ] Upload machine-specific configs to `/hosts/<hostname>`
- [ ] Test combined .env generation
- [ ] Deploy to each PC in cluster

### Security
- [ ] Never commit `.env` files with real secrets
- [ ] Rotate critical secrets every 90 days
- [ ] Configure Infisical access control by role
- [ ] Review `.gitignore` excludes all `.env` variants

### Distributed Cluster
- [ ] Connect all PCs to Tailscale mesh network
- [ ] Collect machine info (IPs, MACs, GPU specs) for each PC
- [ ] Update machine-specific .env files with actual values
- [ ] Verify network connectivity between PCs
- [ ] Test GPU workers respond on Ollama ports

---

**Last Updated**: 2026-01-22
**Maintained By**: Project-Nyra Infrastructure Team
**Related**: [Infisical Setup](./infisical-secrets-management/README.md) | [Machine Config](./infisical-secrets-management/machines/README.md)
