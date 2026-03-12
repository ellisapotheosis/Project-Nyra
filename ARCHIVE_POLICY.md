# Archive Policy

Project Nyra defaults to **archive, never delete** during consolidation.

## Canonical Archive Location
Use only:

`docs/archive/repo-history/`

Legacy root archive paths (`archive/`, `_archived/`, `scripts/_archive/`) are deprecated and must not be reintroduced.

## Archive (default)
Archive files/directories when any of the following apply:
- Duplicate scaffold or legacy implementation exists.
- Ownership/status is unclear.
- Superseded compose files or scripts are still useful for reference.
- Historical docs or migration notes may still be operationally useful.

Archived material is moved to:

`docs/archive/repo-history/archive-root/YYYYMMDD/`

Path-preserving subfolders are preferred where practical.

## Delete (exception-only)
Deletion is allowed only when all are true:
- File is generated output (`node_modules`, caches, build artifacts).
- Content is reproducible from source.
- It is not referenced by CI, docs, scripts, or Make targets.

## Indexing Requirement
Every move into archive must be listed in:

`docs/archive/repo-history/archive-root/INDEX.md`

using:

`old/path -> new/path`

This keeps future extraction and rollback straightforward.
