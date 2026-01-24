# Document Management API - Claude Flow V3 Configuration

> **AI-Powered Document Processing with OCR, Versioning & Search**
>
> Comprehensive document management system for mortgage document workflows

## 🏠 PROJECT CONTEXT

**Service**: Document Management API
**Purpose**: Process, extract, version, and search mortgage-related documents with OCR and eSignature support
**Tech Stack**: Express.js, TypeScript, PostgreSQL (Sequelize), AWS S3, Tesseract OCR, ElasticSearch, DocuSign
**Port**: 3002 (configured in docker-compose)
**Domain**: Part of Project Nyra 4-PC mortgage automation platform

**Key Features**:
- Document upload with file type validation
- OCR-based text extraction (Tesseract.js)
- Document versioning and audit trails
- PDF parsing and text extraction
- ElasticSearch integration for full-text search
- AWS S3 storage with lifecycle policies
- DocuSign eSignature integration
- Thumbnail generation with Sharp
- Multi-tenant document isolation

---

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**When starting work on complex tasks, Claude Code MUST automatically:**

1. **Initialize the swarm** using CLI tools via Bash
2. **Spawn concurrent agents** using Claude Code's Task tool
3. **Coordinate via hooks** and memory

### 🚨 CRITICAL: CLI + Task Tool in SAME Message

**When user says "spawn swarm" or requests complex work, Claude Code MUST in ONE message:**
1. Call CLI tools via Bash to initialize coordination
2. **IMMEDIATELY** call Task tool to spawn REAL working agents
3. Both CLI and Task calls must be in the SAME response

**CLI coordinates, Task tool agents do the actual work!**

---

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

**The routing system has 3 tiers for optimal cost/performance:**

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster | <1ms | $0 | Simple transforms (var→const, add-types, remove-console) |
| **2** | Haiku | ~500ms | $0.0002 | Bug fixes, validation, error handling |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Architecture, OCR logic, integration design |

**Before spawning agents, get routing recommendation:**
```bash
npx @claude-flow/cli@latest hooks pre-task --description "[task description]"
```

**When you see recommendations:**
1. `[AGENT_BOOSTER_AVAILABLE]` → Use Edit tool directly for simple transforms
2. `[TASK_MODEL_RECOMMENDATION] Use model="X"` → Use that model in Task tool

**Benefits:** 75% cost reduction, 352x faster for Tier 1 tasks

---

## 🛡️ ANTI-DRIFT CONFIG (PREFERRED)

**Use this configuration to prevent agent drift:**
```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized
```

**Valid Topologies:**
- `hierarchical` - Queen controls workers directly (recommended for doc-api team)
- `hierarchical-mesh` - V3 queen + peer communication
- `mesh` - Fully connected peer network
- `ring` - Circular communication pattern
- `star` - Central coordinator with spokes

**Anti-Drift Guidelines:**
- **hierarchical**: Coordinator catches divergence early
- **max-agents 6**: Document processing team size
- **specialized**: Clear roles (file-handler, ocr-processor, search-indexer)
- **consensus**: raft (leader maintains state)

---

## 🔄 AUTO-START SWARM PROTOCOL (Background Execution)

When implementing document processing features or file handling:

```javascript
// STEP 1: Initialize swarm with anti-drift config
Bash("npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized")

// STEP 2: Spawn ALL agents IN BACKGROUND in ONE message
Task({
  prompt: "Analyze document processing requirements, existing OCR patterns, S3 integration, and storage strategy",
  subagent_type: "researcher",
  description: "Research document processing patterns",
  run_in_background: true
})
Task({
  prompt: "Design OCR pipeline, versioning strategy, search architecture, and file storage patterns",
  subagent_type: "system-architect",
  description: "Architecture document processing",
  run_in_background: true
})
Task({
  prompt: "Implement document upload, OCR processing, storage management, and search integration",
  subagent_type: "coder",
  description: "Implement document features",
  run_in_background: true
})
Task({
  prompt: "Write tests for file handling, OCR accuracy, search functionality, and S3 operations",
  subagent_type: "tester",
  description: "Test document processing",
  run_in_background: true
})
Task({
  prompt: "Review code quality, security (S3 permissions, file validation), and OCR accuracy",
  subagent_type: "reviewer",
  description: "Review document code",
  run_in_background: true
})

// STEP 3: WAIT - Tell user agents are working, then STOP
```

---

