# Mem0 REST - Memory API & Embedchain Integration Service

## 🎯 SERVICE CONTEXT

**Purpose**: Python-based REST API service providing HTTP endpoints for memory operations and Embedchain integration, enabling external systems to leverage Mem0 memory with semantic retrieval chains and document processing.

**Port**: 3180
**Language**: Python 3.10+ with FastAPI
**Framework**: FastAPI + Uvicorn + Embedchain
**Dependencies**: fastapi, uvicorn, mem0, embedchain, ruvector, pydantic, httpx, python-dotenv
**Template**: CLAUDE-MD-Python.md (ring topology for distributed memory coordination)

## 🚨 CRITICAL DEVELOPMENT RULES

### REST API Development Pattern
**MANDATORY**: All endpoints, schemas, and integrations MUST be developed in parallel:

```python
# ✅ CORRECT: Batch development in ONE message
[Single Message]:
  # FastAPI application
  - Write("src/main.py", fastApiApp)
  - Write("src/schemas.py", pydantic_models)

  # REST endpoints
  - Write("src/routes/memories.py", memoryEndpoints)
  - Write("src/routes/search.py", searchEndpoints)
  - Write("src/routes/documents.py", documentEndpoints)
  - Write("src/routes/chains.py", embeddainChainEndpoints)

  # Core services
  - Write("src/services/memory_service.py", memoryOperations)
  - Write("src/services/embedchain_service.py", embeddainIntegration)
  - Write("src/services/retrieval_service.py", retrievalChains)

  # Integration
  - Write("src/integrations/mem0.py", mem0Client)
  - Write("src/integrations/ruvector.py", vectorSearch)

  # Middleware and utilities
  - Write("src/middleware/auth.py", authentication)
  - Write("src/utils/embeddings.py", embeddingFunctions)

  # Tests
  - Write("tests/test_api.py", apiTests)
  - Bash("pytest tests/")
```

### REST API Design Rules
**CRITICAL**: All endpoints MUST follow RESTful principles with proper status codes:

- **Resource-Oriented**: URLs represent resources (memories, documents, chains)
- **Standard Methods**: GET (retrieve), POST (create), PUT (update), DELETE (remove)
- **Status Codes**: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error
- **Error Responses**: Consistent error format with error code and message
- **Pagination**: Limit/offset for all list endpoints
- **Versioning**: API versioned as /v1/, /v2/
- **Authentication**: JWT token-based access control
- **CORS**: Secure cross-origin resource sharing

## 📊 MEM0 REST API ARCHITECTURE

### API Routes Structure
```
/v1/api/
├── /memories
│   ├── GET    / - List user memories
│   ├── POST   / - Create memory
│   ├── GET    /{id} - Get memory
│   ├── PUT    /{id} - Update memory
│   ├── DELETE /{id} - Delete memory
│   └── POST   /search - Semantic search
│
├── /documents
│   ├── GET    / - List documents
│   ├── POST   / - Upload document
│   ├── GET    /{id} - Get document
│   ├── DELETE /{id} - Delete document
│   └── POST   /{id}/chunk - Extract chunks
│
├── /chains
│   ├── GET    / - List retrieval chains
│   ├── POST   / - Create chain
│   ├── GET    /{id} - Get chain
│   ├── DELETE /{id} - Delete chain
│   └── POST   /{id}/execute - Execute chain
│
├── /retrieval
│   ├── POST   / - Execute retrieval
│   └── POST   /with-context - Retrieval with context
│
└── /stats
    └── GET    / - Get user statistics
```

### Embedchain Integration Architecture
```
Document Input
    ↓
Text Extraction & Preprocessing
    ↓
Chunking (configurable size/overlap)
    ↓
Normalization (clean text)
    ↓
Embedding Generation (semantic vectors)
    ↓
Vector Storage (ruvector + HNSW)
    ↓
Retrieval Chain Setup
    ↓
Query Processing → Retrieval → Context Assembly → LLM Response
```

## 🐝 MEM0 REST SWARM

