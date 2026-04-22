"""
mem0 REST API server for Project Nyra.
Exposes mem0 Memory operations over HTTP with Qdrant + FalkorDB backends.
"""
import os
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from mem0 import Memory


def _build_config() -> dict:
    openai_key = os.environ.get("OPENAI_API_KEY", "")
    qdrant_host = os.environ.get("QDRANT_HOST", "nyra-qdrant")
    qdrant_port = int(os.environ.get("QDRANT_PORT", "6333"))

    cfg: dict = {
        "vector_store": {
            "provider": "qdrant",
            "config": {
                "host": qdrant_host,
                "port": qdrant_port,
                "embedding_model_dims": 1536,
                "collection_name": "mem0-nyra",
            },
        },
        "llm": {
            "provider": "openai",
            "config": {
                "model": "gpt-4o-mini",
                "api_key": openai_key,
            },
        },
        "embedder": {
            "provider": "openai",
            "config": {
                "model": "text-embedding-3-small",
                "api_key": openai_key,
            },
        },
    }

    falkordb_url = os.environ.get("FALKORDB_URL")
    if falkordb_url:
        cfg["graph_store"] = {
            "provider": "falkordb",
            "config": {"url": falkordb_url},
        }

    return cfg


memory = Memory.from_config(_build_config())
app = FastAPI(title="mem0 API", version="1.0.0")


# --- Request models ---

class AddRequest(BaseModel):
    messages: list
    user_id: str
    agent_id: Optional[str] = None
    run_id: Optional[str] = None
    metadata: Optional[dict] = None


class SearchRequest(BaseModel):
    query: str
    user_id: Optional[str] = None
    agent_id: Optional[str] = None
    run_id: Optional[str] = None
    limit: int = 10


# --- Endpoints ---

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/v1/memories")
def add_memory(req: AddRequest):
    return memory.add(
        req.messages,
        user_id=req.user_id,
        agent_id=req.agent_id,
        run_id=req.run_id,
        metadata=req.metadata,
    )


@app.get("/v1/memories")
def get_all(user_id: Optional[str] = None, agent_id: Optional[str] = None):
    return memory.get_all(user_id=user_id, agent_id=agent_id)


@app.get("/v1/memories/{memory_id}")
def get_memory(memory_id: str):
    result = memory.get(memory_id)
    if not result:
        raise HTTPException(status_code=404, detail="Memory not found")
    return result


@app.post("/v1/memories/search")
def search(req: SearchRequest):
    return memory.search(
        req.query,
        user_id=req.user_id,
        agent_id=req.agent_id,
        run_id=req.run_id,
        limit=req.limit,
    )


@app.delete("/v1/memories/{memory_id}")
def delete_memory(memory_id: str):
    memory.delete(memory_id)
    return {"status": "deleted", "id": memory_id}


@app.delete("/v1/memories")
def delete_all(user_id: Optional[str] = None, agent_id: Optional[str] = None):
    memory.delete_all(user_id=user_id, agent_id=agent_id)
    return {"status": "deleted"}
