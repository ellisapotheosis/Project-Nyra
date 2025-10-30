Project-Nyra/

├─ nyra-metamcp/                 # CENTRAL MCP PROXY (yours)

├─ nyra-core/                    # Shared libs

├─ nyra-orchestration/           # Native agent frameworks (as you outlined)

├─ nyra-memory/                  # Vector/graph/relational stores (yours)

├─ nyra-mcp/                     # General MCP servers (yours)

├─ nyra-ingestion/               # ⬅️ NEW: all ingestion \& cleaning lives here

│  ├─ pipelines/                 # Declarative pipeline specs (YAML)

│  │  ├─ pdf-clean-index.yaml

│  │  ├─ web-crawl.yaml

│  │  └─ knowledge-pack-\*.yaml

│  ├─ loaders/                   # Source adapters (fs, s3, web, git, gdrive)

│  ├─ normalizers/               # Text cleanup, OCR postproc, dedupe

│  ├─ parsers/                   # PDF, docx, html, markdown segmenters

│  ├─ chunkers/                  # semantic/recursive chunkers

│  ├─ embeddings/                # model bindings (OpenAI, local, etc.)

│  ├─ routers/                   # where to send (qdrant, postgres, neo4j)

│  ├─ mappers/                   # schema mapping \& metadata

│  ├─ workers/                   # async executors (rq/celery/bullmq)

│  ├─ api/                       # optional REST/gRPC for triggering jobs

│  ├─ cli/                       # single UX: nyra-ingest.(ps1|py|js)

│  ├─ config/

│  │  ├─ defaults.yaml

│  │  ├─ routes.yaml             # e.g., “pdf→clean→chunk→embed→qdrant”

│  │  └─ sources.yaml            # named sources w/ auth refs

│  ├─ tests/

│  ├─ docker/

│  │  ├─ Dockerfile

│  │  └─ README.md

│  └─ README.md

├─ config/                       # Global configs (yours)

│  ├─ environments/

│  └─ global/

├─ infra/

│  ├─ docker-compose.yml         # ⬅️ CANONICAL (as you’re doing)

│  ├─ compose.override.yml

│  ├─ profiles/

│  │  ├─ mcp.yml                 # (optional) split, if you like

│  │  └─ monitoring.yml

│  └─ metamcp/                   # MCP configs you’re consolidating

├─ scripts/

└─ docs/



