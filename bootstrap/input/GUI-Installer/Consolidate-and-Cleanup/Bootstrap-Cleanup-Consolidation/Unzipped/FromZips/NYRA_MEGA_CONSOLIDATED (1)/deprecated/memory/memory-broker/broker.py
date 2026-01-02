import os, datetime
from fastapi import FastAPI
from pydantic import BaseModel
import httpx

GRAPHITI_API_URL = os.getenv("GRAPHITI_API_URL","http://graphiti-mcp:8001")
QDRANT_URL = os.getenv("QDRANT_URL","http://qdrant:6333")
OPENMEMORY_BASE_URL = os.getenv("OPENMEMORY_BASE_URL","http://mem0-openmemory:8765")
LETTA_BASE_URL = os.getenv("LETTA_BASE_URL","http://letta:7777/v1")

app = FastAPI(title="Memory Broker")

class WriteEvent(BaseModel):
    user_id: str = "ellis"
    kind: str
    text: str
    tags: list[str] = []

async def post_json(url, payload):
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(url, json=payload)
        return {"status": r.status_code, "text": r.text}

@app.post("/write")
async def write(evt: WriteEvent):
    ts = datetime.datetime.utcnow().isoformat()
    tasks = []
    # mem0/OpenMemory
    tasks.append(post_json(f"{OPENMEMORY_BASE_URL}/api/memory/add",
                           {"user_id":evt.user_id,"memories":[f"[{ts}] {evt.kind}: {evt.text}"]}))
    # Graphiti (placeholder endpoint)
    tasks.append(post_json(f"{GRAPHITI_API_URL}/api/v1/facts",
                           {"text": evt.text, "tags": evt.tags}))
    # (Qdrant insert via client API would require vectors; omitted here)
    results = []
    for t in tasks:
        try:
            results.append(await t)
        except Exception as e:
            results.append({"error": str(e)})
    return {"ok": True, "results": results}