### Agent Configuration
```yaml
topology: ring  # Distributed memory with peer communication
maxAgents: 8
strategy: specialized
language: python
framework: fastapi

agents:
  api_architect:
    role: REST API Design & Documentation
    focus: [openapi-spec, endpoint-design, validation-schemas]
    responsibilities:
      - Design REST endpoints
      - Create OpenAPI spec
      - Define request/response schemas
      - Handle error responses

  endpoint_developer:
    role: FastAPI Endpoint Implementation
    focus: [route-handlers, dependency-injection, middleware]
    responsibilities:
      - Implement memory endpoints
      - Implement document endpoints
      - Implement chain endpoints
      - Input validation

  embedchain_specialist:
    role: Embedchain Integration
    focus: [document-processing, chunking, chain-building]
    responsibilities:
      - Integrate Embedchain SDK
      - Implement document processing
      - Configure retrieval chains
      - Optimize chunk settings

  retrieval_engineer:
    role: Retrieval Chain & Context Management
    focus: [chain-execution, context-assembly, llm-integration]
    responsibilities:
      - Build retrieval chains
      - Execute semantic search chains
      - Assemble context windows
      - LLM integration

  document_processor:
    role: Document & Content Processing
    focus: [text-extraction, chunking, normalization]
    responsibilities:
      - Extract text from documents
      - Chunk documents optimally
      - Normalize text content
      - Handle multiple formats

  authentication_engineer:
    role: Security & Authentication
    focus: [jwt-auth, api-keys, rate-limiting]
    responsibilities:
      - Implement JWT authentication
      - API key management
      - Rate limiting per user
      - Input sanitization

  performance_engineer:
    role: Caching & Performance Optimization
    focus: [redis-caching, query-optimization, index-tuning]
    responsibilities:
      - Implement query caching
      - Optimize vector searches
      - Cache embeddings
      - Monitor performance

  test_engineer:
    role: API Testing & Integration
    focus: [pytest, fastapi-testing, integration-testing]
    responsibilities:
      - Write API tests
      - Integration tests
      - Load testing
      - Error scenario testing
```

## 🔧 PYTHON + FASTAPI PATTERNS

### FastAPI Application Setup
```python
"""
Mem0 REST API Service with Embedchain Integration
Main application file
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZIPMiddleware
from fastapi.security import HTTPBearer, HTTPAuthCredentialDetails
from contextlib import asynccontextmanager
from typing import Optional
import logging
import uvicorn

from src.routes import memories, documents, chains, retrieval, stats
from src.services.memory_service import MemoryService
from src.services.embedchain_service import EmbedchainService
from src.middleware.auth import verify_token

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global services
memory_service: Optional[MemoryService] = None
embedchain_service: Optional[EmbedchainService] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for app startup/shutdown
    """
    global memory_service, embedchain_service

    logger.info("Starting Mem0 REST API Service")

    # Initialize services
    memory_service = MemoryService()
    embedchain_service = EmbedchainService()

    # Initialize databases
    await memory_service.initialize()
    await embedchain_service.initialize()

    logger.info("Services initialized")

    yield

    # Cleanup
    logger.info("Shutting down services")
    await memory_service.cleanup()
    await embedchain_service.cleanup()


# Initialize FastAPI app
app = FastAPI(
    title="Mem0 REST API",
    description="Memory management and semantic retrieval API with Embedchain integration",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZIPMiddleware, minimum_size=1000)

# Security setup
security = HTTPBearer()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "mem0-rest",
        "version": "1.0.0"
    }


# ============================================================================
# ROUTE REGISTRATION
# ============================================================================

# Include routers with prefix
app.include_router(
    memories.router,
    prefix="/v1/api/memories",
    tags=["Memories"],
    dependencies=[Depends(security)]
)

app.include_router(
    documents.router,
    prefix="/v1/api/documents",
    tags=["Documents"],
    dependencies=[Depends(security)]
)

app.include_router(
    chains.router,
    prefix="/v1/api/chains",
    tags=["Retrieval Chains"],
    dependencies=[Depends(security)]
)

app.include_router(
    retrieval.router,
    prefix="/v1/api/retrieval",
    tags=["Retrieval"],
    dependencies=[Depends(security)]
)

app.include_router(
    stats.router,
    prefix="/v1/api/stats",
    tags=["Statistics"],
    dependencies=[Depends(security)]
)


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return {
        "error": {
            "code": exc.status_code,
            "message": exc.detail,
            "timestamp": datetime.utcnow().isoformat()
        }
    }


if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=3180,
        reload=False,
        workers=4
    )
```

