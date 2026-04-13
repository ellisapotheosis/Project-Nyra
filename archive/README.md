# Ingestion Folder

## Purpose

This folder contains **complex and INGESTION-category items** that require future processing, integration, or consolidation. Items here are preserved for reference and organized by type to facilitate systematic processing.

## Structure

```
apps/ingestion/
├── README.md              # This file - explains purpose and organization
├── MANIFEST.md            # Complete inventory of ingested items
├── docs/                  # Complex documentation and guides
├── configs/               # Configuration files and templates
├── research/              # Research outputs and analysis reports
└── temp/                  # Temporary files pending classification
```

## Categories

### docs/
Complete setup guides, implementation reports, and technical documentation that needs to be integrated into the main documentation structure.

### configs/
Configuration files, environment templates, and setup scripts that may need consolidation or migration to proper locations.

### research/
Research outputs, analysis reports, and exploration documents that capture learnings and discoveries.

### temp/
Items that need further review to determine their proper classification and processing priority.

## Processing Workflow

This folder uses the **SPARC methodology** for systematic, quality-assured content processing.

### Manual Workflow

1. **Ingest**: Items are copied (not moved) to preserve originals
2. **Classify**: Organize by type and add metadata
3. **Prioritize**: Assess complexity and integration requirements
4. **Process**: Integrate, refactor, or archive as appropriate
5. **Validate**: Ensure processing is complete
6. **Clean**: Remove from ingestion once processed

### Automated SPARC Workflow

For complex content requiring multi-agent coordination, use the SPARC workflow template:

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

**SPARC Phases**:
1. **Specification**: Content discovery and requirements analysis
2. **Pseudocode**: Algorithm design and code outlining
3. **Architecture**: Domain mapping and security review
4. **Refinement**: Testing, code review, and security audit
5. **Completion**: Final integration and knowledge capture

See **[.claude-flow/workflows/README.md](../../.claude-flow/workflows/README.md)** for detailed workflow documentation.

## Guidelines

- **Never delete originals** - ingestion is a copy operation
- **Add metadata** - document source, date, and processing needs
- **Track progress** - update MANIFEST.md with processing status
- **Preserve context** - include notes about why items are here

## See Also

- `MANIFEST.md` - Complete inventory with processing priorities
- `../_archive/` - Historical archives of completed consolidations
- `../docs/` - Primary documentation location
