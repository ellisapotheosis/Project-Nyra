# Bootstraps Ingestion (Nyra)

Use `nyra-infra/scripts/run-bootstrap-ingest.ps1` after placing ZIPs and folders under `INGEST_INPUT`. The pipeline inventories, deduplicates, extracts step lists, and prepares clean JSON artifacts for downstream chunking into Qdrant/Neo4j (next step).

- Input: zipped or unzipped folders with READMEs, scripts, configs.
- Output: `ingest_output/inventory.json`, `ingest_output/clean/*.json`

Integrations:
- Expose ingestion controls via MetaMCP (planned) and Nyra Stack dashboard for GUI runs.
