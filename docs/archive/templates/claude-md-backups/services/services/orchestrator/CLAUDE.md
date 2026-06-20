# Orchestrator - General Task Orchestration Service

## 🎯 SERVICE CONTEXT

**Purpose**: Python service providing general task orchestration, workflow management, and service coordination for Project Nyra operations.

**Port**: Dynamic (configured per deployment)
**Language**: Python 3.11
**Dependencies**: asyncio, httpx, pydantic
**Template**: CLAUDE-MD-Python.md (mesh topology for task coordination)

## 🚨 CRITICAL DEVELOPMENT RULES

### Parallel Task Development Pattern
**MANDATORY**: All task handlers, coordinators, and executors MUST be developed in parallel:

```python
# ✅ CORRECT: Batch development in ONE message
[Single Message]:
  # Task handlers
  - Write("app/handlers/task_router.py", taskRoutingLogic)
  - Write("app/handlers/service_coordinator.py", serviceCoordination)
  - Write("app/handlers/state_manager.py", statePersistence)

  # Execution strategies
  - Write("app/execution/parallel.py", parallelExecution)
  - Write("app/execution/sequential.py", sequentialExecution)
  - Write("app/execution/conditional.py", conditionalBranching)

  # Models
  - Write("app/models/task.py", taskModels)
  - Write("app/models/execution.py", executionModels)

  # Tests
  - Write("tests/test_orchestration.py", orchestrationTests)
  - Bash("pytest -n auto tests/")
```

### Orchestration-First Design
**CRITICAL**: Design for distributed execution:

- **Task Isolation**: Each task independent and idempotent
- **State Management**: Persistent state across execution retries
- **Error Recovery**: Graceful degradation and retry strategies
- **Service Discovery**: Dynamic service endpoint resolution
- **Load Distribution**: Balance work across available workers
- **Result Aggregation**: Collect and combine distributed results

## 📊 ORCHESTRATOR ARCHITECTURE

### Task Execution Pipeline
```
Task Request → Validation → Dependency Resolution → Execution Plan
    ↓
Task Distribution → Worker Assignment → Parallel/Sequential Execution
    ↓
Result Collection → Aggregation → State Update → Response
    ↓
If Error: Retry Logic → Fallback Strategy → Manual Intervention
```

### Orchestration Patterns

**1. Parallel Execution**
- Execute independent tasks concurrently
- Aggregate results when all complete
- Fail fast or continue on error (configurable)

**2. Sequential Execution**
- Execute tasks in defined order
- Pass results between steps
- Stop on first error or continue

**3. Conditional Branching**
- Execute different paths based on conditions
- Dynamic workflow adaptation
- A/B testing support

**4. Fan-Out/Fan-In**
- Distribute work to multiple workers
- Collect and aggregate results
- Handle partial failures

## 🐝 ORCHESTRATOR SWARM

### Agent Configuration
```yaml
topology: mesh  # Optimal for distributed coordination
maxAgents: 6
strategy: parallel
language: python

agents:
  task_router:
    role: Task Distribution & Routing
    focus: [task-analysis, dependency-resolution, worker-selection]
    responsibilities:
      - Analyze task dependencies
      - Resolve execution order
      - Select optimal workers
      - Handle task distribution
    concurrent_tasks: [multiple-tasks, parallel-routing]

  state_manager:
    role: Execution State Persistence
    focus: [state-storage, recovery, consistency]
    responsibilities:
      - Persist execution state
      - Handle state recovery
      - Ensure consistency
      - Track progress
    concurrent_tasks: [multiple-states, parallel-updates]

  service_coordinator:
    role: Microservice Integration
    focus: [service-discovery, health-checks, failover]
    responsibilities:
      - Discover available services
      - Monitor service health
      - Handle failover
      - Load balancing
    concurrent_tasks: [multiple-services, parallel-coordination]

  execution_engine:
    role: Task Execution Management
    focus: [parallel-execution, error-handling, timeout-management]
    responsibilities:
      - Execute tasks (parallel/sequential)
      - Handle timeouts
      - Manage retries
      - Collect results
    concurrent_tasks: [multiple-executions, parallel-processing]

  result_aggregator:
    role: Result Collection & Transformation
    focus: [result-collection, aggregation, transformation]
    responsibilities:
      - Collect distributed results
      - Aggregate partial results
      - Transform output format
      - Handle partial failures
    concurrent_tasks: [multiple-results, parallel-aggregation]

  monitoring_agent:
    role: Orchestration Observability
    focus: [metrics, logging, alerting]
    responsibilities:
      - Track execution metrics
      - Log orchestration events
      - Generate alerts
      - Performance monitoring
    concurrent_tasks: [multiple-metrics, parallel-logging]
```

## 🔧 PYTHON PATTERNS