### Memory Endpoints Implementation
```python
"""
Memory REST endpoints
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging

from src.services.memory_service import MemoryService

logger = logging.getLogger(__name__)
router = APIRouter()

# Global service reference
memory_service: MemoryService = None


# ============================================================================
# SCHEMAS
# ============================================================================

class MemoryCreate(BaseModel):
    """Schema for creating a memory"""
    content: str = Field(..., description="Memory content")
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Memory metadata"
    )
    ttl: Optional[int] = Field(
        default=None,
        description="Time-to-live in seconds"
    )


class MemoryUpdate(BaseModel):
    """Schema for updating a memory"""
    content: Optional[str] = Field(default=None)
    metadata: Optional[Dict[str, Any]] = Field(default=None)


class SearchRequest(BaseModel):
    """Schema for search request"""
    query: str = Field(..., description="Search query")
    top_k: int = Field(default=10, description="Number of results")
    min_confidence: float = Field(default=0.0, description="Minimum confidence")
    tags: Optional[List[str]] = Field(default=None)
    category: Optional[str] = Field(default=None)


class MemoryResponse(BaseModel):
    """Schema for memory response"""
    id: str
    content: str
    metadata: Dict[str, Any]
    embedding: Optional[List[float]]
    version: int
    created_at: datetime
    updated_at: datetime
    relevance_score: Optional[float] = None


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/", response_model=List[MemoryResponse])
async def list_memories(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    sort_by: str = Query("updated", regex="^(created|updated|relevance)$"),
    user_id: str = Depends(get_user_id)
):
    """
    List user's memories with pagination.

    Returns:
        List of memories paginated with sort options
    """
    try:
        memories = await memory_service.list_memories(
            user_id=user_id,
            limit=limit,
            offset=offset,
            sort_by=sort_by
        )

        return memories

    except Exception as e:
        logger.error(f"List memories failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list memories")


@router.post("/", response_model=MemoryResponse, status_code=201)
async def create_memory(
    memory: MemoryCreate,
    user_id: str = Depends(get_user_id)
):
    """
    Create a new memory.

    Args:
        memory: Memory data to create
        user_id: User ID (from JWT token)

    Returns:
        Created memory with ID and embedding
    """
    try:
        created = await memory_service.create_memory(
            user_id=user_id,
            content=memory.content,
            metadata=memory.metadata,
            ttl=memory.ttl
        )

        return created

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Create memory failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create memory")


@router.get("/{memory_id}", response_model=MemoryResponse)
async def get_memory(
    memory_id: str,
    user_id: str = Depends(get_user_id)
):
    """
    Get a specific memory by ID.

    Args:
        memory_id: Memory ID
        user_id: User ID (from JWT token)

    Returns:
        Memory object if found
    """
    try:
        memory = await memory_service.get_memory(memory_id, user_id)

        if not memory:
            raise HTTPException(status_code=404, detail="Memory not found")

        return memory

    except Exception as e:
        logger.error(f"Get memory failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve memory")


@router.put("/{memory_id}", response_model=MemoryResponse)
async def update_memory(
    memory_id: str,
    memory: MemoryUpdate,
    user_id: str = Depends(get_user_id)
):
    """
    Update a memory.

    Args:
        memory_id: Memory ID
        memory: Update data
        user_id: User ID (from JWT token)

    Returns:
        Updated memory with new version
    """
    try:
        updated = await memory_service.update_memory(
            memory_id=memory_id,
            user_id=user_id,
            content=memory.content,
            metadata=memory.metadata
        )

        if not updated:
            raise HTTPException(status_code=404, detail="Memory not found")

        return updated

    except Exception as e:
        logger.error(f"Update memory failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update memory")


@router.delete("/{memory_id}", status_code=204)
async def delete_memory(
    memory_id: str,
    user_id: str = Depends(get_user_id)
):
    """
    Delete a memory permanently.

    Args:
        memory_id: Memory ID to delete
        user_id: User ID (from JWT token)

    Returns:
        Empty response on success
    """
    try:
        success = await memory_service.delete_memory(memory_id, user_id)

        if not success:
            raise HTTPException(status_code=404, detail="Memory not found")

    except Exception as e:
        logger.error(f"Delete memory failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete memory")


@router.post("/search", response_model=List[MemoryResponse])
async def search_memories(
    search: SearchRequest,
    user_id: str = Depends(get_user_id)
):
    """
    Search memories using semantic search with HNSW indexing.

    Features:
        - Semantic similarity search using vector embeddings
        - 150x-12,500x faster with HNSW indexing
        - Hybrid search combining vector + full-text
        - Confidence and tag filtering

    Args:
        search: Search parameters
        user_id: User ID (from JWT token)

    Returns:
        Ranked list of matching memories with relevance scores
    """
    try:
        results = await memory_service.search_memories(
            user_id=user_id,
            query=search.query,
            top_k=search.top_k,
            min_confidence=search.min_confidence,
            tags=search.tags,
            category=search.category
        )

        return results

    except Exception as e:
        logger.error(f"Search failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Search failed")
```

