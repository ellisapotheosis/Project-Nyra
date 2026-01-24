# Storage Module

The **storage** module defines a consistent interface for persistent data within Project Nyra.  While
the `memory` module focuses on context and temporal recall, storage concerns itself with durable
records: documents, code repositories, conversation logs and any other artefacts that need to be
retained beyond a single session.

## Goals

* **Abstract away back‑end specifics:** Provide a unified API so that the rest of Nyra can
  interact with storage without worrying about whether data lives in PostgreSQL, an object store
  or a vector database.
* **Support multiple storage back‑ends:** Out of the box we support Postgres for relational
  data, S3‑compatible object storage for binary artefacts and the vector database used by
  the memory system (e.g. Qdrant) for embeddings.  Additional adapters can be added in
  subdirectories.
* **Enable easy testing and local development:** Default to lightweight, local storage
  implementations when no environment variables are provided.

## Directory Layout

| Path | Description |
| --- | --- |
| `adapters/` | Individual storage adapters implementing a common interface (`BaseStorageAdapter`).  Each adapter (e.g. `postgres`, `s3`, `filesystem`) must implement methods such as `save_document`, `get_document` and `list_documents`. |
| `models/` | Pydantic (or dataclass) definitions of domain objects stored in Nyra (e.g. `Document`, `AgentLog`). |
| `config.py` | Central configuration that loads connection strings from the environment and instantiates the appropriate adapters. |
| `README.md` | This file. |

## Quick Example

```python
from storage.config import get_storage

storage = get_storage()

# Save a document
doc_id = storage.save_document(title="Onboarding Guide", content="... markdown ...")

# Retrieve it later
doc = storage.get_document(doc_id)

# List all documents
for doc in storage.list_documents():
    print(doc.title)
```

## Adding a New Adapter

1. Create a new subpackage in `adapters/` with a class that inherits from `BaseStorageAdapter`.
2. Implement the required CRUD methods.
3. Update `config.py` to return your adapter when the appropriate environment variable (e.g.
   `STORAGE_BACKEND=mybackend`) is set.
4. Write tests to validate your adapter against the abstract base class.

## TODO

* Migrate existing storage implementations from `nyra-orchestration/archon/python/src/server/services/storage/` into this module.
* Provide S3 and filesystem adapters in addition to Postgres.
* Add migrations and schema management via Alembic or Prisma (depending on language).
