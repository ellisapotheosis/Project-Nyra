# RAG_INGESTION_PLAN.md

## Overview
Project Nyra maintains a categorized archive in `docs/archive/` to serve as a knowledge base for RAG (Retrieval-Augmented Generation) systems. This document defines the plan for ingesting these materials into the AI cluster's memory layer.

## 1. Ingestion Strategy
1. **Source**: All files in `docs/` and `docs/archive/`.
2. **Target**: **mem0** (Person-centric context) and **FalkorDB** (Architectural relationships).
3. **Chunking**: Use semantic chunking with a 500-token overlap to preserve technical context.

## 2. Document Priority
- **High**: Root `docs/*.md` (Current architectural truth).
- **Medium**: `docs/ops/*.md` and `docs/integrations/*.md` (Operational procedures).
- **Historical**: `docs/archive/**/*` (Used for "Why was this decided?" queries).

## 3. Metadata Mapping
Every archived document should be tagged with:
- `status`: `deprecated` or `historical`.
- `phase`: `foundation_pass_2026_05`.
- `layer`: `non-ui` or `infrastructure`.

## 4. Automated Refresh
The `LeadIngestionPipeline` and `Letta` should periodically re-index the `docs/` folder to ensure the "Brain" of the system is always aware of the latest architectural guardrails.
