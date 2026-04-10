# Environment Variable Export Best Practices - Research Report

**Research Date:** 2026-01-16
**Researcher:** Claude (Research Agent)
**Topic:** Methods to export environment variable structures while hiding sensitive values

---

## Executive Summary

This research covers comprehensive best practices and tooling for exporting environment variable structures while masking sensitive values. Key findings include multiple export methods, modern secret management tools, template generation approaches, folder structure documentation, and multi-environment management strategies.

---

## 1. Export Methods with Hidden Values

### 1.1 Template Files (.env.example)

**Implementation:** Create `.env.example` with placeholder values or empty strings

**Example:**
```bash
POSTGRES_PASSWORD=
ANTHROPIC_API_KEY=
TWILIO_AUTH_TOKEN=
```

**Pros:**
- Simple and standard practice
- Version controlled
- Widely recognized pattern

**Cons:**
- Manual maintenance required
- Can drift out of sync with actual .env

**Best for:** Simple projects, small teams

---

### 1.2 Automated Template Generation

**Implementation:** Scripts that parse .env and generate sanitized templates

**Bash Example:**
```bash
grep -oP "^[A-Z_]+(?==)" .env | awk '{print $0"="}' > .env.example
```

**Node.js Example:**
```javascript
const fs = require('fs');
const dotenv = require('dotenv');
const keys = Object.keys(dotenv.parse(fs.readFileSync('.env')));
keys.forEach(k => console.log(`${k}=`));
```

**Pros:**
- Always in sync
- No manual work
- Consistent

**Cons:**
- Requires automation setup

**Best for:** Active development, larger teams

---

### 1.3 Masked Value Export

**Implementation:** Show structure with masked/placeholder values

**Strategies:**
- **First/Last N chars:** `POSTGRES_PASSWORD=abc***xyz`
- **Type hints:** `POSTGRES_PASSWORD=<32-char-hex>`
- **Generation method:** `JWT_SECRET=<openssl rand -hex 32>`
- **Source category:** `TWILIO_AUTH_TOKEN=<secret-from-twilio-console>`

**Example Script:**
```bash
env | sed -E 's/(=).+/\1<redacted>/'
```

**Pros:**
- Shows structure AND helpful hints
- Aids validation and setup
- Better developer experience

**Cons:**
- More complex to implement

**Best for:** Documentation, onboarding new developers

---

### 1.4 Secret Management Platform Export

**Implementation:** Export structure from dedicated secret management tools

**Commands:**
```bash
# Infisical
infisical secrets --export --format=dotenv-export

# HashiCorp Vault
vault kv get -format=json secret/myapp | jq -r 'to_entries|map("\(.key)=")[]'

# Doppler
doppler secrets download --format=env-no-values
```

**Pros:**
- Centralized management
- Audit trail
- Role-based access control
- Automated rotation

**Cons:**
- Requires infrastructure
- Learning curve

**Tools:** Infisical, HashiCorp Vault, Doppler, AWS Secrets Manager, Azure Key Vault, GCP Secret Manager

**Best for:** Production systems, compliance requirements

---

### 1.5 JSON Schema / Validation Schema

**Implementation:** Define structure as schema with types and constraints

**JSON Schema Example:**
```json
{
  "POSTGRES_PASSWORD": {
    "type": "string",
    "minLength": 16,
    "pattern": "^[a-f0-9]{32}$"
  },
  "ANTHROPIC_API_KEY": {
    "type": "string",
    "pattern": "^sk-ant-"
  }
}
```

**Zod Example:**
```typescript
import { z } from 'zod';

const envSchema = z.object({
  POSTGRES_PASSWORD: z.string().min(16),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-')
});
```

**Pros:**
- Type safety
- Runtime validation
- Self-documenting
- IDE autocomplete

**Cons:**
- Requires schema maintenance
- Language-specific

**Tools:** JSON Schema, Zod, Joi, Yup, Ajv

**Best for:** TypeScript/JavaScript projects, strong validation needs

---

### Recommended Multi-Layered Approach

1. **`.env.example`** - Basic structure (version controlled)
2. **Documentation file** - Detailed annotations with examples
3. **Validation schema** - Type safety and runtime checks (optional)

---

## 2. Tools for Secret Documentation

