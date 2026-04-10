# Mem0 MCP - Model Context Protocol Server for Memory

## 🎯 SERVICE CONTEXT

**Purpose**: Python-based MCP (Model Context Protocol) server exposing Mem0 memory operations as standard MCP tools for Claude and other LLM clients, enabling seamless memory integration in AI applications.

**Port**: 3170
**Language**: Python 3.10+
**Framework**: FastMCP (FastAPI MCP implementation)
**Dependencies**: fastmcp, mem0, anthropic, ruvector, pydantic, httpx
**Template**: CLAUDE-MD-Python.md (star topology for client connections)

## 🚨 CRITICAL DEVELOPMENT RULES

### Mem0 MCP Server Development Pattern
**MANDATORY**: All MCP tools, resource definitions, and protocol handlers MUST be developed in parallel:

```python
# ✅ CORRECT: Batch development in ONE message
[Single Message]:
  # Core MCP server and tools
  - Write("src/server.py", mcpServerSetup)
  - Write("src/tools/memory_tools.py", memoryOperations)
  - Write("src/tools/search_tools.py", searchOperations)
  - Write("src/resources/memory_resource.py", memoryResource)

  # Mem0 integration
  - Write("src/mem0_client.py", mem0ClientWrapper)
  - Write("src/memory_manager.py", memoryManagement)

  # Protocol handlers
  - Write("src/handlers/tool_handlers.py", toolImplementations)
  - Write("src/handlers/resource_handlers.py", resourceImplementations)

  # Utilities and logging
  - Write("src/utils/embeddings.py", embeddingFunctions)
  - Write("src/utils/validators.py", inputValidation)

  # Tests
  - Write("tests/test_mcp_server.py", mcpTests)
  - Bash("pytest tests/")
```

### MCP Protocol Rules
**CRITICAL**: All MCP tool definitions MUST follow MCP specification:

