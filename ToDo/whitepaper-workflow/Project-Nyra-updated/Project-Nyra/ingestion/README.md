# Ingestion Pipelines

The **ingestion** module provides reusable pipelines for bringing external data into Nyra.
Ingestion is responsible for discovering, fetching and normalizing data before it is stored in
`storage/` and made available to the memory systems.  Typical sources include Markdown
documentation, API responses, code repositories and chat logs.

## Philosophy

* **Composable stages:** Each pipeline is composed of stages—fetch, parse, transform and persist.
  Stages are implemented as Python callables or scripts that operate on a stream of `Document`
  objects.
* **Declarative definitions:** Pipelines can be declared via simple configuration files (`.yaml` or
  `.json`) specifying sources and transformations.  See `example_pipeline.py` for a programmatic
  example.
* **Idempotency and incremental updates:** Pipelines track source checksums to avoid re‑ingesting
  unchanged data.  This is critical for large document sets.

## Directory Structure

| Path | Description |
| --- | --- |
| `pipelines/` | Individual ingestion pipelines.  Each pipeline lives in its own subdirectory and exports a `run_pipeline()` function. |
| `utils/` | Shared helper functions for fetching files, parsing formats (Markdown, PDF, HTML) and interacting with the storage module. |
| `example_pipeline.py` | A simple demonstration of how to implement a pipeline in Python. |
| `README.md` | This file. |

## Running a Pipeline

Activate your Python environment and run a pipeline module directly:

```bash
cd ingestion
python -m pipelines.my_pipeline
```

Alternatively, define a configuration file and write a small runner that loads the
configuration and invokes the appropriate stages.

## Example

The provided [`example_pipeline.py`](example_pipeline.py) shows how to ingest Markdown files
from a local directory:

```bash
python -m ingestion.example_pipeline --source ./docs --storage_backend postgres
```

## Adding a New Pipeline

1. Create a new directory under `pipelines/` with a descriptive name.
2. Implement a `run_pipeline()` function that yields `Document` objects and persists them via
   the storage API.
3. Add any helper functions in `utils/` if needed.
4. Document your pipeline with a `README.md` explaining the source and any configuration
   parameters.

## TODO

* Port existing ingestion scripts from `nyra-scripts/repo-misc-files` into this unified
  framework.
* Add support for crawling websites and ingesting API responses.
* Integrate checksum tracking for incremental ingestion.
