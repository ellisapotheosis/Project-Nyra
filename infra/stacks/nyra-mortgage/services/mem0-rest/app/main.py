from __future__ import annotations

import os
import json
import asyncio
import logging
from typing import List, Optional, Dict, Any, Union
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from mem0 import Memory
from mem0_falkordb import register

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Register the FalkorDB plugin
register()

app = FastAPI(title="Mem0 + FalkorDB MCP Service", version="0.3.0")

# Configuration
FALKORDB_HOST = os.getenv("FALKORDB_HOST", "nyra-falkordb")
FALKORDB_PORT = int(os.getenv("FALKORDB_PORT", "6379"))
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Lazy initialization of Mem0
_memory = None

def get_memory():
    global _memory
    if _memory is None:
        config = {
            "graph_store": {
                "provider": "falkordb",
                "config": {
                    "host": FALKORDB_HOST,
                    "port": FALKORDB_PORT,
                    "database": "mem0_nyra",
                },
            },
            "llm": {
                "provider": "openai",
                "config": {
                    "model": os.getenv("MEM0_LLM_MODEL", "gpt-4o-mini"),
                    "api_key": OPENAI_API_KEY,
                },
            },
            "vector_store": {
                "provider": "chroma",
                "config": {
                    "path": "/data/vector_store",
                }
            }
        }
        
        # Override if Qdrant is specified
        if os.getenv("QDRANT_URL"):
            config["vector_store"] = {
                "provider": "qdrant",
                "config": {
                    "url": os.getenv("QDRANT_URL"),
                    "api_key": os.getenv("QDRANT_API_KEY"),
                }
            }
            
        try:
            _memory = Memory.from_config(config)
            logger.info("Mem0 initialized with FalkorDB")
        except Exception as e:
            logger.error(f"Failed to initialize Mem0: {str(e)}")
            raise e
    return _memory

# --- REST Models ---
class AddMemoryReq(BaseModel):
    user_id: str
    text: str
    metadata: Optional[Dict[str, Any]] = None

class SearchReq(BaseModel):
    user_id: str
    query: str
    limit: int = 10

# --- REST Endpoints ---
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "backend": "falkordb",
        "host": FALKORDB_HOST,
        "port": FALKORDB_PORT
    }

@app.post("/memories/add")
def add_memory(req: AddMemoryReq):
    m = get_memory()
    try:
        result = m.add(req.text, user_id=req.user_id, metadata=req.metadata)
        return {"ok": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/memories/search")
def search(req: SearchReq):
    m = get_memory()
    try:
        results = m.search(req.query, user_id=req.user_id, limit=req.limit)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- MCP (Model Context Protocol) via SSE ---
# Very basic MCP implementation for Nexus Router

@app.get("/sse")
async def mcp_sse(request: Request):
    """MCP over SSE endpoint for Nexus/Grafbase."""
    async def event_generator():
        # MCP Handshake and Tool Listing
        # This is a simplified version of the MCP protocol
        # For a full implementation, we'd use mcp-python-sdk
        
        # 1. Send initialization
        yield "event: message\ndata: " + json.dumps({
            "jsonrpc": "2.0",
            "method": "notifications/initialized"
        }) + "\n\n"
        
        # Keep connection alive
        while True:
            if await request.is_disconnected():
                break
            await asyncio.sleep(15)
            yield "event: ping\ndata: {}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/mcp/rpc")
async def mcp_rpc(request: Request):
    """Handle MCP JSON-RPC calls from Nexus."""
    body = await request.json()
    method = body.get("method")
    params = body.get("params", {})
    rpc_id = body.get("id")
    
    m = get_memory()
    
    try:
        if method == "tools/list":
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "result": {
                    "tools": [
                        {
                            "name": "mem0_add",
                            "description": "Store a new memory for a user",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "user_id": {"type": "string"},
                                    "text": {"type": "string"},
                                    "metadata": {"type": "object"}
                                },
                                "required": ["user_id", "text"]
                            }
                        },
                        {
                            "name": "mem0_search",
                            "description": "Search user memories",
                            "inputSchema": {
                                "type": "object",
                                "properties": {
                                    "user_id": {"type": "string"},
                                    "query": {"type": "string"},
                                    "limit": {"type": "integer"}
                                },
                                "required": ["user_id", "query"]
                            }
                        }
                    ]
                }
            }
            
        elif method == "tools/call":
            tool_name = params.get("name")
            args = params.get("arguments", {})
            
            if tool_name == "mem0_add":
                res = m.add(args["text"], user_id=args["user_id"], metadata=args.get("metadata"))
                return {
                    "jsonrpc": "2.0",
                    "id": rpc_id,
                    "result": {"content": [{"type": "text", "text": f"Memory added: {json.dumps(res)}"}]}
                }
            elif tool_name == "mem0_search":
                res = m.search(args["query"], user_id=args["user_id"], limit=args.get("limit", 10))
                return {
                    "jsonrpc": "2.0",
                    "id": rpc_id,
                    "result": {"content": [{"type": "text", "text": json.dumps(res)}]}
                }
            
        return {
            "jsonrpc": "2.0",
            "id": rpc_id,
            "error": {"code": -32601, "message": "Method not found"}
        }
    except Exception as e:
        return {
            "jsonrpc": "2.0",
            "id": rpc_id,
            "error": {"code": -32000, "message": str(e)}
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
