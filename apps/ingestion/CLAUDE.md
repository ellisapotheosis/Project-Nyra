# Ingestion - Content Processing & Integration

## 🎯 APPLICATION CONTEXT

**Purpose**: Complex content ingestion, classification, and processing hub using SPARC methodology for systematic integration of documentation, configurations, and research outputs.

**Type**: Utility Directory
**Pattern**: SPARC Workflow Processing
**Integration**: Claude Flow V3 workflows + MCP memory coordination

## 🚨 CRITICAL DEVELOPMENT RULES

### SPARC-First Processing
**MANDATORY**: All complex ingestion tasks MUST use SPARC methodology:

```bash
# Execute SPARC ingestion workflow
npx @claude-flow/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '{
    "ingestion_path": "apps/ingestion/temp/[content-name]",
    "content_type": "mixed",
    "target_domain": "apps",
    "priority": "normal",
    "validation_level": "standard"
  }'
```

### Never Delete Originals
- **Ingestion is COPY operation** - preserve source files
- Add metadata for traceability
- Update MANIFEST.md with processing status
- Preserve context about why items are ingested

### Parallel Classification Pattern
**MANDATORY**: Process multiple ingested items concurrently:

```javascript
// ✅ CORRECT: Batch ingestion processing in ONE message
[Single Message]:
  // Classify items by type
  - Bash("npx @claude-flow/cli@latest memory store --key 'ingestion/doc-123' --value '{type: docs, priority: high}' --namespace ingestion")
  - Bash("npx @claude-flow/cli@latest memory store --key 'ingestion/config-456' --value '{type: config, priority: medium}' --namespace ingestion")

  // Process with appropriate agents
  - Task: Researcher analyzes docs/ items
  - Task: Architect reviews configs/ items
  - Task: Documentation specialist processes research/ items

  // Update tracking
  - Edit("MANIFEST.md", add_processed_items)

// ❌ WRONG: Sequential single-item processing
[Message 1]: Process one document
[Message 2]: Process another document
```

## 📊 INGESTION ARCHITECTURE

### Directory Structure
```
apps/ingestion/
├── README.md              # Purpose and organization
├── MANIFEST.md            # Complete inventory with status
├── CLAUDE.md              # This file - development guidelines
├── docs/                  # Documentation requiring integration
│   ├── setup-guides/
│   ├── implementation-reports/
│   └── technical-specs/
├── configs/               # Configuration templates
│   ├── docker-compose/
│   ├── env-templates/
│   └── deployment/
├── research/              # Analysis and exploration outputs
│   ├── architecture-analysis/
│   ├── performance-studies/
│   └── security-assessments/
└── temp/                  # Pending classification
```

### Processing Workflow

**SPARC Phases**:
1. **Specification**: Content discovery, metadata extraction, requirements analysis
2. **Pseudocode**: Processing algorithm design, integration planning
3. **Architecture**: Domain mapping, security review, compliance check
4. **Refinement**: Testing, validation, quality assurance
5. **Completion**: Integration, cleanup, knowledge capture

## 🧠 CLAUDE FLOW INTEGRATION

### Available Agents
```yaml
agents:
  content_classifier:
    role: Classify and categorize ingested content
    focus: [metadata-extraction, type-detection, priority-assessment]
    responsibilities:
      - Analyze ingested content type and complexity
      - Extract metadata and context
      - Assign processing priority
      - Route to appropriate specialist agents

  documentation_integrator:
    role: Process documentation for integration
    focus: [docs-consolidation, structure-analysis, content-migration]
    responsibilities:
      - Review ingested documentation
      - Identify integration targets
      - Maintain doc structure consistency
      - Merge with existing documentation

  config_analyzer:
    role: Analyze and migrate configuration files
    focus: [config-validation, security-review, migration-planning]
    responsibilities:
      - Validate configuration syntax
      - Check for secrets/credentials
      - Plan migration to proper locations
      - Update references and dependencies

  research_synthesizer:
    role: Process research outputs and learnings
    focus: [analysis-extraction, knowledge-capture, insight-synthesis]
    responsibilities:
      - Extract key findings from research
      - Capture learnings in memory system
      - Synthesize insights across studies
      - Update architecture decision records
```

### Recommended Workflows