### Task Orchestration
```python
import asyncio
from typing import List, Dict, Any, Callable, Optional
from pydantic import BaseModel
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"

class Task(BaseModel):
    id: str
    name: str
    handler: str  # Function/service to execute
    dependencies: List[str] = []  # Task IDs that must complete first
    timeout: int = 30  # seconds
    max_retries: int = 3
    retry_count: int = 0
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[Any] = None
    error: Optional[str] = None

class ExecutionPlan(BaseModel):
    id: str
    tasks: List[Task]
    strategy: str  # "parallel", "sequential", "conditional"
    status: TaskStatus = TaskStatus.PENDING

class Orchestrator:
    """Main orchestration engine"""

    def __init__(self):
        self.handlers: Dict[str, Callable] = {}
        self.services: Dict[str, str] = {}  # service_name -> endpoint

    def register_handler(self, name: str, handler: Callable):
        """Register task handler function"""
        self.handlers[name] = handler

    def register_service(self, name: str, endpoint: str):
        """Register microservice endpoint"""
        self.services[name] = endpoint

    async def execute_parallel(self, tasks: List[Task]) -> List[Any]:
        """Execute tasks in parallel"""
        async def execute_task(task: Task):
            try:
                task.status = TaskStatus.RUNNING

                handler = self.handlers.get(task.handler)
                if not handler:
                    # Try to call remote service
                    result = await self._call_service(task.handler, task)
                else:
                    # Execute local handler
                    result = await asyncio.wait_for(
                        handler(task),
                        timeout=task.timeout
                    )

                task.status = TaskStatus.COMPLETED
                task.result = result
                return result

            except asyncio.TimeoutError:
                task.status = TaskStatus.FAILED
                task.error = f"Task timed out after {task.timeout}s"

                if task.retry_count < task.max_retries:
                    task.retry_count += 1
                    task.status = TaskStatus.RETRYING
                    return await execute_task(task)

                raise

            except Exception as e:
                task.status = TaskStatus.FAILED
                task.error = str(e)

                if task.retry_count < task.max_retries:
                    task.retry_count += 1
                    task.status = TaskStatus.RETRYING
                    await asyncio.sleep(2 ** task.retry_count)  # Exponential backoff
                    return await execute_task(task)

                raise

        # Execute all tasks concurrently
        results = await asyncio.gather(
            *[execute_task(task) for task in tasks],
            return_exceptions=True
        )

        return results

    async def execute_sequential(self, tasks: List[Task]) -> List[Any]:
        """Execute tasks sequentially"""
        results = []

        for task in tasks:
            try:
                task.status = TaskStatus.RUNNING

                handler = self.handlers.get(task.handler)
                if not handler:
                    result = await self._call_service(task.handler, task)
                else:
                    result = await asyncio.wait_for(
                        handler(task),
                        timeout=task.timeout
                    )

                task.status = TaskStatus.COMPLETED
                task.result = result
                results.append(result)

            except Exception as e:
                task.status = TaskStatus.FAILED
                task.error = str(e)

                # Stop on first error in sequential execution
                raise

        return results

    async def execute_plan(self, plan: ExecutionPlan) -> Dict[str, Any]:
        """Execute orchestration plan"""
        plan.status = TaskStatus.RUNNING

        try:
            if plan.strategy == "parallel":
                results = await self.execute_parallel(plan.tasks)
            elif plan.strategy == "sequential":
                results = await self.execute_sequential(plan.tasks)
            elif plan.strategy == "conditional":
                results = await self.execute_conditional(plan.tasks)
            else:
                raise ValueError(f"Unknown strategy: {plan.strategy}")

            plan.status = TaskStatus.COMPLETED

            return {
                "plan_id": plan.id,
                "status": "completed",
                "results": results,
                "tasks": [task.dict() for task in plan.tasks]
            }

        except Exception as e:
            plan.status = TaskStatus.FAILED

            return {
                "plan_id": plan.id,
                "status": "failed",
                "error": str(e),
                "tasks": [task.dict() for task in plan.tasks]
            }

    async def _call_service(self, service_name: str, task: Task) -> Any:
        """Call remote microservice"""
        import httpx

        endpoint = self.services.get(service_name)
        if not endpoint:
            raise ValueError(f"Service not found: {service_name}")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{endpoint}/execute",
                json=task.dict(),
                timeout=task.timeout
            )
            response.raise_for_status()
            return response.json()

# FastAPI Integration
from fastapi import FastAPI, HTTPException

app = FastAPI(title="Nyra Orchestrator")
orchestrator = Orchestrator()

@app.post("/api/v1/orchestrate")
async def orchestrate_tasks(plan: ExecutionPlan):
    """Execute orchestration plan"""
    result = await orchestrator.execute_plan(plan)

    if result["status"] == "failed":
        raise HTTPException(status_code=500, detail=result["error"])

    return result

@app.post("/api/v1/tasks/execute")
async def execute_single_task(task: Task):
    """Execute a single task"""
    plan = ExecutionPlan(
        id=f"single_task_{task.id}",
        tasks=[task],
        strategy="sequential"
    )

    result = await orchestrator.execute_plan(plan)
    return result
```

## 📈 PERFORMANCE TARGETS

### Execution Performance
- Task distribution latency: < 50ms
- Single task execution overhead: < 10ms
- Parallel task coordination: < 100ms
- State persistence: < 50ms

### Throughput
- 100 concurrent task executions
- 1000 tasks per minute sustained
- Handle service failures gracefully

## 🧪 TESTING REQUIREMENTS

```python
@pytest.mark.asyncio
async def test_parallel_execution():
    """Test parallel task execution"""
    orchestrator = Orchestrator()

    # Register test handler
    async def test_handler(task: Task):
        await asyncio.sleep(0.1)
        return f"result_{task.id}"

    orchestrator.register_handler("test_handler", test_handler)

    # Create parallel tasks
    tasks = [
        Task(id=f"task_{i}", name=f"Task {i}", handler="test_handler")
        for i in range(10)
    ]

    # Execute in parallel
    start = time.time()
    results = await orchestrator.execute_parallel(tasks)
    duration = time.time() - start

    # Should complete in ~0.1s (parallel), not 1.0s (sequential)
    assert duration < 0.3
    assert len(results) == 10
    assert all(task.status == TaskStatus.COMPLETED for task in tasks)
```

---

**This service provides general orchestration capabilities for Project Nyra. For compliance-specific workflows, see nyra-orchestrator. This service focuses on task distribution, execution coordination, and result aggregation.**
