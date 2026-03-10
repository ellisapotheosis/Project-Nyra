# SPARC Workflow and Roadmap

This document outlines the SPARC (Specification, Pseudocode, Architecture,
Refinement, Completion) workflow for building the AI‑Augmented CRM using the
Nyra framework.  It provides a structured roadmap with deliverables for each
stage and helps coordinate the development of features, tests and deployment.

## SPARC phases

### Specification

* Gather requirements and constraints from stakeholders.  See
  `01_SYSTEM_WHITEPAPER.md` for high‑level goals and `03_DATA_MODEL.md` for
  database design.  Identify user stories (e.g., lead enrichment, next
  action suggestions, Q&A interface) and define acceptance criteria for
  each story.
* Decide on the base architecture: a single Postgres cluster with separate
  databases (`twenty` and `nyra_ai`), unified path root `/opt/repos/project-nyra`,
  and containerized services.  Document non‑functional requirements such as
  performance, scalability, security and maintainability.

### Pseudocode

* Translate the requirements into high‑level pseudocode covering all
  workflows.  Pseudocode should describe how to:
  - Trigger AI enrichment when a lead is created.
  - Query memory to suggest next best actions for deals.
  - Handle Q&A queries through a chat interface.
  - Process lost deal analysis and feed it back into memory.
* Ensure the pseudocode describes error handling, fallback behaviour, and
  interactions with the memory store and external APIs.  Use functions
  like `generateSuggestions`, `answerQuery`, and `enrichLead` to structure
  logic.

### Architecture

* Convert pseudocode into concrete architecture.  Define modules such as
  `AIService`, `MemoryManager`, `WorkflowEngine`, `ExternalFetch`, and UI
  components.  Specify database schemas, message queues, and network
  boundaries.  See `02_ARCHITECTURE_TOP_TO_BOTTOM.md` for details.
* Define environment variables (e.g., `NYRA_REPO_ROOT`, `NYRA_LOG_DIR`,
  `ANTHROPIC_API_KEY`) and configuration files.  Document how to start
  services on orchestrator and workers.  Provide container orchestration
  instructions.

### Refinement

* Implement code and tests iteratively.  Use Test‑Driven Development:
  - Write unit tests for each module before implementing it.
  - Write integration tests for workflows (lead ingestion → AI suggestion
    generation → CRM update).
  - Mock external API calls (LLM, lead vendors) to ensure reproducible tests.
* Review and refactor code to meet performance targets.  Adjust memory
  indexing parameters and query limits.  Incorporate feedback from
  developers and testers.
* Update documentation (e.g., `06_RUNBOOK.md`, `07_INTEGRATIONS_MATRIX.md`,
  `08_THREAT_MODEL.md`) as the system evolves.

### Completion

* Finalize code implementation.  All modules should be production‑ready
  with thorough error handling, logging and metrics.  All tests must pass
  with coverage above 90 percent.
* Build Docker images and update `infra` compose files.  Provide a single
  bootstrap script to configure orchestrator and workers (`scripts/bootstrap`).
* Perform user acceptance testing.  Gather feedback from agents and
  mortgage brokers using the system.  Tweak AI prompts, memory retention
  policies and UI behaviours based on real‑world usage.
* Prepare a release package, including updated documentation and deployment
  guides.  Conduct a post‑mortem for any major issues discovered during
  deployment.

## Suggested timeline

| Week | Milestone |
|------|-----------|
| **1** | Finalize specification and pseudocode.  Set up development environment and repository structure. |
| **2–3** | Implement AIService skeleton, MemoryManager and unit tests.  Integrate RuVector and basic vector search. |
| **4** | Develop lead ingestion and CRM integration.  Begin building AI assistant UI components. |
| **5** | Implement workflow triggers in n8n/Activepieces.  Connect LiteLLM router and memory store. |
| **6** | Complete UI integration, including chat widget and suggestion panels.  Optimize performance and memory usage. |
| **7** | Write runbook, integrations matrix and threat model.  Deploy to staging and test backup/restore. |
| **8** | Conduct UAT, iterate on feedback, prepare production release. |

This schedule is illustrative; actual timelines may vary based on team size
and complexity.  Use this document as a checklist to ensure all SPARC
stages are addressed.