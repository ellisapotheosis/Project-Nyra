# Docker Infrastructure - Visual Structure Diagram

**Date**: 2026-04-08
**Version**: 2.0

---

## 📊 Canonical Structure Overview

```
Project-Nyra/
└── infra/
    ├── compose/                                📦 Deployment Configurations
    │   ├── docker-compose.archon.yml           # Core Archon OS stack
    │   ├── docker-compose.yml                  # Base infrastructure
    │   ├── docker-compose.twenty.yml           # Twenty CRM stack
    │   └── docker-compose.gitea.yml            # Gitea stack
    ├── docker/                                 🐳 Docker Hub Build Contexts
    │   ├── nexus-router/
    │   ├── n8n/
    │   └── gitea-act-runner/
    └── configs/                                ⚙️ Service Configurations
        ├── nexus/
        ├── litellm/
        └── postgres/
```

---

## 🏗️ Architectural Layers

### Layer 1: Base Infrastructure
```
┌─────────────────────────────────────────────┐
│         BASE INFRASTRUCTURE                  │
│  PostgreSQL │ Redis │ Qdrant               │
└─────────────────────────────────────────────┘
```

### Layer 2: Orchestration
```
┌─────────────────────────────────────────────────────────────┐
│              ORCHESTRATION LAYER                            │
│  Archon OS │ Nexus Router │ LiteLLM                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 Network Topology

```
┌────────────────────────────────────────────────────────────┐
│                    nyra (bridge)                            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Orchestration│  │ MCP Servers  │  │   Services   │    │
│  │              │  │              │  │              │    │
│  │ Archon OS    │  │ github-mcp   │  │ campaign     │    │
│  │ Nexus Router │  │ git-mcp      │  │ quote        │    │
│  │ LiteLLM      │  │ twenty-mcp   │  │ twilio       │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Databases   │  │ Caches       │  │ Monitoring   │    │
│  │              │  │              │  │              │    │
│  │ postgres     │  │ redis        │  │ prometheus   │    │
│  │ qdrant       │  │              │  │ grafana      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
```

---

**Last Updated**: 2026-04-08
