# LETTA_MEM0.md

## Role
Person-centric memory management for Project Nyra.

## Components
- **Letta**: The agent-state orchestrator.
- **mem0**: The underlying memory layer for storing facts about Leads, Borrowers, and Realtors.

## Technical Flow
1. **Fact Extraction**: When a communication event occurs, the `ClassificationService` and a lightweight LLM (on the 3060) extract key facts.
2. **Memory Write**: Facts are sent to the `IMemoryClient` (mem0 wrapper).
3. **Context Injection**: When an agent session (OpenClaw) starts, Letta injects relevant facts from mem0 into the agent's system prompt.

## Storage
- **Short-term**: Redis (Active sessions).
- **Long-term**: mem0 Cloud or Local FalkorDB/Postgres.

## Example Facts
- "Borrower prefers SMS over Email."
- "Lead is looking for a loan amount of $450k."
- "Realtor Partner Smith is currently on vacation until Monday."
