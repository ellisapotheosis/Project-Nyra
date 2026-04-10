# Ingestion Processing Guide

## Overview

This guide provides detailed instructions for processing items in the ingestion folder and integrating them into the main repository structure.

## Processing Phases

### Phase 1: Assessment & Planning

**Goal**: Understand what needs to be done

**Tasks**:
1. Review MANIFEST.md for complete inventory
2. Read INDEX.md files in each category
3. Identify dependencies and conflicts
4. Create processing timeline
5. Assign priorities

**Deliverables**:
- Processing plan with timeline
- Resource allocation
- Risk assessment
- Success criteria

### Phase 2: Content Analysis

**Goal**: Deep dive into content

**Tasks**:
1. Read each document thoroughly
2. Identify unique content vs. duplicates
3. Extract key information and patterns
4. Map relationships and dependencies
5. Document findings

**Deliverables**:
- Content analysis report
- Duplication matrix
- Integration roadmap
- Content outline

### Phase 3: Consolidation

**Goal**: Merge and standardize content

**Tasks**:
1. Merge related documents
2. Remove duplicates
3. Standardize formatting
4. Extract reusable patterns
5. Create templates

**Deliverables**:
- Consolidated documents
- Pattern library
- Templates
- Style guide compliance report

### Phase 4: Integration

**Goal**: Move content to target locations

**Tasks**:
1. Create target directory structure
2. Move consolidated content
3. Update internal links
4. Create cross-references
5. Add to navigation

**Deliverables**:
- Integrated documentation
- Updated navigation
- Cross-reference map
- Migration log

### Phase 5: Validation

**Goal**: Ensure quality and completeness

**Tasks**:
1. Test all links
2. Verify content accuracy
3. Check formatting consistency
4. Validate code examples
5. Get peer review

**Deliverables**:
- Validation report
- Test results
- Peer review feedback
- Issue list (if any)

### Phase 6: Cleanup

**Goal**: Archive and maintain

**Tasks**:
1. Archive processed items
2. Update MANIFEST.md
3. Clean up temporary files
4. Update documentation index
5. Create completion report

**Deliverables**:
- Archive log
- Updated manifest
- Completion report
- Lessons learned

## Processing Strategies

### Document Consolidation

**When to consolidate**:
- Multiple docs cover the same topic
- Significant content overlap (>50%)
- Related sequential processes
- Historical versions exist

**How to consolidate**:
1. Create content matrix showing overlap
2. Choose primary document as base
3. Extract unique content from others
4. Merge into unified document
5. Add version history note

**Example**:
```
ARCHON-COMPLETE-SETUP-GUIDE.md + ARCHON-OS-SETUP-GUIDE.md
→ docs/setup/archon/complete-guide.md
```

### Content Extraction

**When to extract**:
- Document contains multiple distinct topics
- Specific sections have standalone value
- Content fits better in different locations
- Creating reference material

**How to extract**:
1. Identify discrete sections
2. Create separate documents
3. Add cross-references
4. Update original with links
5. Maintain context

**Example**:
```
CLAUDE-FLOW-FULL-FEATURES-CONTAINERIZATION.md
→ Extract to:
  - docs/architecture/containerization/overview.md
  - docs/deployment/docker/guide.md
  - docs/reference/container-patterns.md
```

### Link Management

**Critical**: All internal links must be updated during integration

**Process**:
1. Audit all links before moving content
2. Create redirect map for old → new locations
3. Update links in moved content
4. Add redirects for backward compatibility
5. Test all links post-integration

**Tools**:
```bash
# Find all markdown links in a file
grep -o '\[.*\](.*\.md)' file.md

# Find broken links
find . -name "*.md" -exec markdown-link-check {} \;
```

### Metadata Preservation

**Always preserve**:
- Original creation date
- Author information
- Version history
- Change log
- Context notes

**Add during processing**:
- Processing date
- Integration location
- Related documents
- Keywords for search

## Quality Checklist

### Before Processing
- [ ] All items inventoried in MANIFEST.md
- [ ] INDEX.md created for each category
- [ ] Dependencies identified
- [ ] Processing plan approved
- [ ] Resources allocated

### During Processing
- [ ] Content analysis complete
- [ ] Duplicates identified
- [ ] Consolidation decisions documented
- [ ] Integration locations confirmed
- [ ] Links audited

### After Processing
- [ ] All links work
- [ ] No broken references
- [ ] Formatting consistent
- [ ] Code examples tested
- [ ] Navigation updated
- [ ] Search indexes updated
- [ ] Peer review complete
- [ ] Archive complete
- [ ] MANIFEST.md updated

## Common Patterns

### Setup Guides
- Move to `docs/setup/<component>/`
- Create quick-start version
- Add to getting-started section
- Link prerequisites

### Implementation Reports
- Extract decisions → `docs/architecture/decisions/`
- Extract patterns → `docs/patterns/`
- Archive report → `_archive/reports/`
- Update changelog

### Troubleshooting Docs
- Move to `docs/troubleshooting/<component>/`
- Create FAQ entries
- Add to runbook
- Link from error messages

### Research Outputs
- Extract findings → `docs/research/`
- Create configuration guides
- Add to knowledge base
- Archive raw output

## Tools & Automation

### Recommended Tools
- **markdown-link-check**: Validate links
- **remark-cli**: Format markdown
- **vale**: Style guide enforcement
- **doctoc**: Generate table of contents

### Automation Scripts
```bash
# Validate all markdown files
find apps/ingestion -name "*.md" -exec markdown-link-check {} \;

# Format markdown
find apps/ingestion -name "*.md" -exec npx remark {} --output \;

# Generate TOC
find apps/ingestion -name "*.md" -exec npx doctoc {} \;
```

## Best Practices

1. **Never Delete Originals**: Keep source files until processing is complete and validated
2. **Document Decisions**: Record why consolidation/extraction choices were made
3. **Test Everything**: Validate links, code, and references before marking complete
4. **Maintain Context**: Always preserve the "why" behind documented content
5. **Incremental Integration**: Process and integrate in small batches
6. **Get Reviews**: Have peers review integrated content
7. **Update Indexes**: Keep all documentation indexes current
8. **Create Redirects**: Maintain backward compatibility

## Troubleshooting

### Issue: Conflicting Information
**Solution**: Document both versions, note differences, research correct answer, update both

### Issue: Broken Links After Integration
**Solution**: Use link checker, create redirect map, update systematically

### Issue: Content Ownership Unclear
**Solution**: Check git history, ask original authors, document uncertainty

### Issue: Processing Taking Too Long
**Solution**: Break into smaller chunks, parallelize where possible, focus on high priority first

## Support

- Questions: Open issue with `ingestion` label
- Process improvements: Submit PR to this guide
- Stuck: Ask in #documentation channel
