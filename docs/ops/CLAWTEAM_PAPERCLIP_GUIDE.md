# CLAWTEAM_PAPERCLIP_GUIDE.md

## Overview
Project Nyra utilizes a tiered management system to ensure agent coordination and safety.

## 1. ClawTeam (Multi-Agent Coordination)
ClawTeam is the protocol for handling tasks that require multiple specialized agents or physical hardware nodes.

### Coordination Flow
1. **Task Arrival**: Nexus Router receives a complex intent.
2. **Decomposition**: ClawTeam breaks the intent into a "Task Graph".
3. **Assignment**:
    - **Coding/Logic** -> 5090 (Llama-3-70B) or LLXPRT Bridge.
    - **Retrieval/CRM** -> 3090 Ti.
    - **Classification** -> 3060 (Ollama).
4. **Synthesis**: Results are aggregated and returned as a single response.

## 2. Paperclip (Governance & Alignment)
Paperclip is the "Safety Layer" that audits agent reasoning and outputs before they reach the broker or borrower.

### Core Guardrails
- **Interest Rate Locking**: Agents cannot mention specific rates without a Quote ID.
- **Compliance Sentinel**: Real-time checking of the CRM `doNotContact` status.
- **Escalation Threshold**: High-risk intents (e.g., legal threats, complex scenario overrides) are flagged for human review.

## 3. Integration with Letta
Letta provides the "Working Memory" that ClawTeam and Paperclip use to maintain state across disparate worker tasks.