### 2.1 Secret Management Platforms

| Tool | Features | Integration | Pricing | Best For |
|------|----------|-------------|---------|----------|
| **Infisical** | Self-hosted, Multi-env, CLI, Git-sync, RBAC, Audit logs | `infisical secrets --env=production` | Open source + cloud | Startups, self-hosted |
| **HashiCorp Vault** | Enterprise-grade, Dynamic secrets, Encryption-as-a-service | `vault kv get secret/myapp` | Open source + enterprise | Large enterprises |
| **Doppler** | Cloud-native, Great UX, CLI, Integrations, Secret syncing | `doppler run -- node app.js` | Free tier + paid | Fast-moving teams |
| **AWS Secrets Manager** | AWS-native, Rotation, IAM integration, Encrypted | `aws secretsmanager get-secret-value` | Pay per secret | AWS infrastructure |
| **Azure Key Vault** | Azure-native, HSM-backed, Managed identities | `az keyvault secret show` | Pay per operation | Azure environments |
| **GCP Secret Manager** | GCP-native, Versioning, IAM, Audit logs | `gcloud secrets versions access` | Pay per secret | GCP infrastructure |

---

### 2.2 Documentation Tools

#### envdoc
- **Type:** CLI tool
- **Features:** Generates markdown from .env comments, Auto-updates docs
- **Usage:** `npm install -g envdoc && envdoc > ENVIRONMENT.md`
- **Link:** https://github.com/skevy/envdoc

#### dotenv-linter
- **Type:** Linter
- **Features:** Validates .env files, Checks for common mistakes, CI/CD integration
- **Usage:** `dotenv-linter .env*`
- **Link:** https://github.com/dotenv-linter/dotenv-linter

#### dotenv-vault
- **Type:** Encryption tool
- **Features:** Encrypt .env files, Decrypt at runtime, Version control safe
- **Usage:** `npx dotenv-vault encrypt`
- **Link:** https://www.dotenv.org/docs/security/env-vault

#### Markdown Tables
- **Type:** Documentation pattern
- **Features:** Human-readable, Version controlled, Easy to maintain
- **Example:**
  ```markdown
  | Variable | Type | Required | Description |
  |----------|------|----------|-------------|
  | API_KEY  | secret | Yes | API authentication |
  ```

---

### 2.3 Validation Tools

| Tool | Language | Features | Usage |
|------|----------|----------|-------|
| **envalid** | Node.js | Runtime validation, Type coercion, Defaults | `envalid.cleanEnv(process.env, { PORT: envalid.port() })` |
| **python-decouple** | Python | Type casting, Defaults, Config files | `from decouple import config; DB_HOST = config('DB_HOST')` |
| **direnv** | Shell | Auto-load .env per directory, Unload on exit | `echo "export API_KEY=..." > .envrc && direnv allow` |

---

## 3. Template Generation Approaches

### 3.1 Shell Script Generation

**Bash:**
```bash
#!/bin/bash
grep -v "^#" .env | grep -v "^$" | sed "s/=.*/=/" > .env.example
```

**PowerShell:**
```powershell
Get-Content .env |
  Where-Object { $_ -match "^[A-Z_]+=" } |
  ForEach-Object { ($_ -split "=")[0] + "=" } |
  Out-File .env.example
```

**Pros:** No dependencies, Fast, Cross-platform
**Cons:** Basic functionality only

---

### 3.2 Node.js Script with Comments

**Implementation:** Parse .env, preserve inline comments, generate annotated template

```javascript
const fs = require('fs');
const lines = fs.readFileSync('.env', 'utf8').split('\n');

const template = lines.map(line => {
  if (line.startsWith('#') || !line.includes('=')) return line;

  const [key, ...rest] = line.split('=');
  const comment = rest.join('=').match(/#.*/)?.[0] || '';

  return `${key}= ${comment}`;
}).join('\n');

fs.writeFileSync('.env.example', template);
```

**Features:** Preserves comments, Structure maintained, Easy to customize

---

### 3.3 Template with Type Annotations

**Example Output:**
```bash
# Database
POSTGRES_PASSWORD=  # Required: 32+ char hex string (openssl rand -hex 32)
REDIS_PASSWORD=     # Required: 32+ char hex string

# API Keys
ANTHROPIC_API_KEY=  # Required: sk-ant-... from console.anthropic.com
GOOGLE_API_KEY=     # Required: from aistudio.google.com/apikey
```

