#!/usr/bin/env python3
"""
NYRA Archon MCP Server - Agent orchestration and workflow management

This MCP server provides sophisticated agent orchestration capabilities,
managing the hot-potato development workflow and multi-agent coordination.
"""

import asyncio
import logging
import json
from datetime import datetime
from typing import Any, Dict, List, Optional, Enum
from dataclasses import dataclass, asdict
from pathlib import Path
import uuid

from mcp import McpServer, ToolError
from mcp.server import create_server, initialize_logging
from mcp.types import Tool, TextContent
import httpx
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nyra-archon-mcp")

class AgentRole(Enum):
    """Available agent roles in the NYRA system"""
    LEAD_CODER = "lead_coder"
    MORPH_DSPY = "morph_dspy" 
    DEBUG_AIDER = "debug_aider"
    SMALL_CODE = "small_code"
    EXTERNAL_REVIEWER = "external_reviewer"
    BROWSER_PC = "browser_pc"
    MEMORY_MANAGER = "memory_manager"
    VOICE_INTERFACE = "voice_interface"

class TaskStatus(Enum):
    """Task execution status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"

class WorkflowType(Enum):
    """Types of workflows supported"""
    HOT_POTATO = "hot_potato"
    PARALLEL_REVIEW = "parallel_review"
    SEQUENTIAL_PIPELINE = "sequential_pipeline"
    EMERGENCY_RESPONSE = "emergency_response"

@dataclass
class Agent:
    """Agent configuration and state"""
    id: str
    role: AgentRole
    name: str
    endpoint: str
    capabilities: List[str]
    current_task: Optional[str] = None
    status: str = "idle"
    last_activity: Optional[datetime] = None
    performance_metrics: Dict[str, float] = None
    
    def __post_init__(self):
        if self.performance_metrics is None:
            self.performance_metrics = {
                "completion_rate": 0.0,
                "avg_response_time": 0.0,
                "quality_score": 0.0
            }

@dataclass
class Task:
    """Task definition and tracking"""
    id: str
    title: str
    description: str
    assigned_agent: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    dependencies: List[str] = None
    artifacts: Dict[str, Any] = None
    diffs: List[Dict[str, Any]] = None
    tests: List[Dict[str, Any]] = None
    rationale: str = ""
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.dependencies is None:
            self.dependencies = []
        if self.artifacts is None:
            self.artifacts = {}
        if self.diffs is None:
            self.diffs = []
        if self.tests is None:
            self.tests = []

@dataclass
class Workflow:
    """Workflow definition and state"""
    id: str
    name: str
    type: WorkflowType
    tasks: List[str]
    current_task: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()

class ArchonMCPServer:
    """Archon MCP server for agent orchestration"""
    
    def __init__(self):
        self.agents: Dict[str, Agent] = {}
        self.tasks: Dict[str, Task] = {}
        self.workflows: Dict[str, Workflow] = {}
        self.client = httpx.AsyncClient(timeout=30.0)
        self.initialize_default_agents()
    
    def initialize_default_agents(self) -> None:
        """Initialize the default NYRA agent ecosystem"""
        default_agents = [
            Agent(
                id="lead-coder-001",
                role=AgentRole.LEAD_CODER,
                name="Lead Architecture Agent",
                endpoint="http://localhost:4001",
                capabilities=[
                    "architecture_decisions",
                    "code_review", 
                    "technical_leadership",
                    "system_design"
                ]
            ),
            Agent(
                id="morph-dspy-001",
                role=AgentRole.MORPH_DSPY,
                name="Code Transformation Agent", 
                endpoint="http://localhost:4002",
                capabilities=[
                    "minimal_diff_refactoring",
                    "code_transformation",
                    "pattern_optimization",
                    "dependency_management"
                ]
            ),
            Agent(
                id="debug-aider-001",
                role=AgentRole.DEBUG_AIDER,
                name="Debug & Resolution Agent",
                endpoint="http://localhost:4003", 
                capabilities=[
                    "bug_detection",
                    "issue_resolution",
                    "debugging_workflows",
                    "error_analysis"
                ]
            ),
            Agent(
                id="small-code-001",
                role=AgentRole.SMALL_CODE,
                name="Feature Implementation Agent",
                endpoint="http://localhost:4004",
                capabilities=[
                    "feature_implementation",
                    "small_code_changes",
                    "focused_development",
                    "unit_testing"
                ]
            ),
            Agent(
                id="external-reviewer-001", 
                role=AgentRole.EXTERNAL_REVIEWER,
                name="Quality Assurance Agent",
                endpoint="http://localhost:4005",
                capabilities=[
                    "code_quality_review",
                    "security_assessment",
                    "performance_analysis",
                    "best_practices_validation"
                ]
            ),
            Agent(
                id="browser-pc-001",
                role=AgentRole.BROWSER_PC,
                name="UI Testing Agent",
                endpoint="http://localhost:4006",
                capabilities=[
                    "ui_testing",
                    "browser_automation",
                    "integration_testing",
                    "user_experience_validation"
                ]
            ),
            Agent(
                id="memory-manager-001",
                role=AgentRole.MEMORY_MANAGER,
                name="Context Management Agent", 
                endpoint="http://localhost:4007",
                capabilities=[
                    "context_management",
                    "knowledge_persistence",
                    "memory_optimization",
                    "data_retrieval"
                ]
            ),
            Agent(
                id="voice-interface-001",
                role=AgentRole.VOICE_INTERFACE,
                name="Voice Interaction Agent",
                endpoint="http://localhost:4008", 
                capabilities=[
                    "voice_processing",
                    "natural_language_interface",
                    "speech_recognition",
                    "voice_synthesis"
                ]
            )
        ]
        
        for agent in default_agents:
            self.agents[agent.id] = agent
        
        logger.info(f"Initialized {len(default_agents)} default agents")
    
    async def create_task(self, title: str, description: str, 
                         assigned_agent: Optional[str] = None,
                         dependencies: List[str] = None) -> Task:
        """Create a new task"""
        task = Task(
            id=str(uuid.uuid4()),
            title=title,
            description=description,
            assigned_agent=assigned_agent,
            dependencies=dependencies or []
        )
        
        self.tasks[task.id] = task
        
        # Auto-assign if agent specified
        if assigned_agent and assigned_agent in self.agents:
            await self.assign_task(task.id, assigned_agent)
        
        return task
    
    async def assign_task(self, task_id: str, agent_id: str) -> bool:
        """Assign a task to an agent"""
        if task_id not in self.tasks or agent_id not in self.agents:
            return False
        
        task = self.tasks[task_id]
        agent = self.agents[agent_id]
        
        # Check if agent is available
        if agent.status != "idle":
            return False
        
        # Update task and agent
        task.assigned_agent = agent_id
        task.status = TaskStatus.IN_PROGRESS
        task.started_at = datetime.now()
        
        agent.current_task = task_id
        agent.status = "busy"
        agent.last_activity = datetime.now()
        
        logger.info(f"Assigned task {task_id} to agent {agent_id}")
        return True
    
    async def complete_task(self, task_id: str, diffs: List[Dict[str, Any]] = None,
                           tests: List[Dict[str, Any]] = None, 
                           rationale: str = "") -> bool:
        """Complete a task with artifacts"""
        if task_id not in self.tasks:
            return False
        
        task = self.tasks[task_id]
        
        # Update task completion
        task.status = TaskStatus.COMPLETED
        task.completed_at = datetime.now()
        task.diffs = diffs or []
        task.tests = tests or []
        task.rationale = rationale
        
        # Free up the assigned agent
        if task.assigned_agent and task.assigned_agent in self.agents:
            agent = self.agents[task.assigned_agent]
            agent.current_task = None
            agent.status = "idle"
            agent.last_activity = datetime.now()
        
        logger.info(f"Completed task {task_id}")
        return True
    
    async def create_hot_potato_workflow(self, name: str, 
                                        task_definitions: List[Dict[str, Any]]) -> Workflow:
        """Create a hot-potato workflow"""
        workflow_id = str(uuid.uuid4())
        
        # Create tasks for the workflow
        task_ids = []
        for i, task_def in enumerate(task_definitions):
            # Set dependencies for sequential execution
            dependencies = [task_ids[-1]] if i > 0 else []
            
            task = await self.create_task(
                title=task_def.get("title", f"Task {i+1}"),
                description=task_def.get("description", ""),
                assigned_agent=task_def.get("assigned_agent"),
                dependencies=dependencies
            )
            task_ids.append(task.id)
        
        workflow = Workflow(
            id=workflow_id,
            name=name,
            type=WorkflowType.HOT_POTATO,
            tasks=task_ids,
            current_task=task_ids[0] if task_ids else None
        )
        
        self.workflows[workflow_id] = workflow
        
        logger.info(f"Created hot-potato workflow {workflow_id} with {len(task_ids)} tasks")
        return workflow
    
    async def advance_workflow(self, workflow_id: str) -> bool:
        """Advance workflow to next task"""
        if workflow_id not in self.workflows:
            return False
        
        workflow = self.workflows[workflow_id]
        
        if not workflow.current_task:
            return False
        
        current_task = self.tasks.get(workflow.current_task)
        if not current_task or current_task.status != TaskStatus.COMPLETED:
            return False
        
        # Find next task
        current_index = workflow.tasks.index(workflow.current_task)
        if current_index + 1 >= len(workflow.tasks):
            # Workflow complete
            workflow.status = TaskStatus.COMPLETED
            workflow.current_task = None
            return True
        
        # Move to next task
        next_task_id = workflow.tasks[current_index + 1]
        workflow.current_task = next_task_id
        
        # Try to auto-assign based on task requirements
        next_task = self.tasks.get(next_task_id)
        if next_task and not next_task.assigned_agent:
            # Find best available agent
            available_agents = [a for a in self.agents.values() if a.status == "idle"]
            if available_agents:
                # Simple assignment - could be more sophisticated
                best_agent = available_agents[0]
                await self.assign_task(next_task_id, best_agent.id)
        
        return True
    
    async def get_agent_status(self, agent_id: Optional[str] = None) -> Dict[str, Any]:
        """Get status of agents"""
        if agent_id:
            if agent_id not in self.agents:
                return {"error": "Agent not found"}
            agent = self.agents[agent_id]
            return asdict(agent)
        
        return {
            "agents": {aid: asdict(agent) for aid, agent in self.agents.items()},
            "summary": {
                "total": len(self.agents),
                "idle": len([a for a in self.agents.values() if a.status == "idle"]),
                "busy": len([a for a in self.agents.values() if a.status == "busy"])
            }
        }
    
    async def get_task_status(self, task_id: Optional[str] = None) -> Dict[str, Any]:
        """Get status of tasks"""
        if task_id:
            if task_id not in self.tasks:
                return {"error": "Task not found"}
            task = self.tasks[task_id]
            return asdict(task)
        
        return {
            "tasks": {tid: asdict(task) for tid, task in self.tasks.items()},
            "summary": {
                "total": len(self.tasks),
                "pending": len([t for t in self.tasks.values() if t.status == TaskStatus.PENDING]),
                "in_progress": len([t for t in self.tasks.values() if t.status == TaskStatus.IN_PROGRESS]),
                "completed": len([t for t in self.tasks.values() if t.status == TaskStatus.COMPLETED])
            }
        }

def create_archon_server() -> McpServer:
    """Create the Archon MCP server instance"""
    server = create_server("nyra-archon-mcp")
    archon_server = ArchonMCPServer()
    
    @server.list_tools()
    async def list_tools() -> List[Tool]:
        """List available Archon tools"""
        return [
            Tool(
                name="create_task",
                description="Create a new task in the orchestration system",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "description": "Task title"},
                        "description": {"type": "string", "description": "Task description"},
                        "assigned_agent": {"type": "string", "description": "Optional agent ID to assign task to"},
                        "dependencies": {
                            "type": "array", 
                            "items": {"type": "string"},
                            "description": "List of task IDs this task depends on"
                        }
                    },
                    "required": ["title", "description"]
                }
            ),
            Tool(
                name="assign_task",
                description="Assign a task to a specific agent",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "task_id": {"type": "string", "description": "Task ID"},
                        "agent_id": {"type": "string", "description": "Agent ID"}
                    },
                    "required": ["task_id", "agent_id"]
                }
            ),
            Tool(
                name="complete_task",
                description="Mark a task as completed with artifacts",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "task_id": {"type": "string", "description": "Task ID"},
                        "diffs": {"type": "array", "description": "Code diffs produced"},
                        "tests": {"type": "array", "description": "Tests written/run"},
                        "rationale": {"type": "string", "description": "Explanation of changes made"}
                    },
                    "required": ["task_id"]
                }
            ),
            Tool(
                name="create_hot_potato_workflow",
                description="Create a hot-potato development workflow",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "description": "Workflow name"},
                        "tasks": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "title": {"type": "string"},
                                    "description": {"type": "string"},
                                    "assigned_agent": {"type": "string"}
                                }
                            },
                            "description": "List of task definitions"
                        }
                    },
                    "required": ["name", "tasks"]
                }
            ),
            Tool(
                name="get_agent_status",
                description="Get status of agents",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "agent_id": {"type": "string", "description": "Optional specific agent ID"}
                    },
                    "required": []
                }
            ),
            Tool(
                name="get_task_status", 
                description="Get status of tasks",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "task_id": {"type": "string", "description": "Optional specific task ID"}
                    },
                    "required": []
                }
            ),
            Tool(
                name="advance_workflow",
                description="Advance a workflow to the next task",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "workflow_id": {"type": "string", "description": "Workflow ID"}
                    },
                    "required": ["workflow_id"]
                }
            )
        ]
    
    @server.call_tool()
    async def call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
        """Handle tool calls"""
        
        try:
            if name == "create_task":
                task = await archon_server.create_task(
                    title=arguments["title"],
                    description=arguments["description"],
                    assigned_agent=arguments.get("assigned_agent"),
                    dependencies=arguments.get("dependencies", [])
                )
                return [TextContent(type="text", text=json.dumps(asdict(task), default=str))]
            
            elif name == "assign_task":
                success = await archon_server.assign_task(
                    task_id=arguments["task_id"],
                    agent_id=arguments["agent_id"]
                )
                return [TextContent(type="text", text=json.dumps({"success": success}))]
            
            elif name == "complete_task":
                success = await archon_server.complete_task(
                    task_id=arguments["task_id"],
                    diffs=arguments.get("diffs", []),
                    tests=arguments.get("tests", []),
                    rationale=arguments.get("rationale", "")
                )
                return [TextContent(type="text", text=json.dumps({"success": success}))]
            
            elif name == "create_hot_potato_workflow":
                workflow = await archon_server.create_hot_potato_workflow(
                    name=arguments["name"],
                    task_definitions=arguments["tasks"]
                )
                return [TextContent(type="text", text=json.dumps(asdict(workflow), default=str))]
            
            elif name == "get_agent_status":
                status = await archon_server.get_agent_status(
                    agent_id=arguments.get("agent_id")
                )
                return [TextContent(type="text", text=json.dumps(status, default=str))]
            
            elif name == "get_task_status":
                status = await archon_server.get_task_status(
                    task_id=arguments.get("task_id")
                )
                return [TextContent(type="text", text=json.dumps(status, default=str))]
            
            elif name == "advance_workflow":
                success = await archon_server.advance_workflow(
                    workflow_id=arguments["workflow_id"]
                )
                return [TextContent(type="text", text=json.dumps({"success": success}))]
            
            else:
                raise ToolError(f"Unknown tool: {name}")
                
        except Exception as e:
            raise ToolError(f"Tool execution failed: {e}")
    
    return server

async def main():
    """Main entry point"""
    initialize_logging(level="INFO")
    
    # Create and run the server
    server = create_archon_server()
    await server.run_stdio()

if __name__ == "__main__":
    asyncio.run(main())