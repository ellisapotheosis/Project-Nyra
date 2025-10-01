#!/usr/bin/env python3
"""
NYRA MetaMCP Server - Orchestrates and manages multiple MCP servers

This server acts as a central orchestrator for all NYRA MCP servers,
providing unified routing, load balancing, and service discovery.
"""

import asyncio
import logging
from typing import Any, Dict, List, Optional
from dataclasses import dataclass
from pathlib import Path

from mcp import McpServer, Response, ResourceError, ToolError
from mcp.server import create_server, initialize_logging
from mcp.types import Resource, Tool, TextContent
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nyra-metamcp")

@dataclass
class MCPServerConfig:
    """Configuration for an individual MCP server"""
    name: str
    url: str
    port: int
    enabled: bool = True
    health_endpoint: str = "/health"
    priority: int = 1  # Lower = higher priority
    tags: List[str] = None
    
    def __post_init__(self):
        if self.tags is None:
            self.tags = []

class MetaMCPServer:
    """MetaMCP orchestrator server"""
    
    def __init__(self):
        self.servers: Dict[str, MCPServerConfig] = {}
        self.client = httpx.AsyncClient(timeout=30.0)
        self.load_server_configs()
    
    def load_server_configs(self) -> None:
        """Load MCP server configurations"""
        # Core NYRA MCP servers
        self.servers.update({
            "infisical": MCPServerConfig(
                name="infisical",
                url="http://localhost:3001",
                port=3001,
                tags=["secrets", "auth", "config"]
            ),
            "archon": MCPServerConfig(
                name="archon", 
                url="http://localhost:3002",
                port=3002,
                tags=["agents", "orchestration", "workflow"]
            ),
            "qdrant": MCPServerConfig(
                name="qdrant",
                url="http://localhost:3003", 
                port=3003,
                tags=["vector", "search", "embeddings"]
            ),
            "mem0": MCPServerConfig(
                name="mem0",
                url="http://localhost:3004",
                port=3004,
                tags=["memory", "context", "persistence"]
            ),
            "zep": MCPServerConfig(
                name="zep",
                url="http://localhost:3005",
                port=3005,
                tags=["memory", "conversation", "history"]
            )
        })
        
        logger.info(f"Loaded {len(self.servers)} MCP server configurations")
    
    async def health_check(self, server_name: str) -> bool:
        """Check if an MCP server is healthy"""
        if server_name not in self.servers:
            return False
            
        server = self.servers[server_name]
        try:
            response = await self.client.get(
                f"{server.url}{server.health_endpoint}",
                timeout=5.0
            )
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"Health check failed for {server_name}: {e}")
            return False
    
    async def get_available_servers(self, tags: List[str] = None) -> List[MCPServerConfig]:
        """Get list of available servers, optionally filtered by tags"""
        available = []
        
        for server in self.servers.values():
            if not server.enabled:
                continue
                
            # Filter by tags if provided
            if tags and not any(tag in server.tags for tag in tags):
                continue
                
            if await self.health_check(server.name):
                available.append(server)
        
        # Sort by priority
        return sorted(available, key=lambda x: x.priority)
    
    async def route_request(self, endpoint: str, method: str = "GET", 
                          data: Any = None, tags: List[str] = None) -> Dict[str, Any]:
        """Route a request to appropriate MCP server"""
        available_servers = await self.get_available_servers(tags)
        
        if not available_servers:
            raise HTTPException(
                status_code=503, 
                detail=f"No available servers for tags: {tags}"
            )
        
        # Try servers in priority order
        last_error = None
        for server in available_servers:
            try:
                url = f"{server.url}{endpoint}"
                
                if method.upper() == "GET":
                    response = await self.client.get(url)
                elif method.upper() == "POST":
                    response = await self.client.post(url, json=data)
                else:
                    raise ValueError(f"Unsupported HTTP method: {method}")
                
                if response.status_code == 200:
                    return {
                        "server": server.name,
                        "data": response.json(),
                        "status": "success"
                    }
                    
            except Exception as e:
                last_error = e
                logger.warning(f"Request to {server.name} failed: {e}")
                continue
        
        raise HTTPException(
            status_code=502,
            detail=f"All servers failed. Last error: {last_error}"
        )

