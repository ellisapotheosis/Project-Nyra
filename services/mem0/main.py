"""
mem0 REST API server for Project Nyra.
Exposes mem0 Memory operations over HTTP with Qdrant + FalkorDB backends.
"""
import os
from typing import Optional
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from mem0 import Memory


def _register_graph_plugin() -> str:
    if not os.environ.get("FALKORDB_URL"):
        return "none"

    try:
        import mem0_falkordb
    except ImportError as exc:
        raise RuntimeError(
            "FALKORDB_URL is set, but the mem0-falkordb plugin is not installed. "
            "Install services/mem0/requirements.txt before starting mem0."
        ) from exc

    mem0_falkordb.register()
    return "falkordb"


def _build_config() -> dict:
    openai_key = os.environ.get("OPENAI_API_KEY", "")
    openai_base_url = os.environ.get("OPENAI_API_BASE") or os.environ.get("OPENAI_BASE_URL")
    qdrant_host = os.environ.get("QDRANT_HOST", "nyra-qdrant")
    qdrant_port = int(os.environ.get("QDRANT_PORT", "6333"))
    qdrant_api_key = os.environ.get("QDRANT_API_KEY", "")
    qdrant_url = os.environ.get("QDRANT_URL", f"http://{qdrant_host}:{qdrant_port}")
    embedding_dims = int(os.environ.get("MEM0_EMBEDDING_DIMS", "1536"))
    collection_name = os.environ.get("MEM0_COLLECTION_NAME", "mem0-nyra")
    llm_model = os.environ.get("MEM0_LLM_MODEL", "gpt-4o-mini")
    embedder_model = os.environ.get("MEM0_EMBEDDER_MODEL", "text-embedding-3-small")
    qdrant_connection = (
        {"url": qdrant_url, "api_key": qdrant_api_key}
        if qdrant_api_key
        else {"host": qdrant_host, "port": qdrant_port}
    )
    openai_config = {"api_key": openai_key}
    if openai_base_url:
        openai_config["openai_base_url"] = openai_base_url

    cfg: dict = {
        "vector_store": {
            "provider": "qdrant",
            "config": {
                **qdrant_connection,
                "embedding_model_dims": embedding_dims,
                "collection_name": collection_name,
            },
        },
        "llm": {
            "provider": "openai",
            "config": {
                **openai_config,
                "model": llm_model,
            },
        },
        "embedder": {
            "provider": "openai",
            "config": {
                **openai_config,
                "model": embedder_model,
            },
        },
    }

    falkordb_url = os.environ.get("FALKORDB_URL")
    if falkordb_url:
        parsed_falkordb = urlparse(falkordb_url)
        falkordb_host = os.environ.get("FALKORDB_HOST") or parsed_falkordb.hostname or "falkordb"
        falkordb_port = int(os.environ.get("FALKORDB_PORT") or parsed_falkordb.port or 6379)
        cfg["graph_store"] = {
            "provider": "falkordb",
            "config": {
                "host": falkordb_host,
                "port": falkordb_port,
                "database": os.environ.get("FALKORDB_DATABASE", "mem0"),
            },
        }

    return cfg


GRAPH_PROVIDER = _register_graph_plugin()
CONFIG = _build_config()
VECTOR_PROVIDER = CONFIG["vector_store"]["provider"]
memory = Memory.from_config(CONFIG)
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
    return {
        "status": "ok",
        "vector_provider": VECTOR_PROVIDER,
        "graph_provider": GRAPH_PROVIDER,
    }


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
