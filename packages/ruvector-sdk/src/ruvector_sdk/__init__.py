"""Ruvector SDK for Python

A high-performance client library for Ruvector distributed vector database.
"""

from .client import RuvectorClient
from .models import (
    Vector,
    SearchResult,
    Collection,
    IndexConfig,
    DistanceMetric,
)
from .embeddings import EmbeddingGenerator, OpenAIEmbeddings, SentenceTransformerEmbeddings

__version__ = "0.1.0"

__all__ = [
    "RuvectorClient",
    "Vector",
    "SearchResult",
    "Collection",
    "IndexConfig",
    "DistanceMetric",
    "EmbeddingGenerator",
    "OpenAIEmbeddings",
    "SentenceTransformerEmbeddings",
]
