# Ruvector SDK for Python

High-performance Python client for [Ruvector](https://github.com/ruvector/ruvector) distributed vector database.

## Features

- Async/await support with httpx
- Connection pooling and automatic retries
- Batch operations for high throughput
- Type-safe with Pydantic models
- Embedding generation helpers (OpenAI, Sentence Transformers, HuggingFace)
- HNSW index configuration
- Cluster status monitoring

## Installation

```bash
# Basic installation
pip install ruvector-sdk

# With embedding support
pip install ruvector-sdk[embeddings]

# Development installation
pip install -e ".[dev,embeddings]"
```

## Quick Start

```python
import asyncio
from ruvector_sdk import RuvectorClient, Vector, DistanceMetric

async def main():
    # Connect to Ruvector
    async with RuvectorClient(host="localhost", port=6370) as client:
        # Create collection
        collection = await client.create_collection(
            name="documents",
            dimension=384,
            distance_metric=DistanceMetric.COSINE,
        )
        print(f"Created collection: {collection.name}")
        
        # Insert vectors
        vectors = [
            Vector(
                id="doc1",
                vector=[0.1] * 384,
                metadata={"title": "Document 1", "category": "mortgage"}
            ),
            Vector(
                id="doc2",
                vector=[0.2] * 384,
                metadata={"title": "Document 2", "category": "refinance"}
            ),
        ]
        
        count = await client.upsert("documents", vectors)
        print(f"Inserted {count} vectors")
        
        # Search
        query_vector = [0.15] * 384
        results = await client.search(
            collection="documents",
            query_vector=query_vector,
            top_k=5,
        )
        
        for result in results:
            print(f"ID: {result.id}, Score: {result.score}, Metadata: {result.metadata}")

asyncio.run(main())
```

## Usage Examples

### Creating Collections

```python
from ruvector_sdk import RuvectorClient, DistanceMetric, IndexType, IndexConfig

async with RuvectorClient() as client:
    # Basic collection
    await client.create_collection(
        name="my_collection",
        dimension=768,
    )
    
    # With HNSW index
    await client.create_collection(
        name="optimized_collection",
        dimension=1536,
        distance_metric=DistanceMetric.COSINE,
        index_type=IndexType.HNSW,
        index_config=IndexConfig(
            m=32,
            ef_construction=200,
            ef_search=100,
        ),
    )
```

### Batch Operations

```python
# Batch insert
vectors = [Vector(id=f"vec{i}", vector=[0.1] * 384) for i in range(10000)]
count = await client.upsert("my_collection", vectors, batch_size=1000)
```

### Filtering by Metadata

```python
results = await client.search(
    collection="documents",
    query_vector=query,
    top_k=10,
    filter={"category": "mortgage", "year": 2025},
)
```

### Embedding Generation

```python
from ruvector_sdk import SentenceTransformerEmbeddings, Vector

# Initialize embedding generator
embedder = SentenceTransformerEmbeddings("all-MiniLM-L6-v2")

# Generate embeddings
texts = [
    "What is the interest rate for a 30-year mortgage?",
    "How much down payment do I need?",
]

embeddings = embedder.embed(texts)

# Create vectors
vectors = [
    Vector(id=f"q{i}", vector=emb, metadata={"text": text})
    for i, (text, emb) in enumerate(zip(texts, embeddings))
]

# Insert
await client.upsert("questions", vectors)
```

### Using OpenAI Embeddings

```python
from ruvector_sdk import OpenAIEmbeddings

embedder = OpenAIEmbeddings(api_key="sk-...")

# Single text
embedding = embedder.embed("Hello world")

# Batch
embeddings = embedder.embed(["Hello", "World", "Foo", "Bar"])
```

### Semantic Search Example

```python
from ruvector_sdk import RuvectorClient, SentenceTransformerEmbeddings, Vector

async def semantic_search(query: str):
    embedder = SentenceTransformerEmbeddings()
    
    async with RuvectorClient() as client:
        # Generate query embedding
        query_vector = embedder.embed(query)
        
        # Search
        results = await client.search(
            collection="knowledge_base",
            query_vector=query_vector,
            top_k=5,
            include_vectors=False,
        )
        
        return [(r.metadata["text"], r.score) for r in results]

# Usage
results = await semantic_search("How do I get pre-approved for a mortgage?")
for text, score in results:
    print(f"Score: {score:.3f} | {text}")
```

### Cluster Monitoring

```python
# Check cluster status
status = await client.cluster_status()
print(f"Leader: {status.leader}")
print(f"Followers: {status.followers}")
print(f"Total vectors: {status.total_vectors}")

# Health check
is_healthy = await client.health_check()
```

## API Reference

### RuvectorClient

**Initialization:**
```python
client = RuvectorClient(
    host="localhost",
    port=6370,
    timeout=30.0,
    max_retries=3,
)
```

**Methods:**

| Method | Description |
|--------|-------------|
| `create_collection()` | Create a new vector collection |
| `get_collection()` | Get collection metadata |
| `list_collections()` | List all collections |
| `delete_collection()` | Delete a collection |
| `upsert()` | Insert or update vectors |
| `get_vector()` | Get a vector by ID |
| `delete_vector()` | Delete a vector by ID |
| `search()` | Search for similar vectors |
| `count_vectors()` | Count vectors in collection |
| `scroll()` | Paginate through vectors |
| `cluster_status()` | Get cluster status |
| `health_check()` | Check if service is healthy |

### Embedding Generators

**SentenceTransformerEmbeddings:**
```python
embedder = SentenceTransformerEmbeddings(
    model_name="all-MiniLM-L6-v2"  # 384-dim, fast
)
```

**OpenAIEmbeddings:**
```python
embedder = OpenAIEmbeddings(
    api_key="sk-...",
    model="text-embedding-ada-002"  # 1536-dim
)
```

**HuggingFaceEmbeddings:**
```python
embedder = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)
```

## Performance Tips

1. **Batch Operations**: Use batch operations for bulk inserts
   ```python
   await client.upsert(collection, vectors, batch_size=1000)
   ```

2. **Connection Pooling**: Reuse client instances
   ```python
   async with RuvectorClient() as client:
       # All operations here reuse connections
   ```

3. **HNSW Configuration**: Tune index parameters for your use case
   - Higher `m` = better recall, more memory
   - Higher `ef_construction` = better index quality, slower build
   - Higher `ef_search` = better recall, slower search

4. **Metadata Filtering**: Use indexed fields for better performance

## Error Handling

```python
from httpx import HTTPError
from ruvector_sdk import RuvectorClient

async with RuvectorClient() as client:
    try:
        await client.create_collection("test", dimension=384)
    except HTTPError as e:
        print(f"HTTP error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
```

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=ruvector_sdk --cov-report=html

# Async tests require pytest-asyncio
pip install pytest-asyncio
```

## Development

```bash
# Install dev dependencies
pip install -e ".[dev,embeddings]"

# Format code
black src/ruvector_sdk

# Type checking
mypy src/ruvector_sdk

# Linting
ruff check src/ruvector_sdk
```

## License

MIT License

## Links

- [Ruvector GitHub](https://github.com/ruvector/ruvector)
- [Documentation](https://docs.ruvector.io)
- [Issues](https://github.com/nyra/ruvector-sdk/issues)