### Embedchain Integration Service
```python
"""
Embedchain integration for document processing and retrieval chains
"""

from embedchain import Chain
from embedchain.embedder.base import BaseEmbedder
from embedchain.llm.base import BaseLLM
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class EmbedchainService:
    """Service for Embedchain integration with document processing"""

    def __init__(self):
        """Initialize Embedchain service"""
        self.chains: Dict[str, Chain] = {}

    async def initialize(self):
        """Initialize service"""
        logger.info("Initializing Embedchain service")

    async def cleanup(self):
        """Cleanup service"""
        for chain_id, chain in self.chains.items():
            try:
                await chain.close()
            except Exception as e:
                logger.error(f"Error closing chain {chain_id}: {str(e)}")

    async def create_retrieval_chain(
        self,
        user_id: str,
        chain_id: str,
        name: str,
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create a new retrieval chain.

        Args:
            user_id: User ID
            chain_id: Chain ID
            name: Human-readable name
            config: Chain configuration

        Returns:
            Created chain metadata
        """
        try:
            logger.info(f"Creating retrieval chain {chain_id} for user {user_id}")

            # Initialize chain with custom embeddings and LLM
            chain = Chain.get_chain_from_config(config)

            # Store chain
            self.chains[chain_id] = chain

            return {
                "id": chain_id,
                "name": name,
                "user_id": user_id,
                "created_at": datetime.utcnow().isoformat(),
                "status": "active"
            }

        except Exception as e:
            logger.error(f"Failed to create chain: {str(e)}")
            raise

    async def add_document_to_chain(
        self,
        chain_id: str,
        document_path: str,
        chunk_size: int = 512,
        chunk_overlap: int = 100
    ) -> Dict[str, Any]:
        """
        Add a document to a retrieval chain with chunking.

        Args:
            chain_id: Chain ID
            document_path: Path to document
            chunk_size: Size of text chunks
            chunk_overlap: Overlap between chunks

        Returns:
            Processing results with chunk count
        """
        try:
            if chain_id not in self.chains:
                raise ValueError(f"Chain {chain_id} not found")

            chain = self.chains[chain_id]

            # Add document with custom chunking
            result = await chain.add(
                source="file",
                path=document_path,
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap
            )

            logger.info(f"Added document to chain {chain_id}")

            return {
                "chain_id": chain_id,
                "chunks_created": result.get("chunk_count", 0),
                "tokens_used": result.get("tokens", 0)
            }

        except Exception as e:
            logger.error(f"Failed to add document: {str(e)}")
            raise

    async def execute_chain(
        self,
        chain_id: str,
        query: str,
        context_limit: int = 4000
    ) -> Dict[str, Any]:
        """
        Execute a retrieval chain to get context-aware response.

        Pipeline:
        1. Semantic search (vector + full-text)
        2. Context assembly
        3. LLM inference
        4. Response generation

        Args:
            chain_id: Chain ID to execute
            query: Query text
            context_limit: Max context tokens

        Returns:
            Response with retrieved context and answer
        """
        try:
            if chain_id not in self.chains:
                raise ValueError(f"Chain {chain_id} not found")

            chain = self.chains[chain_id]

            # Execute chain (semantic search + LLM)
            result = await chain.query(
                input=query,
                context_limit=context_limit
            )

            logger.info(f"Executed chain {chain_id}")

            return {
                "query": query,
                "answer": result.get("answer"),
                "context": result.get("context", []),
                "sources": result.get("sources", []),
                "tokens_used": result.get("tokens", 0)
            }

        except Exception as e:
            logger.error(f"Chain execution failed: {str(e)}")
            raise
```

## 📈 PERFORMANCE TARGETS

### REST API Performance
- Memory creation: < 150ms p95
- Memory retrieval: < 80ms p95
- Semantic search: < 200ms p95 (with context)
- Document processing: < 50ms per 100 tokens
- Chain execution: < 500ms p95 (including LLM)
- API response time: < 300ms p95
- Throughput: 1000+ requests/second

### Vector Search Optimization (HNSW + ruvector)
- Search complexity: O(log N)
- 150x-12,500x faster than linear search
- Index building time: <100ms per 1000 embeddings
- Memory per index: +15-25% overhead

## 🧪 TESTING REQUIREMENTS

```python
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


@pytest.mark.asyncio
async def test_create_memory():
    """Test memory creation endpoint"""
    response = client.post(
        "/v1/api/memories/",
        json={
            "content": "Test memory",
            "metadata": {"category": "test"}
        },
        headers={"Authorization": "Bearer test_token"}
    )

    assert response.status_code == 201
    assert response.json()["id"]


@pytest.mark.asyncio
async def test_search_memories():
    """Test semantic search endpoint"""
    response = client.post(
        "/v1/api/memories/search",
        json={
            "query": "test",
            "top_k": 10
        },
        headers={"Authorization": "Bearer test_token"}
    )

    assert response.status_code == 200
    assert "results" in response.json()
```

---

**Mem0 REST API bridges external applications with Mem0 memory through HTTP endpoints and Embedchain retrieval chains.**