## ⏸️ CRITICAL: Spawn and Wait Pattern

**After spawning background agents:**

1. **TELL USER** - "I've spawned X agents working in parallel"
2. **STOP** - Do not continue with more tool calls
3. **WAIT** - Let agents complete their work
4. **RESPOND** - When agents return results, review and synthesize

**Example response after spawning:**
```
I've launched 5 concurrent agents to work on this:
- 🔍 Researcher: Analyzing document processing requirements
- 🏗️ Architect: Designing OCR and storage architecture
- 💻 Coder: Implementing document features
- 🧪 Tester: Writing integration tests
- 👀 Reviewer: Code quality and security review

They're working in parallel. I'll synthesize their results when they complete.
```

### 🚫 DO NOT:
- Continuously check swarm status
- Poll TaskOutput repeatedly
- Add more tool calls after spawning
- Ask "should I check on the agents?"

### ✅ DO:
- Spawn all agents in ONE message
- Tell user what's happening
- Wait for agent results to arrive
- Synthesize results when they return

---

## 🧠 AUTO-LEARNING PROTOCOL

### Before Starting Any Task
```bash
# 1. Search memory for document processing patterns
npx @claude-flow/cli@latest memory search --query "document processing OCR patterns" --namespace patterns

# 2. Check if similar feature was done
npx @claude-flow/cli@latest memory search --query "file upload S3 integration" --namespace tasks

# 3. Load learned optimizations
npx @claude-flow/cli@latest hooks route --task "document processing"
```

### After Completing Any Task Successfully
```bash
# 1. Store successful pattern
npx @claude-flow/cli@latest memory store --namespace patterns --key "doc-ocr-pipeline" --value "Tesseract.js + Sharp + ElasticSearch integration pattern"

# 2. Train neural patterns
npx @claude-flow/cli@latest hooks post-edit --file "src/services/DocumentProcessor.ts" --train-neural true

# 3. Record task completion
npx @claude-flow/cli@latest hooks post-task --task-id "[task-id]" --success true --store-results true

# 4. Trigger optimization for file handling
npx @claude-flow/cli@latest hooks worker dispatch --trigger optimize
```

### Continuous Improvement Triggers

| Trigger | Worker | When to Use |
|---------|--------|-------------|
| After OCR improvements | `optimize` | Performance optimization |
| After adding file types | `testgaps` | Coverage for new formats |
| After API changes | `document` | Update docs |
| After S3 changes | `audit` | Security review |
| Every 5+ file changes | `map` | Update codebase map |

---

## 🚨 CRITICAL DEVELOPMENT RULES

### Document Processing Security
- **File Validation**: Always validate file type, size, and content before processing
- **S3 Permissions**: Principle of least privilege for AWS credentials
- **OCR Accuracy**: Implement confidence threshold checks (default 60%)
- **Data Privacy**: Ensure document content is never logged or exposed

### Mortgage-Specific Compliance
- Document types must support: Paystubs, Tax Returns, Bank Statements, Identification, Loan Documents
- OCR results must be reviewed before being used for automated processing
- Version control must maintain audit trail of all document changes
- eSignature via DocuSign must include TILA/RESPA compliance metadata

### Elasticsearch Integration
- Index only searchable metadata, not sensitive document content
- Implement document-level access control
- Regular index health monitoring and optimization

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. NEVER save working files to root folder - use `/src` for source code
3. Tests go in `/tests`, configurations in `/config`
4. USE CLAUDE CODE'S TASK TOOL for spawning agents, not just MCP

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**
- **TodoWrite**: Batch ALL todos in ONE call
- **Task tool**: Spawn ALL agents in ONE message with full instructions
- **File operations**: Batch ALL reads/writes/edits in ONE message
- **Bash commands**: Batch ALL terminal operations in ONE message
- **Memory operations**: Batch ALL memory store/retrieve in ONE message

### 📁 File Organization Rules

```
services/doc-management-api/
├── src/
│   ├── config/          # Configuration (database, aws, elasticsearch)
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic (OCR, S3, Search)
│   ├── types/           # TypeScript interfaces
│   └── utils/           # Utilities (logger, validators)
├── tests/               # Test files (jest)
├── config/              # Config files
├── docs/                # API documentation
└── migrations/          # Database migrations
```

---

## 📋 Agent Routing (Anti-Drift)

