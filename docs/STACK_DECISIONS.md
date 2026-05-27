# STACK_DECISIONS.md

## Current Active Stack

| Category               | Selected Technology | Rationale                                                         |
| :--------------------- | :------------------ | :---------------------------------------------------------------- |
| **CRM**                | TwentyCRM           | Modern, open-source, highly customizable via custom objects.      |
| **Workflow**           | Activepieces        | Modern, code-first/no-code hybrid, optimized for self-hosting.    |
| **Secondary Workflow** | n8n                 | Fallback for complex internal legacy automation.                  |
| **LLM Gateway**        | Nexus Router        | Unified MCP bridge, tool aggregation, and API/MCP entrypoint.     |
| **Model Router**       | LiteLLM             | Industry standard for multi-provider fallback and load balancing. |
| **Memory**             | mem0                | Event-driven, person-centric memory layer.                        |
| **Graph Memory**       | FalkorDB            | High-performance graph DB for relationship mapping.               |
| **Communication**      | Twilio & SendGrid   | Reliable, API-first, strong compliance features.                  |
| **Secrets**            | Infisical           | Best-in-class open-source secret management for teams.            |
| **Inference**          | vLLM & Ollama       | Optimized for local GPU clusters.                                 |

## Deprecated / Do Not Use

The following components have been removed or superseded. **Do not reintroduce them.**

- **retired orchestration tooling**: Superseded by Activepieces/n8n.
- **retired swarm tooling / retired flow tooling**: Superseded by OpenClaw/Nerve.
- **retired flow tooling / n8n/Activepieces**: Superseded by Nexus Router.
- **the approved memory stack / the approved vector memory backend**: Superseded by mem0/FalkorDB.
- **Dify**: Not part of the core architectural vision for Nyra.

## Language & Tooling

- **Primary**: TypeScript (App Router, Node.js Services).
- **Package Manager**: pnpm (Workspaces).
- **Automation**: Makefile for host-level operations.
- **Validation**: Zod (Schema-first development).
