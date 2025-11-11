# Nyra Ingestion

Unified document cleaning → chunking → embedding → upsert pipelines.

## Layout
- `config/storage/` — profiles describing where outputs land (qdrant/neo4j/postgres).
- `pipelines/` — declarative pipeline definitions.
- `cleaners/` — Python text cleaning utilities.
- `scripts/ingest.ps1` — Windows runner.
- `scripts/ingest.py` — Python entrypoint.

## Quick Start
```powershell
# from repo root
python -m venv .venv && . .venv/Scripts/Activate.ps1
pip install -r ingestion/requirements.txt

# dry run with default pipeline to qdrant
./ingestion/scripts/ingest.ps1 -Profile default -Target qdrant -Input ./docs
```
