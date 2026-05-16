# WORKFLOW_CONTROL.md

## Overview
Project Nyra utilizes **ClawTeam** and **Paperclip** for top-level agent management. These systems ensure that the distributed cluster acts as a single, goal-aligned unit.

## 1. ClawTeam (The Taskmaster)
- **Role**: Multi-agent coordination and task decomposition.
- **Function**: When a complex request arrives (e.g., "Run a full pre-approval scenario for John Doe"), ClawTeam breaks it into sub-tasks:
    - **Agent A (3060)**: Summarize lead history from CRM.
    - **Agent B (5090)**: Calculate pricing scenarios based on current rates.
    - **Agent C (Orchestrator)**: Draft the approval-ready message.

## 2. Paperclip (The Governor)
- **Role**: Policy enforcement and goal alignment.
- **Function**: Paperclip audits the reasoning trace of every agent before it is finalized. It ensures:
    - **Compliance**: No rate quotes without a deterministic CRM reference.
    - **Tonality**: Professional, broker-aligned language.
    - **Ethics**: Absolute adherence to STOP/DNC flags.

## Integration
Both systems are accessed via the `IWorkflowControl` interface in `packages/integration-adapters`. All control actions are logged as `AuditEvent` records for maximum transparency.
