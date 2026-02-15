from __future__ import annotations

import os
import sqlite3
import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel, Field

DB_PATH = os.getenv("MEM0_STORE_PATH", "/data/mem0.sqlite")

app = FastAPI(title="Mem0-lite REST (dev)", version="0.1.0")

def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS memories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          text TEXT NOT NULL,
          tags TEXT,
          ts INTEGER NOT NULL
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_user_ts ON memories(user_id, ts);")
    return conn

class AddMemoryReq(BaseModel):
    user_id: str
    text: str
    tags: Optional[List[str]] = None

class Memory(BaseModel):
    user_id: str
    text: str
    tags: List[str] = Field(default_factory=list)
    ts: int

class SearchReq(BaseModel):
    user_id: str
    query: str = ""
    limit: int = 20

@app.get("/health")
def health():
    return {"ok": True, "db": DB_PATH}

@app.post("/memories/add")
def add_memory(req: AddMemoryReq):
    conn = db()
    tags = ",".join(req.tags or [])
    ts = int(time.time())
    conn.execute("INSERT INTO memories(user_id, text, tags, ts) VALUES (?,?,?,?)", (req.user_id, req.text, tags, ts))
    conn.commit()
    return {"ok": True, "ts": ts}

@app.post("/memories/search", response_model=List[Memory])
def search(req: SearchReq):
    conn = db()
    q = f"%{req.query}%"
    cur = conn.execute(
        "SELECT user_id, text, tags, ts FROM memories WHERE user_id=? AND text LIKE ? ORDER BY ts DESC LIMIT ?",
        (req.user_id, q, req.limit),
    )
    out = []
    for user_id, text, tags, ts in cur.fetchall():
        out.append(Memory(user_id=user_id, text=text, tags=[t for t in tags.split(",") if t], ts=ts))
    return out