**1. Single Item Ingestion**
```bash
# Store metadata
npx @claude-flow/cli@latest memory store \
  --key "ingestion/item-$(date +%s)" \
  --value '{"type": "docs", "source": "external", "priority": "high"}' \
  --namespace ingestion

# Get routing recommendation
npx @claude-flow/cli@latest hooks route \
  --task "Process technical documentation from external source"
```

**2. Bulk Ingestion Processing**
```bash
# Initialize SPARC workflow for multiple items
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized

# Spawn specialized agents for parallel processing
# (Use Claude Code Task tool for actual agent spawning)
```

**3. Research Output Integration**
```bash
# Pre-task hook for research processing
npx @claude-flow/cli@latest hooks pre-task \
  --description "Integrate research findings into architecture docs" \
  --coordinate-swarm true

# Post-task learning capture
npx @claude-flow/cli@latest hooks post-task \
  --task-id "research-integration-001" \
  --success true \
  --store-results true
```

## 🔄 AUTO-LEARNING PROTOCOL

### Before Processing
```bash
# Search for similar ingestion patterns
npx @claude-flow/cli@latest memory search \
  --query "ingestion processing patterns" \
  --namespace patterns

# Check past successful integrations
npx @claude-flow/cli@latest memory search \
  --query "docs integration successful" \
  --namespace tasks
```

### After Processing
```bash
# Store successful pattern
npx @claude-flow/cli@latest memory store \
  --namespace patterns \
  --key "ingestion-success-$(date +%Y%m%d)" \
  --value "Successfully processed [type] using [approach]"

# Train neural patterns
npx @claude-flow/cli@latest hooks post-edit \
  --file "MANIFEST.md" \
  --train-neural true
```

## 🔒 SECURITY & COMPLIANCE

### Pre-Processing Checks
- **Scan for secrets**: Never ingest files with API keys, passwords, tokens
- **PII detection**: Flag personal/sensitive information
- **License validation**: Check licensing compatibility
- **Origin verification**: Document source and permissions

### Processing Guidelines
- Sanitize all ingested content
- Validate file integrity
- Check for malware/suspicious content
- Maintain audit trail in MANIFEST.md

## 📈 PERFORMANCE TARGETS

- **Classification time**: < 5 seconds per item
- **SPARC processing**: Complete within 1 workflow execution
- **Parallel processing**: 5+ items concurrently
- **Memory storage**: < 100ms per metadata entry

## 🎨 DEVELOPMENT PRIORITIES

### Phase 1: Manual Ingestion
- Copy items to appropriate subdirectories
- Add metadata and context notes
- Update MANIFEST.md with status

### Phase 2: Automated Classification
- Implement content type detection
- Auto-route to specialist agents
- Generate processing recommendations

### Phase 3: SPARC Integration
- Full workflow automation
- Multi-agent parallel processing
- Continuous learning from outcomes

### Phase 4: Intelligent Routing
- Neural pattern recognition
- Predictive processing recommendations
- Auto-deduplication and consolidation

## 📚 RELATED DOCUMENTATION

- **Root CLAUDE.md**: V3 orchestration and swarm patterns
- **MANIFEST.md**: Complete ingestion inventory
- **../_archive/**: Historical processed items
- **../docs/**: Primary documentation location
- **.claude-flow/workflows/**: SPARC workflow definitions

## 🛠️ COMMON OPERATIONS

### Ingest New Content
```bash
# Copy to temp/ for initial review
cp -r [source] apps/ingestion/temp/[name]

# Classify and add metadata
npx @claude-flow/cli@latest memory store \
  --key "ingestion/temp-[name]" \
  --value '{"added": "$(date -I)", "source": "[origin]"}' \
  --namespace ingestion
```

### Process with SPARC
```bash
# Execute full SPARC workflow
npx @claude-flow/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '{"ingestion_path": "apps/ingestion/temp/[name]"}'
```

### Mark as Complete
```bash
# Update MANIFEST.md
# Move from temp/ to appropriate category
# Store completion in memory
npx @claude-flow/cli@latest memory store \
  --key "ingestion/completed-[name]" \
  --value '{"completed": "$(date -I)", "target": "[destination]"}' \
  --namespace ingestion
```

---

**This directory is the entry point for complex content that needs systematic processing. All items here should eventually be integrated, archived, or removed after proper handling.**
