#!/usr/bin/env python3
"""
NYRA Infisical MCP Server - Secret management through Infisical

This MCP server provides secure secret management capabilities using Infisical,
supporting multiple environments (dev, staging, prod) and advanced secret operations.
"""

import asyncio
import logging
import os
import subprocess
from typing import Any, Dict, List, Optional
from pathlib import Path

from mcp import McpServer, ToolError
from mcp.server import create_server, initialize_logging
from mcp.types import Tool, TextContent
import httpx
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nyra-infisical-mcp")

class SecretRequest(BaseModel):
    """Model for secret requests"""
    name: str
    value: Optional[str] = None
    environment: str = "dev"
    project_id: Optional[str] = None

class InfisicalMCPServer:
    """Infisical MCP server for secret management"""
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
        self.supported_environments = ["dev", "staging", "prod"]
        self.validate_infisical_setup()
    
    def validate_infisical_setup(self) -> None:
        """Validate that Infisical CLI is installed and configured"""
        try:
            result = subprocess.run(
                ["infisical", "--version"], 
                capture_output=True, 
                text=True, 
                check=True
            )
            logger.info(f"Infisical CLI version: {result.stdout.strip()}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise RuntimeError("Infisical CLI not found or not accessible")
        
        # Check if logged in
        try:
            subprocess.run(
                ["infisical", "user", "get", "token"],
                capture_output=True,
                check=True
            )
            logger.info("Infisical authentication verified")
        except subprocess.CalledProcessError:
            logger.warning("Infisical not authenticated - some operations may fail")
    
    async def get_secret(self, name: str, environment: str = "dev", 
                        project_id: Optional[str] = None) -> Dict[str, Any]:
        """Get a secret from Infisical"""
        cmd = ["infisical", "secrets", "get", name, "--env", environment]
        if project_id:
            cmd.extend(["--projectId", project_id])
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # Parse the table output
            lines = result.stdout.strip().split('\n')
            for line in lines[2:]:  # Skip header rows
                if '│' in line:
                    parts = [part.strip() for part in line.split('│')]
                    if len(parts) >= 4 and parts[1] == name:
                        return {
                            "name": parts[1],
                            "value": parts[2],
                            "type": parts[3] if len(parts) > 3 else "shared",
                            "environment": environment
                        }
            
            raise ToolError(f"Secret '{name}' not found in environment '{environment}'")
            
        except subprocess.CalledProcessError as e:
            raise ToolError(f"Failed to get secret: {e.stderr}")
    
    async def set_secret(self, name: str, value: str, environment: str = "dev",
                        project_id: Optional[str] = None) -> Dict[str, Any]:
        """Set a secret in Infisical"""
        cmd = ["infisical", "secrets", "set", f"{name}={value}", "--env", environment]
        if project_id:
            cmd.extend(["--projectId", project_id])
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            return {
                "name": name,
                "environment": environment,
                "status": "success",
                "message": "Secret updated successfully"
            }
            
        except subprocess.CalledProcessError as e:
            raise ToolError(f"Failed to set secret: {e.stderr}")
    
    async def list_secrets(self, environment: str = "dev",
                          project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all secrets in an environment"""
        cmd = ["infisical", "secrets", "get", "--env", environment]
        if project_id:
            cmd.extend(["--projectId", project_id])
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            secrets = []
            lines = result.stdout.strip().split('\n')
            
            for line in lines[2:]:  # Skip header rows
                if '│' in line and '─' not in line:
                    parts = [part.strip() for part in line.split('│')]
                    if len(parts) >= 4:
                        secrets.append({
                            "name": parts[1],
                            "value": parts[2][:20] + "..." if len(parts[2]) > 20 else parts[2],
                            "type": parts[3] if len(parts) > 3 else "shared"
                        })
            
            return secrets
            
        except subprocess.CalledProcessError as e:
            raise ToolError(f"Failed to list secrets: {e.stderr}")
    
    async def delete_secret(self, name: str, environment: str = "dev",
                           project_id: Optional[str] = None) -> Dict[str, Any]:
        """Delete a secret from Infisical"""
        cmd = ["infisical", "secrets", "delete", name, "--env", environment]
        if project_id:
            cmd.extend(["--projectId", project_id])
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            return {
                "name": name,
                "environment": environment,
                "status": "success",
                "message": "Secret deleted successfully"
            }
            
        except subprocess.CalledProcessError as e:
            raise ToolError(f"Failed to delete secret: {e.stderr}")
    
    async def export_secrets(self, environment: str = "dev", 
                            format_type: str = "env") -> str:
        """Export secrets in various formats"""
        if format_type == "env":
            cmd = ["infisical", "run", "--env", environment, "--command", "env"]
        else:
            raise ToolError(f"Unsupported export format: {format_type}")
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result.stdout
            
        except subprocess.CalledProcessError as e:
            raise ToolError(f"Failed to export secrets: {e.stderr}")
    
    async def rotate_secret(self, name: str, environments: List[str],
                           new_value: str) -> Dict[str, Any]:
        """Rotate a secret across multiple environments"""
        results = {}
        
        for env in environments:
            if env not in self.supported_environments:
                results[env] = {"status": "error", "message": f"Unsupported environment: {env}"}
                continue
            
            try:
                result = await self.set_secret(name, new_value, env)
                results[env] = result
            except Exception as e:
                results[env] = {"status": "error", "message": str(e)}
        
        return {
            "secret_name": name,
            "rotation_results": results,
            "environments_updated": [env for env, result in results.items() 
                                   if result.get("status") == "success"]
        }

def create_infisical_server() -> McpServer:
    """Create the Infisical MCP server instance"""
    server = create_server("nyra-infisical-mcp")
    infisical_server = InfisicalMCPServer()
    
    @server.list_tools()
    async def list_tools() -> List[Tool]:
        """List available Infisical tools"""
        return [
            Tool(
                name="get_secret",
                description="Get a secret from Infisical",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Name of the secret"
                        },
                        "environment": {
                            "type": "string",
                            "enum": ["dev", "staging", "prod"],
                            "description": "Environment to get secret from",
                            "default": "dev"
                        },
                        "project_id": {
                            "type": "string",
                            "description": "Optional project ID"
                        }
                    },
                    "required": ["name"]
                }
            ),
            Tool(
                name="set_secret",
                description="Set a secret in Infisical",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Name of the secret"
                        },
                        "value": {
                            "type": "string",
                            "description": "Value of the secret"
                        },
                        "environment": {
                            "type": "string",
                            "enum": ["dev", "staging", "prod"],
                            "description": "Environment to set secret in",
                            "default": "dev"
                        },
                        "project_id": {
                            "type": "string",
                            "description": "Optional project ID"
                        }
                    },
                    "required": ["name", "value"]
                }
            ),
            Tool(
                name="list_secrets",
                description="List all secrets in an environment",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "environment": {
                            "type": "string",
                            "enum": ["dev", "staging", "prod"],
                            "description": "Environment to list secrets from",
                            "default": "dev"
                        },
                        "project_id": {
                            "type": "string",
                            "description": "Optional project ID"
                        }
                    },
                    "required": []
                }
            ),
            Tool(
                name="delete_secret",
                description="Delete a secret from Infisical",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Name of the secret to delete"
                        },
                        "environment": {
                            "type": "string",
                            "enum": ["dev", "staging", "prod"],
                            "description": "Environment to delete secret from",
                            "default": "dev"
                        },
                        "project_id": {
                            "type": "string",
                            "description": "Optional project ID"
                        }
                    },
                    "required": ["name"]
                }
            ),
            Tool(
                name="rotate_secret",
                description="Rotate a secret across multiple environments",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Name of the secret to rotate"
                        },
                        "new_value": {
                            "type": "string",
                            "description": "New secret value"
                        },
                        "environments": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "enum": ["dev", "staging", "prod"]
                            },
                            "description": "Environments to rotate secret in",
                            "default": ["dev", "staging", "prod"]
                        }
                    },
                    "required": ["name", "new_value"]
                }
            ),
            Tool(
                name="export_secrets",
                description="Export secrets in various formats",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "environment": {
                            "type": "string",
                            "enum": ["dev", "staging", "prod"],
                            "description": "Environment to export secrets from",
                            "default": "dev"
                        },
                        "format": {
                            "type": "string",
                            "enum": ["env"],
                            "description": "Export format",
                            "default": "env"
                        }
                    },
                    "required": []
                }
            )
        ]
    
    @server.call_tool()
    async def call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
        """Handle tool calls"""
        
        try:
            if name == "get_secret":
                result = await infisical_server.get_secret(
                    name=arguments["name"],
                    environment=arguments.get("environment", "dev"),
                    project_id=arguments.get("project_id")
                )
                return [TextContent(type="text", text=str(result))]
            
            elif name == "set_secret":
                result = await infisical_server.set_secret(
                    name=arguments["name"],
                    value=arguments["value"],
                    environment=arguments.get("environment", "dev"),
                    project_id=arguments.get("project_id")
                )
                return [TextContent(type="text", text=str(result))]
            
            elif name == "list_secrets":
                result = await infisical_server.list_secrets(
                    environment=arguments.get("environment", "dev"),
                    project_id=arguments.get("project_id")
                )
                return [TextContent(type="text", text=str(result))]
            
            elif name == "delete_secret":
                result = await infisical_server.delete_secret(
                    name=arguments["name"],
                    environment=arguments.get("environment", "dev"),
                    project_id=arguments.get("project_id")
                )
                return [TextContent(type="text", text=str(result))]
            
            elif name == "rotate_secret":
                result = await infisical_server.rotate_secret(
                    name=arguments["name"],
                    new_value=arguments["new_value"],
                    environments=arguments.get("environments", ["dev", "staging", "prod"])
                )
                return [TextContent(type="text", text=str(result))]
            
            elif name == "export_secrets":
                result = await infisical_server.export_secrets(
                    environment=arguments.get("environment", "dev"),
                    format_type=arguments.get("format", "env")
                )
                return [TextContent(type="text", text=result)]
            
            else:
                raise ToolError(f"Unknown tool: {name}")
                
        except Exception as e:
            raise ToolError(f"Tool execution failed: {e}")
    
    return server

async def main():
    """Main entry point"""
    initialize_logging(level="INFO")
    
    # Create and run the server
    server = create_infisical_server()
    await server.run_stdio()

if __name__ == "__main__":
    asyncio.run(main())