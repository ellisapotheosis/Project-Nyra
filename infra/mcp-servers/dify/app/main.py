# Dify MCP Proxy - FastAPI application
# Exposes Dify apps as MCP tools

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import httpx
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Dify MCP Proxy",
    version="1.0.0",
    description="MCP proxy for Dify AI applications"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
DIFY_API_URL = os.getenv("DIFY_API_URL", "http://dify-api:5001")
DIFY_API_KEY = os.getenv("DIFY_API_KEY", "")
DIFY_APP_ID = os.getenv("DIFY_APP_ID", "")

# =============================================================================
# DATA MODELS
# =============================================================================

class WorkflowRequest(BaseModel):
    """Run Dify workflow"""
    workflow_id: Optional[str] = None
    inputs: Dict[str, Any] = Field(default_factory=dict)
    user: str = Field(default="default_user")

class ChatRequest(BaseModel):
    """Chat with Dify agent"""
    message: str
    conversation_id: Optional[str] = None
    user: str = Field(default="default_user")

class AppInfoRequest(BaseModel):
    """Get app information"""
    app_id: Optional[str] = None

# =============================================================================
# MCP TOOL ENDPOINTS
# =============================================================================

@app.post("/tools/run_workflow")
async def run_workflow(request: WorkflowRequest):
    """Execute a Dify workflow"""
    try:
        app_id = request.workflow_id or DIFY_APP_ID
        if not app_id:
            raise HTTPException(status_code=400, detail="No workflow_id or DIFY_APP_ID configured")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{DIFY_API_URL}/v1/workflows/run",
                json={
                    "inputs": request.inputs,
                    "response_mode": "blocking",
                    "user": request.user
                },
                headers={
                    "Authorization": f"Bearer {DIFY_API_KEY}",
                    "Content-Type": "application/json"
                },
                timeout=60.0
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPError as e:
        logger.error(f"Dify API error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Dify API error: {str(e)}")
    except Exception as e:
        logger.error(f"Error running workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tools/chat")
async def chat(request: ChatRequest):
    """Chat with Dify agent"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{DIFY_API_URL}/v1/chat-messages",
                json={
                    "query": request.message,
                    "conversation_id": request.conversation_id,
                    "user": request.user,
                    "response_mode": "blocking"
                },
                headers={
                    "Authorization": f"Bearer {DIFY_API_KEY}",
                    "Content-Type": "application/json"
                },
                timeout=60.0
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPError as e:
        logger.error(f"Dify API error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Dify API error: {str(e)}")
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tools/get_app_info")
async def get_app_info(app_id: Optional[str] = None):
    """Get Dify app information"""
    try:
        target_app_id = app_id or DIFY_APP_ID
        if not target_app_id:
            raise HTTPException(status_code=400, detail="No app_id provided or DIFY_APP_ID configured")

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{DIFY_API_URL}/v1/parameters",
                headers={
                    "Authorization": f"Bearer {DIFY_API_KEY}"
                },
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPError as e:
        logger.error(f"Dify API error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Dify API error: {str(e)}")
    except Exception as e:
        logger.error(f"Error getting app info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tools/list_apps")
async def list_apps():
    """List available Dify apps"""
    return {
        "apps": [
            {
                "id": DIFY_APP_ID,
                "name": "Default Dify App",
                "type": "configured",
                "description": "Configured Dify application"
            }
        ],
        "configured_app_id": DIFY_APP_ID,
        "api_url": DIFY_API_URL
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "dify-mcp-proxy",
        "dify_api_url": DIFY_API_URL,
        "dify_app_configured": bool(DIFY_APP_ID)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8083)