**Features:** Self-documenting, Validation guidance, Onboarding friendly

---

### 3.4 Interactive Template Generator

**Implementation:** CLI tool that prompts for values and generates .env

**Tools:** inquirer.js, prompts, questionnaire

**Workflow:**
1. Read .env.example
2. Prompt for each value with validation
3. Validate input
4. Generate .env
5. Optionally encrypt/store in vault

**Features:** User-friendly, Built-in validation, Reduces errors

---

### 3.5 CI/CD Template Validation

**GitHub Actions Example:**
```yaml
- name: Validate .env.example
  run: |
    npm run generate-env-template
    git diff --exit-code .env.example
```

**Features:** Automated checks, Prevents drift, Part of PR workflow

---

### Nyra Current Pattern Analysis

**Found in codebase:** `scripts/validate-env.sh` validates against hardcoded list

**Pros:**
- Comprehensive validation
- Type checking
- Format validation (email, phone, URL)

**Cons:**
- Manual maintenance
- Can drift from actual usage

**Recommendation:** Add automated template generation step that runs before validate-env.sh

---

## 4. Folder/Path Structure Documentation

### 4.1 Tree Command Output

**Commands:**
```bash
# Directories only, 3 levels deep
tree -L 3 -d > STRUCTURE.md

# Ignore patterns
tree -I "node_modules|.git" > STRUCTURE.md

# JSON format for programmatic use
tree -J > structure.json
```

**Example Output:**
```
.
├── config/
│   ├── infisical/
│   ├── archon-os/
│   └── metamcp/
├── logs/
└── secrets/
```

**Pros:** Standard tool, Visual, Easy to update
**Cons:** Requires tree command installation

---

### 4.2 Markdown Directory Listings

**Example:**
```markdown
## Directory Structure

- `config/` - Configuration files
  - `infisical/` - Infisical configs per PC
    - `orchestrator/` - Orchestrator PC configs
    - `worker-1/` - Worker 1 configs
  - `archon-os/` - Claude Flow configs
- `logs/` - Application logs
- `secrets/` - Mounted secrets (never committed)
```

**Features:** Annotated, Explanation included, Version controlled

---

### 4.3 JSON/YAML Structure Manifest

**Example:**
```json
{
  "config": {
    "description": "Configuration directory",
    "contains": ["infisical", "archon-os"],
    "required": true,
    "gitignore": false
  },
  "secrets": {
    "description": "Runtime secrets",
    "gitignore": true,
    "required": false,
    "mounted_at_runtime": true
  }
}
```

**Use cases:** Automated setup scripts, Validation, Documentation generation

---

### 4.4 Environment-Specific Path Variables

**Example Table:**

| Variable | Dev | Production | Description |
|----------|-----|------------|-------------|
| CONFIG_DIR | ./config | /app/config | Config files |
| SECRETS_DIR | ./secrets | /run/secrets | Mounted secrets |
| LOG_DIR | ./logs | /var/log/app | Application logs |

**Found in Nyra:** `setup-env-secrets.ps1` defines:
- `NYRA_PROJECT_ROOT`
- `NYRA_DATA_ROOT`
- `NYRA_CONFIG_ROOT`

---

### 4.5 Docker Volume Mapping Documentation

**Example:**
```yaml
volumes:
  # PC-specific config (read-only)
  - ./config/${NYRA_PC_ID}:/app/config:ro

  # Shared secrets (read-only)
  - infisical_secrets:/app/secrets:ro

  # Persistent logs
  - ./logs:/app/logs
```

**Found in Nyra:** `docker-compose.infisical.yml` extensively documents volume structure

---

### Best Practices

- Document mount points and their access modes (ro/rw)
- Explain volume lifecycle (ephemeral vs persistent)
- Note which paths are gitignored
- Include examples for each environment
- Document path construction logic (e.g., `config/${PC_ID}/${SERVICE}`)

---

## 5. Multi-Environment Secret Management

### 5.1 Environment-Scoped Secrets

**Structure:**
```
.env.development
.env.staging
.env.production
.env.local (gitignored, overrides)
```

