from __future__ import annotations

import os
import sqlite3
import time
from typing import Any, Dict, List

import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

APP_NAME = "nyra-mem0-bridge"
DATA_DIR = os.environ.get("MEM0_DATA_DIR", "/data")
DB_PATH = os.path.join(DATA_DIR, "memories.sqlite3")

MEM0_API_KEY = os.environ.get("MEM0_API_KEY", "").strip()
MEM0_BASE_URL = os.environ.get("MEM0_BASE_URL", "https://api.mem0.ai").rstrip("/")
MEM0_DEFAULT_USER_ID = os.environ.get("MEM0_DEFAULT_USER_ID", "nyra-default-user")

app = FastAPI(title=APP_NAME, version="0.1.0")


def _ensure_db() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS memories (
              id TEXT PRIMARY KEY,
              user_id TEXT NOT NULL,
              memory TEXT NOT NULL,
              metadata_json TEXT,
              created_at INTEGER NOT NULL
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_mem_user ON memories(user_id)")
        conn.commit()


def _local_add(user_id: str, memory: str, metadata_json: str = "{}") -> Dict[str, Any]:
    _ensure_db()
    mid = f"local_{int(time.time()*1000)}"
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO memories(id, user_id, memory, metadata_json, created_at) VALUES (?, ?, ?, ?, ?)",
            (mid, user_id, memory, metadata_json, int(time.time())),
        )
        conn.commit()
    return {"id": mid, "user_id": user_id, "memory": memory, "metadata": metadata_json, "provider": "local"}


def _local_search(user_id: str, query: str, limit: int = 10) -> List[Dict[str, Any]]:
    _ensure_db()
    q = f"%{query.lower()}%"
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.execute(
            "SELECT id, memory, metadata_json, created_at FROM memories WHERE user_id=? AND lower(memory) LIKE ? ORDER BY created_at DESC LIMIT ?",
            (user_id, q, limit),
        )
        rows = cur.fetchall()
    return [
        {"id": rid, "memory": mem, "metadata": meta, "created_at": ts, "provider": "local"}
        for (rid, mem, meta, ts) in rows
    ]


class AddMemoryRequest(BaseModel):
    user_id: str = Field(default_factory=lambda: MEM0_DEFAULT_USER_ID)
    memory: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SearchMemoryRequest(BaseModel):
    user_id: str = Field(default_factory=lambda: MEM0_DEFAULT_USER_ID)
    query: str
    limit: int = 10


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "provider": "mem0" if MEM0_API_KEY else "local",
        "mem0_base_url": MEM0_BASE_URL,
    }


@app.post("/memories/add")
def add_memory(req: AddMemoryRequest) -> Dict[str, Any]:
    if not req.memory.strip():
        raise HTTPException(status_code=400, detail="memory is empty")
    if MEM0_API_KEY:
        try:
            r = requests.post(
                f"{MEM0_BASE_URL}/v1/memories",
                headers={"Authorization": f"Bearer {MEM0_API_KEY}", "Content-Type": "application/json"},
                json={"user_id": req.user_id, "memory": req.memory, "metadata": req.metadata},
                timeout=20,
            )
            if r.status_code >= 400:
                raise HTTPException(status_code=502, detail=f"Mem0 error: {r.status_code} {r.text[:300]}")
            return {"provider": "mem0", "result": r.json()}
        except requests.RequestException as e:
            raise HTTPException(status_code=502, detail=f"Mem0 request failed: {e}")

    import json as _json
    return _local_add(req.user_id, req.memory, _json.dumps(req.metadata))


@app.post("/memories/search")
def search_memory(req: SearchMemoryRequest) -> Dict[str, Any]:
    if MEM0_API_KEY:
        try:
            r = requests.post(
                f"{MEM0_BASE_URL}/v1/memories/search",
                headers={"Authorization": f"Bearer {MEM0_API_KEY}", "Content-Type": "application/json"},
                json={"user_id": req.user_id, "query": req.query, "limit": req.limit},
                timeout=20,
            )
            if r.status_code >= 400:
                raise HTTPException(status_code=502, detail=f"Mem0 error: {r.status_code} {r.text[:300]}")
            return {"provider": "mem0", "result": r.json()}
        except requests.RequestException as e:
            raise HTTPException(status_code=502, detail=f"Mem0 request failed: {e}")

    return {"provider": "local", "result": _local_search(req.user_id, req.query, req.limit)}
