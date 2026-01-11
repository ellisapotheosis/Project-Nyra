from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import os

app = FastAPI(title="Mem0 REST API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

memory_store = {}

class Memory(BaseModel):
    user_id: str
    content: str
    metadata: Optional[dict] = {}

class MemoryResponse(BaseModel):
    memory_id: str
    user_id: str
    content: str
    metadata: dict
    created_at: datetime

@app.post("/memories", response_model=MemoryResponse)
async def create_memory(memory: Memory):
    memory_id = f"MEM{datetime.now().strftime('%Y%m%d%H%M%S%f')[:-3]}"
    mem_data = MemoryResponse(
        memory_id=memory_id,
        user_id=memory.user_id,
        content=memory.content,
        metadata=memory.metadata or {},
        created_at=datetime.now()
    )
    if memory.user_id not in memory_store:
        memory_store[memory.user_id] = []
    memory_store[memory.user_id].append(mem_data)
    return mem_data

@app.get("/memories/{user_id}", response_model=List[MemoryResponse])
async def get_memories(user_id: str):
    if user_id not in memory_store:
        return []
    return memory_store[user_id]

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "mem0-rest"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4321)