| Code | Task | Agents |
|------|------|--------|
| 1 | Bug Fix (1-2 files) | coder, tester |
| 3 | Feature (doc upload, OCR, search) | coordinator, architect, coder, tester, reviewer |
| 5 | Refactor (services, models) | coordinator, architect, coder, reviewer |
| 7 | Performance (S3, ES optimization) | coordinator, perf-engineer, coder |
| 9 | Security (file validation, permissions) | coordinator, security-architect, auditor |

**Code 1-7: Use hierarchical. Code 9: Use mesh for security review.**

---

## 🎯 Task Complexity Detection

**AUTO-INVOKE SWARM when task involves:**
- Document processing pipeline changes (3+ files)
- OCR accuracy improvements
- S3 storage refactoring
- Elasticsearch schema changes
- DocuSign integration work
- File format support additions
- API endpoint additions with full testing

**SKIP SWARM for:**
- Single file edits
- Simple bug fixes (1-2 lines)
- Documentation updates
- Configuration changes only

---

## Project Config (Anti-Drift Defaults)

- **Topology**: hierarchical (prevents drift)
- **Max Agents**: 6 (document processing team)
- **Strategy**: specialized (clear roles)
- **Consensus**: raft
- **Memory**: hybrid (AgentDB + HNSW)
- **Neural**: Enabled for pattern learning

---

## 🚀 V3 CLI Commands (26 Commands, 140+ Subcommands)

### Core Commands for Doc API

```bash
# Swarm management
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized
npx @claude-flow/cli@latest swarm status

# Memory operations (vector search with 150x-12,500x speedup)
npx @claude-flow/cli@latest memory search --query "OCR pipeline patterns"
npx @claude-flow/cli@latest memory store --key "s3-upload-handler" --value "Handle multipart uploads with Sharp resize"

# Agent management
npx @claude-flow/cli@latest agent spawn -t coder --name doc-processor
npx @claude-flow/cli@latest agent list

# Task execution
npx @claude-flow/cli@latest task create --description "Add PDF text extraction"
npx @claude-flow/cli@latest task assign --task-id [id] --agent-id [agent-id]

# Hooks for learning
npx @claude-flow/cli@latest hooks pre-task --description "Implement OCR confidence validation"
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true
```

---

## 🚀 Available Agents for Doc API

### Core Development
- `coder` - File upload, OCR, storage implementation
- `tester` - Test coverage for document processing
- `reviewer` - Code quality, security review
- `system-architect` - OCR pipeline design, storage strategy
- `researcher` - Document processing requirements, OCR best practices

### Specialized Agents
- `security-architect` - File validation, S3 permissions
- `security-auditor` - Security scanning for file handling
- `perf-engineer` - S3 optimization, Elasticsearch tuning
- `database-expert` - Sequelize model optimization

---

## 🪝 V3 Hooks System (27 Hooks + 12 Workers)

### Essential Hooks for Doc API

```bash
# Pre-task hooks (get routing recommendation)
npx @claude-flow/cli@latest hooks pre-task --description "Add image compression for thumbnails"

# Post-edit hooks (learn from successful edits)
npx @claude-flow/cli@latest hooks post-edit --file "src/services/DocumentProcessor.ts" --train-neural true

# Post-task hooks (record completion)
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true --store-results true

# Background workers for continuous improvement
npx @claude-flow/cli@latest hooks worker dispatch --trigger optimize    # Performance optimization
npx @claude-flow/cli@latest hooks worker dispatch --trigger audit       # Security analysis
npx @claude-flow/cli@latest hooks worker dispatch --trigger testgaps    # Test coverage gaps
npx @claude-flow/cli@latest hooks worker dispatch --trigger map         # Codebase mapping (after 5+ files)

# Session management
npx @claude-flow/cli@latest hooks session-start --session-id "doc-api-session"
npx @claude-flow/cli@latest hooks session-end --export-metrics true
```

---

## 🔄 Session Persistence (Cross-Conversation Learning)

**At session start - restore previous context:**
```bash
npx @claude-flow/cli@latest session restore --latest
```

**At session end - persist learned patterns:**
```bash
npx @claude-flow/cli@latest hooks session-end --generate-summary true --persist-state true --export-metrics true
```

---

## 🧠 Neural Pattern Training

