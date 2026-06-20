# DEPRECATED_STACK_DO_NOT_USE.md

## 🚨 STOP: Do Not Reintroduce These Components

The following technologies were part of earlier iterations of Project Nyra and have been officially removed. Reintroducing them creates architectural debt and fragments the system.

### 1. Claude-Flow / agentic-flow / flow-nexus

- **Status**: Deprecated.
- **Reason**: Fragmented workflow logic.
- **Replacement**: Activepieces (External) / n8n (Internal) / Nexus Router (Tooling).

### 2. ruv-swarm / ruflo

- **Status**: Deprecated.
- **Reason**: Unstable agent orchestration.
- **Replacement**: OpenClaw Gateway + NerveUI.

### 3. agentdb / ruvector

- **Status**: Deprecated.
- **Reason**: Suboptimal memory management.
- **Replacement**: mem0 + FalkorDB + Qdrant.

### 4. Dify

- **Status**: Deprecated.
- **Reason**: Out of scope for the custom broker-centric architecture.
- **Replacement**: OpenClaw Studio / Open WebUI.

## Migration Path

If you find code referencing these components:

1. **Quarantine it**: Move obsolete references to `docs/archive/` or an explicit cleanup report.
2. **Do not extend it**: Implement new features using the **Active Stack** (see `docs/STACK_DECISIONS.md`).
3. **Report it**: Add a dated cleanup note under `docs/cleanup/` before deleting runtime-facing code.
