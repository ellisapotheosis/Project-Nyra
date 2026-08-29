"""
mem0 REST API server for Project Nyra.
Exposes mem0 Memory operations over HTTP with Qdrant + FalkorDB backends.
"""
import os
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from mem0 import Memory
from redis import Redis


def _build_config() -> dict:
    openai_key = os.environ.get("OPENAI_API_KEY", "")
    llm_key = os.environ.get("MEM0_LLM_API_KEY", openai_key)
    llm_base_url = os.environ.get("MEM0_LLM_BASE_URL") or os.environ.get("OPENAI_BASE_URL")
    embedder_key = os.environ.get("MEM0_EMBEDDER_API_KEY", openai_key)
    embedder_base_url = (
        os.environ.get("MEM0_EMBEDDER_BASE_URL")
        or os.environ.get("OPENAI_API_BASE")
        or os.environ.get("OPENAI_BASE_URL")
    )
    llm_model = os.environ.get("MEM0_LLM_MODEL", "gpt-4o-mini")
    embedder_model = os.environ.get("MEM0_EMBEDDER_MODEL", "text-embedding-3-small")
    embedding_dims = int(os.environ.get("MEM0_EMBEDDING_DIMS", "1536"))
    qdrant_host = os.environ.get("QDRANT_HOST", "nyra-qdrant")
    qdrant_port = int(os.environ.get("QDRANT_PORT", "6333"))
    qdrant_api_key = os.environ.get("QDRANT_API_KEY", "")
    qdrant_url = os.environ.get("QDRANT_URL", f"http://{qdrant_host}:{qdrant_port}")
    qdrant_connection = (
        {"url": qdrant_url, "api_key": qdrant_api_key}
        if qdrant_api_key
        else {"host": qdrant_host, "port": qdrant_port}
    )

    cfg: dict = {
        "vector_store": {
            "provider": "qdrant",
            "config": {
                **qdrant_connection,
                "embedding_model_dims": embedding_dims,
                "collection_name": "mem0-nyra",
            },
        },
        "llm": {
            "provider": "openai",
            "config": {
                "model": llm_model,
                "api_key": llm_key,
                **({"openai_base_url": llm_base_url} if llm_base_url else {}),
            },
        },
        "embedder": {
            "provider": "openai",
            "config": {
                "model": embedder_model,
                "api_key": embedder_key,
                "embedding_dims": embedding_dims,
                **({"openai_base_url": embedder_base_url} if embedder_base_url else {}),
            },
        },
    }

    # Do not invent a FalkorDB provider key. Current released Mem0 packages
    # do not expose a verified FalkorDB graph provider. A future adapter must
    # opt in explicitly and be validated against the installed API.
    falkordb_url = os.environ.get("FALKORDB_URL")
    graph_provider = os.environ.get("MEM0_GRAPH_PROVIDER")
    try:
        from mem0.configs.base import MemoryConfig
        graph_supported = "graph_store" in getattr(MemoryConfig, "model_fields", {})
    except Exception:
        graph_supported = False
    if falkordb_url and graph_provider and graph_supported:
        cfg["graph_store"] = {
            "provider": graph_provider,
            "config": {"url": falkordb_url},
        }

    return cfg


memory = Memory.from_config(_build_config())
app = FastAPI(title="mem0 API", version="1.0.0")


def _graph_write(memory_id: str, user_id: str, content: str) -> None:
    if os.environ.get("MEM0_GRAPH_ADAPTER_ENABLED", "true").lower() not in {"1", "true", "yes"}:
        return
    url = os.environ.get("FALKORDB_URL", "redis://falkordb:6379")
    client = Redis.from_url(url, decode_responses=True, socket_connect_timeout=2)
    def esc(value: str) -> str:
        return value.replace("\\", "\\\\").replace("'", "\\'")
    query = (
        "MERGE (u:User {id:'%s'}) "
        "MERGE (m:Memory {id:'%s'}) "
        "SET m.content='%s' "
        "MERGE (u)-[:OWNS]->(m)"
    ) % (esc(user_id), esc(memory_id), esc(content))
    client.execute_command("GRAPH.QUERY", "nyra_memory", query)


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
    result = memory.add(
        req.messages,
        user_id=req.user_id,
        agent_id=req.agent_id,
        run_id=req.run_id,
        metadata=req.metadata,
    )
    for item in result.get("results", []) if isinstance(result, dict) else []:
        try:
            _graph_write(item["id"], req.user_id, item.get("memory", ""))
        except Exception:
            pass
    return result


@app.get("/v1/memories")
def get_all(user_id: Optional[str] = None, agent_id: Optional[str] = None):
    filters = {
        key: value
        for key, value in {"user_id": user_id, "agent_id": agent_id}.items()
        if value is not None
    }
    return memory.get_all(filters=filters or None)


@app.get("/v1/memories/{memory_id}")
def get_memory(memory_id: str):
    result = memory.get(memory_id)
    if not result:
        raise HTTPException(status_code=404, detail="Memory not found")
    return result


@app.post("/v1/memories/search")
def search(req: SearchRequest):
    filters = {
        key: value
        for key, value in {
            "user_id": req.user_id,
            "agent_id": req.agent_id,
            "run_id": req.run_id,
        }.items()
        if value is not None
    }
    return memory.search(
        req.query,
        filters=filters or None,
        top_k=req.limit,
    )


@app.delete("/v1/memories/{memory_id}")
def delete_memory(memory_id: str):
    memory.delete(memory_id)
    try:
        client = Redis.from_url(os.environ.get("FALKORDB_URL", "redis://falkordb:6379"), decode_responses=True)
        client.execute_command("GRAPH.QUERY", "nyra_memory", "MATCH (m:Memory {id:'%s'}) DETACH DELETE m" % memory_id.replace("'", "\\'"))
    except Exception:
        pass
    return {"status": "deleted", "id": memory_id}


@app.delete("/v1/memories")
def delete_all(user_id: Optional[str] = None, agent_id: Optional[str] = None):
    filters = {
        key: value
        for key, value in {"user_id": user_id, "agent_id": agent_id}.items()
        if value is not None
    }
    memory.delete_all(filters=filters or None)
    return {"status": "deleted"}
