# SPARC Workflow: Ingestion Pipeline Processing
> Reusable workflow template for processing apps/ingestion content
> Version: 1.0.0
> Created: 2026-01-18

## Overview

This workflow implements the SPARC methodology (Specification, Pseudocode, Architecture, Refinement, Completion) for systematic processing of ingestion pipeline content. It can be invoked via archon-os CLI for any ingestion content.

## Workflow Inputs

```yaml
inputs:
  ingestion_path: string        # Path to content in ingestion folder
  content_type: enum            # Type: config | code | workflow | docker | mixed
  target_domain: string         # Target domain: infra | apps | shared
  priority: enum                # Priority: low | normal | high | critical
  validation_level: enum        # Validation: basic | standard | deep
```

## SPARC Phases

### Phase 1: Specification (S)

**Objective**: Analyze ingestion content and define integration requirements

**Agents**: `researcher`, `system-architect`

**Steps**:
1. **Content Discovery**
   - Scan ingestion directory structure
   - Identify file types (configs, code, docs, docker)
   - Detect dependencies and relationships
   - Extract metadata (creation date, source, purpose)

2. **Requirements Analysis**
   - Determine content purpose and functionality
   - Identify integration points with existing codebase
   - Map to domain boundaries (DDD)
   - Document quality attributes needed

3. **Impact Assessment**
   - Analyze potential conflicts with existing code
   - Identify breaking changes or incompatibilities
   - Assess security implications
   - Estimate integration complexity

4. **Specification Output**
   ```yaml
   specification:
     content_summary: "Description of what content does"
     integration_requirements:
       - requirement_1
       - requirement_2
     target_locations:
       - path: "target/path"
         rationale: "Why this location"
     dependencies: ["dep1", "dep2"]
     quality_attributes:
       - performance_requirements
       - security_requirements
       - maintainability_requirements
     risks:
       - risk: "Description"
         severity: high|medium|low
         mitigation: "Strategy"
   ```

---

### Phase 2: Pseudocode (P)

**Objective**: Design algorithms for processing and integrating content

**Agents**: `planner`, `coder`

**Steps**:
1. **Processing Algorithm Design**
   ```
   ALGORITHM ProcessIngestionContent
   INPUT: ingestion_path, specification
   OUTPUT: processed_content, integration_plan

   1. VALIDATE content structure
   2. FOR EACH file IN ingestion_path:
      a. PARSE file metadata
      b. EXTRACT reusable components
      c. IDENTIFY integration points
      d. MAP to target location
   3. RESOLVE dependencies
   4. GENERATE integration sequence
   5. CREATE rollback plan
   ```

2. **Content Transformation Logic**
   ```
   ALGORITHM TransformContent
   INPUT: raw_content, target_domain
   OUTPUT: transformed_content

   1. IF content_type == "config":
      a. VALIDATE schema
      b. MERGE with existing configs
      c. RESOLVE conflicts (precedence rules)
   2. IF content_type == "code":
      a. REFACTOR to match codebase patterns
      b. UPDATE imports and dependencies
      c. ADD tests and documentation
   3. IF content_type == "docker":
      a. VALIDATE compose syntax
      b. INTEGRATE with orchestration
      c. UPDATE environment configs
   ```

3. **Integration Strategy**
   ```
   ALGORITHM IntegrateContent
   INPUT: processed_content, target_locations
   OUTPUT: integration_result

   1. CREATE backup of target locations
   2. FOR EACH target IN target_locations:
      a. IF target exists:
         - MERGE with conflict resolution
      b. ELSE:
         - CREATE new structure
   3. UPDATE dependency graph
   4. TRIGGER post-integration hooks
   5. VALIDATE integration success
   ```

---

### Phase 3: Architecture (A)

**Objective**: Design placement and integration architecture

**Agents**: `system-architect`, `security-architect`

**Steps**:
1. **Domain Mapping**
   ```
   Architecture Decision: Content Placement

   Domain Structure:
   /apps
     /infra          - Infrastructure configs (docker, k8s)
     /services       - Microservices and APIs
     /workers        - Background workers and processors
   /config
     /env            - Environment configurations
     /storage        - Database and storage configs
   /shared
     /utils          - Shared utilities
     /types          - Type definitions
   /workflows
     /.github        - GitHub Actions
     /archon-os    - Claude Flow workflows
   ```

