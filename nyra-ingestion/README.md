# Nyra Ingestion

A single home for document cleaning and ingestion pipelines. Place your cleaners, loaders, and pipeline configs here.

## Layout
- `cleaners/` — text/markdown/pdf/html cleaners
- `loaders/` — filesystem/web/gdrive loaders
- `pipelines/` — end-to-end pipeline yamls and orchestration notes
- `configs/` — shared settings (paths, batching, chunking)
- `docker/` — optional containerization for batch runs

## Quick start
1. Copy `.env.example` to `.env` and adjust paths.
2. Run a sample pipeline: `python pipelines/sample_pipeline.py`

## Why here?
Everything was previously scattered. This folder is now the one true entrypoint for ingestion.
