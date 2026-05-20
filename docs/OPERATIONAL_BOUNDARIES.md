# Operational Boundaries: Core Logic vs. External Execution

Project Nyra uses external engines (n8n, Activepieces) for workflow execution, but maintains strict boundaries to ensure business logic and system-of-record integrity reside within the core platform.

## 🏛 Architectural Principles

1.  **Platform Owns the State**: External workflow tools must **not** become the source of truth for:
    - Campaign definitions
    - Lead compliance status (DNC, Consent)
    - Official Quote data
    - Borrower PII (except transiently during execution)

2.  **Stateless Execution**: Workflows should be designed as pure execution functions that:
    - Receive a trigger from a Nyra service (e.g., `campaign-engine`).
    - Perform a specific sequence of actions (e.g., Send SMS, Wait, Branch).
    - Callback to the Nyra API to update state or signal completion.

3.  **API-First Integration**: Communication between core services and execution engines MUST go through the typed API client layer (`apps/projectnyra/lib/api/`).

## 🛠 Responsibilities

### Core Nyra Platform (`apps/`, `services/`)

- **Campaign Management**: Scheduling, enrollments, and compliance checks.
- **CRM Integration**: Mirroring TwentyCRM state and managing lead lifecycles.
- **Quote Generation**: Deterministic calculation and broker approval gates.
- **Auth & Security**: Identity management and session protection.

### External Engines (n8n, Activepieces)

- **Channel Connectors**: Real-time integration with Twilio, SendGrid, etc.
- **Transient Wait Logic**: Handling delay steps within a single campaign sequence.
- **Visual Debugging**: Providing an operator interface for inspecting running workflow instances.

## 🚨 Anti-Patterns (Avoid)

- ❌ Storing borrower "Next Step" data only inside an n8n database.
- ❌ Implementing a complex DTI calculator inside an Activepieces JSON block.
- ❌ Allowing a workflow to directly write to the Postgres database without going through `crm-api` or `campaign-engine`.