2. **Integration Patterns**
   - **Config Merge Pattern**: For configuration files
     ```
     Strategy: Deep merge with conflict resolution
     Priority: ingestion > existing (with validation)
     Backup: Always create .backup before merge
     ```

   - **Code Integration Pattern**: For source files
     ```
     Strategy: Module-based integration
     Refactoring: Align with existing patterns
     Testing: Required before integration
     ```

   - **Docker Orchestration Pattern**: For docker-compose files
     ```
     Strategy: Service-based merge
     Networks: Integrate with existing networks
     Volumes: Map to storage layer
     ```

3. **Architecture Diagrams**
   ```
   Component Diagram:

   [Ingestion Content]
         |
         v
   [SPARC Processor]
         |
         +---> [Specification Analyzer]
         |
         +---> [Content Transformer]
         |
         +---> [Integration Engine]
         |           |
         |           +---> [Config Merger]
         |           +---> [Code Integrator]
         |           +---> [Docker Orchestrator]
         |
         v
   [Target Domain Structure]
         |
         v
   [Validation & Testing]
   ```

4. **Data Flow**
   ```
   Ingestion Path
       |
       v
   [Scan & Classify] --> metadata.json
       |
       v
   [Transform] --> processed/
       |
       v
   [Validate] --> validation_report.json
       |
       v
   [Integrate] --> target locations
       |
       v
   [Test] --> test_results.json
   ```

5. **Security Architecture**
   - Input validation (path traversal prevention)
   - Content scanning (malware, secrets)
   - Dependency verification
   - Integrity checks (checksums)
   - Access control (permissions)

---

### Phase 4: Refinement (R)

**Objective**: Test, validate, and refine integration

**Agents**: `tester`, `reviewer`, `security-auditor`

**Steps**:
1. **Testing Strategy**
   ```yaml
   testing_levels:
     unit:
       - Test individual transformation functions
       - Test merge algorithms
       - Test conflict resolution
     integration:
       - Test end-to-end processing
       - Test with real ingestion content
       - Test rollback procedures
     system:
       - Test impact on overall system
       - Performance testing
       - Load testing
   ```

2. **Validation Checks**
   - **Structural Validation**
     - File structure integrity
     - Dependency resolution
     - Schema compliance

   - **Functional Validation**
     - Configurations load correctly
     - Code executes without errors
     - Docker services start properly

   - **Quality Validation**
     - Code quality metrics (linting, complexity)
     - Security scan results
     - Performance benchmarks

3. **Refinement Iterations**
   ```
   WHILE validation_failures > 0:
     1. ANALYZE failure root causes
     2. APPLY fixes
     3. RE-RUN validation suite
     4. IF max_iterations reached:
        - ESCALATE to human review
   ```

4. **Documentation Generation**
   - Integration report (what was integrated)
   - Change log (what changed)
   - Migration guide (how to use)
   - Rollback procedure (how to revert)

---

### Phase 5: Completion (C)

**Objective**: Finalize integration and store learnings

**Agents**: `coordinator`, `memory-specialist`

**Steps**:
1. **Final Integration**
   - Move processed content to target locations
   - Update configuration registries
   - Deploy changes (if applicable)
   - Archive original ingestion content

2. **Post-Integration Actions**
   - Trigger dependent workflows
   - Update documentation
   - Notify stakeholders
   - Schedule monitoring

3. **Knowledge Capture**
   ```bash
   # Store successful patterns
   npx @archon-os/cli@latest memory store \
     --key "ingestion-pattern-$(date +%s)" \
     --value "$(cat integration_report.json)" \
     --namespace ingestion_patterns

   # Train neural patterns
   npx @archon-os/cli@latest hooks post-task \
     --task-id "ingestion-processing" \
     --success true \
     --store-results true
   ```

