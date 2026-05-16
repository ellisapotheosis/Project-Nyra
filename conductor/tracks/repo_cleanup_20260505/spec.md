# Specification: Repo truth, docs cleanup, and webapp API standardization

## Overview

This track focuses on stabilizing the project repository by resolving documentation conflicts and standardizing the API client layer in the webapp. It aims to align the repository state with the "Ultimate Finish-Line Master Document" and establish a solid foundation for further feature development.

## Objectives

- **P0.1: Repo Truth and Docs Cleanup:**
  - Resolve all merge conflict markers in root documents (`AGENTS.md`, `README.md`, `GEMINI.md`, etc.).
  - Update architecture and execution plans to reflect the current host-specific structure and app merge strategy.
  - Standardize repo-wide metadata and remove stale historical proposals.
- **P0.2: Webapp API Client Layer Standardization:**
  - Standardize environment variable names (`CRM_API_URL`, `CRM_API_KEY`, etc.).
  - Implement a typed API client layer in `apps/projectnyra/lib/api/`.
  - Replace scattered raw `fetch` calls with these typed helpers.
  - Add standardized loading, error, and empty states.

## Success Criteria

- No merge conflict markers remain in the repository.
- Architecture docs accurately reflect the `/infra/hosts/` structure.
- Webapp successfully builds with the new typed API client layer.
- All core services (CRM, Campaigns, Quotes) have basic typed client support in the webapp.
