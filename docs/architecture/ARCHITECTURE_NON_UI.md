# ARCHITECTURE_NON_UI.md

## System Topology

Project Nyra follows a **Control Plane / Compute Plane** architecture.

### 1. Control Plane (The Brain)

- **Location**: Orchestrator (Local) + Oracle-VPS (Cloud)
- **Core Components**:
  - **TwentyCRM**: System of record for all entities.
  - **Nexus Router**: The singular API gateway and MCP tool aggregator.
  - **Activepieces / n8n**: Workflow automation engines.
  - **LiteLLM**: Model routing and load balancing.
  - **Memory Substrate**: mem0, FalkorDB, Redis, Postgres.

### 2. Compute Plane (The Muscle)

- **Location**: Local GPU Workers (RTX 5090, 3090 Ti, 3060)
- **Core Components**:
  - **vLLM / Ollama**: Serving local models for inference.
  - **OpenClaw / Nerve**: Agent orchestration and local workspace control.

### 3. Integration Layer

- **Communication**: Twilio (SMS/Voice), SendGrid (Email), Google Workspace (Email/Calendar).
- **Secrets**: Infisical for centralized secret management.
- **Networking**: Tailscale (Private Mesh) + Cloudflare Tunnel (Public Ingress).

## Data Flow

1. **Ingestion**: Raw lead -> `lead-ingestion` service -> Normalize -> TwentyCRM.
2. **Campaign**: CRM Trigger -> `campaign-service` -> Activepieces -> Communication Provider.
3. **Response**: Inbound Hook -> `communication-service` -> AI Classification -> Consent Update/Broker Alert.
4. **Quote**: Broker Request -> `quote-service` -> Deterministic Calc -> Quote Audit -> CRM/Broker UI.

## Component Ownership

- **TwentyCRM**: Leads, People, Companies, Opportunities, Tasks, Notes, Custom Mortgage Objects.
- **Quote Engine**: Interest rates, Closing costs, APR calculations, PDF generation.
- **Compliance Service**: STOP lists, Consent state, Quiet hours, Audit logs.
- **Nexus Router**: Tool definitions, Model selection logic, Cross-service auth.

## Orchestration Strategy
For detailed rules on agent coordination and task routing, see [ORCHESTRATION_STRATEGY.md](./ORCHESTRATION_STRATEGY.md).