4. **Completion Checklist**
   - [ ] All content processed successfully
   - [ ] Tests passing (unit, integration, system)
   - [ ] Documentation updated
   - [ ] Security scan clean
   - [ ] Performance benchmarks acceptable
   - [ ] Rollback plan documented
   - [ ] Learnings stored in memory
   - [ ] Original content archived

---

## Claude Flow Workflow Definition

```yaml
workflow:
  id: "ingestion-sparc-processor"
  name: "SPARC Ingestion Pipeline Processor"
  version: "1.0.0"

  variables:
    ingestion_path: ""
    content_type: "mixed"
    target_domain: "apps"
    priority: "normal"
    validation_level: "standard"

  steps:
    # Phase 1: Specification
    - name: "specification_phase"
      type: "parallel"
      agents: ["researcher", "system-architect"]
      config:
        tasks:
          - id: "content_discovery"
            agent: "researcher"
            prompt: |
              Analyze ingestion content at {{ingestion_path}}:
              1. Scan directory structure
              2. Identify file types and dependencies
              3. Extract metadata
              4. Document findings in specification.json

          - id: "requirements_analysis"
            agent: "system-architect"
            prompt: |
              Based on content discovery, define:
              1. Integration requirements
              2. Target locations with rationale
              3. Quality attributes needed
              4. Risk assessment
              Store in specification.json

      success_criteria:
        - file_exists: "specification.json"
        - schema_valid: "specification_schema.json"

    # Phase 2: Pseudocode
    - name: "pseudocode_phase"
      type: "sequential"
      depends_on: ["specification_phase"]
      agents: ["planner", "coder"]
      config:
        tasks:
          - id: "algorithm_design"
            agent: "planner"
            prompt: |
              Design processing algorithms for:
              1. Content transformation
              2. Integration strategy
              3. Rollback procedures
              Document in algorithms.md

          - id: "code_outline"
            agent: "coder"
            prompt: |
              Create code outline for:
              1. Content processors
              2. Merge utilities
              3. Validation functions
              Store in src/processors/outline.ts

      success_criteria:
        - file_exists: "algorithms.md"
        - file_exists: "src/processors/outline.ts"

    # Phase 3: Architecture
    - name: "architecture_phase"
      type: "parallel"
      depends_on: ["pseudocode_phase"]
      agents: ["system-architect", "security-architect"]
      config:
        tasks:
          - id: "domain_mapping"
            agent: "system-architect"
            prompt: |
              Design placement architecture:
              1. Map content to domain structure
              2. Define integration patterns
              3. Create architecture diagrams
              4. Document data flow
              Store in docs/architecture/ingestion-integration.md

          - id: "security_review"
            agent: "security-architect"
            prompt: |
              Design security architecture:
              1. Input validation strategy
              2. Content scanning approach
              3. Access control model
              4. Integrity verification
              Store in docs/security/ingestion-security.md

      success_criteria:
        - file_exists: "docs/architecture/ingestion-integration.md"
        - file_exists: "docs/security/ingestion-security.md"

    # Phase 4: Refinement
    - name: "refinement_phase"
      type: "parallel"
      depends_on: ["architecture_phase"]
      agents: ["tester", "reviewer", "security-auditor"]
      config:
        tasks:
          - id: "testing"
            agent: "tester"
            prompt: |
              Implement and run tests:
              1. Unit tests for transformations
              2. Integration tests for processing
              3. System tests for impact
              Generate test_report.json

          - id: "code_review"
            agent: "reviewer"
            prompt: |
              Review implementation:
              1. Code quality checks
              2. Pattern compliance
              3. Documentation completeness
              Generate review_report.json

          - id: "security_audit"
            agent: "security-auditor"
            prompt: |
              Security audit:
              1. Vulnerability scanning
              2. Dependency analysis
              3. Access control verification
              Generate security_report.json

      success_criteria:
        - tests_passing: true
        - code_quality_score: ">= 8.0"
        - security_score: ">= 9.0"

    # Phase 5: Completion
    - name: "completion_phase"
      type: "sequential"
      depends_on: ["refinement_phase"]
      agents: ["coordinator", "memory-specialist"]
      config:
        tasks:
          - id: "final_integration"
            agent: "coordinator"
            prompt: |
              Finalize integration:
              1. Move content to target locations
              2. Update configurations
              3. Archive originals
              4. Trigger dependent workflows
              Generate completion_report.json

          - id: "knowledge_capture"
            agent: "memory-specialist"
            prompt: |
              Capture learnings:
              1. Store integration patterns
              2. Train neural models
              3. Document lessons learned
              4. Update runbooks
              Generate knowledge_report.json

      success_criteria:
        - integration_complete: true
        - knowledge_stored: true
        - documentation_updated: true

  error_handling:
    on_failure:
      - rollback_changes: true
      - notify_admin: true
      - store_failure_pattern: true

    retry_strategy:
      max_attempts: 3
      backoff: "exponential"

  monitoring:
    metrics:
      - phase_duration
      - success_rate
      - error_count
      - quality_score

    alerts:
      - condition: "phase_duration > threshold"
        action: "notify_admin"
      - condition: "error_count > 3"
        action: "pause_workflow"

---

## CLI Invocation

### Create Workflow
```bash
npx @archon-os/cli@latest workflow create \
  --name "ingestion-sparc-processor" \
  --from-file "docs/workflows/ingestion-sparc-workflow.md"