**Train on successful document processing patterns:**
```bash
npx @claude-flow/cli@latest neural train --pattern-type document-processing --epochs 10
npx @claude-flow/cli@latest neural train --pattern-type s3-optimization --epochs 5

# Predict optimal approach for new document features
npx @claude-flow/cli@latest neural predict --input "Add TIFF format support"

# View learned patterns
npx @claude-flow/cli@latest neural patterns --list
```

---

## 🧠 Memory Management

**Key memory patterns to maintain:**
- `ocr-pipeline` - Tesseract.js configuration and accuracy tuning
- `s3-optimization` - Upload handling, multipart strategies
- `search-indexing` - Elasticsearch document indexing patterns
- `file-validation` - File type detection and security checks
- `docusign-integration` - eSignature workflow patterns

---

## 🎯 PROJECT CONTEXT

**Service Architecture**: Document Management API (Part of Project Nyra)
- **Infrastructure**: 4-PC local LAN cluster with Archon OS orchestration
- **Integration**: Works with mortgage-assistant-api for document needs
- **Compliance**: Mortgage document security and audit trails required
- **Scale**: Handles 100-500 mortgage leads monthly with document uploads

**Key Dependencies**:
- `express` (4.18.2) - REST API framework
- `sequelize` (6.35.2) - ORM for PostgreSQL
- `aws-sdk` (2.1498.0) - S3 file storage
- `tesseract.js` (5.0.4) - OCR processing
- `pdf-parse` (1.1.1) - PDF text extraction
- `elasticsearch` (16.7.3) - Full-text search
- `sharp` (0.33.1) - Image processing
- `docusign-esign` (7.0.0) - eSignature integration
- `multer` & `multer-s3` - File upload handling

---

## 🔧 Development Patterns

### TypeScript Configuration
```bash
# Strict TypeScript with mortgage-specific types
tsconfig.json: strict: true, esModuleInterop: true
```

### Express Middleware Stack
```typescript
app.use(helmet());                    // Security headers
app.use(cors());                      // CORS for mortgage apps
app.use(express.json());              // JSON parsing
app.use(morgan('combined'));          // HTTP logging
app.use(compression());               // Response compression
app.use(rateLimit());                 // Rate limiting
```

### Database (Sequelize) Patterns
```typescript
// Models for Document, Version, AccessLog
// Includes timestamps, softDelete for audit trail
// Document-level access control validation
```

### OCR Processing Pattern
```typescript
// 1. File upload via multer to S3
// 2. Trigger Tesseract.js for text extraction
// 3. Store results with confidence threshold
// 4. Index in Elasticsearch for search
// 5. Create thumbnail with Sharp
```

### Error Handling
```typescript
// Winston logging for all errors
// Structured error responses
// Mortgage-specific error codes
// Audit trail for failures
```

### Testing Strategy
```bash
npm run test                    # Jest unit tests
npm run test:integration       # Integration tests (OCR, S3, ES)
npm run test:coverage          # Coverage reporting
```

---

## 🚀 Deployment & CI/CD

**Docker Container:**
```dockerfile
# Multi-stage build
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3002
CMD ["npm", "start"]
```

**Environment Variables Required:**
- `PORT=3002`
- `NODE_ENV=production`
- `DATABASE_URL` - PostgreSQL connection
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - S3 credentials
- `JWT_SECRET` - Token signing
- `ELASTICSEARCH_NODE` - ES cluster
- `DOCUSIGN_*` - eSignature config

**Health Check:**
```bash
GET /health - Service health
GET /health/ocr - OCR engine status
GET /health/s3 - S3 connectivity
GET /health/elasticsearch - Search engine status
```

---

## 🔒 Security & Compliance

### File Security
- Validate file type (whitelist: pdf, jpg, png, doc, docx, tiff)
- Scan for malware before processing
- Enforce max file size (100MB default)
- Implement virus scanning for mortgage documents

### S3 Security
- Use IAM roles with least privilege
- Enable S3 encryption at rest
- Implement bucket policies
- Version control for audit trails
- Lifecycle policies for old documents

### OCR Security
- Never log document content
- Implement confidence thresholds
- Validate extracted data
- Audit all OCR operations

### Data Privacy
- GDPR compliance for document storage
- Right to be forgotten implementation
- Document deletion policies
- Access logging for compliance

### Mortgage Compliance
- TILA/RESPA document handling
- Fair lending audit trails
- State-specific regulations
- CFPB examination standards

---

