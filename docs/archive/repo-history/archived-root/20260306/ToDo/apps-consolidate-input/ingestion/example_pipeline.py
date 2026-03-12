"""Example ingestion pipeline for Project Nyra.

This script demonstrates a simple ingestion flow that reads Markdown files from a specified
directory, converts them into `Document` objects and persists them via the storage API.  It is
intended as a starting point; real pipelines should handle errors, large files, incremental
updates and more complex transformations.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
from typing import Iterator, Iterable

from dataclasses import dataclass


@dataclass
class Document:
    """Simple document model used for ingestion."""
    title: str
    content: str
    path: str


def iter_markdown_files(source_dir: Path) -> Iterator[Document]:
    """Yield `Document` objects for each Markdown file in a directory."""
    for path in source_dir.rglob("*.md"):
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        yield Document(title=path.stem, content=content, path=str(path))


def persist_documents(docs: Iterable[Document], storage_backend: str) -> None:
    """Persist documents using the configured storage backend.

    This function dynamically imports the storage configuration and saves each document.  The
    `storage_backend` parameter selects which adapter should be used (e.g. "postgres", "s3").
    """
    # Lazy import to avoid pulling in storage dependencies when not needed
    from storage.config import get_storage

    storage = get_storage(backend_override=storage_backend)
    for doc in docs:
        storage.save_document(title=doc.title, content=doc.content, metadata={"source_path": doc.path})


def run(source: str, storage_backend: str) -> None:
    source_dir = Path(source).expanduser().resolve()
    if not source_dir.is_dir():
        raise SystemExit(f"Source directory {source_dir} does not exist or is not a directory")

    documents = list(iter_markdown_files(source_dir))
    print(f"Found {len(documents)} markdown files to ingest from {source_dir}")
    persist_documents(documents, storage_backend)
    print("Ingestion complete!")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest markdown documents into Nyra storage")
    parser.add_argument("source", help="Path to directory containing markdown files")
    parser.add_argument(
        "--storage-backend",
        default="postgres",
        help="Which storage backend to use (default: postgres)",
    )
    args = parser.parse_args()
    run(args.source, args.storage_backend)


if __name__ == "__main__":
    main()