```

### Execute Workflow
```bash
npx @archon-os/cli@latest workflow execute \
  --workflow-id "ingestion-sparc-processor" \
  --variables '{
    "ingestion_path": "/path/to/ingestion",
    "content_type": "mixed",
    "target_domain": "apps",
    "priority": "high",
    "validation_level": "deep"
  }'
```

### Monitor Workflow
```bash
# Check status
npx @archon-os/cli@latest workflow status \
  --workflow-id "ingestion-sparc-processor" \
  --verbose

# View metrics
npx @archon-os/cli@latest workflow metrics \
  --workflow-id "ingestion-sparc-processor"
```

---

## Integration with Claude Code

### Swarm Execution Pattern

When user requests ingestion processing, Claude Code should:

```javascript
// Step 1: Initialize swarm with anti-drift config
Bash("npx @archon-os/cli@latest swarm init --topology hierarchical-mesh --max-agents 10")

// Step 2: Execute SPARC workflow
Bash(`npx @archon-os/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '{"ingestion_path": "${path}", "priority": "high"}'`)

// Step 3: Spawn agents in parallel (background)
Task({
  prompt: "Execute specification phase for ingestion processing",
  subagent_type: "researcher",
  run_in_background: true
})
Task({
  prompt: "Design architecture for ingestion integration",
  subagent_type: "system-architect",
  run_in_background: true
})
// ... more agents

// Step 4: Tell user and wait
// "I've launched 5 agents working on SPARC phases. They'll report back when done."
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Processing Time | < 10 min | End-to-end workflow duration |
| Success Rate | > 95% | Successful completions / attempts |
| Quality Score | > 8.0 | Code quality + security + tests |
| Integration Accuracy | > 98% | Correct placements / total files |
| Rollback Success | 100% | Successful rollbacks / failures |

---

## Continuous Improvement

After each workflow execution:

1. **Store Pattern**
   ```bash
   npx @archon-os/cli@latest memory store \
     --key "sparc-ingestion-$(date +%s)" \
     --value "$(cat completion_report.json)" \
     --namespace workflow_patterns
   ```

2. **Train Neural Model**
   ```bash
   npx @archon-os/cli@latest neural train \
     --pattern-type sparc_workflow \
     --data completion_report.json
   ```

3. **Update Workflow**
   - Review failure patterns
   - Optimize slow phases
   - Enhance validation checks
   - Update documentation

---

## Related Workflows

- `code-consolidation-workflow` - For code merging
- `security-audit-workflow` - For security validation
- `docker-orchestration-workflow` - For container integration
- `config-merge-workflow` - For configuration handling

---

## Support

For issues or enhancements:
- GitHub: https://github.com/ruvnet/archon-os/issues
- Documentation: `.archon-os/CAPABILITIES.md`
- Memory Search: `npx @archon-os/cli@latest memory search --query "sparc workflow"`
