# Port Inventory - Project Nyra

This document provides a consolidated list of all service ports currently configured in the Project Nyra stack.

## 1. Core Gateways & Ingress

| Service           | Port   | Description                |
| :---------------- | :----- | :------------------------- |
| **Nexus Router**  | `6000` | Main MCP/API Gateway       |
| **LiteLLM Proxy** | `4000` | Unified AI Model Interface |

## 2. AI Orchestration & UI

| Service               | Port   | Description                 |
| :-------------------- | :----- | :-------------------------- |
| **Claude Flow Brain** | `8084` | Primary AI Orchestrator     |
| **Dashboard UI**      | `8085` | Claude Flow Management UI   |
| **Archon Server**     | `8181` | Advanced Task Orchestration |
| **Archon UI**         | `3737` | Task Monitoring Interface   |
| **Archon MCP**        | `8051` | Archon Protocol Server      |

## 3. Memory & Databases

| Service        | Port   | Description                            |
| :------------- | :----- | :------------------------------------- |
| **PostgreSQL** | `5432` | Primary System of Record               |
| **Redis**      | `6379` | Cache & Message Queue                  |
| **Qdrant**     | `6333` | Vector Database (Embeddings)           |
| **FalkorDB**   | `6380` | Graph Database (RedisGraph compatible) |
| **RuVector**   | `8082` | Distributed Vector Search              |
| **Letta**      | `8282` | OS-like Agent Memory                   |
| **Mem0**       | `8083` | User Personalization Memory            |

## 4. CRM & Business Stack

| Service             | Port            | Description               |
| :------------------ | :-------------- | :------------------------ |
| **Twenty CRM**      | `3000` / `3020` | Leads & System of Record  |
| **Twenty MCP**      | `8400`          | CRM Interaction Interface |
| **Quote API**       | `8089`          | Mortgage Quoting Service  |
| **Quote Engine**    | `9010`          | Pricing Logic Provider    |
| **Campaign Engine** | `9020`          | Multi-channel Drip Logic  |

## 5. Workflows & Automation

| Service          | Port   | Description             |
| :--------------- | :----- | :---------------------- |
| **n8n**          | `5678` | Primary Workflow Engine |
| **Activepieces** | `3002` | No-code Automation      |

## 6. MCP Servers (Specialized)

| Service          | Port   | Description             |
| :--------------- | :----- | :---------------------- |
| **Graphiti MCP** | `7459` | Knowledge Graph Tooling |
| **Composio MCP** | `8067` | Integration Hub         |
| **Qdrant MCP**   | `8066` | Vector Search Interface |

## 7. Monitoring & Dev Tools

| Service           | Port            | Description                |
| :---------------- | :-------------- | :------------------------- |
| **Grafana**       | `3005`          | Visualization Dashboards   |
| **Prometheus**    | `9090`          | Metrics Aggregator         |
| **Loki**          | `3100`          | Log Aggregator             |
| **Alertmanager**  | `9093`          | Alert Notification Router  |
| **Tempo**         | `4317`          | Distributed Tracing (OTLP) |
| **Gitea**         | `3001`          | Local Git Repository       |
| **Gitea (SSH)**   | `2222`          | SSH Access for Git         |
| **Node Exporter** | `9100`          | Host Machine Metrics       |
| **cAdvisor**      | `8080` / `8081` | Container Resource Usage   |

> [!NOTE]
> Ports marked with multiple values (e.g., `3000`/`3020`) may vary depending on whether you are using the Modular Stacks or the Consolidated Orchestrator Stack.