## 🔧 Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3002
API_VERSION=v1

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doc_management
DB_USER=postgres
DB_PASSWORD=postgres

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=doc-management-bucket
S3_ENDPOINT=https://s3.amazonaws.com

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# OCR
OCR_ENABLED=true
OCR_LANGUAGE=eng
OCR_CONFIDENCE_THRESHOLD=60

# Document
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif,tiff
THUMBNAIL_SIZE=300
THUMBNAIL_QUALITY=80

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX=documents

# DocuSign
DOCUSIGN_INTEGRATION_KEY=your_integration_key
DOCUSIGN_USER_ID=your_user_id
DOCUSIGN_ACCOUNT_ID=your_account_id
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
```

---

## 🩺 Doctor Health Checks

Run `npx @claude-flow/cli@latest doctor` to check:
```bash
✓ Node.js version (20+)
✓ npm version (9+)
✓ Git installation
✓ PostgreSQL connectivity
✓ AWS S3 credentials
✓ Elasticsearch cluster
✓ DocuSign integration
✓ Config file validity
✓ Disk space for uploads
✓ TypeScript compilation
```

---

## 🚀 Quick Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with local values

# Setup database
npm run migrate
npm run seed

# Start development
npm run dev

# Run tests
npm run test
npm run test:integration

# Build for production
npm build
npm start
```

---

## 🎯 Claude Code vs CLI Tools

### Claude Code Handles ALL EXECUTION:
- **Task tool**: Spawn agents for document features
- File operations (Read, Write, Edit)
- Code generation and implementation
- Bash commands and deployments
- Git operations

### CLI Tools Handle Coordination (via Bash):
- **Swarm init**: Initialize document processing team
- **Memory store**: Store OCR patterns, S3 strategies
- **Hooks**: Pre/post task learning
- **Session management**: Cross-conversation state

**KEY**: CLI coordinates the strategy via Bash, Claude Code's Task tool executes with real agents.

---

## 📝 Memory Commands Reference (IMPORTANT)

### Store Data
```bash
# Store OCR pattern
npx @claude-flow/cli@latest memory store --key "ocr-tesseract-config" \
  --value "Language: eng, Confidence threshold: 60, Formats: pdf,tiff,jpg" \
  --namespace patterns

# Store S3 optimization
npx @claude-flow/cli@latest memory store --key "s3-multipart-upload" \
  --value "Chunk size: 5MB, Retry on failure, Verify integrity" \
  --namespace patterns --tags "s3,upload"
```

### Search Data (semantic vector search)
```bash
# Find OCR patterns
npx @claude-flow/cli@latest memory search --query "OCR accuracy optimization" --namespace patterns

# Find file handling patterns
npx @claude-flow/cli@latest memory search --query "document upload handling" --limit 5
```

### List Entries
```bash
npx @claude-flow/cli@latest memory list --namespace patterns --limit 10
```

### Retrieve Specific Entry
```bash
npx @claude-flow/cli@latest memory retrieve --key "ocr-tesseract-config" --namespace patterns
```

---

## 🚀 V3 Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| File Upload | <2s | For 10MB documents |
| OCR Processing | <30s | Per document page |
| S3 Retrieval | <500ms | With caching |
| Search Query | <100ms | Elasticsearch |
| Thumbnail Generation | <5s | 300x300 with compression |
| API Response | <200ms | Non-processing endpoints |

---

## 🚨 SWARM EXECUTION RULES (CRITICAL)

1. **SPAWN IN BACKGROUND**: Use `run_in_background: true` for all agent Task calls
2. **SPAWN ALL AT ONCE**: Put ALL agent Task calls in ONE message for parallel execution
3. **TELL USER**: After spawning, list what each agent is doing
4. **STOP AND WAIT**: After spawning, STOP - do NOT add more tool calls or check status
5. **NO POLLING**: Never poll TaskOutput or check swarm status - trust agents to return
6. **SYNTHESIZE**: When agent results arrive, review ALL results before proceeding

---

## Support & Resources

- **Project Nyra**: `C:\Dev\Projects\Repos\Project-Nyra\CLAUDE.md`
- **V3 Template**: `C:\Dev\Projects\Repos\Project-Nyra\docs\development\CLAUDE-MD-V3-TEMPLATE-GUIDE.md`
- **Capabilities**: `.claude-flow/CAPABILITIES.md`
- **Architecture**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/ARCHITECTURE.md`

---

*Last Updated: 2026-01-22*
*Version: 1.0 (Claude Flow V3)*
*Type: API Service Configuration*
