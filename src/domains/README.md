# Archon OS - Domain-Driven Design Architecture

This directory contains the core bounded contexts for Project Nyra, implementing strategic and tactical DDD patterns.

## 5 Core Domains

### 1. Security Domain (Generic - Supporting)
**Bounded Context**: Authentication, Authorization, Encryption, Audit
- **Responsibility**: Protect system resources and track access

### 2. Memory Domain (Supporting)
**Bounded Context**: Storage, Retrieval, Indexing, Caching
- **Responsibility**: Persist and retrieve agent state efficiently using RuVector and Letta

### 3. Swarm Domain (Core)
**Bounded Context**: Coordination, Consensus, Topology, Agent Lifecycle
- **Responsibility**: Orchestrate multi-agent collaboration

### 4. Integration Domain (Generic)
**Bounded Context**: MCP Protocol, Provider Management, Tool Execution
- **Responsibility**: Connect external systems and AI providers via Nexus Router

### 5. Performance Domain (Supporting)
**Bounded Context**: Benchmarking, Optimization, Monitoring, Profiling
- **Responsibility**: Measure and improve system performance

## Ubiquitous Language

### Memory Domain
- **Store**: Persistent storage backend (PostgreSQL, RuVector)
- **Vector**: High-dimensional embedding representation
- **Index**: Fast lookup structure (HNSW)

### Integration Domain
- **Provider**: AI model supplier (Anthropic, OpenAI, etc.)
- **Tool**: Executable capability (MCP tool)
- **Transport**: Communication protocol (stdio, SSE, WebSocket)
- **Server**: MCP server exposing tools

## References

- ADR-001: Integration Architecture
- ADR-006: Unified Memory Service
- Archon OS Architecture Guidelines