# Create FastAPI app for HTTP endpoints
app = FastAPI(title="NYRA MetaMCP", version="0.1.0")
meta_server = MetaMCPServer()

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "metamcp"}

@app.get("/servers")
async def list_servers():
    """List all configured MCP servers with their status"""
    servers_status = {}
    
    for name, config in meta_server.servers.items():
        is_healthy = await meta_server.health_check(name)
        servers_status[name] = {
            "config": config.__dict__,
            "healthy": is_healthy,
            "url": config.url
        }
    
    return servers_status

@app.post("/route/{service}")
async def route_to_service(service: str, endpoint: str = "/", data: dict = None):
    """Route request to specific service"""
    if service not in meta_server.servers:
        raise HTTPException(status_code=404, detail=f"Service {service} not found")
    
    return await meta_server.route_request(
        endpoint=endpoint,
        method="POST",
        data=data,
        tags=[service]
    )

@app.post("/query")
async def smart_route(query: dict):
    """Intelligently route query based on content and tags"""
    tags = query.get("tags", [])
    endpoint = query.get("endpoint", "/")
    data = query.get("data")
    method = query.get("method", "POST")
    
    return await meta_server.route_request(
        endpoint=endpoint,
        method=method,
        data=data,
        tags=tags
    )

# MCP Server implementation
def create_metamcp_server() -> McpServer:
    """Create the MetaMCP server instance"""
    server = create_server("nyra-metamcp")
    
    @server.list_tools()
    async def list_tools() -> List[Tool]:
        """List available MetaMCP tools"""
        return [
            Tool(
                name="route_mcp_request",
                description="Route a request to appropriate MCP server based on tags and content",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "tags": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Tags to filter servers (e.g., 'secrets', 'memory', 'vector')"
                        },
                        "endpoint": {
                            "type": "string",
                            "description": "API endpoint to call"
                        },
                        "data": {
                            "type": "object",
                            "description": "Request payload"
                        }
                    },
                    "required": ["endpoint"]
                }
            ),
            Tool(
                name="list_mcp_servers",
                description="List all available MCP servers and their status",
                inputSchema={
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            ),
            Tool(
                name="health_check_servers",
                description="Check health status of all MCP servers",
                inputSchema={
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            )
        ]
    
    @server.call_tool()
    async def call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
        """Handle tool calls"""
        
        if name == "route_mcp_request":
            try:
                result = await meta_server.route_request(
                    endpoint=arguments.get("endpoint", "/"),
                    method="POST",
                    data=arguments.get("data"),
                    tags=arguments.get("tags", [])
                )
                return [TextContent(type="text", text=str(result))]
            except Exception as e:
                raise ToolError(f"Routing failed: {e}")
        
        elif name == "list_mcp_servers":
            servers_status = {}
            for name, config in meta_server.servers.items():
                is_healthy = await meta_server.health_check(name)
                servers_status[name] = {
                    "url": config.url,
                    "port": config.port,
                    "tags": config.tags,
                    "healthy": is_healthy,
                    "enabled": config.enabled
                }
            
            return [TextContent(type="text", text=str(servers_status))]
        
        elif name == "health_check_servers":
            health_results = {}
            for server_name in meta_server.servers:
                health_results[server_name] = await meta_server.health_check(server_name)
            
            return [TextContent(type="text", text=str(health_results))]
        
        else:
            raise ToolError(f"Unknown tool: {name}")
    
    return server

async def main():
    """Main entry point"""
    # Initialize logging
    initialize_logging(level="INFO")
    
    # Create and start the MCP server
    mcp_server = create_metamcp_server()
    
    # Start FastAPI server in the background
    import uvicorn
    config = uvicorn.Config(app, host="localhost", port=3000, log_level="info")
    http_server = uvicorn.Server(config)
    
    # Run both servers
    await asyncio.gather(
        mcp_server.run_stdio(),
        http_server.serve()
    )

if __name__ == "__main__":
    asyncio.run(main())