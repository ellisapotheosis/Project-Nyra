# ADR-008: Template Vault

* **Status**: Accepted
* **Date**: 2026-05-31
* **Author**: Nyra Dev
* **Decisions**: Root-level `templates/` is the approved repository location for archived UI templates, Vercel exports, v0 references, screenshots, and template metadata.

## Context

Project Nyra has accumulated useful generated UI surfaces across Vercel, v0, and prior app rebuild work. These templates need to remain available for app-surface recovery, design comparison, and future consolidation work without being mixed into runtime apps under `apps/` or historical material under `docs/archive/`.

The repo policy blocks new top-level directories until they have an owning decision record. The template vault is intentionally a root-level reference surface because it is a reusable source library, not a deployed application, infrastructure service, or documentation-only archive.

## Decision

Create and approve `templates/` at the repository root for reusable template assets. Template contents may include source exports, preview builds, screenshots, metadata, and implementation notes as long as they remain non-runtime reference material.

Runtime app code remains under `apps/`. Production infrastructure remains under `infra/hosts/<host>/`. Secrets must not be committed in template examples; example files must use placeholders only.

## Consequences

* **Positive**:
    - Preserves useful Vercel and v0 template work in a discoverable location.
    - Separates reusable templates from deployable app surfaces.
    - Gives future app cleanup and UI consolidation work a stable source library.
* **Negative**:
    - Increases repository size because template previews can include generated source trees, lockfiles, and screenshots.
* **Neutral**:
    - Template assets are not authoritative runtime code until explicitly promoted into `apps/` through a reviewed change.

## Compliance & Security

Template examples must not contain live credentials, tokens, lead data, borrower data, or production configuration. Secret scans remain required before committing template imports. Any mortgage workflow examples must be treated as illustrative until implemented in compliant runtime code backed by Twenty CRM and the deterministic quote engine.