**Tools:** dotenv, dotenv-flow, cross-env

**Pros:** Clear separation, Easy to reason about
**Cons:** Duplication, Sync challenges

---

### 5.2 Hierarchical Secret Resolution

**Order:**
1. `.env` (defaults)
2. `.env.{environment}`
3. `.env.{environment}.local`
4. Process environment variables

**Tool:** `dotenv-flow` automatically implements this pattern

**Pros:** DRY principle, Flexible overrides
**Cons:** Can be confusing

---

### 5.3 Per-PC + Per-Environment Matrix

**Structure:**
```
config/
  infisical/
    orchestrator/
      development.yml
      production.yml
    worker-1/
      development.yml
      production.yml
    worker-2/
      development.yml
      production.yml
```

**Found in Nyra:** `docker-compose.infisical.yml` uses `${NYRA_PC_ID}` and `${NYRA_ENVIRONMENT}`

**Pros:** Multi-dimensional organization, Scales to complex setups
**Cons:** More complex structure

---

### 5.4 Secret Management Platform

**Workflow:**
1. Store secrets in vault (Infisical/Vault/Doppler)
2. Configure access per environment
3. Inject at runtime via CLI or SDK
4. No .env files in production

**Example (Infisical):**
```bash
infisical run --env=production -- docker-compose up
```

**Found in Nyra:** Containers use `infisical run` command in docker-compose.infisical.yml

**Pros:** Audit logs, Rotation support, RBAC, Encryption at rest
**Cons:** Infrastructure dependency, Learning curve

---

### 5.5 Git-Crypt for Versioned Secrets

**Tools:** git-crypt, SOPS, Blackbox

**Workflow:**
1. Install git-crypt
2. Configure .gitattributes
3. Add GPG keys
4. Encrypt .env files
5. Commit encrypted files

**Pros:** Version controlled, Simple workflow, Git native
**Cons:** Key management complexity, Not for frequent changes

---

### 5.6 Cloud-Native Secret Management

| Cloud | Service | Integration | Features |
|-------|---------|-------------|----------|
| AWS | Secrets Manager + Parameter Store | IAM | Rotation, versioning, KMS encryption |
| Azure | Key Vault | Managed Identities | HSM-backed, access policies |
| GCP | Secret Manager | IAM | Versioning, audit logs |
| Kubernetes | Secrets + External Secrets Operator | RBAC | Native integration, external sync |

**Pros:** Native integration, IAM/RBAC, Auditing
**Cons:** Vendor lock-in, Cost

---

## Nyra Implementation Analysis

### Current Approach
**Hybrid:** Local .env for dev + Infisical for production + Docker secrets

### Strengths
- Infisical CLI integration for multi-PC setup
- Per-PC configuration via `${NYRA_PC_ID}`
- Docker shared volumes for secrets
- Comprehensive validation script (`validate-env.sh`)

### Recommendations
1. Add automated `.env.example` generation
2. Create interactive setup wizard
3. Add git pre-commit hook to validate secrets not committed
4. Document secret rotation procedures
5. Add monitoring for secret expiration
6. Implement Zod schema validation for TypeScript projects

---

## 6. Security Best Practices

### Critical Rules

1. **Never commit .env files to version control**
2. **Use .gitignore for all secret files**
3. **Rotate secrets regularly (90 days recommended)**
4. **Use strong secrets (32+ characters, cryptographically random)**
5. **Implement principle of least privilege**
6. **Enable audit logging for secret access**
7. **Encrypt secrets at rest and in transit**
8. **Use separate secrets per environment**
9. **Document secret ownership and rotation procedures**
10. **Implement secret scanning in CI/CD** (trufflehog, gitleaks)

---

### Secret Generation

**Recommended Commands:**
```bash
# 256-bit hex
openssl rand -hex 32

# Base64 encoded
openssl rand -base64 32

# UUID v4
uuidgen

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Python
python -c "import secrets; print(secrets.token_hex(32))"
```

**Avoid:**
- Dictionary words
- Predictable patterns
- Sequential characters
- Short secrets (<16 chars)

---

## 7. Tooling Recommendations

### Must-Have

