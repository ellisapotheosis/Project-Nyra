"""
Mem0 REST API - Memory Management Service
==========================================
FastAPI wrapper for Mem0 SDK providing memory CRUD operations
and semantic search for Project Nyra.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
MEM0_API_KEY = os.getenv("MEM0_API_KEY")
MEM0_USE_CLOUD = os.getenv("MEM0_USE_CLOUD", "false").lower() == "true"

# Initialize FastAPI app
app = FastAPI(
    title="Mem0 REST API",
    description="Memory management service with semantic search powered by Mem0",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Initialize Mem0 client
mem0_client = None


# ============================================================================
# DATA MODELS
# ============================================================================

class MemoryAddRequest(BaseModel):
    """Request to add memory"""
    user_id: str = Field(..., description="User ID to associate memory with")
    content: str = Field(..., min_length=1, description="Memory content to store")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")


class MemorySearchRequest(BaseModel):
    """Request to search memories"""
    user_id: str = Field(..., description="User ID to search memories for")
    query: str = Field(..., min_length=1, description="Search query")
    limit: int = Field(default=10, ge=1, le=100, description="Maximum results")


class MemoryUpdateRequest(BaseModel):
    """Request to update memory"""
    memory_id: str = Field(..., description="Memory ID to update")
    content: str = Field(..., min_length=1, description="New memory content")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Updated metadata")


class MemoryResponse(BaseModel):
    """Memory response"""
    memory_id: str
    user_id: str
    content: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class MemorySearchResponse(BaseModel):
    """Memory search response"""
    memories: List[Dict[str, Any]]
    count: int
    query: str


# ============================================================================
# MEM0 CLIENT INITIALIZATION
# ============================================================================

def get_mem0_client():
    """Initialize and return Mem0 client"""
    global mem0_client

    if mem0_client is None:
        try:
            from mem0 import Memory

            if MEM0_USE_CLOUD and MEM0_API_KEY:
                # Use Mem0 cloud service
                logger.info("Initializing Mem0 with cloud backend")
                mem0_client = Memory(api_key=MEM0_API_KEY)
            else:
                # Use local SQLite backend
                logger.info("Initializing Mem0 with local SQLite backend")
                config = {
                    "vector_store": {
                        "provider": "chroma",
                        "config": {
                            "collection_name": "nyra_memories",
                            "path": "/data/chroma"
                        }
                    },
                    "embedder": {
                        "provider": "ollama",
                        "config": {
                            "model": "nomic-embed-text:latest",
                            "ollama_base_url": "http://ollama:11434"
                        }
                    }
                }
                mem0_client = Memory.from_config(config)

            logger.info("Mem0 client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Mem0 client: {str(e)}")
            raise RuntimeError(f"Mem0 initialization failed: {str(e)}")

    return mem0_client


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize Mem0 client on startup"""
    get_mem0_client()
    logger.info("Mem0 REST API started successfully")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        client = get_mem0_client()
        return {
            "status": "healthy",
            "service": "mem0-rest-api",
            "version": "1.0.0",
            "backend": "cloud" if MEM0_USE_CLOUD else "local",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")


@app.post("/memory/add")
async def add_memory(request: MemoryAddRequest):
    """
    Add a new memory

    Stores memory content associated with a user ID. Memories are
    automatically embedded for semantic search.
    """
    try:
        client = get_mem0_client()

        # Prepare messages for Mem0
        messages = [{"role": "user", "content": request.content}]

        # Add memory
        result = client.add(
            messages=messages,
            user_id=request.user_id,
            metadata=request.metadata or {}
        )

        logger.info(f"Added memory for user {request.user_id}")

        return {
            "status": "success",
            "message": "Memory added successfully",
            "user_id": request.user_id,
            "result": result
        }

    except Exception as e:
        logger.error(f"Failed to add memory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add memory: {str(e)}")


@app.post("/memory/search", response_model=MemorySearchResponse)
async def search_memories(request: MemorySearchRequest):
    """
    Search memories by semantic similarity

    Finds memories semantically similar to the query using vector embeddings.
    Returns the most relevant memories for the specified user.
    """
    try:
        client = get_mem0_client()

        # Search memories
        results = client.search(
            query=request.query,
            user_id=request.user_id,
            limit=request.limit
        )

        logger.info(f"Searched memories for user {request.user_id}, found {len(results)} results")

        return MemorySearchResponse(
            memories=results,
            count=len(results),
            query=request.query
        )

    except Exception as e:
        logger.error(f"Failed to search memories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to search memories: {str(e)}")


@app.get("/memory/all/{user_id}")
async def get_all_memories(
    user_id: str,
    limit: int = Query(default=100, ge=1, le=1000)
):
    """
    Get all memories for a user

    Retrieves all memories associated with a user ID,
    ordered by most recent first.
    """
    try:
        client = get_mem0_client()

        # Get all memories
        memories = client.get_all(user_id=user_id, limit=limit)

        logger.info(f"Retrieved {len(memories)} memories for user {user_id}")

        return {
            "user_id": user_id,
            "memories": memories,
            "count": len(memories)
        }

    except Exception as e:
        logger.error(f"Failed to get memories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get memories: {str(e)}")


@app.get("/memory/{memory_id}")
async def get_memory(memory_id: str):
    """Get a specific memory by ID"""
    try:
        client = get_mem0_client()

        # Get memory
        memory = client.get(memory_id=memory_id)

        if not memory:
            raise HTTPException(status_code=404, detail="Memory not found")

        logger.info(f"Retrieved memory {memory_id}")

        return {
            "memory_id": memory_id,
            "memory": memory
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get memory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get memory: {str(e)}")


@app.put("/memory/update")
async def update_memory(request: MemoryUpdateRequest):
    """
    Update an existing memory

    Updates the content and/or metadata of an existing memory.
    The memory will be re-embedded for semantic search.
    """
    try:
        client = get_mem0_client()

        # Update memory
        result = client.update(
            memory_id=request.memory_id,
            data=request.content,
            metadata=request.metadata or {}
        )

        logger.info(f"Updated memory {request.memory_id}")

        return {
            "status": "success",
            "message": "Memory updated successfully",
            "memory_id": request.memory_id,
            "result": result
        }

    except Exception as e:
        logger.error(f"Failed to update memory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update memory: {str(e)}")


@app.delete("/memory/{memory_id}")
async def delete_memory(memory_id: str):
    """
    Delete a memory

    Permanently removes a memory from the system.
    """
    try:
        client = get_mem0_client()

        # Delete memory
        client.delete(memory_id=memory_id)

        logger.info(f"Deleted memory {memory_id}")

        return {
            "status": "success",
            "message": "Memory deleted successfully",
            "memory_id": memory_id
        }

    except Exception as e:
        logger.error(f"Failed to delete memory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete memory: {str(e)}")


@app.delete("/memory/user/{user_id}")
async def delete_all_user_memories(user_id: str):
    """
    Delete all memories for a user

    Permanently removes all memories associated with a user ID.
    """
    try:
        client = get_mem0_client()

        # Delete all memories for user
        client.delete_all(user_id=user_id)

        logger.warning(f"Deleted all memories for user {user_id}")

        return {
            "status": "success",
            "message": f"All memories deleted for user {user_id}",
            "user_id": user_id
        }

    except Exception as e:
        logger.error(f"Failed to delete user memories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete memories: {str(e)}")


@app.get("/memory/history/{memory_id}")
async def get_memory_history(memory_id: str):
    """
    Get history of changes for a memory

    Retrieves the version history showing how a memory has evolved over time.
    """
    try:
        client = get_mem0_client()

        # Get memory history
        history = client.history(memory_id=memory_id)

        logger.info(f"Retrieved history for memory {memory_id}")

        return {
            "memory_id": memory_id,
            "history": history,
            "version_count": len(history)
        }

    except Exception as e:
        logger.error(f"Failed to get memory history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get memory history: {str(e)}")


@app.post("/memory/reset")
async def reset_all_memories():
    """
    Reset all memories (DANGEROUS)

    Deletes ALL memories from the system. This operation cannot be undone.
    Only use in development/testing environments.
    """
    try:
        client = get_mem0_client()

        # Reset all memories
        client.reset()

        logger.warning("RESET: All memories have been deleted from the system")

        return {
            "status": "success",
            "message": "All memories have been reset",
            "warning": "This operation cannot be undone"
        }

    except Exception as e:
        logger.error(f"Failed to reset memories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to reset memories: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("MEM0_PORT", 8003)),
        reload=True,
        log_level="info"
    )
