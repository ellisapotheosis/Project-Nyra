# Specification: Wiring & Hardening Phase

## 🌌 Overview

This track governs the transition from "Logic Scaffolds" to a production-ready ecosystem. It focuses on establishing live data flows between the isolated RateHunter landing page and the Project Nyra internal cockpit, while hardening the AI orchestration layer (Letta + llxprt) and enforcing enterprise security (OAuth + RBAC).

## 🗺️ Functional Requirements

### 1. Production Data Wiring (TwentyCRM)

- **Custom Objects**: Manually establish `MortgageLead` and `Quote` objects in Twenty UI.
- **Live Ingress**: Connect the `apps/ratehunter` wizard to the `capture.projectnyra.com` endpoint.
- **Kanban Sync**: Replace `KanbanBoard` mocks with real GraphQL subscriptions to the TwentyCRM ledger.

### 2. AI Infrastructure & Orchestration (Letta + llxprt)

- **Orchestration Core**: Deploy `Letta` as the primary stack orchestrator.
- **Worker Connectivity**: Wire `Letta` to the 3-PC GPU cluster running `openclaw` and `picoclaw`.
- **Subscription Bridge**: Integrate `@vybestack/llxprt-jefe` and `llxprt-code` to leverage $100/mo Codex, Gemini, and Claude-Code CLI subscriptions for agent reasoning.
- **Model Routing**: Hard-code mathematical rate assumptions in `quote-api` and verify `Hermes-3-405B` reachability via `Nexus Router`.

### 3. Cognitive Memory Layer (mem0 + FalkorDB)

- **Backend Sync**: Connect `mem0` to the `falkordb` (graph) and `Qdrant` (vector) backends.
- **Mempalace Wiring**: Connect the 3D visualization in `apps/projectnyra` to live graph particles.
- **Tooling**: Link or integrate `openmemory mcp` into the cockpit for direct memory auditing.

### 4. Security & Compliance

- **OAuth Lockdown**: Apply Cloudflare Access gating to all `*.projectnyra.com` operator subdomains.
- **Identity Sync**: Map Clerk roles to the `rbac.ts` logic in the internal application.
- **Compliance Sentinel**: Verify DNC/STOP keyword gating for automated communications.

## 🎨 Non-Functional Requirements

- **Mobile Certification**: Complete a navigation audit of all 20+ routes in the mobile "Command Sheet".
- **Visual Performance**: Fine-tune scroll-reveal timings for the "Neural Command" hero section.
- **System Telemetry**: Connect dashboard "Health Heartbeats" to real orchestrator status endpoints.

## ✅ Acceptance Criteria

- Lead submitted on `ratehunter.net` appears in TwentyCRM within 5 seconds.
- Letta successfully executes a cross-node agent task using `llxprt-code`.
- 3D MerKaBa pulse reflects real-time cognitive activity.
- Internal subdomains reject non-authorized sessions at the Cloudflare edge.
- The monorepo passes `turbo run build` with live provider environment variables.

## 🚫 Out of Scope

- Integration of third-party mortgage lender APIs (Benchmarking only).
- Public-facing borrower dashboard (Internal Broker/Operator focus only).
