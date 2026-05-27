# RAG_ANYTHING_ARCHIVE_STAGING.md

## Overview

This document defines the staging area for documents that have been archived or superseded. These materials are preserved to serve as a knowledge base for "RAG-Anything" (Retrieval-Augmented Generation) ingestions.

## Archive Structure

Location: `docs/archive/`

### 1. `foundation_pass_20260511/`

Contains documents consolidated during the May 2026 foundation pass.

- `archived_docs/`: Old ports registries, inventory matrices, and stack overviews.

### 2. `legacy_prompts/`

Contains outdated system prompts and agent instructions.

### 3. `obsolete_infra/`

Contains deprecated Docker Compose files and deployment scripts (e.g., retired orchestration tooling, the approved vector memory backend).

## Ingestion Rules

- **Metadata**: Every file in the archive should be treated as "Historical/Deprecated" by RAG systems.
- **Priority**: Documents in the root `docs/` folder have precedence over archived materials.
- **Cleaning**: Do not delete files from the archive without manual review; they provide context on past architectural decisions.