- **Tool Definitions**: Clear schema with input parameters and output types
- **Resource Definitions**: Structured templates for memory resources
- **Error Handling**: Proper error codes and messages per MCP spec
- **Input Validation**: Strict schema validation for all inputs
- **Response Format**: Standardized JSON responses
- **Transport**: Stdio mode for Claude integration
- **Resource URIs**: Canonical URIs for memory resources (mem0://...)

## 📊 MEM0 MCP SERVER ARCHITECTURE

### MCP Tool Categories

**Memory Management Tools:**
- `mem0_create_memory` - Create new memory
- `mem0_update_memory` - Update existing memory
- `mem0_delete_memory` - Delete memory
- `mem0_get_memory` - Retrieve memory by ID

**Search & Retrieval Tools:**
- `mem0_search_memories` - Semantic search with HNSW
- `mem0_list_memories` - List user's memories
- `mem0_search_by_tags` - Find memories by tags
- `mem0_search_by_category` - Find memories by category

**Memory Analysis Tools:**
- `mem0_get_memory_stats` - Get user memory statistics
- `mem0_find_duplicate_memories` - Detect similar memories
- `mem0_get_related_memories` - Find related memories
- `mem0_analyze_memory_patterns` - Pattern analysis

**Memory Management Tools:**
- `mem0_compress_memories` - Consolidate similar memories
- `mem0_cleanup_expired` - Remove expired memories
- `mem0_export_memories` - Export user memories
- `mem0_import_memories` - Bulk import memories

### MCP Resource Types

**Memory Resource:**
```
URI: mem0://memories/{memory_id}
Type: application/json
Template: {
  id: string,
  content: string,
  metadata: object,
  created_at: string,
  updated_at: string
}
```

**User Memories Collection:**
```
URI: mem0://users/{user_id}/memories
Type: application/json
Template: [memory_resources]
```

**Memory Search Results:**
```
URI: mem0://search/{query}
Type: application/json
Template: {
  query: string,
  results: memory[],
  count: number
}
```

## 🐝 MEM0 MCP SWARM

### Agent Configuration
```yaml
topology: star  # Clients connect to central MCP server
maxAgents: 8
strategy: specialized
language: python
framework: fastmcp

agents:
  mcp_server_architect:
    role: MCP Protocol Implementation
    focus: [protocol-compliance, tool-definition, resource-handling]
    responsibilities:
      - Design MCP tool schemas
      - Implement protocol handlers
      - Define resource types
      - Handle protocol compliance

  tool_developer:
    role: MCP Tool Development
    focus: [tool-implementation, error-handling, validation]
    responsibilities:
      - Implement memory management tools
      - Implement search tools
      - Implement analysis tools
      - Input validation

  mem0_integration_engineer:
    role: Mem0 SDK Integration
    focus: [mem0-wrapper, api-calls, error-recovery]
    responsibilities:
      - Wrap Mem0 SDK methods
      - Handle API responses
      - Implement retry logic
      - Cache management

  resource_manager:
    role: MCP Resource Definition
    focus: [resource-templates, uri-scheme, metadata]
    responsibilities:
      - Define resource schemas
      - Create resource templates
      - Handle resource retrieval
      - Manage resource lifecycle

  protocol_handler:
    role: MCP Protocol Handler
    focus: [stdio-transport, json-rpc, protocol-compliance]
    responsibilities:
      - Implement JSON-RPC handler
      - Handle stdin/stdout transport
      - Protocol error handling
      - Message serialization

  embedding_specialist:
    role: Vector & Embedding Management
    focus: [embedding-generation, vector-operations, caching]
    responsibilities:
      - Generate embeddings
      - Vector caching
      - Embedding optimization
      - Format conversion

  security_engineer:
    role: Security & Access Control
    focus: [authentication, authorization, input-security]
    responsibilities:
      - Implement user isolation
      - Input sanitization
      - API key management
      - Rate limiting

  test_engineer:
    role: MCP Server Testing
    focus: [pytest, protocol-testing, integration-testing]
    responsibilities:
      - Write MCP protocol tests
      - Integration tests
      - Error handling tests
      - Load testing
```

## 🔧 PYTHON + FASTMCP PATTERNS

### FastMCP Server Implementation
```python
"""
Mem0 MCP Server - Exposes Mem0 memory operations as MCP tools
"""

from fastmcp import FastMCP
from fastmcp.tools import Tool
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import logging

from src.mem0_client import Mem0Client
from src.utils.validators import validate_memory_input
from src.utils.embeddings import EmbeddingService

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize MCP server
mcp = FastMCP("mem0-mcp")

# Initialize Mem0 client
mem0_client = Mem0Client()
embedding_service = EmbeddingService()


class MemoryInput(BaseModel):
    """Input schema for memory creation"""
    user_id: str = Field(..., description="User ID")
    content: str = Field(..., description="Memory content")
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional metadata (tags, category, etc)"
    )
    ttl: Optional[int] = Field(
        default=None,
        description="Time-to-live in seconds (optional)"
    )


class SearchInput(BaseModel):
    """Input schema for memory search"""
    user_id: str = Field(..., description="User ID")
    query: str = Field(..., description="Search query")
    top_k: Optional[int] = Field(
        default=10,
        description="Number of results to return"
    )
    min_confidence: Optional[float] = Field(
        default=0.0,
        description="Minimum confidence score (0-1)"
    )
    tags: Optional[List[str]] = Field(
        default=None,
        description="Filter by tags"
    )
    category: Optional[str] = Field(
        default=None,
        description="Filter by category"
    )


class UpdateInput(BaseModel):
    """Input schema for memory update"""
    memory_id: str = Field(..., description="Memory ID to update")
    user_id: str = Field(..., description="User ID (for verification)")
    content: Optional[str] = Field(
        default=None,
        description="Updated content"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Updated metadata"
    )


# ============================================================================
# MEMORY MANAGEMENT TOOLS
# ============================================================================

@mcp.tool()
def mem0_create_memory(input: MemoryInput) -> Dict[str, Any]:
    """
    Create a new memory item with semantic embedding.

    This tool stores a new memory for a user, automatically generating
    semantic embeddings for similarity search with HNSW indexing.

    Args:
        user_id: Unique identifier for the user
        content: The memory content (text)
        metadata: Optional metadata (tags, category, confidence, etc)
        ttl: Optional time-to-live in seconds (default: 90 days)

    Returns:
        Created memory object with ID and embedding
    """
    try:
        logger.info(f"Creating memory for user {input.user_id}")

        # Validate input
        validate_memory_input(input.content)

        # Create memory via Mem0
        memory = mem0_client.create_memory(
            user_id=input.user_id,
            content=input.content,
            metadata=input.metadata,
            ttl=input.ttl
        )

        logger.info(f"Memory created: {memory['id']}")

        return {
            "success": True,
            "memory": memory
        }

    except Exception as e:
        logger.error(f"Memory creation failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
def mem0_update_memory(input: UpdateInput) -> Dict[str, Any]:
    """
    Update an existing memory item.

    Updates memory content and/or metadata. If content is changed,
    embeddings are regenerated for updated semantic search.

    Args:
        memory_id: ID of memory to update
        user_id: User ID (for access verification)
        content: New content (optional)
        metadata: New metadata (optional)

    Returns:
        Updated memory object with new version
    """
    try:
        logger.info(f"Updating memory {input.memory_id}")

        # Update memory via Mem0
        memory = mem0_client.update_memory(
            memory_id=input.memory_id,
            user_id=input.user_id,
            content=input.content,
            metadata=input.metadata
        )

        logger.info(f"Memory updated: {input.memory_id}")

        return {
            "success": True,
            "memory": memory
        }

    except Exception as e:
        logger.error(f"Memory update failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
def mem0_delete_memory(
    memory_id: str = Field(..., description="Memory ID to delete"),
    user_id: str = Field(..., description="User ID for verification")
) -> Dict[str, Any]:
    """
    Delete a memory item permanently.

    Removes memory from database and all indexes.

    Args:
        memory_id: ID of memory to delete
        user_id: User ID (for access verification)

    Returns:
        Success status
    """
    try:
        logger.info(f"Deleting memory {memory_id}")

        # Delete via Mem0
        success = mem0_client.delete_memory(
            memory_id=memory_id,
            user_id=user_id
        )

        return {
            "success": success,
            "message": "Memory deleted" if success else "Memory not found"
        }

    except Exception as e:
        logger.error(f"Memory deletion failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
def mem0_get_memory(
    memory_id: str = Field(..., description="Memory ID to retrieve"),
    user_id: str = Field(..., description="User ID for verification")
) -> Dict[str, Any]:
    """
    Retrieve a specific memory by ID.

    Args:
        memory_id: ID of memory to retrieve
        user_id: User ID (for access verification)

    Returns:
        Memory object if found
    """
    try:
        logger.info(f"Retrieving memory {memory_id}")

        # Get memory via Mem0
        memory = mem0_client.get_memory(
            memory_id=memory_id,
            user_id=user_id
        )

        if not memory:
            return {
                "success": False,
                "error": "Memory not found"
            }

        return {
            "success": True,
            "memory": memory
        }

    except Exception as e:
        logger.error(f"Memory retrieval failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


# ============================================================================
# SEARCH & RETRIEVAL TOOLS
# ============================================================================

@mcp.tool()
def mem0_search_memories(input: SearchInput) -> Dict[str, Any]:
    """
    Search memories using semantic search with HNSW indexing.

    Finds memories semantically similar to the query using vector
    embeddings and hybrid search (vector + full-text).

    Performance: <100ms p95 with HNSW indexing

    Args:
        user_id: User ID
        query: Search query (text)
        top_k: Number of results to return (default: 10)
        min_confidence: Minimum confidence score 0-1
        tags: Optional tag filters
        category: Optional category filter

    Returns:
        List of matching memories with relevance scores
    """
    try:
        logger.info(f"Searching memories for user {input.user_id}: {input.query}")

        # Search via Mem0
        results = mem0_client.search_memories(
            user_id=input.user_id,
            query=input.query,
            top_k=input.top_k,
            min_confidence=input.min_confidence,
            tags=input.tags,
            category=input.category
        )

        logger.info(f"Search found {len(results)} results")

        return {
            "success": True,
            "query": input.query,
            "results": results,
            "count": len(results)
        }

    except Exception as e:
        logger.error(f"Memory search failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
def mem0_list_memories(
    user_id: str = Field(..., description="User ID"),
    limit: int = Field(default=50, description="Number of memories to return"),
    offset: int = Field(default=0, description="Pagination offset"),
    sort_by: str = Field(default="updated", description="Sort by: created|updated|relevance")
) -> Dict[str, Any]:
    """
    List all memories for a user with pagination.

    Args:
        user_id: User ID
        limit: Results per page (default: 50, max: 200)
        offset: Pagination offset
        sort_by: Sort order (created, updated, relevance)

    Returns:
        Paginated list of memories
    """
    try:
        logger.info(f"Listing memories for user {user_id}")

        # List memories via Mem0
        memories = mem0_client.list_memories(
            user_id=user_id,
            limit=min(limit, 200),  # Cap at 200
            offset=offset,
            sort_by=sort_by
        )

        return {
            "success": True,
            "count": len(memories),
            "limit": limit,
            "offset": offset,
            "memories": memories
        }

    except Exception as e:
        logger.error(f"List memories failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
def mem0_search_by_tags(
    user_id: str = Field(..., description="User ID"),
    tags: List[str] = Field(..., description="List of tags to search")
) -> Dict[str, Any]:
    """
    Find memories by tags.

    Args:
        user_id: User ID
        tags: List of tags to search

    Returns:
        Memories matching the tags
    """
    try:
        logger.info(f"Searching by tags for user {user_id}")

        results = mem0_client.search_by_tags(
            user_id=user_id,
            tags=tags
        )

        return {
            "success": True,
            "tags": tags,
            "results": results,
            "count": len(results)
        }

    except Exception as e:
        logger.error(f"Tag search failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


# ============================================================================
# MEMORY ANALYSIS TOOLS
# ============================================================================

@mcp.tool()
def mem0_get_memory_stats(
    user_id: str = Field(..., description="User ID")
) -> Dict[str, Any]:
    """
    Get memory statistics for a user.

    Returns counts, categories, and usage statistics.

    Args:
        user_id: User ID

    Returns:
        Statistics object with memory counts and metadata
    """
    try {
        logger.info(f"Getting stats for user {user_id}")

        stats = mem0_client.get_user_stats(user_id=user_id)

        return {
            "success": True,
            "stats": stats
        }

    except Exception as e:
        logger.error(f"Stats retrieval failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
def mem0_find_duplicate_memories(
    user_id: str = Field(..., description="User ID"),
    similarity_threshold: float = Field(
        default=0.85,
        description="Similarity threshold (0-1)"
    )
) -> Dict[str, Any]:
    """
    Find duplicate or very similar memories.

    Identifies memories with high semantic similarity that could
    be consolidated.

    Args:
        user_id: User ID
        similarity_threshold: Minimum similarity score (0-1)

    Returns:
        Groups of duplicate memories
    """
    try:
        logger.info(f"Finding duplicates for user {user_id}")

        duplicates = mem0_client.find_duplicates(
            user_id=user_id,
            similarity_threshold=similarity_threshold
        )

        return {
            "success": True,
            "duplicates": duplicates,
            "groups": len(duplicates)
        }

    except Exception as e:
        logger.error(f"Duplicate detection failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


# ============================================================================
# MEMORY MANAGEMENT TOOLS
# ============================================================================

@mcp.tool()
def mem0_compress_memories(
    user_id: str = Field(..., description="User ID")
) -> Dict[str, Any]:
    """
    Compress and consolidate similar memories.

    Reduces memory count by merging related items while
    preserving information content.

    Args:
        user_id: User ID

    Returns:
        Compression results (memories consolidated count)
    """
    try:
        logger.info(f"Compressing memories for user {user_id}")

        result = mem0_client.compress_memories(user_id=user_id)

        return {
            "success": True,
            "consolidated_count": result.get("consolidated"),
            "space_saved": result.get("space_saved")
        }

    except Exception as e:
        logger.error(f"Memory compression failed: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


# ============================================================================
# MCP SERVER STARTUP
# ============================================================================

if __name__ == "__main__":
    """Start the MCP server in stdio mode for Claude integration"""

    import sys

    logger.info("Starting Mem0 MCP Server")
    logger.info(f"Tools registered: {len(mcp.tools)}")

    # Run in stdio mode (Claude integration)
    mcp.run(
        transport='stdio',
        debug=False
    )
```

### Mem0 Client Wrapper
```python
"""
Mem0 SDK wrapper with caching and error handling
"""

from typing import List, Dict, Any, Optional
from mem0 import MemoryClient
import logging

logger = logging.getLogger(__name__)


class Mem0Client:
    """Wrapper around Mem0 SDK with additional features"""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize Mem0 client"""
        self.client = MemoryClient(api_key=api_key)
        self._cache: Dict[str, Any] = {}

    def create_memory(
        self,
        user_id: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None,
        ttl: Optional[int] = None
    ) -> Dict[str, Any]:
        """Create a new memory"""
        try:
            response = self.client.add(
                messages=[{"role": "user", "content": content}],
                user_id=user_id,
                metadata=metadata,
                ttl=ttl
            )

            # Cache result
            self._cache[response.get('id')] = response

            return response

        except Exception as e:
            logger.error(f"Mem0 create failed: {str(e)}")
            raise

    def search_memories(
        self,
        user_id: str,
        query: str,
        top_k: int = 10,
        min_confidence: float = 0.0,
        tags: Optional[List[str]] = None,
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search memories semantically"""
        try:
            response = self.client.search(
                query=query,
                user_id=user_id,
                limit=top_k
            )

            # Filter by confidence and tags
            results = response.get('results', [])

            if min_confidence > 0:
                results = [r for r in results if r.get('score', 1.0) >= min_confidence]

            if tags:
                results = [r for r in results if any(tag in r.get('metadata', {}).get('tags', []) for tag in tags)]

            if category:
                results = [r for r in results if r.get('metadata', {}).get('category') == category]

            return results[:top_k]

        except Exception as e:
            logger.error(f"Mem0 search failed: {str(e)}")
            raise

    def get_memory(self, memory_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get specific memory by ID"""
        try:
            # Check cache first
            if memory_id in self._cache:
                return self._cache[memory_id]

            # Fetch from Mem0
            response = self.client.get(memory_id=memory_id, user_id=user_id)

            self._cache[memory_id] = response
            return response

        except Exception as e:
            logger.error(f"Mem0 get failed: {str(e)}")
            return None

    def delete_memory(self, memory_id: str, user_id: str) -> bool:
        """Delete a memory"""
        try:
            self.client.delete(memory_id=memory_id, user_id=user_id)

            # Remove from cache
            if memory_id in self._cache:
                del self._cache[memory_id]

            return True

        except Exception as e:
            logger.error(f"Mem0 delete failed: {str(e)}")
            return False

    def list_memories(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0,
        sort_by: str = "updated"
    ) -> List[Dict[str, Any]]:
        """List user's memories"""
        try:
            response = self.client.list(user_id=user_id, limit=limit, offset=offset)
            return response.get('memories', [])

        except Exception as e:
            logger.error(f"Mem0 list failed: {str(e)}")
            return []
```

## 📈 PERFORMANCE TARGETS

### MCP Server Performance
- Tool invocation: < 50ms p95 (avg 10-20ms)
- Memory creation: < 100ms p95
- Memory search: < 150ms p95
- Server startup: < 1 second
- Memory overhead: < 100MB per 10k memories
- Concurrent clients: Support 100+

## 🧪 TESTING REQUIREMENTS

```python
import pytest
from src.server import mcp, Mem0Client


@pytest.fixture
def mem0_client():
    return Mem0Client()


def test_create_memory(mem0_client):
    """Test memory creation"""
    memory = mem0_client.create_memory(
        user_id="test_user",
        content="Test memory content",
        metadata={"category": "test"}
    )

    assert memory["id"]
    assert memory["content"] == "Test memory content"


def test_search_memories(mem0_client):
    """Test semantic search"""
    results = mem0_client.search_memories(
        user_id="test_user",
        query="test",
        top_k=5
    )

    assert len(results) <= 5
    assert all("embedding" in r for r in results)
```

---

**Mem0 MCP Server bridges LLMs and structured memory, enabling seamless memory operations via the standard Model Context Protocol.**
