# Swarm Domain - Coordination, Consensus, Topology, Agent Lifecycle

**Domain Type**: Core
**Bounded Context**: Swarm
**Aggregate Roots**: Swarm, Agent, Topology, ConsensusProtocol

## Overview

The Swarm Domain orchestrates multi-agent collaboration with mesh, hierarchical, and adaptive topologies. It implements dynamic scaling and intelligent task orchestration powered by Archon OS.

## Ubiquitous Language

| Term | Definition |
|------|------------|
| **Swarm** | Coordinated group of agents working together |
| **Agent** | Autonomous unit that executes tasks |
| **Topology** | Communication structure (mesh, hierarchical, hybrid) |
| **Orchestration** | Task coordination and execution strategy |
| **Queen** | Hierarchical coordinator in hierarchical topology |
| **Worker** | Task-executing agent in swarm |

## CLI Commands

```bash
# List workflows
archon workflow list

# Run a swarm workflow
archon workflow run swarm-task "description"

# Check swarm status
archon status
```

## References

- ADR-004: Swarm Coordination Architecture
- Archon OS Documentation