| Tool | Purpose | Installation |
|------|---------|--------------|
| **dotenv** | Load .env files in development | `npm install dotenv` |
| **Infisical / dotenv-vault** | Production secret management | `npm install -g @infisical/cli` |
| **gitleaks / git-secrets** | Prevent committing secrets | `brew install gitleaks` |

---

### Recommended

| Tool | Purpose | Installation |
|------|---------|--------------|
| **envalid** | Runtime validation | `npm install envalid` |
| **dotenv-linter** | Lint .env files | `brew install dotenv-linter` |
| **direnv** | Auto-load env per directory | `brew install direnv` |

---

### Enterprise

| Tool | Purpose | Features |
|------|---------|----------|
| **HashiCorp Vault** | Enterprise secret management | Dynamic secrets, Encryption as a service, PKI |
| **CyberArk** | Privileged access management | Secret rotation, Session recording, Compliance |

---

## 8. Implementation Examples

### 8.1 Basic Export Script

**Filename:** `export-env-template.sh`

```bash
#!/bin/bash
set -euo pipefail

echo "# Generated .env template - $(date)" > .env.example
echo "# Copy to .env and fill in values" >> .env.example
echo "" >> .env.example

grep -v "^#" .env | grep -v "^$" | while IFS="=" read -r key value; do
  # Determine type hint based on key name
  if [[ $key =~ PASSWORD|SECRET|TOKEN|KEY ]]; then
    hint="<secret>"
  elif [[ $key =~ PORT ]]; then
    hint="<port-number>"
  elif [[ $key =~ URL|ENDPOINT ]]; then
    hint="<http://...>"
  else
    hint=""
  fi
  echo "${key}=${hint}" >> .env.example
done

echo "Generated .env.example successfully"
```

---

### 8.2 Validation Schema (TypeScript)

**Filename:** `env.schema.ts`

```typescript
import { z } from 'zod';

export const envSchema = z.object({
  // Database
  POSTGRES_PASSWORD: z.string().min(16),
  REDIS_PASSWORD: z.string().min(16),

  // API Keys
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  GOOGLE_API_KEY: z.string().min(20),

  // Nexus
  NEXUS_JWT_SECRET: z.string().length(64),
  NEXUS_ADMIN_TOKEN: z.string().min(32),

  // Email
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string().min(8),

  // Optional
  INFISICAL_TOKEN: z.string().optional(),
});

export const validateEnv = () => envSchema.parse(process.env);
```

---

### 8.3 GitHub Action

**Filename:** `.github/workflows/validate-env.yml`

```yaml
name: Validate Environment Template

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Generate template
        run: ./scripts/export-env-template.sh

      - name: Check if template is up to date
        run: |
          if ! git diff --exit-code .env.example; then
            echo "::error::.env.example is out of date"
            echo "Run: ./scripts/export-env-template.sh"
            exit 1
          fi

      - name: Scan for leaked secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
```

---

## 9. References

### Articles
- [12 Factor App - Config](https://12factor.net/config)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Google Secret Management Best Practices](https://cloud.google.com/secret-manager/docs/best-practices)

### Tools
- [Infisical Documentation](https://infisical.com/docs)
- [dotenv](https://github.com/motdotla/dotenv)
- [Doppler](https://docs.doppler.com/)
- [HashiCorp Vault](https://developer.hashicorp.com/vault/docs)

### Standards
- NIST SP 800-57 Key Management
- SOC 2 Type II Compliance
- PCI DSS Requirement 8 (Key Management)

---

## 10. Conclusions

### Recommended Stack for Nyra

1. **Keep current Infisical integration** for production
2. **Add automated .env.example generation** script
3. **Implement Zod schema validation** for type safety
4. **Add GitHub Action** to enforce template updates
5. **Create interactive setup wizard** for new developers
6. **Add git pre-commit hook** with gitleaks
7. **Document secret rotation procedures**
8. **Implement secret expiration monitoring**

---

### Key Takeaways

1. **Multi-layered approach works best:** Templates + docs + validation
2. **Automation prevents drift** between actual usage and documentation
3. **Type hints in templates** improve developer experience significantly
4. **Secret management platforms** are essential for production environments
5. **Security scanning** should be part of CI/CD pipeline
6. **Per-environment + per-PC matrix** fits Nyra's distributed architecture perfectly

---

**End of Research Report**
